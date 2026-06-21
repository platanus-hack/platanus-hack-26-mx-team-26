import React from 'react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  tone?: 'info' | 'success' | 'danger' | 'warning';
  /** Override the auto Lucide icon. */
  icon?: string;
  /** Show a close button wired to this handler. */
  onClose?: () => void;
}

/** Notification toast with tone accent bar, icon, title & message. */
export function Toast(props: ToastProps): JSX.Element;
