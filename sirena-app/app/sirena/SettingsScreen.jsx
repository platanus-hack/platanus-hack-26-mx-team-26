"use client";

import { useEffect, useState } from "react";
import { Card, Button, Switch, Badge, Avatar } from "../design-system/components";
import { Icon } from "../design-system/components/Icon";
import { useToast } from "./ToastContext";
import { SIDEBAR_COLLAPSE_EVENT } from "./sidebarPrefs";

function Row({ label, hint, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "10px 0" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

// Widget IDs and default order
const DEFAULT_WIDGETS = [
  { id: "hackability",  label: "Hackabilidad",         icon: "gauge",        desc: "Métrica central con gauge animado y panel de razones." },
  { id: "risk",         label: "Puntaje de riesgo",     icon: "shield-off",   desc: "Puntaje numérico con historial y desglose por área." },
  { id: "voices",       label: "Voces consentidas",     icon: "mic",          desc: "Cobertura de grabaciones y tendencia de adopción." },
  { id: "resistance",   label: "Resistencia media",     icon: "shield-check", desc: "Evolución de resiliencia y personas en riesgo alto." },
  { id: "sims",         label: "Simulaciones activas",  icon: "radio",        desc: "Actividad reciente y frecuencia de campañas." },
  { id: "areas",        label: "Resumen por área",      icon: "building-2",   desc: "Tabla de resistencia media por departamento." },
  { id: "next",         label: "Siguiente paso",        icon: "sparkles",     desc: "Recomendación automática de acción prioritaria." },
];

const STORAGE_KEY = "vishield-dashboard-widgets";

function DashboardCustomizer() {
  const notify = useToast();
  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(saved)) return saved;
    } catch {}
    return DEFAULT_WIDGETS.map((w) => ({ ...w, visible: true }));
  });
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const save = (next) => {
    setWidgets(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const toggle = (id) => save(widgets.map((w) => w.id === id ? { ...w, visible: !w.visible } : w));

  const reset = () => {
    save(DEFAULT_WIDGETS.map((w) => ({ ...w, visible: true })));
    notify("Dashboard restaurado al orden por defecto.", { title: "Restaurado", tone: "success" });
  };

  const onDragStart = (e, id) => { setDragging(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver  = (e, id) => { e.preventDefault(); setDragOver(id); };
  const onDrop      = (e, targetId) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    const from = widgets.findIndex((w) => w.id === dragging);
    const to   = widgets.findIndex((w) => w.id === targetId);
    const next = [...widgets];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    save(next);
    setDragging(null); setDragOver(null);
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {widgets.map((w) => (
          <div
            key={w.id}
            draggable
            onDragStart={(e) => onDragStart(e, w.id)}
            onDragOver={(e) => onDragOver(e, w.id)}
            onDrop={(e) => onDrop(e, w.id)}
            onDragEnd={() => { setDragging(null); setDragOver(null); }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: "var(--radius-md)",
              border: `1.5px solid ${dragOver === w.id ? "var(--primary)" : "var(--border-faint)"}`,
              background: dragging === w.id ? "var(--surface-sunken)" : "var(--surface)",
              cursor: "grab", transition: "all var(--dur-base)",
              opacity: dragging === w.id ? 0.4 : 1,
            }}
          >
            <Icon name="grip-vertical" style={{ color: "var(--text-faint)", width: 16, height: 16, flex: "none" }} />
            <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)",
              background: w.visible ? "var(--primary-soft)" : "var(--surface-inset)",
              color: w.visible ? "var(--primary)" : "var(--text-faint)",
              display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
              transition: "all var(--dur-base)" }}>
              <Icon name={w.icon} style={{ width: 16, height: 16 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: w.visible ? "var(--text-strong)" : "var(--text-faint)" }}>{w.label}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{w.desc}</div>
            </div>
            <Switch checked={w.visible} onChange={() => toggle(w.id)} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Button variant="ghost" size="sm" icon="rotate-ccw" onClick={reset}>Restaurar por defecto</Button>
      </div>
    </div>
  );
}

export function SettingsScreen() {
  const notify = useToast();
  const soon = (what) => notify(`${what} estará disponible próximamente.`, { title: "En camino" });

  const [dark, setDark] = useState(true);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme !== "light");
    try { setCompact(localStorage.getItem("vishield-sidebar-collapsed") === "1"); } catch {}
  }, []);

  const toggleTheme = (on) => {
    const next = on ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("vishield-theme", next); } catch {}
    setDark(on);
  };

  const toggleCompact = (on) => {
    setCompact(on);
    try { localStorage.setItem("vishield-sidebar-collapsed", on ? "1" : "0"); } catch {}
    window.dispatchEvent(new CustomEvent(SIDEBAR_COLLAPSE_EVENT, { detail: on }));
  };

  const [alertFall, setAlertFall] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [liveCampaigns, setLiveCampaigns] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">CUENTA · PLATANUS ORG</div>
        <h1>Configuración</h1>
        <p>Administra tu perfil, apariencia y preferencias de notificación.</p>
      </div>

      <div className="launch-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card eyebrow="Cuenta" title="Perfil">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name="Jordan Daly" size="lg" status="online" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--text-strong)" }}>Jordan Daly</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Admin de seguridad</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>jordan.daly@platanus.org</div>
              </div>
              <Button variant="ghost" size="sm" icon="pencil" onClick={() => soon("La edición de perfil")}>Editar</Button>
            </div>
          </Card>

          <Card eyebrow="Interfaz" title="Apariencia">
            <Row label="Tema oscuro" hint="Obsidian Gold — fondo oscuro con acentos bronce.">
              <Switch checked={dark} onChange={toggleTheme} />
            </Row>
            <Row label="Menú lateral compacto" hint="Contrae el sidebar a solo iconos.">
              <Switch checked={compact} onChange={toggleCompact} />
            </Row>
          </Card>

          <Card eyebrow="Dashboard" title="Personalizar vista de inicio">
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
              Arrastra para reordenar y activa o desactiva cada widget según las necesidades de tu empresa.
            </div>
            <DashboardCustomizer />
          </Card>

          <Card eyebrow="Alertas" title="Notificaciones">
            <Row label="Alguien cae en una simulación" hint="Aviso inmediato al equipo de seguridad.">
              <Switch checked={alertFall} onChange={setAlertFall} />
            </Row>
            <Row label="Resumen semanal por correo" hint="Cada lunes, métricas de la semana anterior.">
              <Switch checked={weeklyDigest} onChange={setWeeklyDigest} />
            </Row>
            <Row label="Nuevas campañas en vivo" hint="Notificación cuando una simulación arranca.">
              <Switch checked={liveCampaigns} onChange={setLiveCampaigns} />
            </Row>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card eyebrow="Plan" title="Platanus Org">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Plan Pro · 124 personas</div>
              <Badge tone="success" icon="check">Activo</Badge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Button variant="ghost" size="sm" icon="credit-card" fullWidth onClick={() => soon("La gestión de facturación")}>Gestionar facturación</Button>
              <Button variant="ghost" size="sm" icon="user-plus" fullWidth onClick={() => soon("Invitar personas")}>Invitar personas</Button>
            </div>
          </Card>

          <Card eyebrow="Protección" title="Seguridad de la cuenta">
            <Row label="Autenticación de dos factores" hint="Requiere un código adicional al iniciar sesión.">
              <Switch checked={twoFactor} onChange={setTwoFactor} />
            </Row>
            <Button variant="danger" size="sm" icon="log-out" fullWidth style={{ marginTop: 14 }} onClick={() => soon("Cerrar sesión en todos los dispositivos")}>
              Cerrar sesión en todos los dispositivos
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
