/** Serializable domain model; no browser or grid-library dependencies. */
export const DASHBOARD_PANELS = [
  { id: "focus", label: "Today's focus", h: 6, w: 4 },
  { id: "streak", label: "Current streak", h: 3, w: 4 },
  { id: "pomodoros", label: "Total Pomodoros", h: 3, w: 4 },
  { id: "minutes", label: "Total focus", h: 3, w: 4 },
  { id: "orchard", label: "Orchard", h: 3, w: 4 },
  { id: "week", label: "Weekly summary", h: 5, w: 8 },
  { id: "tree", label: "Active tree", h: 7, w: 4 },
  { id: "reciter", label: "Quran player", h: 8, w: 8 },
  { id: "inspiration", label: "Daily reminder", h: 7, w: 4 },
] as const;
export type PanelId = (typeof DASHBOARD_PANELS)[number]["id"];
export interface PanelLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface DashboardPreferences {
  desktop: PanelLayout[];
  mobile: PanelLayout[];
  hidden: PanelId[];
}
export function defaultDashboard(): DashboardPreferences {
  const positions = [
    [0, 0],
    [4, 0],
    [8, 0],
    [4, 3],
    [8, 3],
    [0, 6],
    [8, 6],
    [0, 11],
    [8, 13],
  ];
  let y = 0;
  return {
    desktop: DASHBOARD_PANELS.map((p, n) => ({
      i: p.id,
      x: positions[n][0],
      y: positions[n][1],
      w: p.w,
      h: p.h,
    })),
    mobile: DASHBOARD_PANELS.map((p) => {
      const item = { i: p.id, x: 0, y, w: 1, h: p.h };
      y += p.h;
      return item;
    }),
    hidden: [],
  };
}
export function panelLimits(id: string, mode: "desktop" | "mobile") {
  const panel = DASHBOARD_PANELS.find((p) => p.id === id)!;
  const stat = panel.h === 3;
  return {
    minW: mode === "mobile" ? 1 : panel.id === "reciter" ? 6 : 4,
    maxW:
      mode === "mobile"
        ? 1
        : stat
          ? 6
          : panel.id === "week" || panel.id === "reciter"
            ? 12
            : 8,
    minH: panel.h,
    maxH: panel.h + (stat ? 1 : 3),
  };
}

/** Old or malformed snapshots cannot introduce unknown or invalid grid items. */
export function normalizeDashboard(
  value?: Partial<DashboardPreferences>,
): DashboardPreferences {
  const defaults = defaultDashboard();
  for (const mode of ["desktop", "mobile"] as const) {
    defaults[mode] = defaults[mode].map((fallback) => {
      const items = value?.[mode];
      const item = Array.isArray(items)
        ? items.find((p) => p?.i === fallback.i)
        : undefined;
      if (!item || ![item.x, item.y, item.w, item.h].every(Number.isFinite))
        return fallback;
      const cols = mode === "desktop" ? 12 : 1;
      const limits = panelLimits(fallback.i, mode);
      const w = Math.max(
        limits.minW,
        Math.min(limits.maxW, Math.round(item.w)),
      );
      return {
        i: fallback.i,
        x: Math.max(0, Math.min(cols - w, Math.round(item.x))),
        y: Math.max(0, Math.round(item.y)),
        w,
        h: Math.max(fallback.h, Math.min(limits.maxH, Math.round(item.h))),
      };
    });
  }
  defaults.hidden = DASHBOARD_PANELS.filter(
    (p) => Array.isArray(value?.hidden) && value.hidden.includes(p.id),
  ).map((p) => p.id);
  return defaults;
}
