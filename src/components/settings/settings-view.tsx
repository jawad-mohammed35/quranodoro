"use client";

import { useRouter } from "next/navigation";
import { ProgressBackup } from "./progress-backup";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { RECITERS } from "@/data/reciters";
import { SURAHS } from "@/data/surahs";
import { UI_LANGUAGES } from "@/lib/i18n/types";
import type { UILanguage } from "@/lib/i18n/types";
import { useTranslation } from "@/lib/i18n";
import { useSettingsStore } from "@/stores/settings-store";
import { useMounted } from "@/hooks/use-mounted";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  const router = useRouter();
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [notice, setNotice] = useState("");
  const settings = useSettingsStore();

  if (!mounted) {
    return (
      <PageHeader
        title={t("settings.title")}
        description={t("common.loading")}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.account")}</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <p className="text-sm text-muted-foreground">
                {t("settings.signedInAs", { email: user.email ?? "" })}
              </p>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted-foreground">
                  {t("settings.localOnly")}
                </p>
                <Button onClick={() => router.push("/register")}>
                  {t("settings.createAccount")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.profile")}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label={t("settings.yourName")}
              description={t("settings.yourNameHint")}
              htmlFor="settings-name"
            >
              <Input
                id="settings-name"
                placeholder={t("settings.yourNamePlaceholder")}
                maxLength={40}
                value={settings.displayName}
                onChange={(e) =>
                  settings.setSetting("displayName", e.target.value)
                }
              />
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.appearance")}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label={t("settings.theme")}
              description={t("settings.themeHint")}
              htmlFor="theme-select"
            >
              <Select
                id="theme-select"
                value={theme ?? "light"}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="light">{t("settings.themeLight")}</option>
                <option value="dark">{t("settings.themeDark")}</option>
                <option value="system">{t("settings.themeSystem")}</option>
              </Select>
            </SettingRow>
            <SettingRow
              label={t("settings.language")}
              description={t("settings.languageHint")}
              htmlFor="settings-language"
            >
              <Select
                id="settings-language"
                value={settings.uiLanguage}
                onChange={(e) =>
                  settings.setSetting(
                    "uiLanguage",
                    e.target.value as UILanguage,
                  )
                }
              >
                {UI_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.nativeLabel}
                  </option>
                ))}
              </Select>
            </SettingRow>
          </CardContent>
        </Card>

        <ProgressBackup />
        <Card>
          <CardHeader>
            <CardTitle>Session notifications</CardTitle>
            <CardDescription>
              Optional browser alerts when a focus session or break finishes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={async () => {
                setNotice("");
                if (settings.sessionNotifications) {
                  settings.setSetting("sessionNotifications", false);
                  return;
                }
                if (typeof Notification === "undefined") {
                  setNotice("This browser does not support notifications.");
                  return;
                }
                const permission = await Notification.requestPermission();
                settings.setSetting(
                  "sessionNotifications",
                  permission === "granted",
                );
                if (permission !== "granted")
                  setNotice(
                    "Notifications are blocked. You can allow them in your browser's site settings.",
                  );
              }}
            >
              {settings.sessionNotifications
                ? "Disable notifications"
                : "Enable notifications"}
            </Button>
            <p role="status" className="mt-2 text-sm text-muted-foreground">
              {notice}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.pomodoro")}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label={t("settings.autoStartNext")}
              description={t("settings.autoStartHint")}
              htmlFor="settings-auto-start"
            >
              <div className="flex justify-end">
                <Switch
                  id="settings-auto-start"
                  checked={settings.autoStartNextSession}
                  onCheckedChange={(v) =>
                    settings.setSetting("autoStartNextSession", v)
                  }
                />
              </div>
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.quranAudio")}</CardTitle>
            <CardDescription>{t("settings.quranAudioHint")}</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label={t("settings.playQuranDuringFocus")}
              htmlFor="settings-play-quran"
            >
              <div className="flex justify-end">
                <Switch
                  id="settings-play-quran"
                  checked={settings.playQuranDuringFocus}
                  onCheckedChange={(v) =>
                    settings.setSetting("playQuranDuringFocus", v)
                  }
                />
              </div>
            </SettingRow>
            <SettingRow
              label={t("settings.reciter")}
              htmlFor="settings-reciter"
            >
              <Select
                id="settings-reciter"
                value={settings.reciterId}
                onChange={(e) =>
                  settings.setSetting("reciterId", e.target.value)
                }
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </SettingRow>
            <SettingRow label={t("settings.surah")} htmlFor="settings-surah">
              <Select
                id="settings-surah"
                value={settings.surahNumber}
                onChange={(e) =>
                  settings.setSetting("surahNumber", Number(e.target.value))
                }
              >
                {SURAHS.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name}
                  </option>
                ))}
              </Select>
            </SettingRow>
            <SettingRow
              label={t("settings.volume", {
                percent: Math.round(settings.volume * 100),
              })}
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
                onChange={(e) =>
                  settings.setSetting("volume", Number(e.target.value))
                }
                aria-label={t("settings.volumeAria")}
              />
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.favorites")}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <SettingRow
              label={t("settings.favoriteReciter")}
              description={t("settings.favoriteReciterHint")}
              htmlFor="settings-fav-reciter"
            >
              <Select
                id="settings-fav-reciter"
                value={settings.favoriteReciterId ?? ""}
                onChange={(e) =>
                  settings.setSetting(
                    "favoriteReciterId",
                    e.target.value || null,
                  )
                }
              >
                <option value="">{t("common.none")}</option>
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </SettingRow>
            <div className="flex flex-col gap-3 py-4 last:pb-0">
              <div>
                <Label>{t("settings.favoriteSurahs")}</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("settings.favoriteSurahsHint")}
                </p>
              </div>
              <FavoriteSurahsPicker />
            </div>
          </CardContent>
        </Card>

        <Link
          href="/settings/about"
          className="glass-surface flex items-center justify-between rounded-card border border-border p-6 font-semibold"
        >
          {t("nav.aboutDeveloper")} <span aria-hidden>→</span>
        </Link>
      </div>
    </>
  );
}
