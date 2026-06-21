---
name: sirena-design
description: Use this skill to generate well-branded interfaces and assets for Sirena (a voice-security / anti-vishing awareness platform), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

Sirena is a voice-security awareness platform: it collects consented employee voice samples and
runs controlled, ethical vishing (voice-phishing) simulations across audio notes, WhatsApp, and
phone calls — then measures org + per-person resilience. The brand is warm, rounded, and
approachable on a serious security spine. Coral (orange-red) primary, Crimson deep-berry accent, Gold
warm highlight, Fern green for voice/consent — on warm stone neutrals (no AI violet/teal). Light + dark modes are both first-class. Tone is calm and human (never alarmist);
UI ships bilingual-ready (Spanish-first for LATAM). See `readme.md` for the full content + visual
foundations.

**Key files**
- `styles.css` — link this one file to get all tokens + fonts (it `@import`s `tokens/*`).
- `tokens/` — colors (light/dark), typography, spacing, elevation, base resets.
- `components/` — React primitives (`forms/`, `feedback/`, `data/`); each has `.jsx` + `.d.ts` + `.prompt.md`.
- `ui_kits/sirena-app/` — interactive desktop web console (Resumen · Personas · Voces · Lanzamiento).
- `assets/` — logo lockups + favicon mark. Icons: **Lucide** via CDN.
- `guidelines/` — foundation specimen cards.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create
static HTML files for the user to view — link `styles.css`, set `data-theme` on `<html>`, and use the
CSS custom properties (never hardcode hex). For React, load the compiled `_ds_bundle.js` and read
components from `window.SirenaDesignSystem_<hash>` (run the design-system check to confirm the exact
namespace), or just reimplement the small primitives from the `.prompt.md` examples. Load Lucide and
call `lucide.createIcons()` after render for any `<i data-lucide="…">` icons.

If working on production code, copy assets and read the rules here to become an expert in designing
with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask a few questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.
