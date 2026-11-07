import type { Reciter } from "@/lib/types";

/**
 * Reciter audio sources.
 *
 * Each reciter streams full-surah MP3s from the public mp3quran.net CDN.
 * The player builds URLs via `getSurahAudioUrl(reciter, surahNumber)`, so to
 * self-host audio later you only need to change `audioBaseUrl` (files named
 * 001.mp3 … 114.mp3) or supply `customUrls` overrides per surah — no player
 * code changes required.
 */
export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    audioBaseUrl: "https://server8.mp3quran.net/afs",
  },
  {
    id: "sudais",
    name: "Abdul Rahman Al-Sudais",
    arabicName: "عبدالرحمن السديس",
    audioBaseUrl: "https://server11.mp3quran.net/sds",
  },
  {
    id: "muaiqly",
    name: "Maher Al-Muaiqly",
    arabicName: "ماهر المعيقلي",
    audioBaseUrl: "https://server12.mp3quran.net/maher",
  },
  {
    id: "ghamdi",
    name: "Saad Al-Ghamdi",
    arabicName: "سعد الغامدي",
    audioBaseUrl: "https://server7.mp3quran.net/s_gmd",
  },
  {
    id: "dosari",
    name: "Yasser Al-Dosari",
    arabicName: "ياسر الدوسري",
    audioBaseUrl: "https://server11.mp3quran.net/yasser",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    audioBaseUrl: "https://cdn.mp3quran.net/audio/mahmoud-husary/r1",
  },
  {
    id: "minshawi",
    name: "Muhammad Siddiq Al-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    audioBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-minshawi/r1",
  },
  {
    id: "abdulbasit",
    name: "Abdul Basit Abdus Samad",
    arabicName: "عبد الباسط عبد الصمد",
    audioBaseUrl: "https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3",
  },
  {
    id: "shuraim",
    name: "Saud Al-Shuraim",
    arabicName: "سعود الشريم",
    audioBaseUrl: "https://cdn.mp3quran.net/audio/saud-shuraim/r1",
  },
  {
    id: "shatri",
    name: "Abu Bakr Al-Shatri",
    arabicName: "أبو بكر الشاطري",
    audioBaseUrl: "https://cdn.mp3quran.net/audio/abubakr-shatri/r1",
  },
  {
    id: "hudhaifi",
    name: "Ali Al-Hudhaifi",
    arabicName: "علي الحذيفي",
    audioBaseUrl: "https://cdn.mp3quran.net/audio/ali-hudhaifi/r1",
  },
  {
    id: "ajmy",
    name: "Ahmad Al-Ajmy",
    arabicName: "أحمد العجمي",
    audioBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-ajmi/r1",
  },
];

export const DEFAULT_RECITER_ID = RECITERS[0].id;

export function getReciter(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}

/** Build the streaming URL for a given reciter + surah (1-114). */
export function getSurahAudioUrl(
  reciter: Reciter,
  surahNumber: number,
): string {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114)
    throw new RangeError("Surah must be between 1 and 114");
  const override = reciter.customUrls?.[surahNumber];
  if (override) return override;
  const padded = String(surahNumber).padStart(3, "0");
  return `${reciter.audioBaseUrl}/${padded}.mp3`;
}
