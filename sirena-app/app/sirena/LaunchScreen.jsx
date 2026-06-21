"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { fetchPeople, fetchVoces } from "./supabaseData";
import { useToast } from "./ToastContext";
import { useOrg } from "./OrgContext";

const API = "https://livekitagent-production-9309.up.railway.app";

function PhotoAvatar({ name = "", photoUrl, size = 36 }) {
  const [ok, setOk] = useState(!!photoUrl);
  const parts    = name.trim().split(" ").filter(Boolean);
  const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? "?");
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = Math.imul(31, hash) + name.charCodeAt(i) | 0;
  const hue = Math.abs(hash) % 360;
  if (ok && photoUrl) {
    return <img src={photoUrl} alt={name} width={size} height={size}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      onError={() => setOk(false)} />;
  }
  return <span aria-hidden style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: `hsl(${hue} 30% 38%)`, color: "#fff",
    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: size * 0.38,
  }}>{initials.toUpperCase()}</span>;
}

function useCallTimer(running) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function IPhoneCallScreen({ person, status, statusText, transcript, onHangUp, onEnd }) {
  const txEndRef = useRef(null);
  const [muted,   setMuted]   = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const timer = useCallTimer(status === "active");
  useEffect(() => { txEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);

  const isEnded = status === "ended";
  const isActive = status === "active";

  return (
    <div className="iphone-scene">
      <div className="iphone-frame">
        {/* Call header */}
        <div className="iphone-call-header">
          <div className="iphone-call-label">
            {isEnded ? "Llamada finalizada" : isActive ? timer : "Llamada en curso…"}
          </div>
          <div className="iphone-call-name">{person.name}</div>
          <div className="iphone-call-sub">{person.telefono || `${person.dept} · ${person.puesto}`}</div>
        </div>

        {/* Avatar */}
        <div className="iphone-avatar-wrap">
          <div className="iphone-avatar">
            {isActive && <div className="iphone-avatar__ring" />}
            <PhotoAvatar name={person.name} photoUrl={person.photoUrl} size={90} />
          </div>
        </div>

        {/* Transcript inside phone */}
        <div className="iphone-transcript">
          {transcript.length === 0 ? (
            <p className="iphone-transcript__empty">
              {isEnded ? "Sin transcripción" : "Escuchando…"}
            </p>
          ) : (
            transcript.slice(-3).map((m) => (
              <p key={m.id} className={`iphone-tx iphone-tx--${m.cls}`}>{m.text}</p>
            ))
          )}
          <div ref={txEndRef} />
        </div>

        {/* Controls */}
        {!isEnded && (
          <div className="iphone-controls">
            <button className={`iphone-btn${muted ? " iphone-btn--active" : ""}`} onClick={() => setMuted(v => !v)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {muted ? (
                  <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v3M8 23h8"/></>
                ) : (
                  <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 23h8"/></>
                )}
              </svg>
              <span>{muted ? "Act. mic" : "Silencio"}</span>
            </button>
            <button className={`iphone-btn${speaker ? " iphone-btn--active" : ""}`} onClick={() => setSpeaker(v => !v)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                {speaker ? (
                  <><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></>
                ) : (
                  <><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>
                )}
              </svg>
              <span>{speaker ? "Altavoz" : "Altavoz"}</span>
            </button>
            <button className="iphone-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01M9 15h.01M12 15h.01M15 15h.01"/>
              </svg>
              <span>Teclado</span>
            </button>
          </div>
        )}

        {/* Hang up / end */}
        <div className="iphone-foot">
          {!isEnded ? (
            <button className="iphone-hangup" onClick={onHangUp}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" transform="rotate(135 12 12)"/>
              </svg>
            </button>
          ) : (
            <button className="iphone-new-sim" onClick={onEnd}>
              Nueva simulación
            </button>
          )}
        </div>

        {/* Home indicator */}
        <div className="iphone-home-bar" />
      </div>

      {/* ── Transcript panel beside phone ── */}
      <div className="call-tx-panel">
        <div className="call-tx-panel__head">Transcripción en vivo</div>
        <div className="call-tx-panel__body">
          {transcript.length === 0 ? (
            <div className="call-tx-panel__empty">La transcripción aparecerá aquí…</div>
          ) : (
            transcript.map((m) => (
              <div key={m.id} className={`call-tx call-tx--${m.cls}`}>
                {m.cls === "report" && <div className="call-tx__label">Reporte final</div>}
                <p>{m.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CallScreen({ person, voiceId, companyCtx, situationCtx, objective, onEnd }) {
  const audioRef = useRef(null);
  const roomRef  = useRef(null);
  const [status,     setStatus]     = useState("connecting");
  const [statusText, setStatusText] = useState("Conectando…");
  const [transcript, setTranscript] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const init = {
        memberUuid:       person.id,
        memberName:       person.name,
        memberRole:       person.puesto || person.dept || "Empleado",
        companyContext:   companyCtx,
        situationContext: situationCtx  || undefined,
        target:           objective     || undefined,
        voiceId:          voiceId       || undefined,
      };

      let url, token;
      try {
        const res = await fetch(`${API}/livekit/token`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(init),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        url = data.url; token = data.token;
        if (cancelled) return;
        setStatusText("Room listo — solicitando micrófono…");
      } catch (err) {
        if (!cancelled) { setStatus("ended"); setStatusText(`Error: ${err.message}`); }
        return;
      }

      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach(t => t.stop());
      } catch (err) {
        if (!cancelled) { setStatus("ended"); setStatusText("Micrófono denegado"); }
        return;
      }

      if (cancelled) return;

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (_track, pub) => {
        if (pub.kind === Track.Kind.Audio) {
          _track.attach(audioRef.current);
          if (!cancelled) { setStatus("active"); setStatusText("En vivo"); }
        }
      });

      room.on(RoomEvent.DataReceived, (payload) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(payload));
          if (msg.type === "partial") {
            setTranscript(prev => {
              const last = prev[prev.length - 1];
              if (last?.cls === "partial") return [...prev.slice(0, -1), { ...last, text: msg.text }];
              return [...prev, { cls: "partial", text: msg.text, id: Date.now() }];
            });
          } else if (msg.type === "final") {
            setTranscript(prev => {
              const last = prev[prev.length - 1];
              if (last?.cls === "partial") return [...prev.slice(0, -1), { ...last, cls: "final", text: msg.text }];
              return [...prev, { cls: "final", text: msg.text, id: Date.now() }];
            });
          } else if (msg.type === "report") {
            setTranscript(prev => [...prev, { cls: "report", text: msg.text, id: Date.now() }]);
          }
        } catch {}
      });

      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        if (!room.canPlaybackAudio) {
          document.addEventListener("click", () => room.startAudio(), { once: true });
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        if (!cancelled) { setStatus("ended"); setStatusText("Llamada terminada"); }
      });

      try {
        await room.connect(url, token);
        await room.startAudio();
        await room.localParticipant.setMicrophoneEnabled(true);
        if (!cancelled) setStatusText("Esperando que el agente hable…");
      } catch (err) {
        if (!cancelled) { setStatus("ended"); setStatusText(`Error: ${err.message}`); }
      }
    }

    start();
    return () => { cancelled = true; roomRef.current?.disconnect(); };
  }, []);

  return (
    <>
      <audio ref={audioRef} autoPlay />
      <IPhoneCallScreen
        person={person}
        status={status}
        statusText={statusText}
        transcript={transcript}
        onHangUp={() => roomRef.current?.disconnect()}
        onEnd={onEnd}
      />
    </>
  );
}

export function LaunchScreen() {
  const { empresaId, org } = useOrg();
  const notify = useToast();

  const [people,  setPeople]  = useState(null);
  const [voces,   setVoces]   = useState([]);
  const [targetId,     setTargetId]     = useState("");
  const [voiceId,      setVoiceId]      = useState("");
  const [companyCtx,   setCompanyCtx]   = useState(
    `${org.name} es una empresa con operaciones en México. El empleado trabaja en el área correspondiente a su puesto.`
  );
  const [situationCtx, setSituationCtx] = useState("");
  const [objective,    setObjective]    = useState("");
  const [activeCall,   setActiveCall]   = useState(null);
  const [errors,       setErrors]       = useState({});

  useEffect(() => {
    let active = true;
    Promise.all([fetchPeople({ empresaId }), fetchVoces({ empresaId })])
      .then(([p, v]) => { if (active) { setPeople(p); setVoces(v); } })
      .catch((e) => notify(`No se pudieron cargar datos: ${e.message}`, { tone: "danger" }));
    return () => { active = false; };
  }, [empresaId]);

  const targetPerson = useMemo(() => (people || []).find((p) => p.id === targetId) || null, [people, targetId]);

  const voiceOptions = useMemo(() =>
    (voces || [])
      .filter((v) => v.esta_activo && v.empleados?.id !== targetId)
      .map((v) => ({ value: v.elevenlabs_voice_id, label: v.empleados?.nombre_completo ?? "Sin nombre", empId: v.empleados?.id })),
    [voces, targetId]
  );

  function handleLaunch() {
    const e = {};
    if (!targetId)          e.target  = "Selecciona a quién va dirigida la simulación";
    if (!companyCtx.trim()) e.company = "El contexto de la empresa es obligatorio";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setActiveCall(targetPerson);
  }

  if (activeCall) {
    return (
      <div className="launch-screen launch-screen--calling">
        <CallScreen person={activeCall} voiceId={voiceId} companyCtx={companyCtx}
          situationCtx={situationCtx} objective={objective} onEnd={() => setActiveCall(null)} />
      </div>
    );
  }

  return (
    <div className="launch-screen">
      <div className="page-head">
        <h1>Sala de lanzamiento</h1>
        <p>Configura y lanza una simulación de vishing en tiempo real. El agente de IA llama, habla y adapta su táctica en vivo.</p>
      </div>

      <div className="launch-layout">
        <div className="launch-form">

          {/* 1 · Target */}
          <div className="lf-section">
            <div className="lf-section__head">
              <span className="lf-section__n">1</span>
              <span className="lf-section__title">¿A quién va dirigida?</span>
            </div>
            {errors.target && <span className="lf-error">{errors.target}</span>}
            <div className="person-picker">
              {people === null && <div className="person-picker__empty">Cargando personas…</div>}
              {(people || []).map((p) => (
                <button key={p.id} className={`person-pick${targetId === p.id ? " person-pick--active" : ""}`}
                  onClick={() => { setTargetId(p.id); setErrors((e) => ({ ...e, target: null })); }}>
                  <PhotoAvatar name={p.name} photoUrl={p.photoUrl} size={34} />
                  <div className="person-pick__info">
                    <span className="person-pick__name">{p.name}</span>
                    <span className="person-pick__meta">{p.dept}{p.puesto ? ` · ${p.puesto}` : ""}</span>
                  </div>
                  {targetId === p.id && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="2 8 6 12 14 4"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            {targetPerson && (
              <div className="target-card">
                <PhotoAvatar name={targetPerson.name} photoUrl={targetPerson.photoUrl} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)" }}>{targetPerson.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {targetPerson.dept}{targetPerson.puesto ? ` · ${targetPerson.puesto}` : ""}
                  </div>
                  {targetPerson.telefono && (
                    <div style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      {targetPerson.telefono}
                    </div>
                  )}
                </div>
                <span className={`risk-tag risk-tag--${targetPerson.risk}`}>
                  {{ high: "Riesgo alto", medium: "Riesgo medio", low: "Riesgo bajo", unknown: "Sin datos" }[targetPerson.risk]}
                </span>
              </div>
            )}
          </div>

          {/* 2 · Voz */}
          <div className="lf-section">
            <div className="lf-section__head">
              <span className="lf-section__n">2</span>
              <span className="lf-section__title">Voz del atacante</span>
              <span className="lf-section__opt">Opcional</span>
            </div>
            <div className="voice-picker">
              <button className={`voice-pick${!voiceId ? " voice-pick--active" : ""}`} onClick={() => setVoiceId("")}>
                <div className="voice-pick__icon voice-pick__icon--none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Voz por defecto</span>
              </button>
              {voiceOptions.map((v) => (
                <button key={v.value} className={`voice-pick${voiceId === v.value ? " voice-pick--active" : ""}`}
                  onClick={() => setVoiceId(v.value)}>
                  <PhotoAvatar name={v.label} size={28} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{v.label}</span>
                  {voiceId === v.value && (
                    <svg style={{ marginLeft: "auto", color: "var(--primary)" }} width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="2 8 6 12 14 4"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3 · Contexto */}
          <div className="lf-section">
            <div className="lf-section__head">
              <span className="lf-section__n">3</span>
              <span className="lf-section__title">Contexto del ataque</span>
            </div>
            <div className="lf-field">
              <label className="lf-label">Contexto de la empresa <span className="lf-hint">El agente usa esto para personalizar el pretexto</span></label>
              <textarea className="lf-textarea" rows={3} value={companyCtx}
                onChange={(e) => { setCompanyCtx(e.target.value); setErrors((er) => ({ ...er, company: null })); }}
                placeholder="Describe la empresa, industria, sistemas internos…" />
              {errors.company && <span className="lf-error">{errors.company}</span>}
            </div>
            <div className="lf-field">
              <label className="lf-label">Situación específica <span className="lf-hint">Opcional</span></label>
              <textarea className="lf-textarea" rows={2} value={situationCtx}
                onChange={(e) => setSituationCtx(e.target.value)}
                placeholder="Ej: Hay una migración del sistema de nómina esta semana." />
            </div>
            <div className="lf-field">
              <label className="lf-label">Objetivo del ataque <span className="lf-hint">Opcional</span></label>
              <input className="lf-input" type="text" value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Ej: credenciales del portal de nómina, código MFA…" />
            </div>
          </div>

          <div className="lf-warn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Simulación controlada. El agente realiza la llamada en tiempo real usando voz clonada vía LiveKit.</span>
          </div>

          <button className="lf-launch-btn" onClick={handleLaunch} disabled={people === null}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
            Iniciar llamada en vivo
          </button>
        </div>

        {/* RIGHT */}
        <div className="launch-preview">
          <div className="lf-preview-empty">
            <div className="lf-preview-empty__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-faint)" }}>
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
              </svg>
            </div>
            <div className="lf-preview-empty__title">Llamada en tiempo real</div>
            <div className="lf-preview-empty__desc">
              Al iniciar, el agente entra a un room de LiveKit y comienza la llamada. Tú respondes por micrófono como si fueras el target.
            </div>
            <div className="lf-preview-steps">
              {["Se genera un room de LiveKit","Claude planea el ataque con el contexto","El agente abre en voz","Tú respondes por micrófono","El agente adapta su táctica en tiempo real","Al terminar genera un reporte"].map((s,i)=>(
                <div key={i} className="lf-preview-step">
                  <span className="lf-preview-step__n">{i+1}</span><span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
