import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'soft' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button.
 * @startingPoint section="Forms" subtitle="Coral CTA with variants, sizes & icons" viewport="700x160"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = coral CTA, `secondary` = crimson, `soft`/`ghost` = low emphasis. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Lucide icon name rendered before the label (e.g. "play", "phone-call"). */
  icon?: string;
  /** Lucide icon name rendered after the label. */
  iconRight?: string;
  fullWidth?: boolean;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  /** Render as another element/tag, e.g. "a". */
  as?: any;
}

/** Primary action button for the Sirena console. */
export function Button(props: ButtonProps): JSX.Element;
