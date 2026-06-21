// Sirena · Resumen (Dashboard). Exposes window.DashboardScreen
const { Card, StatCard, RiskMeter, StatusPill, Badge, ProgressBar, Button } = window.SirenaDesignSystem_c1cb8e;

function Sparkline({ data }) {
  const max = Math.max(...data);
  return (
    <div className="spark">
      {data.map((v, i) => <span key={i} style={{ height: (v / max) * 100 + '%' }} />)}
    </div>
  );
}

function DashboardScreen({ openCampaigns }) {
  const D = window.SirenaData;
  const live = D.campaigns.filter((c) => c.status === 'live');
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Platanus org · semana del 15 jun</div>
        <h1>Hola de nuevo, Jordan</h1>
        <p>Tu resiliencia subió esta semana. Tres personas aún caen ante notas de voz por WhatsApp.</p>
      </div>

      <div className="dash-hero">
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <StatCard label="Puntaje de riesgo" value="385" icon="gauge" tone="danger" delta="12" deltaTone="down" foot="Más bajo es mejor" />
          <StatCard label="Voces consentidas" value="18" unit="/ 24" icon="mic" tone="signal" foot="6 pendientes de grabar" />
          <StatCard label="Resistencia media" value="72" unit="%" icon="shield-check" tone="success" delta="8" deltaTone="good-up" />
          <StatCard label="Simulaciones activas" value="2" icon="radio" tone="primary" foot="36 personas en curso" />
        </div>

        <Card title="Puntaje de riesgo" eyebrow="Toda la organización"
          action={<Badge tone="success" icon="trending-down">Mejorando</Badge>}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 2px' }}>
            <RiskMeter value={385} max={900} caption="Promedio" sublabel="Bajó 12 puntos vs. semana pasada" size={240} />
          </div>
        </Card>
      </div>

      <div className="dash-hero" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <Card title="Actividad reciente" eyebrow="Simulaciones"
          action={<Button variant="link" iconRight="arrow-right" onClick={openCampaigns}>Ver campañas</Button>}>
          <div>
            {D.campaigns.slice(0, 5).map((c) => {
              const m = D.channelMeta[c.channel];
              return (
                <div className="act" key={c.id}>
                  <div className={'act__ch act__ch--' + m.tone}><i data-lucide={m.icon}></i></div>
                  <div className="act__main">
                    <div className="act__name">{c.name}</div>
                    <div className="act__meta">{c.id} · {m.label} · {c.when}</div>
                  </div>
                  <div className="act__nums">
                    {c.status === 'live' || c.status === 'success' ? (
                      <>
                        <div className="act__num"><b style={{ color: 'var(--success)' }}>{c.resisted}</b><span>Resistió</span></div>
                        <div className="act__num"><b style={{ color: 'var(--danger)' }}>{c.compromised}</b><span>Cayó</span></div>
                      </>
                    ) : <div style={{ width: 120 }} />}
                    <StatusPill status={c.status === 'success' ? 'success' : c.status}>
                      {{ live: 'En vivo', success: 'Completada', scheduled: 'Programada', draft: 'Borrador' }[c.status]}
                    </StatusPill>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Cultura de seguridad" eyebrow="Nivel" action={<Badge tone="highlight">Básico · 28</Badge>}>
            <ProgressBar value={28} max={60} tone="primary" valueLabel="28 / 60" showValue label="Hacia 'Resiliente'" />
            <div style={{ marginTop: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Tendencia de riesgo · 12 sem</div>
              <Sparkline data={D.riskHistory} />
            </div>
          </Card>

          <Card variant="soft">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <i data-lucide="sparkles"></i>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 3 }}>Siguiente paso</div>
                <div style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5, marginBottom: 12 }}>
                  Finanzas es tu área más vulnerable. Lanza una prueba de nota de voz del CFO.
                </div>
                <Button variant="primary" size="sm" icon="rocket" onClick={openCampaigns}>Preparar prueba</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
