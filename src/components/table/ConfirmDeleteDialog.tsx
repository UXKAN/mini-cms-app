"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean | void> | boolean | void;
  mode: "standard" | "financial";
  title: string;
  description: string;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  title,
  description,
}: Props) {
  const [state, setState] = useState({ understood: false, busy: false });

  useEffect(() => {
    if (open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ understood: false, busy: false });
  }, [open]);

  const canConfirm = mode === "standard" || state.understood;

  const handleConfirm = async () => {
    setState((prev) => ({ ...prev, busy: true }));
    try {
      const result = await onConfirm();
      if (result !== false) onOpenChange(false);
    } finally {
      setState((prev) => ({ ...prev, busy: false }));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {mode === "financial" && (
          <div className="rounded-[10px] bg-[var(--error-light)] p-3 text-sm text-destructive">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Dit zijn ANBI-bewijzen.</p>
                <p className="mt-1">
                  Verwijderen kan niet ongedaan worden gemaakt en raakt de jaaroverzichten.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Checkbox
                id="understand-financial"
                checked={state.understood}
                onCheckedChange={(v) =>
                  setState((prev) => ({ ...prev, understood: v === true }))
                }
              />
              <Label
                htmlFor="understand-financial"
                className="text-sm cursor-pointer"
              >
                Ik begrijp het en wil doorgaan
              </Label>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={state.busy}>Annuleer</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm || state.busy}
            onClick={(e) => {
              e.preventDefault();
              if (canConfirm && !state.busy) handleConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {state.busy ? "Bezig…" : "Verwijder"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
