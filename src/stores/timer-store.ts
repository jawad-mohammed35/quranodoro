"use client";

import { create } from "zustand";
import type { PomodoroPreset, SessionPhase, TimerStatus } from "@/lib/types";
import { growthPointsForMinutes } from "@/data/trees";
import { useSessionsStore } from "@/stores/sessions-store";
import { useFarmStore } from "@/stores/farm-store";
import { useSettingsStore, getPresetById } from "@/stores/settings-store";

interface TimerState {
  status: TimerStatus;
  phase: SessionPhase;
  /** Seconds remaining in the current phase (for display). */
  secondsLeft: number;
  /** Total seconds of the current phase. */
  phaseSeconds: number;
  /** Wall-clock ms when the running phase ends (source of truth while running). */
  endAt: number | null;
  /** Focus sessions completed in the current cycle (resets after long break). */
  focusCountInCycle: number;
  /** Preset snapshot taken when the cycle starts. */
  preset: PomodoroPreset | null;

  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  skipBreak: () => void;
  /** Advance the clock; called by the global ticker. Handles completion. */
  tick: () => void;
  /** Sync durations when the selected preset changes while idle. */
  syncPreset: () => void;
}

function phaseDurationSeconds(preset: PomodoroPreset, phase: SessionPhase): number {
  switch (phase) {
    case "focus":
      return preset.focusMinutes * 60;
    case "shortBreak":
      return preset.shortBreakMinutes * 60;
    case "longBreak":
      return preset.longBreakMinutes * 60;
  }
}

function currentPreset(): PomodoroPreset {
  const { selectedPresetId, customPresets } = useSettingsStore.getState();
  return getPresetById(selectedPresetId, customPresets);
}

export const useTimerStore = create<TimerState>()((set, get) => ({
  status: "idle",
  phase: "focus",
  secondsLeft: 25 * 60,
  phaseSeconds: 25 * 60,
  endAt: null,
  focusCountInCycle: 0,
  preset: null,

  start: () => {
    const preset = currentPreset();
    const seconds = phaseDurationSeconds(preset, "focus");
    set({
      status: "running",
      phase: "focus",
      preset,
      phaseSeconds: seconds,
      secondsLeft: seconds,
      endAt: Date.now() + seconds * 1000,
    });
  },

  pause: () => {
    const { status, endAt } = get();
    if (status !== "running" || !endAt) return;
    set({
      status: "paused",
      secondsLeft: Math.max(0, Math.round((endAt - Date.now()) / 1000)),
      endAt: null,
    });
  },

  resume: () => {
    const { status, secondsLeft } = get();
    // Resumes a paused phase, or begins the next queued phase after a
    // completion when auto-start is off (status === "finished").
    if (status !== "paused" && status !== "finished") return;
    set({ status: "running", endAt: Date.now() + secondsLeft * 1000 });
  },

  stop: () => {
    const preset = currentPreset();
    const seconds = phaseDurationSeconds(preset, "focus");
    set({
      status: "idle",
      phase: "focus",
      preset: null,
      phaseSeconds: seconds,
      secondsLeft: seconds,
      endAt: null,
      focusCountInCycle: 0,
    });
  },

  reset: () => {
    const { phase } = get();
    const preset = get().preset ?? currentPreset();
    const seconds = phaseDurationSeconds(preset, phase);
    set((state) => ({
      phaseSeconds: seconds,
      secondsLeft: seconds,
      endAt: state.status === "running" ? Date.now() + seconds * 1000 : null,
    }));
  },

  skipBreak: () => {
    const { phase, preset } = get();
    if (phase === "focus" || !preset) return;
    beginPhase(set, preset, "focus", useSettingsStore.getState().autoStartNextSession || get().status === "running");
  },

  tick: () => {
    const { status, endAt } = get();
    if (status !== "running" || !endAt) return;
    const remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    if (remaining > 0) {
      if (remaining !== get().secondsLeft) set({ secondsLeft: remaining });
      return;
    }
    completePhase(set, get);
  },

  syncPreset: () => {
    if (get().status !== "idle") return;
    const preset = currentPreset();
    const seconds = phaseDurationSeconds(preset, "focus");
    set({ phaseSeconds: seconds, secondsLeft: seconds });
  },
}));

type Set = (partial: Partial<TimerState> | ((s: TimerState) => Partial<TimerState>)) => void;
type Get = () => TimerState;

function beginPhase(set: Set, preset: PomodoroPreset, phase: SessionPhase, autoStart: boolean) {
  const seconds = phaseDurationSeconds(preset, phase);
  set({
    phase,
    phaseSeconds: seconds,
    secondsLeft: seconds,
    status: autoStart ? "running" : "finished",
    endAt: autoStart ? Date.now() + seconds * 1000 : null,
  });
}

/** Handle a phase reaching 00:00: record, award GP, and transition. */
function completePhase(set: Set, get: Get) {
  const { phase, preset, focusCountInCycle, phaseSeconds } = get();
  if (!preset) return;

  const autoStart = useSettingsStore.getState().autoStartNextSession;

  if (phase === "focus") {
    const minutes = Math.round(phaseSeconds / 60);
    const gp = growthPointsForMinutes(minutes);

    useSessionsStore.getState().addSession({
      completedAt: new Date().toISOString(),
      phase: "focus",
      durationMinutes: minutes,
      presetId: preset.id,
      growthPoints: gp,
    });
    useFarmStore.getState().awardGrowthPoints(gp);

    const newCount = focusCountInCycle + 1;
    const isLongBreak = newCount >= preset.sessionsBeforeLongBreak;
    set({ focusCountInCycle: isLongBreak ? 0 : newCount });
    beginPhase(set, preset, isLongBreak ? "longBreak" : "shortBreak", autoStart);
  } else {
    beginPhase(set, preset, "focus", autoStart);
  }
}
