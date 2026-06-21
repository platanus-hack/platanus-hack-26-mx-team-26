import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  /** Override the right-side value text (e.g. "12 / 24"). */
  valueLabel?: string;
  tone?: 'primary' | 'accent' | 'signal' | 'success' | 'warning' | 'danger';
  size?: 'md' | 'lg';
}

/** Horizontal progress / completion bar with optional label & value. */
export function ProgressBar(props: ProgressBarProps): JSX.Element;
