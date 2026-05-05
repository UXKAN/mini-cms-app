"use client";

import { GiftForm } from "../../gift/GiftForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GiftFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>ANBI-gift-formulier</DialogTitle>
        </DialogHeader>
        <GiftForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
