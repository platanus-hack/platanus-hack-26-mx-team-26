Styled wrapper over a native `<select>` (keeps native dropdown + keyboard a11y). Pass `options` or your own `<option>` children.

```jsx
<Select label="Channel" options={['Audio note','WhatsApp','Phone call']} />
<Select label="Language" size="sm" options={[{value:'es',label:'Español'},{value:'en',label:'English'}]} />
```

Uses Lucide `chevron-down` — call `lucide.createIcons()` after render.
