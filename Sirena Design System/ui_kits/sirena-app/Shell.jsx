// Sirena · app shell (sidebar + topbar). Exposes window.Shell
const { IconButton, Avatar } = window.SirenaDesignSystem_c1cb8e;

const NAV = [
  { id: 'resumen',   label: 'Resumen',            icon: 'layout-dashboard' },
  { id: 'personas',  label: 'Personas',           icon: 'users',  count: '8' },
  { id: 'voces',     label: 'Biblioteca de voces',icon: 'mic' },
  { id: 'campanas',  label: 'Campañas',           icon: 'radio',  count: '6' },
  { id: 'lanzar',    label: 'Sala de lanzamiento',icon: 'rocket' },
];

function ThemeToggle() {
  const [dark, setDark] = React.useState(
    () => document.documentElement.dataset.theme === 'dark'
  );
  const flip = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('sirena-theme', next); } catch (e) {}
    setDark(!dark);
  };
  return <IconButton icon={dark ? 'sun' : 'moon'} variant="outline" label="Cambiar tema" onClick={flip} />;
}

function Shell({ view, setView, title, sub, children, onLaunch }) {
  return (
    <div className="app">
      <aside className="sb">
        <div className="sb__logo">
          <img src="../../assets/logo-wordmark.svg" alt="Sirena" id="sb-logo-light" />
          <img src="../../assets/logo-wordmark-dark.svg" alt="Sirena" id="sb-logo-dark" />
        </div>
        <div className="sb__org">
          <span className="sb__org-badge">P</span>
          <div>
            <div className="sb__org-name">Platanus Org</div>
            <div className="sb__org-sub">PLAN PRO · 124 PERSONAS</div>
          </div>
          <i data-lucide="chevrons-up-down"></i>
        </div>

        <div className="sb__sect">Operación</div>
        <nav className="sb__nav">
          {NAV.map((n) => (
            <button key={n.id}
              className={'sb__item' + (view === n.id ? ' sb__item--active' : '')}
              onClick={() => setView(n.id)}>
              <i data-lucide={n.icon}></i>
              {n.label}
              {n.count && <span className="sb__count">{n.count}</span>}
            </button>
          ))}
        </nav>

        <div className="sb__sect">Cuenta</div>
        <nav className="sb__nav">
          <button className="sb__item"><i data-lucide="settings"></i>Configuración</button>
          <button className="sb__item"><i data-lucide="life-buoy"></i>Ayuda</button>
        </nav>

        <div className="sb__foot">
          <div className="sb__user">
            <Avatar name="Jordan Daly" size="sm" status="online" />
            <div>
              <div className="sb__user-name">Jordan Daly</div>
              <div className="sb__user-role">Admin de seguridad</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar__title">{title}</div>
            {sub && <div className="topbar__sub">{sub}</div>}
          </div>
          <div className="topbar__search">
            <i data-lucide="search"></i>
            <input placeholder="Buscar personas, campañas, voces…" />
          </div>
          <div className="topbar__spacer"></div>
          <div className="topbar__actions">
            <ThemeToggle />
            <IconButton icon="bell" variant="outline" label="Notificaciones" />
            <button className="sr-btn sr-btn--primary sr-btn--md" onClick={onLaunch}>
              <i data-lucide="rocket"></i> Lanzar simulación
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

window.Shell = Shell;
