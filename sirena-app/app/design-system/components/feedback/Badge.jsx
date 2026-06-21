import React from 'react';
import { Icon } from '../Icon';

const CSS = `
.sr-badge{
  display:inline-flex; align-items:center; gap:5px; font-family:var(--font-body);
  font-weight:700; font-size:12px; line-height:1; padding:5px 10px; border-radius:var(--radius-pill);
  white-space:nowrap; border:1px solid transparent;
}
.sr-badge svg{ width:13px; height:13px; }
.sr-badge--neutral{ background:var(--surface-inset); color:var(--text-body); border-color:var(--border); }
.sr-badge--primary{ background:var(--primary-soft); color:var(--primary); }
.sr-badge--accent{ background:var(--accent-soft); color:var(--accent); }
.sr-badge--signal{ background:var(--signal-soft); color:var(--signal); }
.sr-badge--highlight{ background:var(--highlight-soft); color:var(--gold-700); }
[data-theme="dark"] .sr-badge--highlight{ color:var(--highlight); }
.sr-badge--success{ background:var(--success-soft); color:var(--success); }
.sr-badge--warning{ background:var(--warning-soft); color:var(--warning); }
.sr-badge--danger{ background:var(--danger-soft); color:var(--danger); }
.sr-badge--solid{ background:var(--primary); color:var(--on-primary); }
.sr-badge--sm{ font-size:11px; padding:3px 8px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-badge-css')) {
  const s = document.createElement('style'); s.id = 'sr-badge-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Badge({ children, tone = 'neutral', size = 'md', icon, ...rest }) {
  const cls = ['sr-badge', `sr-badge--${tone}`, size === 'sm' && 'sr-badge--sm'].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
