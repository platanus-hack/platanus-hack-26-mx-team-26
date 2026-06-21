"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Button, Select, Badge, StatusPill, WaveBars, Switch } from "../design-system/components";
import { Icon } from "../design-system/components/Icon";
import { fetchPeople, fetchVoces, fetchSimulacionesFlat, createSimulacionesForTargets, createDraftSimulacion } from "./supabaseData";
import { simOutcome } from "./derive";
import { useToast } from "./ToastContext";
import { useOrg } from "./OrgContext";

const CHANNELS = [
  { id: "audio",    icon: "audio-lines",    t: "Nota de audio",  d: "Deja un mensaje de voz con un clon consentido." },
  { id: "whatsapp", icon: "message-circle", t: "WhatsApp",       d: "Envía un audio o texto por WhatsApp." },
  { id: "call",     icon: "phone-call",     t: "Llamada",        d: "Realiza una llamada simulada en vivo." },
];

const DEFAULT_MSG = "Hola, soy del equipo de finanzas. Necesito que confirmes la transferencia antes de las 3pm, te dejo los datos en este audio…";

export function LaunchScreen() {
  const { empresaId } = useOrg();
  const [chan, setChan] = useState("audio");
  const [msg, setMsg] = useState(DEFAULT_MSG);
  const [notifyOnReply, setNotifyOnReply] = useState(true);
  const [people, setPeople] = useState(null);
  const [voces, setVoces] = useState([]);
  const [liveSims, setLiveSims] = useState([]);
  const [audienceKey, setAudienceKey] = useState("all");
  const [vozId, setVozId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const notify = useToast();

  useEffect(() => {
    let active = true;
    Promise.all([fetchPeople({ empresaId }), fetchVoces({ empresaId }), fetchSimulacionesFlat(20, { empresaId })])
      .then(([p, v, s]) => {
        if (!active) return;
        setPeople(p);
        setVoces(v);
        setLiveSims(s.filter((sim) => sim.estado !== "borrador" && simOutcome(sim) === "sent"));
      })
      .catch((e) => notify(`No se pudieron cargar las personas/voces: ${e.message}`, { title: "Error", tone: "danger" }));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  const audienceOptions = useMemo(() => {
    if (!people) return [];
    const depts = [...new Set(people.map((p) => p.dept))];
    const highRisk = people.filter((p) => p.risk === "high");
    return [
      { key: "all", label: `Toda la organización (${people.length})`, ids: people.map((p) => p.id) },
      ...depts.map((d) => {
        const ids = people.filter((p) => p.dept === d).map((p) => p.id);
        return { key: "dept:" + d, label: `${d} (${ids.length} personas)`, ids };
      }),
      { key: "high", label: `Riesgo alto (${highRisk.length})`, ids: highRisk.map((p) => p.id) },
    ];
  }, [people]);

  const vozOptions = useMemo(
    () => (voces || []).filter((v) => v.esta_activo).map((v) => ({
      value: v.id,
      label: `${v.empleados?.nombre_completo ?? "Sin nombre"} · ${v.elevenlabs_voice_id}`,
    })),
    [voces]
  );

  const pickChan = (id) => setChan(id);

  async function handleLaunch() {
    const audience = audienceOptions.find((o) => o.key === audienceKey);
    if (!audience || audience.ids.length === 0) {
      notify("No hay personas en esa audiencia.", { title: "Audiencia vacía", tone: "danger" });
      return;
    }
    const voiceOwnerId = voces.find((v) => v.id === vozId)?.empleados?.id ?? null;
    const targets = audience.ids.filter((id) => id !== voiceOwnerId);
    const excluded = voiceOwnerId && audience.ids.includes(voiceOwnerId);

    setSubmitting(true);
    try {
      const created = await createSimulacionesForTargets({ empleadoIds: targets, vozId: vozId || null, guionTexto: msg });
      notify(
        `${created.length} simulaciones creadas.${excluded ? " (excluimos a la persona dueña de la voz clonada)" : ""}`,
        { title: "Simulación lanzada", tone: "success" }
      );
      const fresh = await fetchSimulacionesFlat(20);
      setLiveSims(fresh.filter((sim) => sim.estado !== "borrador" && simOutcome(sim) === "sent"));
    } catch (e) {
      notify(`No se pudo lanzar la simulación: ${e.message}`, { title: "Error", tone: "danger" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDraft() {
    setSubmitting(true);
    try {
      await createDraftSimulacion({ vozId: vozId || null, guionTexto: msg });
      notify("Borrador guardado. Lo encontrarás en Campañas.", { title: "Borrador guardado", tone: "success" });
    } catch (e) {
      notify(`No se pudo guardar el borrador: ${e.message}`, { title: "Error", tone: "danger" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Simulación controlada · solo pruebas</div>
        <h1>Sala de lanzamiento</h1>
        <p>Activa una prueba de vishing ética en tres pasos. Las simulaciones se guardan en tu base de datos real.</p>
      </div>

      <div className="launch-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card title="1 · Elige el canal" eyebrow="Solo referencia visual — no se guarda aún">
            <div className="chan-cards">
              {CHANNELS.map((c) => (
                <button key={c.id} className={"chan" + (chan === c.id ? " chan--active" : "")} onClick={() => pickChan(c.id)}>
                  <div className="chan__ic"><Icon name={c.icon} /></div>
                  <div className="chan__t">{c.t}</div>
                  <div className="chan__d">{c.d}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card title="2 · Audiencia y voz" eyebrow="A quién y con qué voz">
            <div className="grid-2">
              <Select label="Audiencia" value={audienceKey} onChange={(e) => setAudienceKey(e.target.value)}>
                {audienceOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </Select>
              <Select label="Voz a clonar" value={vozId} onChange={(e) => setVozId(e.target.value)}>
                <option value="">Sin voz (solo texto)</option>
                {vozOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
            <div className="field-row">
              <label>{chan === "call" ? "Guion de la llamada" : "Mensaje"}</label>
              <textarea className="composer" value={msg} onChange={(e) => setMsg(e.target.value)} />
            </div>
            {vozId && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <WaveBars tone="accent" count={16} height={24} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>Voz clonada seleccionada</span>
                </div>
                <Badge tone="accent" icon="sparkles">Voz IA</Badge>
              </div>
            )}
          </Card>

          <Card title="3 · Programa y lanza" eyebrow="Cuándo">
            <div className="grid-2">
              <Select label="Momento" options={["Ahora mismo", "Programar para más tarde", "Distribuir en 3 días"]} />
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 6 }}>
                <Switch checked={notifyOnReply} onChange={setNotifyOnReply} label="Avisarme según respondan" />
              </div>
            </div>
            <div className="warn-line">
              <Icon name="alert-triangle" />
              Esto insertará simulaciones reales en la base de datos para la audiencia elegida.
            </div>
            <div className="launch-actions">
              <Button variant="primary" size="lg" icon="rocket" disabled={submitting || !people} onClick={handleLaunch}>Lanzar simulación</Button>
              <Button variant="ghost" size="lg" icon="save" disabled={submitting} onClick={handleDraft}>Guardar borrador</Button>
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="En vivo ahora" eyebrow="Simulaciones activas"
            action={<StatusPill status="live">{liveSims.length} en vivo</StatusPill>}>
            {liveSims.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No hay simulaciones esperando respuesta.</div>
            ) : (
              liveSims.slice(0, 5).map((s) => (
                <div className="act" key={s.id}>
                  <div className="act__ch act__ch--primary"><Icon name="audio-lines" /></div>
                  <div className="act__main">
                    <div className="act__name">{s.empleados?.nombre_completo || "Sin destinatario"}</div>
                    <div className="act__meta">{s.empleados?.departamento || "—"}</div>
                  </div>
                  <WaveBars tone="primary" playing count={6} height={22} />
                </div>
              ))
            )}
          </Card>

          <Card variant="soft" padding="sm">
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <Icon name="lock" style={{ color: "var(--primary)", width: 20, height: 20, flex: "none", marginTop: 2 }} />
              <div style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.5 }}>
                <b style={{ color: "var(--text-strong)" }}>Uso ético garantizado.</b> Solo lanzas a personas de tu organización con voces consentidas. Cada acción queda registrada.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
