"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useSessionsStore,
  averageSessionMinutes,
  currentStreak,
  lastNDays,
  lastNMonths,
} from "@/stores/sessions-store";
import { useMounted } from "@/hooks/use-mounted";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";

const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: -16 };

function useCssVar(name: string, fallback: string): string {
  // Charts render client-side only (gated by useMounted), so reading the
  // computed style here is safe and keeps chart colors in sync with themes.
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return value.trim() || fallback;
}

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string }[];
  label?: string;
  format?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-card">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          {entry.name}:{" "}
          <span className="font-medium text-foreground">
            {format ? format(Number(entry.value)) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function AnalyticsView() {
  const mounted = useMounted();
  const sessions = useSessionsStore((s) => s.sessions);

  const primary = useCssVar("--primary", "#6b9071");
  const accent = useCssVar("--accent", "#a8ab7c");
  const border = useCssVar("--border", "#e7e3d7");
  const mutedFg = useCssVar("--muted-foreground", "#7b8474");

  const weekly = useMemo(
    () =>
      lastNDays(sessions, 7).map((d) => ({
        ...d,
        label: new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
          weekday: "short",
        }),
        focusHours: Number((d.focusMinutes / 60).toFixed(2)),
      })),
    [sessions],
  );

  const monthly = useMemo(
    () =>
      lastNMonths(sessions, 12).map((m) => ({
        ...m,
        label: new Date(`${m.month}-01T00:00:00`).toLocaleDateString(undefined, {
          month: "short",
        }),
        focusHours: Number((m.focusMinutes / 60).toFixed(1)),
      })),
    [sessions],
  );

  const streakHistory = useMemo(() => {
    // Rolling streak value over the last 30 days.
    const days = lastNDays(sessions, 30);
    const result: { label: string; streak: number }[] = [];
    for (const d of days) {
      const prev = result.length > 0 ? result[result.length - 1].streak : 0;
      result.push({
        label: new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        }),
        streak: d.pomodoros > 0 ? prev + 1 : 0,
      });
    }
    return result;
  }, [sessions]);

  const axisProps = {
    stroke: mutedFg,
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  } as const;

  if (!mounted) {
    return <PageHeader title="Analytics" description="Loading your statistics…" />;
  }

  const weekMinutes = weekly.reduce((sum, d) => sum + d.focusMinutes, 0);
  const weekPomodoros = weekly.reduce((sum, d) => sum + d.pomodoros, 0);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Your focus, visualized. All times count completed focus sessions only."
      />

      <div className="flex flex-col gap-6">
        {/* Headline numbers */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "This week", value: formatDuration(weekMinutes) },
            { label: "Pomodoros this week", value: String(weekPomodoros) },
            {
              label: "Avg session length",
              value: `${Math.round(averageSessionMinutes(sessions))}m`,
            },
            { label: "Current streak", value: `${currentStreak(sessions)}d` },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Focus hours — last 7 days</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip
                    content={<ChartTooltip format={(v) => `${v} h`} />}
                    cursor={{ fill: border, opacity: 0.4 }}
                  />
                  <Bar
                    dataKey="focusHours"
                    name="Focus hours"
                    fill={primary}
                    radius={[6, 6, 0, 0]}
                    animationDuration={700}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pomodoros — last 7 days</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: border, opacity: 0.4 }}
                  />
                  <Bar
                    dataKey="pomodoros"
                    name="Pomodoros"
                    fill={accent}
                    radius={[6, 6, 0, 0]}
                    animationDuration={700}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly study time — last 12 months</CardTitle>
            <CardDescription>
              Total completed focus hours per month. This doubles as your yearly overview.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip content={<ChartTooltip format={(v) => `${v} h`} />} />
                <Area
                  type="monotone"
                  dataKey="focusHours"
                  name="Focus hours"
                  stroke={primary}
                  strokeWidth={2}
                  fill="url(#focusGradient)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Streak history */}
        <Card>
          <CardHeader>
            <CardTitle>Streak history — last 30 days</CardTitle>
            <CardDescription>How your daily consistency has built up.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={streakHistory} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />
                <XAxis dataKey="label" {...axisProps} interval={4} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip content={<ChartTooltip format={(v) => `${v} days`} />} />
                <Line
                  type="stepAfter"
                  dataKey="streak"
                  name="Streak"
                  stroke={primary}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {sessions.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No sessions yet — complete your first Pomodoro and your charts will
            come to life.
          </p>
        )}
      </div>
    </>
  );
}
