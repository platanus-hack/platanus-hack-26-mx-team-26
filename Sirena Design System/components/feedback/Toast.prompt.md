Notification toast with a tone accent bar, icon, title, and message.

```jsx
<Toast tone="success" title="Simulation launched" onClose={dismiss}>
  We'll notify you as people respond.
</Toast>
<Toast tone="danger" title="3 people compromised">
  They opened the WhatsApp voice note.
</Toast>
```

Tones: `info · success · danger · warning`. Icons are auto-chosen (override with `icon`) — call `lucide.createIcons()` after render.
