"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { RTL_LANGUAGES } from "@/lib/i18n/types";

/**
 * Applies the chosen UI language to the document root for `lang` and `dir`
 * attributes, enabling RTL layout for Arabic.
 */
export function LocaleApplier() {
  const uiLanguage = useSettingsStore((s) => s.uiLanguage);

  useEffect(() => {
    document.documentElement.lang = uiLanguage;
    document.documentElement.dir = RTL_LANGUAGES.includes(uiLanguage) ? "rtl" : "ltr";
  }, [uiLanguage]);

  return null;
}
