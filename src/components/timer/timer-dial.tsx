"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatClock } from "@/lib/utils";
import type { SessionPhase } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/translations/en";

const PHASE_KEYS: Record<SessionPhase, TranslationKey> = {
  focus: "pomodoro.phaseFocus",
  shortBreak: "pomodoro.phaseShortBreak",
  longBreak: "pomodoro.phaseLongBreak",
};

interface TimerDialProps {
  secondsLeft: number;
  phaseSeconds: number;
  phase: SessionPhase;
  running: boolean;
}

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerDial({
  secondsLeft,
  phaseSeconds,
  phase,
  running,
}: TimerDialProps) {
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation();
  const progress = phaseSeconds > 0 ? 1 - secondsLeft / phaseSeconds : 0;
  const phaseLabel = t(PHASE_KEYS[phase]);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-xs sm:max-w-sm"
      role="timer"
      aria-label={`${phaseLabel}: ${formatClock(secondsLeft)} remaining`}
    >
      <svg viewBox="0 0 300 300" className="h-full w-full -rotate-90">
        <circle
          cx="150"
          cy="150"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          className="stroke-muted"
        />
        <motion.circle
          cx="150"
          cy="150"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={false}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
          transition={{ duration: 0.5, ease: "linear" }}
          className={phase === "focus" ? "stroke-primary" : "stroke-accent"}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {phaseLabel}
        </span>
        <span className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
          {formatClock(secondsLeft)}
        </span>
        <motion.span
          className="text-xs text-muted-foreground"
          animate={{ opacity: running && !reduceMotion ? [1, 0.4, 1] : 1 }}
          transition={
            running && !reduceMotion
              ? { repeat: Infinity, duration: 2.5 }
              : undefined
          }
        >
          {running ? t("common.inProgress") : "\u00A0"}
        </motion.span>
      </div>
    </div>
  );
}
