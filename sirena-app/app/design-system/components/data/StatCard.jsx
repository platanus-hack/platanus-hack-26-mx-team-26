import React from 'react';
import { Icon } from '../Icon';

const CSS = `
.sr-stat{
  position:relative; overflow:hidden;
  background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg);
  padding:var(--space-5); font-family:var(--font-body); display:flex; flex-direction:column; gap:14px;
  box-shadow:var(--shadow-sm), inset 0 1px 0 color-mix(in oklch, var(--text-strong) 5%, transparent);
  transition:transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.sr-stat::before{
  content:''; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(120% 100% at 100% 0%, color-mix(in oklch, var(--stat-tone, var(--primary)) 13%, transparent) 0%, transparent 52%);
}
.sr-stat--hover:hover{
  transform:translateY(-2px); cursor:pointer;
  border-color:color-mix(in oklch, var(--stat-tone, var(--primary)) 30%, var(--border));
  box-shadow:var(--shadow-md), 0 0 0 1px color-mix(in oklch, var(--stat-tone, var(--primary)) 12%, transparent);
}
.sr-stat__top{ position:relative; display:flex; align-items:center; justify-content:space-between; }
.sr-stat__icon{ position:relative; width:38px; height:38px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center;
  box-shadow:0 0 0 1px color-mix(in oklch, currentColor 18%, transparent), 0 6px 14px color-mix(in oklch, currentColor 24%, transparent); }
.sr-stat__icon svg{ width:20px; height:20px; }
.sr-stat__icon--primary{ background:var(--primary-soft); color:var(--primary); }
.sr-stat__icon--accent{ background:var(--accent-soft); color:var(--accent); }
.sr-stat__icon--signal{ background:var(--signal-soft); color:var(--signal); }
.sr-stat__icon--success{ background:var(--success-soft); color:var(--success); }
.sr-stat__icon--danger{ background:var(--danger-soft); color:var(--danger); }
.sr-stat__label{ position:relative; font-size:13px; font-weight:600; color:var(--text-muted); }
.sr-stat__value{ font-family:var(--font-display); font-size:34px; font-weight:700; color:var(--text-strong); letter-spacing:-.02em; line-height:1;
  font-variant-numeric:tabular-nums; }
.sr-stat__row{ position:relative; display:flex; align-items:baseline; gap:10px; }
.sr-stat__unit{ font-size:14px; font-weight:600; color:var(--text-muted); }
.sr-stat__delta{ display:inline-flex; align-items:center; gap:3px; font-family:var(--font-mono); font-size:12px; font-weight:700;
  padding:2px 8px; border-radius:var(--radius-pill); }
.sr-stat__delta svg{ width:13px; height:13px; }
.sr-stat__delta--up{ color:var(--danger); background:var(--danger-soft); }
.sr-stat__delta--down{ color:var(--success); background:var(--success-soft); }
.sr-stat__delta--good-up{ color:var(--success); background:var(--success-soft); }
.sr-stat__foot{ position:relative; font-size:12px; color:var(--text-faint); }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-stat-css')) {
  const s = document.createElement('style'); s.id = 'sr-stat-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function StatCard({ label, value, unit, icon, tone = 'primary', delta, deltaTone = 'up', foot, hover = false, style, ...rest }) {
  return (
    <div
      className={['sr-stat', hover && 'sr-stat--hover'].filter(Boolean).join(' ')}
      style={{ '--stat-tone': `var(--${tone})`, ...style }}
      {...rest}
    >
      <div className="sr-stat__top">
        <span className="sr-stat__label">{label}</span>
        {icon && <span className={`sr-stat__icon sr-stat__icon--${tone}`}><Icon name={icon} /></span>}
      </div>
      <div>
        <div className="sr-stat__row">
          <span className="sr-stat__value">{value}</span>
          {unit && <span className="sr-stat__unit">{unit}</span>}
          {delta && (
            <span className={`sr-stat__delta sr-stat__delta--${deltaTone}`}>
              <Icon name={deltaTone === 'down' ? 'arrow-down-right' : 'arrow-up-right'} />
              {delta}
            </span>
          )}
        </div>
        {foot && <div className="sr-stat__foot" style={{ marginTop: 6 }}>{foot}</div>}
      </div>
    </div>
  );
}
