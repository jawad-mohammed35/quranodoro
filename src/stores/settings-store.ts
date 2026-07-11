"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PomodoroPreset, UserSettings } from "@/lib/types";
import { BUILT_IN_PRESETS, DEFAULT_PRESET_ID } from "@/data/presets";
import { DEFAULT_RECITER_ID } from "@/data/reciters";
import { uid } from "@/lib/utils";

interface SettingsState extends UserSettings {
  selectedPresetId: string;
  customPresets: PomodoroPreset[];

  setSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
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
  | "arabicFontId"
  | "selectedPresetId"
  | "customPresets"
>;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoStartNextSession: false,
      playQuranDuringFocus: true,
      reciterId: DEFAULT_RECITER_ID,
      surahNumber: 1,
      volume: 0.7,
      favoriteReciterId: null,
      favoriteSurahs: [],
      displayName: "",
      arabicFontId: "amiri",
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
            state.selectedPresetId === id ? DEFAULT_PRESET_ID : state.selectedPresetId,
        })),

      toggleFavoriteSurah: (surahNumber) =>
        set((state) => ({
          favoriteSurahs: state.favoriteSurahs.includes(surahNumber)
            ? state.favoriteSurahs.filter((n) => n !== surahNumber)
            : [...state.favoriteSurahs, surahNumber],
        })),

      hydrateFromCloud: (data) => set(data),
    }),
    { name: "quranodoro-settings" },
  ),
);

export function getAllPresets(customPresets: PomodoroPreset[]): PomodoroPreset[] {
  return [...BUILT_IN_PRESETS, ...customPresets];
}

export function getPresetById(id: string, customPresets: PomodoroPreset[]): PomodoroPreset {
  return (
    getAllPresets(customPresets).find((p) => p.id === id) ?? BUILT_IN_PRESETS[0]
  );
}
