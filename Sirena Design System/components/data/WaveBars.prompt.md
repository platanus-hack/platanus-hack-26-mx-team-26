The brand waveform motif as a component — inline audio bars for voice/recording contexts. Set `playing` while a sample plays or records.

```jsx
<WaveBars tone="signal" count={9} />            {/* consented voice (green), static */}
<WaveBars tone="primary" playing height={24} />  {/* live attack audio, animating */}
```

Tones: `primary` (coral, attack) · `signal` (green, consented) · `accent` (crimson, AI voice) · `muted`. Decorative only — pair with a play button or recording indicator.
