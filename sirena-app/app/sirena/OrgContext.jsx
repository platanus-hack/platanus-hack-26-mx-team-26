"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { ORGS, DEFAULT_ORG_ID } from "./orgs";

const OrgCtx = createContext(null);

export function OrgProvider({ children }) {
  const [orgId, setOrgId] = useState(() => {
    try { return localStorage.getItem("vishield-org") || DEFAULT_ORG_ID; } catch { return DEFAULT_ORG_ID; }
  });

  const switchOrg = useCallback((id) => {
    setOrgId(id);
    try { localStorage.setItem("vishield-org", id); } catch {}
  }, []);

  const org = ORGS.find((o) => o.id === orgId) || ORGS[0];

  // UUID de la fila en public.empresas — null = sin filtro (muestra todos los empleados)
  const empresaId = org.empresaId ?? null;

  return (
    <OrgCtx.Provider value={{ org, orgs: ORGS, switchOrg, empresaId }}>
      {children}
    </OrgCtx.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgCtx);
  if (!ctx) throw new Error("useOrg must be inside OrgProvider");
  return ctx;
}
