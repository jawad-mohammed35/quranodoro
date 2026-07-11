import type { Inspiration } from "@/lib/types";

/** Daily reminders: Quran verses, authentic hadith, and duas. */
export const INSPIRATIONS: Inspiration[] = [
  {
    id: "verse-1",
    kind: "verse",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    english: "Indeed, with hardship comes ease.",
    reference: "Quran 94:5",
  },
  {
    id: "verse-2",
    kind: "verse",
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    english: "And say: My Lord, increase me in knowledge.",
    reference: "Quran 20:114",
  },
  {
    id: "verse-3",
    kind: "verse",
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    english: "Verily, in the remembrance of Allah do hearts find rest.",
    reference: "Quran 13:28",
  },
  {
    id: "verse-4",
    kind: "verse",
    arabic: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
    english: "And that man shall have nothing but what he strives for.",
    reference: "Quran 53:39",
  },
  {
    id: "verse-5",
    kind: "verse",
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    english: "Indeed, Allah is with the patient.",
    reference: "Quran 2:153",
  },
  {
    id: "verse-6",
    kind: "verse",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    english: "And whoever relies upon Allah — He is sufficient for him.",
    reference: "Quran 65:3",
  },
  {
    id: "hadith-1",
    kind: "hadith",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    english: "Actions are judged by intentions.",
    reference: "Sahih al-Bukhari 1",
  },
  {
    id: "hadith-2",
    kind: "hadith",
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    english:
      "The most beloved deeds to Allah are those done consistently, even if small.",
    reference: "Sahih al-Bukhari 6464",
  },
  {
    id: "hadith-3",
    kind: "hadith",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    english: "The best of you are those who learn the Quran and teach it.",
    reference: "Sahih al-Bukhari 5027",
  },
  {
    id: "hadith-4",
    kind: "hadith",
    arabic:
      "نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ",
    english:
      "There are two blessings in which many people are at a loss: health and free time.",
    reference: "Sahih al-Bukhari 6412",
  },
  {
    id: "hadith-5",
    kind: "hadith",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    english:
      "Whoever travels a path in search of knowledge, Allah makes easy for him a path to Paradise.",
    reference: "Sahih Muslim 2699",
  },
  {
    id: "dua-1",
    kind: "dua",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    english: "My Lord, expand for me my chest and ease for me my task.",
    reference: "Quran 20:25-26 (Dua of Musa)",
  },
  {
    id: "dua-2",
    kind: "dua",
    arabic:
      "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    english:
      "O Allah, nothing is easy except what You make easy, and You make the difficult easy if You will.",
    reference: "Ibn Hibban 974",
  },
  {
    id: "dua-3",
    kind: "dua",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
    english:
      "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
    reference: "Sunan Ibn Majah 925",
  },
  {
    id: "dua-4",
    kind: "dua",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    english: "Allah is sufficient for us, and He is the best Disposer of affairs.",
    reference: "Quran 3:173",
  },
];

/** Deterministic pick for a given date so the reminder is stable all day. */
export function inspirationForDate(date: Date): Inspiration {
  const key =
    date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  return INSPIRATIONS[key % INSPIRATIONS.length];
}

export function randomInspiration(excludeId?: string): Inspiration {
  const pool = INSPIRATIONS.filter((i) => i.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
}
