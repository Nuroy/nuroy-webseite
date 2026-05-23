// Centralized content data for all service pages
// This file contains accordion items, FAQs, and related services for each service

window.SERVICE_CONTENT = {
  'dashboards': {
    meta: {
      number: '01',
      total: '07',
      title: 'Dashboards',
      tagline: 'Echtzeit-Daten. Bessere Entscheidungen.',
    },
    problemCards: [
      { icon: 'chart-bar', title: 'Excel-Chaos', desc: 'Ihr erstellt Reports manuell und verliert Stunden mit Copy-Paste.' },
      { icon: 'clock', title: 'Veraltete Daten', desc: 'Bis die Zahlen fertig sind, sind sie schon überholt.' },
      { icon: 'users', title: 'Keine gemeinsame Wahrheit', desc: 'Jedes Team hat andere Zahlen – wem glauben?' }
    ],
    hero: {
      headline: 'Dashboards',
      subline: 'Alle Daten. Eine Wahrheit. Keine Verzögerung.',
    },
    showcaseTitle: 'Was sind Custom Dashboards?',
    showcaseSubtitle: 'Dashboards, die alle eure Datenquellen verbinden und in Echtzeit visualisieren – für schnellere, datenbasierte Entscheidungen.',
    kpis: [
      { value: '80%', label: 'Zeitersparnis', icon: 'clock', background: 'gradient' },
      { value: '100%', label: 'Echtzeit-Daten', icon: 'lightning', background: 'gradient' },
      { value: '1', label: 'Eine Wahrheit', icon: 'target', background: 'gradient' },
      { value: '10x', label: 'Schnellere Insights', icon: 'brain', background: 'gradient' }
    ],
    benefitCards: [
      { number: '80%', label: 'Zeitersparnis', desc: 'Kein manuelles Copy-Paste mehr', icon: 'clock' },
      { number: '100%', label: 'Echtzeit', desc: 'Immer aktuelle Daten', icon: 'lightning' },
      { number: '1', label: 'Eine Wahrheit', desc: 'Keine widersprüchlichen Zahlen', icon: 'target' },
      { number: '10x', label: 'Schnellere Insights', desc: 'Entscheidungen in Sekunden', icon: 'brain' },
      { number: 'Alle', label: 'Datenquellen', desc: 'CRM, ERP, Ads, GA4 verbunden', icon: 'workflow' },
      { number: '∞', label: 'Volle Transparenz', desc: 'Jeder sieht die gleichen Zahlen', icon: 'security' }
    ],
    features: [
      'Verbindung aller Ihrer Tools (CRM, Buchhaltung, Ads, etc.)',
      'Echtzeit-Daten — kein manuelles Updaten mehr',
      'Custom-KPIs nach Ihren Definitionen',
      'Multi-Rollen Views (Geschäftsführung, Marketing, Vertrieb)',
      'Branchenspezifische Module',
      'Mobile-fähig und responsive',
      'DSGVO-konformes Hosting in Deutschland',
      'Dashboard-Reading-Bot (KI beantwortet Fragen zu Ihren Zahlen)',
      'Export als PDF, Excel, automatisierte Reports',
      'Continuous Development — Dashboard wächst mit Ihnen'
    ],
    roiHeadline: 'Der ROI Ihres Dashboards.',
    roiSubline: 'Weniger Zeit für Reporting. Mehr Zeit für Wachstum.',
    hasDataFlow: true,
    hasWaveBackground: true,
    serviceTypes: [
      {
        title: 'Finance Dashboard',
        desc: 'Komplettes Finance-Reporting mit Revenue, Expenses, Cash Flow und Forecasting',
        image: '../assets/services/dashboards/capability-finance.svg',
        tag: 'Finance',
        icon: 'currency-euro',
        detailedDesc: 'Ein Dashboard, das alle finanziellen KPIs in Echtzeit anzeigt – von Umsatz über Kosten bis Cashflow-Prognosen.',
        features: [
          'Revenue & Profit-Tracking in Echtzeit',
          'Expense-Breakdown nach Kategorien',
          'Cash Flow Forecasting',
          'Automatische Rechnungs-Synchronisation (DATEV, sevDesk)',
          'Budget vs. Actual Vergleiche',
          'Executive Summary für Management'
        ]
      },
      {
        title: 'Marketing Dashboard',
        desc: 'Performance aller Marketing-Kanäle: Google Ads, Meta Ads, LinkedIn, Organic Traffic',
        image: '../assets/services/dashboards/capability-marketing.svg',
        tag: 'Marketing',
        icon: 'megaphone',
        detailedDesc: 'Alle Marketing-Metriken an einem Ort – von Ad Spend über Conversions bis ROAS und Attribution.',
        features: [
          'Multi-Channel Attribution (First-Touch, Last-Touch, Linear)',
          'Ad Spend & ROAS Tracking',
          'Conversion-Funnel-Visualisierung',
          'Google Analytics 4 Integration',
          'Social Media Performance (Meta, LinkedIn, TikTok)',
          'SEO & Organic Traffic Monitoring'
        ]
      },
      {
        title: 'Sales Dashboard',
        desc: 'CRM-Daten live: Pipeline, Conversion-Rates, Deal-Velocity, Sales-Team-Performance',
        image: '../assets/services/dashboards/capability-sales.svg',
        tag: 'Vertrieb',
        icon: 'presentation-chart-line',
        detailedDesc: 'Ein Sales-Dashboard, das eure Pipeline visualisiert und Team-Performance in Echtzeit zeigt.',
        features: [
          'Pipeline-Visualisierung nach Stages',
          'Win-Rate & Deal-Velocity-Tracking',
          'Sales-Team Performance-Ranking',
          'CRM-Integration (HubSpot, Salesforce, Pipedrive)',
          'Forecast vs. Actual Revenue',
          'Lead-Source-Attribution'
        ]
      },
      {
        title: 'Operations Dashboard',
        desc: 'Operative KPIs: Inventory, Fulfillment, Support-Tickets, System-Health',
        image: '../assets/services/dashboards/capability-ops.svg',
        tag: 'Operations',
        icon: 'cog-6-tooth',
        detailedDesc: 'Operational Excellence durch Echtzeit-Monitoring von Inventory, Fulfillment und Support-Performance.',
        features: [
          'Inventory-Levels & Stock-Alerts',
          'Order-Fulfillment-Status',
          'Support-Ticket-Volume & Response-Time',
          'System-Health-Monitoring (Uptime, Performance)',
          'Team-Productivity-Metriken',
          'Process-Bottleneck-Analyse'
        ]
      },
      {
        title: 'Customer Dashboard',
        desc: 'Customer-Insights: Churn-Risk, LTV, Engagement-Score, Retention-Metriken',
        image: '../assets/services/dashboards/capability-customer.svg',
        tag: 'CX',
        icon: 'users',
        detailedDesc: 'Ein Dashboard, das Customer-Health zeigt und Churn-Risiken frühzeitig erkennt.',
        features: [
          'Customer Lifetime Value (LTV) Tracking',
          'Churn-Prediction mit ML-Modellen',
          'Customer-Engagement-Score',
          'Retention-Rate nach Cohorts',
          'NPS & CSAT-Tracking',
          'Customer-Journey-Visualisierung'
        ]
      },
      {
        title: 'Executive Dashboard',
        desc: 'C-Level-Überblick: Top-Level-KPIs, Cross-Functional-Metriken, Strategic-Goals',
        image: '../assets/services/dashboards/capability-executive.svg',
        tag: 'Management',
        icon: 'chart-bar',
        detailedDesc: 'Das All-in-One-Dashboard für die Geschäftsführung – alle wichtigen Metriken auf einen Blick.',
        features: [
          'Cross-Functional KPI-Overview',
          'Strategic-Goal-Tracking (OKRs)',
          'Revenue, Profit, Cash Flow Summary',
          'Team-Performance-Overview',
          'Custom-Alerts für kritische Metriken',
          'One-Click Export für Board-Meetings'
        ]
      }
    ],
    forWho: {
      yes: [
        'Daten sind über viele Tools verteilt',
        'Reports werden manuell in Excel erstellt',
        'Entscheidungen dauern zu lange wegen fehlender Daten',
        'Euer Team braucht Echtzeit-Zugriff auf KPIs'
      ],
    },
    faq: [
      { q: 'Wie lange dauert die Entwicklung?', a: '3-6 Wochen für ein Standard-Dashboard mit 5-10 Datenquellen. Komplexere Multi-Team-Dashboards können 8-12 Wochen dauern.' },
      { q: 'Welche Datenquellen könnt ihr anbinden?', a: 'Praktisch alles: Google Analytics, CRMs, ERPs, Datenbanken, CSV-Files, APIs. Wenn es Daten hat, können wir es anbinden.' },
      { q: 'Wie lange dauert die Implementierung?', a: 'Die meisten Dashboard-Projekte sind in 6-10 Wochen live. Wir arbeiten in agilen Sprints mit regelmäßigen Updates, sodass ihr den Fortschritt immer sehen könnt.' },
      { q: 'Können wir das Dashboard selbst anpassen?', a: 'Ja – wir bauen einen Admin-Bereich, in dem ihr KPIs, Visualisierungen und Filter anpassen könnt, ohne Code.' },
    ],
    processHeadline: 'Fünf Schritte. 6-10 Wochen. Fertig.',
    processSteps: [
      {
        num: '01',
        title: 'VERSTEHEN',
        desc: '1-2 Wochen Discovery',
        content: 'Wir analysieren eure Tools, KPIs und Datenquellen. Welche Systeme gibt es? Was sind die wichtigsten Metriken?'
      },
      {
        num: '02',
        title: 'KONZIPIEREN',
        desc: '1 Woche Design',
        content: 'Wireframes für jedes Dashboard-Modul. Definition der Datenstruktur und API-Endpoints.'
      },
      {
        num: '03',
        title: 'BAUEN',
        desc: '3-5 Wochen Entwicklung',
        content: 'Datenintegration + Frontend-Entwicklung. Eure Datenquellen werden verbunden und die Visualisierungen gebaut.'
      },
      {
        num: '04',
        title: 'TESTEN',
        desc: '1-2 Wochen Testing',
        content: 'User Testing mit eurem Team. Feedback-Runden und Optimierung der UX.'
      },
      {
        num: '05',
        title: 'LAUNCHEN',
        desc: 'Go-Live + Support',
        content: 'Deployment, Schulung eures Teams, 4 Wochen Hyper-Care Support.'
      }
    ],
    related: ['datenintegration', 'ki-agenten', 'company-ai', 'software'],
  },

  'ki-agenten': {
    meta: {
      number: '02',
      total: '07',
      title: 'KI-Agenten',
      tagline: 'Automatisierung mit künstlicher Intelligenz',
    },
    hero: {
      headline: 'KI-Agenten',
      subline: 'Intelligente Automatisierung. 24/7 verfügbar. Endlich skalierbar.',
    },
    kpis: [
      { value: '24/7', label: 'Verfügbarkeit', icon: 'clock', background: 'gradient' },
      { value: '90%', label: 'Automatisierung', icon: 'robot', background: 'gradient' },
      { value: '3x', label: 'Schnellere Reaktion', icon: 'speed', background: 'gradient' },
      { value: '95%', label: 'Genauigkeit', icon: 'target', background: 'gradient' }
    ],
    benefitCards: [
      { number: '24/7', label: 'Verfügbarkeit', desc: 'Arbeitet Tag und Nacht', icon: 'clock' },
      { number: '90%', label: 'Automatisierung', desc: 'Repetitive Tasks übernommen', icon: 'robot' },
      { number: '3x', label: 'Schnellere Reaktion', desc: 'Sofort-Antworten für Kunden', icon: 'speed' },
      { number: '95%', label: 'Genauigkeit', desc: 'Präzise Qualifizierung', icon: 'target' },
      { number: '100%', label: 'Skalierbar', desc: 'Unbegrenzte Anfragen gleichzeitig', icon: 'workflow' },
      { number: 'Smart', label: 'Lernt kontinuierlich', desc: 'Wird mit der Zeit besser', icon: 'brain' }
    ],
    features: [
      'Multi-Channel Support (Chat, Email, WhatsApp)',
      'Automatische Ticket-Erstellung und -Kategorisierung',
      'Wissensdatenbank-Integration',
      'Intelligentes Eskalations-Management',
      'Mehrsprachiger Support',
      'Sentiment-Analyse',
      'CRM-Integration (HubSpot, Salesforce, Pipedrive)',
      'DSGVO-konforme Verarbeitung',
      'Custom Workflows und Decision Trees',
      'Performance Analytics und Reporting'
    ],
    roiHeadline: 'Der ROI Ihrer KI-Agenten.',
    roiSubline: 'Weniger Support-Anfragen an Ihr Team. Mehr qualifizierte Leads.',
    problemCards: [
      { icon: 'clock', title: 'Support überlastet', desc: 'Euer Team ertrinkt in Anfragen, besonders nachts und am Wochenende.' },
      { icon: 'users', title: 'Leads verpassen', desc: 'Qualifizierte Leads werden nicht schnell genug kontaktiert und springen ab.' },
      { icon: 'chart-bar', title: 'Manuelle Arbeit', desc: 'Repetitive Aufgaben rauben Zeit für strategische Arbeit.' }
    ],
    hasWaveBackground: true,
    showcaseTitle: 'Was sind KI-Agenten?',
    showcaseSubtitle: 'KI-Agenten übernehmen repetitive Aufgaben, qualifizieren Leads, beantworten Support-Anfragen und analysieren Daten – automatisch und intelligent.',
    serviceTypes: [
      {
        title: 'Lead Qualification Agent',
        desc: 'Automatische Qualifizierung eingehender Leads basierend auf definierten Kriterien',
        image: '../assets/services/ki-agenten/capability-lead-qualification.svg',
        tag: 'Vertrieb',
        icon: 'users',
        detailedDesc: 'Der Lead Qualification Agent bewertet eingehende Leads automatisch und leitet qualifizierte Leads direkt an euer Vertriebsteam weiter.',
        features: [
          'Automatisches Lead-Scoring nach individuellen Kriterien',
          'CRM-Integration (HubSpot, Salesforce, Pipedrive)',
          'Echtzeit-Benachrichtigungen für Hot Leads',
          'Automatische Weiterleitung an passende Vertriebler',
          'Konversations-History und Lead-Profiling',
          'Custom Qualifizierungs-Workflows'
        ]
      },
      {
        title: 'Customer Support Agent',
        desc: '24/7 Kundensupport mit natürlicher Sprachverarbeitung und kontextuellem Verständnis',
        image: '../assets/services/ki-agenten/capability-customer-support.svg',
        tag: 'CX',
        icon: 'chat-bubble-bottom-center-text',
        detailedDesc: 'Ein KI-Support-Agent, der häufige Fragen beantwortet, Tickets erstellt und bei komplexen Anfragen an Menschen eskaliert.',
        features: [
          'Multi-Channel Support (Chat, Email, WhatsApp)',
          'Automatische Ticket-Erstellung und -Kategorisierung',
          'Wissensdatenbank-Integration und Semantic Search',
          'Intelligentes Eskalations-Management',
          'Mehrsprachiger Support (Deutsch, Englisch, +)',
          'Sentiment-Analyse und Kundenzufriedenheits-Tracking'
        ]
      },
      {
        title: 'Sales Assistant Agent',
        desc: 'Unterstützt Vertriebsteams mit intelligenten Insights, Meeting-Vorbereitung und Follow-up-Automatisierung',
        image: '../assets/services/ki-agenten/capability-sales-assistant.svg',
        tag: 'Vertrieb',
        icon: 'presentation-chart-line',
        detailedDesc: 'Ein KI-Assistent, der euer Sales-Team bei Meetings vorbereitet, Follow-ups automatisiert und Deal-Chancen analysiert.',
        features: [
          'Automatische Meeting-Vorbereitung mit Account-Research',
          'Follow-up Email-Automatisierung mit Personalisierung',
          'Deal-Tracking und Win-Probability-Scoring',
          'Automatische Angebotserstellung aus Templates',
          'Next-Best-Action-Empfehlungen',
          'Integration mit Sales-Tools (CRM, Calendar, Email)'
        ]
      },
      {
        title: 'Data Analysis Agent',
        desc: 'Automatische Datenanalyse, Anomalie-Erkennung und Reporting für schnellere Entscheidungen',
        image: '../assets/services/ki-agenten/capability-data-analysis.svg',
        tag: 'Operations',
        icon: 'chart-bar',
        detailedDesc: 'Ein KI-Agent, der eure Daten kontinuierlich analysiert, Trends erkennt und automatisch Reports generiert.',
        features: [
          'Automatische Reports nach Schedule',
          'Anomalie-Erkennung und Proactive Alerts',
          'Predictive Analytics und Forecasting',
          'Custom Dashboards mit Natural Language Queries',
          'Multi-Source Data Integration',
          'Executive Summaries mit Key Insights'
        ]
      },
      {
        title: 'Workflow Automation Agent',
        desc: 'Automatisierung wiederkehrender Geschäftsprozesse über mehrere Systeme hinweg',
        image: '../assets/services/ki-agenten/capability-workflow-automation.svg',
        tag: 'Operations',
        icon: 'cog-6-tooth',
        detailedDesc: 'Ein Agent, der komplexe Workflows automatisiert – von Datenübertragung bis hin zu mehrstufigen Approval-Prozessen.',
        features: [
          'Event-basierte Prozess-Trigger',
          'Multi-System Integration (API, Webhooks)',
          'Intelligentes Error Handling und Retry-Logic',
          'Monitoring & Logs für Transparenz',
          'Conditional Logic und Decision Trees',
          'Human-in-the-Loop bei kritischen Schritten'
        ]
      },
    ],
    forWho: {
      yes: [
        'Euer Team verbringt Stunden mit repetitiven Aufgaben',
        'Leads werden nicht schnell genug qualifiziert und kontaktiert',
        'Support-Anfragen überfordern euer Team, besonders außerhalb der Geschäftszeiten',
        'Ihr wollt schneller auf Daten reagieren, aber manuelle Analyse dauert zu lange'
      ],
    },
    faq: [
      { q: 'Wie lange dauert die Entwicklung eines KI-Agenten?', a: '4-8 Wochen für einen MVP-Agenten mit Basisfeatures. Komplexere Agenten mit mehreren Integrationen können 10-12 Wochen dauern.' },
      { q: 'Welche Systeme können KI-Agenten anbinden?', a: 'Praktisch alles mit API: CRMs (HubSpot, Salesforce), Support-Tools (Zendesk, Intercom), Email, WhatsApp, Slack, eigene Datenbanken und mehr.' },
      { q: 'Wie sicher sind KI-Agenten mit unseren Daten?', a: 'Höchste Sicherheit: DSGVO-konforme Verarbeitung, verschlüsselte Datenübertragung, keine Datenweitergabe. Optional On-Premise-Hosting möglich.' },
    ],
    related: ['ki-integration', 'company-ai', 'dashboards', 'datenintegration'],
  },

  'software': {
    meta: {
      number: '03',
      total: '07',
      title: 'Software-Entwicklung',
      tagline: 'Maßgeschneiderte Software für euer Business',
    },
    hero: {
      headline: 'Software-Entwicklung',
      subline: 'Custom Software. Perfekt auf euer Business zugeschnitten.',
    },
    kpis: [
      { value: '100%', label: 'Custom-Made', icon: 'cog', background: 'gradient' },
      { value: 'Full', label: 'Code-Zugriff', icon: 'code', background: 'gradient' },
      { value: '∞', label: 'Skalierbar', icon: 'chart-bar', background: 'gradient' },
      { value: 'Modern', label: 'Tech Stack', icon: 'lightning', background: 'gradient' }
    ],
    benefitCards: [
      { number: '100%', label: 'Custom-Made', desc: 'Perfekt auf Ihre Prozesse', icon: 'cog' },
      { number: 'Full', label: 'Code-Zugriff', desc: 'Ihr besitzt den kompletten Code', icon: 'code' },
      { number: '∞', label: 'Skalierbar', desc: 'Wächst mit Ihrem Business', icon: 'chart-bar' },
      { number: 'Modern', label: 'Tech Stack', desc: 'React, Next.js, Node.js', icon: 'lightning' },
      { number: 'Fast', label: 'Performance', desc: 'Optimiert für Geschwindigkeit', icon: 'speed' },
      { number: '0', label: 'Vendor Lock-In', desc: 'Volle Kontrolle und Freiheit', icon: 'security' }
    ],
    features: [
      'Maßgeschneiderte Entwicklung nach Ihren Anforderungen',
      'Full Stack Development (Frontend, Backend, Mobile)',
      'Kompletter Source Code Ownership',
      'Modern Tech Stack (React, Next.js, Node.js, Python)',
      'Skalierbare Cloud-Architektur (AWS, Vercel)',
      'API-First Design für Flexibilität',
      'Responsive Design für alle Geräte',
      'CI/CD Pipeline für schnelle Updates',
      'Umfassende Dokumentation',
      'Training und Onboarding Ihres Teams'
    ],
    roiHeadline: 'Der ROI Ihrer Custom Software.',
    roiSubline: 'Keine Kompromisse. Keine Lizenzgebühren. Volle Kontrolle.',
    problemCards: [
      { icon: 'puzzle', title: 'Standard passt nicht', desc: 'Off-the-shelf-Software erzwingt Kompromisse bei euren Prozessen.' },
      { icon: 'cog', title: 'Legacy-System', desc: 'Alte Software bremst euch aus und ist teuer in der Wartung.' },
      { icon: 'security', title: 'Vendor Lock-In', desc: 'Ihr seid abhängig von einem Anbieter und habt keine Kontrolle.' }
    ],
    hasWaveBackground: true,
    showcaseTitle: 'Was für Software entwickeln wir?',
    showcaseSubtitle: 'Von Customer Portals über E-Commerce bis hin zu Mobile Apps – wir entwickeln Software, die zu euren Prozessen passt. Keine Kompromisse.',
    serviceTypes: [
      {
        title: 'Customer Portals',
        desc: 'Self-Service Portale für Kunden mit Login, Dokumenten-Management und Support-Integration',
        image: '../assets/services/software/capability-portal.svg',
        tag: 'CX',
        icon: 'users',
        detailedDesc: 'Ein Kundenportal, das eure Kunden befähigt, Informationen selbst abzurufen, Dokumente zu verwalten und Support-Anfragen zu stellen.',
        features: [
          'Sichere User Authentication mit 2FA',
          'Dokumenten-Management und Download-Center',
          'Support-Integration (Ticket-Erstellung)',
          'Mobile-Optimiert und Responsive',
          'Custom Branding und White-Label-Optionen',
          'SSO-Integration (Single Sign-On)'
        ]
      },
      {
        title: 'Internal Tools & Admin Panels',
        desc: 'Maßgeschneiderte Tools für interne Prozesse, Verwaltung und Team-Workflows',
        image: '../assets/services/software/capability-admin.svg',
        tag: 'Operations',
        icon: 'cog-6-tooth',
        detailedDesc: 'Admin-Panels und interne Tools, die eure Team-Workflows beschleunigen – von User-Management bis Batch-Operationen.',
        features: [
          'Granulares Rollen- und Rechte-Management',
          'Batch-Operationen für effiziente Verwaltung',
          'Audit Logs für Compliance und Nachvollziehbarkeit',
          'Custom Workflows und Approval-Prozesse',
          'Datenimport/-export mit Validierung',
          'Dashboard-Integration für Echtzeit-Übersicht'
        ]
      },
      {
        title: 'E-Commerce & Booking Systems',
        desc: 'Online-Shop und Buchungssysteme mit Payment-Integration, Inventory-Management und Order-Tracking',
        image: '../assets/services/software/capability-ecommerce.svg',
        tag: 'Vertrieb',
        icon: 'shopping-cart',
        detailedDesc: 'Vollständige E-Commerce- und Buchungs-Lösungen – von Produktkatalog bis Checkout, Payment und Fulfillment.',
        features: [
          'Payment Gateway Integration (Stripe, PayPal, Klarna)',
          'Inventory Management mit Stock-Alerts',
          'Order Tracking und Status-Updates',
          'Customer Accounts mit Order History',
          'Multi-Currency und Multi-Language Support',
          'Integration mit Versanddienstleistern (DHL, UPS)'
        ]
      },
      {
        title: 'Mobile Apps (iOS & Android)',
        desc: 'Native oder Cross-Platform Apps für iOS und Android mit Push Notifications und Offline-Modus',
        image: '../assets/services/software/capability-mobile.svg',
        tag: 'Marketing',
        icon: 'device-phone-mobile',
        detailedDesc: 'Mobile Apps, die eure Kunden lieben – mit nativer Performance, Offline-Funktionalität und seamless UX.',
        features: [
          'Push Notifications für User-Engagement',
          'Offline-Modus mit Sync bei Online-Rückkehr',
          'Biometric Authentication (Face ID, Touch ID)',
          'App Store und Google Play Deployment',
          'In-App-Käufe und Subscription-Management',
          'Analytics und Crash-Reporting'
        ]
      },
      {
        title: 'API & Backend Services',
        desc: 'Skalierbare Backend-Infrastruktur und REST/GraphQL APIs für eure Frontend- und Mobile-Apps',
        image: '../assets/services/software/capability-api.svg',
        tag: 'Operations',
        icon: 'code-bracket',
        detailedDesc: 'Robuste Backend-Services und APIs, die skalieren – mit Auto-Scaling, Monitoring und umfassender Dokumentation.',
        features: [
          'Auto-Scaling für Traffic-Spitzen',
          'Rate Limiting und DDoS-Schutz',
          'Umfassende API-Dokumentation (OpenAPI/Swagger)',
          'Monitoring und Alerting (Uptime, Performance)',
          'Caching-Layer für optimale Performance',
          'CI/CD-Pipeline für schnelle Deployments'
        ]
      },
    ],
    forWho: {
      yes: [
        'Standard-Software passt nicht zu euren Prozessen',
        'Ihr braucht eine Lösung, die mit eurem Business wächst',
        'Eure Kunden oder Mitarbeiter brauchen ein eigenes Portal oder Tool',
        'Ihr wollt volle Kontrolle über Features und Daten'
      ],
    },
    faq: [
      { q: 'Wie lange dauert die Entwicklung?', a: '6-12 Wochen für ein MVP mit Kernfunktionen. Größere Projekte mit komplexen Features können 3-6 Monate dauern.' },
      { q: 'Welche Technologien nutzt ihr?', a: 'Modern und bewährt: React, Next.js, Node.js, Python, PostgreSQL, AWS/Vercel. Wir wählen die beste Technologie für euer Projekt.' },
      { q: 'Welchen Support bekomme ich nach Launch?', a: 'Nach dem Launch bekommt ihr 4 Wochen Hyper-Care Support inklusive. Danach bieten wir flexible Wartungspakete – von monatlichem Support bis On-Demand-Hilfe.' },
      { q: 'Bekomme ich den Code?', a: 'Ja – ihr bekommt den kompletten Source Code, Dokumentation und könnt jederzeit selbst weiterentwickeln oder uns beauftragen.' },
    ],
    processHeadline: 'Fünf Schritte. 8-16 Wochen. Fertig.',
    processSteps: [
      {
        num: '01',
        title: 'DISCOVERY',
        desc: '2-3 Wochen',
        content: 'Requirements Engineering, User Stories, technische Architektur-Planung.'
      },
      {
        num: '02',
        title: 'DESIGN',
        desc: '2 Wochen',
        content: 'UI/UX Design, Wireframes, Prototyping, Design System.'
      },
      {
        num: '03',
        title: 'ENTWICKLUNG',
        desc: '4-10 Wochen',
        content: 'Agile Sprints, wöchentliche Demos, kontinuierliches Testing.'
      },
      {
        num: '04',
        title: 'TESTING',
        desc: '1-2 Wochen',
        content: 'QA Testing, Security Audit, Performance Optimization.'
      },
      {
        num: '05',
        title: 'LAUNCH',
        desc: 'Go-Live',
        content: 'Deployment, Dokumentation, Training, Ongoing Support.'
      }
    ],
    related: ['datenintegration', 'ki-integration', 'dashboards', 'ki-agenten'],
  },

  'ki-integration': {
    meta: {
      number: '04',
      total: '07',
      title: 'KI-Integration',
      tagline: 'KI in bestehende Systeme integrieren',
    },
    problemCards: [
      { icon: 'document-text', title: 'Dokumenten-Chaos', desc: 'Rechnungen und Verträge werden manuell verarbeitet – fehleranfällig und langsam.' },
      { icon: 'chart-bar', title: 'Keine Vorhersagen', desc: 'Ihr trefft Entscheidungen auf Bauchgefühl statt Daten.' },
      { icon: 'cog', title: 'KI-Potenzial ungenutzt', desc: 'Ihr wisst, KI könnte helfen – aber nicht wo anfangen.' }
    ],
    hero: {
      headline: 'KI-Integration',
      subline: 'KI-Power für eure bestehenden Tools. Nahtlos integriert.',
    },
    kpis: [
      { value: 'Smart', label: 'Verarbeitung', icon: 'brain', background: 'gradient' },
      { value: 'DSGVO', label: 'Konform', icon: 'security', background: 'gradient' },
      { value: '99%', label: 'Genauigkeit', icon: 'target', background: 'gradient' },
      { value: 'Schnell', label: 'Training', icon: 'speed', background: 'gradient' }
    ],
    benefitCards: [
      { number: 'Smart', label: 'Verarbeitung', desc: 'Intelligente Datenanalyse', icon: 'brain' },
      { number: 'DSGVO', label: 'Konform', desc: 'Sichere Datenverarbeitung', icon: 'security' },
      { number: '99%', label: 'Genauigkeit', desc: 'Präzise Vorhersagen', icon: 'target' },
      { number: 'Fast', label: 'Training', desc: 'Schnell einsatzbereit', icon: 'speed' },
      { number: 'Auto', label: 'Document Processing', desc: 'OCR, Klassifizierung, Extraktion', icon: 'document' },
      { number: 'API', label: 'Ready', desc: 'Nahtlose Integration', icon: 'workflow' }
    ],
    features: [
      'Document Intelligence (OCR, Klassifizierung, Daten-Extraktion)',
      'Conversational AI (Chatbots, Voice Assistants)',
      'Predictive Analytics (Churn, Forecasting, Risk)',
      'Computer Vision (Quality Control, Object Detection)',
      'Custom Model Fine-Tuning auf Ihre Daten',
      'Multi-Language Support',
      'Real-time Processing',
      'API-Integration in bestehende Systeme',
      'DSGVO-konforme Verarbeitung',
      'Performance Monitoring und Retraining'
    ],
    roiHeadline: 'Der ROI Ihrer KI-Integration.',
    roiSubline: 'Intelligente Automatisierung. Präzisere Entscheidungen. Schnellere Prozesse.',
    hasDataFlow: true,
    hasWaveBackground: true,
    showcaseTitle: 'Wie integrieren wir KI?',
    showcaseSubtitle: 'Von Document Intelligence bis Predictive Analytics – wir integrieren KI-Funktionen direkt in eure bestehenden Systeme und Workflows.',
    serviceTypes: [
      {
        title: 'Document Intelligence',
        desc: 'Automatische Dokumentenverarbeitung, OCR, Klassifizierung und Daten-Extraktion mit KI',
        image: '../assets/services/ki-integration/capability-document.svg',
        tag: 'Operations',
        icon: 'document-text',
        detailedDesc: 'KI-gestützte Dokumentenverarbeitung, die Rechnungen, Verträge und Formulare automatisch verarbeitet und strukturiert.',
        features: [
          'OCR und automatische Daten-Extraktion',
          'Dokumenten-Klassifizierung (Rechnung, Vertrag, etc.)',
          'Daten-Validierung und Plausibilitätsprüfung',
          'Workflow-Integration (ERP, DMS)',
          'Multi-Format-Support (PDF, Bild, Scan)',
          'DSGVO-konforme Verarbeitung'
        ]
      },
      {
        title: 'Conversational AI',
        desc: 'Chatbots und Voice Assistants mit natürlicher Sprachverarbeitung und kontextuellem Verständnis',
        image: '../assets/services/ki-integration/capability-conversational.svg',
        tag: 'CX',
        icon: 'chat-bubble-bottom-center-text',
        detailedDesc: 'Intelligente Chatbots, die natürliche Konversationen führen, Kontext verstehen und in eure Systeme integriert sind.',
        features: [
          'Multi-Language Support (Deutsch, Englisch, +)',
          'Context-Awareness über mehrere Nachrichten',
          'Intent Recognition und Entity Extraction',
          'CRM-Integration für personalisierte Antworten',
          'Handoff zu menschlichen Agents bei Bedarf',
          'Voice-Support (Speech-to-Text, Text-to-Speech)'
        ]
      },
      {
        title: 'Predictive Analytics',
        desc: 'Vorhersagemodelle für Churn, Demand Forecasting, Risk Assessment und bessere Entscheidungen',
        image: '../assets/services/ki-integration/capability-predictive.svg',
        tag: 'Finance',
        icon: 'presentation-chart-line',
        detailedDesc: 'Machine Learning Modelle, die aus euren Daten lernen und präzise Vorhersagen für euer Business treffen.',
        features: [
          'Churn Prediction mit Customer Health Scores',
          'Demand Forecasting für Inventory-Planung',
          'Risk Assessment und Fraud Detection',
          'Sales Forecasting und Revenue Prediction',
          'A/B-Test-Analyse und Experiment-Optimierung',
          'Real-time Scoring und API-Integration'
        ]
      },
      {
        title: 'Computer Vision',
        desc: 'Bildverarbeitung und -analyse für Quality Control, Object Detection und Visual Search',
        image: '../assets/services/ki-integration/capability-vision.svg',
        tag: 'Operations',
        icon: 'photo',
        detailedDesc: 'KI-basierte Bildanalyse für automatische Qualitätskontrolle, Objekterkennung und visuelle Suche.',
        features: [
          'Object Detection und Image Classification',
          'Quality Control und Defect Detection',
          'Barcode/QR-Code Reading',
          'Face Recognition und Biometric Auth',
          'Visual Search und Image Similarity',
          'Real-time Processing mit Edge Computing'
        ]
      },
      {
        title: 'AI Model Fine-Tuning',
        desc: 'Anpassung und Training von KI-Modellen auf eure spezifischen Use Cases und Daten',
        image: '../assets/services/ki-integration/capability-finetuning.svg',
        tag: 'Operations',
        icon: 'cog-6-tooth',
        detailedDesc: 'Wir trainieren KI-Modelle auf eure Daten, um maximale Genauigkeit und Relevanz für euren Use Case zu erreichen.',
        features: [
          'Custom Training Data Preparation',
          'Model Fine-Tuning auf euren Domain',
          'A/B-Testing verschiedener Modelle',
          'Performance Monitoring und Retraining',
          'Bias Detection und Fairness-Optimierung',
          'Model Deployment und Scaling'
        ]
      },
    ],
    forWho: {
      yes: [
        'Ihr habt große Mengen unstrukturierter Daten (Dokumente, Bilder, Text)',
        'Manuelle Datenverarbeitung kostet zu viel Zeit',
        'Ihr wollt bessere Vorhersagen für Planung und Entscheidungen',
        'Euer Team braucht KI-Support, aber keine neue Software'
      ],
    },
    faq: [
      { q: 'Wie lange dauert eine KI-Integration?', a: '6-10 Wochen für Standard-Integrationen (OCR, Chatbot). Custom Model Training kann 12-16 Wochen dauern, abhängig von Daten-Verfügbarkeit.' },
      { q: 'Welche KI-Modelle nutzt ihr?', a: 'Je nach Use Case: OpenAI GPT, Claude, Custom ML-Modelle (TensorFlow, PyTorch), OCR-Engines (Tesseract, AWS Textract), Computer Vision (YOLO, ResNet).' },
      { q: 'Können wir mit einem Proof of Concept starten?', a: 'Absolut! Wir empfehlen oft einen 2-Wochen-PoC, um die Machbarkeit zu validieren und erste Ergebnisse zu sehen, bevor ihr in die volle Entwicklung geht.' },
      { q: 'Brauchen wir viele Daten für Custom Models?', a: 'Für Fine-Tuning: Ja, idealerweise 1.000+ gelabelte Beispiele. Für Standard-KI-Features: Nein, Pre-trained Models funktionieren out-of-the-box.' },
    ],
    processHeadline: 'Fünf Schritte. 6-10 Wochen. Fertig.',
    processSteps: [
      {
        num: '01',
        title: 'ANALYSE',
        desc: '1-2 Wochen',
        content: 'Use Case definieren, Daten-Verfügbarkeit prüfen, KI-Modell auswählen.'
      },
      {
        num: '02',
        title: 'PROOF OF CONCEPT',
        desc: '1-2 Wochen',
        content: 'Schneller Prototyp mit Sample Data, Machbarkeit validieren.'
      },
      {
        num: '03',
        title: 'ENTWICKLUNG',
        desc: '3-5 Wochen',
        content: 'Model Training/Fine-Tuning, API-Integration, Frontend bauen.'
      },
      {
        num: '04',
        title: 'TESTING',
        desc: '1 Woche',
        content: 'Genauigkeit messen, Edge Cases testen, User Testing.'
      },
      {
        num: '05',
        title: 'DEPLOYMENT',
        desc: 'Go-Live',
        content: 'Produktiv-Deployment, Monitoring, Continuous Learning Setup.'
      }
    ],
    related: ['ki-agenten', 'company-ai', 'datenintegration', 'software'],
  },

  'company-ai': {
    meta: {
      number: '05',
      total: '07',
      title: 'Company AI',
      tagline: 'Interne KI für euer Unternehmen',
    },
    problemCards: [
      { icon: 'search', title: 'Wissen versteckt', desc: 'Wichtige Infos sind in Notion, Confluence, E-Mails verstreut.' },
      { icon: 'users', title: 'Immer dieselben Fragen', desc: 'Euer Team fragt ständig dasselbe – HR und IT ertrinken in Anfragen.' },
      { icon: 'clock', title: 'Onboarding dauert ewig', desc: 'Neue Mitarbeiter brauchen Wochen, um produktiv zu werden.' }
    ],
    hero: {
      headline: 'Company AI',
      subline: 'Eure eigene KI. Trainiert auf euer Wissen. Nur für euer Team.',
    },
    kpis: [
      { value: 'Your', label: 'Wissen trainiert', icon: 'brain', background: 'gradient' },
      { value: '+50%', label: 'Produktivität', icon: 'users', background: 'gradient' },
      { value: '70%', label: 'Schneller Onboarding', icon: 'clock', background: 'gradient' },
      { value: 'Private', label: 'On-Premise möglich', icon: 'security', background: 'gradient' }
    ],
    benefitCards: [
      { number: 'Your', label: 'Wissen trainiert', desc: 'KI lernt Ihr Unternehmen', icon: 'brain' },
      { number: '+50%', label: 'Produktivität', desc: 'Team arbeitet effizienter', icon: 'users' },
      { number: '70%', label: 'Schneller Onboarding', desc: 'Neue Mitarbeiter produktiv', icon: 'clock' },
      { number: 'Private', label: 'On-Premise möglich', desc: 'Maximale Datensicherheit', icon: 'security' },
      { number: '24/7', label: 'Verfügbar', desc: 'Immer bereit zu helfen', icon: 'robot' },
      { number: 'Smart', label: 'Search', desc: 'Findet jedes Dokument', icon: 'search' }
    ],
    features: [
      'Knowledge Base mit Semantic Search',
      'Internal Chatbot für HR, IT, Onboarding',
      'Process Automation (Document Routing, Approvals)',
      'Analytics & Insights mit AI-Recommendations',
      'Employee Assistant (Calendar, Email, Meeting Notes)',
      'Integration mit Slack, Teams, Google Workspace',
      'Permission-basierter Zugriff',
      'On-Premise Hosting möglich',
      'DSGVO-konforme Verarbeitung',
      'Continuous Learning und Improvement'
    ],
    roiHeadline: 'Der ROI Ihrer Company AI.',
    roiSubline: 'Weniger Fragen an Kollegen. Schnelleres Onboarding. Mehr Produktivität.',
    hasWaveBackground: true,
    showcaseTitle: 'Was ist Company AI?',
    showcaseSubtitle: 'Eine KI, die euer Unternehmenswissen versteht, interne Fragen beantwortet und Prozesse automatisiert – speziell für euer Team.',
    serviceTypes: [
      {
        title: 'Knowledge Base AI',
        desc: 'Zentrale Wissensdatenbank mit KI-gestützter Suche, automatischem Tagging und Content-Vorschlägen',
        image: '../assets/services/company-ai/capability-knowledge.svg',
        tag: 'Operations',
        icon: 'book-open',
        detailedDesc: 'Eine intelligente Wissensdatenbank, die euer gesamtes Unternehmenswissen indexiert und per Semantic Search abrufbar macht.',
        features: [
          'Semantic Search über alle Dokumente',
          'Automatisches Tagging und Kategorisierung',
          'Content Suggestions basierend auf Lücken',
          'Version Control und Change History',
          'Integration mit Google Drive, Notion, Confluence',
          'Permission-basierter Zugriff'
        ]
      },
      {
        title: 'Internal Chatbot',
        desc: 'KI-Assistent für interne Fragen, HR-Themen, IT-Support und Onboarding-Hilfe',
        image: '../assets/services/company-ai/capability-chatbot.svg',
        tag: 'CX',
        icon: 'chat-bubble-bottom-center-text',
        detailedDesc: 'Ein Chatbot, der auf euer Unternehmen trainiert ist und Mitarbeitern bei häufigen Fragen sofort hilft.',
        features: [
          'Company-Specific Training auf eure Docs',
          'HR Integration (Urlaubstage, Benefits, Policies)',
          'IT-Support (Password Reset, Software-Fragen)',
          'Onboarding Helper für neue Mitarbeiter',
          'Multi-Channel (Slack, Teams, Web)',
          'Eskalation zu echten Kollegen bei Bedarf'
        ]
      },
      {
        title: 'Process Automation AI',
        desc: 'KI-gestützte Automatisierung interner Prozesse wie Document Routing, Approvals und Data Entry',
        image: '../assets/services/company-ai/capability-automation.svg',
        tag: 'Operations',
        icon: 'cog-6-tooth',
        detailedDesc: 'Automatisiert repetitive interne Workflows – von Dokumenten-Routing bis zu mehrstufigen Approval-Prozessen.',
        features: [
          'Intelligentes Document Routing basierend auf Inhalt',
          'Approval Workflows mit Smart-Routing',
          'Automatische Data Entry aus Emails/PDFs',
          'Email Classification und Auto-Response',
          'Invoice Processing und Expense Management',
          'Exception Handling mit Human-in-the-Loop'
        ]
      },
      {
        title: 'Analytics & Insights',
        desc: 'Business Intelligence mit KI-generierten Insights, Automated Reporting und Natural Language Queries',
        image: '../assets/services/company-ai/capability-analytics.svg',
        tag: 'Finance',
        icon: 'chart-bar',
        detailedDesc: 'Eine KI, die eure Unternehmensdaten analysiert, Trends erkennt und Insights automatisch generiert.',
        features: [
          'Automated Reporting nach Schedule',
          'Trend Detection und Pattern Recognition',
          'Anomaly Alerts für kritische Metriken',
          'Natural Language Queries (frag deine Daten in Deutsch)',
          'Executive Summaries mit Key Takeaways',
          'Custom Dashboards mit AI-Recommendations'
        ]
      },
      {
        title: 'Employee Assistant',
        desc: 'Persönlicher KI-Assistent für Mitarbeiter: Calendar-Management, Email-Drafting, Meeting-Notes',
        image: '../assets/services/company-ai/capability-assistant.svg',
        tag: 'CX',
        icon: 'users',
        detailedDesc: 'Ein persönlicher KI-Assistent, der jedem Mitarbeiter hilft, produktiver zu werden – von Meeting-Prep bis Task-Priorisierung.',
        features: [
          'Smart Calendar Management und Meeting-Scheduling',
          'Email Drafting und Response-Suggestions',
          'Automatic Meeting Notes und Action Items',
          'Task Prioritization basierend auf Deadlines',
          'Daily Briefings mit anstehenden To-Dos',
          'Integration mit Outlook, Google Calendar, Slack'
        ]
      },
    ],
    forWho: {
      yes: [
        'Euer Team stellt immer wieder dieselben Fragen',
        'Onboarding neuer Mitarbeiter dauert Wochen',
        'Wichtiges Wissen ist über viele Tools verteilt',
        'Ihr wollt interne Prozesse automatisieren, ohne externe KI-Anbieter'
      ],
    },
    faq: [
      { q: 'Wie lange dauert die Implementierung?', a: '8-12 Wochen für eine Company AI mit Knowledge Base und Chatbot. Zusätzliche Features (Process Automation, Analytics) verlängern das Projekt.' },
      { q: 'Wie sicher ist Company AI mit unseren Daten?', a: 'Maximale Sicherheit: On-Premise-Hosting möglich, DSGVO-konform, keine Datenweitergabe an Dritte, verschlüsselte Speicherung und Übertragung.' },
      { q: 'Wie trainieren wir die KI auf unser Unternehmenswissen?', a: 'Wir starten mit einem Daten-Audit: Welche Dokumente, FAQs, Wikis habt ihr? Dann bauen wir eine Pipeline, die alles indexiert. Die KI lernt kontinuierlich dazu – auch nach dem Launch.' },
      { q: 'Kann die KI mit unseren bestehenden Tools integriert werden?', a: 'Ja – wir integrieren mit Slack, Teams, Google Workspace, Notion, Confluence, SharePoint und vielen mehr.' },
    ],
    processHeadline: 'Fünf Schritte. 8-12 Wochen. Fertig.',
    processSteps: [
      {
        num: '01',
        title: 'AUDIT',
        desc: '1-2 Wochen',
        content: 'Analyse eurer Knowledge Base: Wo liegt Wissen? Welche Fragen kommen häufig?'
      },
      {
        num: '02',
        title: 'SETUP',
        desc: '1 Woche',
        content: 'KI-Modell auswählen, Infrastruktur aufsetzen, Daten-Pipeline bauen.'
      },
      {
        num: '03',
        title: 'TRAINING',
        desc: '3-5 Wochen',
        content: 'KI auf eure Daten trainieren, Fine-Tuning, Qualitätssicherung.'
      },
      {
        num: '04',
        title: 'INTEGRATION',
        desc: '2-3 Wochen',
        content: 'Integration in Slack/Teams, Workflow-Automation, User Interface bauen.'
      },
      {
        num: '05',
        title: 'ROLLOUT',
        desc: 'Go-Live',
        content: 'Pilot-Phase mit ausgewählten Teams, Feedback-Loop, Full Rollout.'
      }
    ],
    related: ['ki-integration', 'ki-agenten', 'datenintegration', 'dashboards'],
  },

  'datenintegration': {
    meta: {
      number: '06',
      total: '07',
      title: 'Datenintegration',
      tagline: 'Alle Systeme verbunden. Daten synchronisiert.',
    },
    problemCards: [
      { icon: 'document-duplicate', title: 'Doppelte Arbeit', desc: 'Dieselben Daten werden in 3 verschiedene Tools eingetippt.' },
      { icon: 'exclamation-triangle', title: 'Datenfehler', desc: 'Bei manuellem Copy-Paste passieren Fehler – und niemand merkt es.' },
      { icon: 'clock', title: 'Zeitverschwendung', desc: 'Euer Team verbringt Stunden mit Datenpflege statt strategischer Arbeit.' }
    ],
    hero: {
      headline: 'Datenintegration',
      subline: 'Alle Systeme verbunden. Daten fließen automatisch.',
    },
    kpis: [
      { value: 'Bi-Di', label: 'Sync', icon: 'workflow', background: 'gradient' },
      { value: '0', label: 'Manuelle Arbeit', icon: 'lightning', background: 'gradient' },
      { value: 'Live', label: 'Echtzeit-Updates', icon: 'speed', background: 'gradient' },
      { value: '99.9%', label: 'Uptime', icon: 'security', background: 'gradient' }
    ],
    benefitCards: [
      { number: 'Bi-Di', label: 'Sync', desc: 'Beide Richtungen synchronisiert', icon: 'workflow' },
      { number: '0', label: 'Manuelle Arbeit', desc: 'Keine Copy-Paste mehr', icon: 'lightning' },
      { number: 'Live', label: 'Echtzeit-Updates', desc: 'Immer aktuelle Daten', icon: 'speed' },
      { number: '99.9%', label: 'Uptime', desc: 'Zuverlässige Synchronisation', icon: 'security' },
      { number: 'Alle', label: 'Systeme', desc: 'CRM, ERP, E-Commerce, Marketing', icon: 'cog' },
      { number: 'Auto', label: 'Conflict Resolution', desc: 'Intelligente Konfliktlösung', icon: 'target' }
    ],
    features: [
      'CRM Integration (Salesforce, HubSpot, Pipedrive, Zoho)',
      'ERP & Accounting (DATEV, SAP, Lexware, sevDesk)',
      'Marketing Automation (Mailchimp, ActiveCampaign, Klaviyo)',
      'E-Commerce (Shopify, WooCommerce, Magento)',
      'Bi-Directional Sync in beide Richtungen',
      'Custom Field Mapping',
      'Real-time Updates bei Änderungen',
      'Conflict Resolution bei gleichzeitigen Edits',
      'Bulk Data Import',
      'Monitoring und Error Handling'
    ],
    roiHeadline: 'Der ROI Ihrer Datenintegration.',
    roiSubline: 'Keine manuelle Datenpflege. Keine Duplikate. Immer synchron.',
    hasDataFlow: true,
    hasWaveBackground: true,
    showcaseTitle: 'Wie funktioniert Datenintegration?',
    showcaseSubtitle: 'Wir verbinden eure Tools und Systeme – von CRM über ERP bis Marketing-Automation. Keine manuelle Datenübertragung mehr.',
    serviceTypes: [
      {
        title: 'CRM Integrations',
        desc: 'Nahtlose Verbindung mit Salesforce, HubSpot, Pipedrive und mehr – Bi-Directional Sync',
        image: '../assets/services/datenintegration/capability-crm.svg',
        tag: 'Vertrieb',
        icon: 'users',
        detailedDesc: 'CRM-Integrationen, die eure Sales-Daten in Echtzeit synchronisieren – mit Custom Field Mapping und Conflict Resolution.',
        features: [
          'Bi-Directional Sync (beide Richtungen)',
          'Custom Field Mapping für eure spezifischen Felder',
          'Real-time Updates bei Änderungen',
          'Conflict Resolution bei gleichzeitigen Edits',
          'Bulk Data Import und historische Daten',
          'Support für Salesforce, HubSpot, Pipedrive, Zoho'
        ]
      },
      {
        title: 'ERP & Accounting',
        desc: 'Integration mit DATEV, SAP, Lexware und anderen ERP-Systemen für automatische Rechnungs- und Payment-Sync',
        image: '../assets/services/datenintegration/capability-erp.svg',
        tag: 'Finance',
        icon: 'currency-euro',
        detailedDesc: 'ERP-Integrationen, die Rechnungen, Zahlungen und Inventory automatisch synchronisieren – DATEV-zertifiziert.',
        features: [
          'Automatische Invoice Sync (Rechnungen, Gutschriften)',
          'Payment Tracking und Bank-Reconciliation',
          'Inventory Updates in Echtzeit',
          'Multi-Entity Support für Konzerne',
          'DATEV-Zertifizierung und GoBD-Konformität',
          'Support für DATEV, SAP, Lexware, sevDesk'
        ]
      },
      {
        title: 'Marketing Automation',
        desc: 'Verbindung mit Mailchimp, ActiveCampaign, Klaviyo für Audience-Sync und Attribution',
        image: '../assets/services/datenintegration/capability-marketing.svg',
        tag: 'Marketing',
        icon: 'megaphone',
        detailedDesc: 'Marketing-Integrationen, die Audiences synchronisieren, Kampagnen tracken und Attribution ermöglichen.',
        features: [
          'Audience Sync zwischen CRM und Marketing-Tool',
          'Campaign Tracking und Performance-Daten',
          'Event Triggers für personalisierte Kampagnen',
          'Attribution Modeling (Multi-Touch)',
          'Unsubscribe-Sync und DSGVO-Compliance',
          'Support für Mailchimp, ActiveCampaign, Klaviyo, Brevo'
        ]
      },
      {
        title: 'E-Commerce Platforms',
        desc: 'Shopify, WooCommerce, Magento Integration für Product-Sync, Order-Management und Customer-Data',
        image: '../assets/services/datenintegration/capability-ecommerce.svg',
        tag: 'Vertrieb',
        icon: 'shopping-cart',
        detailedDesc: 'E-Commerce-Integrationen, die Produkte, Orders und Customer-Daten zwischen Shop und Backend synchronisieren.',
        features: [
          'Product Sync (Titel, Preise, Bilder, Inventory)',
          'Order Management und Fulfillment-Status',
          'Customer Data Sync (Accounts, Adressen)',
          'Inventory Updates in Echtzeit',
          'Multi-Store Support für mehrere Shops',
          'Support für Shopify, WooCommerce, Magento, Shopware'
        ]
      },
      {
        title: 'Custom API Development',
        desc: 'Maßgeschneiderte APIs und Integrationen für spezifische Systeme ohne Standard-API',
        image: '../assets/services/datenintegration/capability-api.svg',
        tag: 'Operations',
        icon: 'code-bracket',
        detailedDesc: 'Wenn Standard-Integrationen nicht reichen: Custom APIs und Middleware für Legacy-Systeme und spezielle Anforderungen.',
        features: [
          'REST und GraphQL API Development',
          'Webhooks für Event-basierte Sync',
          'Rate Limiting und Error Handling',
          'Umfassende API-Dokumentation',
          'Monitoring und Alerting',
          'Legacy-System-Integration (CSV, FTP, SOAP)'
        ]
      },
    ],
    forWho: {
      yes: [
        'Daten werden manuell zwischen Systemen kopiert',
        'Ihr habt mehrere Tools, die nicht miteinander sprechen',
        'Euer Team macht doppelte Arbeit wegen fehlender Sync',
        'Wichtige Daten sind über viele Systeme verteilt'
      ],
    },
    faq: [
      { q: 'Wie lange dauert eine Integration?', a: '2-4 Wochen für Standard-Integrationen (CRM, E-Commerce). Custom-APIs und Legacy-Systeme können 6-10 Wochen dauern.' },
      { q: 'Welche Systeme könnt ihr integrieren?', a: 'Alles mit API: CRMs, ERPs, Marketing-Tools, E-Commerce, Payment-Provider, eigene Systeme. Bei Legacy-Systemen finden wir eine Lösung (CSV, FTP, etc.).' },
      { q: 'Wie schnell sind die Daten synchronisiert?', a: 'Standard-Integrationen laufen in Echtzeit oder alle 5-15 Minuten (je nach API-Limits). Bei kritischen Daten können wir Webhook-basierte Instant-Sync einrichten.' },
      { q: 'Was passiert bei Konflikten (z.B. gleichzeitige Edits)?', a: 'Wir implementieren Conflict Resolution Strategien: Last-Write-Wins, Priority-basiert oder Manual Review – je nach eurem Workflow.' },
    ],
    processHeadline: 'Fünf Schritte. 4-8 Wochen. Fertig.',
    processSteps: [
      {
        num: '01',
        title: 'MAPPING',
        desc: '1 Woche',
        content: 'Welche Systeme? Welche Daten? Welche Sync-Richtung? Datenfluss-Diagramm erstellen.'
      },
      {
        num: '02',
        title: 'SETUP',
        desc: '1-2 Wochen',
        content: 'API-Zugriffe einrichten, Authentifizierung, Middleware aufsetzen.'
      },
      {
        num: '03',
        title: 'ENTWICKLUNG',
        desc: '2-4 Wochen',
        content: 'Sync-Jobs bauen, Error Handling, Daten-Validierung, Transformation-Logic.'
      },
      {
        num: '04',
        title: 'TESTING',
        desc: '1 Woche',
        content: 'Test-Sync mit Sample Data, Edge Cases testen, Performance-Optimierung.'
      },
      {
        num: '05',
        title: 'LIVE',
        desc: 'Go-Live',
        content: 'Produktiv-Sync starten, Monitoring aufsetzen, 4 Wochen Support.'
      }
    ],
    related: ['dashboards', 'ki-agenten', 'software', 'company-ai'],
  },

  'strategy-audit': {
    meta: {
      number: '07',
      total: '07',
      title: 'Strategy & Audit',
      tagline: 'Digitale Strategie und Technologie-Audit',
    },
    hero: {
      headline: 'Strategy & Audit',
      subline: 'Wir analysieren. Ihr entscheidet. Umsetzung optional.',
    },
    kpis: [
      { value: '360°', label: 'Objektive Analyse', icon: 'compass', background: 'gradient' },
      { value: 'Clear', label: 'Actionable Roadmap', icon: 'target', background: 'gradient' },
      { value: 'ROI', label: 'Projektion', icon: 'currency-euro', background: 'gradient' },
      { value: '2-4', label: 'Wochen', icon: 'clock', background: 'gradient' }
    ],
    benefitCards: [
      { number: '360°', label: 'Objektive Analyse', desc: 'Unabhängige Bewertung', icon: 'compass' },
      { number: 'Clear', label: 'Actionable Roadmap', desc: 'Konkrete nächste Schritte', icon: 'target' },
      { number: 'ROI', label: 'Projektion', desc: 'Business Case für Maßnahmen', icon: 'currency-euro' },
      { number: '2-4', label: 'Wochen', desc: 'Schnelle Ergebnisse', icon: 'clock' },
      { number: 'Expert', label: 'Insights', desc: 'Best Practices aus 12+ Projekten', icon: 'brain' },
      { number: 'No', label: 'Lock-In', desc: 'Umsetzung komplett optional', icon: 'security' }
    ],
    features: [
      'Digital Maturity Assessment',
      'Data Strategy Consulting',
      'AI Readiness Audit',
      'Process Optimization Analysis',
      'Technology Stack Review',
      'Benchmarking gegen Wettbewerber',
      'Prioritized Roadmap mit Quick Wins',
      'ROI-Projektion für Maßnahmen',
      'Executive Summary für Management',
      'Optional: Implementation Support'
    ],
    roiHeadline: 'Der ROI Ihres Strategy & Audit.',
    roiSubline: 'Klarheit vor Investition. Objektive Bewertung. Konkrete Roadmap.',
    problemCards: [
      { icon: 'search', title: 'Wo anfangen?', desc: 'Ihr wisst, dass Digitalisierung wichtig ist, aber nicht wo priorisieren.' },
      { icon: 'database', title: 'Tech-Chaos', desc: 'Historisch gewachsener Tech-Stack, niemand hat den Überblick.' },
      { icon: 'brain', title: 'KI-Potenzial?', desc: 'Ihr wollt in KI investieren, aber braucht objektive Bewertung der Use Cases.' }
    ],
    hasWaveBackground: true,
    showcaseTitle: 'Was beinhaltet Strategy & Audit?',
    showcaseSubtitle: 'Von Digital Maturity Assessment bis Technology Stack Review – wir analysieren euren Status Quo und zeigen Potenziale auf.',
    serviceTypes: [
      {
        title: 'Digital Maturity Assessment',
        desc: 'Analyse des aktuellen Digitalisierungsgrads eures Unternehmens mit Roadmap für die nächsten Schritte',
        image: '../assets/services/strategy-audit/capability-maturity.svg?v=2',
        tag: 'Operations',
        icon: 'chart-bar',
        detailedDesc: 'Ein umfassendes Assessment eurer digitalen Reife – von Prozessen über Technologie bis Team-Skills.',
        features: [
          'Process Mapping und Digitalisierungsgrad-Analyse',
          'Tech Stack Audit (welche Tools nutzt ihr wofür)',
          'Capability Assessment (wo steht euer Team)',
          'Benchmarking gegen Wettbewerber und Industrie',
          'Prioritized Roadmap mit Quick Wins und Long-term Goals',
          'ROI-Projektion für Digitalisierungs-Maßnahmen'
        ]
      },
      {
        title: 'Data Strategy Consulting',
        desc: 'Entwicklung einer ganzheitlichen Datenstrategie: Governance, Quality, Integration, KPIs',
        image: '../assets/services/strategy-audit/capability-data-strategy.svg?v=2',
        tag: 'Finance',
        icon: 'circle-stack',
        detailedDesc: 'Eine Datenstrategie, die definiert, wie ihr Daten sammelt, speichert, nutzt und schützt – mit klaren Prozessen und Verantwortlichkeiten.',
        features: [
          'Data Governance Framework (wer ist verantwortlich)',
          'Data Quality Framework (wie stellen wir Qualität sicher)',
          'Integration Architecture (wie verbinden wir Systeme)',
          'KPI Definition und Metric Trees',
          'Data Security und DSGVO-Compliance',
          'Team-Training und Change Management'
        ]
      },
      {
        title: 'AI Readiness Audit',
        desc: 'Bewertung der Bereitschaft für KI-Implementierung mit Use Case Identification und ROI-Projektion',
        image: '../assets/services/strategy-audit/capability-ai-readiness.svg?v=2',
        tag: 'Operations',
        icon: 'cpu-chip',
        detailedDesc: 'Ein Audit, das zeigt, ob und wie ihr KI einsetzen könnt – mit konkreten Use Cases und Business Case.',
        features: [
          'Use Case Identification (wo lohnt sich KI)',
          'Infrastructure Review (ist eure Tech-Stack bereit)',
          'Data Readiness Assessment (habt ihr genug Daten)',
          'Team Assessment (braucht ihr externes Know-How)',
          'ROI Projection für Top-3-Use-Cases',
          'Implementation Roadmap mit Prioritäten'
        ]
      },
      {
        title: 'Process Optimization',
        desc: 'Identifikation und Optimierung ineffizienter Geschäftsprozesse mit Automation-Potential und Cost-Benefit-Analyse',
        image: '../assets/services/strategy-audit/capability-process.svg?v=2',
        tag: 'Operations',
        icon: 'cog-6-tooth',
        detailedDesc: 'Wir analysieren eure Prozesse, identifizieren Bottlenecks und zeigen, wo Automatisierung Sinn macht.',
        features: [
          'Bottleneck Analysis (wo verliert ihr Zeit)',
          'Automation Potential Assessment',
          'Cost-Benefit Analysis pro Prozess',
          'Implementation Plan mit Quick Wins',
          'Change Management und Team-Enablement',
          'Before/After-Metrics zur Erfolgsmessung'
        ]
      },
      {
        title: 'Technology Stack Review',
        desc: 'Audit bestehender Systeme, Architektur-Review und Technologie-Empfehlungen für Skalierung',
        image: '../assets/services/strategy-audit/capability-tech-stack.svg?v=2',
        tag: 'Operations',
        icon: 'server',
        detailedDesc: 'Ein technisches Audit eurer Systeme – von Security über Performance bis Skalierbarkeit.',
        features: [
          'Architecture Review (wie ist euer System aufgebaut)',
          'Security Assessment (OWASP Top 10, Penetration Testing)',
          'Scalability Analysis (könnt ihr 10x wachsen)',
          'Tech Debt Quantifizierung',
          'Migration Planning (falls Neuaufbau nötig)',
          'Vendor Evaluation und Empfehlungen'
        ]
      },
    ],
    forWho: {
      yes: [
        'Ihr wisst, dass es besser geht, aber nicht wo anfangen',
        'Euer Tech-Stack ist historisch gewachsen und unübersichtlich',
        'Ihr wollt in KI oder Automatisierung investieren, aber objektive Bewertung fehlt',
        'Vor großen Investitionen wollt ihr externe Expertise'
      ],
    },
    faq: [
      { q: 'Wie lange dauert ein Audit?', a: '2-4 Wochen für ein Standard-Audit (Digital Maturity, Process Optimization). Umfassende Tech Stack Reviews können 6-8 Wochen dauern.' },
      { q: 'Was bekomme ich am Ende?', a: 'Einen detaillierten Report mit Status Quo, Findings, Empfehlungen und priorisierten Roadmap. Plus Executive Summary für Management.' },
      { q: 'Was passiert nach dem Audit?', a: 'Ihr bekommt einen vollständigen Report mit Roadmap, ROI-Projektionen und konkreten nächsten Schritten. Umsetzung ist komplett optional – ihr könnt selbst, mit uns oder anderen Partnern umsetzen.' },
      { q: 'Müssen wir danach mit euch zusammenarbeiten?', a: 'Nein – ihr bekommt alle Ergebnisse und könnt selbst oder mit anderen Partnern umsetzen. Wenn ihr wollt, helfen wir gerne bei der Umsetzung.' },
    ],
    processHeadline: 'Fünf Schritte. 2-4 Wochen. Fertig.',
    processSteps: [
      {
        num: '01',
        title: 'KICK-OFF',
        desc: '1 Tag',
        content: 'Workshop mit eurem Team: Ziele, Herausforderungen, IST-Zustand.'
      },
      {
        num: '02',
        title: 'ANALYSE',
        desc: '1 Woche',
        content: 'Deep Dive in eure Prozesse, Tools, Daten. Interviews mit Stakeholdern.'
      },
      {
        num: '03',
        title: 'STRATEGIE',
        desc: '1 Woche',
        content: 'Roadmap erstellen, Quick Wins identifizieren, Priorisierung.'
      },
      {
        num: '04',
        title: 'PRÄSENTATION',
        desc: '1 Tag',
        content: 'Ergebnisse präsentieren, Action Plan vorstellen, Diskussion.'
      },
      {
        num: '05',
        title: 'UMSETZUNG',
        desc: 'Optional',
        content: 'Wir können die Strategie auch direkt umsetzen – oder ihr macht es selbst.'
      }
    ],
    related: ['company-ai', 'datenintegration', 'ki-integration', 'dashboards'],
  },
};
