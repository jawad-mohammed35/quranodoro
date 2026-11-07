"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import GridLayout, { useContainerWidth, type Layout } from "react-grid-layout";
import { GripVertical, X, ArrowUp, ArrowDown } from "lucide-react";
import {
  DASHBOARD_PANELS,
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
    minW: mode === "mobile" ? 1 : 4,
    minH: DASHBOARD_PANELS.find((d) => d.id === p.i)!.h,
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
  function move(id: string, direction: number) {
    const sorted = [...visible].sort((a, b) => a.y - b.y || a.x - b.x);
    const index = sorted.findIndex((p) => p.i === id);
    const other = sorted[index + direction];
    if (!other) return;
    [sorted[index], sorted[index + direction]] = [other, sorted[index]];
    let y = 0;
    save(
      sorted.map((p) => {
        const item = { ...p, x: 0, y };
        y += p.h;
        return item;
      }),
    );
  }
  return (
    <div ref={containerRef} className="min-w-0 max-w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {editing
            ? "Drag a handle to move; drag a corner to resize. On a focused handle, use Shift + arrow keys to resize. Changes save automatically."
            : "Your space for focus, remembrance, and growth."}
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/settings#dashboard"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Panel settings
          </Link>
          <Button
            variant="outline"
            onClick={() => setEditing(!editing)}
            aria-pressed={editing}
          >
            {editing ? "Done editing" : "Edit dashboard"}
          </Button>
        </div>
      </div>
      {visible.length === 0 && (
        <p className="rounded-card border border-border p-8 text-center">
          All panels are hidden. Restore them in{" "}
          <Link href="/settings#dashboard" className="text-primary underline">
            Settings
          </Link>
          .
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
                        if (
                          !e.shiftKey ||
                          ![
                            "ArrowUp",
                            "ArrowDown",
                            "ArrowLeft",
                            "ArrowRight",
                          ].includes(e.key)
                        )
                          return;
                        e.preventDefault();
                        save(
                          visible.map((p) =>
                            p.i !== item.i
                              ? p
                              : {
                                  ...p,
                                  w: Math.max(
                                    mode === "mobile" ? 1 : 4,
                                    Math.min(
                                      mode === "mobile" ? 1 : 12,
                                      p.w +
                                        (e.key === "ArrowRight"
                                          ? 1
                                          : e.key === "ArrowLeft"
                                            ? -1
                                            : 0),
                                    ),
                                  ),
                                  h: Math.max(
                                    DASHBOARD_PANELS.find((d) => d.id === p.i)!
                                      .h,
                                    p.h +
                                      (e.key === "ArrowDown"
                                        ? 1
                                        : e.key === "ArrowUp"
                                          ? -1
                                          : 0),
                                  ),
                                },
                          ),
                        );
                      }}
                    >
                      <GripVertical className="h-4 w-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                    <button
                      className="p-2"
                      aria-label={`Move ${label} earlier`}
                      onClick={() => move(item.i, -1)}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      className="p-2"
                      aria-label={`Move ${label} later`}
                      onClick={() => move(item.i, 1)}
                    >
                      <ArrowDown size={16} />
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
