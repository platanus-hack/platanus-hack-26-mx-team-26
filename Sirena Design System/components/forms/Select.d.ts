import React from 'react';

export interface SelectOption { value: string; label: string; }

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  /** Options as strings or {value,label}. Ignored if children are passed. */
  options?: (string | SelectOption)[];
  size?: 'sm' | 'md';
}

/** Styled native select with a chevron — keeps native a11y & keyboard behavior. */
export function Select(props: SelectProps): JSX.Element;
