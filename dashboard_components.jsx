// ── Shared UI primitives + SVG Charts ────────────────────────────────────────
// Exported to window at bottom

const { useState: useStateC, useRef: useRefC, useEffect: useEffectC, useCallback: useCallbackC } = React;

// ── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  bg: 'var(--bg)', surface: 'var(--surface)', border: 'var(--border)',
  accent: 'var(--accent)', accentLight: 'var(--accent-light)', accentDark: 'var(--accent-dark)',
  ink: 'var(--ink)', inkMuted: 'var(--ink-muted)', inkSubtle: 'var(--ink-subtle)',
  error: 'var(--error)', errorLight: 'var(--error-light)',
  warning: 'oklch(0.60 0.14 55)', warningLight: 'oklch(0.96 0.04 55)',
  radius: 'var(--radius)', radiusSm: 'var(--radius-sm)',
  shadow: 'var(--shadow)', shadowLg: 'var(--shadow-lg)',
};

// ── Card ────────────────────────────────────────────────────────────────────
function Card({ children, style, onClick, hover }) {
  const [hov, setHov] = useStateC(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radius, boxShadow: hov && hover ? 'var(--shadow-lg)' : T.shadow,
        transition: 'box-shadow 0.15s, transform 0.15s',
        transform: hov && hover ? 'translateY(-1px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >{children}</div>
  );
}

// ── Badge ───────────────────────────────────────────────────────────────────
function Badge({ label, color = 'accent', size = 'sm' }) {
  const colorMap = {
    accent: { bg: T.accentLight, text: T.accentDark },
    warning: { bg: T.warningLight, text: T.warning },
    error: { bg: T.errorLight, text: T.error },
    grey: { bg: 'oklch(0.93 0 0)', text: 'oklch(0.45 0 0)' },
    blue: { bg: 'oklch(0.93 0.04 240)', text: 'oklch(0.35 0.1 240)' },
  };
  const c = colorMap[color] || colorMap.accent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: 100, fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 600, background: c.bg, color: c.text,
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

// ── Button ──────────────────────────────────────────────────────────────────
function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style }) {
  const [hov, setHov] = useStateC(false);
  const variants = {
    primary: { bg: hov ? T.accentDark : T.accent, color: 'white', border: 'none', shadow: '0 2px 8px oklch(0.52 0.13 165 / 0.25)' },
    secondary: { bg: hov ? T.bg : T.surface, color: T.ink, border: `1px solid ${T.border}`, shadow: 'none' },
    ghost: { bg: hov ? T.bg : 'transparent', color: T.inkMuted, border: 'none', shadow: 'none' },
    danger: { bg: hov ? 'oklch(0.45 0.18 25)' : T.error, color: 'white', border: 'none', shadow: 'none' },
  };
  const v = variants[variant];
  const sz = size === 'sm' ? { padding: '6px 12px', fontSize: 12 } : size === 'lg' ? { padding: '13px 22px', fontSize: 15 } : { padding: '9px 16px', fontSize: 13 };
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: disabled ? 'oklch(0.88 0 0)' : v.bg,
        color: disabled ? 'oklch(0.6 0 0)' : v.color,
        border: v.border, borderRadius: T.radiusSm,
        boxShadow: disabled ? 'none' : v.shadow,
        fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
        ...sz, ...style,
      }}
    >{children}</button>
  );
}

// ── Stat Number ─────────────────────────────────────────────────────────────
function StatNum({ value, prefix = '', suffix = '', size = 32 }) {
  return (
    <div style={{ fontFamily: 'var(--font-serif)', fontSize: size, color: T.ink, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
      {prefix}{typeof value === 'number' ? value.toLocaleString('nl-NL') : value}{suffix}
    </div>
  );
}

// ── Delta Badge ─────────────────────────────────────────────────────────────
function Delta({ value }) {
  const pos = value >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontSize: 12, fontWeight: 600,
      color: pos ? T.accentDark : T.error,
      background: pos ? T.accentLight : T.errorLight,
      padding: '2px 8px', borderRadius: 100,
    }}>
      {pos ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

// ── Line Sparkline ──────────────────────────────────────────────────────────
function Sparkline({ data, width = 200, height = 50, color = T.accent }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');
  const areaBottom = `${width},${height} 0,${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${areaBottom}`} fill="url(#sparkGrad)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Bar Chart ───────────────────────────────────────────────────────────────
function BarChart({ data, width = 400, height = 120, highlightIndex }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value)) || 1;
  const barW = (width - data.length * 4) / data.length;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const barH = Math.max(3, (d.value / max) * (height - 28));
        const x = i * (barW + 4);
        const y = height - barH - 16;
        const isHL = i === highlightIndex;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH}
              rx={3}
              fill={isHL ? T.accent : `oklch(0.52 0.13 165 / 0.18)`}
            />
            <text x={x + barW / 2} y={height - 2} textAnchor="middle"
              fontSize="9" fill={T.inkSubtle} fontFamily="var(--font-sans)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Table ───────────────────────────────────────────────────────────────────
function Table({ columns, rows, onRowClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${T.border}` }}>
            {columns.map(c => (
              <th key={c.key} style={{
                padding: '10px 14px', textAlign: 'left', fontWeight: 600,
                color: T.inkMuted, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: `1px solid ${T.border}`,
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = T.accentLight; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {columns.map(c => (
                <td key={c.key} style={{ padding: '11px 14px', color: T.ink, whiteSpace: c.wrap ? 'normal' : 'nowrap' }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: 'center', color: T.inkSubtle }}>Geen resultaten gevonden</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Search Input ─────────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder = 'Zoeken…' }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.inkSubtle} strokeWidth="2" strokeLinecap="round"
        style={{ position: 'absolute', left: 11, pointerEvents: 'none' }}>
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          padding: '8px 12px 8px 34px', border: `1.5px solid ${T.border}`,
          borderRadius: T.radiusSm, fontFamily: 'var(--font-sans)', fontSize: 13,
          background: T.surface, color: T.ink, outline: 'none', width: 220,
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = T.accent}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 560 }) {
  useEffectC(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'oklch(0.1 0 0 / 0.45)',
      zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 16px', overflowY: 'auto', backdropFilter: 'blur(2px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: T.surface, borderRadius: T.radius,
        boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: width,
        animation: 'modalIn 0.2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.inkMuted, padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

// ── Stat Row ─────────────────────────────────────────────────────────────────
function StatRow({ label, value, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 13, color: T.inkMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: muted ? T.inkMuted : T.ink }}>{value}</span>
    </div>
  );
}

// ── Euro format ───────────────────────────────────────────────────────────────
function eur(n) { return '€\u202F' + n.toLocaleString('nl-NL'); }

Object.assign(window, { Card, Badge, Button, StatNum, Delta, Sparkline, BarChart, Table, SearchInput, Modal, StatRow, eur, T });
