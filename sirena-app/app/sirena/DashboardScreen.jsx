"use client";

import { useEffect, useState, useRef, useCallback, createContext, useContext } from "react";
import { Card, RiskMeter, StatusPill, ProgressBar, Button } from "../design-system/components";
import { Icon } from "../design-system/components/Icon";
import { fetchPeople, fetchSimulacionesFlat } from "./supabaseData";
import { riskFromResistance, simOutcome } from "./derive";
import { useOrg } from "./OrgContext";

// ── Layout drag-and-drop engine ──────────────────────────────────────────────
const LAYOUT_KEY = "vishield-dash-layout";
const DEFAULT_LAYOUT = { left: ["hackability"], right: ["risk", "voices", "resistance", "sims"] };

const EditCtx = createContext({ editing: false });
function useEdit() { return useContext(EditCtx); }

function useLayout() {
  const [layout, setLayout] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "null");
      if (s?.left && s?.right) return s;
    } catch {}
    return DEFAULT_LAYOUT;
  });
  const save = useCallback((next) => {
    setLayout(next);
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(next)); } catch {}
  }, []);
  const reset = useCallback(() => save(DEFAULT_LAYOUT), [save]);
  return [layout, save, reset];
}

// Move widget: drag source (col, idx) → drop target (col, insertIdx)
function moveWidget(layout, dragCol, dragIdx, dropCol, insertIdx) {
  const next = { left: [...layout.left], right: [...layout.right] };
  const [item] = next[dragCol].splice(dragIdx, 1);
  // Adjust insert index if same column and dragging downward
  const adj = dropCol === dragCol && insertIdx > dragIdx ? insertIdx - 1 : insertIdx;
  next[dropCol].splice(Math.max(0, adj), 0, item);
  return next;
}

// ── Draggable wrapper ────────────────────────────────────────────────────────
function DraggableWidget({ id, col, idx, onDragStart, onDragEnd, onDragEnter, isDragOver, children }) {
  const { editing } = useEdit();
  return (
    <div
      className={["dwidget", editing && "dwidget--editing", isDragOver && "dwidget--over"].filter(Boolean).join(" ")}
      draggable={editing}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(col, idx); }}
      onDragEnd={onDragEnd}
      onDragEnter={(e) => { e.preventDefault(); onDragEnter(col, idx); }}
      onDragOver={(e) => e.preventDefault()}
    >
      {editing && (
        <div className="dwidget__handle" title="Arrastrar">
          <Icon name="grip-vertical" />
          <span>{id === "hackability" ? "Hackabilidad" : id === "risk" ? "Puntaje de riesgo" : id === "voices" ? "Voces consentidas" : id === "resistance" ? "Resistencia media" : "Simulaciones"}</span>
        </div>
      )}
      {children}
    </div>
  );
}

// ── Drop column ──────────────────────────────────────────────────────────────
function DropColumn({ col, layout, onDragEnterCol, onDrop, children }) {
  const { editing } = useEdit();
  return (
    <div
      className={["dash-col", editing && "dash-col--editing"].filter(Boolean).join(" ")}
      onDragEnter={(e) => { e.preventDefault(); onDragEnterCol(col); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop(col); }}
    >
      {children}
      {editing && layout[col].length === 0 && (
        <div className="drop-placeholder"><Icon name="plus" /> Soltar aquí</div>
      )}
    </div>
  );
}

const OUTCOME_LABEL = { compromised: "Cayó", resisted: "Resistió", sent: "Enviada" };

function fmtRelative(iso) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${Math.round(hours / 24)} días`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { month: "short", day: "numeric" });
}

// Returns { weeks: [{label, total, compromised, resisted, sent}] }
function buildWeeklyStats(sims) {
  const byWeek = new Map();
  for (const s of sims) {
    if (!s.fecha_envio) continue;
    const d = new Date(s.fecha_envio);
    const ws = new Date(d); ws.setDate(d.getDate() - d.getDay());
    const key = ws.toISOString().slice(0, 10);
    const b = byWeek.get(key) || { key, total: 0, compromised: 0, resisted: 0, sent: 0 };
    b.total += 1;
    const oc = simOutcome(s);
    if (oc === "compromised") b.compromised += 1;
    else if (oc === "resisted") b.resisted += 1;
    else b.sent += 1;
    byWeek.set(key, b);
  }
  return Array.from(byWeek.values())
    .sort((a, b) => (a.key < b.key ? -1 : 1))
    .slice(-10)
    .map((w) => ({
      ...w,
      label: fmtDate(w.key),
      fallRate: w.total > 0 ? Math.round((w.compromised / w.total) * 100) : 0,
      resistRate: w.total > 0 ? Math.round((w.resisted / w.total) * 100) : 0,
    }));
}

// Builds voice adoption over time from voice creation dates
function buildVoiceAdoptionWeekly(people) {
  const dated = people.filter((p) => p.voiceCreatedAt).sort(
    (a, b) => new Date(a.voiceCreatedAt) - new Date(b.voiceCreatedAt)
  );
  if (dated.length === 0) return [];
  const byWeek = new Map();
  for (const p of dated) {
    const d = new Date(p.voiceCreatedAt);
    const ws = new Date(d); ws.setDate(d.getDate() - d.getDay());
    const key = ws.toISOString().slice(0, 10);
    byWeek.set(key, (byWeek.get(key) || 0) + 1);
  }
  const sorted = Array.from(byWeek.entries()).sort(([a], [b]) => (a < b ? -1 : 1)).slice(-8);
  let cum = 0;
  return sorted.map(([key, cnt]) => { cum += cnt; return { label: fmtDate(key), count: cum }; });
}

// ── CHART PRIMITIVES ──────────────────────────────────────────────────────────────

// Shared smooth path builder (Catmull-Rom → cubic bezier)
function smoothPath(xs, ys) {
  if (xs.length < 2) return `M ${xs[0]} ${ys[0]}`;
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i-1] ?? xs[i]; const y0 = ys[i-1] ?? ys[i];
    const x2 = xs[i+1]; const y2 = ys[i+1];
    const x3 = xs[i+2] ?? xs[i+1]; const y3 = ys[i+2] ?? ys[i+1];
    const cp1x = xs[i] + (x2 - x0) / 6;
    const cp1y = ys[i] + (y2 - y0) / 6;
    const cp2x = x2 - (x3 - xs[i]) / 6;
    const cp2y = y2 - (y3 - ys[i]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  }
  return d;
}

// ── Chart wrapper: renders SVG at natural aspect ratio, no text distortion ────────
// Uses a fixed-width SVG viewport (W×H), scales with CSS width, never stretches.
const CHART_W = 320;

// ── Axes area chart ───────────────────────────────────────────────────────────
function AxesAreaChart({ points = [], color = "var(--primary)", height = 140, gradId = "aac", yLabel = "%", onPointClick }) {
  if (points.length < 2) return <div style={{ color: "var(--text-muted)", fontSize: 12, padding: 12 }}>Sin datos suficientes</div>;
  const PAD = { top: 14, right: 14, bottom: 34, left: 40 };
  const W = CHART_W; const H = height;
  const vals = points.map((p) => p.value);
  const minV = Math.min(...vals); const maxV = Math.max(...vals, minV + 1);
  const range = maxV - minV || 1;
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const xs = points.map((_, i) => PAD.left + (i / (points.length - 1)) * iw);
  const ys = points.map((p) => PAD.top + ih - ((p.value - minV) / range) * ih);
  const line = smoothPath(xs, ys);
  const area = `${line} L ${xs[xs.length-1]} ${PAD.top + ih} L ${xs[0]} ${PAD.top + ih} Z`;
  const yTicks = [0, 0.5, 1].map((t) => ({ v: Math.round(minV + t * range), y: PAD.top + ih - t * ih }));
  const [hov, setHov] = useState(null);
  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible", cursor: "crosshair" }}
        onMouseLeave={() => setHov(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
          <filter id={`${gradId}gl`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top+ih} stroke="var(--border)" strokeWidth="1"/>
        <line x1={PAD.left} y1={PAD.top+ih} x2={PAD.left+iw} y2={PAD.top+ih} stroke="var(--border)" strokeWidth="1"/>
        {/* Y ticks */}
        {yTicks.map((t) => (
          <g key={t.v}>
            <line x1={PAD.left-4} y1={t.y} x2={PAD.left+iw} y2={t.y}
              stroke="var(--border-faint)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PAD.left-8} y={t.y} textAnchor="end" dominantBaseline="middle"
              fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">
              {t.v}{yLabel}
            </text>
          </g>
        ))}
        {/* X labels (3 shown) */}
        {points.map((p, i) => (
          (i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)) && (
            <text key={i} x={xs[i]} y={PAD.top+ih+18} textAnchor="middle" dominantBaseline="hanging"
              fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">
              {p.label}
            </text>
          )
        ))}
        {/* Area + line */}
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" filter={`url(#${gradId}gl)`} />
        {/* Dots + tooltips */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHov(i)} onClick={() => onPointClick?.(p, i)}
            style={{ cursor: onPointClick ? "pointer" : "default" }}>
            <circle cx={xs[i]} cy={ys[i]} r="14" fill="transparent" />
            <circle cx={xs[i]} cy={ys[i]} r={hov === i ? 6 : 4}
              fill={color} stroke="var(--surface)" strokeWidth="2"
              style={{ transition: "r 100ms" }} />
            {hov === i && (
              <g>
                <line x1={xs[i]} y1={PAD.top} x2={xs[i]} y2={PAD.top+ih}
                  stroke={color} strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.45" />
                <rect x={xs[i]-26} y={ys[i]-28} width={52} height={20} rx={5}
                  fill="var(--surface)" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
                <text x={xs[i]} y={ys[i]-17} textAnchor="middle" dominantBaseline="middle"
                  fontSize="11" fontWeight="700" fill={color} fontFamily="var(--font-mono)">
                  {p.value}{yLabel}
                </text>
                <text x={xs[i]} y={PAD.top+ih+18} textAnchor="middle" dominantBaseline="hanging"
                  fontSize="10" fontWeight="700" fill={color} fontFamily="var(--font-mono)">
                  {p.label}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Sparkline WITH axes (always visible, used in collapsed card header) ────────
function SmoothAreaChart({ data = [], color = "var(--primary)", height = 56, gradId }) {
  if (data.length < 2) return null;
  const PAD = { top: 4, right: 4, bottom: 14, left: 22 };
  const W = 110; const H = height;
  const min = Math.min(...data); const max = Math.max(...data, min + 1);
  const range = max - min || 1;
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const xs = data.map((_, i) => PAD.left + (i / (data.length - 1)) * iw);
  const ys = data.map((v) => PAD.top + ih - ((v - min) / range) * ih);
  const d = smoothPath(xs, ys);
  const area = `${d} L ${xs[xs.length-1]} ${PAD.top+ih} L ${xs[0]} ${PAD.top+ih} Z`;
  const gid = gradId || "sac";
  // 3 Y ticks
  const yTicks = [0, 0.5, 1].map((t) => ({ v: Math.round(min + t * range), y: PAD.top + ih - t * ih }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Y axis */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top+ih} stroke="var(--border)" strokeWidth="0.8"/>
      {/* X axis */}
      <line x1={PAD.left} y1={PAD.top+ih} x2={PAD.left+iw} y2={PAD.top+ih} stroke="var(--border)" strokeWidth="0.8"/>
      {/* Y grid + value labels */}
      {yTicks.map((t, i) => (
        <g key={i}>
          {i > 0 && <line x1={PAD.left} y1={t.y} x2={PAD.left+iw} y2={t.y}
            stroke="var(--border-faint)" strokeWidth="0.6" strokeDasharray="3 2"/>}
          <text x={PAD.left-3} y={t.y} textAnchor="end" dominantBaseline="middle"
            fontSize="7" fill="var(--text-faint)" fontFamily="var(--font-mono)">{t.v}</text>
        </g>
      ))}
      {/* X first/last labels */}
      <text x={PAD.left} y={PAD.top+ih+9} textAnchor="middle" dominantBaseline="hanging"
        fontSize="6.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">ini</text>
      <text x={PAD.left+iw} y={PAD.top+ih+9} textAnchor="middle" dominantBaseline="hanging"
        fontSize="6.5" fill={color} fontFamily="var(--font-mono)">hoy</text>
      {/* Area + line */}
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Last point dot */}
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="2.5" fill={color}/>
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="4.5" fill={color} fillOpacity="0.18"/>
    </svg>
  );
}

// ── Axes bar chart ──────────────────────────────────────────────────────────────
function AxesBarChart({ bars = [], color = "var(--primary)", height = 140, gradId = "abc", yLabel = "" }) {
  if (!bars.length) return null;
  const PAD = { top: 14, right: 14, bottom: 34, left: 40 };
  const W = CHART_W; const H = height;
  const maxV = Math.max(...bars.map((b) => b.value), 1);
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const slot = iw / bars.length;
  const bw = Math.max(10, slot * 0.6);
  const bx = (i) => PAD.left + i * slot + (slot - bw) / 2;
  const [hov, setHov] = useState(null);
  const yTicks = [0, 0.5, 1].map((t) => ({ v: Math.round(t * maxV), y: PAD.top + ih - t * ih }));
  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        onMouseLeave={() => setHov(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top+ih} stroke="var(--border)" strokeWidth="1" />
        <line x1={PAD.left} y1={PAD.top+ih} x2={PAD.left+iw} y2={PAD.top+ih} stroke="var(--border)" strokeWidth="1" />
        {yTicks.map((t) => (
          <g key={t.v}>
            <line x1={PAD.left-4} y1={t.y} x2={PAD.left+iw} y2={t.y}
              stroke="var(--border-faint)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PAD.left-8} y={t.y} textAnchor="end" dominantBaseline="middle"
              fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">{t.v}{yLabel}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const barH = Math.max(4, (b.value / maxV) * ih);
          const isHov = hov === i;
          const isLast = i === bars.length - 1;
          return (
            <g key={i} onMouseEnter={() => setHov(i)} style={{ cursor: "pointer" }}>
              <rect x={bx(i)} y={PAD.top+ih-barH} width={bw} height={barH} rx={4}
                fill={isHov || isLast ? `url(#${gradId})` : color}
                fillOpacity={isHov ? 1 : isLast ? 0.9 : 0.42} />
              {(isHov || isLast) && (
                <rect x={bx(i)} y={PAD.top+ih-barH} width={bw} height={4} rx={2} fill={color} />
              )}
              <text x={bx(i)+bw/2} y={PAD.top+ih+18} textAnchor="middle" dominantBaseline="hanging"
                fontSize="10" fill={isHov || isLast ? color : "var(--text-faint)"} fontFamily="var(--font-mono)">
                {b.label}
              </text>
              {isHov && (
                <g>
                  <rect x={bx(i)+bw/2-28} y={PAD.top+ih-barH-24} width={56} height={20} rx={5}
                    fill="var(--surface)" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
                  <text x={bx(i)+bw/2} y={PAD.top+ih-barH-13} textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontWeight="700" fill={color} fontFamily="var(--font-mono)">
                    {b.value}{yLabel}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Multi-ring donut ─────────────────────────────────────────────────────────
function MultiRingDonut({ segments, size = 120 }) {
  const cx = size / 2; const cy = size / 2;
  const [hov, setHov] = useState(null);
  const rings = segments.map((s, i) => {
    const r = size / 2 - 10 - i * 18;
    const circ = 2 * Math.PI * r;
    const ratio = Math.max(0, Math.min(1, s.value / Math.max(s.max, 1)));
    return { ...s, r, circ, dash: circ * ratio, gap: circ * (1 - ratio), pct: Math.round(ratio * 100) };
  });
  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => (
          <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ cursor: "default" }}>
            <circle cx={cx} cy={cy} r={ring.r} fill="none" stroke="var(--surface-inset)" strokeWidth="11" />
            <circle cx={cx} cy={cy} r={ring.r} fill="none" stroke={ring.color} strokeWidth={hov === i ? 13 : 11}
              strokeLinecap="round" strokeDasharray={`${ring.dash} ${ring.gap}`}
              strokeDashoffset={ring.circ * 0.25}
              style={{ transition: "stroke-dasharray 900ms var(--ease-out), stroke-width 150ms" }} />
          </g>
        ))}
        {hov !== null && (
          <>
            <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
              fontSize="14" fontWeight="700" fill={rings[hov].color} fontFamily="var(--font-display)">
              {rings[hov].pct}%
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill="var(--text-muted)" fontFamily="var(--font-mono)">
              {rings[hov].label}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

// ── Radar chart ──────────────────────────────────────────────────────────────
function RadarChart({ axes = [], size = 160 }) {
  const cx = size / 2; const cy = size / 2;
  const r = size / 2 - 22; const n = axes.length;
  const [hov, setHov] = useState(null);
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, ratio) => [cx + Math.cos(angle(i)) * r * ratio, cy + Math.sin(angle(i)) * r * ratio];
  const polyPts = axes.map((a, i) => pt(i, (a.value ?? 0) / 100));
  const polyPath = polyPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="radgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((lvl) => (
        <polygon key={lvl} points={axes.map((_, i) => pt(i, lvl).join(",")).join(" ")}
          fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {axes.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt(i, 1)[0]} y2={pt(i, 1)[1]}
          stroke="var(--border)" strokeWidth="1" />
      ))}
      <path d={polyPath} fill="url(#radgrad)" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" />
      {polyPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={hov === i ? 5 : 3.5} fill="var(--primary)"
          onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
          style={{ cursor: "pointer", transition: "r 120ms" }} />
      ))}
      {axes.map((a, i) => {
        const [lx, ly] = pt(i, 1.32);
        const isHov = hov === i;
        return (
          <g key={i}>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
              fontSize={isHov ? 10 : 9} fontWeight={isHov ? "800" : "700"}
              fill={isHov ? "var(--primary)" : "var(--text-muted)"} fontFamily="var(--font-mono)">
              {a.label}
            </text>
            {isHov && (
              <text x={lx} y={ly + 11} textAnchor="middle" dominantBaseline="central"
                fontSize="8" fontWeight="700" fill="var(--primary)" fontFamily="var(--font-mono)">
                {a.value}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Stacked axes chart ───────────────────────────────────────────────────────────
function StackedAxesChart({ series = [], labels = [], height = 130, gradId = "stk", yLabel = "%" }) {
  if (!series.length || !series[0].data.length) return null;
  const PAD = { top: 14, right: 14, bottom: 34, left: 40 };
  const W = CHART_W; const H = height;
  const n = series[0].data.length;
  const allVals = series.flatMap((s) => s.data);
  const maxV = Math.max(...allVals, 1);
  const iw = W - PAD.left - PAD.right; const ih = H - PAD.top - PAD.bottom;
  const xs = Array.from({ length: n }, (_, i) => PAD.left + (i / Math.max(n-1,1)) * iw);
  const py = (v) => PAD.top + ih - (v / maxV) * ih;
  const [hov, setHov] = useState(null);
  const yTicks = [0, 0.5, 1].map((t) => ({ v: Math.round(t * maxV), y: PAD.top + ih - t * ih }));
  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        onMouseLeave={() => setHov(null)}
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`${gradId}${i}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top+ih} stroke="var(--border)" strokeWidth="1" />
        <line x1={PAD.left} y1={PAD.top+ih} x2={PAD.left+iw} y2={PAD.top+ih} stroke="var(--border)" strokeWidth="1" />
        {yTicks.map((t) => (
          <g key={t.v}>
            <line x1={PAD.left-4} y1={t.y} x2={PAD.left+iw} y2={t.y} stroke="var(--border-faint)" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PAD.left-8} y={t.y} textAnchor="end" dominantBaseline="middle"
              fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">{t.v}{yLabel}</text>
          </g>
        ))}
        {labels.map((lb, i) => (
          (i === 0 || i === n-1 || i === Math.floor(n/2)) && (
            <text key={i} x={xs[i]} y={PAD.top+ih+18} textAnchor="middle" dominantBaseline="hanging"
              fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">{lb}</text>
          )
        ))}
        {series.map((s, si) => {
          const ys = s.data.map(py);
          const line = smoothPath(xs, ys);
          const area = `${line} L ${xs[n-1]} ${PAD.top+ih} L ${xs[0]} ${PAD.top+ih} Z`;
          return (
            <g key={si}>
              <path d={area} fill={`url(#${gradId}${si})`} />
              <path d={line} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" />
              {xs.map((x, i) => (
                <circle key={i} cx={x} cy={ys[i]} r={hov===i ? 5 : 3.5} fill={s.color}
                  onMouseEnter={() => setHov(i)} style={{ cursor:"pointer",transition:"r 100ms" }} />
              ))}
            </g>
          );
        })}
        {hov !== null && (
          <>
            <line x1={xs[hov]} y1={PAD.top} x2={xs[hov]} y2={PAD.top+ih}
              stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 3" />
            {series.map((s, si) => {
              const labelX = xs[hov] + (xs[hov] > W * 0.7 ? -62 : 6);
              return (
                <g key={si}>
                  <rect x={labelX} y={py(s.data[hov])-11} width={52} height={20} rx={4}
                    fill="var(--surface)" stroke={s.color} strokeWidth="1.5" strokeOpacity="0.8" />
                  <text x={labelX+26} y={py(s.data[hov])} textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontWeight="700" fill={s.color} fontFamily="var(--font-mono)">
                    {s.data[hov]}{yLabel}
                  </text>
                </g>
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
}

// ── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (target == null) return;
    const start = performance.now();
    const from = 0;
    const run = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return display;
}

// ── Hackabilidad (left panel) ────────────────────────────────────────────────

// Builds data-driven risk factor cards from real org stats
function buildRiskFactors({ simOutcomes, simsTotal, consentedCount, peopleCount, weakest, deptStats, avgResistance, activeSims, weeklyStats }) {
  const fallPct    = simsTotal > 0 ? Math.round((simOutcomes.compromised / simsTotal) * 100) : 0;
  const pendPct    = peopleCount > 0 ? Math.round(((peopleCount - consentedCount) / peopleCount) * 100) : 0;
  const simsPerPerson = peopleCount > 0 ? (simsTotal / peopleCount).toFixed(1) : 0;
  const worstWeek  = weeklyStats.length ? Math.max(...weeklyStats.map((w) => w.fallRate)) : null;

  return [
    {
      icon: "skull",
      color: fallPct >= 50 ? "var(--danger)" : fallPct >= 25 ? "var(--warning)" : "var(--success)",
      severity: fallPct >= 50 ? "high" : fallPct >= 25 ? "med" : "low",
      label: "Tasa de caïdas",
      stat: `${fallPct}%`,
      statLabel: "de simulaciones comprometidas",
      bar: fallPct,
      barColor: fallPct >= 50 ? "var(--danger)" : fallPct >= 25 ? "var(--warning)" : "var(--success)",
      desc: fallPct >= 50
        ? `Crítico: ${simOutcomes.compromised} de ${simsTotal} personas caído en simulaciones. Tu equipo responde a pretextos de urgencia con alta efectividad.`
        : fallPct >= 25
        ? `${simOutcomes.compromised} de ${simsTotal} sims resultaron comprometidas. Hay margen de mejora con más frecuencia de entrenamiento.`
        : `${simOutcomes.compromised} caídas de ${simsTotal} simulaciones. Buen rendimiento relativo, mantén la frecuencia.`,
    },
    {
      icon: "mic-off",
      color: pendPct >= 50 ? "var(--danger)" : pendPct >= 25 ? "var(--warning)" : "var(--success)",
      severity: pendPct >= 50 ? "high" : pendPct >= 25 ? "med" : "low",
      label: "Exposición por voces",
      stat: `${pendPct}%`,
      statLabel: "sin muestra de voz registrada",
      bar: pendPct,
      barColor: pendPct >= 50 ? "var(--danger)" : pendPct >= 25 ? "var(--warning)" : "var(--success)",
      desc: pendPct >= 50
        ? `${peopleCount - consentedCount} de ${peopleCount} personas sin voz registrada. No puedes usar simulaciones de voz clonada para entrenarlas, dejando un vector de ataque real sin cubrir.`
        : pendPct > 0
        ? `${peopleCount - consentedCount} personas sin muestra. Invitar a grabar reduce la superficie de ataque por vishing.`
        : `Toda la organización tiene voz registrada. Puedes lanzar simulaciones de voz clonada a cualquier persona.`,
    },
    {
      icon: "building-2",
      color: weakest && weakest.avg != null && weakest.avg < 50 ? "var(--danger)" : weakest && weakest.avg < 75 ? "var(--warning)" : "var(--success)",
      severity: weakest && weakest.avg != null && weakest.avg < 50 ? "high" : "med",
      label: "Área más vulnerable",
      stat: weakest ? `${weakest.avg ?? "??"}%` : "N/A",
      statLabel: weakest ? `resistencia en ${weakest.dept}` : "sin datos de área",
      bar: weakest?.avg ?? 0,
      barColor: weakest && weakest.avg < 50 ? "var(--danger)" : "var(--warning)",
      desc: weakest
        ? `${weakest.dept} tiene la resistencia más baja (${weakest.avg}%). Con ${weakest.count} persona${weakest.count !== 1 ? "s" : ""}, es el objetivo más atractivo para un atacante real. Enfoca aquí la próxima campaña.`
        : "Aún no hay datos suficientes para identificar el área más débil. Lanza simulaciones en varios departamentos.",
    },
    {
      icon: "zap",
      color: worstWeek != null && worstWeek >= 60 ? "var(--danger)" : worstWeek != null && worstWeek >= 30 ? "var(--warning)" : "var(--success)",
      severity: worstWeek != null && worstWeek >= 60 ? "high" : "med",
      label: "Pico de riesgo semanal",
      stat: worstWeek != null ? `${worstWeek}%` : "--",
      statLabel: "mayor tasa de caídas en una semana",
      bar: worstWeek ?? 0,
      barColor: worstWeek >= 60 ? "var(--danger)" : worstWeek >= 30 ? "var(--warning)" : "var(--success)",
      desc: worstWeek != null
        ? `En tu peor semana el ${worstWeek}% del equipo caíyó. Los ataques reales concentran esfuerzos en momentos de alta carga o estrés organizacional.`
        : "Sin datos semanales suficientes para calcular pico de riesgo.",
    },
    {
      icon: "repeat",
      color: Number(simsPerPerson) < 1 ? "var(--danger)" : Number(simsPerPerson) < 2 ? "var(--warning)" : "var(--success)",
      severity: Number(simsPerPerson) < 1 ? "high" : Number(simsPerPerson) < 2 ? "med" : "low",
      label: "Frecuencia de entrenamiento",
      stat: simsPerPerson,
      statLabel: "simulaciones por persona",
      bar: Math.min(100, Math.round((Number(simsPerPerson) / 4) * 100)), // 4/persona = 100%
      barColor: Number(simsPerPerson) < 1 ? "var(--danger)" : Number(simsPerPerson) < 2 ? "var(--warning)" : "var(--success)",
      desc: Number(simsPerPerson) < 1
        ? `Con ${simsPerPerson} pruebas/persona la resiliencia no mejora. El estándar de la industria recomienda 4–6 por trimestre para generar un cambio de comportamiento medible.`
        : Number(simsPerPerson) < 2
        ? `${simsPerPerson} pruebas/persona es insuficiente. Aumentar a 4+ al trimestre reduce la tasa de caídas hasta un 40% según benchmarks del sector.`
        : `Buena cadencia con ${simsPerPerson} pruebas/persona. Sigue manteniendo esta frecuencia para consolidar la resiliencia.`,
    },
    {
      icon: "shield-check",
      color: avgResistance == null ? "var(--text-faint)" : avgResistance >= 75 ? "var(--success)" : avgResistance >= 50 ? "var(--warning)" : "var(--danger)",
      severity: avgResistance == null || avgResistance < 50 ? "high" : avgResistance < 75 ? "med" : "low",
      label: "Resistencia global",
      stat: avgResistance != null ? `${avgResistance}%` : "--",
      statLabel: "promedio de toda la org",
      bar: avgResistance ?? 0,
      barColor: avgResistance >= 75 ? "var(--success)" : avgResistance >= 50 ? "var(--warning)" : "var(--danger)",
      desc: avgResistance == null
        ? "Sin simulaciones resueltas todavía. La resistencia se calculará automáticamente al tener interacciones."
        : avgResistance >= 75
        ? `${avgResistance}% de resistencia org. Excelente — estás por encima del benchmark de la industria (70%). Manten la cadencia.`
        : avgResistance >= 50
        ? `${avgResistance}% de resistencia. Rango medio — hay ${deptStats.filter((d) => d.avg != null && d.avg < 50).length} área(s) por debajo del 50% que requieren atención inmediata.`
        : `${avgResistance}% de resistencia es crítico. Más de la mitad del equipo caíe ante simulaciones básicas. Prioriza entrenamiento urgente.`,
    },
  ];
}

// Severity pill component
function SeverityBadge({ level }) {
  const cfg = {
    high: { label: "Riesgo alto",   bg: "var(--danger-soft)",  fg: "var(--danger)" },
    med:  { label: "Riesgo medio",  bg: "var(--warning-soft)", fg: "var(--warning)" },
    low:  { label: "Riesgo bajo",   bg: "var(--success-soft)", fg: "var(--success)" },
  };
  const { label, bg, fg } = cfg[level] || cfg.med;
  return (
    <span style={{ background: bg, color: fg, fontFamily: "var(--font-mono)", fontSize: 9,
      fontWeight: 700, padding: "2px 7px", borderRadius: 99, textTransform: "uppercase", letterSpacing: ".06em" }}>
      {label}
    </span>
  );
}

function HackabilityHero({ avgRisk, avgResistance, trend, weakest, radarAxes, riskFactors }) {
  const [open, setOpen] = useState(false);
  const [selFactor, setSelFactor] = useState(null);

  const riskColor = avgRisk == null ? "var(--text-faint)"
    : avgRisk > 600 ? "var(--danger)"
    : avgRisk > 300 ? "var(--warning)"
    : "var(--success)";

  return (
    <div className="hack-panel">
      <div className="hack-panel__glow" />

      <div className="hack-panel__wordmark">
        <span className="hack-panel__pre">Índice de</span>
        <span className="hack-panel__title">HACKABILIDAD</span>
        <span className="hack-panel__sub">Platanus Org · {new Date().getFullYear()}</span>
      </div>

      <div className="hack-panel__meter">
        {avgRisk != null
          ? <RiskMeter value={avgRisk} max={900} caption="HACKABILIDAD" size={240} />
          : <div style={{ padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>Sin datos todavía</div>}
      </div>

      {avgRisk != null && (
        <div className="hack-panel__ribbon">
          <div className="hack-panel__stat">
            <span className="hack-panel__stat-val" style={{ color: riskColor }}><AnimatedNumber target={avgRisk} /></span>
            <span className="hack-panel__stat-lbl">de 900</span>
          </div>
          <div className="hack-panel__divider" />
          <div className="hack-panel__stat">
            <span className="hack-panel__stat-val" style={{ color: "var(--success)" }}>
              {avgResistance != null ? <><AnimatedNumber target={avgResistance} /><span style={{ fontSize: 15 }}>%</span></> : "—"}
            </span>
            <span className="hack-panel__stat-lbl">Resistencia</span>
          </div>
          {weakest && (
            <>
              <div className="hack-panel__divider" />
              <div className="hack-panel__stat">
                <span className="hack-panel__stat-val" style={{ fontSize: 13, color: "var(--warning)" }}>{weakest.dept}</span>
                <span className="hack-panel__stat-lbl">Área débil</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="hack-panel__charts">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Perfil de riesgo</div>
          <RadarChart axes={radarAxes} size={150} />
        </div>
        {trend.length > 1 && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Caídas · {trend.length} sem</div>
            <SmoothAreaChart data={trend} color="var(--danger)" height={80} gradId="hackt" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>Antes</span>
              <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>Hoy</span>
            </div>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button className="hack-panel__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Icon name={open ? "chevron-up" : "chevron-down"} />
        {open ? "Ocultar análisis" : "¿Por qué eres hackeable?"}
      </button>

      {/* Data-driven factors panel */}
      <div className={"hack-reasons" + (open ? " hack-reasons--open" : "")}>
        <div className="hack-reasons__inner">
          {riskFactors.map((rf, i) => (
            <button
              key={rf.label}
              className={"hack-factor" + (selFactor === i ? " hack-factor--open" : "")}
              onClick={() => setSelFactor(selFactor === i ? null : i)}
              style={{ "--hf-color": rf.color }}
            >
              {/* Header row */}
              <div className="hack-factor__head">
                <div className="hack-factor__ic"><Icon name={rf.icon} /></div>
                <div className="hack-factor__title">{rf.label}</div>
                <SeverityBadge level={rf.severity} />
              </div>
              {/* Big stat + bar */}
              <div className="hack-factor__stat-row">
                <span className="hack-factor__big">{rf.stat}</span>
                <span className="hack-factor__stat-lbl">{rf.statLabel}</span>
              </div>
              <div className="hack-factor__bar-bg">
                <div className="hack-factor__bar-fill"
                  style={{ width: `${Math.min(rf.bar, 100)}%`, background: rf.barColor }} />
              </div>
              {/* Expandable detail — grid animation so card never collapses abruptly */}
              <div className="hack-factor__detail-wrap" style={{ display: "grid", gridTemplateRows: selFactor === i ? "1fr" : "0fr", transition: "grid-template-rows 280ms var(--ease-out)" }}>
                <div style={{ overflow: "hidden" }}>
                  <div className="hack-factor__detail">{rf.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Custom illustrated icons ─────────────────────────────────────────

function IconRisk({ fg }) {
  const cx = 11; const cy = 13.5; const r = 7.5;
  const arc = (deg, rr) => [cx + Math.cos((deg * Math.PI) / 180) * (rr||r), cy + Math.sin((deg * Math.PI) / 180) * (rr||r)];
  const ticks = [-145,-110,-75,-40,-5,30].map((a) => ({ o: arc(a,r), i: arc(a,r-2.6) }));
  const [nx,ny] = arc(-80, r-0.5);
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M 3.5 14 A 8 8 0 0 1 18.5 14" stroke={fg} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.18" fill="none"/>
      <path d="M 3.5 14 A 8 8 0 0 1 10 6.5" stroke={fg} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      {ticks.map((t,i) => <line key={i} x1={t.o[0]} y1={t.o[1]} x2={t.i[0]} y2={t.i[1]} stroke={fg} strokeWidth={i===0||i===5?1.4:0.9} strokeOpacity={i===0||i===5?0.9:0.5} strokeLinecap="round"/>)}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={fg} strokeWidth="2" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="1.8" fill={fg}/>
      <circle cx={cx} cy={cy} r="1" fill="var(--surface)"/>
      {[7,9,11,13,15].map((x) => <line key={x} x1={x} y1="18.5" x2={x} y2="19.5" stroke={fg} strokeWidth="0.9" strokeOpacity="0.38" strokeLinecap="round"/>)}
    </svg>
  );
}

function IconVoices({ fg }) {
  const bars = [2,4,7,9,7,10,8,6,10,7,5,3];
  const bw = 1.2; const gap = (18 - bars.length * bw) / (bars.length - 1);
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {bars.map((h,i) => <rect key={i} x={2+i*(bw+gap)} y={3+(7-(h/10*6.5))/2} width={bw} height={h/10*6.5} rx="0.6" fill={fg} fillOpacity={i>=4&&i<=7?0.95:0.38+(h/10)*0.4}/>)}
      <rect x="8.2" y="11" width="5.6" height="7" rx="2.8" stroke={fg} strokeWidth="1.4" fill="none"/>
      <line x1="9.5" y1="13.5" x2="12.5" y2="13.5" stroke={fg} strokeWidth="0.9" strokeOpacity="0.45" strokeLinecap="round"/>
      <line x1="9.5" y1="15.2" x2="12.5" y2="15.2" stroke={fg} strokeWidth="0.9" strokeOpacity="0.45" strokeLinecap="round"/>
      <path d="M 7.5 16.5 Q 7.5 20 11 20 Q 14.5 20 14.5 16.5" stroke={fg} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeOpacity="0.65"/>
      <line x1="11" y1="20" x2="11" y2="21.5" stroke={fg} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.65"/>
      <line x1="9" y1="21.5" x2="13" y2="21.5" stroke={fg} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5"/>
    </svg>
  );
}

function IconResistance({ fg }) {
  const hex = (cx,cy,r,rot) => Array.from({length:6},(_,i)=>{const a=(60*i+(rot||0))*Math.PI/180; return `${(cx+r*Math.cos(a)).toFixed(2)},${(cy+r*Math.sin(a)).toFixed(2)}`;}).join(" ");
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <polygon points={hex(11,11,9.5,30)} stroke={fg} strokeWidth="0.9" fill="none" strokeOpacity="0.2"/>
      <polygon points={hex(11,11,7,30)} stroke={fg} strokeWidth="1.2" fill="none" strokeOpacity="0.45"/>
      <polygon points={hex(11,11,4.8,30)} stroke={fg} strokeWidth="1.6" fill={fg} fillOpacity="0.12"/>
      {Array.from({length:6},(_,i)=>{const a=(60*i+30)*Math.PI/180; const mx=11+7*Math.cos(a); const my=11+7*Math.sin(a); return (<g key={i}><circle cx={mx} cy={my} r="1.1" fill={fg} fillOpacity="0.65"/><line x1={mx} y1={my} x2={11+4.8*Math.cos(a)} y2={11+4.8*Math.sin(a)} stroke={fg} strokeWidth="0.7" strokeOpacity="0.3"/></g>);})}
      <polyline points="8.2,11.5 10.3,13.7 14.2,9.2" stroke={fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSims({ fg }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M 4.5 17.5 Q 4 10.5 11 6.5" stroke={fg} strokeWidth="1" fill="none" strokeOpacity="0.2" strokeLinecap="round"/>
      <path d="M 17.5 17.5 Q 18 10.5 11 6.5" stroke={fg} strokeWidth="1" fill="none" strokeOpacity="0.2" strokeLinecap="round"/>
      <path d="M 6.5 17.5 Q 6 12 11 9" stroke={fg} strokeWidth="1.3" fill="none" strokeOpacity="0.45" strokeLinecap="round"/>
      <path d="M 15.5 17.5 Q 16 12 11 9" stroke={fg} strokeWidth="1.3" fill="none" strokeOpacity="0.45" strokeLinecap="round"/>
      <path d="M 8.5 17.5 Q 8.5 13.5 11 12" stroke={fg} strokeWidth="1.7" fill="none" strokeOpacity="0.8" strokeLinecap="round"/>
      <path d="M 13.5 17.5 Q 13.5 13.5 11 12" stroke={fg} strokeWidth="1.7" fill="none" strokeOpacity="0.8" strokeLinecap="round"/>
      <circle cx="11" cy="11.5" r="2" fill={fg}/>
      <circle cx="11" cy="11.5" r="3.5" stroke={fg} strokeWidth="0.8" fill="none" strokeOpacity="0.28"/>
      <line x1="11" y1="13.5" x2="11" y2="20" stroke={fg} strokeWidth="1.7" strokeLinecap="round"/>
      <line x1="8" y1="20" x2="14" y2="20" stroke={fg} strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.65"/>
      <circle cx="11" cy="6" r="1" fill={fg} fillOpacity="0.45"/>
    </svg>
  );
}

const CARD_ICONS = {
  risk:       (fg) => <IconRisk fg={fg} />,
  voices:     (fg) => <IconVoices fg={fg} />,
  resistance: (fg) => <IconResistance fg={fg} />,
  sims:       (fg) => <IconSims fg={fg} />,
};

// ── Expandable metric card ───────────────────────────────────────────────
function MetricCard({ id, expanded, onExpand, icon, tone, label, value, unit, foot, sparkData, sparkColor, children }) {
  const isOpen = expanded === id;
  const colors = {
    danger:  { bg: "var(--danger-soft)",  fg: "var(--danger)" },
    signal:  { bg: "var(--signal-soft)",  fg: "var(--signal)" },
    success: { bg: "var(--success-soft)", fg: "var(--success)" },
    primary: { bg: "var(--primary-soft)", fg: "var(--primary)" },
  };
  const { bg, fg } = colors[tone] || colors.primary;
  const CustomIcon = CARD_ICONS[id];

  return (
    <div className={"mcard" + (isOpen ? " mcard--open" : "")} style={{ "--mcard-fg": fg, "--mcard-bg": bg }}>
      <button className="mcard__header" onClick={() => onExpand(isOpen ? null : id)} aria-expanded={isOpen}>
        <div className="mcard__icon">
          {CustomIcon ? CustomIcon(fg) : <Icon name={icon} />}
        </div>
        <div className="mcard__info">
          <div className="mcard__label">{label}</div>
          <div className="mcard__value">{value}<span className="mcard__unit">{unit}</span></div>
          {!isOpen && foot && <div className="mcard__foot">{foot}</div>}
        </div>
        {/* Sparkline WITH axes — always visible when collapsed */}
        {!isOpen && sparkData && sparkData.length > 1 && (
          <div className="mcard__spark">
            <SmoothAreaChart data={sparkData} color={sparkColor || fg} gradId={`sp${id}`} />
          </div>
        )}
        <div className="mcard__chevron"><Icon name={isOpen ? "chevron-up" : "chevron-down"} /></div>
      </button>
      <div className="mcard__body">
        <div className="mcard__body-inner">{children}</div>
      </div>
    </div>
  );
}
// ── Main component ───────────────────────────────────────────────────────────
export function DashboardScreen({ openCampaigns }) {
  const { org, empresaId } = useOrg();
  const isMock = !org.useRealData;

  const [people, setPeople] = useState(null);
  const [sims, setSims] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(false);
  const [layout, saveLayout, resetLayout] = useLayout();

  // drag state
  const drag = useRef(null); // { col, idx }
  const [dragOverCol, setDragOverCol] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDragStart = useCallback((col, idx) => { drag.current = { col, idx }; }, []);
  const handleDragEnd   = useCallback(() => { drag.current = null; setDragOverCol(null); setDragOverIdx(null); }, []);
  const handleDragEnterWidget = useCallback((col, idx) => { setDragOverCol(col); setDragOverIdx(idx); }, []);
  const handleDragEnterCol    = useCallback((col) => { setDragOverCol(col); }, []);
  const handleDrop = useCallback((col) => {
    if (!drag.current) return;
    const insertIdx = dragOverIdx != null ? dragOverIdx : layout[col].length;
    saveLayout(moveWidget(layout, drag.current.col, drag.current.idx, col, insertIdx));
    drag.current = null; setDragOverCol(null); setDragOverIdx(null);
  }, [layout, saveLayout, dragOverIdx]);

  useEffect(() => {
    if (isMock) { setPeople([]); setSims([]); return; }
    let active = true;
    Promise.all([fetchPeople({ empresaId }), fetchSimulacionesFlat(100, { empresaId })])
      .then(([p, s]) => { if (active) { setPeople(p); setSims(s); } })
      .catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [isMock, org.id]);

  if (error) return <Card variant="sunken" style={{ color: "var(--danger)" }}>Error: {error}</Card>;
  if (people === null || sims === null) {
    return <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Cargando resumen…</div>;
  }

  // ── derived data — real (Platanus) or mock (Altur)
  const ms = org.mockStats || {};
  const avgResistance = isMock ? ms.avgResistance : (() => {
    const wr = people.filter((p) => p.resistance != null);
    return wr.length ? Math.round(wr.reduce((a, p) => a + p.resistance, 0) / wr.length) : null;
  })();
  const avgRisk = isMock ? ms.avgRisk : riskFromResistance(avgResistance);
  const consentedCount = isMock ? ms.consentedCount : people.filter((p) => p.voice === "consented").length;
  const pendingCount  = isMock ? ms.pendingCount   : people.filter((p) => p.voice === "pending").length;
  const expiredCount  = isMock ? ms.expiredCount   : people.filter((p) => p.voice === "expired").length;
  const activeSims = isMock ? ms.activeSims : sims.filter((s) => s.estado === "active" || s.estado === "pendiente").length;
  const recent = isMock ? (ms.recentSims || []) : sims.slice(0, 5);

  // Weekly breakdown
  const weeklyStats = isMock ? (ms.weeklyStats || []) : buildWeeklyStats(sims);
  const voiceAdoption = isMock ? [] : buildVoiceAdoptionWeekly(people);

  // Dept breakdown
  const deptStats = isMock ? (ms.deptStats || []) : (() => {
    const byDept = new Map();
    for (const p of people) {
      const d = byDept.get(p.dept) || { count: 0, sum: 0, n: 0 };
      d.count += 1;
      if (p.resistance != null) { d.sum += p.resistance; d.n += 1; }
      byDept.set(p.dept, d);
    }
    return Array.from(byDept.entries())
      .map(([dept, v]) => ({ dept, count: v.count, avg: v.n ? Math.round(v.sum / v.n) : null }))
      .sort((a, b) => (a.avg ?? 100) - (b.avg ?? 100));
  })();
  const weakest = deptStats.find((d) => d.avg != null);

  const simOutcomes = isMock
    ? { compromised: ms.compromised || 0, resisted: ms.resisted || 0, sent: activeSims }
    : {
        compromised: sims.filter((s) => simOutcome(s) === "compromised").length,
        resisted:    sims.filter((s) => simOutcome(s) === "resisted").length,
        sent:        activeSims,
      };

  // Chart point arrays from real data
  const fallRatePoints  = weeklyStats.map((w) => ({ label: w.label, value: w.fallRate }));
  const resistPoints    = weeklyStats.map((w) => ({ label: w.label, value: w.resistRate }));
  const simsPerWeek     = weeklyStats.map((w) => ({ label: w.label, value: w.total }));
  const voicePoints     = voiceAdoption.map((v) => ({ label: v.label, value: v.count }));
  // Sparklines (plain arrays)
  const sparkFall   = fallRatePoints.map((p) => p.value);
  const sparkRes    = resistPoints.map((p) => p.value);
  const sparkSims   = simsPerWeek.map((p) => p.value);
  const sparkVoice  = voicePoints.map((p) => p.value);

  const radarAxes = [
    { label: "Ing.Social", value: simOutcomes.compromised > 0 ? Math.min(100, Math.round((simOutcomes.compromised / Math.max(sims.length, 1)) * 100 * 1.4)) : 50 },
    { label: "Voces",      value: people.length ? Math.round((1 - consentedCount / people.length) * 100) : 50 },
    { label: "Velocidad",  value: 68 },
    { label: "Áreas",      value: weakest ? Math.round((1 - (weakest.avg ?? 50) / 100) * 100) : 50 },
    { label: "Frecuencia", value: activeSims > 4 ? 20 : Math.min(90, Math.round((1 - Math.min(activeSims, 10) / 10) * 90)) },
    { label: "Resistencia",value: avgResistance != null ? Math.round(100 - avgResistance) : 60 },
  ];

  // ── Campaigns panel (bottom right)
  const recentSentSims = sims.slice(0, 8);
  const campaigns = isMock
    ? {
        live:      (ms.recentSims || []).filter((s) => s.outcome === "sent"),
        completed: (ms.recentSims || []).filter((s) => s.outcome !== "sent"),
      }
    : {
        live:      sims.filter((s) => s.estado === "active" || s.estado === "pendiente"),
        completed: sims.filter((s) => s.estado === "done" || s.estado === "error"),
      };

  const riskFactors = buildRiskFactors({
    simOutcomes, simsTotal: sims.length, consentedCount,
    peopleCount: people.length, weakest, deptStats,
    avgResistance, activeSims, weeklyStats,
  });

  // ── widget render map
  const WIDGET_CONTENT = {
    hackability: (
      <HackabilityHero avgRisk={avgRisk} avgResistance={avgResistance}
        trend={sparkFall} weakest={weakest} radarAxes={radarAxes}
        riskFactors={riskFactors} />
    ),
    risk: (
      <MetricCard id="risk" expanded={expanded} onExpand={setExpanded}
        icon="gauge" tone="danger" label="Puntaje de riesgo"
        value={avgRisk ?? "—"} foot="Más bajo es mejor"
        sparkData={sparkFall.length ? sparkFall : null} sparkColor="var(--danger)">
        <div className="mcard__expand-layout">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Riesgo por área</div>
            {deptStats.length === 0
              ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Sin datos.</div>
              : deptStats.map((d) => (
                <div key={d.dept} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{d.dept}</span>
                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {d.avg != null ? `${d.avg}% res.` : "—"} · {d.count}p
                    </span>
                  </div>
                  {d.avg != null && <ProgressBar value={d.avg} showValue={false} tone={d.avg >= 75 ? "success" : d.avg >= 50 ? "warning" : "danger"} />}
                </div>
              ))}
            <div style={{ marginTop: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Distribución total ({sims.length} sims)</div>
              <MultiRingDonut size={110} segments={[
                { value: simOutcomes.compromised, max: sims.length || 1, color: "var(--danger)",  label: "Cayeron" },
                { value: simOutcomes.resisted,    max: sims.length || 1, color: "var(--success)", label: "Resistieron" },
                { value: simOutcomes.sent,         max: sims.length || 1, color: "var(--primary)", label: "En espera" },
              ]} />
              {[
                { label: "Cayeron",     val: simOutcomes.compromised, color: "var(--danger)" },
                { label: "Resistieron", val: simOutcomes.resisted,    color: "var(--success)" },
                { label: "En espera",   val: simOutcomes.sent,         color: "var(--primary)" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: row.color, flex: "none" }} />
                  <span style={{ fontSize: 12, color: "var(--text-body)", flex: 1 }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Tasa de caídas · semanas reales</div>
            {fallRatePoints.length >= 2
              ? <AxesAreaChart points={fallRatePoints} color="var(--danger)" height={150} gradId="risk1" yLabel="%" />
              : <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}>Sin semanas con datos resueltos todavía.</div>}
            <div style={{ marginTop: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Perfil de vectores</div>
              <RadarChart axes={radarAxes} size={160} />
            </div>
          </div>
        </div>
      </MetricCard>
    ),
    voices: (
      <MetricCard id="voices" expanded={expanded} onExpand={setExpanded}
        icon="mic" tone="signal" label="Voces consentidas"
        value={consentedCount} unit={` / ${people.length}`}
        foot={`${pendingCount} pendientes`}
        sparkData={sparkVoice.length ? sparkVoice : null} sparkColor="var(--signal)">
        <div className="mcard__expand-layout">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Estado de {people.length} personas</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <MultiRingDonut size={120} segments={[
                { value: consentedCount, max: people.length || 1, color: "var(--signal)",    label: "Consentidas" },
                { value: pendingCount,   max: people.length || 1, color: "var(--text-faint)",label: "Pendientes" },
                { value: expiredCount,   max: people.length || 1, color: "var(--warning)",   label: "Caducadas" },
              ]} />
            </div>
            {[
              { label: "Consentidas", val: consentedCount, color: "var(--signal)" },
              { label: "Pendientes",  val: pendingCount,   color: "var(--text-faint)" },
              { label: "Caducadas",   val: expiredCount,   color: "var(--warning)" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: row.color, flex: "none" }} />
                <span style={{ fontSize: 12, color: "var(--text-body)", flex: 1 }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{row.val}</span>
              </div>
            ))}
            <Button variant="soft" size="sm" icon="send" fullWidth style={{ marginTop: 14 }} onClick={() => {}}>Invitar pendientes</Button>
            <div style={{ marginTop: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Cobertura por área</div>
              {deptStats.map((d) => {
                const dp = people.filter((p) => p.dept === d.dept);
                const dc = dp.filter((p) => p.voice === "consented").length;
                return (
                  <div key={d.dept} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{d.dept}</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{dc}/{dp.length}</span>
                    </div>
                    <ProgressBar value={dp.length ? Math.round((dc / dp.length) * 100) : 0} showValue={false} tone="signal" />
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Adopción acumulada (real)</div>
            {voicePoints.length >= 2
              ? <AxesAreaChart points={voicePoints} color="var(--signal)" height={150} gradId="voice1" yLabel=" voces" />
              : <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}>Sin historial de grabaciones todavía.</div>}
          </div>
        </div>
      </MetricCard>
    ),
    resistance: (
      <MetricCard id="resistance" expanded={expanded} onExpand={setExpanded}
        icon="shield-check" tone="success" label="Resistencia media"
        value={avgResistance ?? "—"} unit={avgResistance != null ? "%" : ""}
        foot="Mayor es mejor"
        sparkData={sparkRes.length ? sparkRes : null} sparkColor="var(--success)">
        <div className="mcard__expand-layout">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Resistencia por área</div>
            {deptStats.length === 0
              ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Sin datos.</div>
              : deptStats.map((d) => (
                <div key={d.dept} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{d.dept}</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{d.avg != null ? `${d.avg}%` : "—"}</span>
                  </div>
                  {d.avg != null && <ProgressBar value={d.avg} showValue={false} tone={d.avg >= 75 ? "success" : d.avg >= 50 ? "warning" : "danger"} />}
                </div>
            ))}
            <div style={{ marginTop: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Personas en riesgo alto</div>
              {people.filter((p) => p.risk === "high").length === 0
                ? <div style={{ fontSize: 12, color: "var(--success)" }}>✓ Sin personas en riesgo alto</div>
                : people.filter((p) => p.risk === "high").slice(0, 4).map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--danger-soft)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flex: "none" }}>{p.name.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.dept}</div>
                    </div>
                    <span className="risk-tag risk-tag--high" style={{ fontSize: 10 }}>Alto</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Resistencia semanal (real)</div>
            {resistPoints.length >= 2
              ? <AxesAreaChart points={resistPoints} color="var(--success)" height={150} gradId="res1" yLabel="%" />
              : <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}>Sin simulaciones resueltas todavía.</div>}
            {resistPoints.length >= 2 && fallRatePoints.length >= 2 && (
              <div style={{ marginTop: 18 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Resistencia vs Caídas</div>
                <StackedAxesChart
                  series={[
                    { data: resistPoints.map((p) => p.value), color: "var(--success)" },
                    { data: fallRatePoints.map((p) => p.value), color: "var(--danger)" },
                  ]}
                  labels={resistPoints.map((p) => p.label)}
                  height={120} gradId="rescomp" yLabel="%"
                />
                <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 3, borderRadius: 2, background: "var(--success)" }} /><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Resistencia</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 3, borderRadius: 2, background: "var(--danger)" }} /><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Caídas</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MetricCard>
    ),
    sims: (
      <MetricCard id="sims" expanded={expanded} onExpand={setExpanded}
        icon="radio" tone="primary" label="Simulaciones activas"
        value={activeSims} foot={`${sims.length} total enviadas`}
        sparkData={sparkSims.length ? sparkSims : null} sparkColor="var(--primary)">
        <div className="mcard__expand-layout">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Actividad reciente</div>
            {recent.length === 0
              ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Sin simulaciones todavía.</div>
              : recent.map((s) => {
                  const oc = simOutcome(s);
                  return (
                    <div className="act" key={s.id}>
                      <div className={"act__ch act__ch--" + (oc === "compromised" ? "signal" : "success")}><Icon name="audio-lines" /></div>
                      <div className="act__main">
                        <div className="act__name">{s.empleados?.nombre_completo || "Sin destinatario"}</div>
                        <div className="act__meta">{s.empleados?.departamento || "—"} · {fmtRelative(s.fecha_envio)}</div>
                      </div>
                      <StatusPill status={oc === "compromised" ? "live" : oc === "resisted" ? "success" : "scheduled"}>
                        {OUTCOME_LABEL[oc]}
                      </StatusPill>
                    </div>
                  );
                })}
            <Button variant="link" iconRight="arrow-right" onClick={openCampaigns} style={{ marginTop: 12 }}>Ver todas</Button>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Simulaciones por semana (real)</div>
            {simsPerWeek.length >= 2
              ? <AxesBarChart bars={simsPerWeek} color="var(--primary)" height={150} gradId="sim1" />
              : <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "20px 0" }}>Sin datos semanales todavía.</div>}
            <div style={{ marginTop: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Siguiente sugerencia</div>
              <Card variant="soft" padding="sm">
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Icon name="sparkles" style={{ color: "var(--primary)", width: 16, height: 16, marginTop: 1, flex: "none" }} />
                  <div style={{ fontSize: 12, color: "var(--text-body)", lineHeight: 1.5 }}>
                    {weakest ? `Lanza una prueba a ${weakest.dept} — resistencia de solo ${weakest.avg}%.` : "Agrega personas y lanza simulaciones."}
                  </div>
                </div>
                <Button variant="primary" size="sm" icon="rocket" fullWidth style={{ marginTop: 10 }} onClick={openCampaigns}>Preparar prueba</Button>
              </Card>
            </div>
          </div>
        </div>
      </MetricCard>
    ),
  };

  // ── Campaigns plan panel
  const CampaignsPlanPanel = (
    <div className="camps-panel">
      <div className="camps-panel__head">
        <div>
          <div className="eyebrow">Plan de campañas</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-strong)", marginTop: 2 }}>Simulaciones activas y programadas</div>
        </div>
        <Button variant="soft" size="sm" icon="plus" onClick={openCampaigns}>Nueva</Button>
      </div>

      {/* Status ribbon */}
      <div className="camps-ribbon">
        {[
          { label: "En vivo",      val: campaigns.live.length,      color: "var(--signal)",   bg: "var(--signal-soft)" },
          { label: "Completadas",  val: campaigns.completed.length,  color: "var(--success)",  bg: "var(--success-soft)" },
          { label: "Total sims",   val: sims.length,                  color: "var(--primary)",  bg: "var(--primary-soft)" },
          { label: "Cayeron",      val: simOutcomes.compromised,      color: "var(--danger)",   bg: "var(--danger-soft)" },
        ].map((s) => (
          <div key={s.label} className="camps-stat" style={{ "--cs-color": s.color, "--cs-bg": s.bg }}>
            <span className="camps-stat__val">{s.val}</span>
            <span className="camps-stat__lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Volume chart */}
      {simsPerWeek.length >= 2 && (
        <div style={{ marginBottom: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Volumen semanal</div>
          <AxesBarChart bars={simsPerWeek} color="var(--primary)" height={110} gradId="campb" />
        </div>
      )}

      {/* Live sims list */}
      <div className="eyebrow" style={{ marginBottom: 8 }}>En curso ({campaigns.live.length})</div>
      {campaigns.live.length === 0 ? (
        <div className="camps-empty">
          <Icon name="radio" />
          <span>Sin simulaciones activas. <button onClick={openCampaigns} style={{ color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Lanzar una</button></span>
        </div>
      ) : campaigns.live.slice(0, 4).map((s) => (
        <div key={s.id} className="camp-row">
          <div className="camp-row__dot" style={{ background: "var(--signal)" }} />
          <div className="camp-row__main">
            <div className="camp-row__name">{s.empleados?.nombre_completo || "Sin destinatario"}</div>
            <div className="camp-row__meta">{s.empleados?.departamento || "—"} · {fmtRelative(s.fecha_envio)}</div>
          </div>
          <StatusPill status="scheduled">Enviada</StatusPill>
        </div>
      ))}

      {/* Recently closed */}
      {campaigns.completed.length > 0 && (
        <>
          <div className="eyebrow" style={{ margin: "14px 0 8px" }}>Completadas recientes ({campaigns.completed.length})</div>
          {campaigns.completed.slice(0, 4).map((s) => {
            const oc = simOutcome(s);
            return (
              <div key={s.id} className="camp-row">
                <div className="camp-row__dot" style={{ background: oc === "compromised" ? "var(--danger)" : "var(--success)" }} />
                <div className="camp-row__main">
                  <div className="camp-row__name">{s.empleados?.nombre_completo || "Sin destinatario"}</div>
                  <div className="camp-row__meta">{s.empleados?.departamento || "—"} · {fmtRelative(s.fecha_envio)}</div>
                </div>
                <StatusPill status={oc === "compromised" ? "live" : "success"}>
                  {OUTCOME_LABEL[oc]}
                </StatusPill>
              </div>
            );
          })}
        </>
      )}

      <Button variant="link" iconRight="arrow-right" onClick={openCampaigns} style={{ marginTop: 12 }}>Ver plan completo</Button>
    </div>
  );

  const renderCol = (col) => (
    <>
      {layout[col].map((id, idx) => (
        <DraggableWidget
          key={id} id={id} col={col} idx={idx}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragEnter={handleDragEnterWidget}
          isDragOver={dragOverCol === col && dragOverIdx === idx}
        >
          {WIDGET_CONTENT[id]}
        </DraggableWidget>
      ))}
      {/* Campaigns panel always at the bottom of the right col */}
      {col === "right" && (
        <DraggableWidget
          key="campaigns" id="campaigns" col="right" idx={layout.right.length}
          onDragStart={() => {}} onDragEnd={() => {}} onDragEnter={() => {}}
          isDragOver={false}
        >
          {CampaignsPlanPanel}
        </DraggableWidget>
      )}
    </>
  );

  return (
    <EditCtx.Provider value={{ editing }}>
      <div>
        {/* Page head */}
        <div className="page-head" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow">{org.name} · {isMock ? ms.peopleCount : people.length} personas</div>
            <h1>Hola de nuevo, {org.adminName.split(" ")[0]}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 15, marginTop: 4 }}>
              {avgResistance != null
                ? `Resistencia media: ${avgResistance}%. ${weakest ? `${weakest.dept} es el área con más riesgo.` : ""}`
                : "Aún no hay simulaciones resueltas para calcular resiliencia."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, paddingTop: 4 }}>
            {editing ? (
              <>
                <button className="edit-btn edit-btn--reset" onClick={() => { resetLayout(); }}
                  title="Restaurar layout por defecto">
                  <Icon name="rotate-ccw" /> Restaurar
                </button>
                <button className="edit-btn edit-btn--done" onClick={() => setEditing(false)}>
                  <Icon name="check" /> Listo
                </button>
              </>
            ) : (
              <button className="edit-btn" onClick={() => setEditing(true)}>
                <Icon name="layout-dashboard" /> Personalizar layout
              </button>
            )}
          </div>
        </div>

        {/* Edit mode banner */}
        {editing && (
          <div className="edit-banner">
            <Icon name="grip-vertical" />
            Modo edición — arrastra los widgets entre columnas o cambia su orden dentro de cada una.
          </div>
        )}

        {/* Split layout */}
        <div className={"dash-split" + (editing ? " dash-split--editing" : "")}>
          <DropColumn col="left"  layout={layout} onDragEnterCol={handleDragEnterCol} onDrop={handleDrop}>
            {renderCol("left")}
          </DropColumn>
          <DropColumn col="right" layout={layout} onDragEnterCol={handleDragEnterCol} onDrop={handleDrop}>
            {renderCol("right")}
          </DropColumn>
        </div>
      </div>
    </EditCtx.Provider>
  );
}
