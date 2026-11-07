"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  duringHydration,
  markAccountSynced,
  unsyncedRevision,
} from "@/lib/account-storage";
import type { CompletedSession, FarmTree } from "@/lib/types";
import {
  useSettingsStore,
  type SettingsSnapshot,
} from "@/stores/settings-store";
import { useSessionsStore } from "@/stores/sessions-store";
import { useFarmStore } from "@/stores/farm-store";
import { useTasbihStore } from "@/stores/tasbih-store";

/**
 * Cloud sync strategy
 * -------------------
 * Local-first: all stores persist to localStorage, so the app works fully
 * offline and signed out. When a user signs in:
 *
 * 1. `pullFromCloud` reads the selected account's snapshot. Clean caches accept
 *    cloud state; pending account edits are retained and uploaded. Guest state
 *    is isolated. Session history merges by ID and is read in pages.
 * 2. `startSync` subscribes to the stores and debounces upserts to Supabase.
 */

interface FarmSnapshot {
  trees: FarmTree[];
  activeTreeId: string | null;
}

function settingsSnapshot(): SettingsSnapshot {
  const s = useSettingsStore.getState();
  return {
    autoStartNextSession: s.autoStartNextSession,
    playQuranDuringFocus: s.playQuranDuringFocus,
    reciterId: s.reciterId,
    surahNumber: s.surahNumber,
    volume: s.volume,
    favoriteReciterId: s.favoriteReciterId,
    favoriteSurahs: s.favoriteSurahs,
    displayName: s.displayName,
    uiLanguage: s.uiLanguage,
    selectedPresetId: s.selectedPresetId,
    customPresets: s.customPresets,
    dashboard: s.dashboard,
    sessionNotifications: s.sessionNotifications,
    tasbih: (() => {
      const { count, target, phrase, feedback, completedSessions } =
        useTasbihStore.getState();
      return { count, target, phrase, feedback, completedSessions };
    })(),
    tasbihCompletedSessions: useTasbihStore.getState().completedSessions,
  };
}

function farmSnapshot(): FarmSnapshot {
  const { trees, activeTreeId } = useFarmStore.getState();
  return { trees, activeTreeId };
}

interface SessionRow {
  id: string;
  completed_at: string;
  phase: CompletedSession["phase"];
  duration_minutes: number;
  preset_id: string;
  growth_points: number;
}

function toSessionRow(s: CompletedSession, userId: string) {
  return {
    id: s.id,
    user_id: userId,
    completed_at: s.completedAt,
    phase: s.phase,
    duration_minutes: s.durationMinutes,
    preset_id: s.presetId,
    growth_points: s.growthPoints,
  };
}

function fromSessionRow(row: SessionRow): CompletedSession {
  return {
    id: row.id,
    completedAt: row.completed_at,
    phase: row.phase,
    durationMinutes: row.duration_minutes,
    presetId: row.preset_id,
    growthPoints: row.growth_points,
  };
}

async function readSessions(supabase: SupabaseClient, userId: string) {
  const rows: SessionRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        "id, completed_at, phase, duration_minutes, preset_id, growth_points",
      )
      .eq("user_id", userId)
      .order("completed_at")
      .order("id")
      .range(offset, offset + 999);
    if (error) return { data: null, error };
    rows.push(...(data as SessionRow[]));
    if (data.length < 1000) return { data: rows, error: null };
  }
}

async function writeSessions(
  supabase: SupabaseClient,
  userId: string,
  sessions: CompletedSession[],
) {
  for (let offset = 0; offset < sessions.length; offset += 500) {
    const { error } = await supabase.from("sessions").upsert(
      sessions.slice(offset, offset + 500).map((s) => toSessionRow(s, userId)),
      { onConflict: "id" },
    );
    if (error) throw error;
  }
}

export async function pullFromCloud(
  supabase: SupabaseClient,
  userId: string,
  isCurrent = () => true,
) {
  const [
    { data: state, error: stateError },
    { data: sessionRows, error: sessionError },
  ] = await Promise.all([
    supabase
      .from("user_state")
      .select("settings, farm")
      .eq("user_id", userId)
      .maybeSingle(),
    readSessions(supabase, userId),
  ]);
  if (!isCurrent()) return;
  if (stateError || sessionError) throw stateError || sessionError;

  const cloudHasState =
    state &&
    (Object.keys(state.settings ?? {}).length > 0 ||
      Object.keys(state.farm ?? {}).length > 0);

  // Preserve offline edits and debounced changes left behind by a sign-out.
  // Snapshot conflicts use last successful writer; append-only sessions merge.
  const localHasChanges = Boolean(unsyncedRevision(userId));
  if (cloudHasState && localHasChanges) {
    // Keep independently-created trees and completed dhikr from both devices.
    const cloudFarm = state.farm as Partial<FarmSnapshot>;
    const farm = useFarmStore.getState();
    const trees = new Map(
      (cloudFarm.trees || []).map((tree) => [tree.id, tree]),
    );
    farm.trees.forEach((tree) => {
      const remote = trees.get(tree.id);
      trees.set(tree.id, remote && remote.gp > tree.gp ? remote : tree);
    });
    const cloudSettings = state.settings as Partial<SettingsSnapshot>;
    const dhikr = useTasbihStore.getState();
    const completed = new Map(
      (
        cloudSettings.tasbih?.completedSessions ||
        cloudSettings.tasbihCompletedSessions ||
        []
      ).map((s) => [s.id, s]),
    );
    dhikr.completedSessions.forEach((s) => completed.set(s.id, s));
    duringHydration(() => {
      farm.hydrateFromCloud({
        trees: [...trees.values()],
        activeTreeId: farm.activeTreeId,
      });
      dhikr.hydrateFromCloud({
        completedSessions: [...completed.values()].sort((a, b) =>
          a.completedAt.localeCompare(b.completedAt),
        ),
      });
    });
  }
  if (cloudHasState && !localHasChanges) {
    duringHydration(() => {
      if (Object.keys(state.settings ?? {}).length > 0) {
        const cloudSettings = state.settings as Partial<SettingsSnapshot> & {
          arabicFontId?: string;
        };
        const {
          arabicFontId: _legacy,
          tasbihCompletedSessions,
          tasbih,
          ...settings
        } = cloudSettings;
        void _legacy;
        useSettingsStore.getState().hydrateFromCloud(settings);
        if (tasbihCompletedSessions) {
          useTasbihStore
            .getState()
            .hydrateFromCloud({ completedSessions: tasbihCompletedSessions });
        }
        if (tasbih) useTasbihStore.getState().hydrateFromCloud(tasbih);
      }
      const farm = state.farm as Partial<FarmSnapshot>;
      if (farm?.trees) {
        useFarmStore.getState().hydrateFromCloud({
          trees: farm.trees,
          activeTreeId: farm.activeTreeId ?? null,
        });
      }
    });
  }

  if (sessionRows) {
    const local = useSessionsStore.getState().sessions;
    const merged = new Map(local.map((s) => [s.id, s]));
    (sessionRows as SessionRow[])
      .map(fromSessionRow)
      .forEach((s) => merged.set(s.id, s));
    duringHydration(() =>
      useSessionsStore
        .getState()
        .hydrateFromCloud(
          [...merged.values()].sort((a, b) =>
            a.completedAt.localeCompare(b.completedAt),
          ),
        ),
    );
  }

  // Fresh account: seed the cloud with whatever the user built locally.
  if (!cloudHasState || localHasChanges) {
    await pushStateToCloud(supabase, userId);
  }
  if (isCurrent()) {
    const localSessions = useSessionsStore.getState().sessions;
    const cloudIds = new Set(sessionRows?.map((s) => s.id));
    await writeSessions(
      supabase,
      userId,
      localSessions.filter((s) => !cloudIds.has(s.id)),
    );
  }
}

async function pushStateToCloud(supabase: SupabaseClient, userId: string) {
  const revision = unsyncedRevision(userId);
  const settings = settingsSnapshot();
  const { error } = await supabase.from("user_state").upsert(
    {
      user_id: userId,
      settings,
      farm: farmSnapshot(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  markAccountSynced(userId, revision);

  // Keep the account profile's display name in step with local settings
  // (e.g. when edited on the Settings page). Never blank it out.
  const displayName = settings.displayName.trim();
  if (displayName) {
    await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", userId)
      .neq("display_name", displayName);
  }
}

/** Subscribe to local stores and mirror changes to Supabase. Returns a cleanup fn. */
export function startSync(
  supabase: SupabaseClient,
  userId: string,
  onError: (message: string | null) => void = () => {},
): () => void {
  let stateTimeout: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  let pending = false;
  let inFlight = false;
  const knownIds = new Set(
    useSessionsStore.getState().sessions.map((s) => s.id),
  );
  // Serial writes prevent an older slow request from overwriting a newer snapshot.
  const flush = async () => {
    if (stopped || inFlight || !pending) return;
    inFlight = true;
    pending = false;
    try {
      await pushStateToCloud(supabase, userId);
      const sessions = useSessionsStore
        .getState()
        .sessions.filter((s) => !knownIds.has(s.id));
      if (!stopped && sessions.length) {
        await writeSessions(supabase, userId, sessions);
        sessions.forEach((s) => knownIds.add(s.id));
      }
      if (!stopped) onError(null);
    } catch {
      pending = true;
      if (!stopped)
        onError(
          "Cloud sync failed. Progress is saved on this device; reconnect or make a change to retry.",
        );
    } finally {
      inFlight = false;
    }
  };

  const queueStatePush = () => {
    if (stateTimeout) clearTimeout(stateTimeout);
    pending = true;
    stateTimeout = setTimeout(() => void flush(), 2000);
  };

  const unsubSettings = useSettingsStore.subscribe(queueStatePush);
  const unsubFarm = useFarmStore.subscribe(queueStatePush);
  const unsubTasbih = useTasbihStore.subscribe(queueStatePush);

  // Sessions are append-only: push new rows as they appear.
  const unsubSessions = useSessionsStore.subscribe(queueStatePush);
  const retry = () => {
    pending = true;
    void flush();
  };
  window.addEventListener("online", retry);
  const retryInterval = setInterval(() => {
    if (pending) void flush();
  }, 15000);

  return () => {
    stopped = true;
    clearInterval(retryInterval);
    window.removeEventListener("online", retry);
    if (stateTimeout) clearTimeout(stateTimeout);
    unsubSettings();
    unsubFarm();
    unsubTasbih();
    unsubSessions();
  };
}
