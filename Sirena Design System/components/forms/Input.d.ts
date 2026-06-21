import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message; turns the field red and overrides hint. */
  error?: string;
  /** Lucide icon name shown inside the field on the left. */
  icon?: string;
}

/** Labelled text input with optional leading icon, hint & error states. */
export function Input(props: InputProps): JSX.Element;
