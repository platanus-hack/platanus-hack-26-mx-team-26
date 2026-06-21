import React from 'react';

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'signal' | 'highlight' | 'success' | 'warning' | 'danger' | 'solid';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  /** Optional Lucide icon name shown before the label. */
  icon?: string;
}

/** Small pill label for counts, categories & tags. */
export function Badge(props: BadgeProps): JSX.Element;
