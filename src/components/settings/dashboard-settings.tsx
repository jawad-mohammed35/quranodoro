"use client";
import Link from "next/link";
import {
  DASHBOARD_PANELS,
  defaultDashboard,
  normalizeDashboard,
} from "@/lib/dashboard";
import { useSettingsStore } from "@/stores/settings-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export function DashboardSettings() {
  const dashboard = useSettingsStore((s) => s.dashboard);
  const set = useSettingsStore((s) => s.setSetting);
  const prefs = normalizeDashboard(dashboard);
  return (
    <Card id="dashboard" className="scroll-mt-20">
      <CardHeader>
        <CardTitle>Dashboard customization</CardTitle>
        <CardDescription>
          Choose your panels, then open the dashboard to drag and resize them.
          Desktop and mobile arrangements save separately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {DASHBOARD_PANELS.map((p) => (
            <label
              key={p.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-3"
            >
              <input
                type="checkbox"
                checked={!prefs.hidden.includes(p.id)}
                onChange={(e) =>
                  set("dashboard", {
                    ...prefs,
                    hidden: e.target.checked
                      ? prefs.hidden.filter((id) => id !== p.id)
                      : [...prefs.hidden, p.id],
                  })
                }
                className="h-4 w-4 accent-primary"
              />
              {p.label}
            </label>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link href="/" className="text-sm font-medium text-primary underline">
            Arrange dashboard
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              if (
                window.confirm(
                  "Restore the default dashboard layout and show all panels? Your progress will be kept.",
                )
              )
                set("dashboard", defaultDashboard());
            }}
          >
            Restore default layout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
