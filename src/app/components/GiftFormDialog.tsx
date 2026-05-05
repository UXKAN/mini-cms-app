"use client";

import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { GiftForm } from "../gift/GiftForm";
import { cn } from "@/lib/utils";

export function GiftFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset progress wanneer modal opent
  useEffect(() => {
    if (open) setProgress(0);
  }, [open]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable <= 0) {
      setProgress(0);
      return;
    }
    const pct = Math.max(0, Math.min(100, (el.scrollTop / scrollable) * 100));
    setProgress(pct);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "duration-[800ms]"
          )}
        />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-background overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "duration-[800ms] ease-out"
          )}
        >
          {/* Sticky header */}
          <header className="flex-none border-b bg-background">
            <div className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4">
              <DialogPrimitive.Title className="font-serif text-xl text-foreground truncate">
                Schenkingsovereenkomst
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  <span>Sluiten</span>
                  <X className="h-4 w-4" />
                </button>
              </DialogPrimitive.Close>
            </div>
            {/* Subtiele scroll-progressbar */}
            <div className="h-0.5 w-full bg-transparent">
              <div
                className="h-full bg-primary/70 transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </header>

          {/* Scrollbare body — originele submit-knop blijft binnen het form staan */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            <div className="mx-auto w-full max-w-[640px] px-4 sm:px-6 py-8 sm:py-10 min-w-0">
              <GiftForm onClose={() => onOpenChange(false)} />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
