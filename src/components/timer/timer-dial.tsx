"use client";

import { motion } from "framer-motion";
import { formatClock } from "@/lib/utils";
import type { SessionPhase } from "@/lib/types";

const PHASE_LABELS: Record<SessionPhase, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

interface TimerDialProps {
  secondsLeft: number;
  phaseSeconds: number;
  phase: SessionPhase;
  running: boolean;
}

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerDial({ secondsLeft, phaseSeconds, phase, running }: TimerDialProps) {
  const progress = phaseSeconds > 0 ? 1 - secondsLeft / phaseSeconds : 0;

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-xs sm:max-w-sm"
      role="timer"
      aria-label={`${PHASE_LABELS[phase]}: ${formatClock(secondsLeft)} remaining`}
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
          {PHASE_LABELS[phase]}
        </span>
        <span className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
          {formatClock(secondsLeft)}
        </span>
        <motion.span
          className="text-xs text-muted-foreground"
          animate={{ opacity: running ? [1, 0.4, 1] : 1 }}
          transition={running ? { repeat: Infinity, duration: 2.5 } : undefined}
        >
          {running ? "in progress" : "\u00A0"}
        </motion.span>
      </div>
    </div>
  );
}
