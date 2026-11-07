"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { accountStorage } from "@/lib/account-storage";
import type { PomodoroPreset, UserSettings } from "@/lib/types";
import type { TasbihCompletion } from "@/stores/tasbih-store";
import { BUILT_IN_PRESETS, DEFAULT_PRESET_ID } from "@/data/presets";
import { DEFAULT_RECITER_ID, getReciter } from "@/data/reciters";
import { DEFAULT_UI_LANGUAGE, UI_LANGUAGES } from "@/lib/i18n/types";
import { uid } from "@/lib/utils";
import { defaultDashboard, normalizeDashboard } from "@/lib/dashboard";

interface SettingsState extends UserSettings {
  selectedPresetId: string;
  customPresets: PomodoroPreset[];

  setSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => void;
  selectPreset: (id: string) => void;
  addCustomPreset: (preset: Omit<PomodoroPreset, "id" | "builtIn">) => string;
  removeCustomPreset: (id: string) => void;
  toggleFavoriteSurah: (surahNumber: number) => void;
  /** Replace local state with cloud data (used by sync). */
  hydrateFromCloud: (data: Partial<SettingsSnapshot>) => void;
}

export type SettingsSnapshot = Pick<
  SettingsState,
  | "autoStartNextSession"
  | "playQuranDuringFocus"
  | "reciterId"
  | "surahNumber"
  | "volume"
  | "favoriteReciterId"
  | "favoriteSurahs"
  | "displayName"
  | "uiLanguage"
  | "selectedPresetId"
  | "customPresets"
  | "dashboard"
  | "sessionNotifications"
> & {
  tasbihCompletedSessions?: TasbihCompletion[];
  tasbih?: import("@/stores/tasbih-store").TasbihSnapshot;
};

/** Apply only serializable preference fields, never persisted action names. */
function cleanSettings(
  data: Partial<SettingsSnapshot>,
  defaults: SettingsSnapshot,
): SettingsSnapshot {
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof SettingsSnapshot)[]) {
    if (typeof defaults[key] === "function" || !(key in data)) continue;
    const candidate = data[key];
    if (
      Array.isArray(defaults[key])
        ? Array.isArray(candidate)
        : typeof candidate === typeof defaults[key]
    ) {
      Object.assign(result, { [key]: candidate });
    }
  }
  result.dashboard = normalizeDashboard(data.dashboard ?? defaults.dashboard);
  result.reciterId = getReciter(result.reciterId).id;
  result.favoriteReciterId =
    typeof data.favoriteReciterId === "string"
      ? getReciter(data.favoriteReciterId).id
      : data.favoriteReciterId === null
        ? null
        : defaults.favoriteReciterId;
  result.surahNumber = Number.isFinite(result.surahNumber)
    ? Math.max(1, Math.min(114, Math.round(result.surahNumber)))
    : 1;
  result.volume = Number.isFinite(result.volume)
    ? Math.max(0, Math.min(1, result.volume))
    : 0.7;
  result.favoriteSurahs = result.favoriteSurahs.filter(
    (n) => Number.isInteger(n) && n >= 1 && n <= 114,
  );
  result.customPresets = result.customPresets.filter(
    (p) =>
      p &&
      typeof p.id === "string" &&
      typeof p.name === "string" &&
      [
        p.focusMinutes,
        p.shortBreakMinutes,
        p.longBreakMinutes,
        p.sessionsBeforeLongBreak,
      ].every((n) => Number.isFinite(n) && n >= 1 && n <= 240),
  );
  result.uiLanguage = UI_LANGUAGES.some((l) => l.id === result.uiLanguage)
    ? result.uiLanguage
    : DEFAULT_UI_LANGUAGE;
  result.displayName = result.displayName.slice(0, 80);
  return result;
}

export const useSettingsStore = create<SettingsState>()(
  persist<SettingsState>(
    (set, get) => ({
      dashboard: defaultDashboard(),
      sessionNotifications: false,
      autoStartNextSession: false,
      playQuranDuringFocus: true,
      reciterId: DEFAULT_RECITER_ID,
      surahNumber: 1,
      volume: 0.7,
      favoriteReciterId: null,
      favoriteSurahs: [],
      displayName: "",
      uiLanguage: DEFAULT_UI_LANGUAGE,
      selectedPresetId: DEFAULT_PRESET_ID,
      customPresets: [],

      setSetting: (key, value) => set({ [key]: value }),

      selectPreset: (id) => set({ selectedPresetId: id }),

      addCustomPreset: (preset) => {
        const id = uid();
        set((state) => ({
          customPresets: [...state.customPresets, { ...preset, id }],
          selectedPresetId: id,
        }));
        return id;
      },

      removeCustomPreset: (id) =>
        set((state) => ({
          customPresets: state.customPresets.filter((p) => p.id !== id),
          selectedPresetId:
            state.selectedPresetId === id
              ? DEFAULT_PRESET_ID
              : state.selectedPresetId,
        })),

      toggleFavoriteSurah: (surahNumber) =>
        set((state) => ({
          favoriteSurahs: state.favoriteSurahs.includes(surahNumber)
            ? state.favoriteSurahs.filter((n) => n !== surahNumber)
            : [...state.favoriteSurahs, surahNumber],
        })),

      hydrateFromCloud: (data): void => {
        set(cleanSettings(data, get()));
      },
    }),
    {
      name: "quranodoro-settings",
      storage: createJSONStorage(() => accountStorage),
      merge: (persisted, current) => ({
        ...current,
        ...cleanSettings(
          (persisted || {}) as Partial<SettingsSnapshot>,
          current,
        ),
      }),
    },
  ),
);

export function getAllPresets(
  customPresets: PomodoroPreset[],
): PomodoroPreset[] {
  return [...BUILT_IN_PRESETS, ...customPresets];
}

export function getPresetById(
  id: string,
  customPresets: PomodoroPreset[],
): PomodoroPreset {
  return (
    getAllPresets(customPresets).find((p) => p.id === id) ?? BUILT_IN_PRESETS[0]
  );
}
