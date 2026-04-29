"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

type Props = {
  onChange: (dataUrl: string) => void;
  height?: number;
  hasError?: boolean;
};

export function SignaturePad({ onChange, height = 200, hasError = false }: Props) {
  const ref = useRef<SignatureCanvas>(null);

  const handleEnd = () => {
    const pad = ref.current;
    if (!pad) return;
    if (pad.isEmpty()) {
      onChange("");
    } else {
      onChange(pad.toDataURL("image/png"));
    }
  };

  const handleClear = () => {
    ref.current?.clear();
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div
        className={[
          "relative rounded-md border bg-card overflow-hidden",
          hasError ? "border-destructive" : "border-input",
        ].join(" ")}
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 27px, var(--border) 27px, var(--border) 28px)",
        }}
      >
        <SignatureCanvas
          ref={ref}
          onEnd={handleEnd}
          canvasProps={{
            className: "w-full touch-none",
            style: { height: `${height}px` },
          }}
          backgroundColor="rgba(0,0,0,0)"
          penColor="oklch(0.18 0.02 65)"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground italic">
          {/* Placeholder, hidden once user starts drawing — visible only on empty canvas */}
        </span>
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          <Eraser className="mr-2 h-4 w-4" />
          Wissen
        </Button>
      </div>
    </div>
  );
}
