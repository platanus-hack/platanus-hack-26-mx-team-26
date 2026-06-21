// Derives UI-facing outcome/resistance/risk from the `sesiones` table.
// La tabla sesiones reemplaza a simulaciones como tabla maestra.
// estado: 'active' | 'done' | 'error' | 'pendiente'
// segundos_en_caer: set cuando la víctima cayó
// resumen_markdown: generado por la IA al terminar

// La tabla sesiones NO tiene segundos_en_caer en la DB actual.
// El outcome se deriva del campo `estado` y del resumen_markdown.
export function simOutcome(ses) {
  if (!ses) return "sent";
  // Si el resumen indica que cayó (el agente lo registra en resumen_markdown)
  if (ses.resumen_markdown && /comprometid|cayó|fall|credential/i.test(ses.resumen_markdown)) return "compromised";
  // Sesión finalizada sin comprometer → resistió
  if (ses.estado === "done") return "resisted";
  if (ses.estado === "error") return "resisted";
  // Active o pendiente → en curso
  return "sent";
}

export function computeResistance(sesiones) {
  const resolved = (sesiones || []).filter((s) => s.estado === "done" || s.estado === "error");
  if (resolved.length === 0) return null;
  const resisted = resolved.filter((s) => simOutcome(s) !== "compromised").length;
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
