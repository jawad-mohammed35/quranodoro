import type { Metadata } from "next";
import Link from "next/link";
import { GROWTH_STAGES, TREE_TYPES, growthPointsForMinutes } from "@/data/trees";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "About Date Farm" };

const EXAMPLE_SESSIONS = [25, 40, 50, 60, 90];

export default function AboutFarmPage() {
  return (
    <>
      <PageHeader
        title="About the Date Farm"
        description="Exactly how your focus turns into a growing orchard — no hidden math."
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>The idea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              Your farm rewards steady, honest focus. You may own many trees,
              but <strong>only one tree grows at a time</strong> — the one you
              select in your farm. Growth happens through Pomodoro focus
              sessions: when a focus session completes, your active tree earns
              Growth Points (GP).
            </p>
            <p>
              When a tree reaches its final stage, it becomes a permanent part
              of your orchard, and you choose the next tree to grow. Over
              weeks and months, your orchard becomes a picture of your
              consistency.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earning Growth Points</CardTitle>
            <CardDescription>
              GP scales with focus length — roughly 0.4 GP per minute, with
              gently diminishing returns past an hour to encourage healthy
              breaks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Focus session</th>
                    <th className="py-2 font-medium">GP earned</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLE_SESSIONS.map((minutes) => (
                    <tr key={minutes} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-4">{minutes} minutes</td>
                      <td className="py-2 tabular-nums">
                        +{growthPointsForMinutes(minutes)} GP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Only <em>completed</em> focus sessions earn GP — abandoned
              sessions don&apos;t count, so finish what you start. Breaks never
              earn GP.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth stages</CardTitle>
            <CardDescription>
              Every tree passes through seven stages. The GP shown is the
              baseline; each variety multiplies it (see below).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {GROWTH_STAGES.map((stage) => (
                <li
                  key={stage.index}
                  className="flex items-center gap-3 rounded-2xl border border-border p-3"
                >
                  <span className="text-2xl" aria-hidden>
                    {stage.emoji}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">
                      {stage.index + 1}. {stage.name}
                    </span>
                    <span className="block text-xs tabular-nums text-muted-foreground">
                      {stage.cumulativeGp} GP total
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tree varieties</CardTitle>
            <CardDescription>
              Rarer dates grow slower. A variety&apos;s multiplier scales every
              stage threshold, so an Ajwa (×1.5) needs 570 GP to fully mature
              while a Barhi (×0.8) needs just 304 GP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Variety</th>
                    <th className="py-2 pr-4 font-medium">Multiplier</th>
                    <th className="py-2 pr-4 font-medium">GP to mature</th>
                    <th className="py-2 font-medium">≈ Classic Pomodoros (25 min)</th>
                  </tr>
                </thead>
                <tbody>
                  {TREE_TYPES.map((t) => {
                    const total = Math.round(
                      GROWTH_STAGES[GROWTH_STAGES.length - 1].cumulativeGp * t.gpMultiplier,
                    );
                    return (
                      <tr key={t.id} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-4 font-medium">{t.name}</td>
                        <td className="py-2 pr-4 tabular-nums">×{t.gpMultiplier}</td>
                        <td className="py-2 pr-4 tabular-nums">{total} GP</td>
                        <td className="py-2 tabular-nums">
                          ~{Math.ceil(total / growthPointsForMinutes(25))} sessions
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              <li>One active tree at a time; switch anytime from your farm.</li>
              <li>GP is awarded the moment a focus session completes.</li>
              <li>Mature trees are permanent — they can never be lost.</li>
              <li>Breaks, pauses, and stopped sessions earn nothing.</li>
              <li>Your orchard grows forever; there is no limit to the trees you can own.</li>
            </ul>
            <p className="mt-4 text-sm">
              Ready to plant?{" "}
              <Link href="/farm" className="font-medium text-primary underline-offset-4 hover:underline">
                Visit your farm →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
