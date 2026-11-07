"use client";

import { useEffect, useState } from "react";
import { useTimerStore } from "@/stores/timer-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useSessionsStore } from "@/stores/sessions-store";
import { useFarmStore } from "@/stores/farm-store";
import { getStorageOwner } from "@/lib/account-storage";

/**
 * Global ticker: drives the timer store once per second while running.
 * The store computes remaining time from a wall-clock deadline, so the
 * timer stays accurate even if the tab is throttled in the background.
 * Mounted once in the root layout.
 */
export function TimerTicker() {
  const status = useTimerStore((s) => s.status);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === `quranodoro-timer:${getStorageOwner()}`)
        void useTimerStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const update = async () => {
      const owner = getStorageOwner();
      // Serialize across tabs so a restored focus deadline earns rewards once.
      await useTimerStore.persist.rehydrate();
      if (owner !== getStorageOwner()) return;
      if (useTimerStore.getState().status !== "running") return;
      const before = useTimerStore.getState();
      if (before.endAt && before.endAt <= Date.now()) {
        await useSessionsStore.persist.rehydrate();
        await useFarmStore.persist.rehydrate();
      }
      useTimerStore.getState().tick();
      if (before.phase !== useTimerStore.getState().phase) {
        const message =
          before.phase === "focus"
            ? "Focus complete. Your session is saved. Take a well-earned break."
            : "Break complete. Ready for another focus session?";
        setNotice(message);
        if (
          useSettingsStore.getState().sessionNotifications &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification("Quranodoro", {
              body: message,
              icon: "/icon.png",
              tag: "quranodoro-session",
            });
          } catch {
            /* Mobile browsers may require a service worker; the in-app notice remains available. */
          }
        }
      }
    };
    const tick = () => {
      if (navigator.locks)
        void navigator.locks.request(
          "quranodoro-timer",
          { ifAvailable: true },
          (lock) => (lock ? update() : undefined),
        );
      else void update();
    };
    tick();
    const interval = setInterval(tick, 500);
    const onVisible = () => tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status]);

  return notice ? (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-sm shadow-card sm:left-auto sm:max-w-sm"
    >
      {notice}
      <button
        aria-label="Dismiss session notice"
        className="ml-auto p-2"
        onClick={() => setNotice("")}
      >
        ×
      </button>
    </div>
  ) : null;
}
