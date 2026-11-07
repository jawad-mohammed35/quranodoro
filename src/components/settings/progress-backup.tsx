"use client";
import { useSettingsStore } from "@/stores/settings-store";
import { useSessionsStore } from "@/stores/sessions-store";
import { useFarmStore } from "@/stores/farm-store";
import { useTasbihStore } from "@/stores/tasbih-store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProgressBackup() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keep a progress backup</CardTitle>
        <CardDescription>
          Guest progress and each account have separate storage on this device.
          Download the current space before changing accounts or clearing
          browser data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          onClick={() => {
            const snapshot = {
              version: 1,
              exportedAt: new Date().toISOString(),
              settings: useSettingsStore.getState(),
              sessions: useSessionsStore.getState().sessions,
              farm: useFarmStore.getState(),
              tasbih: useTasbihStore.getState(),
            };
            const url = URL.createObjectURL(
              new Blob([JSON.stringify(snapshot, null, 2)], {
                type: "application/json",
              }),
            );
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `quranodoro-backup-${new Date().toISOString().slice(0, 10)}.json`;
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download progress backup
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          The file contains your progress and preferences, never your password
          or sign-in tokens. Keep it private. Automatic import is not available
          yet.
        </p>
      </CardContent>
    </Card>
  );
}
