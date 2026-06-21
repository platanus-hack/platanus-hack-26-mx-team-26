import React from 'react';
import { Icon } from '../Icon';

const CSS = `
.sr-select-field{ display:flex; flex-direction:column; gap:7px; font-family:var(--font-body); }
.sr-select-field__label{ font-size:13px; font-weight:600; color:var(--text-strong); }
.sr-select-wrap{ position:relative; display:flex; align-items:center; }
.sr-select{
  width:100%; height:44px; font-family:var(--font-body); font-size:14px; font-weight:500; color:var(--text-strong);
  background:var(--surface); border:1.5px solid var(--border); border-radius:var(--radius-md);
  padding:0 40px 0 14px; cursor:pointer; appearance:none; -webkit-appearance:none;
  transition:border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.sr-select:hover{ border-color:var(--border-strong); }
.sr-select:focus{ outline:none; border-color:var(--primary); box-shadow:var(--shadow-focus); }
.sr-select--sm{ height:36px; font-size:13px; border-radius:var(--radius-sm); }
.sr-select-wrap__chev{ position:absolute; right:14px; pointer-events:none; color:var(--text-muted); display:flex; }
.sr-select-wrap__chev svg{ width:18px; height:18px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-select-css')) {
  const s = document.createElement('style'); s.id = 'sr-select-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Select({ label, options = [], size = 'md', id, children, ...rest }) {
  const fieldId = id || (label ? 'srsel-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return (
    <div className="sr-select-field">
      {label && <label className="sr-select-field__label" htmlFor={fieldId}>{label}</label>}
      <div className="sr-select-wrap">
        <select id={fieldId} className={['sr-select', size === 'sm' && 'sr-select--sm'].filter(Boolean).join(' ')} {...rest}>
          {children || options.map((o) => {
            const val = typeof o === 'string' ? o : o.value;
            const lbl = typeof o === 'string' ? o : o.label;
            return <option key={val} value={val}>{lbl}</option>;
          })}
        </select>
        <span className="sr-select-wrap__chev"><Icon name="chevron-down" /></span>
      </div>
    </div>
  );
}
