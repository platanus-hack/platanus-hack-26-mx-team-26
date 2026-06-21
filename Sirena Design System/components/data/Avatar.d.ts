import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — used for initials & deterministic color. */
  name?: string;
  /** Image URL; falls back to initials. */
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Status dot: online (green), idle (amber), risk (red). */
  status?: 'online' | 'idle' | 'risk';
  /** Adds a surface ring (for overlapping stacks). */
  ring?: boolean;
}

/** User avatar with initials fallback, deterministic color & status dot. */
export function Avatar(props: AvatarProps): JSX.Element;
