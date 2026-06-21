/* @ds-bundle: {"format":3,"namespace":"SirenaDesignSystem_c1cb8e","components":[{"name":"Avatar","sourcePath":"components/data/Avatar.jsx"},{"name":"Card","sourcePath":"components/data/Card.jsx"},{"name":"RiskMeter","sourcePath":"components/data/RiskMeter.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"WaveBars","sourcePath":"components/data/WaveBars.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"StatusPill","sourcePath":"components/feedback/StatusPill.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"}],"sourceHashes":{"components/data/Avatar.jsx":"83acb3497a36","components/data/Card.jsx":"9722e001b686","components/data/RiskMeter.jsx":"84fd3b48abe4","components/data/StatCard.jsx":"84299de0174e","components/data/WaveBars.jsx":"51d8df27426c","components/feedback/Badge.jsx":"bcbeaed9c9e4","components/feedback/ProgressBar.jsx":"90a00e7b9fdd","components/feedback/StatusPill.jsx":"00538fca2d7c","components/feedback/Toast.jsx":"4111569b0ea6","components/forms/Button.jsx":"952923ce6faa","components/forms/IconButton.jsx":"3d2dbe410438","components/forms/Input.jsx":"a5ec5cc1128b","components/forms/Select.jsx":"0dab7d21302d","components/forms/Switch.jsx":"f21579809d42","ui_kits/sirena-app/DashboardScreen.jsx":"7c3101cadc10","ui_kits/sirena-app/LaunchScreen.jsx":"e5f88aba4d17","ui_kits/sirena-app/Shell.jsx":"e7332b843d8c","ui_kits/sirena-app/UsersScreen.jsx":"9d6aad7fbc9e","ui_kits/sirena-app/VoiceLibraryScreen.jsx":"56a338cbd7a0","ui_kits/sirena-app/data.js":"ca36cecd23f4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SirenaDesignSystem_c1cb8e = window.SirenaDesignSystem_c1cb8e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/data/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'sr-avatar-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
const PALETTE = ['var(--coral-500)', 'var(--crimson-500)', 'var(--fern-500)', 'var(--gold-600)', 'var(--info-500)'];
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}
function pick(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function Avatar({
  name = '',
  src,
  size = 'md',
  status,
  ring = false,
  style,
  ...rest
}) {
  const cls = ['sr-avatar', `sr-avatar--${size}`, ring && 'sr-avatar__ring'].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    style: {
      background: src ? undefined : pick(name),
      ...style
    },
    title: name
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials(name), status && /*#__PURE__*/React.createElement("span", {
    className: `sr-avatar__dot sr-avatar__dot--${status}`
  }));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'sr-card-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  title,
  eyebrow,
  action,
  className = '',
  ...rest
}) {
  const cls = ['sr-card', variant === 'soft' && 'sr-card--soft', variant === 'accent-soft' && 'sr-card--accent-soft', variant === 'sunken' && 'sr-card--sunken', padding === 'md' && 'sr-card--pad', padding === 'sm' && 'sr-card--padsm', hover && 'sr-card--hover', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), (title || eyebrow || action) && /*#__PURE__*/React.createElement("div", {
    className: "sr-card__head"
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "sr-card__eyebrow"
  }, eyebrow), title && /*#__PURE__*/React.createElement("div", {
    className: "sr-card__title"
  }, title)), action), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/RiskMeter.jsx
try { (() => {
const CSS = `
.sr-risk{ display:flex; flex-direction:column; align-items:center; font-family:var(--font-body); }
.sr-risk__svg{ display:block; }
.sr-risk__track{ stroke:var(--surface-inset); }
.sr-risk__value{ font-family:var(--font-display); font-weight:700; fill:var(--text-strong); }
.sr-risk__cap{ font-family:var(--font-mono); font-size:11px; letter-spacing:.06em; text-transform:uppercase; fill:var(--text-muted); font-weight:700; }
.sr-risk__ends{ display:flex; justify-content:space-between; width:100%; margin-top:-6px; font-family:var(--font-mono); font-size:12px; color:var(--text-faint); }
.sr-risk__sub{ font-size:13px; color:var(--text-muted); margin-top:6px; }
`;
if (typeof document !== 'undefined' && !document.getElementById('sr-risk-css')) {
  const s = document.createElement('style');
  s.id = 'sr-risk-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* Lower score = lower risk (like the references' 0..max gauge). */
function zoneColor(ratio) {
  if (ratio <= 0.33) return 'var(--success)';
  if (ratio <= 0.66) return 'var(--warning)';
  return 'var(--danger)';
}
function RiskMeter({
  value = 0,
  max = 900,
  min = 0,
  size = 240,
  label = 'Risk score',
  sublabel,
  caption
}) {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = size / 2 - 18;
  const cx = size / 2;
  const cy = size / 2;
  const circ = Math.PI * r; // half circle length
  const dash = circ;
  const offset = circ * (1 - ratio);
  const h = size / 2 + 26;
  const color = zoneColor(ratio);
  return /*#__PURE__*/React.createElement("div", {
    className: "sr-risk",
    style: {
      width: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    className: "sr-risk__svg",
    width: size,
    height: h,
    viewBox: `0 0 ${size} ${h}`,
    role: "img",
    "aria-label": `${label} ${value} of ${max}`
  }, /*#__PURE__*/React.createElement("path", {
    className: "sr-risk__track",
    fill: "none",
    strokeWidth: "16",
    strokeLinecap: "round",
    d: `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
  }), /*#__PURE__*/React.createElement("path", {
    fill: "none",
    stroke: color,
    strokeWidth: "16",
    strokeLinecap: "round",
    strokeDasharray: dash,
    strokeDashoffset: offset,
    style: {
      transition: 'stroke-dashoffset 700ms var(--ease-out), stroke 400ms ease'
    },
    d: `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
  }), /*#__PURE__*/React.createElement("text", {
    className: "sr-risk__value",
    x: cx,
    y: cy - 6,
    textAnchor: "middle",
    fontSize: size * 0.2
  }, value), caption && /*#__PURE__*/React.createElement("text", {
    className: "sr-risk__cap",
    x: cx,
    y: cy + 16,
    textAnchor: "middle"
  }, caption)), /*#__PURE__*/React.createElement("div", {
    className: "sr-risk__ends"
  }, /*#__PURE__*/React.createElement("span", null, min), /*#__PURE__*/React.createElement("span", null, max)), sublabel && /*#__PURE__*/React.createElement("div", {
    className: "sr-risk__sub"
  }, sublabel));
}
Object.assign(__ds_scope, { RiskMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/RiskMeter.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sr-stat{
  background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg);
  padding:var(--space-5); font-family:var(--font-body); display:flex; flex-direction:column; gap:14px;
  transition:transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.sr-stat--hover:hover{ transform:translateY(-2px); box-shadow:var(--shadow-md); cursor:pointer; }
.sr-stat__top{ display:flex; align-items:center; justify-content:space-between; }
.sr-stat__icon{ width:38px; height:38px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; }
.sr-stat__icon svg{ width:20px; height:20px; }
.sr-stat__icon--primary{ background:var(--primary-soft); color:var(--primary); }
.sr-stat__icon--accent{ background:var(--accent-soft); color:var(--accent); }
.sr-stat__icon--signal{ background:var(--signal-soft); color:var(--signal); }
.sr-stat__icon--success{ background:var(--success-soft); color:var(--success); }
.sr-stat__icon--danger{ background:var(--danger-soft); color:var(--danger); }
.sr-stat__label{ font-size:13px; font-weight:600; color:var(--text-muted); }
.sr-stat__value{ font-family:var(--font-display); font-size:34px; font-weight:700; color:var(--text-strong); letter-spacing:-.02em; line-height:1; }
.sr-stat__row{ display:flex; align-items:baseline; gap:10px; }
.sr-stat__unit{ font-size:14px; font-weight:600; color:var(--text-muted); }
.sr-stat__delta{ display:inline-flex; align-items:center; gap:3px; font-family:var(--font-mono); font-size:12px; font-weight:700; }
.sr-stat__delta svg{ width:14px; height:14px; }
.sr-stat__delta--up{ color:var(--danger); }
.sr-stat__delta--down{ color:var(--success); }
.sr-stat__delta--good-up{ color:var(--success); }
.sr-stat__foot{ font-size:12px; color:var(--text-faint); }
`;
if (typeof document !== 'undefined' && !document.getElementById('sr-stat-css')) {
  const s = document.createElement('style');
  s.id = 'sr-stat-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function StatCard({
  label,
  value,
  unit,
  icon,
  tone = 'primary',
  delta,
  deltaTone = 'up',
  foot,
  hover = false,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['sr-stat', hover && 'sr-stat--hover'].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "sr-stat__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sr-stat__label"
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    className: `sr-stat__icon sr-stat__icon--${tone}`
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon,
    "aria-hidden": "true"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sr-stat__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sr-stat__value"
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    className: "sr-stat__unit"
  }, unit), delta && /*#__PURE__*/React.createElement("span", {
    className: `sr-stat__delta sr-stat__delta--${deltaTone}`
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": deltaTone === 'down' ? 'arrow-down-right' : 'arrow-up-right',
    "aria-hidden": "true"
  }), delta)), foot && /*#__PURE__*/React.createElement("div", {
    className: "sr-stat__foot",
    style: {
      marginTop: 6
    }
  }, foot)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/WaveBars.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'sr-wave-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* A deterministic, organic-looking set of bar heights. */
function heights(n, h) {
  const base = [0.45, 0.8, 0.55, 1, 0.65, 0.9, 0.4, 0.75, 0.6, 0.95, 0.5, 0.85];
  return Array.from({
    length: n
  }, (_, i) => Math.round(base[i % base.length] * h));
}
function WaveBars({
  count = 7,
  height = 28,
  tone = 'primary',
  playing = false,
  barWidth = 3,
  ...rest
}) {
  const hs = heights(count, height);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['sr-wave', `sr-wave--${tone}`, playing && 'sr-wave--playing'].filter(Boolean).join(' '),
    style: {
      height
    },
    "aria-hidden": "true"
  }, rest), hs.map((bh, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      height: playing ? height : bh,
      width: barWidth,
      animationDelay: `${i % 6 * 90}ms`
    }
  })));
}
Object.assign(__ds_scope, { WaveBars });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/WaveBars.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sr-badge{
  display:inline-flex; align-items:center; gap:5px; font-family:var(--font-body);
  font-weight:700; font-size:12px; line-height:1; padding:5px 10px; border-radius:var(--radius-pill);
  white-space:nowrap; border:1px solid transparent;
}
.sr-badge svg{ width:13px; height:13px; }
.sr-badge--neutral{ background:var(--surface-inset); color:var(--text-body); border-color:var(--border); }
.sr-badge--primary{ background:var(--primary-soft); color:var(--primary); }
.sr-badge--accent{ background:var(--accent-soft); color:var(--accent); }
.sr-badge--signal{ background:var(--signal-soft); color:var(--signal); }
.sr-badge--highlight{ background:var(--highlight-soft); color:var(--gold-700); }
[data-theme="dark"] .sr-badge--highlight{ color:var(--highlight); }
.sr-badge--success{ background:var(--success-soft); color:var(--success); }
.sr-badge--warning{ background:var(--warning-soft); color:var(--warning); }
.sr-badge--danger{ background:var(--danger-soft); color:var(--danger); }
.sr-badge--solid{ background:var(--primary); color:var(--on-primary); }
.sr-badge--sm{ font-size:11px; padding:3px 8px; }
`;
if (typeof document !== 'undefined' && !document.getElementById('sr-badge-css')) {
  const s = document.createElement('style');
  s.id = 'sr-badge-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Badge({
  children,
  tone = 'neutral',
  size = 'md',
  icon,
  ...rest
}) {
  const cls = ['sr-badge', `sr-badge--${tone}`, size === 'sm' && 'sr-badge--sm'].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), icon && /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon,
    "aria-hidden": "true"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sr-prog{ display:flex; flex-direction:column; gap:7px; font-family:var(--font-body); width:100%; }
.sr-prog__top{ display:flex; justify-content:space-between; align-items:baseline; }
.sr-prog__label{ font-size:13px; font-weight:600; color:var(--text-strong); }
.sr-prog__val{ font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--text-muted); }
.sr-prog__track{ height:9px; border-radius:var(--radius-pill); background:var(--surface-inset); overflow:hidden; }
.sr-prog__track--lg{ height:12px; }
.sr-prog__fill{ height:100%; border-radius:var(--radius-pill); background:var(--primary); transition:width var(--dur-slow) var(--ease-out); }
.sr-prog__fill--accent{ background:var(--accent); }
.sr-prog__fill--signal{ background:var(--signal); }
.sr-prog__fill--success{ background:var(--success); }
.sr-prog__fill--warning{ background:var(--warning); }
.sr-prog__fill--danger{ background:var(--danger); }
`;
if (typeof document !== 'undefined' && !document.getElementById('sr-prog-css')) {
  const s = document.createElement('style');
  s.id = 'sr-prog-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = true,
  tone = 'primary',
  size = 'md',
  valueLabel,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sr-prog"
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    className: "sr-prog__top"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "sr-prog__label"
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    className: "sr-prog__val"
  }, valueLabel || `${Math.round(pct)}%`)), /*#__PURE__*/React.createElement("div", {
    className: ['sr-prog__track', size === 'lg' && 'sr-prog__track--lg'].filter(Boolean).join(' '),
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemax": max
  }, /*#__PURE__*/React.createElement("div", {
    className: `sr-prog__fill sr-prog__fill--${tone}`,
    style: {
      width: `${pct}%`
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'sr-pill-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function StatusPill({
  children,
  status = 'draft',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `sr-pill sr-pill--${status}`
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "sr-pill__dot"
  }), children);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'sr-toast-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
const ICONS = {
  info: 'info',
  success: 'check',
  danger: 'alert-triangle',
  warning: 'alert-circle'
};
function Toast({
  title,
  children,
  tone = 'info',
  icon,
  onClose,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `sr-toast sr-toast--${tone}`,
    role: "status"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "sr-toast__icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon || ICONS[tone],
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sr-toast__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "sr-toast__title"
  }, title), children && /*#__PURE__*/React.createElement("div", {
    className: "sr-toast__msg"
  }, children)), onClose && /*#__PURE__*/React.createElement("button", {
    className: "sr-toast__close",
    onClick: onClose,
    "aria-label": "Dismiss"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x",
    "aria-hidden": "true"
  })));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
.sr-btn--primary:hover{ background:var(--primary-hover); box-shadow:var(--glow-primary); }
.sr-btn--primary:active{ background:var(--primary-press); }
.sr-btn--secondary{ --_bg:var(--accent); --_fg:var(--on-accent); }
.sr-btn--secondary:hover{ background:var(--accent-hover); box-shadow:var(--glow-accent); }
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
  const s = document.createElement('style');
  s.id = 'sr-btn-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  as = 'button',
  ...rest
}) {
  const Tag = as;
  const cls = ['sr-btn', `sr-btn--${variant}`, `sr-btn--${size}`, fullWidth && 'sr-btn--full'].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls,
    disabled: disabled || loading
  }, rest), loading && /*#__PURE__*/React.createElement("span", {
    className: "sr-spin",
    "aria-hidden": "true"
  }), !loading && icon && /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon,
    "aria-hidden": "true"
  }), children, !loading && iconRight && /*#__PURE__*/React.createElement("i", {
    "data-lucide": iconRight,
    "aria-hidden": "true"
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'sr-iconbtn-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  label,
  ...rest
}) {
  const cls = ['sr-iconbtn', `sr-iconbtn--${variant}`, `sr-iconbtn--${size}`].join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    "aria-label": label,
    title: label
  }, rest), /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon,
    "aria-hidden": "true"
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'sr-input-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Input({
  label,
  hint,
  error,
  icon,
  id,
  className = '',
  ...rest
}) {
  const fieldId = id || (label ? 'sr-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return /*#__PURE__*/React.createElement("div", {
    className: "sr-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "sr-field__label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "sr-input-wrap"
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    className: ['sr-input', icon && 'sr-input--ico', error && 'sr-input--err', className].filter(Boolean).join(' '),
    "aria-invalid": !!error
  }, rest)), icon && /*#__PURE__*/React.createElement("span", {
    className: "sr-input-wrap__icon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon,
    "aria-hidden": "true"
  }))), error ? /*#__PURE__*/React.createElement("span", {
    className: "sr-field__err"
  }, error) : hint && /*#__PURE__*/React.createElement("span", {
    className: "sr-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'sr-select-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Select({
  label,
  options = [],
  size = 'md',
  id,
  children,
  ...rest
}) {
  const fieldId = id || (label ? 'srsel-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return /*#__PURE__*/React.createElement("div", {
    className: "sr-select-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "sr-select-field__label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "sr-select-wrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    className: ['sr-select', size === 'sm' && 'sr-select--sm'].filter(Boolean).join(' ')
  }, rest), children || options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const lbl = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lbl);
  })), /*#__PURE__*/React.createElement("span", {
    className: "sr-select-wrap__chev"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-down",
    "aria-hidden": "true"
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const s = document.createElement('style');
  s.id = 'sr-switch-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}
function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  ...rest
}) {
  const toggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };
  return /*#__PURE__*/React.createElement("label", _extends({
    className: "sr-switch",
    "data-disabled": disabled
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "sr-switch__track",
    "data-on": checked,
    role: "switch",
    "aria-checked": checked,
    tabIndex: disabled ? -1 : 0,
    onClick: toggle,
    onKeyDown: e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sr-switch__thumb"
  })), label && /*#__PURE__*/React.createElement("span", {
    className: "sr-switch__label",
    onClick: toggle
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sirena-app/DashboardScreen.jsx
try { (() => {
// Sirena · Resumen (Dashboard). Exposes window.DashboardScreen
const {
  Card,
  StatCard,
  RiskMeter,
  StatusPill,
  Badge,
  ProgressBar,
  Button
} = window.SirenaDesignSystem_c1cb8e;
function Sparkline({
  data
}) {
  const max = Math.max(...data);
  return /*#__PURE__*/React.createElement("div", {
    className: "spark"
  }, data.map((v, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      height: v / max * 100 + '%'
    }
  })));
}
function DashboardScreen({
  openCampaigns
}) {
  const D = window.SirenaData;
  const live = D.campaigns.filter(c => c.status === 'live');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Platanus org \xB7 semana del 15 jun"), /*#__PURE__*/React.createElement("h1", null, "Hola de nuevo, Jordan"), /*#__PURE__*/React.createElement("p", null, "Tu resiliencia subi\xF3 esta semana. Tres personas a\xFAn caen ante notas de voz por WhatsApp.")), /*#__PURE__*/React.createElement("div", {
    className: "dash-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-2",
    style: {
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Puntaje de riesgo",
    value: "385",
    icon: "gauge",
    tone: "danger",
    delta: "12",
    deltaTone: "down",
    foot: "M\xE1s bajo es mejor"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Voces consentidas",
    value: "18",
    unit: "/ 24",
    icon: "mic",
    tone: "signal",
    foot: "6 pendientes de grabar"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Resistencia media",
    value: "72",
    unit: "%",
    icon: "shield-check",
    tone: "success",
    delta: "8",
    deltaTone: "good-up"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Simulaciones activas",
    value: "2",
    icon: "radio",
    tone: "primary",
    foot: "36 personas en curso"
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Puntaje de riesgo",
    eyebrow: "Toda la organizaci\xF3n",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "success",
      icon: "trending-down"
    }, "Mejorando")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '4px 0 2px'
    }
  }, /*#__PURE__*/React.createElement(RiskMeter, {
    value: 385,
    max: 900,
    caption: "Promedio",
    sublabel: "Baj\xF3 12 puntos vs. semana pasada",
    size: 240
  })))), /*#__PURE__*/React.createElement("div", {
    className: "dash-hero",
    style: {
      gridTemplateColumns: '1.6fr 1fr'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Actividad reciente",
    eyebrow: "Simulaciones",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "link",
      iconRight: "arrow-right",
      onClick: openCampaigns
    }, "Ver campa\xF1as")
  }, /*#__PURE__*/React.createElement("div", null, D.campaigns.slice(0, 5).map(c => {
    const m = D.channelMeta[c.channel];
    return /*#__PURE__*/React.createElement("div", {
      className: "act",
      key: c.id
    }, /*#__PURE__*/React.createElement("div", {
      className: 'act__ch act__ch--' + m.tone
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": m.icon
    })), /*#__PURE__*/React.createElement("div", {
      className: "act__main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "act__name"
    }, c.name), /*#__PURE__*/React.createElement("div", {
      className: "act__meta"
    }, c.id, " \xB7 ", m.label, " \xB7 ", c.when)), /*#__PURE__*/React.createElement("div", {
      className: "act__nums"
    }, c.status === 'live' || c.status === 'success' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "act__num"
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--success)'
      }
    }, c.resisted), /*#__PURE__*/React.createElement("span", null, "Resisti\xF3")), /*#__PURE__*/React.createElement("div", {
      className: "act__num"
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--danger)'
      }
    }, c.compromised), /*#__PURE__*/React.createElement("span", null, "Cay\xF3"))) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: 120
      }
    }), /*#__PURE__*/React.createElement(StatusPill, {
      status: c.status === 'success' ? 'success' : c.status
    }, {
      live: 'En vivo',
      success: 'Completada',
      scheduled: 'Programada',
      draft: 'Borrador'
    }[c.status])));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Cultura de seguridad",
    eyebrow: "Nivel",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "highlight"
    }, "B\xE1sico \xB7 28")
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 28,
    max: 60,
    tone: "primary",
    valueLabel: "28 / 60",
    showValue: true,
    label: "Hacia 'Resiliente'"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 8
    }
  }, "Tendencia de riesgo \xB7 12 sem"), /*#__PURE__*/React.createElement(Sparkline, {
    data: D.riskHistory
  }))), /*#__PURE__*/React.createElement(Card, {
    variant: "soft"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-md)',
      background: 'var(--primary)',
      color: 'var(--on-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "sparkles"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-strong)',
      marginBottom: 3
    }
  }, "Siguiente paso"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-body)',
      lineHeight: 1.5,
      marginBottom: 12
    }
  }, "Finanzas es tu \xE1rea m\xE1s vulnerable. Lanza una prueba de nota de voz del CFO."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    icon: "rocket",
    onClick: openCampaigns
  }, "Preparar prueba")))))));
}
window.DashboardScreen = DashboardScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sirena-app/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sirena-app/LaunchScreen.jsx
try { (() => {
// Sirena · Sala de lanzamiento (Launch room). Exposes window.LaunchScreen
const {
  Card,
  Button,
  Select,
  Badge,
  StatusPill,
  Avatar,
  Toast,
  WaveBars,
  Switch
} = window.SirenaDesignSystem_c1cb8e;
const CHANNELS = [{
  id: 'audio',
  icon: 'audio-lines',
  t: 'Nota de audio',
  d: 'Deja un mensaje de voz con un clon consentido.'
}, {
  id: 'whatsapp',
  icon: 'message-circle',
  t: 'WhatsApp',
  d: 'Envía un audio o texto por WhatsApp.'
}, {
  id: 'call',
  icon: 'phone-call',
  t: 'Llamada',
  d: 'Realiza una llamada simulada en vivo.'
}];
const TEMPLATES = {
  audio: 'Hola, soy del equipo de finanzas. Necesito que confirmes la transferencia antes de las 3pm, te dejo los datos en este audio…',
  whatsapp: 'Hola 👋 soy Jordan de TI. Detectamos un acceso inusual a tu cuenta. ¿Puedes confirmarme el código que te acaba de llegar?',
  call: 'Buenas, le llamo del banco por un cargo sospechoso. Para verificar su identidad, ¿me confirma los últimos dígitos de su tarjeta?'
};
function LaunchScreen() {
  const D = window.SirenaData;
  const [chan, setChan] = React.useState('whatsapp');
  const [msg, setMsg] = React.useState(TEMPLATES.whatsapp);
  const [sent, setSent] = React.useState(false);
  const live = D.campaigns.filter(c => c.status === 'live');
  const pickChan = id => {
    setChan(id);
    setMsg(TEMPLATES[id]);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Simulaci\xF3n controlada \xB7 solo pruebas"), /*#__PURE__*/React.createElement("h1", null, "Sala de lanzamiento"), /*#__PURE__*/React.createElement("p", null, "Activa una prueba de vishing \xE9tica en tres pasos. Los mensajes son simulados, pero llegan de verdad.")), /*#__PURE__*/React.createElement("div", {
    className: "launch-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "1 \xB7 Elige el canal",
    eyebrow: "Sistema a activar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chan-cards"
  }, CHANNELS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: 'chan' + (chan === c.id ? ' chan--active' : ''),
    onClick: () => pickChan(c.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "chan__ic"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": c.icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "chan__t"
  }, c.t), /*#__PURE__*/React.createElement("div", {
    className: "chan__d"
  }, c.d))))), /*#__PURE__*/React.createElement(Card, {
    title: "2 \xB7 Audiencia y voz",
    eyebrow: "A qui\xE9n y con qu\xE9 voz"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Audiencia",
    options: ['Finanzas (12 personas)', 'Toda la organización (124)', 'Riesgo alto (9)', 'Personalizada…']
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Voz a clonar",
    options: ['Camila Rojas · CFO', 'Genérica · femenina', 'Genérica · masculina', 'Sin voz (solo texto)']
  })), /*#__PURE__*/React.createElement("div", {
    className: "field-row"
  }, /*#__PURE__*/React.createElement("label", null, chan === 'call' ? 'Guion de la llamada' : 'Mensaje'), /*#__PURE__*/React.createElement("textarea", {
    className: "composer",
    value: msg,
    onChange: e => setMsg(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "vcard__play",
    style: {
      width: 34,
      height: 34
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "play"
  })), /*#__PURE__*/React.createElement(WaveBars, {
    tone: "accent",
    count: 16,
    height: 24
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, "Vista previa del clon \xB7 0:08")), /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    icon: "sparkles"
  }, "Voz IA"))), /*#__PURE__*/React.createElement(Card, {
    title: "3 \xB7 Programa y lanza",
    eyebrow: "Cu\xE1ndo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Momento",
    options: ['Ahora mismo', 'Programar para más tarde', 'Distribuir en 3 días']
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    checked: true,
    onChange: () => {},
    label: "Avisarme seg\xFAn respondan"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "warn-line"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-triangle"
  }), "Esto enviar\xE1 mensajes reales a 12 personas de Finanzas. Son simulados, pero sonar\xE1n de verdad."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "rocket",
    onClick: () => setSent(true)
  }, "Lanzar simulaci\xF3n"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    icon: "save"
  }, "Guardar borrador")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "En vivo ahora",
    eyebrow: "Simulaciones activas",
    action: /*#__PURE__*/React.createElement(StatusPill, {
      status: "live"
    }, live.length, " en vivo")
  }, live.map(c => {
    const m = D.channelMeta[c.channel];
    const pct = Math.round(c.resisted / c.sent * 100);
    return /*#__PURE__*/React.createElement("div", {
      className: "act",
      key: c.id
    }, /*#__PURE__*/React.createElement("div", {
      className: 'act__ch act__ch--' + m.tone
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": m.icon
    })), /*#__PURE__*/React.createElement("div", {
      className: "act__main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "act__name"
    }, c.name), /*#__PURE__*/React.createElement("div", {
      className: "act__meta"
    }, c.sent, " enviados \xB7 ", pct, "% resisti\xF3")), /*#__PURE__*/React.createElement(WaveBars, {
      tone: "primary",
      playing: true,
      count: 6,
      height: 22
    }));
  })), /*#__PURE__*/React.createElement(Card, {
    variant: "soft",
    padding: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "lock",
    style: {
      color: 'var(--primary)',
      width: 20,
      height: 20,
      flex: 'none',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-body)',
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-strong)'
    }
  }, "Uso \xE9tico garantizado."), " Solo lanzas a personas de tu organizaci\xF3n con voces consentidas. Cada acci\xF3n queda registrada."))))), sent && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: 24,
      bottom: 24,
      zIndex: 80
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    title: "Simulaci\xF3n lanzada",
    onClose: () => setSent(false)
  }, "12 mensajes en camino. Te avisaremos seg\xFAn las personas respondan.")));
}
window.LaunchScreen = LaunchScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sirena-app/LaunchScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sirena-app/Shell.jsx
try { (() => {
// Sirena · app shell (sidebar + topbar). Exposes window.Shell
const {
  IconButton,
  Avatar
} = window.SirenaDesignSystem_c1cb8e;
const NAV = [{
  id: 'resumen',
  label: 'Resumen',
  icon: 'layout-dashboard'
}, {
  id: 'personas',
  label: 'Personas',
  icon: 'users',
  count: '8'
}, {
  id: 'voces',
  label: 'Biblioteca de voces',
  icon: 'mic'
}, {
  id: 'campanas',
  label: 'Campañas',
  icon: 'radio',
  count: '6'
}, {
  id: 'lanzar',
  label: 'Sala de lanzamiento',
  icon: 'rocket'
}];
function ThemeToggle() {
  const [dark, setDark] = React.useState(() => document.documentElement.dataset.theme === 'dark');
  const flip = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('sirena-theme', next);
    } catch (e) {}
    setDark(!dark);
  };
  return /*#__PURE__*/React.createElement(IconButton, {
    icon: dark ? 'sun' : 'moon',
    variant: "outline",
    label: "Cambiar tema",
    onClick: flip
  });
}
function Shell({
  view,
  setView,
  title,
  sub,
  children,
  onLaunch
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "sb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb__logo"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark.svg",
    alt: "Sirena",
    id: "sb-logo-light"
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-wordmark-dark.svg",
    alt: "Sirena",
    id: "sb-logo-dark"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sb__org"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sb__org-badge"
  }, "P"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sb__org-name"
  }, "Platanus Org"), /*#__PURE__*/React.createElement("div", {
    className: "sb__org-sub"
  }, "PLAN PRO \xB7 124 PERSONAS")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevrons-up-down"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sb__sect"
  }, "Operaci\xF3n"), /*#__PURE__*/React.createElement("nav", {
    className: "sb__nav"
  }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    className: 'sb__item' + (view === n.id ? ' sb__item--active' : ''),
    onClick: () => setView(n.id)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": n.icon
  }), n.label, n.count && /*#__PURE__*/React.createElement("span", {
    className: "sb__count"
  }, n.count)))), /*#__PURE__*/React.createElement("div", {
    className: "sb__sect"
  }, "Cuenta"), /*#__PURE__*/React.createElement("nav", {
    className: "sb__nav"
  }, /*#__PURE__*/React.createElement("button", {
    className: "sb__item"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "settings"
  }), "Configuraci\xF3n"), /*#__PURE__*/React.createElement("button", {
    className: "sb__item"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "life-buoy"
  }), "Ayuda")), /*#__PURE__*/React.createElement("div", {
    className: "sb__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb__user"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Jordan Daly",
    size: "sm",
    status: "online"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sb__user-name"
  }, "Jordan Daly"), /*#__PURE__*/React.createElement("div", {
    className: "sb__user-role"
  }, "Admin de seguridad"))))), /*#__PURE__*/React.createElement("div", {
    className: "main"
  }, /*#__PURE__*/React.createElement("header", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "topbar__title"
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    className: "topbar__sub"
  }, sub)), /*#__PURE__*/React.createElement("div", {
    className: "topbar__search"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "search"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Buscar personas, campa\xF1as, voces\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "topbar__spacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "topbar__actions"
  }, /*#__PURE__*/React.createElement(ThemeToggle, null), /*#__PURE__*/React.createElement(IconButton, {
    icon: "bell",
    variant: "outline",
    label: "Notificaciones"
  }), /*#__PURE__*/React.createElement("button", {
    className: "sr-btn sr-btn--primary sr-btn--md",
    onClick: onLaunch
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "rocket"
  }), " Lanzar simulaci\xF3n"))), /*#__PURE__*/React.createElement("main", {
    className: "content"
  }, children)));
}
window.Shell = Shell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sirena-app/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sirena-app/UsersScreen.jsx
try { (() => {
// Sirena · Personas (Users) with detail modal. Exposes window.UsersScreen
const {
  Card,
  Avatar,
  Badge,
  StatusPill,
  ProgressBar,
  Button,
  IconButton,
  RiskMeter
} = window.SirenaDesignSystem_c1cb8e;
const RESULT = {
  resisted: {
    tone: 'success',
    label: 'Resistió'
  },
  reported: {
    tone: 'warning',
    label: 'Reportó'
  },
  compromised: {
    tone: 'danger',
    label: 'Cayó'
  }
};
const VOICE = {
  consented: {
    tone: 'signal',
    icon: 'badge-check',
    label: 'Consentida'
  },
  pending: {
    tone: 'neutral',
    icon: 'clock',
    label: 'Pendiente'
  },
  expired: {
    tone: 'warning',
    icon: 'alert-circle',
    label: 'Caducada'
  }
};
function fillColor(v) {
  return v >= 75 ? 'var(--success)' : v >= 50 ? 'var(--warning)' : 'var(--danger)';
}
function PersonModal({
  person,
  onClose
}) {
  const D = window.SirenaData;
  const card = D.scorecards[person.id] || D.scorecards.u2;
  const avg = Math.round(card.reduce((a, b) => a + b[1], 0) / card.length);
  return /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal__head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: person.name,
    size: "lg",
    status: person.risk === 'high' ? 'risk' : 'online'
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, person.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, person.email, " \xB7 ", person.dept))), /*#__PURE__*/React.createElement(IconButton, {
    icon: "x",
    variant: "ghost",
    label: "Cerrar",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal__body"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: 'risk-tag risk-tag--' + person.risk
  }, "Riesgo ", {
    high: 'alto',
    medium: 'medio',
    low: 'bajo'
  }[person.risk]), /*#__PURE__*/React.createElement(Badge, {
    tone: VOICE[person.voice].tone,
    icon: VOICE[person.voice].icon
  }, "Voz ", VOICE[person.voice].label.toLowerCase()), /*#__PURE__*/React.createElement(Badge, {
    tone: RESULT[person.result].tone
  }, "\xDAltima prueba: ", RESULT[person.result].label.toLowerCase())), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.3fr',
      gap: 20,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(RiskMeter, {
    value: Math.round((100 - avg) * 9),
    max: 900,
    caption: "Riesgo",
    size: 170
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 8
    }
  }, "Resistencia por canal"), card.map(([lbl, v]) => /*#__PURE__*/React.createElement("div", {
    className: "score-row",
    key: lbl
  }, /*#__PURE__*/React.createElement("div", {
    className: "score-row__lbl"
  }, lbl), /*#__PURE__*/React.createElement("div", {
    className: "score-row__bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "score-row__fill",
    style: {
      width: v + '%',
      background: fillColor(v)
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "score-row__v",
    style: {
      color: fillColor(v)
    }
  }, v))))), person.voice !== 'pending' && /*#__PURE__*/React.createElement(Card, {
    variant: "sunken",
    padding: "sm",
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "vcard__play"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "play"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-strong)',
      fontSize: 14
    }
  }, "Muestra de voz consentida"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, person.sample, " \xB7 capturada 2026-06-14"))), /*#__PURE__*/React.createElement(window.SirenaDesignSystem_c1cb8e.WaveBars, {
    tone: "signal",
    count: 14,
    height: 28
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "rocket",
    fullWidth: true
  }, "Lanzar prueba dirigida"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "mail"
  }, "Asignar formaci\xF3n")))));
}
function UsersScreen() {
  const D = window.SirenaData;
  const [sel, setSel] = React.useState(null);
  const [filter, setFilter] = React.useState('todas');
  const filters = [['todas', 'Todas'], ['high', 'Riesgo alto'], ['consented', 'Voz consentida'], ['compromised', 'Cayeron']];
  const rows = D.people.filter(p => filter === 'todas' ? true : filter === 'high' ? p.risk === 'high' : filter === 'consented' ? p.voice === 'consented' : filter === 'compromised' ? p.result === 'compromised' : true);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "124 personas \xB7 18 con voz consentida"), /*#__PURE__*/React.createElement("h1", null, "Personas"), /*#__PURE__*/React.createElement("p", null, "C\xF3mo responde tu equipo a las simulaciones de vishing, persona por persona.")), /*#__PURE__*/React.createElement("div", {
    className: "pills"
  }, filters.map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: 'pill-f' + (filter === k ? ' pill-f--active' : ''),
    onClick: () => setFilter(k)
  }, l))), /*#__PURE__*/React.createElement(Card, {
    padding: "sm"
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Persona"), /*#__PURE__*/React.createElement("th", null, "\xC1rea"), /*#__PURE__*/React.createElement("th", null, "Voz"), /*#__PURE__*/React.createElement("th", null, "\xDAltima prueba"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 180
    }
  }, "Resistencia"), /*#__PURE__*/React.createElement("th", null, "Riesgo"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(p => /*#__PURE__*/React.createElement("tr", {
    className: "row",
    key: p.id,
    onClick: () => setSel(p)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "cell-user"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: p.name,
    size: "sm",
    status: p.risk === 'high' ? 'risk' : undefined
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, p.name), /*#__PURE__*/React.createElement("span", null, p.email)))), /*#__PURE__*/React.createElement("td", null, p.dept), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    tone: VOICE[p.voice].tone,
    icon: VOICE[p.voice].icon,
    size: "sm"
  }, VOICE[p.voice].label)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Badge, {
    tone: RESULT[p.result].tone,
    size: "sm"
  }, RESULT[p.result].label)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: p.resistance,
    showValue: false,
    tone: p.resistance >= 75 ? 'success' : p.resistance >= 50 ? 'warning' : 'danger'
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--text-muted)',
      width: 28
    }
  }, p.resistance))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: 'risk-tag risk-tag--' + p.risk
  }, {
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo'
  }[p.risk]))))))), sel && /*#__PURE__*/React.createElement(PersonModal, {
    person: sel,
    onClose: () => setSel(null)
  }));
}
window.UsersScreen = UsersScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sirena-app/UsersScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sirena-app/VoiceLibraryScreen.jsx
try { (() => {
// Sirena · Biblioteca de voces (Voice Library). Exposes window.VoiceLibraryScreen
const {
  Card,
  Avatar,
  Badge,
  Button,
  WaveBars
} = window.SirenaDesignSystem_c1cb8e;
const VSTATE = {
  consented: {
    tone: 'signal',
    icon: 'badge-check',
    label: 'Consentida'
  },
  pending: {
    tone: 'neutral',
    icon: 'clock',
    label: 'Pendiente'
  },
  expired: {
    tone: 'warning',
    icon: 'alert-circle',
    label: 'Caducada'
  }
};
function VoiceCard({
  p,
  playing,
  onPlay
}) {
  const isPending = p.voice === 'pending';
  return /*#__PURE__*/React.createElement(Card, {
    hover: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "vcard__top"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: p.name,
    size: "md",
    status: p.risk === 'high' ? 'risk' : 'online'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "vcard__name"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "vcard__dept"
  }, p.dept)), /*#__PURE__*/React.createElement(Badge, {
    tone: VSTATE[p.voice].tone,
    icon: VSTATE[p.voice].icon,
    size: "sm"
  }, VSTATE[p.voice].label)), isPending ? /*#__PURE__*/React.createElement("div", {
    className: "vcard__wave",
    style: {
      justifyContent: 'center',
      color: 'var(--text-muted)',
      fontSize: 13,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "mic-off",
    style: {
      width: 18,
      height: 18
    }
  }), " A\xFAn sin grabar") : /*#__PURE__*/React.createElement("div", {
    className: "vcard__wave"
  }, /*#__PURE__*/React.createElement("button", {
    className: "vcard__play",
    onClick: onPlay
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": playing ? 'pause' : 'play'
  })), /*#__PURE__*/React.createElement(WaveBars, {
    tone: p.voice === 'expired' ? 'muted' : 'signal',
    playing: playing,
    count: 20,
    height: 30,
    barWidth: 3
  })), /*#__PURE__*/React.createElement("div", {
    className: "vcard__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vcard__time"
  }, isPending ? '—' : p.sample + ' · 2026-06-14'), isPending ? /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    size: "sm",
    icon: "send"
  }, "Invitar a grabar") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-faint)'
    }
  }, "SIR-V", p.id.slice(1))));
}
function VoiceLibraryScreen() {
  const D = window.SirenaData;
  const [filter, setFilter] = React.useState('todas');
  const [playing, setPlaying] = React.useState(null);
  const filters = [['todas', 'Todas'], ['consented', 'Consentidas'], ['pending', 'Pendientes'], ['expired', 'Caducadas']];
  const rows = D.people.filter(p => filter === 'todas' ? true : p.voice === filter);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "18 consentidas \xB7 6 pendientes"), /*#__PURE__*/React.createElement("h1", null, "Biblioteca de voces"), /*#__PURE__*/React.createElement("p", null, "Muestras de voz recolectadas con consentimiento expl\xEDcito, usadas solo para simulaciones \xE9ticas.")), /*#__PURE__*/React.createElement(Card, {
    variant: "accent-soft",
    padding: "sm",
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-md)',
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "shield-check"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 13,
      color: 'var(--text-body)',
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-strong)'
    }
  }, "Consentimiento verificado."), " Cada muestra tiene registro de auditor\xEDa y caduca a los 12 meses. Nadie es grabado de forma encubierta."), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    iconRight: "external-link"
  }, "Ver registro"))), /*#__PURE__*/React.createElement("div", {
    className: "pills"
  }, filters.map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: 'pill-f' + (filter === k ? ' pill-f--active' : ''),
    onClick: () => setFilter(k)
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "voice-grid"
  }, rows.map(p => /*#__PURE__*/React.createElement(VoiceCard, {
    key: p.id,
    p: p,
    playing: playing === p.id,
    onPlay: () => setPlaying(playing === p.id ? null : p.id)
  }))));
}
window.VoiceLibraryScreen = VoiceLibraryScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sirena-app/VoiceLibraryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sirena-app/data.js
try { (() => {
// Sirena · demo data for the UI kit (fake, illustrative). Spanish-first UI.
window.SirenaData = function () {
  const people = [{
    id: 'u1',
    name: 'Camila Rojas',
    email: 'camila.rojas@platanus.org',
    dept: 'Finanzas',
    voice: 'consented',
    sample: '0:34',
    risk: 'high',
    result: 'compromised',
    resistance: 38,
    last: 'Hace 2 días'
  }, {
    id: 'u2',
    name: 'Diego Fuentes',
    email: 'diego.fuentes@platanus.org',
    dept: 'Ingeniería',
    voice: 'consented',
    sample: '0:29',
    risk: 'low',
    result: 'resisted',
    resistance: 91,
    last: 'Hace 2 días'
  }, {
    id: 'u3',
    name: 'Valentina Soto',
    email: 'v.soto@platanus.org',
    dept: 'Personas',
    voice: 'pending',
    sample: '—',
    risk: 'medium',
    result: 'reported',
    resistance: 64,
    last: 'Hace 5 días'
  }, {
    id: 'u4',
    name: 'Matías Herrera',
    email: 'm.herrera@platanus.org',
    dept: 'Ventas',
    voice: 'consented',
    sample: '0:41',
    risk: 'high',
    result: 'compromised',
    resistance: 27,
    last: 'Hace 1 día'
  }, {
    id: 'u5',
    name: 'Antonia Vega',
    email: 'antonia.vega@platanus.org',
    dept: 'Legal',
    voice: 'consented',
    sample: '0:31',
    risk: 'low',
    result: 'resisted',
    resistance: 88,
    last: 'Hace 6 días'
  }, {
    id: 'u6',
    name: 'Joaquín Méndez',
    email: 'j.mendez@platanus.org',
    dept: 'Soporte',
    voice: 'consented',
    sample: '0:36',
    risk: 'medium',
    result: 'resisted',
    resistance: 72,
    last: 'Hace 3 días'
  }, {
    id: 'u7',
    name: 'Francisca Lara',
    email: 'f.lara@platanus.org',
    dept: 'Finanzas',
    voice: 'expired',
    sample: '0:28',
    risk: 'medium',
    result: 'reported',
    resistance: 58,
    last: 'Hace 8 días'
  }, {
    id: 'u8',
    name: 'Tomás Bravo',
    email: 'tomas.bravo@platanus.org',
    dept: 'Ingeniería',
    voice: 'consented',
    sample: '0:33',
    risk: 'low',
    result: 'resisted',
    resistance: 95,
    last: 'Hace 4 días'
  }];

  // Per-person channel resistance (for the detail panel scorecard)
  const scorecards = {
    u1: [['Nota de audio', 22], ['WhatsApp', 31], ['Llamada en vivo', 18], ['Clon de voz IA', 12], ['Suplantación', 45]],
    u2: [['Nota de audio', 92], ['WhatsApp', 88], ['Llamada en vivo', 95], ['Clon de voz IA', 85], ['Suplantación', 96]],
    u4: [['Nota de audio', 18], ['WhatsApp', 24], ['Llamada en vivo', 30], ['Clon de voz IA', 9], ['Suplantación', 36]]
  };
  const campaigns = [{
    id: 'SIR-4821',
    name: 'Urgencia del CFO',
    channel: 'whatsapp',
    status: 'live',
    sent: 24,
    resisted: 17,
    compromised: 3,
    when: 'Ahora'
  }, {
    id: 'SIR-4815',
    name: 'Verificación de banco',
    channel: 'call',
    status: 'live',
    sent: 12,
    resisted: 9,
    compromised: 1,
    when: 'Hace 12 min'
  }, {
    id: 'SIR-4790',
    name: 'Nota de voz de RRHH',
    channel: 'audio',
    status: 'success',
    sent: 31,
    resisted: 28,
    compromised: 2,
    when: 'Ayer'
  }, {
    id: 'SIR-4772',
    name: 'Soporte TI · reinicio',
    channel: 'call',
    status: 'success',
    sent: 18,
    resisted: 14,
    compromised: 4,
    when: 'Hace 3 días'
  }, {
    id: 'SIR-4760',
    name: 'Clon de voz · gerencia',
    channel: 'audio',
    status: 'scheduled',
    sent: 0,
    resisted: 0,
    compromised: 0,
    when: 'En 2 días'
  }, {
    id: 'SIR-4744',
    name: 'Factura urgente',
    channel: 'whatsapp',
    status: 'draft',
    sent: 0,
    resisted: 0,
    compromised: 0,
    when: 'Borrador'
  }];
  const channelMeta = {
    audio: {
      icon: 'audio-lines',
      label: 'Nota de audio',
      tone: 'signal'
    },
    whatsapp: {
      icon: 'message-circle',
      label: 'WhatsApp',
      tone: 'success'
    },
    call: {
      icon: 'phone-call',
      label: 'Llamada',
      tone: 'primary'
    }
  };
  const riskHistory = [520, 512, 498, 505, 470, 455, 460, 432, 418, 410, 397, 385];
  return {
    people,
    scorecards,
    campaigns,
    channelMeta,
    riskHistory
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sirena-app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.RiskMeter = __ds_scope.RiskMeter;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.WaveBars = __ds_scope.WaveBars;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

})();
