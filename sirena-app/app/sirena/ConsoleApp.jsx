"use client";

import { useState } from "react";
import { Shell } from "./Shell";
import { DashboardScreen } from "./DashboardScreen";
import { UsersScreen } from "./UsersScreen";
import { VoiceLibraryScreen } from "./VoiceLibraryScreen";
import { LaunchScreen } from "./LaunchScreen";
import { CampaignsScreen } from "./CampaignsScreen";
import { SettingsScreen } from "./SettingsScreen";
import { HelpScreen } from "./HelpScreen";
import { ToastProvider } from "./ToastContext";
import { OrgProvider, useOrg } from "./OrgContext";

function ConsoleShell() {
  const [view, setView] = useState("resumen");
  const { org } = useOrg();

  const TITLES = {
    resumen:       ["Resumen",             `Estado de seguridad · ${org.name}`],
    personas:      ["Personas",            "Resultados de simulación por persona"],
    voces:         ["Biblioteca de voces", "Muestras consentidas"],
    campanas:      ["Campañas",            "Historial de simulaciones"],
    lanzar:        ["Sala de lanzamiento", "Activar una prueba de vishing"],
    configuracion: ["Configuración",       "Perfil, apariencia y notificaciones"],
    ayuda:         ["Ayuda",               "FAQ, recursos y soporte"],
  };

  const [title, sub] = TITLES[view] || ["Resumen", ""];
  let screen;
  if (view === "resumen") screen = <DashboardScreen openCampaigns={() => setView("campanas")} />;
  else if (view === "personas") screen = <UsersScreen />;
  else if (view === "voces") screen = <VoiceLibraryScreen />;
  else if (view === "lanzar") screen = <LaunchScreen />;
  else if (view === "campanas") screen = <CampaignsScreen />;
  else if (view === "configuracion") screen = <SettingsScreen />;
  else if (view === "ayuda") screen = <HelpScreen />;

  return (
    <Shell view={view} setView={setView} title={title} sub={sub} onLaunch={() => setView("lanzar")}>
      {screen}
    </Shell>
  );
}

export function ConsoleApp() {
  return (
    <ToastProvider>
      <OrgProvider>
        <ConsoleShell />
      </OrgProvider>
    </ToastProvider>
  );
}
