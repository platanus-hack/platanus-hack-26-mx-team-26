import React from 'react';
import * as icons from 'lucide-react';

function toPascalCase(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const cache = new Map();

function resolveIcon(name) {
  if (!name) return null;
  if (cache.has(name)) return cache.get(name);
  const found = icons[toPascalCase(name)] || null;
  cache.set(name, found);
  return found;
}

// Drop-in replacement for the old `<i data-lucide="name">` markup. Renders a
// real lucide-react component so React owns the DOM node (no external script
// mutating it out from under React's reconciliation).
export function Icon({ name, ...rest }) {
  const Component = resolveIcon(name);
  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`Icon "${name}" not found in lucide-react`);
    }
    return null;
  }
  return <Component aria-hidden="true" {...rest} />;
}
