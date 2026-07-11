import type { PomodoroPreset } from "@/lib/types";

export const BUILT_IN_PRESETS: PomodoroPreset[] = [
  {
    id: "classic",
    name: "Classic 25 / 5",
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    builtIn: true,
  },
  {
    id: "extended",
    name: "Extended 50 / 10",
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 25,
    sessionsBeforeLongBreak: 3,
    builtIn: true,
  },
  {
    id: "long-form",
    name: "Long Form 90 / 20",
    focusMinutes: 90,
    shortBreakMinutes: 20,
    longBreakMinutes: 35,
    sessionsBeforeLongBreak: 2,
    builtIn: true,
  },
  {
    id: "deep-work",
    name: "Deep Work",
    focusMinutes: 60,
    shortBreakMinutes: 12,
    longBreakMinutes: 30,
    sessionsBeforeLongBreak: 3,
    builtIn: true,
  },
  {
    id: "exam-mode",
    name: "Exam Mode",
    focusMinutes: 40,
    shortBreakMinutes: 8,
    longBreakMinutes: 20,
    sessionsBeforeLongBreak: 4,
    builtIn: true,
  },
];

export const DEFAULT_PRESET_ID = BUILT_IN_PRESETS[0].id;
