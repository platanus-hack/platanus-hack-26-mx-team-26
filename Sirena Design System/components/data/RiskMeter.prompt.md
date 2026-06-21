Semicircular risk-score gauge inspired by the references. The arc fills green→amber→red by zone; **lower is safer**.

```jsx
<RiskMeter value={385} max={900} caption="Average" sublabel="Down 12 from last week" />
```

Size the gauge with `size` (px). Use one per dashboard as the hero risk indicator; pair with `StatCard`s for the channel breakdown.
