"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { accountStorage } from "@/lib/account-storage";
import type { CompletedSession, DailyStat } from "@/lib/types";
import { dateKey, uid } from "@/lib/utils";

interface SessionsState {
  sessions: CompletedSession[];
  addSession: (session: Omit<CompletedSession, "id">) => CompletedSession;
  hydrateFromCloud: (sessions: CompletedSession[]) => void;
}

export const useSessionsStore = create<SessionsState>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (session) => {
        const full = { ...session, id: uid() };
        set((state) => ({ sessions: [...state.sessions, full] }));
        return full;
      },
      hydrateFromCloud: (sessions) => set({ sessions }),
    }),
    {
      name: "quranodoro-sessions",
      storage: createJSONStorage(() => accountStorage),
    },
  ),
);

/* ---------- Derived statistics (pure helpers over the session list) ---------- */

export function focusSessions(
  sessions: CompletedSession[],
): CompletedSession[] {
  return sessions.filter((s) => s.phase === "focus");
}

export function totalFocusMinutes(sessions: CompletedSession[]): number {
  return focusSessions(sessions).reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function totalPomodoros(sessions: CompletedSession[]): number {
  return focusSessions(sessions).length;
}

export function focusMinutesOn(
  sessions: CompletedSession[],
  date: Date,
): number {
  const key = dateKey(date);
  return focusSessions(sessions)
    .filter((s) => dateKey(new Date(s.completedAt)) === key)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function pomodorosOn(sessions: CompletedSession[], date: Date): number {
  const key = dateKey(date);
  return focusSessions(sessions).filter(
    (s) => dateKey(new Date(s.completedAt)) === key,
  ).length;
}

/** Consecutive days (ending today or yesterday) with at least one focus session. */
export function currentStreak(sessions: CompletedSession[]): number {
  const days = new Set(
    focusSessions(sessions).map((s) => dateKey(new Date(s.completedAt))),
  );
  if (days.size === 0) return 0;

  const cursor = new Date();
  // A streak survives if today has no session yet but yesterday did.
  if (!days.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dateKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Daily totals for the last `n` days (oldest first). */
export function lastNDays(
  sessions: CompletedSession[],
  n: number,
): DailyStat[] {
  const byDay = new Map<string, { focusMinutes: number; pomodoros: number }>();
  for (const s of focusSessions(sessions)) {
    const key = dateKey(new Date(s.completedAt));
    const entry = byDay.get(key) ?? { focusMinutes: 0, pomodoros: 0 };
    entry.focusMinutes += s.durationMinutes;
    entry.pomodoros += 1;
    byDay.set(key, entry);
  }

  const result: DailyStat[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const entry = byDay.get(key) ?? { focusMinutes: 0, pomodoros: 0 };
    result.push({ date: key, ...entry });
  }
  return result;
}

/** Monthly totals for the last `n` months (oldest first). */
export function lastNMonths(
  sessions: CompletedSession[],
  n: number,
): { month: string; focusMinutes: number; pomodoros: number }[] {
  const byMonth = new Map<
    string,
    { focusMinutes: number; pomodoros: number }
  >();
  for (const s of focusSessions(sessions)) {
    const d = new Date(s.completedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? { focusMinutes: 0, pomodoros: 0 };
    entry.focusMinutes += s.durationMinutes;
    entry.pomodoros += 1;
    byMonth.set(key, entry);
  }

  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({
      month: key,
      ...(byMonth.get(key) ?? { focusMinutes: 0, pomodoros: 0 }),
    });
  }
  return result;
}

export function averageSessionMinutes(sessions: CompletedSession[]): number {
  const focus = focusSessions(sessions);
  if (focus.length === 0) return 0;
  return totalFocusMinutes(sessions) / focus.length;
}
