Completion / progress bar with optional label and value readout.

```jsx
<ProgressBar label="Voices collected" value={18} max={24} valueLabel="18 / 24" tone="signal" />
<ProgressBar label="Training" value={50} tone="primary" />
<ProgressBar value={20} tone="danger" showValue={false} />
```

Tones map to brand/semantic colors. Use for collection progress, training %, policy sign-off, etc.
