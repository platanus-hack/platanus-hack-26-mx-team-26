import React from 'react';

const CSS = `
.sr-card{
  background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg);
  box-shadow:var(--shadow-sm); font-family:var(--font-body); color:var(--text-body);
  transition:transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.sr-card--pad{ padding:var(--space-6); }
.sr-card--padsm{ padding:var(--space-4); }
.sr-card--hover{ cursor:pointer; }
.sr-card--hover:hover{ transform:translateY(-2px); box-shadow:var(--shadow-md); border-color:var(--border-strong); }
.sr-card--soft{ background:var(--primary-soft); border-color:transparent; }
.sr-card--accent-soft{ background:var(--accent-soft); border-color:transparent; }
.sr-card--sunken{ background:var(--surface-sunken); box-shadow:none; }
.sr-card__head{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:var(--space-4); }
.sr-card__title{ font-family:var(--font-display); font-size:17px; font-weight:700; color:var(--text-strong); letter-spacing:-.01em; }
.sr-card__eyebrow{ font-family:var(--font-mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--text-muted); font-weight:700; margin-bottom:4px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-card-css')) {
  const s = document.createElement('style'); s.id = 'sr-card-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Card({ children, variant = 'default', padding = 'md', hover = false, title, eyebrow, action, className = '', ...rest }) {
  const cls = [
    'sr-card',
    variant === 'soft' && 'sr-card--soft',
    variant === 'accent-soft' && 'sr-card--accent-soft',
    variant === 'sunken' && 'sr-card--sunken',
    padding === 'md' && 'sr-card--pad',
    padding === 'sm' && 'sr-card--padsm',
    hover && 'sr-card--hover',
    className,
  ].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {(title || eyebrow || action) && (
        <div className="sr-card__head">
          <div>
            {eyebrow && <div className="sr-card__eyebrow">{eyebrow}</div>}
            {title && <div className="sr-card__title">{title}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
