import React from 'react';

const CSS = `
.sr-switch{ display:inline-flex; align-items:center; gap:10px; cursor:pointer; font-family:var(--font-body); -webkit-tap-highlight-color:transparent; }
.sr-switch[data-disabled="true"]{ opacity:.5; cursor:not-allowed; }
.sr-switch__track{
  position:relative; width:44px; height:26px; border-radius:var(--radius-pill);
  background:var(--n-300); transition:background var(--dur-base) var(--ease-out); flex:none;
}
[data-theme="dark"] .sr-switch__track{ background:var(--n-700); }
.sr-switch__track[data-on="true"]{ background:var(--primary); }
.sr-switch__thumb{
  position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%;
  background:#fff; box-shadow:var(--shadow-sm); transition:transform var(--dur-base) var(--ease-spring);
}
.sr-switch__track[data-on="true"] .sr-switch__thumb{ transform:translateX(18px); }
.sr-switch:focus-visible .sr-switch__track{ box-shadow:var(--shadow-focus); }
.sr-switch__label{ font-size:14px; font-weight:600; color:var(--text-strong); }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-switch-css')) {
  const s = document.createElement('style'); s.id = 'sr-switch-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function Switch({ checked = false, onChange, label, disabled = false, ...rest }) {
  const toggle = () => { if (!disabled && onChange) onChange(!checked); };
  return (
    <label className="sr-switch" data-disabled={disabled} {...rest}>
      <span
        className="sr-switch__track" data-on={checked} role="switch" aria-checked={checked} tabIndex={disabled ? -1 : 0}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } }}
      >
        <span className="sr-switch__thumb" />
      </span>
      {label && <span className="sr-switch__label" onClick={toggle}>{label}</span>}
    </label>
  );
}
