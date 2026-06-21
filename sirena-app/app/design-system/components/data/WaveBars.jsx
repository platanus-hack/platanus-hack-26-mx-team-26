import React from 'react';

const CSS = `
.sr-wave{ display:inline-flex; align-items:center; gap:3px; }
.sr-wave span{ width:3px; border-radius:var(--radius-pill); background:var(--primary); display:block; }
.sr-wave--accent span{ background:var(--accent); }
.sr-wave--signal span{ background:var(--signal); }
.sr-wave--muted span{ background:var(--text-faint); }
.sr-wave--playing span{ animation:sr-wave-b 1.05s var(--ease-out) infinite; }
@keyframes sr-wave-b{ 0%,100%{ transform:scaleY(.32);} 50%{ transform:scaleY(1);} }
@media (prefers-reduced-motion: reduce){ .sr-wave--playing span{ animation:none; } }
`;

if (typeof document !== 'undefined' && !document.getElementById('sr-wave-css')) {
  const s = document.createElement('style'); s.id = 'sr-wave-css'; s.textContent = CSS; document.head.appendChild(s);
}

/* A deterministic, organic-looking set of bar heights. */
function heights(n, h) {
  const base = [0.45, 0.8, 0.55, 1, 0.65, 0.9, 0.4, 0.75, 0.6, 0.95, 0.5, 0.85];
  return Array.from({ length: n }, (_, i) => Math.round(base[i % base.length] * h));
}

export function WaveBars({ count = 7, height = 28, tone = 'primary', playing = false, barWidth = 3, ...rest }) {
  const hs = heights(count, height);
  return (
    <span className={['sr-wave', `sr-wave--${tone}`, playing && 'sr-wave--playing'].filter(Boolean).join(' ')}
          style={{ height }} aria-hidden="true" {...rest}>
      {hs.map((bh, i) => (
        <span key={i} style={{ height: playing ? height : bh, width: barWidth, animationDelay: `${(i % 6) * 90}ms` }} />
      ))}
    </span>
  );
}
