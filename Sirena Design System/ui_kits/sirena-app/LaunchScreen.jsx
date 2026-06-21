// Sirena · Sala de lanzamiento (Launch room). Exposes window.LaunchScreen
const { Card, Button, Select, Badge, StatusPill, Avatar, Toast, WaveBars, Switch } = window.SirenaDesignSystem_c1cb8e;

const CHANNELS = [
  { id: 'audio',    icon: 'audio-lines',    t: 'Nota de audio',  d: 'Deja un mensaje de voz con un clon consentido.' },
  { id: 'whatsapp', icon: 'message-circle', t: 'WhatsApp',       d: 'Envía un audio o texto por WhatsApp.' },
  { id: 'call',     icon: 'phone-call',     t: 'Llamada',        d: 'Realiza una llamada simulada en vivo.' },
];

const TEMPLATES = {
  audio:    'Hola, soy del equipo de finanzas. Necesito que confirmes la transferencia antes de las 3pm, te dejo los datos en este audio…',
  whatsapp: 'Hola 👋 soy Jordan de TI. Detectamos un acceso inusual a tu cuenta. ¿Puedes confirmarme el código que te acaba de llegar?',
  call:     'Buenas, le llamo del banco por un cargo sospechoso. Para verificar su identidad, ¿me confirma los últimos dígitos de su tarjeta?',
};

function LaunchScreen() {
  const D = window.SirenaData;
  const [chan, setChan] = React.useState('whatsapp');
  const [msg, setMsg] = React.useState(TEMPLATES.whatsapp);
  const [sent, setSent] = React.useState(false);
  const live = D.campaigns.filter((c) => c.status === 'live');

  const pickChan = (id) => { setChan(id); setMsg(TEMPLATES[id]); };

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Simulación controlada · solo pruebas</div>
        <h1>Sala de lanzamiento</h1>
        <p>Activa una prueba de vishing ética en tres pasos. Los mensajes son simulados, pero llegan de verdad.</p>
      </div>

      <div className="launch-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card title="1 · Elige el canal" eyebrow="Sistema a activar">
            <div className="chan-cards">
              {CHANNELS.map((c) => (
                <button key={c.id} className={'chan' + (chan === c.id ? ' chan--active' : '')} onClick={() => pickChan(c.id)}>
                  <div className="chan__ic"><i data-lucide={c.icon}></i></div>
                  <div className="chan__t">{c.t}</div>
                  <div className="chan__d">{c.d}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card title="2 · Audiencia y voz" eyebrow="A quién y con qué voz">
            <div className="grid-2">
              <Select label="Audiencia" options={['Finanzas (12 personas)', 'Toda la organización (124)', 'Riesgo alto (9)', 'Personalizada…']} />
              <Select label="Voz a clonar" options={['Camila Rojas · CFO', 'Genérica · femenina', 'Genérica · masculina', 'Sin voz (solo texto)']} />
            </div>
            <div className="field-row">
              <label>{chan === 'call' ? 'Guion de la llamada' : 'Mensaje'}</label>
              <textarea className="composer" value={msg} onChange={(e) => setMsg(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="vcard__play" style={{ width: 34, height: 34 }}><i data-lucide="play"></i></button>
                <WaveBars tone="accent" count={16} height={24} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>Vista previa del clon · 0:08</span>
              </div>
              <Badge tone="accent" icon="sparkles">Voz IA</Badge>
            </div>
          </Card>

          <Card title="3 · Programa y lanza" eyebrow="Cuándo">
            <div className="grid-2">
              <Select label="Momento" options={['Ahora mismo', 'Programar para más tarde', 'Distribuir en 3 días']} />
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}>
                <Switch checked={true} onChange={() => {}} label="Avisarme según respondan" />
              </div>
            </div>
            <div className="warn-line">
              <i data-lucide="alert-triangle"></i>
              Esto enviará mensajes reales a 12 personas de Finanzas. Son simulados, pero sonarán de verdad.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Button variant="primary" size="lg" icon="rocket" onClick={() => setSent(true)}>Lanzar simulación</Button>
              <Button variant="ghost" size="lg" icon="save">Guardar borrador</Button>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="En vivo ahora" eyebrow="Simulaciones activas"
            action={<StatusPill status="live">{live.length} en vivo</StatusPill>}>
            {live.map((c) => {
              const m = D.channelMeta[c.channel];
              const pct = Math.round((c.resisted / c.sent) * 100);
              return (
                <div className="act" key={c.id}>
                  <div className={'act__ch act__ch--' + m.tone}><i data-lucide={m.icon}></i></div>
                  <div className="act__main">
                    <div className="act__name">{c.name}</div>
                    <div className="act__meta">{c.sent} enviados · {pct}% resistió</div>
                  </div>
                  <WaveBars tone="primary" playing count={6} height={22} />
                </div>
              );
            })}
          </Card>

          <Card variant="soft" padding="sm">
            <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <i data-lucide="lock" style={{ color: 'var(--primary)', width: 20, height: 20, flex: 'none', marginTop: 2 }}></i>
              <div style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5 }}>
                <b style={{ color: 'var(--text-strong)' }}>Uso ético garantizado.</b> Solo lanzas a personas de tu organización con voces consentidas. Cada acción queda registrada.
              </div>
            </div>
          </Card>
        </div>
      </div>

      {sent && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 80 }}>
          <Toast tone="success" title="Simulación lanzada" onClose={() => setSent(false)}>
            12 mensajes en camino. Te avisaremos según las personas respondan.
          </Toast>
        </div>
      )}
    </div>
  );
}

window.LaunchScreen = LaunchScreen;
