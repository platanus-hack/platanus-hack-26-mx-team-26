Coral on/off toggle with a spring-animated thumb. Controlled — pass `checked` and handle `onChange`.

```jsx
const [on, setOn] = React.useState(true);
<Switch checked={on} onChange={setOn} label="Notify me as people respond" />
```
