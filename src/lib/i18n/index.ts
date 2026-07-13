"use client";

import { useSettingsStore } from "@/stores/settings-store";
import { en, type TranslationKey, type TranslationSchema } from "./translations/en";
import { ar } from "./translations/ar";
import { fr } from "./translations/fr";
import { tr } from "./translations/tr";
import { id } from "./translations/id";
import { zh } from "./translations/zh";
import type { UILanguage } from "./types";
import { DEFAULT_UI_LANGUAGE } from "./types";

const translations: Record<UILanguage, TranslationSchema> = {
  en,
  ar,
  fr,
  tr,
  id,
  zh,
};

type InterpolationValues = Record<string, string | number>;

function getNestedValue(obj: TranslationSchema, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, values?: InterpolationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

/** Translate a key for the given language, falling back to English. */
export function translate(
  language: UILanguage,
  key: TranslationKey,
  values?: InterpolationValues,
): string {
  const dict = translations[language] ?? translations[DEFAULT_UI_LANGUAGE];
  const text = getNestedValue(dict, key) ?? getNestedValue(translations.en, key) ?? key;
  return interpolate(text, values);
}

/** React hook — re-renders when the UI language changes. */
export function useTranslation() {
  const language = useSettingsStore((s) => s.uiLanguage);

  function t(key: TranslationKey, values?: InterpolationValues): string {
    return translate(language, key, values);
  }

  return { t, language };
}

/** Preset description formatter used by Pomodoro preset chips. */
export function formatPresetDetail(
  language: UILanguage,
  preset: {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    sessionsBeforeLongBreak: number;
    builtIn?: boolean;
  },
): string {
  if (preset.builtIn) {
    return translate(language, "pomodoro.presetDetail", {
      focus: preset.focusMinutes,
      shortBreak: preset.shortBreakMinutes,
      sessions: preset.sessionsBeforeLongBreak,
    });
  }
  return translate(language, "pomodoro.presetDetailCustom", {
    focus: preset.focusMinutes,
    shortBreak: preset.shortBreakMinutes,
    longBreak: preset.longBreakMinutes,
    sessions: preset.sessionsBeforeLongBreak,
  });
}
