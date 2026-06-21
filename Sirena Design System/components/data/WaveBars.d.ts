import React from 'react';

export interface WaveBarsProps extends React.HTMLAttributes<HTMLSpanElement> {
  count?: number;
  /** Max bar height in px. */
  height?: number;
  barWidth?: number;
  /** coral / iris / teal / muted. */
  tone?: 'primary' | 'accent' | 'signal' | 'muted';
  /** Animate bars (use while a sample plays / records). */
  playing?: boolean;
}

/** The Sirena waveform motif — inline animated audio bars for voice contexts. */
export function WaveBars(props: WaveBarsProps): JSX.Element;
