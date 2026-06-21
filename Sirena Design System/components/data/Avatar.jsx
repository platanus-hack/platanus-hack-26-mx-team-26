import React from 'react';

const CSS = `
.sr-avatar{ display:inline-flex; align-items:center; justify-content:center; border-radius:50%; font-family:var(--font-body); font-weight:700; color:#fff; flex:none; position:relative; overflow:visible; background:var(--iris-500); }
.sr-avatar img{ width:100%; height:100%; border-radius:50%; object-fit:cover; }
.sr-avatar--xs{ width:26px; height:26px; font-size:11px; }
.sr-avatar--sm{ width:34px; height:34px; font-size:13px; }
.sr-avatar--md{ width:42px; height:42px; font-size:15px; }
.sr-avatar--lg{ width:56px; height:56px; font-size:19px; }
.sr-avatar__ring{ box-shadow:0 0 0 2px var(--surface), 0 0 0 4px var(--border); }
.sr-avatar__dot{ position:absolute; right:-1px; bottom:-1px; width:30%; height:30%; min-width:9px; min-height:9px; border-radius:50%; border:2px solid var(--surface); }
.sr-avatar__dot--online{ background:var(--success); }
.sr-avatar__dot--risk{ background:var(--danger); }
.sr-avatar__dot--idle{ background:var(--warning); }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-avatar-css')) {
  const s = document.createElement('style'); s.id = 'sr-avatar-css'; s.textContent = CSS; document.head.appendChild(s);
}

const PALETTE = ['var(--coral-500)', 'var(--crimson-500)', 'var(--fern-500)', 'var(--gold-600)', 'var(--info-500)'];
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}
function pick(name = '') {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function Avatar({ name = '', src, size = 'md', status, ring = false, style, ...rest }) {
  const cls = ['sr-avatar', `sr-avatar--${size}`, ring && 'sr-avatar__ring'].filter(Boolean).join(' ');
  return (
    <span className={cls} style={{ background: src ? undefined : pick(name), ...style }} title={name} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
      {status && <span className={`sr-avatar__dot sr-avatar__dot--${status}`} />}
    </span>
  );
}
