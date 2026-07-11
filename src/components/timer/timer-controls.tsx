"use client";

import { Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import { useTimerStore } from "@/stores/timer-store";
import { Button } from "@/components/ui/button";

export function TimerControls() {
  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);
  const { start, pause, resume, stop, reset, skipBreak } = useTimerStore.getState();

  const inBreak = phase !== "focus";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {status === "idle" && (
        <Button size="lg" onClick={start} className="min-w-36">
          <Play className="h-5 w-5" aria-hidden /> Start focus
        </Button>
      )}

      {status === "running" && (
        <Button size="lg" onClick={pause} className="min-w-36">
          <Pause className="h-5 w-5" aria-hidden /> Pause
        </Button>
      )}

      {(status === "paused" || status === "finished") && (
        <Button size="lg" onClick={resume} className="min-w-36">
          <Play className="h-5 w-5" aria-hidden />
          {status === "paused" ? "Resume" : inBreak ? "Start break" : "Start focus"}
        </Button>
      )}

      {status !== "idle" && (
        <>
          {inBreak && (
            <Button variant="secondary" size="lg" onClick={skipBreak}>
              <SkipForward className="h-5 w-5" aria-hidden /> Skip break
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={reset} aria-label="Reset current phase">
            <RotateCcw className="h-5 w-5" aria-hidden /> Reset
          </Button>
          <Button variant="ghost" size="lg" onClick={stop} aria-label="Stop and end cycle">
            <Square className="h-5 w-5" aria-hidden /> Stop
          </Button>
        </>
      )}
    </div>
  );
}
