/** Supported UI languages. Quranic text and audio are not localized. */
export type UILanguage = "en" | "ar" | "fr" | "tr" | "id" | "zh";

export const UI_LANGUAGES: {
  id: UILanguage;
  label: string;
  nativeLabel: string;
}[] = [
  { id: "en", label: "English", nativeLabel: "English" },
  { id: "ar", label: "Arabic", nativeLabel: "العربية" },
  { id: "fr", label: "French", nativeLabel: "Français" },
  { id: "tr", label: "Turkish", nativeLabel: "Türkçe" },
  { id: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia" },
  { id: "zh", label: "Simplified Chinese", nativeLabel: "简体中文" },
];

export const DEFAULT_UI_LANGUAGE: UILanguage = "en";

/** Languages that use right-to-left layout for the UI. */
export const RTL_LANGUAGES: UILanguage[] = ["ar"];
