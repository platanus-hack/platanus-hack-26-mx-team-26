import React from 'react';

const CSS = `
.sr-iconbtn{
  display:inline-flex; align-items:center; justify-content:center;
  border:1.5px solid transparent; background:transparent; color:var(--text-muted);
  border-radius:var(--radius-md); cursor:pointer; padding:0;
  transition:transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  -webkit-tap-highlight-color:transparent;
}
.sr-iconbtn:focus-visible{ outline:none; box-shadow:var(--shadow-focus); }
.sr-iconbtn:active{ transform:scale(.92); }
.sr-iconbtn[disabled]{ opacity:.45; cursor:not-allowed; pointer-events:none; }
.sr-iconbtn--md{ width:42px; height:42px; }
.sr-iconbtn--sm{ width:34px; height:34px; border-radius:var(--radius-sm); }
.sr-iconbtn--lg{ width:50px; height:50px; }
.sr-iconbtn svg{ width:20px; height:20px; }
.sr-iconbtn--sm svg{ width:17px; height:17px; }
.sr-iconbtn--ghost:hover{ background:var(--surface-sunken); color:var(--text-strong); }
.sr-iconbtn--outline{ border-color:var(--border); color:var(--text-body); }
.sr-iconbtn--outline:hover{ border-color:var(--border-strong); color:var(--text-strong); background:var(--surface-sunken); }
.sr-iconbtn--solid{ background:var(--primary); color:var(--on-primary); }
.sr-iconbtn--solid:hover{ background:var(--primary-hover); box-shadow:var(--glow-primary); }
.sr-iconbtn--soft{ background:var(--primary-soft); color:var(--primary); }
.sr-iconbtn--soft:hover{ background:var(--primary-softer); }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-iconbtn-css')) {
  const s = document.createElement('style'); s.id = 'sr-iconbtn-css'; s.textContent = CSS; document.head.appendChild(s);
}

export function IconButton({ icon, variant = 'ghost', size = 'md', label, ...rest }) {
  const cls = ['sr-iconbtn', `sr-iconbtn--${variant}`, `sr-iconbtn--${size}`].join(' ');
  return (
    <button className={cls} aria-label={label} title={label} {...rest}>
      <i data-lucide={icon} aria-hidden="true" />
    </button>
  );
}
