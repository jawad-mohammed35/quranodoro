"use client";

import { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { SURAHS, getSurah } from "@/data/surahs";
import { useSettingsStore } from "@/stores/settings-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Searchable multi-select for favorite surahs: type to filter, click to
 * toggle. Selected surahs render as removable chips.
 */
export function FavoriteSurahsPicker() {
  const favoriteSurahs = useSettingsStore((s) => s.favoriteSurahs);
  const toggleFavoriteSurah = useSettingsStore((s) => s.toggleFavoriteSurah);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const sortedFavorites = useMemo(
    () => favoriteSurahs.slice().sort((a, b) => a - b),
    [favoriteSurahs],
  );

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col gap-2"
      onBlur={(e) => {
        // Close when focus leaves the whole picker (input + list).
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      {sortedFavorites.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Favorite surahs">
          {sortedFavorites.map((n) => {
            const surah = getSurah(n);
            return (
              <li
                key={n}
                className="flex items-center gap-1 rounded-full bg-primary-soft py-1 pl-3 pr-1.5 text-xs font-medium"
              >
                {surah.number}. {surah.name}
                <button
                  type="button"
                  aria-label={`Remove ${surah.name} from favorites`}
                  onClick={() => toggleFavoriteSurah(n)}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="favorite-surah-listbox"
          aria-label="Search surahs to add to favorites"
          placeholder="Search surahs to add…"
          className="pl-9"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />

        {open && (
          <ul
            id="favorite-surah-listbox"
            role="listbox"
            aria-multiselectable
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-card"
          >
            {filtered.map((s) => {
              const selected = favoriteSurahs.includes(s.number);
              return (
                <li key={s.number} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => toggleFavoriteSurah(s.number)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      selected ? "bg-primary-soft" : "hover:bg-muted",
                    )}
                  >
                    <span className="min-w-0 truncate">
                      {s.number}. {s.name}
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {s.englishMeaning}
                      </span>
                    </span>
                    {selected && (
                      <span className="shrink-0 text-xs font-medium text-primary">Added</span>
                    )}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-2.5 py-3 text-center text-sm text-muted-foreground">
                No surahs match “{query}”.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
