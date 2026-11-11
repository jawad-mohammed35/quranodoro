"use client";

import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import GridLayout, {
  useContainerWidth,
  verticalCompactor,
  moveElement,
  type Layout,
} from "react-grid-layout";
import { GripVertical, X } from "lucide-react";
import {
  DASHBOARD_PANELS,
  defaultDashboard,
  panelLimits,
  normalizeDashboard,
  type PanelId,
} from "@/lib/dashboard";
import { useSettingsStore } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";

export function CustomizableDashboard({
  panels,
}: {
  panels: Record<PanelId, ReactNode>;
}) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  });
  const saved = useSettingsStore((s) => s.dashboard);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const prefs = normalizeDashboard(saved);
  const mode = width < 700 ? "mobile" : "desktop";
  const visible = prefs[mode].filter(
    (p) => !prefs.hidden.includes(p.i as PanelId),
  );
  const layout = visible.map((p) => ({
    ...p,
    ...panelLimits(p.i, mode),
  }));
  function save(next: Layout) {
    const current = normalizeDashboard(useSettingsStore.getState().dashboard);
    const changed = current[mode].map((item) => {
      const replacement = next.find((p) => p.i === item.i);
      return replacement
        ? {
            i: item.i,
            x: replacement.x,
            y: replacement.y,
            w: replacement.w,
            h: replacement.h,
          }
        : item;
    });
    setSetting("dashboard", { ...current, [mode]: changed });
  }
  function restore(id: PanelId) {
    const current = normalizeDashboard(useSettingsStore.getState().dashboard);
    if (!current.hidden.includes(id)) return;
    for (const size of ["desktop", "mobile"] as const) {
      const active = current[size].filter(
        (p) => !current.hidden.includes(p.i as PanelId),
      );
      const bottom = Math.max(0, ...active.map((p) => p.y + p.h));
      current[size] = current[size].map((p) =>
        p.i === id ? { ...p, y: bottom } : p,
      );
    }
    setSetting("dashboard", {
      ...current,
      hidden: current.hidden.filter((i) => i !== id),
    });
  }
  return (
    <div ref={containerRef} className="min-w-0 max-w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {editing
            ? "Drag a handle to move or a corner to resize. Use arrow keys on a handle to move, or Shift + arrows to resize. Changes save automatically."
            : "Your space for focus, remembrance, and growth."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {editing && (
            <>
              <Button
                variant="outline"
                aria-expanded={adding}
                onClick={() => setAdding(!adding)}
              >
                Add Widgets
              </Button>
              <Button variant="outline" onClick={() => setResetOpen(true)}>
                Reset Layout
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setEditing(!editing);
              setAdding(false);
            }}
            aria-pressed={editing}
          >
            {editing ? "Done editing" : "Edit dashboard"}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={resetOpen}
        onDismiss={() => setResetOpen(false)}
        title="Reset dashboard layout?"
        description="Restore the default widget sizes, positions and visibility on every screen size."
        onConfirm={() => {
          setSetting("dashboard", defaultDashboard());
          setAdding(false);
        }}
      />
      {editing && adding && (
        <section
          aria-label="Hidden widgets"
          className="glass-surface mb-4 flex flex-wrap items-center gap-2 rounded-card border border-border p-4"
        >
          {prefs.hidden.length ? (
            DASHBOARD_PANELS.filter((p) => prefs.hidden.includes(p.id)).map(
              (p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  onClick={() => restore(p.id)}
                >
                  Add {p.label}
                </Button>
              ),
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              All widgets are on your dashboard.
            </p>
          )}
        </section>
      )}
      {visible.length === 0 && (
        <p className="rounded-card border border-border p-8 text-center">
          All widgets are hidden. Choose Add Widgets in Edit Dashboard to
          restore them.
        </p>
      )}
      {mounted && (
        <GridLayout
          key={mode}
          width={width}
          layout={layout}
          gridConfig={{
            cols: mode === "mobile" ? 1 : 12,
            rowHeight: 32,
            margin: [16, 16],
            containerPadding: [0, 0],
          }}
          dragConfig={{
            enabled: editing,
            handle: ".panel-drag-handle",
            cancel: "button:not(.panel-drag-handle),a,input,select",
          }}
          resizeConfig={{ enabled: editing, handles: ["se"] }}
          onDragStop={(next) => save(next)}
          onResizeStop={(next) => save(next)}
        >
          {visible.map((item) => {
            const label = DASHBOARD_PANELS.find((p) => p.id === item.i)!.label;
            return (
              <div
                key={item.i}
                data-panel={item.i}
                className={`dashboard-panel ${editing ? "is-editing" : ""}`}
              >
                {editing && (
                  <div className="panel-toolbar flex items-center gap-1 rounded-t-xl bg-primary-soft px-2">
                    <button
                      className="panel-drag-handle flex min-h-10 min-w-0 flex-1 touch-none cursor-grab items-center gap-1 text-left text-xs"
                      aria-label={`Drag ${label}`}
                      onKeyDown={(e) => {
                        const dx =
                          Number(e.key === "ArrowRight") -
                          Number(e.key === "ArrowLeft");
                        const dy =
                          Number(e.key === "ArrowDown") -
                          Number(e.key === "ArrowUp");
                        if (!dx && !dy) return;
                        e.preventDefault();
                        const cols = mode === "mobile" ? 1 : 12;
                        const items = layout.map((p) => ({ ...p }));
                        const p = items.find((p) => p.i === item.i)!;
                        if (e.shiftKey) {
                          p.w = Math.max(
                            p.minW,
                            Math.min(p.maxW, cols - p.x, p.w + dx),
                          );
                          p.h = Math.max(p.minH, Math.min(p.maxH, p.h + dy));
                          save(verticalCompactor.compact(items, cols));
                        } else {
                          const moved = moveElement(
                            items,
                            p,
                            Math.max(0, Math.min(cols - p.w, p.x + dx)),
                            Math.max(0, p.y + dy),
                            true,
                            false,
                            "vertical",
                            cols,
                          );
                          save(verticalCompactor.compact(moved, cols));
                        }
                      }}
                    >
                      <GripVertical className="h-4 w-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                    <button
                      className="p-2"
                      aria-label={`Hide ${label}`}
                      onClick={() =>
                        setSetting("dashboard", {
                          ...prefs,
                          hidden: [...prefs.hidden, item.i as PanelId],
                        })
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="panel-content">{panels[item.i as PanelId]}</div>
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
}
