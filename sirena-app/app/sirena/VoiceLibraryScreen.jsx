"use client";

import { useEffect, useState } from "react";
import { fetchPeople } from "./supabaseData";
import { useToast } from "./ToastContext";
import { useOrg } from "./OrgContext";

/* ─── helpers ─────────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
}

function fmtExpiry(iso) {
  if (!iso) return null;
  const expires = new Date(new Date(iso).getTime() + 365 * 24 * 60 * 60 * 1000);
  const days = Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0)  return { label: "Caducada",        color: "var(--danger)"  };
  if (days < 30) return { label: `Caduca en ${days}d`, color: "var(--warning)" };
  return              { label: `Válida ${days}d más`,   color: "var(--text-faint)" };
}

/* ─── photo avatar ────────────────────────────────────────────────── */
function PhotoAvatar({ name = "", photoUrl, size = 56 }) {
  const [ok, setOk] = useState(!!photoUrl);
  const parts    = name.trim().split(" ").filter(Boolean);
  const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? "?");
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = Math.imul(31, hash) + name.charCodeAt(i) | 0;
  const hue = Math.abs(hash) % 360;
  if (ok && photoUrl) {
    return (
      <img src={photoUrl} alt={name} width={size} height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block" }}
        onError={() => setOk(false)} />
    );
  }
  return (
    <span aria-hidden style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue} 30% 38%)`, color: "#fff",
      fontFamily: "var(--font-mono)", fontWeight: 700,
      fontSize: size * 0.36, letterSpacing: "-.01em",
    }}>
      {initials.toUpperCase()}
    </span>
  );
}

/* ─── animated waveform ───────────────────────────────────────────── */
function VoiceWave({ active, bars = 30, height = 36 }) {
  return (
    <div className={`vlib-wave${active ? " vlib-wave--active" : ""}`}
      style={{ "--vw-h": `${height}px`, "--vw-bars": bars }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className="vlib-wave__bar"
          style={{
            "--vw-i": i,
            "--vw-rnd": (Math.abs(Math.sin(i * 2.6 + 0.8)) * 0.75 + 0.25).toFixed(3),
          }} />
      ))}
    </div>
  );
}

/* ─── status badge ────────────────────────────────────────────────── */
function VoiceStatusBadge({ voice }) {
  const map = {
    consented: { label: "Consentida", cls: "vlib-badge--consented" },
    pending:   { label: "Pendiente",  cls: "vlib-badge--pending"   },
    expired:   { label: "Caducada",   cls: "vlib-badge--expired"   },
  };
  const { label, cls } = map[voice] || { label: voice, cls: "" };
  return <span className={`vlib-badge ${cls}`}>{label}</span>;
}

/* ─── voice card ──────────────────────────────────────────────────── */
function VoiceCard({ p, playing, onPlay, onInvite }) {
  const isPending = p.voice === "pending";
  const isExpired = p.voice === "expired";
  const expiry    = fmtExpiry(p.voiceCreatedAt);

  return (
    <div className={`vlib-card${playing ? " vlib-card--playing" : ""}${isPending ? " vlib-card--pending" : ""}${isExpired ? " vlib-card--expired" : ""}`}>

      {/* ── identity ── */}
      <div className="vlib-card__head">
        <div className="vlib-card__photo-wrap">
          <PhotoAvatar name={p.name} photoUrl={p.photoUrl} size={52} />
          {playing && <span className="vlib-card__ring" />}
        </div>
        <div className="vlib-card__identity">
          <span className="vlib-card__name">{p.name}</span>
          <span className="vlib-card__dept">{p.dept}{p.puesto ? ` · ${p.puesto}` : ""}</span>
        </div>
        <VoiceStatusBadge voice={p.voice} />
      </div>

      {/* ── waveform or no-voice ── */}
      {isPending ? (
        <div className="vlib-card__no-voice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
            <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8"/>
          </svg>
          Sin muestra de voz
        </div>
      ) : (
        <div className="vlib-card__player">
          <button
            className={`vlib-card__play-btn${playing ? " vlib-card__play-btn--active" : ""}`}
            onClick={onPlay}
            aria-label={playing ? "Pausar" : "Reproducir"}
          >
            {playing ? (
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="4" height="12" rx="1"/>
                <rect x="10" y="2" width="4" height="12" rx="1"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2l11 6-11 6V2z"/>
              </svg>
            )}
          </button>
          <VoiceWave active={playing} bars={32} height={36} />
        </div>
      )}

      {/* ── footer ── */}
      <div className="vlib-card__foot">
        <div className="vlib-card__foot-meta">
          {isPending ? (
            <span className="vlib-card__date">Sin grabación</span>
          ) : (
            <>
              <span className="vlib-card__date">{fmtDate(p.voiceCreatedAt)}</span>
              {expiry && <span className="vlib-card__expiry" style={{ color: expiry.color }}>{expiry.label}</span>}
            </>
          )}
          {p.elevenlabsVoiceId && !isPending && (
            <span className="vlib-card__voice-id" title={p.elevenlabsVoiceId}>
              ID {p.elevenlabsVoiceId.slice(0, 8)}…
            </span>
          )}
        </div>
        {isPending ? (
          <button className="vlib-card__invite-btn" onClick={onInvite}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.4 1.14 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16z"/>
            </svg>
            Solicitar grabación
          </button>
        ) : (
          <button className="vlib-card__play-link" onClick={onPlay}>
            {playing ? "Detener" : "Escuchar"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── coverage strip ──────────────────────────────────────────────── */
function CoverageStrip({ people }) {
  const consented = people.filter((p) => p.voice === "consented").length;
  const pending   = people.filter((p) => p.voice === "pending").length;
  const expired   = people.filter((p) => p.voice === "expired").length;
  const total     = people.length;
  const pct       = total > 0 ? Math.round((consented / total) * 100) : 0;
  const pctColor  = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="vlib-strip">
      <div className="vlib-strip__stat">
        <span className="vlib-strip__val" style={{ color: "var(--success)" }}>{consented}</span>
        <span className="vlib-strip__lbl">Consentidas</span>
      </div>
      <div className="vlib-strip__div" />
      <div className="vlib-strip__stat">
        <span className="vlib-strip__val" style={{ color: "var(--text-muted)" }}>{pending}</span>
        <span className="vlib-strip__lbl">Pendientes</span>
      </div>
      <div className="vlib-strip__div" />
      <div className="vlib-strip__stat">
        <span className="vlib-strip__val" style={{ color: "var(--warning)" }}>{expired}</span>
        <span className="vlib-strip__lbl">Caducadas</span>
      </div>
      <div className="vlib-strip__div" />
      <div className="vlib-strip__stat vlib-strip__stat--bar">
        <div className="vlib-strip__bar-row">
          <div className="vlib-strip__bar-track">
            <div className="vlib-strip__bar-fill" style={{ width: `${pct}%`, background: pctColor }} />
          </div>
          <span className="vlib-strip__pct" style={{ color: pctColor }}>{pct}%</span>
        </div>
        <span className="vlib-strip__lbl">Cobertura</span>
      </div>
    </div>
  );
}

/* ─── screen ──────────────────────────────────────────────────────── */
export function VoiceLibraryScreen() {
  const { empresaId } = useOrg();
  const [people,  setPeople]  = useState(null);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("todas");
  const [playing, setPlaying] = useState(null);
  const [search,  setSearch]  = useState("");
  const notify = useToast();

  useEffect(() => {
    let active = true;
    fetchPeople({ empresaId })
      .then((p) => { if (active) setPeople(p); })
      .catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [empresaId]);

  const FILTERS = [
    { id: "todas",     label: "Todas"       },
    { id: "consented", label: "Consentidas" },
    { id: "pending",   label: "Pendientes"  },
    { id: "expired",   label: "Caducadas"   },
  ];

  const rows = (people || []).filter((p) => {
    const matchFilter = filter === "todas" || p.voice === filter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.dept || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="vlib-screen">
      <div className="page-head">
        <h1>Biblioteca de voces</h1>
        <p>Muestras recolectadas con consentimiento explícito para clonar la voz del atacante en cada simulación.</p>
      </div>

      {people && <CoverageStrip people={people} />}

      {/* consent notice */}
      <div className="vlib-notice">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>
          <b>Consentimiento verificado.</b> Cada muestra tiene registro de auditoría y caduca a los 12 meses. Nadie es grabado de forma encubierta.
        </span>
      </div>

      {/* toolbar */}
      <div className="vlib-toolbar">
        <div className="vlib-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o área…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="vlib-search__clear" onClick={() => setSearch("")} aria-label="Limpiar">×</button>
          )}
        </div>
        <div className="camp-tabs" style={{ border: "none", flex: "none" }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`camp-tab${filter === f.id ? " camp-tab--active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              {people && (
                <span className="camp-tab__count">
                  {f.id === "todas" ? people.length : people.filter((p) => p.voice === f.id).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* loading / error */}
      {people === null && !error && (
        <div className="sim-loading" style={{ marginTop: 48 }}>
          <div className="sim-loading__spin" /> Cargando voces…
        </div>
      )}
      {error && (
        <p style={{ color: "var(--danger)", padding: "20px 0" }}>Error: {error}</p>
      )}

      {/* grid */}
      {people !== null && (
        rows.length === 0 ? (
          <div className="vlib-empty">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
            </svg>
            <span>{search ? `Sin resultados para "${search}"` : "No hay voces en esta categoría"}</span>
          </div>
        ) : (
          <div className="vlib-grid">
            {rows.map((p) => (
              <VoiceCard
                key={p.id} p={p}
                playing={playing === p.id}
                onPlay={() => setPlaying(playing === p.id ? null : p.id)}
                onInvite={() => notify(`Solicitud enviada a ${p.name}.`, { title: "Solicitud enviada", tone: "success" })}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
