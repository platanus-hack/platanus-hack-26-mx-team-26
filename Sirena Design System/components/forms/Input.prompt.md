Labelled text input with optional leading Lucide icon, hint text, and error state.

```jsx
<Input label="Work email" type="email" icon="mail" placeholder="you@platanus.org" />
<Input label="Phone" icon="phone" hint="We only call during simulations." />
<Input label="Org name" error="This name is taken." defaultValue="platanus" />
```

Focus shows the coral ring; `error` turns it red. Call `lucide.createIcons()` after render if using `icon`.
