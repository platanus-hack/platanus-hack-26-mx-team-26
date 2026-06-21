import React from 'react';
import { Icon } from '../Icon';

const CSS = `
.sr-field{ display:flex; flex-direction:column; gap:7px; font-family:var(--font-body); }
.sr-field__label{ font-size:13px; font-weight:600; color:var(--text-strong); }
.sr-field__hint{ font-size:12px; color:var(--text-muted); }
.sr-field__err{ font-size:12px; color:var(--danger); font-weight:600; }
.sr-input-wrap{ position:relative; display:flex; align-items:center; }
.sr-input{
  width:100%; height:44px; font-family:var(--font-body); font-size:14px; color:var(--text-strong);
  background:var(--surface); border:1.5px solid var(--border); border-radius:var(--radius-md);
  padding:0 14px; transition:border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.sr-input::placeholder{ color:var(--text-faint); }
.sr-input:hover{ border-color:var(--border-strong); }
.sr-input:focus{ outline:none; border-color:var(--primary); box-shadow:var(--shadow-focus); }
.sr-input--err{ border-color:var(--danger); }
.sr-input--err:focus{ box-shadow:0 0 0 4px color-mix(in oklch, var(--danger) 35%, transparent); }
.sr-input--ico{ padding-left:42px; }
.sr-input-wrap__icon{ position:absolute; left:14px; display:flex; color:var(--text-faint); pointer-events:none; }
.sr-input-wrap__icon svg{ width:18px; height:18px; }
.sr-input:focus + .sr-input-wrap__icon, .sr-input-wrap:focus-within .sr-input-wrap__icon{ color:var(--primary); }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-input-css')) {
  const s = document.createElement('style'); s.id = 'sr-input-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Input({ label, hint, error, icon, id, className = '', ...rest }) {
  const fieldId = id || (label ? 'sr-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return (
    <div className="sr-field">
      {label && <label className="sr-field__label" htmlFor={fieldId}>{label}</label>}
      <div className="sr-input-wrap">
        <input
          id={fieldId}
          className={['sr-input', icon && 'sr-input--ico', error && 'sr-input--err', className].filter(Boolean).join(' ')}
          aria-invalid={!!error}
          {...rest}
        />
        {icon && <span className="sr-input-wrap__icon"><Icon name={icon} /></span>}
      </div>
      {error ? <span className="sr-field__err">{error}</span> : hint && <span className="sr-field__hint">{hint}</span>}
    </div>
  );
}
