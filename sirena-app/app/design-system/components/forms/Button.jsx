import React from 'react';
import { Icon } from '../Icon';

const CSS = `
.sr-btn{
  --_bg:var(--primary); --_fg:var(--on-primary); --_bd:transparent;
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  font-family:var(--font-body); font-weight:700; line-height:1;
  border:1.5px solid var(--_bd); background:var(--_bg); color:var(--_fg);
  border-radius:var(--radius-md); cursor:pointer; white-space:nowrap;
  transition:transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color:transparent; text-decoration:none;
}
.sr-btn:focus-visible{ outline:none; box-shadow:var(--shadow-focus); }
.sr-btn:active{ transform:scale(.97); }
.sr-btn[disabled]{ opacity:.5; cursor:not-allowed; pointer-events:none; }
.sr-btn--md{ height:42px; padding:0 18px; font-size:14px; }
.sr-btn--sm{ height:34px; padding:0 13px; font-size:13px; border-radius:var(--radius-sm); }
.sr-btn--lg{ height:52px; padding:0 26px; font-size:16px; border-radius:var(--radius-lg); }
.sr-btn--full{ width:100%; }
.sr-btn--primary{ box-shadow:inset 0 1px 0 rgba(255,255,255,.18); }
.sr-btn--primary:hover{ background:var(--primary-hover); box-shadow:var(--glow-primary), inset 0 1px 0 rgba(255,255,255,.18); }
.sr-btn--primary:active{ background:var(--primary-press); }
.sr-btn--secondary{ --_bg:var(--accent); --_fg:var(--on-accent); box-shadow:inset 0 1px 0 rgba(255,255,255,.14); }
.sr-btn--secondary:hover{ background:var(--accent-hover); box-shadow:var(--glow-accent), inset 0 1px 0 rgba(255,255,255,.14); }
.sr-btn--danger{ --_bg:var(--danger); --_fg:#fff; }
.sr-btn--danger:hover{ filter:brightness(.93); }
.sr-btn--soft{ --_bg:var(--primary-soft); --_fg:var(--primary); }
.sr-btn--soft:hover{ background:var(--primary-softer); }
.sr-btn--ghost{ --_bg:transparent; --_fg:var(--text-body); --_bd:var(--border); }
.sr-btn--ghost:hover{ background:var(--surface-sunken); border-color:var(--border-strong); color:var(--text-strong); }
.sr-btn--link{ --_bg:transparent; --_fg:var(--accent); --_bd:transparent; height:auto; padding:0; }
.sr-btn--link:hover{ text-decoration:underline; }
.sr-btn svg{ width:1.15em; height:1.15em; }
.sr-btn .sr-spin{ width:1.05em; height:1.05em; border:2px solid currentColor; border-right-color:transparent; border-radius:50%; animation:sr-spin .7s linear infinite; }
@keyframes sr-spin{ to{ transform:rotate(360deg); } }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-btn-css')) {
  const s = document.createElement('style'); s.id = 'sr-btn-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Button({
  children, variant = 'primary', size = 'md', icon, iconRight,
  fullWidth = false, loading = false, disabled = false, as = 'button', ...rest
}) {
  const Tag = as;
  const cls = ['sr-btn', `sr-btn--${variant}`, `sr-btn--${size}`, fullWidth && 'sr-btn--full']
    .filter(Boolean).join(' ');
  return (
    <Tag className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="sr-spin" aria-hidden="true" />}
      {!loading && icon && <Icon name={icon} />}
      {children}
      {!loading && iconRight && <Icon name={iconRight} />}
    </Tag>
  );
}
