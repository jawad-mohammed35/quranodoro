import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { defaultDashboard, normalizeDashboard } from "../src/lib/dashboard";
import { safeAuthPath } from "../src/lib/auth-redirect";
import {
  growthPointsForMinutes,
  stageForGp,
  FINAL_STAGE_INDEX,
  totalGpToMature,
} from "../src/data/trees";
import { RECITERS, getSurahAudioUrl } from "../src/data/reciters";
import { useTimerStore } from "../src/stores/timer-store";
import {
  useSettingsStore,
  type SettingsSnapshot,
} from "../src/stores/settings-store";
import { useSessionsStore, lastNMonths } from "../src/stores/sessions-store";
import { useFarmStore } from "../src/stores/farm-store";
import { useTasbihStore } from "../src/stores/tasbih-store";
import { switchAccount } from "../src/lib/supabase/account-state";
import { setStorageOwner } from "../src/lib/account-storage";
import { pullFromCloud } from "../src/lib/supabase/sync";
import type { SupabaseClient } from "@supabase/supabase-js";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
  configurable: true,
});
beforeEach(() => {
  storage.clear();
  setStorageOwner(null);
  useSettingsStore.setState(useSettingsStore.getInitialState());
  useSessionsStore.setState({ sessions: [] });
  useFarmStore.setState({ trees: [], activeTreeId: null });
  useTasbihStore.setState(useTasbihStore.getInitialState());
  useTimerStore.setState(useTimerStore.getInitialState());
});

test("dashboard defaults are complete, independent, and validate malformed sizes", () => {
  const a = defaultDashboard(),
    b = defaultDashboard();
  a.desktop[0].w = 12;
  assert.equal(b.desktop[0].w, 4);
  const fixed = normalizeDashboard({
    desktop: [{ i: "focus", x: 100, y: -10, w: 50, h: 1 }],
    hidden: ["tree"],
  });
  assert.equal(fixed.desktop[0].x, 4);
  assert.equal(fixed.desktop[0].w, 8);
  assert.equal(fixed.desktop[0].h, 6);
  assert.equal(fixed.mobile.length, 9);
  assert.deepEqual(fixed.hidden, ["tree"]);
});
test("auth callback rejects external, protocol-relative, and backslash paths", () => {
  for (const path of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/x\r\ny",
  ])
    assert.equal(safeAuthPath(path), "/");
  assert.equal(safeAuthPath("/update-password"), "/update-password");
});
test("all twelve reciters generate the complete, zero-padded Surah range", () => {
  assert.equal(RECITERS.length, 12);
  assert.equal(new Set(RECITERS.map((r) => r.id)).size, 12);
  for (const r of RECITERS) {
    assert.match(getSurahAudioUrl(r, 1), /\/001\.mp3$/);
    assert.match(getSurahAudioUrl(r, 114), /\/114\.mp3$/);
  }
  assert.throws(() => getSurahAudioUrl(RECITERS[0], 0), RangeError);
});
test("focus completion awards one session and GP; repeated ticks cannot duplicate", () => {
  useFarmStore.getState().plantTree("barhi");
  useTimerStore.getState().start();
  useTimerStore.setState({ endAt: Date.now() - 60000 });
  useTimerStore.getState().tick();
  assert.equal(useSessionsStore.getState().sessions.length, 1);
  assert.equal(useFarmStore.getState().trees[0].gp, 10);
  assert.equal(useTimerStore.getState().phase, "shortBreak");
  assert.equal(useTimerStore.getState().status, "finished");
  useTimerStore.getState().tick();
  assert.equal(useSessionsStore.getState().sessions.length, 1);
});
test("pause/resume retains time; completion queues long break after configured cycle", () => {
  useTimerStore.getState().start();
  useTimerStore.setState({ endAt: Date.now() + 90000, focusCountInCycle: 3 });
  useTimerStore.getState().pause();
  assert.ok(Math.abs(useTimerStore.getState().secondsLeft - 90) <= 1);
  useTimerStore.getState().resume();
  assert.equal(useTimerStore.getState().status, "running");
  useTimerStore.setState({ endAt: Date.now() - 1 });
  useTimerStore.getState().tick();
  assert.equal(useTimerStore.getState().phase, "longBreak");
  assert.equal(useTimerStore.getState().focusCountInCycle, 0);
});
test("auto-start starts the next phase now without farming unattended missed cycles", () => {
  useSettingsStore.getState().setSetting("autoStartNextSession", true);
  useTimerStore.getState().start();
  useTimerStore.setState({ endAt: Date.now() - 86400000 });
  useTimerStore.getState().tick();
  assert.equal(useTimerStore.getState().status, "running");
  assert.equal(useSessionsStore.getState().sessions.length, 1);
  assert.ok(useTimerStore.getState().endAt! > Date.now());
});
test("tree maturity ends active growth and retains the permanent orchard tree", () => {
  useFarmStore.getState().plantTree("barhi");
  useFarmStore.getState().awardGrowthPoints(totalGpToMature(0.8));
  assert.equal(useFarmStore.getState().activeTreeId, null);
  assert.ok(useFarmStore.getState().trees[0].maturedAt);
  assert.equal(stageForGp(10000, 1), FINAL_STAGE_INDEX);
  assert.equal(growthPointsForMinutes(90), 35);
});
test("tasbih records phrase and target, reset preserves history, NaN is ignored", () => {
  const s = useTasbihStore.getState();
  s.setTarget(1);
  s.setPhrase("Alhamdulillah");
  s.increment();
  assert.equal(
    useTasbihStore.getState().completedSessions[0].phrase,
    "Alhamdulillah",
  );
  s.reset();
  assert.equal(useTasbihStore.getState().completedSessions.length, 1);
  s.setTarget(NaN);
  assert.equal(useTasbihStore.getState().target, 1);
});
test("tasbih preserves progress above smaller targets and records only a new target crossing", () => {
  const s = useTasbihStore.getState();
  s.hydrateFromCloud({ count: 5, target: 33 });
  for (const target of [99, 2, 100, 6]) {
    s.setTarget(target);
    assert.equal(useTasbihStore.getState().count, 5);
  }
  s.increment();
  s.increment();
  assert.equal(useTasbihStore.getState().count, 7);
  assert.equal(useTasbihStore.getState().completedSessions.length, 1);
});
test("account changes isolate and restore settings, sessions, farm and dhikr", async () => {
  useSettingsStore.getState().setSetting("displayName", "Guest");
  useTasbihStore.getState().increment();
  await switchAccount("account-a");
  assert.equal(useSettingsStore.getState().displayName, "");
  assert.equal(useTasbihStore.getState().count, 0);
  useSettingsStore.getState().setSetting("displayName", "A");
  useFarmStore.getState().plantTree("ajwa");
  await switchAccount("account-b");
  assert.equal(useFarmStore.getState().trees.length, 0);
  await switchAccount("account-a");
  assert.equal(useSettingsStore.getState().displayName, "A");
  assert.equal(useFarmStore.getState().trees.length, 1);
  await switchAccount(null);
  assert.equal(useSettingsStore.getState().displayName, "Guest");
  assert.equal(useTasbihStore.getState().count, 1);
});
test("cloud read failures do not seed or overwrite data", async () => {
  let writes = 0;
  const query = {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    order() {
      return this;
    },
    maybeSingle: async () => ({ data: null, error: new Error("offline") }),
    range: async () => ({ data: null, error: new Error("offline") }),
    upsert() {
      writes++;
    },
  };
  const client = { from: () => query } as unknown as SupabaseClient;
  await assert.rejects(pullFromCloud(client, "account-a"));
  assert.equal(writes, 0);
});
test("monthly analytics uses unique calendar months even on the 31st", (t) => {
  t.mock.timers.enable({
    apis: ["Date"],
    now: Date.parse("2026-10-31T12:00:00Z"),
  });
  const result = lastNMonths([], 12);
  assert.equal(new Set(result.map((m) => m.month)).size, 12);
});

test("preference hydration rejects invalid audio ranges and action replacements", () => {
  useSettingsStore.getState().hydrateFromCloud({
    volume: 4,
    surahNumber: 999,
    setSetting: "invalid",
    dashboard: { desktop: null },
  } as unknown as Partial<SettingsSnapshot>);
  assert.equal(useSettingsStore.getState().volume, 1);
  assert.equal(useSettingsStore.getState().surahNumber, 114);
  assert.equal(typeof useSettingsStore.getState().setSetting, "function");
  assert.equal(useSettingsStore.getState().dashboard.desktop.length, 9);
});

test("unsynced account preferences survive a stale cloud snapshot", async () => {
  await switchAccount("account-a");
  useSettingsStore.getState().setSetting("displayName", "Offline edit");
  const writes: { settings?: { displayName?: string } }[] = [];
  const query = {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    order() {
      return this;
    },
    update() {
      return this;
    },
    neq: async () => ({ error: null }),
    maybeSingle: async () => ({
      data: { settings: { displayName: "Cloud old" }, farm: {} },
      error: null,
    }),
    range: async () => ({ data: [], error: null }),
    upsert: async (value: { settings?: { displayName?: string } }) => {
      writes.push(value);
      return { error: null };
    },
  };
  await pullFromCloud(
    { from: () => query } as unknown as SupabaseClient,
    "account-a",
  );
  assert.equal(useSettingsStore.getState().displayName, "Offline edit");
  assert.equal(writes[0].settings?.displayName, "Offline edit");
});

test("a superseded account pull cannot apply its response", async () => {
  const query = {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    order() {
      return this;
    },
    maybeSingle: async () => ({
      data: { settings: { displayName: "Other account" }, farm: {} },
      error: null,
    }),
    range: async () => ({ data: [], error: null }),
  };
  await pullFromCloud(
    { from: () => query } as unknown as SupabaseClient,
    "account-a",
    () => false,
  );
  assert.equal(useSettingsStore.getState().displayName, "");
});
