import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon name, e.g. "bell", "more-horizontal", "play". */
  icon: string;
  variant?: 'ghost' | 'outline' | 'solid' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label (also used as tooltip title). */
  label: string;
}

/** Square icon-only button for toolbars, cards & topbars. */
export function IconButton(props: IconButtonProps): JSX.Element;
