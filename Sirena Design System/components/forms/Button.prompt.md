Coral primary action button — use for the main action in any view; reach for `soft`/`ghost`/`link` for secondary actions and `secondary` (crimson) for AI-voice contexts.

```jsx
<Button variant="primary" icon="play">Launch simulation</Button>
<Button variant="secondary" icon="sparkles">Generate voice</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="danger" icon="phone-call">Place 24 calls</Button>
<Button variant="soft" iconRight="arrow-right">View report</Button>
<Button loading>Sending…</Button>
```

Variants: `primary` · `secondary` · `danger` · `soft` · `ghost` · `link`. Sizes: `sm` · `md` · `lg`. Icons are Lucide names — call `lucide.createIcons()` after render. Press shrinks to 0.97; primary/secondary gain a colored glow on hover.
