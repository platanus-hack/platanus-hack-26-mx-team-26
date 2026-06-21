import { supabase } from "../lib/supabaseClient";
import { computeResistance, riskFromResistance, riskTier, simOutcome } from "./derive";

// ── Field selects ────────────────────────────────────────────────────────────
// La tabla `simulaciones` fue reemplazada por `sesiones` (tabla maestra).
// sesiones tiene: id, empleado_id, voz_id, tipo_canal, estado, token_rastreo,
//                 segundos_en_caer, resumen_markdown, fecha_inicio, fecha_fin

// Sin sesiones en el join — la FK aún no está registrada en el schema cache de Supabase.
// Las sesiones se jalan por separado en fetchPeople y se unen en JS.
const EMPLEADO_FIELDS = `
  id, empresa_id, nombre_completo, correo_electronico, departamento, puesto, telefono, fecha_registro,
  repertorio_voces ( id, elevenlabs_voice_id, esta_activo, fecha_creacion )
`;

// Fotos personalizadas por ID de empleado
const CUSTOM_PHOTOS = {
  "bbbbbbbb-0001-0000-0000-000000000020": "/avatars/emilio.png",   // Emilio Cruz Vargas
  "bbbbbbbb-0001-0000-0000-000000000021": "/avatars/rafael.png",   // Rafael Fernández
  "bbbbbbbb-0001-0000-0000-000000000022": "/avatars/raimundo.png", // Raimundo Herrera
};

// Deterministic real-face placeholder — same employee id always gets the same photo.
function photoUrlFor(id) {
  if (CUSTOM_PHOTOS[id]) return CUSTOM_PHOTOS[id];
  return `https://i.pravatar.cc/240?u=${id}`;
}

function mapEmpleado(emp, sesionesMap = {}) {
  const voces = emp.repertorio_voces || [];
  const activeVoice = voces.find((v) => v.esta_activo) || voces[0] || null;
  const voice = voces.length === 0 ? "pending" : activeVoice?.esta_activo ? "consented" : "expired";

  // Sesiones del empleado — unidas en JS porque la FK no está en el schema cache
  const sims = (sesionesMap[emp.id] || [])
    .slice()
    .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
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
    simulaciones: sims, // alias para compatibilidad con el resto del código
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
  // 1. Fetch empleados
  let q = supabase.from("empleados").select(EMPLEADO_FIELDS).order("fecha_registro", { ascending: false });
  if (empresaId) q = q.eq("empresa_id", empresaId);
  const { data: empData, error: empError } = await q;
  if (empError) throw empError;
  const empleados = empData || [];
  if (empleados.length === 0) return [];

  // 2. Fetch sesiones de esos empleados (sin join — la FK no está en el schema cache)
  const ids = empleados.map((e) => e.id);
  const { data: sesData, error: sesError } = await supabase
    .from("sesiones")
    .select("id, empleado_id, voz_id, tipo_canal, estado, resumen_markdown, token_rastreo, fecha_inicio, fecha_fin")
    .in("empleado_id", ids)
    .order("fecha_inicio", { ascending: false });
  if (sesError) {
    console.warn("[fetchPeople] No se pudieron cargar sesiones:", sesError.message);
  }

  // 3. Agrupar sesiones por empleado_id
  const sesionesMap = {};
  for (const s of (sesData || [])) {
    if (!sesionesMap[s.empleado_id]) sesionesMap[s.empleado_id] = [];
    sesionesMap[s.empleado_id].push(s);
  }

  return empleados.map((e) => mapEmpleado(e, sesionesMap));
}

// ── Repertorio de voces ───────────────────────────────────────────────────────

export async function fetchVoces({ empresaId } = {}) {
  const { data, error } = await supabase
    .from("repertorio_voces")
    .select("id, elevenlabs_voice_id, esta_activo, fecha_creacion, empleados ( id, nombre_completo, empresa_id )")
    .order("fecha_creacion", { ascending: false });
  if (error) throw error;
  const voces = data || [];
  // Filtrar en JS por empresa y descartar registros sin empleado válido
  return empresaId
    ? voces.filter((v) => v.empleados?.empresa_id === empresaId)
    : voces.filter((v) => v.empleados != null);
}

// ── Sesiones (reemplaza a simulaciones) ───────────────────────────────────────
// fetchSimulacionesFlat mantiene el nombre para no romper los screens existentes.

export async function fetchSimulacionesFlat(limit = 50, { empresaId } = {}) {
  // 1. Fetch sesiones
  const { data: sesData, error: sesError } = await supabase
    .from("sesiones")
    .select("id, empleado_id, voz_id, tipo_canal, estado, resumen_markdown, token_rastreo, fecha_inicio, fecha_fin")
    .order("fecha_inicio", { ascending: false })
    .limit(limit);
  if (sesError) throw sesError;
  const sesiones = sesData || [];
  if (sesiones.length === 0) return [];

  // 2. Fetch empleados relacionados
  const empIds = [...new Set(sesiones.map((s) => s.empleado_id).filter(Boolean))];
  let empData = [];
  if (empIds.length > 0) {
    let q = supabase
      .from("empleados")
      .select("id, nombre_completo, departamento, empresa_id")
      .in("id", empIds);
    const { data, error } = await q;
    if (!error) empData = data || [];
  }
  const empMap = Object.fromEntries(empData.map((e) => [e.id, e]));

  // 3. Filtrar por empresa y descartar sesiones sin empleado válido
  const filtered = sesiones.filter((s) => {
    const emp = empMap[s.empleado_id];
    if (!emp) return false; // sesión huérfana
    if (empresaId && emp.empresa_id !== empresaId) return false;
    return true;
  });

  // 4. Normalizar shape
  return filtered.map((s) => ({
    ...s,
    empleados: empMap[s.empleado_id] || null,
    repertorio_voces: null,
    // Aliases para compatibilidad
    fecha_envio: s.fecha_inicio,
    fecha_interaccion: s.fecha_fin,
    guion_texto: s.resumen_markdown || "",
    audio_url: null,
  }));
}

// Crea una sesión pendiente (equivalente al draft de simulación)
export async function createDraftSimulacion({ vozId, empleadoId }) {
  const { data, error } = await supabase
    .from("sesiones")
    .insert([{ empleado_id: empleadoId ?? null, voz_id: vozId ?? null, tipo_canal: "ALTUR", estado: "pendiente" }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Crea sesiones pendientes para múltiples targets
export async function createSimulacionesForTargets({ empleadoIds, vozId }) {
  if (empleadoIds.length === 0) return [];
  const rows = empleadoIds.map((empleadoId) => ({
    empleado_id: empleadoId,
    voz_id: vozId ?? null,
    tipo_canal: "ALTUR",
    estado: "pendiente",
  }));
  const { data, error } = await supabase.from("sesiones").insert(rows).select();
  if (error) throw error;
  return data || [];
}

// ── Sesiones — CRUD directo ──────────────────────────────────────────────────

export async function fetchSesiones({ empleadoId, canal, empresaId, limit = 20 } = {}) {
  let q = supabase
    .from("sesiones")
    .select("id, empleado_id, voz_id, tipo_canal, estado, resumen_markdown, token_rastreo, fecha_inicio, fecha_fin")
    .order("fecha_inicio", { ascending: false })
    .limit(limit);
  if (empleadoId) q = q.eq("empleado_id", empleadoId);
  if (canal)      q = q.eq("tipo_canal", canal);
  const { data, error } = await q;
  if (error) throw error;
  const sesiones = data || [];

  // Join empleados en JS
  const empIds = [...new Set(sesiones.map((s) => s.empleado_id).filter(Boolean))];
  let empMap = {};
  if (empIds.length > 0) {
    const { data: empData } = await supabase
      .from("empleados")
      .select("id, nombre_completo, departamento, empresa_id")
      .in("id", empIds);
    for (const e of (empData || [])) empMap[e.id] = e;
  }

  return sesiones
    .map((s) => ({ ...s, empleados: empMap[s.empleado_id] || null }))
    .filter((s) => !empresaId || s.empleados?.empresa_id === empresaId);
}

export async function fetchSesion(id) {
  const { data, error } = await supabase
    .from("sesiones")
    .select("id, empleado_id, voz_id, tipo_canal, estado, resumen_markdown, token_rastreo, fecha_inicio, fecha_fin")
    .eq("id", id)
    .single();
  if (error) throw error;
  // Join empleado
  if (data?.empleado_id) {
    const { data: emp } = await supabase.from("empleados").select("id, nombre_completo, departamento, empresa_id").eq("id", data.empleado_id).single();
    data.empleados = emp || null;
  }
  return data;
}

export async function fetchMensajesSesion(sesionId) {
  const { data, error } = await supabase
    .from("mensajes_sesion")
    .select("id, sesion_id, rol, fecha_creacion, contenido, metadatos")
    .eq("sesion_id", sesionId)
    .order("fecha_creacion", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createSesion({ empleadoId, vozId, canal = "WEBRTC" }) {
  const { data, error } = await supabase
    .from("sesiones")
    .insert([{ empleado_id: empleadoId ?? null, voz_id: vozId ?? null, tipo_canal: canal, estado: "active" }])
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

export async function addMensajeSesion({ sesionId, rol = "user", contenido, metadatos }) {
  const { data, error } = await supabase
    .from("mensajes_sesion")
    .insert([{ sesion_id: sesionId, rol, contenido, metadatos: metadatos ?? null }])
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
