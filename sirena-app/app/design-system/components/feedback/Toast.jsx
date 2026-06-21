import React from 'react';
import { Icon } from '../Icon';

const CSS = `
.sr-toast{
  display:flex; align-items:flex-start; gap:12px; width:100%; max-width:400px;
  background:var(--surface-raised); border:1px solid var(--border); border-radius:var(--radius-lg);
  padding:14px 14px 14px 16px; box-shadow:var(--shadow-lg); font-family:var(--font-body);
  position:relative; overflow:hidden;
}
.sr-toast::before{ content:""; position:absolute; left:0; top:0; bottom:0; width:4px; background:var(--accent); }
.sr-toast--success::before{ background:var(--success); }
.sr-toast--danger::before{ background:var(--danger); }
.sr-toast--warning::before{ background:var(--warning); }
.sr-toast__icon{ width:32px; height:32px; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; flex:none; }
.sr-toast__icon svg{ width:18px; height:18px; }
.sr-toast--info .sr-toast__icon{ background:var(--accent-soft); color:var(--accent); }
.sr-toast--success .sr-toast__icon{ background:var(--success-soft); color:var(--success); }
.sr-toast--danger .sr-toast__icon{ background:var(--danger-soft); color:var(--danger); }
.sr-toast--warning .sr-toast__icon{ background:var(--warning-soft); color:var(--warning); }
.sr-toast__body{ flex:1; min-width:0; padding-top:1px; }
.sr-toast__title{ font-size:14px; font-weight:700; color:var(--text-strong); margin-bottom:2px; }
.sr-toast__msg{ font-size:13px; color:var(--text-muted); line-height:1.45; }
.sr-toast__close{ background:none; border:none; cursor:pointer; color:var(--text-faint); padding:2px; border-radius:var(--radius-xs); display:flex; }
.sr-toast__close:hover{ color:var(--text-strong); }
.sr-toast__close svg{ width:16px; height:16px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-toast-css')) {
  const s = document.createElement('style'); s.id = 'sr-toast-css'; s.textContent = CSS; document.head.appendChild(s);
}

const ICONS = { info: 'info', success: 'check', danger: 'alert-triangle', warning: 'alert-circle' };

export function Toast({ title, children, tone = 'info', icon, onClose, ...rest }) {
  return (
    <div className={`sr-toast sr-toast--${tone}`} role="status" {...rest}>
      <span className="sr-toast__icon"><Icon name={icon || ICONS[tone]} /></span>
      <div className="sr-toast__body">
        {title && <div className="sr-toast__title">{title}</div>}
        {children && <div className="sr-toast__msg">{children}</div>}
      </div>
      {onClose && (
        <button className="sr-toast__close" onClick={onClose} aria-label="Dismiss">
          <Icon name="x" />
        </button>
      )}
    </div>
  );
}
