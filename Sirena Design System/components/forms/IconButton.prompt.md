Icon-only square button for toolbars, card headers, and the topbar — always pass `label` for accessibility.

```jsx
<IconButton icon="bell" label="Notifications" />
<IconButton icon="play" variant="solid" label="Play sample" />
<IconButton icon="more-horizontal" variant="outline" label="More" />
```

Variants: `ghost` (default) · `outline` · `solid` (coral) · `soft`. Sizes `sm`/`md`/`lg`. Lucide icon names — call `lucide.createIcons()` after render.
