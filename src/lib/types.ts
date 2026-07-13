/** Shared domain types used across the app. */

export type SessionPhase = "focus" | "shortBreak" | "longBreak";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export interface PomodoroPreset {
  id: string;
  name: string;
  /** Minutes of focused work per session. */
  focusMinutes: number;
  /** Minutes for a short break. */
  shortBreakMinutes: number;
  /** Minutes for a long break. */
  longBreakMinutes: number;
  /** Number of focus sessions before a long break. */
  sessionsBeforeLongBreak: number;
  /** Built-in presets cannot be deleted. */
  builtIn?: boolean;
}

export interface CompletedSession {
  id: string;
  /** ISO date-time when the session finished. */
  completedAt: string;
  phase: SessionPhase;
  /** Actual focused duration in minutes. */
  durationMinutes: number;
  presetId: string;
  /** Growth points earned by this session (focus sessions only). */
  growthPoints: number;
}

export interface Surah {
  number: number;
  name: string;
  arabicName: string;
  englishMeaning: string;
  ayahCount: number;
  revelation: "Meccan" | "Medinan";
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  /**
   * Base URL for full-surah MP3 files. The final URL is produced by
   * `getSurahAudioUrl`, which appends a zero-padded surah number + ".mp3".
   * Replace this value (or provide `customUrls`) to source audio elsewhere
   * without touching player code.
   */
  audioBaseUrl: string;
  /** Optional per-surah override URLs, keyed by surah number (1-114). */
  customUrls?: Record<number, string>;
}

export type TreeTypeId =
  | "ajwa"
  | "medjool"
  | "sukkari"
  | "deglet-noor"
  | "barhi"
  | "safawi";

export interface TreeType {
  id: TreeTypeId;
  name: string;
  description: string;
  /** Multiplier applied to base stage GP requirements (rarer = slower). */
  gpMultiplier: number;
}

export interface GrowthStage {
  index: number;
  name: string;
  emoji: string;
  /** Cumulative GP (before tree multiplier) required to reach this stage. */
  cumulativeGp: number;
}

export interface FarmTree {
  id: string;
  typeId: TreeTypeId;
  /** Accumulated growth points. */
  gp: number;
  /** ISO date-time when planting began. */
  plantedAt: string;
  /** ISO date-time when the tree reached the final stage, if it has. */
  maturedAt: string | null;
}

export interface Inspiration {
  id: string;
  kind: "verse" | "hadith" | "dua";
  arabic: string;
  english: string;
  reference: string;
}

import type { UILanguage } from "@/lib/i18n/types";

export interface UserSettings {
  autoStartNextSession: boolean;
  playQuranDuringFocus: boolean;
  reciterId: string;
  surahNumber: number;
  volume: number; // 0..1
  favoriteReciterId: string | null;
  favoriteSurahs: number[];
  /** Name shown in the dashboard greeting. */
  displayName: string;
  /** Interface language (Quran text and audio are not localized). */
  uiLanguage: UILanguage;
}

export interface DailyStat {
  /** yyyy-MM-dd */
  date: string;
  focusMinutes: number;
  pomodoros: number;
}
