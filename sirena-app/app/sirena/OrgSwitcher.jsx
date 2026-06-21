"use client";

import { useState } from "react";
import { useOrg } from "./OrgContext";
import { Icon } from "../design-system/components/Icon";

function OrgCard({ org, active, onSelect }) {
  return (
    <button
      className={"org-card" + (active ? " org-card--active" : "")}
      onClick={() => onSelect(org.id)}
      style={{ "--oc-accent": org.primaryColor }}
    >
      {/* Logo */}
      <div className="org-card__logo">
        <org.LogoIcon />
      </div>

      {/* Info */}
      <div className="org-card__info">
        <div className="org-card__name">{org.name}</div>
        <div className="org-card__desc">{org.description}</div>
        <div className="org-card__meta">
          <span className="org-card__plan">{org.plan}</span>
          {org.useRealData
            ? <span className="org-card__live">● Datos en vivo</span>
            : <span className="org-card__demo">Demo</span>}
        </div>
      </div>

      {/* Active check */}
      {active && (
        <div className="org-card__check">
          <Icon name="check" />
        </div>
      )}
    </button>
  );
}

export function OrgSwitcherModal({ onClose }) {
  const { org, orgs, switchOrg } = useOrg();

  const handleSelect = (id) => {
    switchOrg(id);
    onClose();
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="org-switcher" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="org-switcher__head">
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-strong)" }}>
              Cambiar organización
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Selecciona el workspace que quieres gestionar
            </div>
          </div>
          <button className="org-switcher__close" onClick={onClose} aria-label="Cerrar">
            <Icon name="x" />
          </button>
        </div>

        {/* Org list */}
        <div className="org-switcher__list">
          {orgs.map((o) => (
            <OrgCard key={o.id} org={o} active={o.id === org.id} onSelect={handleSelect} />
          ))}
        </div>

        {/* Footer */}
        <div className="org-switcher__foot">
          <Icon name="plus-circle" />
          <span>Solicitar acceso a otra organización</span>
        </div>
      </div>
    </div>
  );
}
