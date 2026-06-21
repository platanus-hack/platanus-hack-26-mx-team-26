"use client";

import { useState, useEffect } from "react";
import { IconButton, Avatar } from "../design-system/components";
import { Icon } from "../design-system/components/Icon";
import { useToast } from "./ToastContext";
import { SIDEBAR_COLLAPSE_EVENT } from "./sidebarPrefs";
import { useOrg } from "./OrgContext";
import { OrgSwitcherModal } from "./OrgSwitcher";

const NAV = [
  { id: "resumen",   label: "Resumen",             icon: "layout-dashboard" },
  { id: "personas",  label: "Personas",            icon: "users",  count: "8" },
  { id: "voces",     label: "Biblioteca de voces", icon: "mic" },
  { id: "campanas",  label: "Campañas",            icon: "radio",  count: "6" },
  { id: "lanzar",    label: "Sala de lanzamiento", icon: "rocket" },
];

function ThemeToggle() {
  const [dark, setDark] = useState(true); // matches the SSR default (data-theme="dark" on <html>)
  useEffect(() => {
    // Synced post-hydration: the beforeInteractive script may have already
    // switched <html> to the user's saved theme before this component mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.dataset.theme !== "light");
  }, []);
  const flip = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("vishield-theme", next); } catch {}
    setDark(!dark);
  };
  return <IconButton icon={dark ? "sun" : "moon"} variant="outline" label="Cambiar tema" onClick={flip} />;
}

export function Shell({ view, setView, title, sub, children, onLaunch }) {
  const notify = useToast();
  const soon = (what) => notify(`${what} estará disponible próximamente.`, { title: "En camino" });
  const { org } = useOrg();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const goTo = (id) => { setView(id); closeSidebar(); };

  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try { setCollapsed(localStorage.getItem("vishield-sidebar-collapsed") === "1"); } catch {}
    const onExternalChange = (e) => setCollapsed(!!e.detail);
    window.addEventListener(SIDEBAR_COLLAPSE_EVENT, onExternalChange);
    return () => window.removeEventListener(SIDEBAR_COLLAPSE_EVENT, onExternalChange);
  }, []);
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("vishield-sidebar-collapsed", next ? "1" : "0"); } catch {}
    window.dispatchEvent(new CustomEvent(SIDEBAR_COLLAPSE_EVENT, { detail: next }));
  };

  return (
    <div className="app">
      {switcherOpen && <OrgSwitcherModal onClose={() => setSwitcherOpen(false)} />}
      <aside className={"sb" + (sidebarOpen ? " sb--open" : "") + (collapsed ? " sb--collapsed" : "")}>
        <div className="sb__logo">
          <img
            src={collapsed ? "/vishield/logo-icon.png" : "/vishield/logo-full.png"}
            alt="ViShield"
            className={collapsed ? "sb__logo-icon" : "sb__logo-full"}
          />
          <button className="sb__collapse-toggle" onClick={toggleCollapsed}
            title={collapsed ? "Expandir menú" : "Contraer menú"} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>
            <Icon name={collapsed ? "chevron-right" : "chevron-left"} />
          </button>
        </div>

        {/* Org switcher button */}
        <button
          className="sb__org"
          title={collapsed ? `${org.name} · ${org.plan}` : undefined}
          onClick={() => setSwitcherOpen(true)}
        >
          <div className="sb__org-logo">
            <org.LogoIcon />
          </div>
          <div className="sb__item-label">
            <div className="sb__org-name">{org.name}</div>
            <div className="sb__org-sub">{org.plan}</div>
          </div>
          <Icon name="chevrons-up-down" className="sb__item-label" />
        </button>

        <div className="sb__sect"><span className="sb__item-label">Operación</span></div>
        <nav className="sb__nav">
          {NAV.map((n) => (
            <button key={n.id}
              className={"sb__item" + (view === n.id ? " sb__item--active" : "")}
              title={collapsed ? n.label : undefined}
              onClick={() => goTo(n.id)}>
              <Icon name={n.icon} />
              <span className="sb__item-label">{n.label}</span>
              {n.count && <span className="sb__count sb__item-label">{n.count}</span>}
            </button>
          ))}
        </nav>

        <div className="sb__sect"><span className="sb__item-label">Cuenta</span></div>
        <nav className="sb__nav">
          <button className={"sb__item" + (view === "configuracion" ? " sb__item--active" : "")}
            title={collapsed ? "Configuración" : undefined} onClick={() => goTo("configuracion")}>
            <Icon name="settings" /><span className="sb__item-label">Configuración</span>
          </button>
          <button className={"sb__item" + (view === "ayuda" ? " sb__item--active" : "")}
            title={collapsed ? "Ayuda" : undefined} onClick={() => goTo("ayuda")}>
            <Icon name="life-buoy" /><span className="sb__item-label">Ayuda</span>
          </button>
        </nav>

        <div className="sb__foot">
          <div className="sb__user" title={collapsed ? `${org.adminName} · ${org.adminRole}` : undefined}>
            <Avatar name={org.adminName} size="sm" status="online" />
            <div className="sb__item-label">
              <div className="sb__user-name">{org.adminName}</div>
              <div className="sb__user-role">{org.adminRole}</div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="sb-scrim" onClick={closeSidebar} />}

      <div className="main">
        <header className="topbar">
          <span className="menu-btn">
            <IconButton icon="menu" variant="ghost" label="Abrir menú" onClick={() => setSidebarOpen(true)} />
          </span>
          <div>
            <div className="topbar__title">{title}</div>
            {sub && <div className="topbar__sub">{sub}</div>}
          </div>
          <div className="topbar__search">
            <Icon name="search" />
            <input placeholder="Buscar personas, campañas, voces…" />
          </div>
          <div className="topbar__spacer"></div>
          <div className="topbar__actions">
            <ThemeToggle />
            <IconButton icon="bell" variant="outline" label="Notificaciones" onClick={() => soon("El centro de notificaciones")} />
            <button className="sr-btn sr-btn--primary sr-btn--md topbar__launch" onClick={onLaunch}>
              <Icon name="rocket" /> <span className="topbar__launch-label">Lanzar simulación</span>
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
