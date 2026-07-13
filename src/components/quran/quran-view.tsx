"use client";

import { useMemo, useState } from "react";
import { Heart, Play, Search } from "lucide-react";
import { SURAHS } from "@/data/surahs";
import { useSettingsStore } from "@/stores/settings-store";
import { usePlayerStore } from "@/stores/player-store";
import { useMounted } from "@/hooks/use-mounted";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlayerControls } from "@/components/quran/player-controls";
import { cn } from "@/lib/utils";

function SurahList() {
  const [query, setQuery] = useState("");
  const { t } = useTranslation();
  const surahNumber = useSettingsStore((s) => s.surahNumber);
  const favoriteSurahs = useSettingsStore((s) => s.favoriteSurahs);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const toggleFavoriteSurah = useSettingsStore((s) => s.toggleFavoriteSurah);
  const requestPlay = usePlayerStore((s) => s.requestPlay);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SURAHS;
    return SURAHS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.englishMeaning.toLowerCase().includes(q) ||
        String(s.number) === q,
    );
  }, [query]);

  const playSurah = (n: number) => {
    setSetting("surahNumber", n);
    requestPlay(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={t("quran.searchPlaceholder")}
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t("quran.searchAria")}
        />
      </div>

      <ul className="flex max-h-[32rem] flex-col gap-1 overflow-y-auto pr-1" role="list">
        {filtered.map((s) => {
          const selected = s.number === surahNumber;
          const favorite = favoriteSurahs.includes(s.number);
          return (
            <li key={s.number}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                  selected ? "bg-primary-soft" : "hover:bg-muted",
                )}
              >
                <button
                  type="button"
                  onClick={() => playSurah(s.number)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-ring"
                  aria-label={t("quran.playSurah", { name: s.name })}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums group-hover:bg-card">
                    {s.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {s.name}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {s.englishMeaning}
                      </span>
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {s.ayahCount} ayahs · {s.revelation}
                    </span>
                  </span>
                  <span className="font-arabic text-lg" dir="rtl" lang="ar">
                    {s.arabicName}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={
                    favorite ? t("quran.removeFavorite") : t("quran.addFavorite")
                  }
                  aria-pressed={favorite}
                  onClick={() => toggleFavoriteSurah(s.number)}
                  className="rounded-full p-1.5 text-muted-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <Heart className={cn("h-4 w-4", favorite && "fill-primary text-primary")} />
                </button>
                <Play
                  className={cn(
                    "h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
                    selected && "opacity-100 text-primary",
                  )}
                  aria-hidden
                />
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-8 text-center text-sm text-muted-foreground">
            {t("quran.noResultsQuery", { query })}
          </li>
        )}
      </ul>
    </div>
  );
}

export function QuranView() {
  const mounted = useMounted();
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("quran.title")}
        description={t("quran.pageDescription")}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="h-fit lg:sticky lg:top-8">
          <CardHeader>
            <CardTitle>{t("quran.nowPlaying")}</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerControls />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("quran.allSurahs")}</CardTitle>
          </CardHeader>
          <CardContent>{mounted && <SurahList />}</CardContent>
        </Card>
      </div>
    </>
  );
}
