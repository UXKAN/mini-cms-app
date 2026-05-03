"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SelectableCard } from "@/components/ui/selectable-card";
import { DateOfBirthInput } from "@/components/ui/date-of-birth-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Shield,
  Users,
  Coins,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────
// Token definitions
// ────────────────────────────────────────────────────────────────────────────

type TokenGroup = {
  title: string;
  tokens: { key: string; label: string }[];
};

const TOKEN_GROUPS: TokenGroup[] = [
  {
    title: "Surfaces",
    tokens: [
      { key: "--background", label: "Background" },
      { key: "--card", label: "Card" },
      { key: "--popover", label: "Popover" },
      { key: "--muted", label: "Muted" },
      { key: "--secondary", label: "Secondary" },
    ],
  },
  {
    title: "Tekst",
    tokens: [
      { key: "--foreground", label: "Foreground" },
      { key: "--muted-foreground", label: "Muted foreground" },
      { key: "--primary-foreground", label: "Primary foreground" },
      { key: "--secondary-foreground", label: "Secondary foreground" },
      { key: "--accent-foreground", label: "Accent foreground" },
    ],
  },
  {
    title: "Brand & states",
    tokens: [
      { key: "--primary", label: "Primary" },
      { key: "--selected", label: "Selected (border)" },
    ],
  },
  {
    title: "Borders & inputs",
    tokens: [
      { key: "--border", label: "Border" },
      { key: "--input", label: "Input border" },
      { key: "--ring", label: "Focus ring" },
    ],
  },
  {
    title: "Status",
    tokens: [
      { key: "--destructive", label: "Destructive / Error" },
      { key: "--destructive-foreground", label: "Destructive foreground" },
      { key: "--success", label: "Success" },
      { key: "--success-light", label: "Success light" },
      { key: "--warn", label: "Warning" },
      { key: "--warn-light", label: "Warning light" },
      { key: "--error-light", label: "Error light" },
    ],
  },
  {
    title: "Brand tints",
    tokens: [
      { key: "--accent-light", label: "Accent light" },
      { key: "--accent-dark", label: "Accent dark" },
    ],
  },
];

const ALL_TOKEN_KEYS = TOKEN_GROUPS.flatMap((g) => g.tokens.map((t) => t.key));
const STORAGE_KEY = "theme-playground-tokens-v1";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

let _ctx: CanvasRenderingContext2D | null = null;
function getCtx() {
  if (_ctx) return _ctx;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  _ctx = canvas.getContext("2d", { willReadFrequently: true });
  return _ctx;
}

/** Converteert een willekeurige CSS-kleurwaarde (oklch, lab, rgb, hex) naar #rrggbb.
 *  Strategie: schilder een pixel op een 1x1 canvas en lees de RGB-pixeldata terug.
 *  Werkt voor oklch/lab in moderne browsers — Chrome 111+, FF 113+, Safari 15+. */
function toHex(cssColor: string): string {
  if (!cssColor) return "#000000";
  const trimmed = cssColor.trim();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase();

  const ctx = getCtx();
  if (!ctx) return "#000000";

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = trimmed;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  const r = data[0].toString(16).padStart(2, "0");
  const g = data[1].toString(16).padStart(2, "0");
  const b = data[2].toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

function readTokens(): Record<string, string> {
  const cs = getComputedStyle(document.documentElement);
  const out: Record<string, string> = {};
  for (const key of ALL_TOKEN_KEYS) {
    const raw = cs.getPropertyValue(key).trim();
    if (raw) out[key] = toHex(raw);
  }
  return out;
}

function applyTokens(values: Record<string, string>) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(values)) {
    root.style.setProperty(key, value);
  }
}

function clearOverrides() {
  const root = document.documentElement;
  for (const key of ALL_TOKEN_KEYS) {
    root.style.removeProperty(key);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Main client
// ────────────────────────────────────────────────────────────────────────────

export function PlaygroundClient() {
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    const initial = readTokens();
    setDefaults(initial);

    // Load uit localStorage en apply
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Record<string, string>;
        applyTokens(stored);
        setValues({ ...initial, ...stored });
        return;
      }
    } catch {
      // ignore
    }
    setValues(initial);
  }, []);

  function handleChange(key: string, hex: string) {
    const next = { ...values, [key]: hex };
    setValues(next);
    document.documentElement.style.setProperty(key, hex);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota
    }
  }

  function handleReset() {
    clearOverrides();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setValues(defaults);
  }

  const exportCss = useMemo(() => {
    const lines = [":root {"];
    for (const group of TOKEN_GROUPS) {
      lines.push(`  /* ${group.title} */`);
      for (const t of group.tokens) {
        const v = values[t.key] ?? defaults[t.key] ?? "";
        if (v) lines.push(`  ${t.key}: ${v};`);
      }
    }
    lines.push("}");
    return lines.join("\n");
  }, [values, defaults]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl">Theme Playground</h1>
            <p className="text-sm text-muted-foreground">
              Live design-tokens. Wijzigingen blijven bewaard in deze browser
              (localStorage). Alleen zichtbaar in <code>npm run dev</code>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={() => setExportOpen(true)}>Export CSS</Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] min-h-[calc(100vh-64px)]">
        {/* ─── Token sidebar ─── */}
        <aside className="border-r border-border bg-card xl:sticky xl:top-0 xl:max-h-screen xl:overflow-y-auto">
          <div className="p-4 space-y-6">
            {TOKEN_GROUPS.map((group) => (
              <div key={group.title} className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.title}
                </h3>
                <div className="space-y-1.5">
                  {group.tokens.map((t) => (
                    <TokenRow
                      key={t.key}
                      tokenKey={t.key}
                      label={t.label}
                      value={values[t.key] ?? "#000000"}
                      onChange={(hex) => handleChange(t.key, hex)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ─── Component grid ─── */}
        <main className="p-6 space-y-10 max-w-5xl">
          <Section title="Buttons">
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </Section>

          <Section title="Form fields">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="space-y-1.5">
                <Label>Naam</Label>
                <Input placeholder="Jan de Vries" />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" placeholder="naam@voorbeeld.nl" />
              </div>
              <div className="space-y-1.5">
                <Label>Land</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies land" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nl">Nederland</SelectItem>
                    <SelectItem value="be">België</SelectItem>
                    <SelectItem value="de">Duitsland</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Geboortedatum (handmatig)</Label>
                <DobDemo />
              </div>
              <div className="space-y-1.5">
                <Label className="text-destructive">Bedrag (met fout)</Label>
                <Input
                  placeholder="€"
                  className="border-destructive focus-visible:ring-destructive/30"
                />
                <p className="text-xs text-destructive">
                  Bedrag is verplicht.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Cards & dashboard stats">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Ontvangen deze maand", value: "€ 8.420" },
                { label: "Openstaand", value: "€ 12.500" },
                { label: "Periodiek / maand", value: "€ 1.760" },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-6">
                    <div
                      className="text-[11px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {s.label}
                    </div>
                    <div className="font-serif text-[32px] leading-none">
                      {s.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Badges">
            <div className="flex flex-wrap gap-2">
              <Badge>Actief</Badge>
              <Badge variant="secondary">Inactief</Badge>
              <Badge variant="destructive">Opgezegd</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge
                variant="outline"
                style={{
                  borderColor: "var(--warn)",
                  color: "var(--warn)",
                }}
              >
                Prospect
              </Badge>
              <Badge
                style={{
                  background: "var(--success-light)",
                  color: "var(--success)",
                  borderColor: "transparent",
                }}
              >
                Betaald
              </Badge>
            </div>
          </Section>

          <Section title="Selectable cards (TypeOption + ChoiceCard pattern)">
            <SelectableSet />
          </Section>

          <Section title="Alerts">
            <div className="space-y-3 max-w-xl">
              <Alert
                tone="info"
                icon={<Info className="h-5 w-5" />}
                title="Goed om te weten"
              >
                Een ondertekend formulier is nog geen geld. Pas na ontvangst
                telt het mee als donatie.
              </Alert>
              <Alert
                tone="success"
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="Inzending opgeslagen"
              >
                Bewaar uw referentienummer voor uw administratie.
              </Alert>
              <Alert
                tone="warn"
                icon={<AlertTriangle className="h-5 w-5" />}
                title="Mail kon niet verstuurd"
              >
                De inzending is opgeslagen, maar de bevestigingsmail kon niet
                verstuurd worden.
              </Alert>
              <Alert
                tone="error"
                icon={<AlertCircle className="h-5 w-5" />}
                title="Fout bij opslaan"
              >
                Er ging iets mis bij het opslaan. Probeer het opnieuw of neem
                contact op.
              </Alert>
            </div>
          </Section>

          <Section title="Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif font-normal text-xl">
                    Voorbeeld dialog
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Een dialog gebruikt <code>--popover</code> en{" "}
                    <code>--popover-foreground</code> tokens. Sluit met de X
                    of door buiten te klikken.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Annuleren</Button>
                    <Button>Bevestigen</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Section>

          <Section title="Table">
            <div className="rounded-[10px] border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naam</TableHead>
                    <TableHead>Bedrag</TableHead>
                    <TableHead>Methode</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Ahmed Yilmaz</TableCell>
                    <TableCell>€ 25,00</TableCell>
                    <TableCell>Bank</TableCell>
                    <TableCell>
                      <Badge>Voldaan</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fatima Bakkali</TableCell>
                    <TableCell>€ 50,00</TableCell>
                    <TableCell>Cash</TableCell>
                    <TableCell>
                      <Badge variant="secondary">In behandeling</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mohamed K.</TableCell>
                    <TableCell>€ 100,00</TableCell>
                    <TableCell>Bank</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Vervallen</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Section>

          <Section title="Sidebar (mini AppShell)">
            <div className="rounded-[10px] border border-border overflow-hidden bg-card flex h-[280px]">
              <nav className="w-56 border-r border-border bg-secondary p-4 space-y-1">
                <div className="flex items-center gap-2 px-2 py-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                    <Shield size={16} />
                  </div>
                  <div className="text-sm font-bold">Mosqon</div>
                </div>
                <SidebarItem icon={<Users size={16} />} active>
                  Leden
                </SidebarItem>
                <SidebarItem icon={<Coins size={16} />}>Donaties</SidebarItem>
                <SidebarItem icon={<Coins size={16} />}>Toezeggingen</SidebarItem>
              </nav>
              <div className="flex-1 p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Maandelijkse leden
                </div>
                <div className="font-serif text-3xl">42</div>
              </div>
            </div>
          </Section>

          <Section title="Empty state">
            <div className="rounded-[10px] border border-border p-14 text-center bg-card">
              <h3 className="font-serif text-2xl mb-2">Nog geen toezeggingen</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                Voeg er één toe of laat schenkers zelf een ANBI-overeenkomst
                indienen via het publieke formulier.
              </p>
              <div className="flex justify-center gap-2">
                <Button>Toezegging toevoegen</Button>
                <Button variant="outline">Naar formulier</Button>
              </div>
            </div>
          </Section>
        </main>
      </div>

      {/* ─── Export CSS dialog ─── */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">
              Export CSS
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Plak dit blok in <code>src/app/globals.css</code> binnen{" "}
            <code>:root</code> om je huidige selectie als nieuwe defaults op
            te slaan.
          </p>
          <pre className="text-xs bg-muted text-foreground p-4 rounded-md overflow-x-auto max-h-[420px]">
            <code>{exportCss}</code>
          </pre>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(exportCss);
              }}
            >
              Kopieer naar klembord
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function TokenRow({
  tokenKey,
  label,
  value,
  onChange,
}: {
  tokenKey: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 rounded border border-border cursor-pointer shrink-0"
        aria-label={label}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{label}</div>
        <div className="text-[10px] text-muted-foreground font-mono truncate">
          {tokenKey}
        </div>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 h-7 text-[11px] font-mono px-1.5 rounded border border-input bg-background"
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-1">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Alert({
  tone,
  icon,
  title,
  children,
}: {
  tone: "info" | "success" | "warn" | "error";
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const tones: Record<typeof tone, { bg: string; fg: string; border: string }> =
    {
      info: {
        bg: "var(--secondary)",
        fg: "var(--secondary-foreground)",
        border: "var(--border)",
      },
      success: {
        bg: "var(--success-light)",
        fg: "var(--success)",
        border: "var(--success)",
      },
      warn: {
        bg: "var(--warn-light)",
        fg: "var(--warn)",
        border: "var(--warn)",
      },
      error: {
        bg: "var(--error-light)",
        fg: "var(--destructive)",
        border: "var(--destructive)",
      },
    };
  const t = tones[tone];
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-md border"
      style={{ background: t.bg, color: t.fg, borderColor: t.border }}
    >
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="space-y-0.5">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

function SelectableSet() {
  const [picked, setPicked] = useState<"periodieke" | "eenmalige">(
    "periodieke"
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank" | "">("");

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectableCard
          size="lg"
          title="Periodieke gift"
          description="Min. 5 jaar — aftrekbaar"
          selected={picked === "periodieke"}
          onClick={() => setPicked("periodieke")}
        />
        <SelectableCard
          size="lg"
          title="Eenmalige gift"
          description="Eenmalige bijdrage"
          selected={picked === "eenmalige"}
          onClick={() => setPicked("eenmalige")}
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Hoe gaat u betalen?</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectableCard
            title="Bankoverschrijving"
            description="U maakt het bedrag zelf over"
            selected={paymentMethod === "bank"}
            onClick={() => setPaymentMethod("bank")}
          />
          <SelectableCard
            title="Contant"
            description="U geeft het bedrag direct"
            selected={paymentMethod === "cash"}
            onClick={() => setPaymentMethod("cash")}
          />
        </div>
      </div>
    </div>
  );
}

function DobDemo() {
  const [iso, setIso] = useState("");
  return (
    <>
      <DateOfBirthInput value={iso} onChange={setIso} />
      <p className="text-[11px] text-muted-foreground font-mono">
        ISO opgeslagen: {iso || "(nog niets)"}
      </p>
    </>
  );
}

function SidebarItem({
  icon,
  active,
  children,
}: {
  icon: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-muted"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
