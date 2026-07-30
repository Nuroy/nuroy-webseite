/* ============================================================
   NUROY — Global Service Data
   Testimonials, service metadata, and icon library
   ============================================================ */

// Global testimonials pool
window.GLOBAL_TESTIMONIALS = {
  sniffys: {
    videoId: 'UvMFGmVZ9U8',
    company: 'Sniffys',
    url: 'https://sniffys.de/',
    tags: ['dashboards', 'software'],
  },
  followaustria: {
    videoId: 'YP-pHyQrUSs',
    company: 'Follow Austria',
    url: 'https://www.followaustria.com/',
    tags: ['dashboards', 'datenintegration'],
  },
  skalieren: {
    videoId: 'Y1GioSyqUCg',
    company: 'Skalieren zur Million',
    url: 'https://www.skalierenzurmillion.org/',
    tags: ['ki-agenten', 'company-ai'],
  },
  nomo: {
    videoId: '_GIMhcR781Y',
    company: 'Nomo',
    url: 'https://www.getnomo.app/',
    tags: ['software', 'ki-integration'],
  },
};

// Service metadata for cross-linking
window.ALL_SERVICES = [
  {
    id: 'dashboards',
    num: '01',
    title: 'Custom Dashboards',
    tagline: 'Daten sichtbar machen.',
    url: '/leistungen/cockpit'
  },
  {
    id: 'ki-agenten',
    num: '02',
    title: 'KI-Agenten & Automatisierungen',
    tagline: 'Routineaufgaben automatisieren.',
    url: '/leistungen/telefon-assistent'
  },
  {
    id: 'software',
    num: '03',
    title: 'Custom Software-Entwicklung',
    tagline: 'Maßgeschneiderte Lösungen.',
    url: '/leistungen/werkstatt'
  },
  {
    id: 'ki-integration',
    num: '04',
    title: 'KI-Integration',
    tagline: 'KI in bestehende Systeme.',
    url: '/leistungen/lead-response'
  },
  {
    id: 'company-ai',
    num: '05',
    title: 'Interne Company-AI',
    tagline: 'Ihr Wissen, ein KI-Assistent.',
    url: '/leistungen/aftersales'
  },
  {
    id: 'datenintegration',
    num: '06',
    title: 'Datenintegration & ETL',
    tagline: 'Datensilos auflösen.',
    url: '/leistungen/standzeiten'
  },
  {
    id: 'strategy-audit',
    num: '07',
    title: 'Strategy & Audit',
    tagline: 'Tech-Stack prüfen.',
    url: '/leistungen/bewertungen'
  },
];

// REMOVED: Icon library now in /shared/icons.js (avoid duplicate window.ICONS definition)
