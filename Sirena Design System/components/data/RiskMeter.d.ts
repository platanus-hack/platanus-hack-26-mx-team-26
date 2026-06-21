/**
 * Props for the RiskMeter.
 * @startingPoint section="Data" subtitle="Semicircular risk-score gauge" viewport="320x220"
 */
export interface RiskMeterProps {
  /** Current score. */
  value?: number;
  min?: number;
  max?: number;
  /** Pixel width of the gauge. */
  size?: number;
  label?: string;
  /** Caption rendered under the number inside the arc, e.g. "AVERAGE". */
  caption?: string;
  /** Line below the gauge, e.g. "Down 12 from last week". */
  sublabel?: string;
}

/** Semicircular risk-score gauge (green→amber→red by zone). Lower = safer. */
export function RiskMeter(props: RiskMeterProps): JSX.Element;
