"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import { useTimerStore } from "@/stores/timer-store";
import { useSettingsStore, getPresetById } from "@/stores/settings-store";
import { useFarmStore } from "@/stores/farm-store";
import {
  getTreeType,
  GROWTH_STAGES,
  stageForGp,
  growthPointsForMinutes,
} from "@/data/trees";
import { useMounted } from "@/hooks/use-mounted";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TimerDial } from "@/components/timer/timer-dial";
import { TimerControls } from "@/components/timer/timer-controls";
import { PresetManager } from "@/components/timer/preset-manager";
import { PlayerControls } from "@/components/quran/player-controls";
import { cn } from "@/lib/utils";

function CycleDots() {
  const focusCountInCycle = useTimerStore((s) => s.focusCountInCycle);
  const preset = useTimerStore((s) => s.preset);
  const selectedPresetId = useSettingsStore((s) => s.selectedPresetId);
  const customPresets = useSettingsStore((s) => s.customPresets);
  const { t } = useTranslation();

  const active = preset ?? getPresetById(selectedPresetId, customPresets);
  const total = active.sessionsBeforeLongBreak;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label={t("pomodoro.focusSessionsUntilLongBreak", {
        current: focusCountInCycle,
        total,
      })}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-colors",
            i < focusCountInCycle ? "bg-primary" : "bg-muted",
          )}
          aria-hidden
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {t("pomodoro.untilLongBreak")}
      </span>
    </div>
  );
}

function GrowingTreeHint() {
  const trees = useFarmStore((s) => s.trees);
  const activeTreeId = useFarmStore((s) => s.activeTreeId);
  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);
  const selectedPresetId = useSettingsStore((s) => s.selectedPresetId);
  const customPresets = useSettingsStore((s) => s.customPresets);
  const { t } = useTranslation();

  const tree = trees.find((t) => t.id === activeTreeId);
  const growing = status === "running" && phase === "focus";
  const preset = getPresetById(selectedPresetId, customPresets);
  const gpPerSession = growthPointsForMinutes(preset.focusMinutes);

  if (!tree) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        <Sprout className="mr-1 inline h-4 w-4" aria-hidden />
        {t("pomodoro.noTreeGrowing")}{" "}
        <Link
          href="/farm"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {t("pomodoro.plantInFarm")}
        </Link>{" "}
        {t("pomodoro.earnGpPerSession", { gp: gpPerSession })}
      </p>
    );
  }

  const type = getTreeType(tree.typeId);
  const stage = GROWTH_STAGES[stageForGp(tree.gp, type.gpMultiplier)];

  return (
    <p className="text-center text-sm text-muted-foreground">
      <span aria-hidden>{stage.emoji}</span> {type.name} ({stage.name}){" "}
      {growing ? (
        <span className="font-medium text-primary">
          {t("pomodoro.treeGrowing", { gp: gpPerSession })}
        </span>
      ) : (
        <>{t("pomodoro.earnsGpPerSession", { gp: gpPerSession })}</>
      )}
    </p>
  );
}

export function PomodoroView() {
  const mounted = useMounted();
  const { t } = useTranslation();

  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);
  const secondsLeft = useTimerStore((s) => s.secondsLeft);
  const phaseSeconds = useTimerStore((s) => s.phaseSeconds);

  const autoStart = useSettingsStore((s) => s.autoStartNextSession);
  const playQuran = useSettingsStore((s) => s.playQuranDuringFocus);
  const setSetting = useSettingsStore((s) => s.setSetting);

  return (
    <>
      <PageHeader
        title={t("pomodoro.title")}
        description={t("pomodoro.description")}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            {mounted ? (
              <>
                <TimerDial
                  secondsLeft={secondsLeft}
                  phaseSeconds={phaseSeconds}
                  phase={phase}
                  running={status === "running"}
                />
                <TimerControls />
                <CycleDots />
                <GrowingTreeHint />
              </>
            ) : (
              <div
                className="mx-auto aspect-square w-full max-w-sm"
                aria-hidden
              />
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="auto-start" className="text-sm">
                  {t("pomodoro.autoStartNext")}
                </label>
                <Switch
                  id="auto-start"
                  checked={mounted && autoStart}
                  onCheckedChange={(v) => setSetting("autoStartNextSession", v)}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="play-quran" className="text-sm">
                  {t("pomodoro.playQuranDuringFocus")}
                </label>
                <Switch
                  id="play-quran"
                  checked={mounted && playQuran}
                  onCheckedChange={(v) => setSetting("playQuranDuringFocus", v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("pomodoro.recitation")}</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerControls />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("pomodoro.presets")}</CardTitle>
        </CardHeader>
        <CardContent>{mounted && <PresetManager />}</CardContent>
      </Card>
    </>
  );
}
