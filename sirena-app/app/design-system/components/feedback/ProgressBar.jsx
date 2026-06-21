import React from 'react';

const CSS = `
.sr-prog{ display:flex; flex-direction:column; gap:7px; font-family:var(--font-body); width:100%; }
.sr-prog__top{ display:flex; justify-content:space-between; align-items:baseline; }
.sr-prog__label{ font-size:13px; font-weight:600; color:var(--text-strong); }
.sr-prog__val{ font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--text-muted); }
.sr-prog__track{ height:9px; border-radius:var(--radius-pill); background:var(--surface-inset); overflow:hidden; }
.sr-prog__track--lg{ height:12px; }
.sr-prog__fill{ height:100%; border-radius:var(--radius-pill); background:var(--primary); transition:width var(--dur-slow) var(--ease-out); }
.sr-prog__fill--accent{ background:var(--accent); }
.sr-prog__fill--signal{ background:var(--signal); }
.sr-prog__fill--success{ background:var(--success); }
.sr-prog__fill--warning{ background:var(--warning); }
.sr-prog__fill--danger{ background:var(--danger); }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-prog-css')) {
  const s = document.createElement('style'); s.id = 'sr-prog-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function ProgressBar({ value = 0, max = 100, label, showValue = true, tone = 'primary', size = 'md', valueLabel, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="sr-prog" {...rest}>
      {(label || showValue) && (
        <div className="sr-prog__top">
          {label && <span className="sr-prog__label">{label}</span>}
          {showValue && <span className="sr-prog__val">{valueLabel || `${Math.round(pct)}%`}</span>}
        </div>
      )}
      <div className={['sr-prog__track', size === 'lg' && 'sr-prog__track--lg'].filter(Boolean).join(' ')}
           role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        <div className={`sr-prog__fill sr-prog__fill--${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
