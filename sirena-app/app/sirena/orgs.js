// ── Multi-org configuration ──────────────────────────────────────────────────
// Each org has: id, name, plan, peopleCount, adminName, adminRole, primaryColor, logo (inline SVG)

export const ORGS = [
  {
    id: "platanus",
    name: "Platanus Org",
    shortName: "Platanus",
    plan: "PRO",
    adminName: "Jordan Daly",
    adminRole: "Admin de seguridad",
    primaryColor: "#F5A623",
    accentColor: "#F5A623",
    LogoIcon: () => (
      <img src="/platanus-logo.png" alt="Platanus" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
    ),
    badge: "P",
    badgeBg: "#F5A623",
    badgeColor: "#fff",
    description: "Equipo de producto e ingeniería",
    useRealData: true,
    // UUID de la fila en public.empresas — null = sin filtro (muestra todos los empleados)
    empresaId: null,
  },
  {
    id: "altur",
    name: "Altur",
    shortName: "Altur",
    plan: "ENTERPRISE",
    adminName: "Sofía Medina",
    adminRole: "CISO",
    primaryColor: "#1a1a1a",
    accentColor: "#3d3d3d",
    // Chameleon logo – real brand image
    LogoIcon: () => (
      <img src="/altur-logo.jpg" alt="Altur" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
    ),
    badge: "A",
    badgeBg: "#1C1C1E",
    badgeColor: "#fff",
    description: "Consultoría de riesgos corporativos",
    useRealData: false,
    // Mock data for Altur
    mockStats: {
      peopleCount: 34,
      avgResistance: 41,
      avgRisk: 531,
      consentedCount: 18,
      pendingCount: 12,
      expiredCount: 4,
      activeSims: 7,
      totalSims: 89,
      compromised: 52,
      resisted: 30,
      weeklyStats: [
        { label: "3 nov", total: 8,  compromised: 6, resisted: 2,  sent: 0, fallRate: 75, resistRate: 25 },
        { label: "10 nov", total: 12, compromised: 9, resisted: 3,  sent: 0, fallRate: 75, resistRate: 25 },
        { label: "17 nov", total: 9,  compromised: 6, resisted: 3,  sent: 0, fallRate: 67, resistRate: 33 },
        { label: "24 nov", total: 14, compromised: 9, resisted: 5,  sent: 0, fallRate: 64, resistRate: 36 },
        { label: "1 dic",  total: 11, compromised: 6, resisted: 5,  sent: 0, fallRate: 55, resistRate: 45 },
        { label: "8 dic",  total: 15, compromised: 8, resisted: 7,  sent: 0, fallRate: 53, resistRate: 47 },
        { label: "15 dic", total: 13, compromised: 6, resisted: 7,  sent: 0, fallRate: 46, resistRate: 54 },
        { label: "22 dic", total: 7,  compromised: 2, resisted: 5,  sent: 0, fallRate: 29, resistRate: 71 },
      ],
      deptStats: [
        { dept: "Legal",      count: 6,  avg: 28 },
        { dept: "Dirección",  count: 4,  avg: 35 },
        { dept: "Finanzas",   count: 8,  avg: 42 },
        { dept: "Comercial",  count: 10, avg: 51 },
        { dept: "Operaciones",count: 6,  avg: 62 },
      ],
      recentSims: [
        { id: "a1", name: "Carlos Venegas",  dept: "Legal",     outcome: "compromised", sent: "Hace 1 h" },
        { id: "a2", name: "Daniela Torres",  dept: "Finanzas",  outcome: "resisted",    sent: "Hace 3 h" },
        { id: "a3", name: "Rodrigo Fuentes", dept: "Dirección", outcome: "compromised", sent: "Hace 5 h" },
        { id: "a4", name: "Alejandra Ríos",  dept: "Comercial", outcome: "sent",        sent: "Hace 8 h" },
        { id: "a5", name: "Pablo Navarro",   dept: "Legal",     outcome: "compromised", sent: "Ayer" },
      ],
    },
  },
];

export const DEFAULT_ORG_ID = "platanus";
