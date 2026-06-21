KPI summary card: one hero number with an icon chip and an optional trend delta. Note the delta semantics — for a risk metric, *up is bad* (`deltaTone="up"` = red).

```jsx
<StatCard label="Risk score" value="385" icon="gauge" tone="danger" delta="12" deltaTone="down" foot="Lower is better" />
<StatCard label="Voices consented" value="18" unit="/ 24" icon="mic" tone="signal" />
<StatCard label="Resisted this week" value="92" unit="%" icon="shield-check" tone="success" delta="8" deltaTone="good-up" />
```

One metric per card — don't stack stats. Icons are Lucide names.
