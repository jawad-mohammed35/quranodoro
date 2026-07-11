"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/stores/timer-store";

/**
 * Global ticker: drives the timer store once per second while running.
 * The store computes remaining time from a wall-clock deadline, so the
 * timer stays accurate even if the tab is throttled in the background.
 * Mounted once in the root layout.
 */
export function TimerTicker() {
  const status = useTimerStore((s) => s.status);

  useEffect(() => {
    if (status !== "running") return;
    const tick = () => useTimerStore.getState().tick();
    tick();
    const interval = setInterval(tick, 500);
    const onVisible = () => tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status]);

  return null;
}
