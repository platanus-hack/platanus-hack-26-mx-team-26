// Derives UI-facing outcome/resistance/risk from the real `simulaciones` columns.
// There is no stored "status" enum for outcomes — only segundos_en_caer (set once
// the person falls for it) and fecha_interaccion (set once they interact at all).

export function simOutcome(sim) {
  if (sim.segundos_en_caer != null) return "compromised";
  if (sim.fecha_interaccion != null) return "resisted";
  return "sent";
}

export function computeResistance(simulaciones) {
  const resolved = simulaciones.filter((s) => s.fecha_interaccion != null);
  if (resolved.length === 0) return null;
  const resisted = resolved.filter((s) => s.segundos_en_caer == null).length;
  return Math.round((resisted / resolved.length) * 100);
}

export function riskFromResistance(resistencia) {
  if (resistencia == null) return null;
  return Math.round((100 - resistencia) * 9);
}

export function riskTier(resistencia) {
  if (resistencia == null) return "unknown";
  if (resistencia >= 75) return "low";
  if (resistencia >= 50) return "medium";
  return "high";
}
