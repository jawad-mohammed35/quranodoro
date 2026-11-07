"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sprout } from "lucide-react";
import type { FarmTree, TreeTypeId } from "@/lib/types";
import {
  GROWTH_STAGES,
  TREE_TYPES,
  getTreeType,
  progressToNextStage,
  stageForGp,
  stageThreshold,
  totalGpToMature,
  FINAL_STAGE_INDEX,
} from "@/data/trees";
import { useFarmStore } from "@/stores/farm-store";
import {
  useSessionsStore,
  focusMinutesOn,
  pomodorosOn,
} from "@/stores/sessions-store";
import { useTimerStore } from "@/stores/timer-store";
import { useMounted } from "@/hooks/use-mounted";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TreeVisual } from "@/components/farm/tree-visual";
import { cn } from "@/lib/utils";

function ActiveTreeCard({ tree }: { tree: FarmTree }) {
  const timerStatus = useTimerStore((s) => s.status);
  const timerPhase = useTimerStore((s) => s.phase);
  const growing = timerStatus === "running" && timerPhase === "focus";
  const { t } = useTranslation();

  const type = getTreeType(tree.typeId);
  const stageIndex = stageForGp(tree.gp, type.gpMultiplier);
  const stage = GROWTH_STAGES[stageIndex];
  const progress = progressToNextStage(tree.gp, type.gpMultiplier);
  const nextThreshold =
    stageIndex < FINAL_STAGE_INDEX
      ? stageThreshold(stageIndex + 1, type.gpMultiplier)
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("farm.nowGrowing")}</CardTitle>
        <CardDescription>
          {growing ? t("farm.growingActive") : t("farm.growingIdle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <TreeVisual stageIndex={stageIndex} growing={growing} size="lg" />
        <div className="text-center">
          <p className="font-semibold">{type.name}</p>
          <p className="text-sm text-muted-foreground">
            {t("farm.stageOf", {
              current: stageIndex + 1,
              total: GROWTH_STAGES.length,
              name: stage.name,
            })}
          </p>
        </div>
        <div className="w-full max-w-sm">
          <Progress value={progress} aria-label={t("farm.progressAria")} />
          <p className="mt-1.5 text-center text-xs tabular-nums text-muted-foreground">
            {nextThreshold !== null
              ? t("farm.gpToNext", {
                  current: tree.gp,
                  next: nextThreshold,
                  stage: GROWTH_STAGES[stageIndex + 1].name,
                })
              : t("farm.fullyGrown")}
          </p>
        </div>
        {!growing && (
          <Link
            href="/pomodoro"
            className="mt-1 inline-flex h-8 items-center rounded-full bg-primary-soft px-4 text-sm font-medium transition-opacity hover:opacity-80"
          >
            {t("farm.startFocusSession")}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function PlantPicker() {
  const plantTree = useFarmStore((s) => s.plantTree);
  const setActiveTree = useFarmStore((s) => s.setActiveTree);
  const activeTreeId = useFarmStore((s) => s.activeTreeId);
  const [selected, setSelected] = useState<TreeTypeId>("deglet-noor");

  const handlePlant = () => {
    const id = plantTree(selected);
    if (!activeTreeId) setActiveTree(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plant a new tree</CardTitle>
        <CardDescription>
          Each variety matures at its own pace — rarer dates take more focus.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {TREE_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              aria-pressed={selected === t.id}
              className={cn(
                "flex flex-col gap-1 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                selected === t.id
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:bg-muted",
              )}
            >
              <span className="flex items-center justify-between text-sm font-medium">
                <span>{t.name}</span>
                {selected === t.id && (
                  <Check className="h-4 w-4 text-primary" aria-hidden />
                )}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {t.description}
              </span>
              <span className="text-xs font-medium text-accent-foreground">
                {totalGpToMature(t.gpMultiplier)} GP to fully mature
              </span>
            </button>
          ))}
        </div>
        <Button onClick={handlePlant} className="self-start">
          <Sprout className="h-4 w-4" aria-hidden /> Plant{" "}
          {getTreeType(selected).name}
        </Button>
      </CardContent>
    </Card>
  );
}

function Orchard() {
  const trees = useFarmStore((s) => s.trees);
  const activeTreeId = useFarmStore((s) => s.activeTreeId);
  const setActiveTree = useFarmStore((s) => s.setActiveTree);

  if (trees.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Your farm is empty. Plant your first date tree below, then complete
          focus sessions to watch it grow.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {trees.map((tree) => {
        const type = getTreeType(tree.typeId);
        const stageIndex = stageForGp(tree.gp, type.gpMultiplier);
        const isActive = tree.id === activeTreeId;
        const matured = Boolean(tree.maturedAt);

        return (
          <motion.button
            key={tree.id}
            type="button"
            layout
            onClick={() => !matured && setActiveTree(tree.id)}
            disabled={matured}
            aria-pressed={isActive}
            aria-label={
              matured
                ? `${type.name}, fully grown`
                : `${type.name}, ${GROWTH_STAGES[stageIndex].name}. ${isActive ? "Currently growing." : "Select to grow."}`
            }
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              matured
                ? "cursor-default border-border bg-card"
                : isActive
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:bg-muted",
            )}
          >
            <TreeVisual stageIndex={stageIndex} />
            <span className="text-sm font-medium">{type.name}</span>
            <span className="text-xs text-muted-foreground">
              {matured ? "Fully grown 🎉" : GROWTH_STAGES[stageIndex].name}
            </span>
            {isActive && !matured && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                Growing
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function FarmView() {
  const mounted = useMounted();
  const { t } = useTranslation();
  const trees = useFarmStore((s) => s.trees);
  const activeTreeId = useFarmStore((s) => s.activeTreeId);
  const activeTree = trees.find((t) => t.id === activeTreeId);
  const sessions = useSessionsStore((s) => s.sessions);
  const todayMinutes = focusMinutesOn(sessions, new Date());
  const todaySessions = pomodorosOn(sessions, new Date());

  return (
    <>
      <PageHeader title={t("farm.title")} description={t("farm.description")}>
        <Link
          href="/about-farm"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("farm.learnMore")}
        </Link>
      </PageHeader>

      {mounted && (
        <div className="flex flex-col gap-6">
          <Card className="border-primary/20 bg-primary-soft/40">
            <CardContent className="pt-6">
              <p className="text-sm font-medium">
                Today&apos;s growth: {todaySessions} focus{" "}
                {todaySessions === 1 ? "session" : "sessions"} · {todayMinutes}{" "}
                minutes
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete a focus session to grow your active tree. A 25-minute
                session earns 10 growth points. Plant or select a growing tree
                before focusing; mature trees stay in your orchard.
              </p>
            </CardContent>
          </Card>
          {activeTree && <ActiveTreeCard tree={activeTree} />}

          <section aria-label="Your orchard">
            <h2 className="mb-3 text-lg font-semibold">
              {t("farm.yourOrchard")}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({trees.filter((t) => t.maturedAt).length} mature ·{" "}
                {trees.length} total)
              </span>
            </h2>
            <Orchard />
          </section>

          <PlantPicker />
        </div>
      )}
    </>
  );
}
