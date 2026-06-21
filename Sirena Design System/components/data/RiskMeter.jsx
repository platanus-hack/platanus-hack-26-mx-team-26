import React from 'react';

const CSS = `
.sr-risk{ display:flex; flex-direction:column; align-items:center; font-family:var(--font-body); }
.sr-risk__svg{ display:block; }
.sr-risk__track{ stroke:var(--surface-inset); }
.sr-risk__value{ font-family:var(--font-display); font-weight:700; fill:var(--text-strong); }
.sr-risk__cap{ font-family:var(--font-mono); font-size:11px; letter-spacing:.06em; text-transform:uppercase; fill:var(--text-muted); font-weight:700; }
.sr-risk__ends{ display:flex; justify-content:space-between; width:100%; margin-top:-6px; font-family:var(--font-mono); font-size:12px; color:var(--text-faint); }
.sr-risk__sub{ font-size:13px; color:var(--text-muted); margin-top:6px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-risk-css')) {
  const s = document.createElement('style'); s.id = 'sr-risk-css'; s.textContent = CSS; document.head.appendChild(s);
}

/* Lower score = lower risk (like the references' 0..max gauge). */
function zoneColor(ratio) {
  if (ratio <= 0.33) return 'var(--success)';
  if (ratio <= 0.66) return 'var(--warning)';
  return 'var(--danger)';
}

export function RiskMeter({ value = 0, max = 900, min = 0, size = 240, label = 'Risk score', sublabel, caption }) {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = size / 2 - 18;
  const cx = size / 2;
  const cy = size / 2;
  const circ = Math.PI * r;            // half circle length
  const dash = circ;
  const offset = circ * (1 - ratio);
  const h = size / 2 + 26;
  const color = zoneColor(ratio);
  return (
    <div className="sr-risk" style={{ width: size }}>
      <svg className="sr-risk__svg" width={size} height={h} viewBox={`0 0 ${size} ${h}`} role="img" aria-label={`${label} ${value} of ${max}`}>
        <path className="sr-risk__track" fill="none" strokeWidth="16" strokeLinecap="round"
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} />
        <path fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
              strokeDasharray={dash} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 700ms var(--ease-out), stroke 400ms ease' }}
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} />
        <text className="sr-risk__value" x={cx} y={cy - 6} textAnchor="middle" fontSize={size * 0.2}>{value}</text>
        {caption && <text className="sr-risk__cap" x={cx} y={cy + 16} textAnchor="middle">{caption}</text>}
      </svg>
      <div className="sr-risk__ends"><span>{min}</span><span>{max}</span></div>
      {sublabel && <div className="sr-risk__sub">{sublabel}</div>}
    </div>
  );
}
