"use client";

import { useTheme } from "next-themes";
import { RECITERS } from "@/data/reciters";
import { SURAHS } from "@/data/surahs";
import type { ArabicFontId } from "@/lib/types";
import { useSettingsStore } from "@/stores/settings-store";
import { useMounted } from "@/hooks/use-mounted";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FavoriteSurahsPicker } from "@/components/settings/favorite-surahs-picker";

function SettingRow({
  label,
  description,
  children,
  htmlFor,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 max-w-md">
        <Label htmlFor={htmlFor}>{label}</Label>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="w-full sm:w-64">{children}</div>
    </div>
  );
}

export function SettingsView() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const settings = useSettingsStore();

  if (!mounted) {
    return <PageHeader title="Settings" description="Loading…" />;
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Tune Quranodoro to your rhythm. Everything saves automatically."
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label="Your name"
              description="Used for the greeting on your dashboard."
              htmlFor="settings-name"
            >
              <Input
                id="settings-name"
                placeholder="e.g. Jawad"
                maxLength={40}
                value={settings.displayName}
                onChange={(e) => settings.setSetting("displayName", e.target.value)}
              />
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label="Theme"
              description="Light is warm and pastel; dark is soft charcoal. Light is the default."
              htmlFor="theme-select"
            >
              <Select
                id="theme-select"
                value={theme ?? "light"}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">Match system</option>
              </Select>
            </SettingRow>
            <SettingRow
              label="Arabic script"
              description="Changes how Quran text and surah names are rendered across the app."
              htmlFor="settings-arabic-font"
            >
              <div className="flex flex-col gap-2">
                <Select
                  id="settings-arabic-font"
                  value={settings.arabicFontId}
                  onChange={(e) =>
                    settings.setSetting("arabicFontId", e.target.value as ArabicFontId)
                  }
                >
                  <option value="amiri">Uthmani — Amiri (default)</option>
                  <option value="indopak">IndoPak — Nastaliq</option>
                </Select>
                <p
                  className="rounded-xl bg-muted px-3 py-2 text-center font-arabic text-xl"
                  dir="rtl"
                  lang="ar"
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pomodoro</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label="Auto-start next session"
              description="Breaks and focus sessions begin automatically when the previous one ends."
              htmlFor="settings-auto-start"
            >
              <div className="flex justify-end">
                <Switch
                  id="settings-auto-start"
                  checked={settings.autoStartNextSession}
                  onCheckedChange={(v) => settings.setSetting("autoStartNextSession", v)}
                />
              </div>
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quran audio</CardTitle>
            <CardDescription>
              Recitation starts automatically with each focus session and pauses during breaks.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label="Play Quran during focus"
              htmlFor="settings-play-quran"
            >
              <div className="flex justify-end">
                <Switch
                  id="settings-play-quran"
                  checked={settings.playQuranDuringFocus}
                  onCheckedChange={(v) => settings.setSetting("playQuranDuringFocus", v)}
                />
              </div>
            </SettingRow>
            <SettingRow label="Reciter" htmlFor="settings-reciter">
              <Select
                id="settings-reciter"
                value={settings.reciterId}
                onChange={(e) => settings.setSetting("reciterId", e.target.value)}
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </SettingRow>
            <SettingRow label="Surah" htmlFor="settings-surah">
              <Select
                id="settings-surah"
                value={settings.surahNumber}
                onChange={(e) => settings.setSetting("surahNumber", Number(e.target.value))}
              >
                {SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name}
                  </option>
                ))}
              </Select>
            </SettingRow>
            <SettingRow
              label={`Volume · ${Math.round(settings.volume * 100)}%`}
              htmlFor="settings-volume"
            >
              <input
                id="settings-volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                className="w-full"
                value={settings.volume}
                onChange={(e) => settings.setSetting("volume", Number(e.target.value))}
                aria-label="Playback volume"
              />
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favorites</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label="Favorite reciter"
              description="Shown on your dashboard."
              htmlFor="settings-fav-reciter"
            >
              <Select
                id="settings-fav-reciter"
                value={settings.favoriteReciterId ?? ""}
                onChange={(e) =>
                  settings.setSetting("favoriteReciterId", e.target.value || null)
                }
              >
                <option value="">None</option>
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </SettingRow>
            <div className="flex flex-col gap-3 py-4 last:pb-0">
              <div>
                <Label>Favorite surahs</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Search and select below, or tap the heart on any surah in the
                  Quran Player.
                </p>
              </div>
              <FavoriteSurahsPicker />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{user.email}</span>.
                Your data syncs automatically.
              </p>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted-foreground">
                  You&apos;re using Quranodoro on this device only. Create an
                  account to back up and sync your progress.
                </p>
                <Button onClick={() => (window.location.href = "/register")}>
                  Create an account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
