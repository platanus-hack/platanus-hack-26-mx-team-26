import React from 'react';

const CSS = `
.sr-pill{
  display:inline-flex; align-items:center; gap:7px; font-family:var(--font-mono);
  font-weight:700; font-size:11px; letter-spacing:.04em; text-transform:uppercase;
  padding:5px 11px 5px 9px; border-radius:var(--radius-pill); white-space:nowrap;
  background:var(--surface-inset); color:var(--text-body); border:1px solid var(--border);
}
.sr-pill__dot{ width:8px; height:8px; border-radius:50%; background:currentColor; flex:none; }
.sr-pill--live{ background:var(--danger-soft); color:var(--danger); border-color:transparent; }
.sr-pill--live .sr-pill__dot{ animation:sr-pulse 1.4s var(--ease-out) infinite; }
.sr-pill--success{ background:var(--success-soft); color:var(--success); border-color:transparent; }
.sr-pill--warning{ background:var(--warning-soft); color:var(--warning); border-color:transparent; }
.sr-pill--draft{ background:var(--surface-inset); color:var(--text-muted); }
.sr-pill--scheduled{ background:var(--accent-soft); color:var(--accent); border-color:transparent; }
@keyframes sr-pulse{ 0%{ box-shadow:0 0 0 0 color-mix(in oklch, currentColor 55%, transparent);} 70%{ box-shadow:0 0 0 6px transparent;} 100%{ box-shadow:0 0 0 0 transparent;} }
@media (prefers-reduced-motion: reduce){ .sr-pill--live .sr-pill__dot{ animation:none; } }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-pill-css')) {
  const s = document.createElement('style'); s.id = 'sr-pill-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function StatusPill({ children, status = 'draft', ...rest }) {
  return (
    <span className={`sr-pill sr-pill--${status}`} {...rest}>
      <span className="sr-pill__dot" />
      {children}
    </span>
  );
}
