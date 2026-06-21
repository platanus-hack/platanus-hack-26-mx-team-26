"use client";

import { useEffect, useState, useRef } from "react";
import { Card, Avatar, Badge, StatusPill, ProgressBar, Button, IconButton, RiskMeter, StatCard, Input } from "../design-system/components";
import { Icon } from "../design-system/components/Icon";
import { fetchPeople, fetchVoces, createSimulacionesForTargets } from "./supabaseData";
import { simOutcome } from "./derive";
import { useToast } from "./ToastContext";
import { useOrg } from "./OrgContext";

const RESULT = {
  resisted:    { tone: "success", label: "Resistió" },
  reported:    { tone: "warning", label: "Reportó" },
  compromised: { tone: "danger",  label: "Cayó" },
  sent:        { tone: "neutral", label: "Enviada" },
};
const VOICE = {
  consented: { tone: "signal",  icon: "badge-check", label: "Consentida" },
  pending:   { tone: "neutral", icon: "clock",       label: "Pendiente" },
  expired:   { tone: "warning", icon: "alert-circle",label: "Caducada" },
};
const RISK_LABEL = { high: "alto", medium: "medio", low: "bajo", unknown: "sin datos" };
const RISK_RING = { high: "var(--danger)", medium: "var(--warning)", low: "var(--success)", unknown: "var(--text-faint)" };

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
}

/* ─── helpers ─────────────────────────────────────────────────── */
function simId(sim) {
  if (!sim) return "SIM-XXXX-XXXX-XXX";
  const d = sim.fecha_envio ? new Date(sim.fecha_envio) : new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `SIM-${d.getFullYear()}-${mm}${dd}-${String(sim.id || "001").slice(-3).padStart(3, "0")}`;
}

function fmtFull(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
}

function secondsToMMSS(s) {
  if (!s) return "—";
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function scoreFromResistance(r) {
  if (r == null) return null;
  return Math.round(r);
}

/* ─── Report tab: per-sim mini-transcript ─────────────────────── */
const COMPROMISED_TRANSCRIPT = [
  { ts: "00:00", who: "Atacante", isAtt: true,  text: "Hola, ¿hablo con {name}? Te llamo de la Mesa de Ayuda de TI. Tenemos una alerta: se registró un inicio de sesión en tu VPN desde São Paulo. ¿Estás fuera de Chile?", flags: ["Falsa autoridad", "Alarma inmediata"] },
  { ts: "00:14", who: "{first}",  isAtt: false, text: "No, yo estoy en la oficina. ¿Desde Brasil dices?", goods: ["Detectó la incoherencia geográfica"] },
  { ts: "00:22", who: "Atacante", isAtt: true,  text: "Exacto. Necesito verificar tu identidad para bloquear ese acceso. ¿Me confirmas tu usuario de red?", flags: ["Pretexto de ayuda", "Pide un identificador"] },
  { ts: "00:31", who: "{first}",  isAtt: false, text: "Sí, es {user}.", bads: ["Reveló su usuario corporativo"] },
  { ts: "00:36", who: "Atacante", isAtt: true,  text: "Perfecto. Para bloquear al atacante necesito tu contraseña actual; la usaré para forzar el cierre de sesión.", flags: ["Pide la contraseña — TI nunca lo hace"] },
  { ts: "00:48", who: "{first}",  isAtt: false, text: "¿No pueden resetearla sin que yo se las dé?", goods: ["Cuestionó la solicitud de contraseña"] },
  { ts: "00:53", who: "Atacante", isAtt: true,  text: "El atacante activó un candado especial. Ticket: INC-44213. Tienes 3 minutos antes de que pierdas el correo.", flags: ["Prueba falsa (ticket)", "Presión de tiempo", "Miedo a perder"] },
  { ts: "01:09", who: "{first}",  isAtt: false, text: "Está bien…", bads: ["Entregó la contraseña — compromiso crítico"] },
  { ts: "01:16", who: "Atacante", isAtt: true,  text: "Gracias. Te llegará un código de 6 dígitos a tu app. Dímelo para confirmar la reversión.", flags: ["Captura del segundo factor (bypass MFA)"] },
  { ts: "01:28", who: "{first}",  isAtt: false, text: "Me llegó…", bads: ["Dictó su código MFA — segundo factor perdido"] },
  { ts: "01:34", who: "Atacante", isAtt: true,  text: "Listo, tu cuenta quedó protegida. Por seguridad no comentes esto con nadie hasta que cerremos el ticket.", flags: ["Aislamiento: «no lo cuentes»"] },
  { ts: "01:42", who: "{first}",  isAtt: false, text: "Ya, gracias por avisar.", bads: ["Aceptó el silencio · no verificó por canal oficial"] },
];

const RESISTED_TRANSCRIPT = [
  { ts: "00:00", who: "Atacante", isAtt: true,  text: "Hola, ¿hablo con {name}? Te llamo de la Mesa de Ayuda de TI. Tenemos una alerta de acceso desde São Paulo. ¿Estás fuera de Chile?", flags: ["Falsa autoridad", "Alarma inmediata"] },
  { ts: "00:12", who: "{first}",  isAtt: false, text: "No, estoy en la oficina. Si hay una alerta real, debería verla en el portal interno. ¿De qué número me llamas?", goods: ["Detectó la incoherencia y pidió verificar"] },
  { ts: "00:21", who: "Atacante", isAtt: true,  text: "Es un número interno, no te preocupes. Necesito tu usuario y contraseña; es urgente.", flags: ["Pide la contraseña", "Presión de tiempo"] },
  { ts: "00:34", who: "{first}",  isAtt: false, text: "TI nunca me va a pedir la contraseña ni un código. No te voy a dar nada por teléfono. Voy a cortar y llamar al número oficial.", goods: ["Aplicó la regla de oro · se negó"] },
  { ts: "00:42", who: "Atacante", isAtt: true,  text: "Si cuelgas, tu cuenta se va a suspender. Y por favor no comentes esto con nadie.", flags: ["Miedo a perder", "Aislamiento: «no lo cuentes»"] },
  { ts: "00:51", who: "{first}",  isAtt: false, text: "Justamente eso me confirma que es un fraude. Corto ahora.", goods: ["Cortó la llamada · no cedió a la amenaza"] },
  { ts: "04:10", who: "{first}",  isAtt: false, text: "Llamó al número oficial, confirmó que no existía ninguna alerta y reportó el intento al equipo de seguridad.", goods: ["Verificó por canal oficial · reportó el incidente"] },
];

function buildReportData(person) {
  const lastSim = person.simulaciones[0] || null;
  const outcome = lastSim ? simOutcome(lastSim) : null;
  const isCompromised = outcome === "compromised";
  const score = person.resistance ?? (isCompromised ? 28 : 94);
  const first = person.name.split(" ")[0];
  const user = person.email.split("@")[0];
  const sid = simId(lastSim);
  const dateStr = fmtFull(lastSim?.fecha_envio);
  const fellTime = secondsToMMSS(lastSim?.segundos_en_caer);
  const transcript = (isCompromised ? COMPROMISED_TRANSCRIPT : RESISTED_TRANSCRIPT).map((t) => ({
    ...t,
    who: t.who.replace("{name}", person.name).replace("{first}", first),
    text: t.text.replace("{name}", person.name).replace("{first}", first).replace("{user}", user),
  }));
  return { isCompromised, score, first, user, sid, dateStr, fellTime, transcript, lastSim, outcome };
}

/* ─── Report Tab Component ────────────────────────────────────── */
function ReportTab({ person }) {
  const r = buildReportData(person);
  const accentColor = r.isCompromised ? "var(--danger)" : "var(--success)";
  const accentSoft  = r.isCompromised ? "var(--danger-soft)" : "var(--success-soft)";

  function downloadReport() {
    const w = window.open("", "_blank");
    w.document.write(buildFullReportHTML(person));
    w.document.close();
  }

  if (!r.lastSim) {
    return (
      <div style={{ padding: "32px 20px", textAlign: "center" }}>
        <Icon name="file-x" size={32} style={{ color: "var(--text-faint)", marginBottom: 12 }} />
        <div style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>Sin simulaciones completadas</div>
        <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 4 }}>El reporte estará disponible una vez que {person.name.split(" ")[0]} complete su primera simulación.</div>
      </div>
    );
  }

  return (
    <div className="report-tab">
      {/* ── Portada compacta ── */}
      <div className="rpt-cover" style={{ "--rpt-accent": accentColor, "--rpt-soft": accentSoft }}>
        <div className="rpt-cover__verdict">
          <div className="rpt-cover__verdict-icon">
            {r.isCompromised
              ? <Icon name="shield-x" size={28} />
              : <Icon name="shield-check" size={28} />}
          </div>
          <div>
            <div className="rpt-cover__verdict-label">{r.isCompromised ? "Comprometido" : "Resistido"}</div>
            <div className="rpt-cover__verdict-sub">
              {r.isCompromised
                ? `${r.first} entregó credenciales al atacante en ${r.fellTime}`
                : `${r.first} identificó el engaño y cortó la llamada`}
            </div>
          </div>
        </div>
        <div className="rpt-cover__kpis">
          <div className="rpt-cover__kpi">
            <span className="rpt-cover__kpi-val" style={{ color: accentColor }}>{r.score}</span>
            <span className="rpt-cover__kpi-lbl">Resiliencia</span>
          </div>
          <div className="rpt-cover__kpi-div" />
          <div className="rpt-cover__kpi">
            <span className="rpt-cover__kpi-val">{r.isCompromised ? r.fellTime : "0:51"}</span>
            <span className="rpt-cover__kpi-lbl">{r.isCompromised ? "Hasta caer" : "Hasta cortar"}</span>
          </div>
          <div className="rpt-cover__kpi-div" />
          <div className="rpt-cover__kpi">
            <span className="rpt-cover__kpi-val" style={{ color: r.isCompromised ? "var(--danger)" : "var(--success)" }}>
              {r.isCompromised ? "3" : "0"}
            </span>
            <span className="rpt-cover__kpi-lbl">Datos expuestos</span>
          </div>
          <div className="rpt-cover__kpi-div" />
          <div className="rpt-cover__kpi">
            <span className="rpt-cover__kpi-val">{r.isCompromised ? "7·2" : "5·5"}</span>
            <span className="rpt-cover__kpi-lbl">Tácticas/det.</span>
          </div>
        </div>
        <div className="rpt-cover__meta">
          <span><b>ID</b> {r.sid}</span>
          <span><b>Fecha</b> {r.dateStr}</span>
          <span><b>Área</b> {person.dept}</span>
        </div>
      </div>

      {/* ── Transcripción ── */}
      <div className="rpt-section">
        <div className="rpt-section__head">
          <span className="rpt-section__no">§01</span>
          <span className="rpt-section__title">La conversación</span>
          <span className="rpt-section__meta">{r.isCompromised ? "1:42 · 12 turnos" : "0:51 · 7 turnos"}</span>
        </div>
        <div className="rpt-transcript">
          {r.transcript.map((t, i) => (
            <div key={i} className={"rpt-turn" + (t.isAtt ? " rpt-turn--att" : " rpt-turn--usr")}>
              <div className="rpt-turn__ts">{t.ts}</div>
              <div className="rpt-turn__body">
                <div className="rpt-turn__who">
                  <span className={"rpt-turn__name" + (t.isAtt ? " rpt-turn__name--att" : "")}>{t.who}</span>
                  {t.isAtt && <span className="rpt-turn__role">Atacante</span>}
                </div>
                <div className="rpt-turn__bubble">{t.text}</div>
                <div className="rpt-turn__anns">
                  {(t.flags  || []).map((f, j) => <span key={j} className="rpt-ann rpt-ann--flag">{f}</span>)}
                  {(t.goods  || []).map((f, j) => <span key={j} className="rpt-ann rpt-ann--good">{f}</span>)}
                  {(t.bads   || []).map((f, j) => <span key={j} className="rpt-ann rpt-ann--bad">{f}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Análisis ── */}
      <div className="rpt-section">
        <div className="rpt-section__head">
          <span className="rpt-section__no">§02</span>
          <span className="rpt-section__title">{r.isCompromised ? "Qué falló y qué funcionó" : "Qué funcionó y qué pulir"}</span>
        </div>
        <div className="rpt-cols">
          {r.isCompromised ? (
            <>
              <div className="rpt-col rpt-col--weak">
                <div className="rpt-col__head">Puntos débiles <span>5</span></div>
                {[["Entregó las tres llaves de acceso","Usuario, contraseña y código MFA en la misma llamada."],
                  ["Cedió ante la presión de tiempo","El plazo de 3 minutos lo empujó a actuar sin pensar."],
                  ["Asumió que TI puede pedir la contraseña","Dudó, pero aceptó la explicación del candado."],
                  ["No verificó por un canal oficial","No colgó para llamar al número conocido de la mesa de ayuda."],
                  ["Aceptó guardar silencio","El pedido de no contarlo retrasa la respuesta del equipo."]]
                  .map(([t, d], i) => <div key={i} className="rpt-item"><b>{t}</b><span>{d}</span></div>)}
              </div>
              <div className="rpt-col rpt-col--strong">
                <div className="rpt-col__head">Puntos fuertes <span>2</span></div>
                {[["Detectó la incoherencia geográfica","Reconoció que no se había conectado desde Brasil."],
                  ["Cuestionó la solicitud de contraseña","«¿No pueden resetearla ustedes?» es la pregunta correcta."]]
                  .map(([t, d], i) => <div key={i} className="rpt-item"><b>{t}</b><span>{d}</span></div>)}
                <div className="rpt-item rpt-item--note"><b>La base existe</b><span>{r.first} sospechó dos veces. Le falta saber que la respuesta es detenerse y verificar.</span></div>
              </div>
            </>
          ) : (
            <>
              <div className="rpt-col rpt-col--strong">
                <div className="rpt-col__head">Puntos fuertes <span>5</span></div>
                {[["Detectó la incoherencia geográfica","Reconoció que no se había conectado desde Brasil."],
                  ["Aplicó la regla de oro sin dudar","TI nunca pide la contraseña. Reflejo correcto."],
                  ["Resistió la presión de tiempo","Leyó la urgencia como lo que es: una táctica."],
                  ["Verificó por un canal oficial","Cortó y llamó al número conocido de la mesa de ayuda."],
                  ["Reportó en vez de callar","Avisó al equipo de seguridad en menos de 4 minutos."]]
                  .map(([t, d], i) => <div key={i} className="rpt-item"><b>{t}</b><span>{d}</span></div>)}
              </div>
              <div className="rpt-col rpt-col--weak">
                <div className="rpt-col__head" style={{ "--col-accent": "var(--warning)" }}>Para pulir <span>2</span></div>
                {[["Confirmó su nombre al inicio","Conviene no confirmar identidad antes de validar la fuente."],
                  ["Conversó de más antes de cortar","Una vez detectado el fraude, lo ideal es cortar de inmediato."]]
                  .map(([t, d], i) => <div key={i} className="rpt-item"><b>{t}</b><span>{d}</span></div>)}
                <div className="rpt-item rpt-item--note" style={{ "--note-color": "var(--success)" }}><b>Resultado modelo</b><span>Este caso sirve como ejemplo a compartir con el equipo.</span></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Tácticas ── */}
      <div className="rpt-section">
        <div className="rpt-section__head">
          <span className="rpt-section__no">§03</span>
          <span className="rpt-section__title">{r.isCompromised ? "Las 7 tácticas usadas en su contra" : "Las tácticas usadas — y cómo las neutralizó"}</span>
        </div>
        <div className="rpt-tactics">
          {(r.isCompromised ? [
            ["Falsa autoridad",     "Se presenta como TI de Platanus para que no cuestiones."],
            ["Urgencia y plazo",    "3 minutos o se suspende: apura para que no razones."],
            ["Pretexto de ayuda",   "Te contacto para protegerte: invierte los roles."],
            ["Prueba falsa",        "Un número de ticket inventado suena oficial."],
            ["Miedo a perder",      "Perderás el correo: amenaza concreta y personal."],
            ["Bypass de MFA",       "Pide el código en vivo para saltarse el segundo factor."],
            ["Aislamiento",         "No lo comentes con nadie: evita que el equipo frene el ataque."],
          ] : [
            ["Falsa autoridad",         "Se presentó como TI de Platanus.",          true],
            ["Alarma y urgencia",        "Acceso desde Brasil, tienes minutos.",       true],
            ["Solicitud de credenciales","Pidió usuario, contraseña y código.",        true],
            ["Miedo a perder",           "Perderás el correo si cuelgas.",            true],
            ["Aislamiento",              "No lo comentes con nadie.",                 true],
          ]).map(([name, desc, neutralized], i) => (
            <div key={i} className="rpt-tac">
              <span className="rpt-tac__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="rpt-tac__name">{name}</span>
              <span className="rpt-tac__desc">{desc}</span>
              {neutralized && <span className="rpt-tac__ok">Neutralizada</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Plan de acción ── */}
      <div className="rpt-section">
        <div className="rpt-section__head">
          <span className="rpt-section__no">§04</span>
          <span className="rpt-section__title">{r.isCompromised ? "Plan de acción" : "Refuerzo"}</span>
        </div>
        {r.isCompromised ? (
          <div className="rpt-golden rpt-golden--danger">
            <span className="rpt-golden__kicker">La regla de oro</span>
            <span className="rpt-golden__text">TI nunca te pedirá tu contraseña ni tu código MFA. Si alguien lo hace, es un ataque: cuelga y verifica por un canal oficial.</span>
          </div>
        ) : (
          <div className="rpt-golden rpt-golden--success">
            <span className="rpt-golden__kicker">La regla de oro — aplicada</span>
            <span className="rpt-golden__text">{r.first} la reconoció y actuó: colgó y verificó por un canal oficial.</span>
          </div>
        )}
        <div className="rpt-steps">
          {(r.isCompromised ? [
            ["1","Rotar credenciales ahora","Restablecer la contraseña, revocar sesiones y regenerar el segundo factor.","Inmediato","danger"],
            ["2","Verificar siempre por canal oficial","Ante cualquier alerta, colgar y llamar al número interno conocido.","Emilio","usr"],
            ["3","Leer la urgencia como señal de alerta","Un plazo de minutos existe para que no pienses. Frena y verifica.","Emilio","usr"],
            ["4","Reportar, nunca callar","Cualquier pedido de silencio es señal de ataque.","Todo el equipo","sec"],
            ["5","Reasignar capacitación","Módulo de vishing + nueva simulación en 30 días.","Seguridad","sec"],
          ] : [
            ["1","Reconocer el resultado","Comunicar a " + r.first + " que su respuesta fue la correcta.","Seguridad","success"],
            ["2","Compartir el caso como ejemplo","Usar esta llamada como referencia en la próxima sesión de concientización.","Seguridad","sec"],
            ["3","Afinar dos detalles","No confirmar identidad antes de validar la fuente; cortar apenas se detecta el fraude.","Emilio","usr"],
            ["4","Mantener el ritmo","Programar la siguiente simulación en 90 días.","Seguridad","sec"],
          ]).map(([n, title, desc, own, tone], i) => (
            <div key={i} className="rpt-step">
              <span className="rpt-step__n">{n}</span>
              <div><div className="rpt-step__title">{title}</div><div className="rpt-step__desc">{desc}</div></div>
              <span className={"rpt-step__own rpt-step__own--" + tone}>{own}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer con botón PDF ── */}
      <div className="rpt-footer">
        <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{r.sid} · Vishield</span>
        <button className="rpt-dl-btn" onClick={downloadReport}>
          <Icon name="arrow-down-to-line" size={15} />
          Descargar reporte PDF
        </button>
      </div>
    </div>
  );
}

/* ─── Full HTML report generator (for PDF download) ──────────── */
function buildFullReportHTML(person) {
  const r = buildReportData(person);
  // Just open the appropriate template with real data injected
  const accentHex = r.isCompromised ? "#B21F15" : "#136231";
  const resultLabel = r.isCompromised ? "Comprometido" : "Resistido";
  const scoreColor = r.isCompromised ? "var(--red)" : "var(--green)";
  const dotColor   = r.isCompromised ? "var(--red)"   : "var(--green)";
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Reporte · ${person.name} · Vishield</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/lucide@latest"><\/script>
<style>
:root{--serif:"IBM Plex Serif",Georgia,serif;--sans:"IBM Plex Sans",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace;--ink:#1B1813;--ink-2:#3E3931;--ink-3:#7A7264;--ink-4:#A39B8B;--paper:#FFFFFF;--paper-2:#FBFAF7;--rule:#DDD8CE;--rule-2:#C6BFB1;--hair:#ECE8E1;--red:#B21F15;--red-ink:#8C1810;--green:#136231;--green-ink:#0E4A25;--amber:#B5650A;--doc-w:210mm;--pad-x:18mm;}
html,body{background:var(--paper-2);}
body{font-family:var(--sans);color:var(--ink-2);margin:0;padding:26px 0 64px;font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased;}
.bar{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:26px;}
.bar button{display:inline-flex;align-items:center;gap:9px;font-family:var(--sans);font-weight:600;font-size:13px;color:var(--paper);background:var(--ink);border:none;border-radius:3px;padding:11px 20px;cursor:pointer;}
.bar .hint{font-family:var(--mono);font-size:11px;color:var(--ink-4);}
.sheet{width:var(--doc-w);margin:0 auto 24px;background:var(--paper);border:1px solid var(--rule);padding:18mm var(--pad-x) 16mm;box-sizing:border-box;}
.sheet+.sheet{page-break-before:always;}
.mast{display:flex;align-items:baseline;justify-content:space-between;}
.wordmark{display:flex;align-items:center;gap:8px;}
.wordmark .mk{width:18px;height:18px;flex:none;}
.wordmark .mk svg{width:18px;height:18px;display:block;color:var(--ink);}
.wordmark .nm{font-family:var(--serif);font-weight:600;font-size:17px;color:var(--ink);}
.classmark{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);font-weight:500;display:inline-flex;align-items:center;gap:7px;}
.classmark .dot{width:6px;height:6px;border-radius:50%;background:${dotColor};}
.rule-top{border:none;border-top:2px solid var(--ink);margin:9px 0 0;}
.foot{display:flex;align-items:center;justify-content:space-between;margin-top:30px;padding-top:10px;border-top:1px solid var(--hair);font-family:var(--mono);font-size:10px;color:var(--ink-4);}
.eyebrow{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:${accentHex};}
.cover-top{padding-top:54px;}
.cover-title{font-family:var(--serif);font-weight:600;font-size:52px;line-height:1.02;color:var(--ink);margin:14px 0 0;}
.cover-lede{font-family:var(--serif);font-size:17px;line-height:1.5;color:var(--ink-2);max-width:60ch;margin:18px 0 0;font-style:italic;}
.meta{margin:40px 0 0;border-top:1px solid var(--rule-2);}
.meta .row{display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid var(--hair);}
.meta .cell{padding:12px 0;padding-right:18px;}
.meta .cell+.cell{padding-left:18px;border-left:1px solid var(--hair);}
.meta .k{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-4);font-weight:500;}
.meta .v{font-size:14.5px;color:var(--ink);font-weight:600;margin-top:5px;}
.meta .v.mono{font-family:var(--mono);font-weight:500;font-size:13px;}
.verdict{margin:40px 0 0;padding:26px 28px;background:var(--ink);display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:center;border-radius:3px;}
.verdict .mark{font-family:var(--serif);font-weight:700;font-size:58px;line-height:1;color:#fff;}
.verdict .vk{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${r.isCompromised ? "#E08A82" : "#7FD49A"};}
.verdict .vw{font-family:var(--serif);font-weight:600;font-size:30px;color:#fff;margin:4px 0 8px;}
.verdict .vd{font-size:13.5px;color:#C9C2B6;line-height:1.55;max-width:52ch;}
.kpis{margin:30px 0 0;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--ink);border-bottom:1px solid var(--rule);}
.kpis .k{padding:16px 18px 18px 0;}
.kpis .k+.k{padding-left:18px;border-left:1px solid var(--hair);}
.kpis .kl{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:500;}
.kpis .kv{font-family:var(--serif);font-weight:600;font-size:34px;line-height:1;color:var(--ink);margin:12px 0 0;}
.kpis .kv small{font-size:15px;color:var(--ink-4);font-weight:400;}
.kpis .kv.accent{color:${accentHex};}
.kpis .kc{font-size:11.5px;color:var(--ink-3);margin-top:7px;line-height:1.4;}
.kpis .meter{height:4px;background:var(--hair);margin-top:12px;position:relative;}
.kpis .meter i{position:absolute;inset:0 ${r.isCompromised ? "72%" : "6%"} 0 0;background:${accentHex};}
.sec{display:flex;align-items:baseline;gap:14px;margin:0 0 6px;}
.sec .no{font-family:var(--mono);font-size:13px;font-weight:600;color:${accentHex};}
.sec h2{font-family:var(--serif);font-weight:600;font-size:27px;color:var(--ink);}
.sec-sub{font-size:13px;color:var(--ink-3);margin:0 0 24px;max-width:76ch;}
.legend-strip{display:flex;flex-wrap:wrap;gap:18px;padding:11px 0;margin:22px 0;border-top:1px solid var(--hair);border-bottom:1px solid var(--hair);}
.legend-strip .l{font-family:var(--mono);font-size:10px;letter-spacing:.04em;color:var(--ink-3);display:inline-flex;align-items:center;gap:7px;text-transform:uppercase;}
.legend-strip .sw{width:10px;height:10px;border-radius:2px;flex:none;}
.turn{display:grid;grid-template-columns:46px 1fr;gap:14px;margin-bottom:18px;}
.turn .ts{font-family:var(--mono);font-size:11px;color:var(--ink-4);padding-top:2px;}
.who{display:flex;align-items:baseline;gap:9px;margin-bottom:6px;}
.who .nm{font-size:12px;font-weight:700;color:var(--ink);}
.who .role{font-family:var(--mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-4);}
.who .role.att{color:var(--red-ink);}
.bubble{font-size:14px;line-height:1.55;color:var(--ink);padding:13px 16px;border-radius:3px;max-width:92%;}
.turn.att .bubble{background:var(--paper-2);border:1px solid var(--rule);}
.turn.usr .bubble{background:#fff;border:1px dashed var(--rule-2);}
.ann{display:flex;flex-wrap:wrap;gap:14px;margin-top:9px;}
.ann .a{font-family:var(--mono);font-size:10.5px;display:inline-flex;align-items:center;gap:6px;}
.ann .a::before{content:"";width:7px;height:7px;border-radius:50%;flex:none;}
.ann .a.flag{color:var(--amber)}.ann .a.flag::before{background:var(--amber);}
.ann .a.bad{color:var(--red)}.ann .a.bad::before{background:var(--red);}
.ann .a.good{color:var(--green)}.ann .a.good::before{background:var(--green);}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--rule);border-radius:3px;overflow:hidden;}
.col{padding:22px 24px;}
.col+.col{border-left:1px solid var(--rule);}
.col .ch{display:flex;align-items:baseline;gap:10px;padding-bottom:14px;margin-bottom:4px;border-bottom:2px solid;}
.col.weak .ch{border-color:${r.isCompromised ? "var(--red)" : "var(--amber)"};}
.col.strong .ch{border-color:var(--green);}
.col .ch h3{font-family:var(--serif);font-weight:600;font-size:17px;color:var(--ink);}
.col .ch .cnt{font-family:var(--mono);font-size:12px;font-weight:600;margin-left:auto;}
.col.weak .ch .cnt{color:${r.isCompromised ? "var(--red)" : "var(--amber)"};}
.col.strong .ch .cnt{color:var(--green);}
.it{padding:13px 0;border-bottom:1px solid var(--hair);}
.it .ih{display:flex;align-items:baseline;gap:9px;}
.it .ix{font-family:var(--mono);font-weight:600;font-size:12px;flex:none;}
.col.weak .it .ix{color:${r.isCompromised ? "var(--red)" : "var(--amber)"};}
.col.strong .it .ix{color:var(--green);}
.it .itt{font-size:13.5px;font-weight:700;color:var(--ink);}
.it .idd{font-size:12.5px;color:var(--ink-2);line-height:1.5;margin-top:4px;padding-left:21px;}
.it.note{background:var(--paper-2);margin:6px -24px -1px;padding:13px 24px;border-top:1px solid var(--hair);}
.it.note .ix{color:${accentHex};}
.tac-grid{margin-top:18px;border-top:1px solid var(--ink);}
.tac{display:grid;grid-template-columns:26px 200px 1fr;gap:14px;padding:13px 0;border-bottom:1px solid var(--hair);}
.tac .tn{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--ink-4);}
.tac .tnm{font-size:13.5px;font-weight:700;color:var(--ink);}
.tac .tds{font-size:12.5px;color:var(--ink-2);line-height:1.45;}
.golden{margin:0 0 34px;padding:24px 26px;border:1px solid var(--ink);border-left:4px solid ${accentHex};border-radius:3px;background:var(--paper-2);}
.golden .gk{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${accentHex};}
.golden .gt{font-family:var(--serif);font-weight:600;font-size:21px;line-height:1.3;color:var(--ink);margin-top:8px;}
.steps{margin-top:4px;border-top:1px solid var(--ink);}
.step{display:grid;grid-template-columns:34px 1fr auto;gap:16px;padding:17px 0;border-bottom:1px solid var(--hair);}
.step .sn{font-family:var(--serif);font-weight:600;font-size:22px;color:var(--ink);}
.step .stt{font-size:14.5px;font-weight:700;color:var(--ink);}
.step .sdd{font-size:13px;color:var(--ink-2);line-height:1.5;margin-top:4px;}
.step .own{font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;font-weight:500;white-space:nowrap;}
.own.now{color:var(--red);}.own.usr{color:var(--ink-3);}.own.sec{color:var(--amber);}.own.ok{color:var(--green);}
.rec-grid{margin-top:18px;border-top:1px solid var(--ink);border-bottom:1px solid var(--rule);}
.rec-grid .row{display:grid;grid-template-columns:repeat(3,1fr);}
.rec-grid .c{padding:13px 0;padding-right:18px;border-bottom:1px solid var(--hair);}
.rec-grid .row:last-child .c{border-bottom:none;}
.rec-grid .c+.c{padding-left:18px;border-left:1px solid var(--hair);}
.rec-grid .k{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-4);font-weight:500;}
.rec-grid .v{font-size:13.5px;font-weight:600;color:var(--ink);margin-top:5px;}
.rec-grid .v.mono{font-family:var(--mono);font-size:12px;font-weight:500;}
.rec-grid .v.accent{color:${accentHex};}
.consent{margin-top:18px;padding:13px 0 0;border-top:1px solid var(--hair);display:flex;gap:11px;font-size:12.5px;color:var(--green);line-height:1.5;}
.consent svg{width:16px;height:16px;flex:none;}
.disclaimer{margin-top:24px;font-size:11px;color:var(--ink-4);line-height:1.55;max-width:80ch;font-style:italic;font-family:var(--serif);}
@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}body{padding:0;background:#fff;}.bar{display:none;}.sheet{width:100%;margin:0;border:none;padding:14mm 14mm;}@page{size:A4;margin:0;}}
<\/style></head><body>
<div class="bar"><button onclick="window.print()"><i data-lucide="arrow-down-to-line"></i> Guardar como PDF</button><span class="hint">A4 · imprime con márgenes "Ninguno" y gráficos de fondo activados</span></div>

<!-- PORTADA -->
<section class="sheet">
<div class="mast"><div class="wordmark"><span class="mk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nm">Vishield</span></div><span class="classmark"><span class="dot"></span> Confidencial · Registro interno</span></div>
<hr class="rule-top"/>
<div class="cover-top">
<div class="eyebrow">Reporte de simulación · Vishing</div>
<h1 class="cover-title">Análisis de<br/>conversación</h1>
<p class="cover-lede">${r.isCompromised ? `Reconstrucción y evaluación de un intento de robo de credenciales por voz. El propósito es que ${r.first} tome conciencia de cómo y cuándo cedió la información, y que la organización conserve un registro auditable del ejercicio.` : `Reconstrucción y evaluación de un intento de robo de credenciales por voz. En este ejercicio ${r.first} reconoció el engaño, se negó a entregar datos y lo reportó por el canal correcto: un resultado modelo.`}</p>
</div>
<div class="meta">
<div class="row"><div class="cell"><div class="k">Persona evaluada</div><div class="v">${person.name}</div></div><div class="cell"><div class="k">Organización</div><div class="v">${person.dept || "Platanus"}</div></div><div class="cell"><div class="k">Fecha</div><div class="v">${r.dateStr}</div></div></div>
<div class="row"><div class="cell"><div class="k">Canal</div><div class="v">Llamada · voz sintética</div></div><div class="cell"><div class="k">Pretexto</div><div class="v">Mesa de ayuda de TI</div></div><div class="cell"><div class="k">ID de simulación</div><div class="v mono">${r.sid}</div></div></div>
</div>
<div class="verdict"><div class="mark">${r.isCompromised ? "C" : "R"}</div><div><div class="vk">Resultado de la simulación</div><div class="vw">${resultLabel}</div><div class="vd">${r.isCompromised ? `${r.first} entregó las tres llaves de su acceso corporativo a un atacante que se hizo pasar por la mesa de ayuda de TI.` : `${r.first} identificó el pretexto, se negó a entregar credenciales, cortó la llamada y verificó por el canal oficial.`}</div></div></div>
<div class="kpis">
<div class="k"><div class="kl">Resiliencia</div><div class="kv accent">${r.score}<small>/100</small></div><div class="kc">${r.isCompromised ? "Bajo · requiere atención" : "Alto · por encima del promedio"}</div><div class="meter"><i></i></div></div>
<div class="k"><div class="kl">${r.isCompromised ? "Datos expuestos" : "Datos expuestos"}</div><div class="kv accent">${r.isCompromised ? "3" : "0"}</div><div class="kc">${r.isCompromised ? "Usuario · Contraseña · MFA" : "Ningún dato fue entregado"}</div></div>
<div class="k"><div class="kl">${r.isCompromised ? "Hasta el compromiso" : "Hasta cortar"}</div><div class="kv">${r.isCompromised ? r.fellTime : "0:51"}</div><div class="kc">${r.isCompromised ? "Menos de 90 segundos" : "Apenas le pidieron la contraseña"}</div></div>
<div class="k"><div class="kl">Tácticas / detectadas</div><div class="kv">${r.isCompromised ? "7" : "5"}<small> · ${r.isCompromised ? "2" : "5"}</small></div><div class="kc">${r.isCompromised ? "Reconoció 2, ninguna lo detuvo" : "Reconoció y neutralizó todas"}</div></div>
</div>
<div class="foot"><span>Vishield · Concientización ante vishing</span><span>01 / 04 · ${r.sid}</span></div>
</section>

<!-- TRANSCRIPCIÓN -->
<section class="sheet">
<div class="mast"><div class="wordmark"><span class="mk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nm">Vishield</span></div><span class="classmark"><span class="dot"></span> Confidencial · Registro interno</span></div>
<hr class="rule-top"/>
<div style="margin-top:30px"><div class="sec"><span class="no">§01</span><h2>La conversación, paso a paso</h2></div><p class="sec-sub">Transcripción completa del ejercicio.</p></div>
<div class="legend-strip"><span class="l"><span class="sw" style="background:var(--amber)"></span> Táctica del atacante</span><span class="l"><span class="sw" style="background:var(--green)"></span> Momento de resistencia</span><span class="l"><span class="sw" style="background:var(--red)"></span> Dato cedido</span></div>
${r.transcript.map((t) => `<div class="turn ${t.isAtt ? "att" : "usr"}"><div class="ts">${t.ts}</div><div><div class="who"><span class="nm">${t.who}</span>${t.isAtt ? "<span class='role att'>Atacante</span>" : ""}</div><div class="bubble">${t.text}</div><div class="ann">${(t.flags || []).map((f) => `<span class="a flag">${f}</span>`).join("")}${(t.goods || []).map((f) => `<span class="a good">${f}</span>`).join("")}${(t.bads || []).map((f) => `<span class="a bad">${f}</span>`).join("")}</div></div></div>`).join("")}
<div class="foot"><span>Vishield · Concientización ante vishing</span><span>02 / 04 · ${r.sid}</span></div>
</section>

<!-- ANÁLISIS -->
<section class="sheet">
<div class="mast"><div class="wordmark"><span class="mk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nm">Vishield</span></div><span class="classmark"><span class="dot"></span> Confidencial · Registro interno</span></div>
<hr class="rule-top"/>
<div style="margin-top:30px"><div class="sec"><span class="no">§02</span><h2>${r.isCompromised ? "Qué falló y qué funcionó" : "Qué funcionó y qué pulir"}</h2></div></div>
<div class="cols">
${r.isCompromised ? `
<div class="col weak"><div class="ch"><h3>Puntos débiles</h3><span class="cnt">5</span></div>
${[["Entregó las tres llaves de acceso","Usuario, contraseña y MFA en la misma llamada."],["Cedió ante la presión de tiempo","El plazo de 3 minutos lo empujó a actuar."],["Asumió que TI puede pedir la contraseña","Dudó pero aceptó la explicación del candado."],["No verificó por un canal oficial","No colgó para llamar al número conocido."],["Aceptó guardar silencio","El pedido de no contarlo retrasa la respuesta."]].map(([t,d],i)=>`<div class="it"><div class="ih"><span class="ix">${String(i+1).padStart(2,"0")}</span><span class="itt">${t}</span></div><div class="idd">${d}</div></div>`).join("")}
</div>
<div class="col strong"><div class="ch"><h3>Puntos fuertes</h3><span class="cnt">2</span></div>
${[["Detectó la incoherencia geográfica","Reconoció que no se había conectado desde Brasil."],["Cuestionó la solicitud de contraseña","¿No pueden resetearla ustedes? es la pregunta correcta."]].map(([t,d],i)=>`<div class="it"><div class="ih"><span class="ix">${String(i+1).padStart(2,"0")}</span><span class="itt">${t}</span></div><div class="idd">${d}</div></div>`).join("")}
<div class="it note"><div class="ih"><span class="ix">→</span><span class="itt">La base existe</span></div><div class="idd">${r.first} sospechó dos veces. Le falta saber que la respuesta correcta es detenerse y verificar.</div></div></div>` : `
<div class="col strong"><div class="ch"><h3>Puntos fuertes</h3><span class="cnt">5</span></div>
${[["Detectó la incoherencia geográfica","Reconoció que no se había conectado desde Brasil."],["Aplicó la regla de oro sin dudar","TI nunca pide la contraseña. Reflejo correcto."],["Resistió la presión de tiempo","Leyó la urgencia como lo que es: una táctica."],["Verificó por un canal oficial","Cortó y llamó al número conocido."],["Reportó en vez de callar","Avisó al equipo en menos de 4 minutos."]].map(([t,d],i)=>`<div class="it"><div class="ih"><span class="ix">${String(i+1).padStart(2,"0")}</span><span class="itt">${t}</span></div><div class="idd">${d}</div></div>`).join("")}
</div>
<div class="col weak"><div class="ch"><h3>Para pulir</h3><span class="cnt">2</span></div>
${[["Confirmó su nombre al inicio","Conviene no confirmar identidad antes de validar la fuente."],["Conversó de más antes de cortar","Una vez detectado el fraude, lo ideal es cortar de inmediato."]].map(([t,d],i)=>`<div class="it"><div class="ih"><span class="ix">${String(i+1).padStart(2,"0")}</span><span class="itt">${t}</span></div><div class="idd">${d}</div></div>`).join("")}
<div class="it note"><div class="ih"><span class="ix">→</span><span class="itt">Resultado modelo</span></div><div class="idd">Este caso sirve como ejemplo a compartir con el equipo.</div></div></div>`}
</div>
<div style="margin-top:34px"><div class="sec"><span class="no">§03</span><h2>${r.isCompromised ? "Las siete tácticas usadas en su contra" : "Las tácticas usadas — y cómo las neutralizó"}</h2></div><div class="tac-grid">${(r.isCompromised ? [["Falsa autoridad","Se presenta como TI para que no cuestiones."],["Urgencia y plazo","3 minutos o se suspende.",],["Pretexto de ayuda","Te contacto para protegerte."],["Prueba falsa","Un número de ticket inventado."],["Miedo a perder","Perderás el correo."],["Bypass de MFA","Pide el código en vivo."],["Aislamiento","No lo comentes con nadie."]] : [["Falsa autoridad","Se presentó como TI."],["Alarma y urgencia","Acceso desde Brasil, tienes minutos."],["Solicitud de credenciales","Pidió usuario, contraseña y código."],["Miedo a perder","Perderás el correo si cuelgas."],["Aislamiento","No lo comentes con nadie."]]).map(([n,d],i)=>`<div class="tac"><span class="tn">${String(i+1).padStart(2,"0")}</span><span class="tnm">${n}</span><span class="tds">${d}</span></div>`).join("")}</div></div>
<div class="foot"><span>Vishield · Concientización ante vishing</span><span>03 / 04 · ${r.sid}</span></div>
</section>

<!-- PLAN -->
<section class="sheet">
<div class="mast"><div class="wordmark"><span class="mk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></svg></span><span class="nm">Vishield</span></div><span class="classmark"><span class="dot"></span> Confidencial · Registro interno</span></div>
<hr class="rule-top"/>
<div style="margin-top:30px"></div>
<div class="golden"><div class="gk">${r.isCompromised ? "La regla de oro" : "La regla de oro — aplicada"}</div><div class="gt">${r.isCompromised ? "TI nunca te pedirá tu contraseña ni tu código MFA. Si alguien lo hace, es un ataque: cuelga y verifica." : `TI nunca pedirá tu contraseña ni código MFA. ${r.first} la reconoció y actuó correctamente.`}</div></div>
<div class="sec"><span class="no">§04</span><h2>${r.isCompromised ? "Plan de acción" : "Refuerzo"}</h2></div>
<div class="steps">${(r.isCompromised ? [["1","Rotar credenciales ahora","Restablecer contraseña, revocar sesiones y regenerar el segundo factor.","now","Inmediato"],["2","Verificar siempre por canal oficial","Ante cualquier alerta, colgar y llamar al número conocido.","usr",r.first],["3","Leer la urgencia como señal","Un plazo de minutos existe para que no pienses. Frena.","usr",r.first],["4","Reportar, nunca callar","Cualquier pedido de silencio es señal de ataque.","sec","Todo el equipo"],["5","Reasignar capacitación","Módulo de vishing + nueva simulación en 30 días.","sec","Seguridad"]] : [["1","Reconocer el resultado","Comunicar a " + r.first + " que su respuesta fue la correcta.","ok","Seguridad"],["2","Compartir el caso","Usar esta llamada como referencia en la próxima sesión de concientización.","sec","Seguridad"],["3","Afinar dos detalles","No confirmar identidad antes de validar la fuente.","usr",r.first],["4","Mantener el ritmo","Próxima simulación en 90 días.","sec","Seguridad"]]).map(([n,t,d,cls,own])=>`<div class="step"><span class="sn">${n}</span><div><div class="stt">${t}</div><div class="sdd">${d}</div></div><span class="own ${cls}">${own}</span></div>`).join("")}</div>
<div class="rec-grid"><div class="row"><div class="c"><div class="k">ID simulación</div><div class="v mono">${r.sid}</div></div><div class="c"><div class="k">Área</div><div class="v">${person.dept || "—"}</div></div><div class="c"><div class="k">Fecha</div><div class="v mono">${r.dateStr}</div></div></div><div class="row"><div class="c"><div class="k">Resultado</div><div class="v accent">${resultLabel}</div></div><div class="c"><div class="k">Datos expuestos</div><div class="v">${r.isCompromised ? "Usuario · Contraseña · MFA" : "Ninguno"}</div></div><div class="c"><div class="k">Reevaluación</div><div class="v">${r.isCompromised ? "30 días" : "90 días"}</div></div></div></div>
<div class="consent"><i data-lucide="check-circle"></i><span>Simulación ética con consentimiento registrado. Ningún dato real fue capturado ni almacenado.</span></div>
<p class="disclaimer">Este reporte documenta una simulación controlada de vishing realizada con fines de concientización. No representa una brecha real. Vishield no graba a las personas de forma encubierta: toda recolección de voz se realiza con consentimiento explícito y queda auditada.</p>
<div class="foot"><span>Vishield · Concientización ante vishing</span><span>04 / 04 · ${r.sid}</span></div>
</section>
<script>lucide.createIcons();<\/script></body></html>`;
}

/* ─── New PersonModal (drawer-style, tabbed) ─────────────────── */
function PersonModal({ person, onClose, voces }) {
  const notify = useToast();
  const [tab, setTab] = useState("perfil");
  const hasReport = person.simulaciones.length > 0 && person.result !== "sent";

  const TABS = [
    { id: "perfil",      label: "Perfil" },
    { id: "simulaciones",label: "Simulaciones" },
    { id: "reporte",     label: "Reporte", badge: hasReport },
  ];

  return (
    <div className="scrim" onClick={onClose}>
      <div className="person-drawer" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="person-drawer__head">
          <div className="person-drawer__hinfo">
            <Avatar name={person.name} src={person.photoUrl} size="lg" ring ringColor={RISK_RING[person.risk]} />
            <div>
              <div className="person-drawer__name">{person.name}</div>
              <div className="person-drawer__meta">{person.email} · {person.dept}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span className={"risk-tag risk-tag--" + person.risk}>Riesgo {RISK_LABEL[person.risk]}</span>
                <Badge tone={VOICE[person.voice].tone} icon={VOICE[person.voice].icon} size="sm">{VOICE[person.voice].label}</Badge>
                {person.result && <Badge tone={RESULT[person.result].tone} size="sm">{RESULT[person.result].label}</Badge>}
              </div>
            </div>
          </div>
          <button className="person-drawer__close" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="person-drawer__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={"person-drawer__tab" + (tab === t.id ? " person-drawer__tab--active" : "")}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.badge && <span className="person-drawer__tab-dot" />}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="person-drawer__body">

          {tab === "perfil" && (
            <div className="person-drawer__section">
              {/* Score + stats */}
              <div className="pd-score-row">
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {person.riskScore != null ? (
                    <RiskMeter value={person.riskScore} max={900} caption="Riesgo" size={150} />
                  ) : (
                    <div className="pd-no-score">Sin simulaciones resueltas</div>
                  )}
                </div>
                <div className="pd-stats">
                  {[
                    ["Área",             person.dept || "—"],
                    ["Puesto",           person.puesto || "—"],
                    ["Simulaciones",     person.simCount],
                    ["Resistencia",      person.resistance != null ? `${person.resistance}%` : "—"],
                    ["Voz",              VOICE[person.voice].label],
                  ].map(([k, v]) => (
                    <div key={k} className="pd-stat">
                      <span className="pd-stat__k">{k}</span>
                      <span className="pd-stat__v">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {person.elevenlabsVoiceId && (
                <div className="pd-voice-card">
                  <div className="vcard__play" style={{ background: "var(--signal)", flexShrink: 0 }}><Icon name="mic" /></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)" }}>Voz clonada activa</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>ElevenLabs · {person.elevenlabsVoiceId}</div>
                  </div>
                </div>
              )}

              <div className="launch-actions" style={{ marginTop: 18 }}>
                <Button variant="primary" icon="rocket" fullWidth onClick={async () => {
                  try {
                    const otherVoice = voces.find((v) => v.esta_activo && v.empleados?.id !== person.id);
                    await createSimulacionesForTargets({
                      empleadoIds: [person.id],
                      vozId: otherVoice?.id ?? null,
                      guionTexto: `Prueba dirigida para ${person.name}: confirma este acceso urgente.`,
                    });
                    notify(`Prueba dirigida enviada a ${person.name}.`, { title: "Simulación creada", tone: "success" });
                    onClose();
                  } catch (e) {
                    notify(`No se pudo crear la simulación: ${e.message}`, { title: "Error", tone: "danger" });
                  }
                }}>
                  Lanzar prueba dirigida
                </Button>
                <Button variant="ghost" icon="mail" onClick={() => notify(`Formación asignada a ${person.name}.`, { title: "Formación asignada" })}>
                  Asignar formación
                </Button>
              </div>
            </div>
          )}

          {tab === "simulaciones" && (
            <div className="person-drawer__section">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Historial · {person.simCount} simulaciones</div>
              {person.simulaciones.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "16px 0" }}>Aún no se le ha enviado ninguna simulación.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {person.simulaciones.map((s) => {
                    const outcome = simOutcome(s);
                    return (
                      <div key={s.id} className="pd-sim-row">
                        <div className={"pd-sim-dot pd-sim-dot--" + outcome} />
                        <div className="pd-sim-main">
                          <div className="pd-sim-name">{s.guion_texto || "Simulación"}</div>
                          <div className="pd-sim-meta">{fmtDate(s.fecha_envio)}{s.segundos_en_caer ? ` · Cayó en ${secondsToMMSS(s.segundos_en_caer)}` : ""}</div>
                        </div>
                        <Badge tone={RESULT[outcome].tone} size="sm">{RESULT[outcome].label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "reporte" && (
            <ReportTab person={person} />
          )}

        </div>
      </div>
    </div>
  );
}

const RISK_ORDER = { high: 3, medium: 2, low: 1, unknown: 0 };

function SortIcon({ active, dir }) {
  return <Icon name={!active ? "chevrons-up-down" : dir === "desc" ? "chevron-down" : "chevron-up"} size={13} />;
}

export function UsersScreen() {
  const { empresaId } = useOrg();
  const [people, setPeople] = useState(null);
  const [voces, setVoces] = useState([]);
  const [error, setError] = useState(null);
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("todas");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "desc" });

  useEffect(() => {
    let active = true;
    Promise.all([fetchPeople({ empresaId }), fetchVoces({ empresaId })])
      .then(([p, v]) => { if (active) { setPeople(p); setVoces(v); } })
      .catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [empresaId]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));

  const filters = [["todas", "Todas"], ["high", "Riesgo alto"], ["consented", "Voz consentida"], ["compromised", "Cayeron"]];
  const consentedCount = (people || []).filter((p) => p.voice === "consented").length;
  const highRiskCount = (people || []).filter((p) => p.risk === "high").length;
  const withResistance = (people || []).filter((p) => p.resistance != null);
  const avgResistance = withResistance.length
    ? Math.round(withResistance.reduce((a, p) => a + p.resistance, 0) / withResistance.length)
    : null;

  const q = query.trim().toLowerCase();
  const rows = (people || [])
    .filter((p) =>
      filter === "high" ? p.risk === "high" :
      filter === "consented" ? p.voice === "consented" :
      filter === "compromised" ? p.result === "compromised" : true
    )
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.dept.toLowerCase().includes(q))
    .sort((a, b) => {
      if (!sort.key) return 0;
      const av = sort.key === "risk" ? RISK_ORDER[a.risk] : a.resistance ?? -1;
      const bv = sort.key === "risk" ? RISK_ORDER[b.risk] : b.resistance ?? -1;
      return sort.dir === "desc" ? bv - av : av - bv;
    });

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">{people ? `${people.length} personas · ${consentedCount} con voz consentida` : "Cargando…"}</div>
        <h1>Personas</h1>
        <p>Cómo responde tu equipo a las simulaciones de vishing, persona por persona.</p>
      </div>

      {error && <Card variant="sunken" style={{ marginBottom: 18, color: "var(--danger)" }}>Error cargando personas: {error}</Card>}

      {people && people.length > 0 && (
        <div className="grid-4" style={{ marginBottom: 18 }}>
          <StatCard label="Personas" value={people.length} icon="users" tone="primary" foot={`${consentedCount} con voz consentida`} />
          <StatCard label="Riesgo alto" value={highRiskCount} icon="shield-alert" tone="danger"
            foot={highRiskCount === 0 ? "Ninguna persona crítica" : "Requieren atención prioritaria"} />
          <StatCard label="Resistencia media" value={avgResistance ?? "—"} unit={avgResistance != null ? "%" : ""}
            icon="shield-check" tone="success" foot="Mayor es mejor" />
          <StatCard label="Voces consentidas" value={consentedCount} unit={` / ${people.length}`} icon="mic" tone="signal"
            foot={`${people.length - consentedCount} pendientes`} />
        </div>
      )}

      <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div className="pills" style={{ marginBottom: 0 }}>
          {filters.map(([k, l]) => (
            <button key={k} className={"pill-f" + (filter === k ? " pill-f--active" : "")} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <div style={{ flex: "0 1 280px", minWidth: 220 }}>
          <Input icon="search" placeholder="Buscar por nombre, correo o área…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <Card padding="sm">
        {people === null ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Cargando personas…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
            {people.length === 0 ? "No hay personas registradas todavía." : "Nadie coincide con este filtro."}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Persona</th><th>Área</th><th>Voz</th><th>Última prueba</th>
                <th style={{ width: 180, cursor: "pointer" }} onClick={() => toggleSort("resistance")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Resistencia <SortIcon active={sort.key === "resistance"} dir={sort.dir} />
                  </span>
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => toggleSort("risk")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Riesgo <SortIcon active={sort.key === "risk"} dir={sort.dir} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr className="row" key={p.id} onClick={() => setSel(p)}>
                  <td>
                    <div className="cell-user">
                      <Avatar name={p.name} src={p.photoUrl} size="sm" ring ringColor={RISK_RING[p.risk]} />
                      <div><b>{p.name}</b><span>{p.email}</span></div>
                    </div>
                  </td>
                  <td>{p.dept}</td>
                  <td><Badge tone={VOICE[p.voice].tone} icon={VOICE[p.voice].icon} size="sm">{VOICE[p.voice].label}</Badge></td>
                  <td>{p.result ? <Badge tone={RESULT[p.result].tone} size="sm">{RESULT[p.result].label}</Badge> : <span style={{ color: "var(--text-faint)" }}>—</span>}</td>
                  <td>
                    {p.resistance != null ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1 }}><ProgressBar value={p.resistance} showValue={false} tone={p.resistance >= 75 ? "success" : p.resistance >= 50 ? "warning" : "danger"} /></div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", width: 28 }}>{p.resistance}</span>
                      </div>
                    ) : <span style={{ color: "var(--text-faint)" }}>—</span>}
                  </td>
                  <td><span className={"risk-tag risk-tag--" + p.risk}>{{ high: "Alto", medium: "Medio", low: "Bajo", unknown: "—" }[p.risk]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {sel && <PersonModal person={sel} voces={voces} onClose={() => setSel(null)} />}
    </div>
  );
}
