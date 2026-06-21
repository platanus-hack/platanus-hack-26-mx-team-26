import { supabase } from "../lib/supabaseClient";
import { computeResistance, riskFromResistance, riskTier, simOutcome } from "./derive";

// ── Field selects ────────────────────────────────────────────────────────────

const EMPLEADO_FIELDS = `
  id, empresa_id, nombre_completo, correo_electronico, departamento, puesto, telefono, fecha_registro,
  repertorio_voces ( id, elevenlabs_voice_id, esta_activo, fecha_creacion ),
  simulaciones ( id, guion_texto, estado, audio_url, segundos_en_caer, fecha_envio, fecha_interaccion, token_rastreo )
`;

// Deterministic real-face placeholder — same employee id always gets the same photo.
function photoUrlFor(id) {
  return `https://i.pravatar.cc/240?u=${id}`;
}

function mapEmpleado(emp) {
  const voces = emp.repertorio_voces || [];
  const activeVoice = voces.find((v) => v.esta_activo) || voces[0] || null;
  const voice = voces.length === 0 ? "pending" : activeVoice?.esta_activo ? "consented" : "expired";

  const sims = (emp.simulaciones || [])
    .slice()
    .sort((a, b) => new Date(b.fecha_envio) - new Date(a.fecha_envio));
  const resistencia = computeResistance(sims);
  const last = sims[0] || null;

  return {
    id: emp.id,
    empresaId: emp.empresa_id ?? null,
    name: emp.nombre_completo,
    email: emp.correo_electronico,
    dept: emp.departamento,
    puesto: emp.puesto,
    telefono: emp.telefono,
    photoUrl: photoUrlFor(emp.id),
    voice,
    voiceId: activeVoice?.id ?? null,
    elevenlabsVoiceId: activeVoice?.elevenlabs_voice_id ?? null,
    voiceCreatedAt: activeVoice?.fecha_creacion ?? null,
    risk: riskTier(resistencia),
    riskScore: riskFromResistance(resistencia),
    result: last ? simOutcome(last) : null,
    resistance: resistencia,
    simCount: sims.length,
    simulaciones: sims,
  };
}

// ── Empresas ─────────────────────────────────────────────────────────────────

export async function fetchEmpresas() {
  const { data, error } = await supabase
    .from("empresas")
    .select("id, nombre_empresa, sector, datos_scraping, fecha_registro")
    .order("fecha_registro", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchEmpresa(id) {
  const { data, error } = await supabase
    .from("empresas")
    .select("id, nombre_empresa, sector, datos_scraping, fecha_registro")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// ── Empleados ─────────────────────────────────────────────────────────────────

export async function fetchPeople({ empresaId } = {}) {
  let q = supabase.from("empleados").select(EMPLEADO_FIELDS).order("fecha_registro", { ascending: false });
  if (empresaId) q = q.eq("empresa_id", empresaId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapEmpleado);
}

// ── Repertorio de voces ───────────────────────────────────────────────────────

export async function fetchVoces({ empresaId } = {}) {
  let q = supabase
    .from("repertorio_voces")
    .select("id, elevenlabs_voice_id, esta_activo, fecha_creacion, empleados ( id, nombre_completo, empresa_id )")
    .order("fecha_creacion", { ascending: false });
  if (empresaId) q = q.eq("empleados.empresa_id", empresaId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

// ── Simulaciones ──────────────────────────────────────────────────────────────

export async function fetchSimulacionesFlat(limit = 50, { empresaId } = {}) {
  let q = supabase
    .from("simulaciones")
    .select(
      "id, guion_texto, estado, audio_url, segundos_en_caer, fecha_envio, fecha_interaccion, token_rastreo, " +
      "empleados ( id, nombre_completo, departamento, empresa_id ), " +
      "repertorio_voces ( elevenlabs_voice_id )"
    )
    .order("fecha_envio", { ascending: false })
    .limit(limit);
  if (empresaId) q = q.eq("empleados.empresa_id", empresaId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createDraftSimulacion({ vozId, guionTexto }) {
  const { data, error } = await supabase
    .from("simulaciones")
    .insert([{ voz_id: vozId ?? null, guion_texto: guionTexto, estado: "borrador" }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createSimulacionesForTargets({ empleadoIds, vozId, guionTexto }) {
  if (empleadoIds.length === 0) return [];
  const rows = empleadoIds.map((empleadoId) => ({
    empleado_id: empleadoId,
    voz_id: vozId ?? null,
    guion_texto: guionTexto,
    estado: "pendiente",
  }));
  const { data, error } = await supabase.from("simulaciones").insert(rows).select();
  if (error) throw error;
  return data || [];
}

// ── Sesiones (WebRTC / Altur AI Agent) ────────────────────────────────────────

export async function fetchSesiones({ empleadoId, canal, limit = 20 } = {}) {
  let q = supabase
    .from("sesiones")
    .select("id, empleado_id, tipo_canal, estado, resumen_markdown, fecha_inicio, fecha_fin, empleados ( id, nombre_completo, departamento )")
    .order("fecha_inicio", { ascending: false })
    .limit(limit);
  if (empleadoId) q = q.eq("empleado_id", empleadoId);
  if (canal)      q = q.eq("tipo_canal", canal);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function fetchSesion(id) {
  const { data, error } = await supabase
    .from("sesiones")
    .select("id, empleado_id, tipo_canal, estado, resumen_markdown, fecha_inicio, fecha_fin, empleados ( id, nombre_completo, departamento, empresa_id )")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMensajesSesion(sesionId) {
  const { data, error } = await supabase
    .from("mensajes_sesion")
    .select("id, sesion_id, fecha_creacion, contenido, metadatos")
    .eq("sesion_id", sesionId)
    .order("fecha_creacion", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createSesion({ empleadoId, canal = "WEBRTC" }) {
  const { data, error } = await supabase
    .from("sesiones")
    .insert([{ empleado_id: empleadoId, tipo_canal: canal, estado: "active" }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function closeSesion(id, { resumenMarkdown } = {}) {
  const { data, error } = await supabase
    .from("sesiones")
    .update({ estado: "done", fecha_fin: new Date().toISOString(), resumen_markdown: resumenMarkdown ?? null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addMensajeSesion({ sesionId, contenido, metadatos }) {
  const { data, error } = await supabase
    .from("mensajes_sesion")
    .insert([{ sesion_id: sesionId, contenido, metadatos: metadatos ?? null }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Reportes ──────────────────────────────────────────────────────────────────

export async function fetchReporte(simulacionId) {
  const { data, error } = await supabase
    .from("reportes")
    .select("id, simulacion_id, pdf_url, fecha_generacion")
    .eq("simulacion_id", simulacionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
