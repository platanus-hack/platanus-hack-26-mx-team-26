# Sirena — Design System

**Sirena** is a voice-security awareness platform. Like the mythological siren that lures with its
voice, modern attackers use **vishing** (voice phishing): cloned or social-engineered voices over
phone, WhatsApp audio, and voice notes. Sirena helps organizations build resistance to it.

With employee consent, Sirena collects short voice samples, analyzes them, and stores a voice
profile that powers **controlled, ethical simulations**. From a single control room, an admin
launches awareness exercises across channels — drop a synthetic voice note, send a WhatsApp
message, or place a simulated call — then measures how each person and the whole organization
responds. It is the **intermediary that activates** an org's existing awareness systems and turns
the results into a security-culture score.

> Example tenant used throughout the kit: **Platanus Org**.

### Core jobs the product does
1. **Collect** consented voice samples and build per-person voice profiles (with status + audit trail).
2. **Launch** simulations from one place — Audio note · WhatsApp message · Phone call.
3. **Measure** outcomes per user (resisted / reported / compromised) and roll them up to an org Risk Score.
4. **Coach** — show people where they're vulnerable and assign follow-up.

### Source material
The visual direction was distilled from references the user provided (stored in `uploads/`):
- **Wizer** training console — `All-Categories.png`, `Calander.png.webp`, `Popup.png.webp`.
  This is the primary inspiration: warm, friendly, rounded, soft pastel surfaces, a confident
  accent color, generous radii, dimensional/illustrative iconography, pill filters, soft cards.
- **usecure** dashboard — `Screenshot-2022-01-25-16.13.09.png.webp`, `Screenshot-2022-03-09-09.47.43.png`.
  Reference for the **risk-score gauge**, KPI summary cards, and per-user radar/score modal patterns.

No codebase or Figma was provided — the product UI here is an **original design** inspired by the
above, not a recreation of Wizer or usecure. Their distinctive branding is **not** reproduced.

---

## CONTENT FUNDAMENTALS

**Voice & tone.** Calm, confident, and human — never alarmist. Sirena deals with attacks but speaks
like a trusted coach, not a fear vendor. Plain language over jargon. We name the threat clearly
("vishing", "voice cloning") but frame everything around *building resilience*, not blame.

- **Person:** address the admin as **you** ("Launch your first simulation"). Refer to employees as
  **people** or **your team** — never "targets" or "victims" in the UI. In simulation results the
  neutral verbs are **Resisted · Reported · Compromised**.
- **Casing:** Sentence case for everything — buttons, headings, menu items ("Launch simulation",
  not "Launch Simulation"). Reserve UPPERCASE only for mono eyebrows/overlines and short status
  pills (`LIVE`, `DRAFT`).
- **Bilingual:** the audience is Spanish-speaking (LATAM). UI copy ships **bilingual-ready** — the
  UI kit demonstrates Spanish strings ("Lanzar simulación", "Biblioteca de voces"). Keep sentences
  short so they survive translation without breaking layout.
- **Numbers tell the story:** lead cards with one big number + one line of context
  ("Risk score 385 · down 12 this week"). Avoid stat-stuffing — one hero metric per card.
- **Consent is sacred:** any copy about voice collection states consent explicitly and links to the
  audit trail. Never imply covert recording.
- **Emoji:** not used in product chrome. (The references show a few playful emoji badges; Sirena
  keeps chrome emoji-free and expresses warmth through color, shape, and the dimensional icons.)

**Examples**
- Empty state: "No voices collected yet. Invite your team to record a 30-second sample — with consent."
- Success toast: "Simulation launched. We'll notify you as people respond."
- Risk up (bad): "Risk climbed 18 points. Three people fell for the WhatsApp audio test."
- Microcopy under a destructive action: "This sends real messages to 24 people. They're simulated, but they'll ring."

---

## VISUAL FOUNDATIONS

**Personality.** Warm, rounded, and approachable on top of a serious security spine. Friendly like
the Wizer references — soft surfaces, big radii, a confident coral accent — but grown-up: restrained
color, real data density, no clutter.

**Color.** Four warm brand hues + a full semantic set. Defined in `tokens/colors.css`. The palette is
deliberately warm and human — inspired by the Wizer references — with **no violet or teal** (the usual
"AI SaaS" tells).
- **Coral `--coral-500 #F2502E`** — primary. The "lure." Buttons, active nav, key emphasis, the logo.
- **Crimson `--crimson-500 #A21E4A`** (`--accent`) — deep berry. Synthetic / AI-voice contexts, secondary actions, links.
- **Gold `--gold-400 #E9A50F`** (`--highlight`) — warm pop. Plan/level badges, highlights, the Wizer-style yellow accent (always with dark text).
- **Fern `--fern-500 #1E8344`** (`--signal`) — green. Voice waveforms, "verified / consented" states, success.
- **Neutrals** are a **warm stone** ramp (faint warm/taupe cast) — never cool violet-grey.
- **Semantic:** success (fern green), warning (amber), danger (red), info (muted denim, used sparingly). In simulation results,
  green = resisted/safe, amber = reported-late/caution, red = compromised.
- Use brand/semantic tokens only; if you need an in-between, derive with `color-mix(in oklch, …)`.
  Never hardcode hex in components.

**Light & dark.** Both are first-class. Light = warm-white `--n-50` page on white cards. Dark =
deep warm charcoal `--n-950` page on `--n-900` cards. Toggle via
`document.documentElement.dataset.theme = 'light' | 'dark'`. Components reference semantic aliases
(`--surface`, `--text-strong`, `--primary`…) which remap per mode — never the raw scale.

**Typography.**
- **Display — Space Grotesk** (700/500): headings, big numbers, hero metrics. Tight tracking, techy-but-friendly.
- **Body — Manrope** (400–700): all UI text and prose. Clean, geometric, legible at small sizes.
- **Data — Space Mono** (400/700): eyebrows/overlines, IDs, phone numbers, timestamps, code, table figures.
- Scale and tokens in `tokens/typography.css`. Base body 15px; dashboard minimum 13px; hero numbers 40–66px.

**Spacing & layout.** 4px grid (`tokens/spacing.css`). App shell = fixed `264px` sidebar + `68px`
topbar + scrolling content (max `1280px`). Generous padding inside cards (20–24px). Group siblings
with flex/grid + `gap`, never margins-on-children.

**Corner radii.** Soft and rounded — the signature of the references. Cards `--radius-lg 20px`,
inputs/buttons `--radius-md 14px`, pills/chips `--radius-pill`, modals `--radius-xl 28px`, big
feature panels `--radius-2xl`. Nothing sharp.

**Cards.** White (light) / `--n-900` (dark) surface, `--radius-lg`, `1px --border`, `--shadow-sm`
at rest → `--shadow-md` on hover with a 1px lift (`translateY(-2px)`). No colored left-border-only
cards. Feature cards may use a tinted soft surface (`--primary-soft`, `--accent-soft`).

**Shadows.** Soft, low-contrast, faint warm cast in light mode (`--shadow-xs…xl`). Dark mode uses
deeper ambient shadow + borders for separation. Primary/accent CTAs may carry a colored glow
(`--glow-primary`) on hover only.

**Backgrounds.** Mostly flat surface color. Optional decorative **dot grid** (`.sr-dotgrid`,
radial-dot texture) on empty hero areas — evokes an audio/signal field. **No** heavy gradients, no
flourish (`--coral` attack / `--fern` consented bars), reserved for voice contexts.

**Motion.** Quick and gentle. `--dur-base 200ms` with `--ease-out` for most transitions; `--ease-spring`
for playful affordances (toggle thumbs, badge pops). Fades + small slides/scales — no long or
infinite decorative loops (a live "recording"/pulse dot is the only allowed loop). Respect
`prefers-reduced-motion`.

**Hover / press.**
- Hover: solid fills darken one step (`--primary` → `--primary-hover`); soft/ghost elements gain a
  tinted background; cards lift + deepen shadow.
- Press: darken another step (`--primary-press`) and `scale(0.97)`. No opacity-only states.
- Focus: 4px `--focus-ring` halo (coral, semi-transparent) via `:focus-visible`.

**Borders.** Hairline `1px --border`; `--border-strong` for emphasis/active; `--border-faint` for
inner dividers. Border radius always from the radius scale.

**Transparency & blur.** Reserved: modal/overlay scrim (`--overlay`), sticky topbar may use a
`backdrop-filter: blur` over a translucent surface. Don't blur content areas.

**Imagery vibe.** Product is illustration-led, not photo-led. Where the references use 3D/dimensional
icons, Sirena uses **Lucide** line icons (see Iconography) plus the coral/green **waveform motif**.
Any imagery should be warm, slightly saturated, never cold corporate stock.

---

## ICONOGRAPHY

- **Primary icon set: [Lucide](https://lucide.dev)** — clean, rounded line icons, `1.75–2px` stroke,
  which matches Sirena's friendly-but-precise feel. Loaded from CDN
  (`https://unpkg.com/lucide@latest`); call `lucide.createIcons()` after render, or use
  `<i data-lucide="mic"></i>`. Default stroke `1.75`, size `20px`, `currentColor`.
- **Why Lucide (substitution note):** the reference apps (Wizer/usecure) use bespoke dimensional/3D
  illustrative icons we don't have the assets for. Lucide is the closest open, license-clean match
  for a coherent line-icon language. **If you have Sirena's own icon assets, drop them in `assets/`
  and update this section** — flagged for the user.
- **Recurring glyphs:** `mic` / `audio-lines` / `waveform` (voice), `phone-call` (call sim),
  `message-circle` (WhatsApp/SMS sim), `shield` / `shield-check` (resilience), `users` (people),
  `gauge` (risk score), `play` / `radio` (launch/live), `badge-check` (consent verified).
- **Emoji:** not used in product chrome.
- **Unicode as icons:** avoid; use Lucide. Mono figures (Space Mono) may use `·` separators and
  arrows (`↑ ↓`) inline with metrics.
- **The waveform motif** (animated coral/green bars) is drawn with CSS/divs, not an icon font — it's a
  brand device, used sparingly in voice/recording contexts.

Logo / wordmark assets live in `assets/` (see `assets/` + the Brand cards in the Design System tab).

---

## INDEX — what's in this project

**Foundations**
- `styles.css` — root entry (import this). Imports everything below.
- `tokens/fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `elevation.css` · `base.css`
- `guidelines/*.html` — specimen cards (Type, Colors, Spacing) shown in the Design System tab.

**Brand**
- `assets/` — logo lockups (`logo-*.svg`), favicon mark, waveform motif. See Brand cards.

**Components** (`components/<group>/` — React primitives, each with `.jsx` + `.d.ts` + `.prompt.md` + a card)
- `forms/` — Button, IconButton, Input, Select, Switch
- `feedback/` — Badge, StatusPill, ProgressBar, Toast
- `data/` — Card, StatCard, RiskMeter, Avatar, WaveBars

**UI kit** (`ui_kits/sirena-app/`)
- `index.html` — interactive click-through of the Sirena admin console (Dashboard · Users · Voice library · Launch room), with light/dark toggle.
- `Screen*.jsx` / `Shell.jsx` — composed screens.

**Meta**
- `SKILL.md` — makes this folder usable as a downloadable Agent Skill.
- `readme.md` — this file.

> The compiler auto-generates `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`. Never edit those.
