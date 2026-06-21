// Sirena · Biblioteca de voces (Voice Library). Exposes window.VoiceLibraryScreen
const { Card, Avatar, Badge, Button, WaveBars } = window.SirenaDesignSystem_c1cb8e;

const VSTATE = {
  consented: { tone: 'signal',  icon: 'badge-check', label: 'Consentida' },
  pending:   { tone: 'neutral', icon: 'clock',       label: 'Pendiente' },
  expired:   { tone: 'warning', icon: 'alert-circle',label: 'Caducada' },
};

function VoiceCard({ p, playing, onPlay }) {
  const isPending = p.voice === 'pending';
  return (
    <Card hover>
      <div className="vcard__top">
        <Avatar name={p.name} size="md" status={p.risk === 'high' ? 'risk' : 'online'} />
        <div style={{ flex: 1 }}>
          <div className="vcard__name">{p.name}</div>
          <div className="vcard__dept">{p.dept}</div>
        </div>
        <Badge tone={VSTATE[p.voice].tone} icon={VSTATE[p.voice].icon} size="sm">{VSTATE[p.voice].label}</Badge>
      </div>

      {isPending ? (
        <div className="vcard__wave" style={{ justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
          <i data-lucide="mic-off" style={{ width: 18, height: 18 }}></i> Aún sin grabar
        </div>
      ) : (
        <div className="vcard__wave">
          <button className="vcard__play" onClick={onPlay}>
            <i data-lucide={playing ? 'pause' : 'play'}></i>
          </button>
          <WaveBars tone={p.voice === 'expired' ? 'muted' : 'signal'} playing={playing} count={20} height={30} barWidth={3} />
        </div>
      )}

      <div className="vcard__foot">
        <span className="vcard__time">{isPending ? '—' : p.sample + ' · 2026-06-14'}</span>
        {isPending
          ? <Button variant="soft" size="sm" icon="send">Invitar a grabar</Button>
          : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>SIR-V{p.id.slice(1)}</span>}
      </div>
    </Card>
  );
}

function VoiceLibraryScreen() {
  const D = window.SirenaData;
  const [filter, setFilter] = React.useState('todas');
  const [playing, setPlaying] = React.useState(null);
  const filters = [['todas', 'Todas'], ['consented', 'Consentidas'], ['pending', 'Pendientes'], ['expired', 'Caducadas']];
  const rows = D.people.filter((p) => filter === 'todas' ? true : p.voice === filter);

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">18 consentidas · 6 pendientes</div>
        <h1>Biblioteca de voces</h1>
        <p>Muestras de voz recolectadas con consentimiento explícito, usadas solo para simulaciones éticas.</p>
      </div>

      <Card variant="accent-soft" padding="sm" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <i data-lucide="shield-check"></i>
          </div>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5 }}>
            <b style={{ color: 'var(--text-strong)' }}>Consentimiento verificado.</b> Cada muestra tiene registro de auditoría y caduca a los 12 meses. Nadie es grabado de forma encubierta.
          </div>
          <Button variant="ghost" size="sm" iconRight="external-link">Ver registro</Button>
        </div>
      </Card>

      <div className="pills">
        {filters.map(([k, l]) => (
          <button key={k} className={'pill-f' + (filter === k ? ' pill-f--active' : '')} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      <div className="voice-grid">
        {rows.map((p) => (
          <VoiceCard key={p.id} p={p} playing={playing === p.id}
            onPlay={() => setPlaying(playing === p.id ? null : p.id)} />
        ))}
      </div>
    </div>
  );
}

window.VoiceLibraryScreen = VoiceLibraryScreen;
