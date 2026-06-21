The base rounded surface for every panel. Optional `eyebrow` / `title` / `action` header, soft tinted variants, and a hover lift for clickable cards.

```jsx
<Card title="Risk score" eyebrow="Platanus org" action={<IconButton icon="more-horizontal" label="More" />}>
  …content…
</Card>

<Card variant="soft" hover>Feature panel on a coral tint</Card>
<Card variant="sunken" padding="sm">Inset row</Card>
```

Variants: `default · soft · accent-soft · sunken`. Padding: `none · sm · md`.
