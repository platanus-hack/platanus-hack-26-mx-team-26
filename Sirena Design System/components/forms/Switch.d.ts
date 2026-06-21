export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/** Coral toggle switch with a spring thumb — for settings & on/off options. */
export function Switch(props: SwitchProps): JSX.Element;
