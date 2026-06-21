"use client";

import { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import { fetchSimulacionesFlat } from "./supabaseData";
import { simOutcome } from "./derive";
import { useOrg } from "./OrgContext";

/* ─── helpers ──────────────────────────────────────────────────────── */

function photoUrl(id) {
  return `https://i.pravatar.cc/80?u=${id}`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtRelative(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `hace ${days}d`;
  if (hrs  > 0) return `hace ${hrs}h`;
  if (mins > 0) return `hace ${mins}m`;
  return "ahora";
}

/* Group simulaciones into campaigns by guion_texto */
function buildCampaigns(sims) {
  const map = new Map();
  for (const s of sims) {
    const key = (s.guion_texto || "Sin guión").trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return Array.from(map.entries())
    .map(([script, items], idx) => {
      const dates       = items.map((i) => i.fecha_envio).filter(Boolean).sort();
      const compromised = items.filter((i) => simOutcome(i) === "compromised").length;
      const resisted    = items.filter((i) => simOutcome(i) === "resisted").length;
      const waiting     = items.filter((i) => i.estado !== "borrador" && simOutcome(i) === "sent").length;
      const resolved    = compromised + resisted;
      const fallRate    = resolved > 0 ? Math.round((compromised / resolved) * 100) : null;
      const status      = waiting > 0 ? "live" : resolved === items.length ? "done" : "draft";
      return { id: `camp-${idx}`, script, items, dateStart: dates[0] || null, dateEnd: dates[dates.length - 1] || null, total: items.length, compromised, resisted, waiting, resolved, fallRate, status };
    })
    .sort((a, b) => (b.dateStart || "") > (a.dateStart || "") ? 1 : -1);
}

function campStatus(c) {
  if (c.status === "live")  return { label: "En curso",   tone: "waiting" };
  if (c.status === "done")  return { label: "Completada", tone: "success" };
  return                           { label: "Borrador",   tone: "draft"   };
}

/* ─── photo avatar ─────────────────────────────────────────────────── */
function PhotoAvatar({ name = "", empId, size = 32 }) {
  const [ok, setOk] = useState(!!empId);
  const parts    = name.trim().split(" ").filter(Boolean);
  const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? "?");
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = Math.imul(31, hash) + name.charCodeAt(i) | 0;
  const hue = Math.abs(hash) % 360;

  if (ok && empId) {
    return (
      <img
        className="camp-avatar"
        src={photoUrl(empId)}
        alt={name}
        width={size} height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        onError={() => setOk(false)}
      />
    );
  }
  return (
    <span className="camp-avatar camp-avatar--init" aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue} 28% 36%)` }}>
      {initials.toUpperCase()}
    </span>
  );
}

function AvatarStack({ sims, max = 5, size = 26 }) {
  const shown = sims.slice(0, max);
  const extra = sims.length - shown.length;
  return (
    <div className="avatar-stack" style={{ "--av-size": `${size}px` }}>
      {shown.map((s) => (
        <PhotoAvatar key={s.id} name={s.empleados?.nombre_completo || "?"} empId={s.empleados?.id} size={size} />
      ))}
      {extra > 0 && <span className="avatar-stack__more">+{extra}</span>}
    </div>
  );
}

/* ─── outcome badge ─────────────────────────────────────────────────── */
function OutcomeBadge({ outcome, isDraft }) {
  if (isDraft)                   return <span className="sbadge sbadge--draft">Borrador</span>;
  if (outcome === "compromised") return <span className="sbadge sbadge--danger">Cayó</span>;
  if (outcome === "resisted")    return <span className="sbadge sbadge--success">Resistió</span>;
  return <span className="sbadge sbadge--waiting"><span className="sbadge__pulse" />En espera</span>;
}

/* ─── fall-time bar ─────────────────────────────────────────────────── */
function FallBar({ seconds, max }) {
  if (seconds == null) return <span style={{ color: "var(--text-faint)" }}>—</span>;
  const pct = max > 0 ? Math.max(8, Math.min(100, (seconds / max) * 100)) : 100;
  return (
    <span className="fellbar">
      <span className="fellbar__track"><span className="fellbar__fill" style={{ width: `${pct}%` }} /></span>
      <span className="fellbar__val">{seconds}s</span>
    </span>
  );
}

/* ─── detail panel ──────────────────────────────────────────────────── */
function DetailPanel({ sim, onClose }) {
  const outcome   = simOutcome(sim);
  const isDraft   = sim.estado === "borrador";
  const name      = sim.empleados?.nombre_completo || "Sin destinatario";
  const dept      = sim.empleados?.departamento    || "—";
  const hasFallen = sim.segundos_en_caer != null;
  const panelRef  = useRef(null);
  const tlRef     = useRef(null);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useLayoutEffect(() => {
    if (panelRef.current)
      gsap.fromTo(panelRef.current, { x: 32, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.28, ease: "power3.out" });
    if (tlRef.current)
      gsap.fromTo(tlRef.current.querySelectorAll(".dp__tl-item"),
        { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.07, delay: 0.14, ease: "power2.out" });
  }, [sim.id]);

  const tl = [
    { label: "Simulación creada",     time: fmtDateTime(sim.fecha_envio),      done: true },
    { label: "Llamada enviada",        time: fmtDateTime(sim.fecha_envio),      done: !!sim.fecha_envio },
    { label: "Interacción registrada", time: sim.fecha_interaccion ? fmtDateTime(sim.fecha_interaccion) : "Sin respuesta aún", done: !!sim.fecha_interaccion },
    { label: hasFallen ? "Cayó" : outcome === "resisted" ? "Resistió" : "Resultado pendiente",
      time:  hasFallen ? `${sim.segundos_en_caer}s desde el envío` : outcome === "resisted" ? "Identificó el intento" : "En curso",
      done:  hasFallen || outcome === "resisted", risk: hasFallen },
  ];

  return (
    <>
      <div className="dp-backdrop" onClick={onClose} aria-hidden />
      <aside className="dp" ref={panelRef}>
        <div className="dp__header">
          <div className="dp__header-main">
            <PhotoAvatar name={name} empId={sim.empleados?.id} size={36} />
            <div><div className="dp__name">{name}</div><div className="dp__meta">{dept}</div></div>
          </div>
          <button className="dp__close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>
        <div className="dp__strip">
          <div className="dp__strip-item"><span className="dp__strip-lbl">Resultado</span><OutcomeBadge outcome={outcome} isDraft={isDraft} /></div>
          {hasFallen && <div className="dp__strip-item"><span className="dp__strip-lbl">Tiempo en caer</span><span className="dp__strip-val dp__strip-val--danger">{sim.segundos_en_caer}s</span></div>}
          <div className="dp__strip-item"><span className="dp__strip-lbl">Enviada</span><span className="dp__strip-val">{fmtDateTime(sim.fecha_envio)}</span></div>
          {sim.repertorio_voces?.elevenlabs_voice_id && <div className="dp__strip-item"><span className="dp__strip-lbl">Voz IA</span><span className="dp__strip-val dp__strip-val--mono">{sim.repertorio_voces.elevenlabs_voice_id}</span></div>}
        </div>
        <div className="dp__body">
          <div className="dp__section"><div className="dp__section-label">Guión</div><p className="dp__script">{sim.guion_texto || "Sin guión"}</p></div>
          {sim.audio_url && <div className="dp__section"><div className="dp__section-label">Audio</div><audio controls src={sim.audio_url} className="dp__audio" /></div>}
          <div className="dp__section">
            <div className="dp__section-label">Cronología</div>
            <ol className="dp__tl" ref={tlRef}>
              {tl.map((step, i) => (
                <li key={i} className={`dp__tl-item${step.risk ? " dp__tl-item--risk" : step.done ? " dp__tl-item--done" : ""}`}>
                  <span className="dp__tl-dot" />
                  <span className="dp__tl-label">{step.label}</span>
                  <span className="dp__tl-time">{step.time}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─── campaign card ─────────────────────────────────────────────────── */
function IconLive()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 000 11.31M17.7 6.3a8 8 0 010 11.31M3.5 3.5a16 16 0 000 22.63M20.5 3.5a16 16 0 010 22.63"/></svg>; }
function IconDone()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12l5 5L19 7"/></svg>; }
function IconDraft() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12h6M9 8h6M9 16h4"/></svg>; }

function CampaignCard({ camp, sel, onSelectSim, maxFall, index }) {
  const [open, setOpen] = useState(false);
  const rowsRef         = useRef(null);
  const cardRef         = useRef(null);
  const st              = campStatus(camp);

  useLayoutEffect(() => {
    if (cardRef.current)
      gsap.fromTo(cardRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, delay: index * 0.055, ease: "power2.out" });
  }, []);

  useEffect(() => {
    if (!open || !rowsRef.current) return;
    gsap.fromTo(rowsRef.current.querySelectorAll(".ccamp__row"),
      { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.03, ease: "power2.out" });
  }, [open]);

  return (
    <div ref={cardRef} className={`ccamp${open ? " ccamp--open" : ""}${camp.status === "live" ? " ccamp--live" : ""}`}>

      {/* header button */}
      <button className="ccamp__head" onClick={() => setOpen((v) => !v)}>
        <span className={`ccamp__stripe ccamp__stripe--${st.tone}`} />

        <span className={`ccamp__icon ccamp__icon--${st.tone}`}>
          {camp.status === "live" && <IconLive />}
          {camp.status === "done" && <IconDone />}
          {camp.status === "draft" && <IconDraft />}
        </span>

        <div className="ccamp__info">
          <div className="ccamp__title">{camp.script}</div>
          <div className="ccamp__meta">
            {fmtDate(camp.dateStart)}
            {camp.dateEnd && camp.dateEnd !== camp.dateStart && <> → {fmtDate(camp.dateEnd)}</>}
            <span className="ccamp__sep">·</span>
            {camp.total} {camp.total === 1 ? "persona" : "personas"}
          </div>
        </div>

        <div className="ccamp__right">
          <div className="ccamp__stats">
            {camp.compromised > 0 && (
              <span className="ccamp__stat ccamp__stat--danger">
                <span className="ccamp__stat-dot ccamp__stat-dot--danger" />
                {camp.compromised} {camp.compromised === 1 ? "cayó" : "cayeron"}
              </span>
            )}
            {camp.resisted > 0 && (
              <span className="ccamp__stat ccamp__stat--success">
                <span className="ccamp__stat-dot ccamp__stat-dot--success" />
                {camp.resisted} {camp.resisted === 1 ? "resistió" : "resistieron"}
              </span>
            )}
            {camp.waiting > 0 && (
              <span className="ccamp__stat ccamp__stat--waiting">
                <span className="sbadge__pulse" />
                {camp.waiting} en espera
              </span>
            )}
          </div>
          <AvatarStack sims={camp.items} max={4} size={26} />
          <span className={`ccamp__chevron${open ? " ccamp__chevron--open" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </span>
        </div>
      </button>

      {/* progress bar */}
      <div className="ccamp__progress">
        <span className="ccamp__progress-fill ccamp__progress-fill--success" style={{ width: `${(camp.resisted / Math.max(camp.total, 1)) * 100}%` }} />
        <span className="ccamp__progress-fill ccamp__progress-fill--danger"  style={{ width: `${(camp.compromised / Math.max(camp.total, 1)) * 100}%` }} />
      </div>

      {/* expanded participant list */}
      {open && (
        <div ref={rowsRef} className="ccamp__body">
          <div className="ccamp__col-head">
            <span>Persona</span>
            <span>Resultado</span>
            <span>Enviada</span>
            <span>Tiempo</span>
          </div>
          {camp.items.map((s) => {
            const outcome   = simOutcome(s);
            const isDraft   = s.estado === "borrador";
            const name      = s.empleados?.nombre_completo || "Sin destinatario";
            const dept      = s.empleados?.departamento || "—";
            const hasFallen = s.segundos_en_caer != null;
            const isActive  = sel?.id === s.id;
            return (
              <div
                key={s.id}
                className={`ccamp__row${isActive ? " ccamp__row--active" : ""}${hasFallen ? " ccamp__row--danger" : outcome === "resisted" ? " ccamp__row--success" : ""}`}
                onClick={() => onSelectSim(s)}
              >
                <div className="ccamp__person">
                  <PhotoAvatar name={name} empId={s.empleados?.id} size={36} />
                  <div className="ccamp__person-info">
                    <span className="ccamp__person-name">{name}</span>
                    <span className="ccamp__person-dept">{dept}</span>
                  </div>
                </div>
                <OutcomeBadge outcome={outcome} isDraft={isDraft} />
                <span className="ccamp__date">{fmtRelative(s.fecha_envio)}</span>
                <FallBar seconds={s.segundos_en_caer} max={maxFall} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── summary strip ─────────────────────────────────────────────────── */
function useCountUp(value) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || value == null) return;
    const obj = { n: 0 };
    const t = gsap.to(obj, { n: value, duration: 0.7, ease: "power2.out", onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(obj.n); } });
    return () => t.kill();
  }, [value]);
  return ref;
}

function SummaryStrip({ camps, sims }) {
  const compromised = sims?.filter((s) => simOutcome(s) === "compromised").length ?? 0;
  const resisted    = sims?.filter((s) => simOutcome(s) === "resisted").length ?? 0;
  const resolved    = compromised + resisted;
  const resistRate  = resolved > 0 ? Math.round((resisted / resolved) * 100) : null;
  const tRef = useCountUp(sims?.length ?? 0);
  const cRef = useCountUp(compromised);
  const rRef = useCountUp(resisted);
  return (
    <div className="camp-strip">
      <div className="camp-strip__stat"><span className="camp-strip__val" ref={tRef}>0</span><span className="camp-strip__lbl">Simulaciones</span></div>
      <div className="camp-strip__div" />
      <div className="camp-strip__stat"><span className="camp-strip__val">{camps.length}</span><span className="camp-strip__lbl">Campañas</span></div>
      <div className="camp-strip__div" />
      <div className="camp-strip__stat"><span className="camp-strip__val camp-strip__val--danger" ref={cRef}>0</span><span className="camp-strip__lbl">Cayeron</span></div>
      <div className="camp-strip__div" />
      <div className="camp-strip__stat"><span className="camp-strip__val camp-strip__val--success" ref={rRef}>0</span><span className="camp-strip__lbl">Resistieron</span></div>
      {resistRate !== null && <><div className="camp-strip__div" /><div className="camp-strip__stat"><span className={`camp-strip__val ${resistRate >= 50 ? "camp-strip__val--success" : "camp-strip__val--danger"}`}>{resistRate}%</span><span className="camp-strip__lbl">Tasa resistencia</span></div></>}
    </div>
  );
}

/* ─── screen ────────────────────────────────────────────────────────── */
export function CampaignsScreen() {
  const { empresaId } = useOrg();
  const [sims,  setSims]  = useState(null);
  const [error, setError] = useState(null);
  const [sel,   setSel]   = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    let active = true;
    fetchSimulacionesFlat(200, { empresaId }).then((s) => { if (active) setSims(s); }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [empresaId]);

  const camps   = useMemo(() => (sims ? buildCampaigns(sims) : []), [sims]);
  const maxFall = useMemo(() => (sims ? sims.reduce((m, s) => (s.segundos_en_caer != null ? Math.max(m, s.segundos_en_caer) : m), 1) : 1), [sims]);

  const filtered = useMemo(() => {
    if (filterStatus === "all") return camps;
    return camps.filter((c) => c.status === filterStatus);
  }, [camps, filterStatus]);

  const openDetail  = useCallback((s) => setSel(s), []);
  const closeDetail = useCallback(() => setSel(null), []);

  const STATUS_FILTERS = [
    { id: "all",   label: "Todas",       count: camps.length },
    { id: "live",  label: "En curso",    count: camps.filter((c) => c.status === "live").length },
    { id: "done",  label: "Completadas", count: camps.filter((c) => c.status === "done").length },
    { id: "draft", label: "Borradores",  count: camps.filter((c) => c.status === "draft").length },
  ];

  return (
    <div className={`camp-screen${sel ? " camp-screen--split" : ""}`}>
      <div className="camp-pane">
        <div className="page-head">
          <h1>Campañas</h1>
          <p>Conjuntos de simulaciones enviadas con el mismo guión a un grupo de personas.</p>
        </div>

        {sims && <SummaryStrip camps={camps} sims={sims} />}

        {sims && (
          <div className="camp-tabs" style={{ marginTop: 20 }}>
            {STATUS_FILTERS.map((f) => (
              <button key={f.id} className={`camp-tab${filterStatus === f.id ? " camp-tab--active" : ""}`} onClick={() => setFilterStatus(f.id)}>
                {f.label}
                {f.count > 0 && <span className="camp-tab__count">{f.count}</span>}
              </button>
            ))}
          </div>
        )}

        {sims === null && !error && (
          <div className="sim-loading" style={{ marginTop: 48 }}>
            <div className="sim-loading__spin" /> Cargando campañas…
          </div>
        )}
        {error && <p style={{ padding: "20px 0", color: "var(--danger)" }}>Error: {error}</p>}

        {sims !== null && (
          <div className="ccamp-list">
            {filtered.length === 0 ? (
              <div className="ccamp-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <span>No hay campañas en esta categoría</span>
              </div>
            ) : filtered.map((c, i) => (
              <CampaignCard key={c.id} camp={c} sel={sel} onSelectSim={openDetail} maxFall={maxFall} index={i} />
            ))}
          </div>
        )}
      </div>

      {sel && <DetailPanel sim={sel} onClose={closeDetail} />}
    </div>
  );
}
