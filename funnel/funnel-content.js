/* ============================================================
   NUROY FUNNEL: Dashboard Landing Page Content
   Alle Texte zentral, A/B-testbar
   ============================================================ */

window.FUNNEL_CONTENT = {
  hero: {
    eyebrow: 'FÜR UNTERNEHMEN AB 10 MITARBEITERN',
    headline: 'Alle Ihre Daten.\nAn einem Ort.\nIm Überblick.',
    subline: 'Wir bauen das Dashboard, das Ihre Tools endlich zusammenführt.',
    vslId: 'PLACEHOLDER_VIMEO_ID', // User füllt später YouTube/Vimeo-ID ein
    vslType: 'youtube', // 'youtube' oder 'vimeo'
    ctaPrimary: 'Discovery-Call buchen',
    ctaSecondary: 'Wie das aussieht ↓'
  },

  trustBar: {
    text: 'Vertrauen von Unternehmen wie:',
    logos: [
      { src: 'assets/clients/sniffys.png', alt: 'Sniffys' },
      { src: 'assets/clients/nomo.png', alt: 'Nomo' },
      // User kann weitere Logos hinzufügen
    ]
  },

  problem: {
    headline: 'Wenn Ihr Reporting so aussieht …',
    cards: [
      {
        icon: 'document',
        title: 'Excel-Tabellen',
        desc: 'Die niemand mehr aktuell hält'
      },
      {
        icon: 'chart',
        title: '5 Tools, 5 Wahrheiten',
        desc: 'Welcher Zahl vertraut man jetzt?'
      },
      {
        icon: 'clock',
        title: 'Reportings kosten 1 Tag',
        desc: 'Pro Woche. Und sind trotzdem veraltet.'
      }
    ],
    closing: '… dann sind Sie nicht allein. Und Sie sind genau richtig hier.'
  },

  solution: {
    headline: 'So sieht Ihr Dashboard aus.',
    subline: 'Maßgeschneidert. Ihre Daten. Ihr Branding. Ihre KPIs.',
    mockup: 'assets/dashboard-mockup-main.png', // User erstellt später
    variants: [
      { id: 'marketing', label: 'Marketing-Variante', img: 'assets/dashboard-marketing.png' },
      { id: 'sales', label: 'Vertriebs-Variante', img: 'assets/dashboard-sales.png' },
      { id: 'all', label: 'All-in-One', img: 'assets/dashboard-all.png' }
    ],
    caption: 'Beispiel. Jedes Dashboard wird individuell für Sie gebaut.',
    cta: 'Genau das wollen Sie? → Call buchen'
  },

  features: {
    headline: 'Was Ihr Dashboard kann.',
    list: [
      'Verbindung aller Ihrer Tools (CRM, Buchhaltung, Ads, etc.)',
      'Echtzeit-Daten, kein manuelles Updaten mehr',
      'Custom-KPIs nach Ihren Definitionen',
      'Branchenspezifische Module',
      'Multi-Rollen-Views (Geschäftsführung, Vertrieb, Marketing)',
      'Mobile-fähig',
      'DSGVO-konformes Hosting in Deutschland',
      'Dashboard-Reading-Bot (KI beantwortet Fragen zu Ihren Zahlen)',
      'Export als PDF, Excel, automatisierte Reports',
      'Continuous Development: Dashboard wächst mit Ihnen'
    ]
  },

  process: {
    headline: 'Fünf Schritte. 6-10 Wochen. Fertig.',
    steps: [
      {
        num: '01',
        title: 'VERSTEHEN',
        desc: '1-2 Wochen Discovery',
        details: 'Wir analysieren Ihre Tools, KPIs und Workflows.'
      },
      {
        num: '02',
        title: 'KONZIPIEREN',
        desc: '1 Woche Design & Planung',
        details: 'Wir erstellen Wireframes, definieren die Datenstruktur und stimmen das Konzept mit Ihnen ab.'
      },
      {
        num: '03',
        title: 'BAUEN',
        desc: '3-5 Wochen Entwicklung',
        details: 'Sie sehen wöchentlich Fortschritt und können Feedback geben.'
      },
      {
        num: '04',
        title: 'TESTEN',
        desc: '1 Woche Testing & Launch',
        details: 'Wir prüfen alle Datenquellen, laden Stakeholder zum Testen ein und gehen live.'
      },
      {
        num: '05',
        title: 'BLEIBEN',
        desc: 'Hosting & Wartung',
        details: 'Optional: Wir hosten, warten und entwickeln weiter.'
      }
    ]
  },

  testimonials: ['sniffys', 'skalieren'], // IDs aus GLOBAL_TESTIMONIALS

  faq: {
    headline: 'Was uns oft gefragt wird.',
    items: [
      {
        q: 'Was kostet das ungefähr?',
        a: 'Die Kosten hängen vom Umfang und Ihren individuellen Anforderungen ab. Im Discovery-Call besprechen wir Ihr Projekt und erstellen ein passgenaues Angebot.'
      },
      {
        q: 'Wie lange dauert das Projekt?',
        a: 'Die Projektdauer variiert je nach Komplexität und Anforderungen. Im Discovery-Call erstellen wir einen konkreten Zeitplan für Ihr Dashboard.'
      },
      {
        q: 'Welche Tools könnt ihr anbinden?',
        a: 'Alles mit API: Salesforce, HubSpot, Shopify, Google Analytics, Meta Ads, Stripe, eigene Datenbanken, ERPs, und vieles mehr. Im Discovery-Call schauen wir, was Sie nutzen.'
      },
      {
        q: 'Was passiert, wenn wir Tools wechseln?',
        a: 'Wir bauen das Dashboard so, dass neue Tools einfach integriert werden können. Bei Tool-Wechsel: 1-2 Wochen für Anbindung der neuen Quelle.'
      },
      {
        q: 'Wo werden unsere Daten gehostet?',
        a: 'In Deutschland (Frankfurt), DSGVO-konform. Alternativ: On-Premise bei Ihnen, wenn gewünscht.'
      },
      {
        q: 'Was, wenn wir das selbst bauen wollen?',
        a: 'Macht Sinn, wenn Sie ein internes Dev-Team haben. Wir können auch nur die Discovery machen & eine Tech-Spec liefern (2 Wochen, 5.000€).'
      }
    ]
  },

  disqualifier: {
    headline: 'Wann wir NICHT die Richtigen sind.',
    points: [
      'Wenn Sie unter 10 Mitarbeitern haben, dann reicht Power BI.',
      'Wenn Sie nur ein einzelnes Tool reporten, dann tut es Looker Studio.',
      'Wenn Sie unter 12.500 € Budget haben, dann sind wir zu teuer.',
      'Wenn Sie in 2 Wochen live gehen müssen, dann sind wir zu langsam.'
    ]
  },

  finalCTA: {
    headline: 'Bereit, das zu bauen?',
    subtext: '30 Minuten Erstgespräch. Kostenlos. Konkret.',
    calendlyUrl: 'PLACEHOLDER_CALENDLY_URL', // User füllt später aus
    trustPoints: [
      '✓ Keine Verkaufsmasche',
      '✓ Konkrete Antworten auf Ihre Situation',
      '✓ Wenn es nicht passt, sagen wir\'s offen'
    ]
  }
};
