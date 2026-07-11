"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BUILT_IN_PRESETS } from "@/data/presets";
import { useSettingsStore } from "@/stores/settings-store";
import { useTimerStore } from "@/stores/timer-store";
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
}: {
  id: string;
  name: string;
  detail: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-center rounded-2xl border p-0.5 transition-colors",
        selected ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-muted",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(id)}
        aria-pressed={selected}
        className="flex flex-col items-start rounded-2xl px-3.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </button>
      {onDelete && (
        <button
          type="button"
          aria-label={`Delete preset ${name}`}
          onClick={() => onDelete(id)}
          className="mr-2 rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function PresetManager() {
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
    // Reflect the new durations on an idle timer immediately.
    queueMicrotask(syncPreset);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addCustomPreset({ ...form, name: form.name.trim() });
    queueMicrotask(syncPreset);
    setShowForm(false);
    setForm({ name: "", focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4 });
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
        onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {timerStatus !== "idle" && (
        <p className="text-xs text-muted-foreground">
          Preset changes apply when the current cycle ends or is stopped.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {BUILT_IN_PRESETS.map((p) => (
          <PresetChip
            key={p.id}
            id={p.id}
            name={p.name}
            detail={`${p.focusMinutes} min focus · ${p.shortBreakMinutes} min break · long every ${p.sessionsBeforeLongBreak}`}
            selected={selectedPresetId === p.id}
            onSelect={handleSelect}
          />
        ))}
        {customPresets.map((p) => (
          <PresetChip
            key={p.id}
            id={p.id}
            name={p.name}
            detail={`${p.focusMinutes} / ${p.shortBreakMinutes} · long ${p.longBreakMinutes} every ${p.sessionsBeforeLongBreak}`}
            selected={selectedPresetId === p.id}
            onSelect={handleSelect}
            onDelete={removeCustomPreset}
          />
        ))}
        <Button
          variant="outline"
          className="h-auto rounded-2xl px-4"
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
        >
          <Plus className="h-4 w-4" aria-hidden /> Custom preset
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
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-muted/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="preset-name">Preset name</Label>
                <Input
                  id="preset-name"
                  placeholder="e.g. Morning Hifz"
                  required
                  maxLength={40}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              {numberField("Focus (minutes)", "focusMinutes", 5, 180)}
              {numberField("Short break (minutes)", "shortBreakMinutes", 1, 60)}
              {numberField("Long break (minutes)", "longBreakMinutes", 5, 90)}
              {numberField("Focus sessions before long break", "sessionsBeforeLongBreak", 1, 12)}
              <div className="flex items-end gap-2">
                <Button type="submit">Save preset</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
