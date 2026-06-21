import React from 'react';

/**
 * Props for the StatCard.
 * @startingPoint section="Data" subtitle="KPI card with hero number & trend delta" viewport="340x180"
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  /** Small unit shown after the value, e.g. "%", "/ 24". */
  unit?: string;
  /** Lucide icon name in the tinted top-right chip. */
  icon?: string;
  tone?: 'primary' | 'accent' | 'signal' | 'success' | 'danger';
  /** Delta text, e.g. "12". */
  delta?: string;
  /** `up`=red (risk rose), `down`=green (risk fell), `good-up`=green rise. */
  deltaTone?: 'up' | 'down' | 'good-up';
  /** Footnote line under the value. */
  foot?: React.ReactNode;
  hover?: boolean;
}

/** KPI summary card — one hero number, icon, and trend delta. */
export function StatCard(props: StatCardProps): JSX.Element;
