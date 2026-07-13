"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";

export interface TasbihCompletion {
  id: string;
  /** ISO date-time when the session was completed. */
  completedAt: string;
  target: number;
}

interface TasbihState {
  count: number;
  target: number;
  /** Shown briefly after reaching the target. */
  justCompleted: boolean;
  completedSessions: TasbihCompletion[];

  increment: () => void;
  reset: () => void;
  setTarget: (target: number) => void;
  startNewSession: () => void;
  dismissCompletion: () => void;
  hydrateFromCloud: (data: Partial<TasbihSnapshot>) => void;
}

export type TasbihSnapshot = Pick<TasbihState, "completedSessions">;

export const DEFAULT_TASBIH_TARGET = 33;

export const useTasbihStore = create<TasbihState>()(
  persist(
    (set, get) => ({
      count: 0,
      target: DEFAULT_TASBIH_TARGET,
      justCompleted: false,
      completedSessions: [],

      increment: () => {
        const { count, target } = get();
        const next = count + 1;
        if (next >= target) {
          const completion: TasbihCompletion = {
            id: uid(),
            completedAt: new Date().toISOString(),
            target,
          };
          set({
            count: 0,
            justCompleted: true,
            completedSessions: [...get().completedSessions, completion],
          });
        } else {
          set({ count: next });
        }
      },

      reset: () => set({ count: 0, justCompleted: false }),

      setTarget: (target) => {
        const safe = Math.max(1, Math.min(9999, Math.floor(target)));
        set({ target: safe, count: 0, justCompleted: false });
      },

      startNewSession: () => set({ count: 0, justCompleted: false }),

      dismissCompletion: () => set({ justCompleted: false }),

      hydrateFromCloud: (data) => set(data),
    }),
    { name: "quranodoro-tasbih" },
  ),
);

/** yyyy-MM-dd in local timezone */
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function tasbihCompletedToday(sessions: TasbihCompletion[]): number {
  const today = localDateKey(new Date());
  return sessions.filter((s) => localDateKey(new Date(s.completedAt)) === today).length;
}

export function tasbihCompletedLastNDays(
  sessions: TasbihCompletion[],
  days: number,
): number {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return sessions.filter((s) => new Date(s.completedAt) >= cutoff).length;
}

export function totalTasbihSessions(sessions: TasbihCompletion[]): number {
  return sessions.length;
}
