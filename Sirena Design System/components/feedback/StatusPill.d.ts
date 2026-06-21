import React from 'react';

export type PillStatus = 'live' | 'success' | 'warning' | 'draft' | 'scheduled';

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `live` pulses a red dot; others are static colored dots. */
  status?: PillStatus;
}

/** Mono status pill with a colored dot for campaign/simulation state. */
export function StatusPill(props: StatusPillProps): JSX.Element;
