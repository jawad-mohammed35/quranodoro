"use client";

import { Heart, Pause, Play, SkipBack, SkipForward, Square, Volume2 } from "lucide-react";
import { RECITERS, getReciter } from "@/data/reciters";
import { SURAHS, getSurah } from "@/data/surahs";
import { usePlayerStore } from "@/stores/player-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/input";
import { formatClock, cn } from "@/lib/utils";

export function PlayerControls({ compact = false }: { compact?: boolean }) {
  const mounted = useMounted();

  const playback = usePlayerStore((s) => s.playback);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const { requestPlay, requestPause, requestStop } = usePlayerStore.getState();

  const reciterId = useSettingsStore((s) => s.reciterId);
  const surahNumber = useSettingsStore((s) => s.surahNumber);
  const volume = useSettingsStore((s) => s.volume);
  const favoriteReciterId = useSettingsStore((s) => s.favoriteReciterId);
  const favoriteSurahs = useSettingsStore((s) => s.favoriteSurahs);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const toggleFavoriteSurah = useSettingsStore((s) => s.toggleFavoriteSurah);

  if (!mounted) return <div className="h-40" aria-hidden />;

  const surah = getSurah(surahNumber);
  const reciter = getReciter(reciterId);
  const isPlaying = playback === "playing" || playback === "loading";
  const isFavoriteSurah = favoriteSurahs.includes(surahNumber);
  const isFavoriteReciter = favoriteReciterId === reciterId;

  const goToSurah = (n: number) => {
    const next = Math.min(114, Math.max(1, n));
    setSetting("surahNumber", next);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Now playing */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-arabic text-2xl leading-snug" dir="rtl" lang="ar">
            {surah.arabicName}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {surah.number}. {surah.name} — {surah.englishMeaning} · {reciter.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isFavoriteSurah ? "Remove surah from favorites" : "Add surah to favorites"}
          aria-pressed={isFavoriteSurah}
          onClick={() => toggleFavoriteSurah(surahNumber)}
        >
          <Heart
            className={cn("h-5 w-5", isFavoriteSurah && "fill-primary text-primary")}
            aria-hidden
          />
        </Button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
        <span>{formatClock(currentTime)}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
        </div>
        <span>{duration > 0 ? formatClock(duration) : "--:--"}</span>
      </div>

      {/* Transport */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous surah"
          onClick={() => goToSurah(surahNumber - 1)}
          disabled={surahNumber <= 1}
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          className="h-14 w-14"
          aria-label={isPlaying ? "Pause recitation" : "Play recitation"}
          onClick={() => (isPlaying ? requestPause() : requestPlay(true))}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Stop recitation"
          onClick={requestStop}
          disabled={playback === "stopped"}
        >
          <Square className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next surah"
          onClick={() => goToSurah(surahNumber + 1)}
          disabled={surahNumber >= 114}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {playback === "error" && (
        <p role="alert" className="text-center text-sm text-danger">
          Could not load this recitation. Check your connection or try another
          reciter.
        </p>
      )}

      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reciter-select">Reciter</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                aria-pressed={isFavoriteReciter}
                onClick={() =>
                  setSetting("favoriteReciterId", isFavoriteReciter ? null : reciterId)
                }
              >
                {isFavoriteReciter ? "★ Favorite" : "☆ Set favorite"}
              </button>
            </div>
            <Select
              id="reciter-select"
              value={reciterId}
              onChange={(e) => setSetting("reciterId", e.target.value)}
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="surah-select">Surah</Label>
            <Select
              id="surah-select"
              value={surahNumber}
              onChange={(e) => goToSurah(Number(e.target.value))}
            >
              {SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name} ({s.englishMeaning})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="volume-slider" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" aria-hidden /> Volume ·{" "}
              {Math.round(volume * 100)}%
            </Label>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setSetting("volume", Number(e.target.value))}
              aria-label="Playback volume"
            />
          </div>
        </div>
      )}
    </div>
  );
}
