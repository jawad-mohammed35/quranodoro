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
];

export const DEFAULT_RECITER_ID = RECITERS[0].id;

export function getReciter(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}

/** Build the streaming URL for a given reciter + surah (1-114). */
export function getSurahAudioUrl(reciter: Reciter, surahNumber: number): string {
  const override = reciter.customUrls?.[surahNumber];
  if (override) return override;
  const padded = String(surahNumber).padStart(3, "0");
  return `${reciter.audioBaseUrl}/${padded}.mp3`;
}
