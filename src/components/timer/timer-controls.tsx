"use client";

import { Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import { useTimerStore } from "@/stores/timer-store";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function TimerControls() {
  const { t } = useTranslation();
  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);
  const { start, pause, resume, stop, reset, skipBreak } = useTimerStore.getState();

  const inBreak = phase !== "focus";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {status === "idle" && (
        <Button size="lg" onClick={start} className="min-w-36">
          <Play className="h-5 w-5" aria-hidden /> {t("common.startFocus")}
        </Button>
      )}

      {status === "running" && (
        <Button size="lg" onClick={pause} className="min-w-36">
          <Pause className="h-5 w-5" aria-hidden /> {t("common.pause")}
        </Button>
      )}

      {(status === "paused" || status === "finished") && (
        <Button size="lg" onClick={resume} className="min-w-36">
          <Play className="h-5 w-5" aria-hidden />
          {status === "paused"
            ? t("common.resume")
            : inBreak
              ? t("common.startBreak")
              : t("common.startFocus")}
        </Button>
      )}

      {status !== "idle" && (
        <>
          {inBreak && (
            <Button variant="secondary" size="lg" onClick={skipBreak}>
              <SkipForward className="h-5 w-5" aria-hidden /> {t("common.skipBreak")}
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={reset} aria-label={t("common.reset")}>
            <RotateCcw className="h-5 w-5" aria-hidden /> {t("common.reset")}
          </Button>
          <Button variant="ghost" size="lg" onClick={stop} aria-label={t("common.stop")}>
            <Square className="h-5 w-5" aria-hidden /> {t("common.stop")}
          </Button>
        </>
      )}
    </div>
  );
}
