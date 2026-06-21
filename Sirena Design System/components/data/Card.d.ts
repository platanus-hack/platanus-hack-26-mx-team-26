import React from 'react';

/**
 * Props for the Card.
 * @startingPoint section="Data" subtitle="Rounded surface with optional header & hover lift" viewport="700x200"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'soft' | 'accent-soft' | 'sunken';
  padding?: 'none' | 'sm' | 'md';
  /** Adds hover lift + pointer; use for clickable cards. */
  hover?: boolean;
  /** Optional header title (display font). */
  title?: React.ReactNode;
  /** Mono overline above the title. */
  eyebrow?: React.ReactNode;
  /** Node rendered at the right of the header (e.g. an IconButton). */
  action?: React.ReactNode;
}

/** The base rounded surface for every panel. */
export function Card(props: CardProps): JSX.Element;
