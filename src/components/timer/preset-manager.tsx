"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BUILT_IN_PRESETS } from "@/data/presets";
import { useSettingsStore } from "@/stores/settings-store";
import { useTimerStore } from "@/stores/timer-store";
import { useTranslation, formatPresetDetail } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function PresetChip({
  id,
  name,
  detail,
  selected,
  onSelect,
  onDelete,
  deleteLabel,
}: {
  id: string;
  name: string;
  detail: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  deleteLabel: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex min-w-[11rem] max-w-full flex-col rounded-2xl border transition-colors sm:min-w-[14rem]",
        selected
          ? "border-primary bg-primary-soft"
          : "border-border bg-card hover:bg-muted",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(id)}
        aria-pressed={selected}
        className="flex w-full flex-col items-start rounded-2xl px-3.5 py-3 text-left focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="text-sm font-medium">{name}</span>
        <span className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {detail}
        </span>
      </button>
      {onDelete && (
        <button
          type="button"
          aria-label={deleteLabel}
          onClick={() => onDelete(id)}
          className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function PresetManager() {
  const { t, language } = useTranslation();
  const selectedPresetId = useSettingsStore((s) => s.selectedPresetId);
  const customPresets = useSettingsStore((s) => s.customPresets);
  const selectPreset = useSettingsStore((s) => s.selectPreset);
  const addCustomPreset = useSettingsStore((s) => s.addCustomPreset);
  const removeCustomPreset = useSettingsStore((s) => s.removeCustomPreset);
  const timerStatus = useTimerStore((s) => s.status);
  const syncPreset = useTimerStore((s) => s.syncPreset);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
  });

  const handleSelect = (id: string) => {
    selectPreset(id);
    queueMicrotask(syncPreset);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addCustomPreset({ ...form, name: form.name.trim() });
    queueMicrotask(syncPreset);
    setShowForm(false);
    setForm({
      name: "",
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      sessionsBeforeLongBreak: 4,
    });
  };

  const numberField = (
    label: string,
    key: keyof Omit<typeof form, "name">,
    min: number,
    max: number,
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`preset-${key}`}>{label}</Label>
      <Input
        id={`preset-${key}`}
        type="number"
        min={min}
        max={max}
        required
        value={form[key]}
        onChange={(e) =>
          setForm((f) => ({ ...f, [key]: Number(e.target.value) }))
        }
      />
    </div>
  );

  return (
    <div className="@container flex flex-col gap-4">
      {timerStatus !== "idle" && (
        <p className="text-xs text-muted-foreground">
          {t("pomodoro.presetChangesIdle")}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {BUILT_IN_PRESETS.map((p) => (
          <PresetChip
            key={p.id}
            id={p.id}
            name={p.name}
            detail={formatPresetDetail(language, p)}
            selected={selectedPresetId === p.id}
            onSelect={handleSelect}
            deleteLabel={t("pomodoro.deletePreset", { name: p.name })}
          />
        ))}
        {customPresets.map((p) => (
          <PresetChip
            key={p.id}
            id={p.id}
            name={p.name}
            detail={formatPresetDetail(language, p)}
            selected={selectedPresetId === p.id}
            onSelect={handleSelect}
            onDelete={removeCustomPreset}
            deleteLabel={t("pomodoro.deletePreset", { name: p.name })}
          />
        ))}
        <Button
          variant="outline"
          className="h-auto min-h-[3.5rem] rounded-2xl px-4"
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
        >
          <Plus className="h-4 w-4" aria-hidden /> {t("pomodoro.customPreset")}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleCreate}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-muted/50 p-4 @sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 @sm:col-span-2">
                <Label htmlFor="preset-name">{t("pomodoro.presetName")}</Label>
                <Input
                  id="preset-name"
                  placeholder={t("pomodoro.presetNamePlaceholder")}
                  required
                  maxLength={40}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              {numberField(t("pomodoro.focusMinutes"), "focusMinutes", 5, 180)}
              {numberField(
                t("pomodoro.shortBreakMinutes"),
                "shortBreakMinutes",
                1,
                60,
              )}
              {numberField(
                t("pomodoro.longBreakMinutes"),
                "longBreakMinutes",
                5,
                90,
              )}
              {numberField(
                t("pomodoro.sessionsBeforeLong"),
                "sessionsBeforeLongBreak",
                1,
                12,
              )}
              <div className="flex items-end gap-2">
                <Button type="submit">{t("pomodoro.savePreset")}</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
