"use client";
import {
  duringHydration,
  getStorageOwner,
  setStorageOwner,
} from "@/lib/account-storage";
import { useSettingsStore } from "@/stores/settings-store";
import { useSessionsStore } from "@/stores/sessions-store";
import { useFarmStore } from "@/stores/farm-store";
import { useTasbihStore } from "@/stores/tasbih-store";
import { useTimerStore } from "@/stores/timer-store";
import { usePlayerStore } from "@/stores/player-store";

export async function switchAccount(userId: string | null) {
  if (getStorageOwner() === (userId || "guest")) return;
  useTimerStore.getState().stop();
  usePlayerStore.getState().requestStop();
  // Read each destination before resetting (setState writes through persist).
  setStorageOwner(userId);
  function restore<T extends object>(
    store: {
      getInitialState: () => T;
      setState: (state: Partial<T>) => unknown;
    },
    name: string,
  ) {
    const raw =
      localStorage.getItem(`${name}:${userId || "guest"}`) ??
      (!userId ? localStorage.getItem(name) : null);
    let cached: Partial<T> = {};
    try {
      const parsed = raw ? JSON.parse(raw)?.state : null;
      cached = parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      /* Keep corrupt source as a backup. */
    }
    const initial = store.getInitialState();
    const restored = { ...initial };
    Object.keys(initial).forEach((key) => {
      if (typeof initial[key as keyof T] !== "function" && key in cached)
        Object.assign(restored, { [key]: cached[key as keyof T] });
    });
    duringHydration(() => store.setState(restored));
  }
  restore(useSettingsStore, "quranodoro-settings");
  duringHydration(() =>
    useSettingsStore.getState().hydrateFromCloud(useSettingsStore.getState()),
  );
  restore(useSessionsStore, "quranodoro-sessions");
  restore(useFarmStore, "quranodoro-farm");
  restore(useTasbihStore, "quranodoro-tasbih");
  restore(useTimerStore, "quranodoro-timer");
}
