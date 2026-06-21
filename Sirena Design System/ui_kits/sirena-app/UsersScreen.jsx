// Sirena · Personas (Users) with detail modal. Exposes window.UsersScreen
const { Card, Avatar, Badge, StatusPill, ProgressBar, Button, IconButton, RiskMeter } = window.SirenaDesignSystem_c1cb8e;

const RESULT = {
  resisted:    { tone: 'success', label: 'Resistió' },
  reported:    { tone: 'warning', label: 'Reportó' },
  compromised: { tone: 'danger',  label: 'Cayó' },
};
const VOICE = {
  consented: { tone: 'signal',  icon: 'badge-check', label: 'Consentida' },
  pending:   { tone: 'neutral', icon: 'clock',       label: 'Pendiente' },
  expired:   { tone: 'warning', icon: 'alert-circle',label: 'Caducada' },
};

function fillColor(v) {
  return v >= 75 ? 'var(--success)' : v >= 50 ? 'var(--warning)' : 'var(--danger)';
}

function PersonModal({ person, onClose }) {
  const D = window.SirenaData;
  const card = D.scorecards[person.id] || D.scorecards.u2;
  const avg = Math.round(card.reduce((a, b) => a + b[1], 0) / card.length);
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <Avatar name={person.name} size="lg" status={person.risk === 'high' ? 'risk' : 'online'} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>{person.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{person.email} · {person.dept}</div>
            </div>
          </div>
          <IconButton icon="x" variant="ghost" label="Cerrar" onClick={onClose} />
        </div>
        <div className="modal__body">
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <span className={'risk-tag risk-tag--' + person.risk}>Riesgo {{ high: 'alto', medium: 'medio', low: 'bajo' }[person.risk]}</span>
            <Badge tone={VOICE[person.voice].tone} icon={VOICE[person.voice].icon}>Voz {VOICE[person.voice].label.toLowerCase()}</Badge>
            <Badge tone={RESULT[person.result].tone}>Última prueba: {RESULT[person.result].label.toLowerCase()}</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20, alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RiskMeter value={Math.round((100 - avg) * 9)} max={900} caption="Riesgo" size={170} />
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Resistencia por canal</div>
              {card.map(([lbl, v]) => (
                <div className="score-row" key={lbl}>
                  <div className="score-row__lbl">{lbl}</div>
                  <div className="score-row__bar"><div className="score-row__fill" style={{ width: v + '%', background: fillColor(v) }} /></div>
                  <div className="score-row__v" style={{ color: fillColor(v) }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {person.voice !== 'pending' && (
            <Card variant="sunken" padding="sm" style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className="vcard__play"><i data-lucide="play"></i></button>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: 14 }}>Muestra de voz consentida</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{person.sample} · capturada 2026-06-14</div>
                  </div>
                </div>
                <window.SirenaDesignSystem_c1cb8e.WaveBars tone="signal" count={14} height={28} />
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <Button variant="primary" icon="rocket" fullWidth>Lanzar prueba dirigida</Button>
            <Button variant="ghost" icon="mail">Asignar formación</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersScreen() {
  const D = window.SirenaData;
  const [sel, setSel] = React.useState(null);
  const [filter, setFilter] = React.useState('todas');
  const filters = [['todas', 'Todas'], ['high', 'Riesgo alto'], ['consented', 'Voz consentida'], ['compromised', 'Cayeron']];
  const rows = D.people.filter((p) =>
    filter === 'todas' ? true :
    filter === 'high' ? p.risk === 'high' :
    filter === 'consented' ? p.voice === 'consented' :
    filter === 'compromised' ? p.result === 'compromised' : true
  );

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">124 personas · 18 con voz consentida</div>
        <h1>Personas</h1>
        <p>Cómo responde tu equipo a las simulaciones de vishing, persona por persona.</p>
      </div>

      <div className="pills">
        {filters.map(([k, l]) => (
          <button key={k} className={'pill-f' + (filter === k ? ' pill-f--active' : '')} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      <Card padding="sm">
        <table className="tbl">
          <thead>
            <tr>
              <th>Persona</th><th>Área</th><th>Voz</th><th>Última prueba</th>
              <th style={{ width: 180 }}>Resistencia</th><th>Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr className="row" key={p.id} onClick={() => setSel(p)}>
                <td>
                  <div className="cell-user">
                    <Avatar name={p.name} size="sm" status={p.risk === 'high' ? 'risk' : undefined} />
                    <div><b>{p.name}</b><span>{p.email}</span></div>
                  </div>
                </td>
                <td>{p.dept}</td>
                <td><Badge tone={VOICE[p.voice].tone} icon={VOICE[p.voice].icon} size="sm">{VOICE[p.voice].label}</Badge></td>
                <td><Badge tone={RESULT[p.result].tone} size="sm">{RESULT[p.result].label}</Badge></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}><ProgressBar value={p.resistance} showValue={false} tone={p.resistance >= 75 ? 'success' : p.resistance >= 50 ? 'warning' : 'danger'} /></div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', width: 28 }}>{p.resistance}</span>
                  </div>
                </td>
                <td><span className={'risk-tag risk-tag--' + p.risk}>{{ high: 'Alto', medium: 'Medio', low: 'Bajo' }[p.risk]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {sel && <PersonModal person={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

window.UsersScreen = UsersScreen;
