// Sirena · demo data for the UI kit (fake, illustrative). Spanish-first UI.
window.SirenaData = (function () {
  const people = [
    { id: 'u1', name: 'Camila Rojas',     email: 'camila.rojas@platanus.org',   dept: 'Finanzas',    voice: 'consented', sample: '0:34', risk: 'high',   result: 'compromised', resistance: 38, last: 'Hace 2 días' },
    { id: 'u2', name: 'Diego Fuentes',    email: 'diego.fuentes@platanus.org',  dept: 'Ingeniería',  voice: 'consented', sample: '0:29', risk: 'low',    result: 'resisted',    resistance: 91, last: 'Hace 2 días' },
    { id: 'u3', name: 'Valentina Soto',   email: 'v.soto@platanus.org',         dept: 'Personas',    voice: 'pending',   sample: '—',    risk: 'medium', result: 'reported',    resistance: 64, last: 'Hace 5 días' },
    { id: 'u4', name: 'Matías Herrera',   email: 'm.herrera@platanus.org',      dept: 'Ventas',      voice: 'consented', sample: '0:41', risk: 'high',   result: 'compromised', resistance: 27, last: 'Hace 1 día' },
    { id: 'u5', name: 'Antonia Vega',     email: 'antonia.vega@platanus.org',   dept: 'Legal',       voice: 'consented', sample: '0:31', risk: 'low',    result: 'resisted',    resistance: 88, last: 'Hace 6 días' },
    { id: 'u6', name: 'Joaquín Méndez',   email: 'j.mendez@platanus.org',       dept: 'Soporte',     voice: 'consented', sample: '0:36', risk: 'medium', result: 'resisted',    resistance: 72, last: 'Hace 3 días' },
    { id: 'u7', name: 'Francisca Lara',   email: 'f.lara@platanus.org',         dept: 'Finanzas',    voice: 'expired',   sample: '0:28', risk: 'medium', result: 'reported',    resistance: 58, last: 'Hace 8 días' },
    { id: 'u8', name: 'Tomás Bravo',      email: 'tomas.bravo@platanus.org',    dept: 'Ingeniería',  voice: 'consented', sample: '0:33', risk: 'low',    result: 'resisted',    resistance: 95, last: 'Hace 4 días' },
  ];

  // Per-person channel resistance (for the detail panel scorecard)
  const scorecards = {
    u1: [ ['Nota de audio', 22], ['WhatsApp', 31], ['Llamada en vivo', 18], ['Clon de voz IA', 12], ['Suplantación', 45] ],
    u2: [ ['Nota de audio', 92], ['WhatsApp', 88], ['Llamada en vivo', 95], ['Clon de voz IA', 85], ['Suplantación', 96] ],
    u4: [ ['Nota de audio', 18], ['WhatsApp', 24], ['Llamada en vivo', 30], ['Clon de voz IA', 9],  ['Suplantación', 36] ],
  };

  const campaigns = [
    { id: 'SIR-4821', name: 'Urgencia del CFO',         channel: 'whatsapp', status: 'live',      sent: 24, resisted: 17, compromised: 3, when: 'Ahora' },
    { id: 'SIR-4815', name: 'Verificación de banco',     channel: 'call',     status: 'live',      sent: 12, resisted: 9,  compromised: 1, when: 'Hace 12 min' },
    { id: 'SIR-4790', name: 'Nota de voz de RRHH',       channel: 'audio',    status: 'success',   sent: 31, resisted: 28, compromised: 2, when: 'Ayer' },
    { id: 'SIR-4772', name: 'Soporte TI · reinicio',     channel: 'call',     status: 'success',   sent: 18, resisted: 14, compromised: 4, when: 'Hace 3 días' },
    { id: 'SIR-4760', name: 'Clon de voz · gerencia',    channel: 'audio',    status: 'scheduled', sent: 0,  resisted: 0,  compromised: 0, when: 'En 2 días' },
    { id: 'SIR-4744', name: 'Factura urgente',           channel: 'whatsapp', status: 'draft',     sent: 0,  resisted: 0,  compromised: 0, when: 'Borrador' },
  ];

  const channelMeta = {
    audio:    { icon: 'audio-lines',    label: 'Nota de audio', tone: 'signal' },
    whatsapp: { icon: 'message-circle', label: 'WhatsApp',      tone: 'success' },
    call:     { icon: 'phone-call',     label: 'Llamada',       tone: 'primary' },
  };

  const riskHistory = [520, 512, 498, 505, 470, 455, 460, 432, 418, 410, 397, 385];

  return { people, scorecards, campaigns, channelMeta, riskHistory };
})();
