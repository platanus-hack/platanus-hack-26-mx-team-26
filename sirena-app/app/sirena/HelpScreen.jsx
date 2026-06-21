"use client";

import { Card, Button, StatusPill } from "../design-system/components";
import { Icon } from "../design-system/components/Icon";
import { useToast } from "./ToastContext";

const FAQ = [
  ["¿Qué es una simulación de vishing?", "Un intento controlado de phishing por voz (llamada, nota de audio o WhatsApp) que se envía a tu equipo para medir y entrenar su capacidad de detectarlo."],
  ["¿Cómo doy consentimiento de voz?", "Cada persona recibe una invitación para grabar una muestra corta. Sin esa grabación, su voz nunca se usa para clonar simulaciones."],
  ["¿Mis datos de voz son seguros?", "Las muestras quedan cifradas, con registro de auditoría, y caducan automáticamente a los 12 meses."],
  ["¿Puedo excluir a alguien de las pruebas?", "Sí, desde Personas puedes marcar a cualquier persona como exenta antes de lanzar una campaña."],
  ["¿Cómo cancelo una campaña en vivo?", "Entra a Campañas, abre la simulación activa y usa la acción de detener — los envíos pendientes se cancelan al instante."],
];

const RESOURCES = [
  ["book-open", "Guía rápida de inicio"],
  ["scale", "Política de uso ético"],
  ["shield-check", "Centro de confianza y seguridad"],
];

export function HelpScreen() {
  const notify = useToast();
  const soon = (what) => notify(`${what} estará disponible próximamente.`, { title: "En camino" });

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">SOPORTE</div>
        <h1>Ayuda</h1>
        <p>Preguntas frecuentes, recursos y cómo contactar al equipo de ViShield.</p>
      </div>

      <div className="launch-grid">
        <Card eyebrow="FAQ" title="Preguntas frecuentes">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {FAQ.map(([q, a], i) => (
              <div key={q} style={{ padding: "14px 0", borderTop: i === 0 ? "none" : "1px solid var(--border-faint)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>{q}</div>
                <div style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.5 }}>{a}</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card eyebrow="Soporte directo" title="Contacto">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name="mail" />
              </div>
              <div style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.5 }}>
                ¿Necesitas ayuda directa? Nuestro equipo responde en menos de 4h hábiles.
              </div>
            </div>
            <Button variant="primary" size="sm" icon="message-circle" fullWidth onClick={() => soon("El chat de soporte")}>Contactar soporte</Button>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)", textAlign: "center", marginTop: 10 }}>soporte@vishield.io</div>
          </Card>

          <Card eyebrow="Documentación" title="Recursos">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RESOURCES.map(([icon, label]) => (
                <Button key={label} variant="ghost" size="sm" icon={icon} iconRight="external-link" fullWidth
                  style={{ justifyContent: "space-between" }}
                  onClick={() => soon(label)}>
                  {label}
                </Button>
              ))}
            </div>
          </Card>

          <Card variant="soft" padding="sm">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 13, color: "var(--text-body)" }}>Todos los sistemas funcionando con normalidad.</div>
              <StatusPill status="success">Operativo</StatusPill>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
