/**
 * Zentrale Projektdaten — einzige Quelle für den Partikel-Zeitstrahl
 * (test-zeitstrahl.html) und die Detailseiten (test-projekt.html?p=<id>).
 * Neue Projekte nur hier eintragen, beide Seiten ziehen sich alles daraus.
 *
 * Inhalte destilliert aus den Projekt-Beschreibungen in assets/projekte/
 * (docx der Kunden-Ordner); Bilder liegen web-optimiert unter
 * assets/projekte/<id>/NN.jpg (Originale in den Kunden-Rohordnern —
 * die Rohordner nicht mit deployen).
 *
 * datum: 'YYYY-MM' — bestimmt die Reihenfolge im Zeitstrahl (neu → alt);
 *   bei gleichem Datum entscheidet die Array-Reihenfolge (früher = weiter vorne).
 * stack: nur explizit belegte Technik (nichts erfinden).
 * module: [{ t, d, soon? }] — Feature-Sektion der Detailseite.
 * website: Live-URL des Produkts (Detailseite zeigt „Live ansehen"-Button).
 * preview: Vorschau-Bild für die Zeitstrahl-/Galerie-Karte (optional —
 *   ohne preview nehmen die Karten automatisch das erste Galerie-Bild).
 * laufend: true → Projekt ist in Arbeit; Karten/Detailseite zeigen statt
 *   des Monats „in Arbeit" (datum trotzdem setzen, es sortiert den Strahl).
 */

function bilder(id, n) {
  return Array.from({ length: n }, (_, i) => `assets/projekte/${id}/${String(i + 1).padStart(2, '0')}.jpg`)
}

export const PROJEKTE = [
  {
    id: 'regyva',
    name: 'Regyva',
    kunde: 'Regyva',
    logo: 'assets/clients/regyva/SVG/regyva-logo-white.svg',
    kategorie: 'Fullstack-Plattform',
    datum: '2026-07',
    laufend: true,
    tagline: 'Ein System, das CRM, Ads und Zahlungen zusammenzieht.',
    beschreibung:
      'Fullstack-System mit Anbindung an CRM, Meta, Google und Stripe — Kampagnen, Leads und Umsätze laufen in einer Plattform zusammen statt in vier Tools nebeneinander. Das Projekt ist aktuell in der Entwicklung; Einblicke folgen, sobald es live ist.',
    stack: ['Stripe', 'Meta API', 'Google API'],
    module: [],
    bilder: [],
    preview: 'assets/projekte/regyva/preview.jpg',
    caseStudy: null,
  },
  {
    id: 'cuc-provision',
    name: 'Umsatz- & Provisionssystem',
    kunde: 'Connect & Collect',
    logo: 'assets/clients/connect-collect.png',
    kategorie: 'Finanz-Dashboard',
    datum: '2026-01',
    tagline: 'Umsätze, Provisionen und Auszahlungen fürs ganze Vertriebsteam — automatisch und revisionssicher.',
    beschreibung:
      'Internes Dashboard, das Umsätze, Provisionen und Auszahlungen für Setter, Closer, Chatter, Affiliates und Creator zentral verwaltet. Jede erfasste Zahlung berechnet die Provisionen aller beteiligten Rollen automatisch — inklusive Ratenplänen mit Fälligkeits-Tracking, wöchentlichen Auszahlungsübersichten, Live-Analytics und rollenbasierten Zugriffen.',
    stack: ['Close CRM'],
    module: [
      { t: 'Zahlungen', d: 'Zentrale Übersicht aller Einnahmen — filterbar nach Datum, Produkt, Kunde und Zahlungsart.' },
      { t: 'Neue Zahlung', d: 'Schnelle Erfassung mit automatischer Provisionsberechnung für alle beteiligten Rollen.' },
      { t: 'Raten', d: 'Ratenpläne mit Fälligkeits-Tracking und Hervorhebung überfälliger Posten.' },
      { t: 'Auszahlungen', d: 'Wöchentliche Provisionsübersicht pro Person — mit Ein-Klick-Status „Ausgezahlt" und Rückgängig-Funktion.' },
      { t: 'Statistik', d: 'Tracking-Dashboard mit Umsatzverlauf, Funnel-Analyse, Conversion-Rates und Close-CRM-Integration.' },
      { t: 'Einstellungen', d: 'Provisionssätze, Team, Produkte und Integrationen konfigurieren — ohne technisches Wissen.' },
    ],
    bilder: bilder('cuc-provision', 7),
    caseStudy: null,
  },
  {
    id: 'cuc-content-pipeline',
    name: 'Content-Pipeline',
    kunde: 'Connect & Collect',
    logo: 'assets/clients/connect-collect.png',
    kategorie: 'Produktions-Tool',
    datum: '2026-01',
    tagline: 'Video-Produktion von der Idee bis zur Freigabe — mit automatischen Deadlines und Creator-Upload ohne Login.',
    beschreibung:
      'Zentrales Planungs- und Tracking-Tool für die Video-Produktion: wochenweise Pipeline mit automatischer Deadline-Berechnung (Creator-Deadline = Posting-Datum − 2 Tage), farbcodierten Status-Badges und Filtern nach Founding Partner, Creator und Status. Creator reichen Rohmaterial über ein öffentliches Upload-Portal ein — ganz ohne Login.',
    stack: [],
    module: [
      { t: 'Pipeline', d: 'Wochenweise Planung aller Videos mit automatischer Deadline-Berechnung und Status-Tracking.' },
      { t: 'Creator', d: 'Alle aktiven Creator mit zugewiesenen Founding Partnern, Performance-Daten und eigenem Upload-Link.' },
      { t: 'Founding Partner', d: 'FP-Verwaltung mit Tages-Zielen, Affiliate-IDs und Many-to-Many-Zuweisung mehrerer Creator.' },
      { t: 'Performance', d: 'Erfüllungsquoten, Verspätungen und Output pro Creator und Founding Partner.' },
      { t: 'Creator-Upload-Portal', d: 'Öffentliche Upload-Seite: Rohmaterial einreichen ohne Login — Status springt automatisch auf „Hochgeladen".' },
    ],
    bilder: bilder('cuc-content-pipeline', 5),
    caseStudy: null,
  },
  {
    id: 'accountly',
    name: 'Accountly',
    kunde: 'Eigenes Produkt',
    logo: null,
    kategorie: 'Buchhaltungs-SaaS',
    datum: '2026-01',
    tagline: 'Cloud-Buchhaltung für zypriotische Unternehmen — Rechnungen, Belege und Finanzen in einer App.',
    beschreibung:
      'Cloud-basierte Buchhaltungssoftware für kleine Unternehmen und Freelancer auf Zypern — und ihre Buchhalter. Statt Rechnungen, Belege und Finanzunterlagen über Excel, WhatsApp und Cloud-Ordner zu verstreuen, läuft alles in einer App: Rechnungsstellung mit VAT- und Reverse-Charge-Handling, Ausgabenerfassung per Beleg-Foto, Echtzeit-Finanzübersicht, VIES-Validierung für EU-Kunden, Multi-Währung, OSS/MOSS-Reporting und ein kostenloses Accountant-Portal für den Datenaustausch mit der Buchhaltung.',
    stack: [],
    module: [
      { t: 'Rechnungen', d: 'Automatische Rechnungsstellung mit Mehrwertsteuer- und Reverse-Charge-Handling.' },
      { t: 'Belege', d: 'Ausgabenerfassung per Foto-Upload — Beleg abfotografieren, fertig.' },
      { t: 'Finanzübersicht', d: 'Einnahmen, Ausgaben und offene Rechnungen in Echtzeit.' },
      { t: 'EU-Features', d: 'VIES-Validierung für EU-Kunden, Multi-Währung und OSS/MOSS-Berichterstattung.' },
      { t: 'Accountant-Portal', d: 'Kostenloser Zugang für Buchhalter zum direkten Datenaustausch.' },
    ],
    bilder: bilder('accountly', 6),
    preview: 'assets/projekte/accountly/preview.jpg',
    website: 'https://accountly.cy',
    caseStudy: null,
  },
  {
    id: 'cuc-csm',
    name: 'CSM-Modul',
    kunde: 'Connect & Collect',
    logo: 'assets/clients/connect-collect.png',
    kategorie: 'Customer Success',
    datum: '2025-12',
    tagline: 'Tägliche Betreuung mit automatischer Eskalation — kein Kunde fällt durchs Raster.',
    beschreibung:
      'Customer-Success-Management für Founding Partner und Low-Ticket-Kunden: tägliche Betreuungs-Checklisten mit manuellem und automatisch berechnetem Status, Auto-Eskalation bei Inaktivität (3 Tage → Follow-up, 7 → Reminder, 14 → persönlicher Kontakt, 30 → inaktiv), Pausen-Logik und ein vollständiges Aktivitätsprotokoll pro Person.',
    stack: [],
    module: [
      { t: 'FP-CSM', d: 'Tägliche Checkliste aller aktiven Founding Partner mit manuellem Status und System-Status.' },
      { t: 'LT-CSM', d: 'Gleiche Logik für Low-Ticket-Kunden — inkl. Kauf-Datum, Video-Status und Lebenszeichen-Tracking.' },
      { t: 'Auto-Eskalation', d: '„Aktion erforderlich" befüllt sich selbst: 3 Tage Follow-up, 7 Reminder, 14 persönlicher Kontakt, 30 inaktiv.' },
      { t: 'Pausen-Logik', d: 'Pausierte Kunden werden markiert, vom täglichen Reset ausgenommen und automatisch datiert.' },
      { t: 'Aktivitätsprotokoll', d: 'Chronologische Historie aller Status-Änderungen, verpassten Aufgaben und Kontaktversuche pro Person.' },
    ],
    bilder: bilder('cuc-csm', 2),
    caseStudy: null,
  },
  {
    id: 'cuc-tracking',
    name: 'Tracking Dashboard',
    kunde: 'Connect & Collect',
    logo: 'assets/clients/connect-collect.png',
    kategorie: 'Live-Analytics',
    datum: '2025-11',
    tagline: 'Marketing-, Funnel- und Sales-Performance in Echtzeit — jeder KPI mit Drill-Down.',
    beschreibung:
      'Live-Analytics-Dashboard mit flexiblen Zeiträumen (Tag, Woche, Monat, individuell): der komplette Conversion-Funnel von Link-Klicks bis zum Kauf, Setter- und Closer-Auswertung aus dem Close CRM mit Superchat-Abgleich, Team-Performance im Direktvergleich — und jeder KPI öffnet per Klick sein eigenes Drill-Down mit Verlaufsdiagramm und Trend.',
    stack: ['Close CRM', 'Superchat'],
    module: [
      { t: 'Übersicht', d: 'Zentrale KPIs auf einen Blick: DMs, Link-Klicks, Käufe und Umsatz im gewählten Zeitraum.' },
      { t: 'Website & Funnel', d: 'Der komplette Conversion-Funnel visualisiert — mit Conversion-Rates und Trendanalysen.' },
      { t: 'Close & Calls', d: 'Setter-/Closer-Performance aus Close CRM: Termine, Show-Rate, Closing-Rate, Chatter-Abdeckung.' },
      { t: 'Team Performance', d: 'Individuelle Leistung pro Teammitglied mit direktem Vergleich von Aktivität und Ergebnis.' },
      { t: 'Detail-Pop-ups', d: 'Jeder KPI im Drill-Down: Verlaufsdiagramm, Trendindikator und Tagesdurchschnitte.' },
    ],
    bilder: bilder('cuc-tracking', 4),
    caseStudy: null,
  },
  {
    id: 'vsa-vertrieb',
    name: 'Vertriebs-Dashboard',
    kunde: 'VS Academy',
    logo: 'assets/clients/vsacademy.png',
    kategorie: 'Sales-Analytics',
    datum: '2025-09',
    tagline: 'Der komplette Sales-Funnel in Echtzeit — direkt aus dem Close CRM.',
    beschreibung:
      'Echtzeit-Auswertung des gesamten Vertriebs von der ersten Lead-Quelle bis zum Abschluss: alle Kennzahlen automatisch aus dem Close CRM zusammengeführt, getrennt nach Setter- und Closer-Sicht und über frei wählbare Zeiträume. Funnel-Analysen je Lead-Quelle, stufengenaue Pipelines mit Drop-off-Erkennung und ein Periodenvergleich mit bis zu fünf Zeiträumen oder Mitarbeitern gleichzeitig.',
    stack: ['Close CRM'],
    module: [
      { t: 'Aktuell', d: 'Live-Cockpit: Umsatz, Leads nach Quelle, Setter-Aktivitäten und die wichtigsten Conversion-Rates.' },
      { t: 'Lead Sources', d: 'Funnel je Quelle (Ads, Affiliates, Website, YouTube, E-Mail) — inkl. No-Show-Quote und Kampagnen-Aufschlüsselung.' },
      { t: 'Pipelines', d: 'Stufengenauer Funnel, getrennt nach „finanzierbar / nicht finanzierbar" — macht jeden Drop-off sichtbar.' },
      { t: 'Digitaler Kundenberater', d: 'Auswertung des Onepage-Funnels: A/B/C-Leads, Selbstbucher, Settings, Closings, Show-up-Rate.' },
      { t: 'Digitaler Chatter', d: 'Performance des Chat-Settings: Selbstbucher, geplante vs. stattgefundene Closings, Abschlüsse nach Quelle.' },
      { t: 'Vergleich', d: 'Periodenvergleich über Wochen/Monate — Mitarbeiter oder Lead-Quellen direkt gegeneinander.' },
    ],
    bilder: bilder('vsa-vertrieb', 9),
    caseStudy: null,
  },
  {
    id: 'vsa-garantie',
    name: 'Garantie-Tracking',
    kunde: 'VS Academy',
    logo: 'assets/clients/vsacademy.png',
    kategorie: 'Teilnehmer-Plattform',
    datum: '2025-08',
    tagline: 'Jede Ausbildungs-Garantie automatisch überwacht — fair, transparent, nachvollziehbar.',
    beschreibung:
      'Die zentrale Plattform, die jede Teilnehmer-Garantie überwacht: wöchentliches Tracking aller Anforderungen (Livecalls, Lernzeiten, Bewerbungen, Check-ins), ein 3-Phasen-Meilensteinplan mit automatischer Fristenkontrolle und ein Flaggen-Frühwarnsystem, aus dem sich der Garantie-Status jedes Teilnehmers live berechnet. Lernzeiten synchronisieren sich automatisch über die LearningSuite-API, neue Teilnehmer landen direkt aus dem CRM im System — und Krankmeldungen wie Urlaube verlängern die Fristen automatisch fair.',
    stack: ['LearningSuite API', 'CRM-Anbindung'],
    module: [
      { t: 'Dashboard', d: 'Alle Teilnehmer auf einen Blick: aktive und kritische Garantien, offene Flaggen, Lernzeiten — live berechnet.' },
      { t: 'Teilnehmer-Akte', d: 'Übersicht, Check-ins, Meilensteine, Wochen-Tracking, Flaggen, Lernzeiten und Notizen in einer Ansicht.' },
      { t: 'Wochen-Tracking', d: 'Automatische Vollständigkeitsprüfung jeder Woche: Livecalls, Buch-/Podcast-Zeit, Bewerbungen, Check-ins.' },
      { t: 'Meilensteine', d: '3-Phasen-Plan vom Grundlagenkurs bis zum Stellenangebotstraining — Fristen automatisch überwacht.' },
      { t: 'Flaggen', d: 'Frühwarnsystem: jede Abweichung als gelbe/rote Flagge dokumentiert, geprüft, bestätigt oder widerlegt.' },
      { t: 'LearningSuite', d: 'Wöchentliche Lernzeiterfassung mit 8-Stunden-Ziel — automatisch per API synchronisiert.' },
      { t: 'Krank & Urlaub', d: 'Nachweise werden zentral erfasst und in Pausen umgewandelt — Garantie-Fristen verlängern sich automatisch.' },
    ],
    bilder: bilder('vsa-garantie', 10),
    caseStudy: null,
  },
  {
    id: 'ecom-wave-dashboard',
    name: 'Coaching Dashboard',
    kunde: 'ecom wave',
    logo: null,
    kategorie: 'All-in-One-Plattform',
    datum: '2026-05',
    tagline: 'CRM, Vertrieb, Ads, Funnel und Provisionen — ein System statt fünf Tools.',
    beschreibung:
      'All-in-One-Plattform für Coaching- und Online-Business-Unternehmen: von der ersten Werbeanzeige über Lead, Closing-Gespräch und Zahlung bis zur automatischen Provisionsabrechnung läuft alles in einem System. Multi-projektfähig — mehrere Marken komplett getrennt, mit eigenem Command Center über alles hinweg, Live-Anbindungen an Meta Ads, Close CRM, Stripe, CopeCart/Digistore und Perspective, Creative-Fatigue-Detection in der Ads-Analyse und Funnel-Tracking mit eigenem Pixel.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Meta Ads', 'Close CRM', 'Stripe', 'CopeCart', 'Perspective'],
    module: [
      { t: 'Command Center', d: 'Alle Projekte gleichzeitig: Gesamt-Umsatz, Projekt-Vergleich, Team-Scorecard und Activity-Feed.' },
      { t: 'CRM Pipeline', d: 'Kanban-Board vom Erstkontakt zum Termin — mit Terminverwaltung, Conversions und Lead-Timelines.' },
      { t: 'Vertrieb', d: 'Funnel mit Show-up-Auswertung, Deals, Payment-Tracking über Webhooks, Reports mit Forecast und P&L.' },
      { t: 'Provisionen', d: 'Automatische Provisionsabrechnung mit individuellen Regeln je Person und Projekt.' },
      { t: 'Paid Ads', d: 'Meta-Ads-Sync: Kampagnen mit ROAS, Creative-Analyse mit Fatigue-Detection, Budget-Pacing.' },
      { t: 'Funnel', d: 'Eigenes Tracking-Pixel: Drop-off-Analyse, Termin-Heatmaps, A/B-Tests und Formular-Abbruch-Tracking.' },
      { t: 'Affiliate-Portal', d: 'Eigenes Partner-Login mit Links, Performance und Auszahlungen.', soon: true },
    ],
    bilder: bilder('ecom-wave-dashboard', 19),
    caseStudy: null,
  },
  {
    id: 'forgetify',
    name: 'Forgetify',
    kunde: 'Eigenes Produkt',
    logo: 'assets/clients/forgetify.png',
    kategorie: 'SaaS-Produkt',
    datum: '2026-05',
    tagline: 'Regelwidrige Google-Bewertungen erkennen und entfernen lassen — KI-gestützt, bezahlt wird nur bei Erfolg.',
    beschreibung:
      'Ein Service, der unfaire und gefälschte Google-Bewertungen loswird: Die KI-Analyse erkennt Verstöße gegen die Google-Richtlinien automatisch, das System meldet sie direkt an Google — mit rund 94 % Erfolgsquote und etwa 12 Tagen Bearbeitungszeit. Die Erstanalyse ist kostenlos und ohne Registrierung, bezahlt wird pro erfolgreich entfernter Bewertung. Volle Transparenz: Was technisch nicht entfernbar ist, wird vorher angezeigt.',
    stack: [],
    module: [
      { t: 'KI-Analyse', d: 'Automatische Erkennung von Policy-Verstößen in Google-Bewertungen.' },
      { t: 'Direkte Meldung', d: 'Das System meldet regelwidrige Bewertungen direkt an Google — ~94 % Erfolgsquote.' },
      { t: 'Kostenlose Erstanalyse', d: 'Ohne Registrierung prüfen, was entfernbar ist — inklusive ehrlicher Vorab-Einschätzung.' },
      { t: 'Erfolgsbasiert', d: 'Bezahlt wird nur pro erfolgreich entfernter Bewertung.' },
    ],
    bilder: bilder('forgetify', 5),
    preview: 'assets/projekte/forgetify/preview.jpg',
    website: 'https://forgetify.de',
    caseStudy: null,
  },
]

/** Neueste zuerst — Reihenfolge des Zeitstrahls (vorne = jetzt). */
export function sortiereProjekte(liste = PROJEKTE) {
  return [...liste].sort((a, b) => (b.datum || '').localeCompare(a.datum || ''))
}

const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

/** 'YYYY-MM' → 'Mär 2026' (ungültige Werte unverändert zurück). */
export function formatDatum(datum) {
  const m = /^(\d{4})-(\d{2})$/.exec(datum || '')
  if (!m) return datum || ''
  const monat = MONATE[Number(m[2]) - 1]
  return monat ? `${monat} ${m[1]}` : datum
}
