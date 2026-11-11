"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RotateCcw, Sparkles, Target } from "lucide-react";
import {
  useTasbihStore,
  tasbihCompletedToday,
  tasbihCompletedLastNDays,
  totalTasbihSessions,
  DEFAULT_TASBIH_TARGET,
} from "@/stores/tasbih-store";
import { useMounted } from "@/hooks/use-mounted";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRESET_TARGETS = [33, 99, 100] as const;

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-muted/60 px-4 py-5 text-center">
      <span className="text-3xl font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function TasbihView() {
  const mounted = useMounted();
  const { t } = useTranslation();

  const count = useTasbihStore((s) => s.count);
  const phrase = useTasbihStore((s) => s.phrase);
  const feedback = useTasbihStore((s) => s.feedback);
  const [resetOpen, setResetOpen] = useState(false);
  const target = useTasbihStore((s) => s.target);
  const justCompleted = useTasbihStore((s) => s.justCompleted);
  const completedSessions = useTasbihStore((s) => s.completedSessions);
  const increment = useTasbihStore((s) => s.increment);
  const reset = useTasbihStore((s) => s.reset);
  const setTarget = useTasbihStore((s) => s.setTarget);
  const dismissCompletion = useTasbihStore((s) => s.dismissCompletion);

  const [customValue, setCustomValue] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    if (!justCompleted) return;
    const timer = setTimeout(dismissCompletion, 4000);
    return () => clearTimeout(timer);
  }, [justCompleted, dismissCompletion]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(customValue);
    if (!Number.isFinite(value) || value < 1) return;
    setTarget(value);
    setShowCustom(false);
    setCustomValue("");
  };

  const progress = target > 0 ? Math.min(1, count / target) : 0;

  return (
    <>
      <ConfirmDialog
        open={resetOpen}
        onDismiss={() => setResetOpen(false)}
        onConfirm={reset}
        title="Reset counter?"
        description="Your current count will return to zero. Your completed dhikr history will be kept."
      />
      <PageHeader
        title={t("tasbih.title")}
        description={t("tasbih.description")}
      />

      {mounted && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-8 py-10 sm:py-14">
              <div className="flex w-full max-w-sm flex-col gap-2">
                <Label htmlFor="dhikr-phrase">Dhikr phrase</Label>
                <Input
                  id="dhikr-phrase"
                  list="dhikr-phrases"
                  maxLength={160}
                  value={phrase}
                  onChange={(e) =>
                    useTasbihStore.setState({ phrase: e.target.value })
                  }
                  onBlur={() => useTasbihStore.getState().setPhrase(phrase)}
                />
                <datalist id="dhikr-phrases">
                  <option value="SubhanAllah" />
                  <option value="Alhamdulillah" />
                  <option value="Allahu Akbar" />
                  <option value="La ilaha illallah" />
                  <option value="Astaghfirullah" />
                </datalist>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={feedback}
                    onChange={(e) =>
                      useTasbihStore.getState().setFeedback(e.target.checked)
                    }
                  />
                  Vibration feedback (supported devices)
                </label>
              </div>
              <div className="relative flex items-center justify-center">
                <AnimatePresence>
                  {justCompleted && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      {[...Array(8)].map((_, i) => (
                        <motion.span
                          key={i}
                          className="absolute h-2 w-2 rounded-full bg-primary"
                          initial={{ opacity: 1, scale: 1 }}
                          animate={{
                            opacity: 0,
                            scale: 0,
                            x: Math.cos((i / 8) * Math.PI * 2) * 120,
                            y: Math.sin((i / 8) * Math.PI * 2) * 120,
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  onClick={() => {
                    increment();
                    if (feedback && navigator.vibrate) navigator.vibrate(15);
                  }}
                  aria-label={t("common.tapToCount")}
                  className={cn(
                    "relative flex h-56 w-56 flex-col items-center justify-center rounded-full border-4 transition-colors sm:h-64 sm:w-64",
                    "border-primary/30 bg-primary-soft/50 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ring",
                    justCompleted && "border-primary bg-primary-soft",
                  )}
                  whileTap={{ scale: 0.96 }}
                >
                  <svg
                    className="absolute inset-0 h-full w-full -rotate-90"
                    viewBox="0 0 100 100"
                    aria-hidden
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-border"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="text-primary transition-all duration-300"
                      strokeDasharray={`${progress * 289} 289`}
                    />
                  </svg>

                  <AnimatePresence mode="wait">
                    {justCompleted ? (
                      <motion.div
                        key="complete"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="relative z-10 flex flex-col items-center gap-1 px-4 text-center"
                      >
                        <Sparkles
                          className="h-6 w-6 text-primary"
                          aria-hidden
                        />
                        <span className="text-lg font-semibold">
                          {t("tasbih.sessionComplete")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("tasbih.mayAllahAccept")}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="count"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 flex flex-col items-center"
                      >
                        <span className="text-6xl font-semibold tabular-nums sm:text-7xl">
                          {count}
                        </span>
                        <span className="mt-1 text-sm text-muted-foreground">
                          {t("tasbih.countOfTarget", { count, target })}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {PRESET_TARGETS.map((preset) => (
                  <Button
                    key={preset}
                    variant={
                      target === preset && !showCustom ? "primary" : "outline"
                    }
                    size="sm"
                    className="min-w-14 rounded-full"
                    onClick={() => {
                      setTarget(preset);
                      setShowCustom(false);
                    }}
                  >
                    {preset}
                  </Button>
                ))}
                <Button
                  variant={showCustom ? "primary" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setShowCustom((v) => !v)}
                >
                  <Target className="h-3.5 w-3.5" aria-hidden />
                  {t("common.custom")}
                </Button>
              </div>

              <AnimatePresence>
                {showCustom && (
                  <motion.form
                    onSubmit={handleCustomSubmit}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex w-full max-w-xs flex-col gap-2 overflow-hidden"
                  >
                    <Label htmlFor="tasbih-custom-target">
                      {t("tasbih.customTarget")}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="tasbih-custom-target"
                        type="number"
                        min={1}
                        max={9999}
                        placeholder={t("tasbih.customTargetPlaceholder")}
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                      />
                      <Button type="submit">{t("tasbih.setTarget")}</Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResetOpen(true)}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  {t("tasbih.resetCounter")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResetOpen(true)}
                >
                  {t("tasbih.startNewSession")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("common.total")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatBox
                  label={t("tasbih.statsToday")}
                  value={String(tasbihCompletedToday(completedSessions))}
                />
                <StatBox
                  label={t("tasbih.statsWeek")}
                  value={String(tasbihCompletedLastNDays(completedSessions, 7))}
                />
                <StatBox
                  label={t("tasbih.statsTotal")}
                  value={String(totalTasbihSessions(completedSessions))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Re-export for tests / defaults
export { DEFAULT_TASBIH_TARGET };
