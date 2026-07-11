"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

/**
 * Applies the chosen Arabic script to the document root. CSS in globals.css
 * maps `data-arabic-font` to the matching font variable, so every element
 * using the `font-arabic` utility updates instantly.
 */
export function ArabicFontApplier() {
  const arabicFontId = useSettingsStore((s) => s.arabicFontId);

  useEffect(() => {
    document.documentElement.dataset.arabicFont = arabicFontId;
  }, [arabicFontId]);

  return null;
}
