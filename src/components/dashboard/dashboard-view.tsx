"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Flame, Headphones, Target, TreePalm } from "lucide-react";
import {
  useSessionsStore,
  currentStreak,
  focusMinutesOn,
  lastNDays,
  pomodorosOn,
  totalFocusMinutes,
  totalPomodoros,
} from "@/stores/sessions-store";
import { useFarmStore } from "@/stores/farm-store";
import { useSettingsStore } from "@/stores/settings-store";
import { getReciter } from "@/data/reciters";
import { GROWTH_STAGES, getTreeType, progressToNextStage, stageForGp } from "@/data/trees";
import { useMounted } from "@/hooks/use-mounted";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TreeVisual } from "@/components/farm/tree-visual";
import { InspirationWidget } from "@/components/dashboard/inspiration-widget";
import { PlayerControls } from "@/components/quran/player-controls";
import { formatDuration } from "@/lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardContent className="flex items-start gap-3 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <Icon className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
            <span className="block truncate text-xl font-semibold tabular-nums">{value}</span>
            {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TodaysFocusCard() {
  const sessions = useSessionsStore((s) => s.sessions);
  const today = new Date();
  const minutes = focusMinutesOn(sessions, today);
  const pomodoros = pomodorosOn(sessions, today);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
              <Clock className="h-5 w-5 text-primary" aria-hidden />
            </span>
            Today&apos;s focus
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-5xl font-semibold tabular-nums tracking-tight">
            {formatDuration(minutes)}
          </p>
          <p className="text-sm text-muted-foreground">
            {pomodoros} {pomodoros === 1 ? "Pomodoro" : "Pomodoros"} completed today
          </p>
          <Link
            href="/pomodoro"
            className="inline-flex h-10 w-fit items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {pomodoros > 0 ? "Keep going" : "Start your first session"}
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FavoriteReciterCard() {
  const favoriteReciterId = useSettingsStore((s) => s.favoriteReciterId);
  const reciterId = useSettingsStore((s) => s.reciterId);
  const reciter = getReciter(favoriteReciterId ?? reciterId);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
            <Headphones className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <div>
            <CardTitle>Favorite reciter</CardTitle>
            <CardDescription>{reciter.name}</CardDescription>
          </div>
        </div>
        <p className="font-arabic text-xl text-muted-foreground" dir="rtl" lang="ar">
          {reciter.arabicName}
        </p>
      </CardHeader>
      <CardContent>
        <PlayerControls compact />
      </CardContent>
    </Card>
  );
}

function WeeklySummary() {
  const sessions = useSessionsStore((s) => s.sessions);
  const week = lastNDays(sessions, 7);
  const max = Math.max(...week.map((d) => d.focusMinutes), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>
          {formatDuration(week.reduce((sum, d) => sum + d.focusMinutes, 0))} focused ·{" "}
          {week.reduce((sum, d) => sum + d.pomodoros, 0)} Pomodoros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2" aria-hidden>
          {week.map((day) => {
            const date = new Date(`${day.date}T00:00:00`);
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                <motion.div
                  className="w-full max-w-8 rounded-t-md bg-primary/80"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, (day.focusMinutes / max) * 96)}px` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  title={`${day.date}: ${formatDuration(day.focusMinutes)}`}
                />
                <span className="text-[10px] text-muted-foreground">
                  {date.toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
        <p className="sr-only">
          Daily focus this week:{" "}
          {week.map((d) => `${d.date}: ${d.focusMinutes} minutes`).join(", ")}
        </p>
        <Link
          href="/analytics"
          className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Full analytics →
        </Link>
      </CardContent>
    </Card>
  );
}

function ActiveTreeWidget() {
  const trees = useFarmStore((s) => s.trees);
  const activeTreeId = useFarmStore((s) => s.activeTreeId);
  const tree = trees.find((t) => t.id === activeTreeId);
  const matureCount = trees.filter((t) => t.maturedAt).length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Date farm</CardTitle>
        <CardDescription>
          {matureCount} mature {matureCount === 1 ? "tree" : "trees"} · {trees.length} planted
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        {tree ? (
          (() => {
            const type = getTreeType(tree.typeId);
            const stageIndex = stageForGp(tree.gp, type.gpMultiplier);
            return (
              <>
                <TreeVisual stageIndex={stageIndex} />
                <p className="text-sm font-medium">
                  {type.name} — {GROWTH_STAGES[stageIndex].name}
                </p>
                <div className="w-full max-w-xs">
                  <Progress
                    value={progressToNextStage(tree.gp, type.gpMultiplier)}
                    aria-label="Active tree progress to next stage"
                  />
                </div>
              </>
            );
          })()
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No tree is growing right now.
          </p>
        )}
        <Link
          href="/farm"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {tree ? "Visit your farm →" : "Plant a tree →"}
        </Link>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const mounted = useMounted();
  const { user } = useAuth();

  const sessions = useSessionsStore((s) => s.sessions);
  const displayName = useSettingsStore((s) => s.displayName);
  const trees = useFarmStore((s) => s.trees);

  const greetingName =
    (mounted && displayName.trim()) || user?.email?.split("@")[0] || "";
  const streak = currentStreak(sessions);

  return (
    <>
      <PageHeader
        title={greetingName ? `Assalamu alaikum, ${greetingName}` : "Assalamu alaikum"}
        description="Here's how your focus is growing."
      >
        <Link
          href="/pomodoro"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Start focusing
        </Link>
      </PageHeader>

      {mounted && (
        <div className="flex flex-col gap-6">
          {/* Today's focus (large) + supporting stats */}
          <div className="grid gap-4 lg:grid-cols-3">
            <TodaysFocusCard />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
              <StatCard
                index={1}
                icon={Flame}
                label="Current streak"
                value={`${streak} ${streak === 1 ? "day" : "days"}`}
              />
              <StatCard
                index={2}
                icon={Target}
                label="Total Pomodoros"
                value={String(totalPomodoros(sessions))}
              />
              <StatCard
                index={3}
                icon={CalendarDays}
                label="Total focus"
                value={formatDuration(totalFocusMinutes(sessions))}
              />
              <StatCard
                index={4}
                icon={TreePalm}
                label="Orchard"
                value={String(trees.filter((t) => t.maturedAt).length)}
                hint="mature trees"
              />
            </div>
          </div>

          {/* This week + farm, then the reciter player beneath This week */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <WeeklySummary />
              <FavoriteReciterCard />
            </div>
            <div className="flex flex-col gap-6">
              <ActiveTreeWidget />
              <InspirationWidget />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
