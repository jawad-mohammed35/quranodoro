"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  title,
  description,
  onDismiss,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current!;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector("button")?.focus();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      aria-describedby={id + "-detail"}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      className="confirm-dialog glass-surface m-auto w-[min(25rem,calc(100%-2rem))] rounded-card border border-border p-6 text-foreground"
    >
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      <p id={id + "-detail"} className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onDismiss}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onDismiss();
            onConfirm();
          }}
        >
          Confirm
        </Button>
      </div>
    </dialog>
  );
}
