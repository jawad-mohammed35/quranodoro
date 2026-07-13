"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
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
 * 1. `pullFromCloud` loads their cloud snapshot. If the cloud has data it
 *    wins; if the cloud is empty (fresh account) the local state is pushed up
 *    so nothing is lost on first sign-up.
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

export async function pullFromCloud(supabase: SupabaseClient, userId: string) {
  const [{ data: state }, { data: sessionRows }] = await Promise.all([
    supabase.from("user_state").select("settings, farm").eq("user_id", userId).maybeSingle(),
    supabase.from("sessions").select("id, completed_at, phase, duration_minutes, preset_id, growth_points").eq("user_id", userId).order("completed_at"),
  ]);

  const cloudHasState =
    state && (Object.keys(state.settings ?? {}).length > 0 || Object.keys(state.farm ?? {}).length > 0);

  if (cloudHasState) {
    if (Object.keys(state.settings ?? {}).length > 0) {
      const cloudSettings = state.settings as Partial<SettingsSnapshot> & {
        arabicFontId?: string;
      };
      const { arabicFontId: _legacy, tasbihCompletedSessions, ...settings } = cloudSettings;
      useSettingsStore.getState().hydrateFromCloud(settings);
      if (tasbihCompletedSessions) {
        useTasbihStore.getState().hydrateFromCloud({ completedSessions: tasbihCompletedSessions });
      }
    }
    const farm = state.farm as Partial<FarmSnapshot>;
    if (farm?.trees) {
      useFarmStore.getState().hydrateFromCloud({
        trees: farm.trees,
        activeTreeId: farm.activeTreeId ?? null,
      });
    }
  }

  if (sessionRows && sessionRows.length > 0) {
    useSessionsStore
      .getState()
      .hydrateFromCloud((sessionRows as SessionRow[]).map(fromSessionRow));
  }

  // Fresh account: seed the cloud with whatever the user built locally.
  if (!cloudHasState) {
    await pushStateToCloud(supabase, userId);
    const localSessions = useSessionsStore.getState().sessions;
    if (localSessions.length > 0) {
      await supabase
        .from("sessions")
        .upsert(localSessions.map((s) => toSessionRow(s, userId)), { onConflict: "id" });
    }
  }
}

async function pushStateToCloud(supabase: SupabaseClient, userId: string) {
  const settings = settingsSnapshot();
  await supabase.from("user_state").upsert(
    {
      user_id: userId,
      settings,
      farm: farmSnapshot(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

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
export function startSync(supabase: SupabaseClient, userId: string): () => void {
  let stateTimeout: ReturnType<typeof setTimeout> | null = null;

  const queueStatePush = () => {
    if (stateTimeout) clearTimeout(stateTimeout);
    stateTimeout = setTimeout(() => void pushStateToCloud(supabase, userId), 2000);
  };

  const unsubSettings = useSettingsStore.subscribe(queueStatePush);
  const unsubFarm = useFarmStore.subscribe(queueStatePush);
  const unsubTasbih = useTasbihStore.subscribe(queueStatePush);

  // Sessions are append-only: push new rows as they appear.
  let knownCount = useSessionsStore.getState().sessions.length;
  const unsubSessions = useSessionsStore.subscribe((state) => {
    const sessions = state.sessions;
    if (sessions.length > knownCount) {
      const newOnes = sessions.slice(knownCount);
      void supabase
        .from("sessions")
        .upsert(newOnes.map((s) => toSessionRow(s, userId)), { onConflict: "id" });
    }
    knownCount = sessions.length;
  });

  return () => {
    if (stateTimeout) clearTimeout(stateTimeout);
    unsubSettings();
    unsubFarm();
    unsubTasbih();
    unsubSessions();
  };
}
