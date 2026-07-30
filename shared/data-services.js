/* ============================================================
   NUROY: Inhalte der sieben Leistungsseiten
   ------------------------------------------------------------
   Reihenfolge = Verkaufsreihenfolge: erst der schnelle Beweis
   (Lead-Response, Erreichbarkeit), zuletzt das Cockpit als
   Ausbaustufe.

   WICHTIG zu den Zahlen in benefitCards: das sind BELEGTE
   MARKTZAHLEN mit Quellenangabe, keine Ergebnisse einzelner
   Kunden. Hauptquelle ist TÜV NORD INSIGHT 2026 (AUTOHAUS mit
   TÜV NORD Mobilität, Erhebung puls Marktforschung, Feldzeit
   24.09. bis 14.10.2025, 275 Händler und 842 Käufer), dazu
   DAT-Barometer 06/2026 und DAT Report 2026.

   NICHT MEHR VERWENDEN: die früher kursierenden 42 Prozent
   Antwortquote und 9 bis 12,5 Stunden Reaktionszeit stammen aus
   einer Erhebung von 2019 und sind veraltet. Die 43 Prozent
   Händlerwechsel nach vier Stunden sind in keiner Primärquelle
   auffindbar. Beim Rohertrag je Fahrzeug gibt es keine
   belastbare Branchenzahl, deshalb steht dort kein Wert.

   Nur diese Felder werden tatsächlich gerendert (siehe
   populate-service.js): hero, showcaseTitle, showcaseSubtitle,
   benefitCards, features, roiHeadline, roiSubline,
   hasWaveBackground, serviceTypes, faq. Die frueher hier
   gepflegten Felder problemCards, kpis, forWho und
   processSteps hatten kein Ziel-Element im HTML und wurden
   nirgends angezeigt, sie sind entfallen.
   ============================================================ */

window.SERVICE_CONTENT = {

  /* ── 01 · Speed-to-Lead ───────────────────────────────── */
  'lead-response': {
    meta: { number: '01', total: '07', title: 'Lead-Response',
            tagline: 'Kein Lead bleibt liegen.' },

    hero: {
      headline: 'Lead-Response',
      subline: 'Jede Anfrage beantwortet, bevor der Interessent weiterklickt.'
    },

    showcaseTitle: 'Wo Ihre Anfragen heute verloren gehen',
    showcaseSubtitle: 'mobile.de, AutoScout24, Website, Google, Social: fünf Kanäle, fünf Postfächer, keines davon verbindlich zugeordnet. Wir ziehen alles in einen Eingang und antworten in unter 60 Sekunden.',

    benefitCards: [
      { number: '9 von 10', label: 'rufen an',     desc: 'Ihrer Kunden hatten telefonischen Kontakt (TÜV NORD 2026)', icon: 'users' },
      { number: '> 70 %',   label: 'mehrkanalig',  desc: 'nutzen mehr als einen Kanal, jeder Vierte WhatsApp',        icon: 'workflow' },
      { number: '25 %',     label: 'nach Feierabend', desc: 'aller Anrufe, über die Hälfte davon Terminanfragen (LDB)', icon: 'clock' },
      { number: '48 %',     label: 'wollen buchen', desc: 'der Kunden ohne Bot-Erfahrung über einen Assistenten',      icon: 'target' },
      { number: '66 %',     label: 'ohne Assistent', desc: 'der Händler haben weder Voice- noch Chat-Bot',            icon: 'chart-bar' },
      { number: '< 60',     label: 'Sekunden',     desc: 'unser Zielwert für die Erstantwort',                        icon: 'lightning' }
    ],

    features: [
      'Ein Eingang für mobile.de, AutoScout24, Website, Google und Social',
      'Börsen-Mails werden automatisch ausgelesen und dem Fahrzeug zugeordnet',
      'Personalisierte Erstantwort mit Fahrzeugbezug, in unter 60 Sekunden',
      'Qualifizierung: Budget, Zeithorizont, Inzahlungnahme, Finanzierungsinteresse',
      'Routing an den zuständigen Verkäufer, mit Eskalation bei Stillstand',
      'Automatische Wiedervorlage, wenn nach X Stunden nichts passiert ist',
      'WhatsApp als vollwertiger Kanal, jeder vierte Kunde nutzt ihn bereits',
      'Wochenreport: zurückgeholte Anfragen und Termine, als Zahl',
      'Kein Systemwechsel, läuft über Ihrem DMS, nicht an dessen Stelle',
      'Hosting in der EU, AV-Vertrag und Löschkonzept inklusive'
    ],

    roiHeadline: 'Was eine liegengebliebene Anfrage kostet.',
    roiSubline: 'Für den Gebrauchtwagenhandel gibt es keine belastbare Branchenzahl zum Rohertrag. Wir rechnen im Erstgespräch mit Ihrer eigenen Zahl, das ist ohnehin aussagekräftiger.',
    hasWaveBackground: true,

    serviceTypes: [
      { title: 'Börsen-Anfragen', tag: 'mobile.de · AutoScout24', icon: 'workflow',
        desc: 'Anfragen aus den Fahrzeugbörsen landen als E-Mail im Sammelpostfach und verlieren sich.',
        detailedDesc: 'Wir lesen die Börsen-Mails automatisch aus, erkennen Fahrzeug und Interessent und legen beides strukturiert an, inklusive Antwort innerhalb einer Minute.',
        features: ['Automatisches Auslesen der Börsen-Mails', 'Zuordnung zum konkreten Fahrzeug im Bestand',
                   'Antwort mit Fahrzeugdaten statt Textbaustein', 'Erkennung von Doppelanfragen über Kanäle hinweg'] },
      { title: 'Website & Google', tag: 'Formulare', icon: 'chart-bar',
        desc: 'Kontaktformulare gehen an eine Adresse, die niemandem gehört.',
        detailedDesc: 'Jedes Formular bekommt einen definierten Empfänger, eine Frist und eine Eskalation. Nichts bleibt unbeantwortet, weil jemand im Urlaub ist.',
        features: ['Verbindliche Zuordnung statt Sammelpostfach', 'Antwortfrist mit Eskalationsstufe',
                   'Google-Business-Anfragen inklusive', 'Rückmeldung auch außerhalb der Öffnungszeiten'] },
      { title: 'WhatsApp', tag: 'Wunschkanal', icon: 'users',
        desc: 'Jeder vierte Autokäufer kommuniziert bereits per WhatsApp mit seinem Händler.',
        detailedDesc: 'Wir binden WhatsApp als vollwertigen Kanal an, mit derselben Qualifizierung und derselben Ablage wie E-Mail, DSGVO-konform dokumentiert.',
        features: ['WhatsApp Business als regulärer Lead-Kanal', 'Gleiche Qualifizierung wie per Mail',
                   'Verlauf landet in der Lead-Historie', 'Dokumentierte Einwilligung und Löschfristen'] },
      { title: 'Eskalation', tag: 'Nichts bleibt liegen', icon: 'security',
        desc: 'Ein Lead ohne Reaktion ist ein verlorener Lead, meist merkt es niemand.',
        detailedDesc: 'Passiert nach einer definierten Frist nichts, geht der Vorgang automatisch an die nächste Stufe. Der Inhaber sieht wöchentlich, wo es hakt.',
        features: ['Frist pro Kanal frei einstellbar', 'Automatische Weitergabe an die nächste Stufe',
                   'Wiedervorlage statt Vergessen', 'Wochenreport über offene Vorgänge'] }
    ],

    faq: [
      { q: 'Müssen wir dafür unser DMS wechseln?',
        a: 'Nein. Wir ersetzen nichts. Der Lead-Response-Layer sitzt über Ihren bestehenden Systemen. DMS, Herstellertools und Börsenzugänge bleiben exakt wie sie sind. In der ersten Stufe greifen wir ausschließlich lesend zu.' },
      { q: 'Wie schnell ist das eingerichtet?',
        a: 'Der Einstieg ist auf 14 Tage ausgelegt: Kanäle anbinden, Antwortlogik abstimmen, Testlauf, Livegang. Danach sehen Sie wöchentlich, wie viele Anfragen und Termine zurückgeholt wurden.' },
      { q: 'Antwortet da eine KI oder ein Mensch?',
        a: 'Die Erstantwort ist automatisiert und auf Ihr Haus abgestimmt, sie bestätigt die Anfrage, nennt die Fahrzeugdaten und klärt die wichtigsten Punkte. Das Verkaufsgespräch führt weiterhin Ihr Team. Die Automatik gewinnt nur die Zeit, in der der Interessent sonst schon woanders ist.' },
      { q: 'Was ist mit dem Datenschutz?',
        a: 'Verarbeitung in der EU, Auftragsverarbeitungsvertrag, dokumentiertes Löschkonzept und transparente Kennzeichnung automatisierter Kommunikation nach EU AI Act. Das Paket bekommen Sie vor dem Start, nicht danach.' }
    ]
  },

  /* ── 02 · Telefonische Erreichbarkeit ─────────────────── */
  'telefon-assistent': {
    meta: { number: '02', total: '07', title: 'Telefon-Assistent',
            tagline: 'Kein Anruf klingelt mehr ins Leere.' },

    hero: {
      headline: 'Telefon-Assistent',
      subline: 'Der Assistent springt ein, wenn niemand rangehen kann.'
    },

    showcaseTitle: 'Das Telefon ist der wichtigste Kanal, und das größte Loch',
    showcaseSubtitle: 'In Stoßzeiten gehen Anrufe systematisch verloren: Serviceberater nehmen Fahrzeuge an, Verkäufer sitzen im Gespräch. Der verpasste Anruf ist die Inspektion, die bei der freien Werkstatt landet.',

    benefitCards: [
      { number: '94 %',    label: 'zufrieden',     desc: 'wer telefonisch zufrieden ist, ist es auch insgesamt (TÜV NORD 2026)', icon: 'target' },
      { number: '30 %',    label: 'nur',           desc: 'sind vollkommen zufrieden mit der Erreichbarkeit',   icon: 'chart-bar' },
      { number: '75 %',    label: 'statt 66 %',    desc: 'Zufriedenheit mit Assistent, sofern er Termine bucht', icon: 'lightning' },
      { number: '12 %',    label: 'unzufrieden',   desc: 'wenn der Assistent keine Termine buchen kann',       icon: 'security' },
      { number: '~10.000', label: 'fehlen',        desc: 'Fachkräfte im handwerklichen Bereich (ZDK)',         icon: 'users' },
      { number: '24/7',    label: 'erreichbar',    desc: 'auch abends, am Wochenende, in der Räder-Saison',    icon: 'clock' }
    ],

    features: [
      'Overflow statt Vollersatz, der Assistent springt nur ein, wenn niemand rangeht',
      'Nimmt nachts und am Wochenende ab, wenn sonst niemand da ist',
      'Erkennt das Anliegen: Probefahrt, Service, Teile, Anfrage zu einem Inserat',
      'Erfasst Kontaktdaten und Fahrzeugbezug strukturiert',
      'Bucht Werkstatttermine direkt in Ihren Terminplaner',
      'Legt jeden Vorgang mit Transkript in der Lead-Pipeline ab',
      'Übergabe an einen Mitarbeitenden, sobald jemand verfügbar ist',
      'Sagt von sich aus, dass er ein digitaler Assistent ist',
      'Rückrufliste für alles, was einen Menschen braucht',
      'Läuft parallel zur bestehenden Telefonanlage'
    ],

    roiHeadline: 'Ein verpasster Anruf ist selten nur ein Anruf.',
    roiSubline: 'Dahinter steht oft eine Inspektion, die dann in der freien Werkstatt landet. Automatisierung ersetzt hier niemanden: Sie fängt auf, wofür es kein Personal gibt.',
    hasWaveBackground: true,

    serviceTypes: [
      { title: 'Overflow-Annahme', tag: 'nach 3× klingeln', icon: 'clock',
        desc: 'Der Assistent geht erst ran, wenn Ihr Team es nicht schafft.',
        detailedDesc: 'Das ist der entscheidende Unterschied zum Callcenter-Ersatz: Ihre Leute bleiben der erste Kontakt. Der Assistent verhindert nur, dass es beim Klingeln bleibt.',
        features: ['Schwelle frei einstellbar', 'Kein Eingriff, solange jemand abnimmt',
                   'Nachts und am Wochenende durchgehend', 'Sofortige Übergabe, wenn jemand frei wird'] },
      { title: 'Terminbuchung', tag: 'direkt im Planer', icon: 'workflow',
        desc: 'Werkstatttermine werden am Telefon vergeben, und binden Personal.',
        detailedDesc: 'Der Assistent kennt Ihre freien Kapazitäten und bucht direkt in den bestehenden Werkstattplaner. Bestätigung und Erinnerung laufen automatisch.',
        features: ['Anbindung an den vorhandenen Planer', 'Nur echte freie Slots werden angeboten',
                   'Bestätigung per SMS oder WhatsApp', 'Erinnerung senkt Nichterscheinen messbar'] },
      { title: 'Anliegen-Erkennung', tag: 'richtig zugeordnet', icon: 'brain',
        desc: 'Nicht jeder Anruf gehört in denselben Topf.',
        detailedDesc: 'Probefahrt, Servicetermin, Teileanfrage oder Frage zu einem Inserat, der Assistent erkennt das Anliegen und leitet den Vorgang an die richtige Stelle weiter.',
        features: ['Unterscheidung nach Anliegen', 'Fahrzeugbezug wird miterfasst',
                   'Weiterleitung an die zuständige Abteilung', 'Transkript für die Nachbereitung'] },
      { title: 'Transparenz', tag: 'nachvollziehbar', icon: 'security',
        desc: 'Ein Assistent, dem man nicht zuhören kann, ist ein Risiko.',
        detailedDesc: 'Jedes Gespräch wird transkribiert und abgelegt. Sie können jederzeit prüfen, was gesagt wurde, und die Antwortlogik anpassen.',
        features: ['Volltext-Transkript je Anruf', 'Ablage in der Lead-Historie',
                   'Kennzeichnung als digitaler Assistent', 'Anpassbare Gesprächsführung'] }
    ],

    faq: [
      { q: 'Unsere Kunden wollen doch keine KI am Telefon.',
        a: 'Die Alternative ist nicht Ihr Mitarbeiter, die Alternative ist das Besetztzeichen. Der Assistent springt nur ein, wenn ohnehin niemand rangehen kann. Und er sagt von sich aus, dass er ein digitaler Assistent ist.' },
      { q: 'Ersetzt das unsere Telefonzentrale?',
        a: 'Nein, und das ist Absicht. Er läuft als Overflow parallel zur bestehenden Anlage. Ihre Leute bleiben der erste Kontakt, der Assistent fängt nur ab, was sonst verloren ginge.' },
      { q: 'Können wir hören, was er gesagt hat?',
        a: 'Ja. Jedes Gespräch wird transkribiert und in der Lead-Historie abgelegt. Sie sehen jederzeit, was besprochen wurde, und können die Gesprächsführung anpassen.' },
      { q: 'Muss der Anrufer wissen, dass er mit einer Maschine spricht?',
        a: 'Ja, und das setzen wir von vornherein um. Der Assistent weist zu Beginn darauf hin. Das ist nicht nur Vorgabe des EU AI Act, es ist auch die Grundlage dafür, dass Kunden es akzeptieren.' },
      { q: 'mobile.de bietet so etwas kostenlos an. Warum dann Sie?',
        a: 'Nutzen Sie das ruhig, es ist ein gutes Angebot. Es greift nur bei Anrufen zu Inseraten auf dieser Plattform. Ihr Servicekunde, der einen Werkstatttermin will, Ihr Bestandskunde nach der HU und jeder Anruf über Website, Google oder Empfehlung hängen an keinem Inserat. Genau dort setzen wir an, und dort bleiben Gespräch, Kontakt und Termin in Ihren Systemen statt im Portal.' },
      { q: 'Bucht der Assistent auch wirklich Termine?',
        a: 'Ja, und wir bauen ihn nicht anders. Laut TÜV NORD INSIGHT 2026 hebt ein Assistent die Zufriedenheit mit der Erreichbarkeit von 66 auf 75 Prozent. Kann er keine Termine buchen, steigt die Unzufriedenheit dagegen auf 12 Prozent, also über den Wert ganz ohne Assistent. Ohne Anbindung an Ihren Planer wäre das Ergebnis schlechter als der Zustand vorher.' }
    ]
  },

  /* ── 03 · Aftersales-Reaktivierung ────────────────────── */
  'aftersales': {
    meta: { number: '03', total: '07', title: 'Aftersales-Motor',
            tagline: 'Der Kunde verschwindet nach dem Kauf.' },

    hero: {
      headline: 'Aftersales-Motor',
      subline: 'Kunden kommen zurück, ohne dass jemand daran denken muss.'
    },

    showcaseTitle: 'Zwischen Fahrzeugkauf und nächstem Werkstattkontakt fehlt der Mechanismus',
    showcaseSubtitle: 'Keine HU-Erinnerung, keine Inspektions-Kampagne, keine Räderwechsel-Einladung, kein Trigger zum Leasingende. Die Daten dafür liegen vollständig im DMS, sie werden nur nicht genutzt.',

    benefitCards: [
      { number: '42 %',    label: 'der Händler',   desc: 'glauben, sie melden sich zu selten (TÜV NORD 2026)', icon: 'chart-bar' },
      { number: '11 %',    label: 'der Kunden',    desc: 'sehen das genauso. 77 % sagen: genau richtig',       icon: 'users' },
      { number: '66 %',    label: 'wollen Abos',   desc: 'digital zubuchbare Service-Pakete, nur 45 % bieten sie', icon: 'target' },
      { number: '604 €',   label: 'je Reparatur',  desc: 'Durchschnitt im Handel (DAT Report 2026)',           icon: 'currency-euro' },
      { number: '38 %',    label: 'freier Handel', desc: 'vs. 36 % Markenhandel bei Gebrauchten (DAT 2026)',   icon: 'workflow' },
      { number: '1 Klick', label: 'zum Termin',    desc: 'aus der Erinnerung direkt in den Kalender',          icon: 'lightning' }
    ],

    features: [
      'HU- und AU-Fälligkeit als automatischer Anlass',
      'Inspektionsintervall nach Zeit und Laufleistung',
      'Saisonkampagnen: Räderwechsel, Klimaservice, Urlaubs-Check',
      'Garantieende als Anlass für die Anschlussgarantie',
      'Leasing- und Finanzierungsende als Verkaufschance für das Folgefahrzeug',
      'Kanäle: E-Mail, Brief und vor allem WhatsApp',
      'Terminbuchung mit einem Klick aus der Nachricht heraus',
      'Kein Doppelversand, wenn der Kunde ohnehin schon da war',
      'Ansprache pro Fahrzeug, nicht pauschal an den Verteiler',
      'Lesender Zugriff auf das DMS, geschrieben wird in unsere Datenschicht'
    ],

    roiHeadline: 'Der Bestand ist da. Er wird nur nicht angesprochen.',
    roiSubline: 'Rechnen Sie selbst: 4.000 Fahrzeuge im Bestand, 5 Prozent zusätzliche Reaktivierung, das sind 200 Werkstattdurchgänge. Bei 604 Euro Durchschnitt je Reparatur (DAT Report 2026) rund 120.000 Euro im Jahr.',
    hasWaveBackground: true,

    serviceTypes: [
      { title: 'HU / AU', tag: 'planbarer Anlass', icon: 'clock',
        desc: 'Die Hauptuntersuchung steht in festen Abständen an, und wird trotzdem selten aktiv angesprochen.',
        detailedDesc: 'Aus dem Fahrzeugbestand ergibt sich, wann welches Fahrzeug fällig wird. Daraus wird eine automatische Einladung mit Terminvorschlag.',
        features: ['Fälligkeiten aus dem Bestand', 'Vorlauf frei wählbar',
                   'Terminvorschlag direkt in der Nachricht', 'Erinnerung, wenn nicht reagiert wurde'] },
      { title: 'Saison', tag: 'Räder, Klima, Urlaub', icon: 'workflow',
        desc: 'Räderwechsel-Saison ist Stoßzeit, und damit die schlechteste Zeit für Telefonakquise.',
        detailedDesc: 'Die Einladung geht vor der Welle raus, gestaffelt über mehrere Wochen. Das glättet die Auslastung und füllt die Randzeiten.',
        features: ['Gestaffelter Versand statt Stoßbetrieb', 'Nur an passende Fahrzeuge',
                   'Direkte Terminbuchung', 'Auslastung wird planbarer'] },
      { title: 'Leasingende', tag: 'Verkaufschance', icon: 'currency-euro',
        desc: 'Das Ende der Finanzierung ist der natürlichste Anlass für das Folgefahrzeug.',
        detailedDesc: 'Der Trigger läuft rechtzeitig vor Vertragsende und übergibt den Vorgang an den Verkauf, mit passenden Fahrzeugen aus dem eigenen Bestand.',
        features: ['Vorlauf vor Vertragsende', 'Übergabe an den Verkauf',
                   'Passende Fahrzeuge aus dem Bestand', 'Anschlussgarantie als Alternative'] },
      { title: 'Anschlussgarantie', tag: 'Bindung', icon: 'security',
        desc: 'Nach Garantieende wandern Kunden zur freien Werkstatt ab.',
        detailedDesc: 'Ein Angebot zum richtigen Zeitpunkt hält den Kunden im Haus, und macht aus einem Abwanderungsrisiko wiederkehrenden Umsatz.',
        features: ['Trigger zum Garantieende', 'Angebot passend zum Fahrzeug',
                   'Nachfassen, wenn keine Reaktion kommt', 'Wirkung im Report sichtbar'] }
    ],

    faq: [
      { q: 'Woher kommen die Daten für die Erinnerungen?',
        a: 'Aus Ihrem DMS. Fahrzeug, Halter, Erstzulassung, letzte HU, Laufleistung und Servicehistorie sind dort hinterlegt. Wir lesen diese Daten aus, geschrieben wird ausschließlich in unsere eigene Datenschicht.' },
      { q: 'Ist das nicht einfach ein Newsletter?',
        a: 'Nein. Ein Newsletter geht an alle zum selben Zeitpunkt. Hier löst jedes Fahrzeug seinen eigenen Anlass aus: diese HU wird fällig, dieser Leasingvertrag endet, diese Garantie läuft aus. Der Kunde bekommt nur, was ihn betrifft.' },
      { q: 'Wie stellt ihr sicher, dass niemand doppelt angeschrieben wird?',
        a: 'Vor jedem Versand wird gegen die aktuellen Werkstattdaten geprüft. Wer den Termin schon hat oder gerade da war, fällt raus. Das ist der Unterschied zwischen einer Kampagne und einer Belästigung.' },
      { q: 'Dürfen wir Bestandskunden überhaupt anschreiben?',
        a: 'Für bestehende Kundenbeziehungen gibt es enge, aber nutzbare Spielräume, vor allem bei servicebezogener Kommunikation zum eigenen Fahrzeug. Wir richten Einwilligungen, Widerspruchsmöglichkeit und Dokumentation sauber ein und stimmen den Rahmen vorab mit Ihnen ab.' }
    ]
  },

  /* ── 04 · Standzeiten & Bestand ───────────────────────── */
  'standzeiten': {
    meta: { number: '04', total: '07', title: 'Standzeiten senken',
            tagline: 'Jeder Standtag kostet Geld.' },

    hero: {
      headline: 'Standzeiten senken',
      subline: 'Sehen, welcher Wagen Geld kostet, bevor es teuer wird.'
    },

    showcaseTitle: 'Ein Drittel des Bestands steht länger als 90 Tage',
    showcaseSubtitle: 'Die Abverkaufssteuerung läuft in vielen Häusern nach Bauchgefühl und Excel. Welcher Wagen Anfragen bekommt, aber keine Antworten, das sieht niemand.',

    benefitCards: [
      { number: 'jedes 3.', label: 'Fahrzeug',     desc: 'steht länger als 90 Tage (DAT-Barometer 06/2026)',  icon: 'chart-bar' },
      { number: '25 €',    label: 'pro Tag',       desc: 'Standkosten je Pkw (DAT-Barometer 06/2026)',        icon: 'currency-euro' },
      { number: '90',      label: 'Tage Schwelle', desc: 'ab hier gilt ein Fahrzeug als Risikobestand',       icon: 'clock' },
      { number: 'live',    label: 'statt monatlich',desc: 'Kapitalbindung jederzeit einsehbar',               icon: 'lightning' },
      { number: 'je Fzg.', label: 'Anfragen',      desc: 'sichtbar, welcher Wagen gefragt ist, und welcher nicht', icon: 'target' },
      { number: 'Alarm',   label: 'statt Zufall',  desc: 'Meldung, bevor die Schwelle gerissen wird',         icon: 'security' }
    ],

    features: [
      'Standtage und Kapitalbindung je Fahrzeug, live',
      'Anfragen und Antwortquote pro Fahrzeug nebeneinander',
      'Alarm vor dem Erreichen der 90-Tage-Schwelle, nicht danach',
      'Marktpreis-Abgleich mit vergleichbaren Fahrzeugen in den Börsen',
      'Repricing-Vorschläge auf Datenbasis statt Bauchgefühl',
      'Abverkaufskampagnen an passende Interessenten aus der Lead-Historie',
      'Standkosten in Euro, nicht in Tagen, für die Entscheidung',
      'Standortübergreifende Sicht bei mehreren Häusern',
      'Kein Eingriff in Ihre Preishoheit: Vorschlag, keine Automatik',
      'Wochenreport mit den kritischen Fahrzeugen'
    ],

    roiHeadline: 'Standzeit ist eine Zahl, die sich in Euro umrechnen lässt.',
    roiSubline: 'Ein Haus mit 500 Gebrauchtwagen im Jahr und 80 Standtagen im Schnitt bindet rund eine Million Euro Standkosten. Zwanzig Tage weniger sind 250.000 Euro. Grundlage: 25 Euro je Fahrzeug und Tag laut DAT-Barometer.',
    hasWaveBackground: true,

    serviceTypes: [
      { title: 'Standtage-Cockpit', tag: 'live', icon: 'chart-bar',
        desc: 'Wie lange steht welcher Wagen, und was hat er bis heute gekostet?',
        detailedDesc: 'Jedes Fahrzeug mit Standtagen, gebundenem Kapital und aufgelaufenen Standkosten. Sortierbar nach dem, was am meisten weh tut.',
        features: ['Standtage je Fahrzeug', 'Aufgelaufene Kosten in Euro',
                   'Kapitalbindung gesamt', 'Sortierung nach Dringlichkeit'] },
      { title: 'Anfrage-Abgleich', tag: 'der blinde Fleck', icon: 'target',
        desc: 'Ein Fahrzeug mit vielen Anfragen und wenig Antworten ist kein Preisproblem.',
        detailedDesc: 'Wir stellen Anfragen und Antwortquote je Fahrzeug nebeneinander. Damit trennen Sie das Preisproblem vom Prozessproblem, bevor Sie den Preis senken.',
        features: ['Anfragen je Fahrzeug', 'Antwortquote je Fahrzeug',
                   'Trennung Preis- vs. Prozessproblem', 'Hinweis auf unbeantwortete Anfragen'] },
      { title: 'Marktpreis', tag: 'Vergleich', icon: 'currency-euro',
        desc: 'Preisliche Reaktion auf Marktdaten erfolgt oft spät oder gar nicht.',
        detailedDesc: 'Abgleich mit vergleichbaren Fahrzeugen in den Börsen, daraus ein begründeter Vorschlag. Entschieden wird bei Ihnen, nicht im System.',
        features: ['Abgleich mit Börsenpreisen', 'Begründeter Vorschlag statt Automatik',
                   'Historie der Preisänderungen', 'Wirkung auf Anfragen sichtbar'] },
      { title: 'Abverkauf', tag: 'gezielt', icon: 'workflow',
        desc: 'Zu vielen Standfahrzeugen gibt es längst passende Interessenten in der Historie.',
        detailedDesc: 'Wer vor Monaten ein ähnliches Fahrzeug angefragt hat, bekommt eine gezielte Nachricht, statt einer Rundmail an den ganzen Verteiler.',
        features: ['Abgleich mit der Lead-Historie', 'Gezielte statt pauschale Ansprache',
                   'Über WhatsApp oder E-Mail', 'Reaktionen laufen zurück in die Pipeline'] }
    ],

    faq: [
      { q: 'Woher kommen die Standtage?',
        a: 'Aus Ihrem Bestand im DMS beziehungsweise aus den Börsendaten, je nachdem, was bei Ihnen führend ist. Wir lesen den Bestand aus und rechnen Standtage, Kapitalbindung und Kosten daraus.' },
      { q: 'Ändert das System selbstständig unsere Preise?',
        a: 'Nein. Sie bekommen einen begründeten Vorschlag mit den Vergleichsdaten daneben. Die Entscheidung bleibt bei Ihnen. Automatisches Repricing bauen wir nur, wenn Sie es ausdrücklich wollen.' },
      { q: 'Was bringt der Abgleich von Anfragen und Standtagen?',
        a: 'Er trennt zwei Probleme, die sonst gleich aussehen. Ein Fahrzeug ohne Anfragen ist wahrscheinlich zu teuer oder falsch inseriert. Ein Fahrzeug mit vielen Anfragen und wenig Antworten hat kein Preis-, sondern ein Prozessproblem.' },
      { q: 'Funktioniert das auch über mehrere Standorte?',
        a: 'Ja. Der Bestand wird standortübergreifend zusammengeführt, lässt sich aber je Haus filtern. Gerade bei mehreren Standorten wird sichtbar, wo ein Fahrzeug besser stünde.' }
    ]
  },

  /* ── 05 · Werkstatt-Auslastung ────────────────────────── */
  'werkstatt': {
    meta: { number: '05', total: '07', title: 'Werkstatt-Auslastung',
            tagline: 'Ausgelastet, aber ineffizient terminiert.' },

    hero: {
      headline: 'Werkstatt-Auslastung',
      subline: 'Online buchbar, Lücken gefüllt, Zusatzarbeiten per Klick freigegeben.'
    },

    showcaseTitle: 'Die Werkstatt ist voll, und trotzdem bleibt Kapazität liegen',
    showcaseSubtitle: 'Telefonische Terminvergabe bindet Personal, Nichterscheinen kostet Kapazität, und kurzfristige Lücken durch Stornierungen bleiben unbesetzt, weil niemand Zeit hat, Ersatz zu akquirieren.',

    benefitCards: [
      { number: '81 %',    label: 'würden buchen',  desc: 'Servicetermine über ein Kundenportal (TÜV NORD 2026)', icon: 'workflow' },
      { number: '24 %',    label: 'bieten Freigabe', desc: 'digitale Auftragsfreigabe, 49 % planen sie',        icon: 'users' },
      { number: '24/7',    label: 'buchbar',        desc: 'auch dann, wenn niemand ans Telefon kann',        icon: 'clock' },
      { number: '1 Klick', label: 'Freigabe',       desc: 'für Zusatzarbeiten statt Rückruf und Warteschleife', icon: 'lightning' },
      { number: 'Lücken',  label: 'gefüllt',        desc: 'Warteliste rückt bei Stornierung automatisch nach', icon: 'target' },
      { number: 'live',    label: 'Statusupdate',   desc: '„Ihr Fahrzeug ist fertig" ohne Anruf',            icon: 'security' }
    ],

    features: [
      'Online-Terminbuchung über Web, WhatsApp und den Telefon-Assistenten',
      'Anbindung an den bestehenden Werkstattplaner, befüllend, nicht ersetzend',
      'Automatische Terminbestätigung und Erinnerung',
      'Warteliste, die bei Stornierungen automatisch nachrückt',
      'Digitale Freigabe von Zusatzarbeiten per WhatsApp',
      'Statusupdate an den Kunden, ohne dass jemand anruft',
      'Kapazität nach Arbeitswert statt nach Terminanzahl',
      'Randzeiten gezielt füllen statt Stoßzeiten überlasten',
      'Auslastung je Hebebühne und Mitarbeiter sichtbar',
      'Kein Systemwechsel. Ihr Planer bleibt führend'
    ],

    roiHeadline: 'Der versteckte Umsatzhebel sind die Zusatzarbeiten.',
    roiSubline: 'Heute scheitern sie oft daran, dass der Kunde telefonisch nicht erreichbar ist. Eine Freigabe per Klick verändert das unmittelbar.',
    hasWaveBackground: true,

    serviceTypes: [
      { title: 'Online-Buchung', tag: 'rund um die Uhr', icon: 'clock',
        desc: 'Terminvergabe am Telefon bindet genau das Personal, das ohnehin fehlt.',
        detailedDesc: 'Kunden buchen selbst, im Web, per WhatsApp oder über den Telefon-Assistenten. Angeboten werden nur Slots, die im Planer wirklich frei sind.',
        features: ['Buchung über Web und WhatsApp', 'Nur tatsächlich freie Kapazität',
                   'Automatische Bestätigung', 'Kein Doppelbelegen'] },
      { title: 'Erinnerung', tag: 'gegen Nichterscheinen', icon: 'target',
        desc: 'Jeder nicht wahrgenommene Termin ist verlorene Kapazität.',
        detailedDesc: 'Automatische Erinnerungen senken das Nichterscheinen nachweislich. Wer absagt, gibt den Slot frei, und die Warteliste rückt nach.',
        features: ['Erinnerung vor dem Termin', 'Absage mit einem Klick',
                   'Slot wird automatisch neu vergeben', 'Warteliste rückt nach'] },
      { title: 'Zusatzarbeiten', tag: 'Freigabe per Klick', icon: 'currency-euro',
        desc: '„Bremsbeläge bei 20 %, jetzt mitmachen?" Diese Frage erreicht den Kunden oft nicht.',
        detailedDesc: 'Statt Rückruf und Warteschleife bekommt der Kunde die Anfrage per WhatsApp, mit Foto, Preis und Ja/Nein. Die Antwort landet direkt beim Serviceberater.',
        features: ['Anfrage mit Bild und Preis', 'Antwort per Klick',
                   'Direkt zurück an den Serviceberater', 'Dokumentierte Freigabe'] },
      { title: 'Auslastung', tag: 'nach Arbeitswert', icon: 'chart-bar',
        desc: 'Fünf kurze Termine sind nicht dasselbe wie zwei große.',
        detailedDesc: 'Die Auslastung wird nach Arbeitswert gerechnet, nicht nach Terminanzahl. Damit sehen Sie, wo wirklich Luft ist.',
        features: ['Auslastung nach Arbeitswert', 'Je Hebebühne und Mitarbeiter',
                   'Randzeiten sichtbar', 'Planung statt Reaktion'] }
    ],

    faq: [
      { q: 'Müssen wir unseren Werkstattplaner ersetzen?',
        a: 'Nein. Ihr Planer bleibt das führende System. Wir befüllen ihn, über Online-Buchung, WhatsApp und den Telefon-Assistenten. Ein Planerwechsel ist weder nötig noch sinnvoll.' },
      { q: 'Was passiert bei einer kurzfristigen Absage?',
        a: 'Der Slot wird automatisch freigegeben und der Warteliste angeboten. Genau diese kurzfristigen Lücken bleiben heute meist unbesetzt, weil niemand Zeit hat, hinterherzutelefonieren.' },
      { q: 'Wie läuft die Freigabe von Zusatzarbeiten?',
        a: 'Der Serviceberater schickt die Anfrage mit Foto und Preis über WhatsApp. Der Kunde antwortet mit einem Klick, die Freigabe ist dokumentiert und landet direkt zurück im Vorgang.' },
      { q: 'Funktioniert das mit unserem Planer?',
        a: 'Die gängigen Systeme lassen sich anbinden, teils über eine Schnittstelle, teils über einen lesenden Zugriff. Welcher Weg bei Ihnen möglich ist, klären wir vor dem Angebot, nicht danach.' }
    ]
  },

  /* ── 06 · Bewertungen & Local SEO ─────────────────────── */
  'bewertungen': {
    meta: { number: '06', total: '07', title: 'Bewertungen',
            tagline: 'Google ist der erste Kontaktpunkt.' },

    hero: {
      headline: 'Bewertungen',
      subline: 'Nach jedem Auftrag fragen. Kritik intern klären, nicht öffentlich.'
    },

    showcaseTitle: 'Der erste Eindruck entsteht vor dem ersten Anruf',
    showcaseSubtitle: 'Die meisten Häuser sammeln Bewertungen nicht systematisch und antworten nicht auf negative. Dabei entscheidet das Profil darüber, ob überhaupt angerufen wird.',

    benefitCards: [
      { number: '38 %',   label: 'wechselten',    desc: 'den Händler wegen Google-Rezensionen (TÜV NORD 2026)', icon: 'chart-bar' },
      { number: '79 %',   label: 'antworten',     desc: 'auf Bewertungen, aber nur 21 % mit System',            icon: 'target' },
      { number: 'nach',   label: 'jedem Auftrag', desc: 'automatische Anfrage statt gelegentlich',           icon: 'workflow' },
      { number: 'intern', label: 'zuerst',        desc: 'unzufriedene Kunden vor der Öffentlichkeit klären', icon: 'security' },
      { number: '100 %',  label: 'beantwortet',   desc: 'auch die negativen, mit Vorschlag statt Vorlage',   icon: 'brain' },
      { number: 'lokal',  label: 'sichtbar',      desc: 'gepflegtes Profil je Standort',                     icon: 'users' }
    ],

    features: [
      'Automatische Bewertungsanfrage nach jedem abgeschlossenen Werkstattauftrag',
      'Auslöser direkt aus dem Auftragsabschluss, nicht aus einer Liste',
      'Unzufriedene Kunden landen zuerst in einem internen Feedback-Kanal',
      'Antwortvorschläge für Bewertungen. Sie entscheiden, was rausgeht',
      'Pflege des Google-Unternehmensprofils je Standort',
      'Übersicht über Bewertungsverlauf und Durchschnitt',
      'Benachrichtigung bei neuen negativen Bewertungen',
      'Kein Kaufen, kein Filtern, nur systematisches Fragen',
      'Auswertung nach Standort und Abteilung',
      'Verknüpfung mit dem Werkstattauftrag für den Kontext'
    ],

    roiHeadline: 'Bewertungen entscheiden, ob überhaupt angerufen wird.',
    roiSubline: 'Wer erst nach dem Anruf überzeugt, hat die Kunden bereits verloren, die vorher weitergeklickt haben.',
    hasWaveBackground: true,

    serviceTypes: [
      { title: 'Automatische Anfrage', tag: 'nach dem Auftrag', icon: 'workflow',
        desc: 'Bewertungen entstehen nicht von selbst, man muss fragen.',
        detailedDesc: 'Der Auslöser kommt aus dem Auftragsabschluss. Jeder Kunde wird gefragt, nicht nur die, an die jemand gerade denkt.',
        features: ['Auslöser aus dem Werkstattauftrag', 'Zeitpunkt frei wählbar',
                   'Kanal per E-Mail oder WhatsApp', 'Keine Doppelanfragen'] },
      { title: 'Interner Kanal', tag: 'vor der Öffentlichkeit', icon: 'security',
        desc: 'Unzufriedene Kunden sollten zuerst mit Ihnen sprechen, nicht mit Google.',
        detailedDesc: 'Wer unzufrieden antwortet, landet in einem internen Feedback-Kanal. Sie bekommen die Chance, das Problem zu lösen, bevor es öffentlich wird.',
        features: ['Abfrage der Zufriedenheit vorab', 'Interner Kanal bei Kritik',
                   'Benachrichtigung an die Leitung', 'Nachverfolgung bis zur Klärung'] },
      { title: 'Antworten', tag: 'auch auf negative', icon: 'brain',
        desc: 'Eine unbeantwortete negative Bewertung wirkt schlimmer als die Bewertung selbst.',
        detailedDesc: 'Sie bekommen einen Antwortvorschlag, der zum Vorgang passt. Rausgehen tut nur, was Sie freigeben.',
        features: ['Vorschlag passend zum Vorgang', 'Freigabe durch Sie',
                   'Kein automatisches Veröffentlichen', 'Tonalität einstellbar'] },
      { title: 'Local SEO', tag: 'je Standort', icon: 'target',
        desc: 'Das Google-Profil ist bei lokaler Suche oft wichtiger als die Website.',
        detailedDesc: 'Öffnungszeiten, Leistungen, Fotos und Beiträge werden gepflegt, je Standort, nicht pauschal für das ganze Haus.',
        features: ['Profilpflege je Standort', 'Aktuelle Öffnungszeiten und Leistungen',
                   'Beiträge und Fotos', 'Auswertung der Sichtbarkeit'] }
    ],

    faq: [
      { q: 'Kauft ihr Bewertungen oder filtert ihr sie?',
        a: 'Weder noch. Beides ist unzulässig und fliegt auf. Wir sorgen dafür, dass systematisch nach jedem Auftrag gefragt wird, das allein verändert das Profil, weil die zufriedenen Kunden sonst schlicht nichts schreiben.' },
      { q: 'Ist es legitim, unzufriedene Kunden intern abzufangen?',
        a: 'Der Kunde kann jederzeit öffentlich bewerten, wir hindern niemanden daran. Wir geben ihm nur zuerst die Möglichkeit, das Problem direkt mit Ihnen zu klären. Das ist gelebter Service, keine Unterdrückung.' },
      { q: 'Wer antwortet auf die Bewertungen?',
        a: 'Sie. Wir liefern einen Vorschlag, der den konkreten Vorgang kennt, und Sie geben frei. Automatisch veröffentlicht wird nichts.' },
      { q: 'Funktioniert das bei mehreren Standorten?',
        a: 'Ja, und dort ist der Effekt am größten. Jeder Standort hat sein eigenes Profil und seine eigene Auswertung. Sie sehen, welches Haus abfällt.' }
    ]
  },

  /* ── 07 · Inhaber-Cockpit ─────────────────────────────── */
  'cockpit': {
    meta: { number: '07', total: '07', title: 'Inhaber-Cockpit',
            tagline: 'Excel ist keine Antwort auf die Zukunft.' },

    hero: {
      headline: 'Inhaber-Cockpit',
      subline: 'Alle Zahlen an einem Ort. Ohne Excel, ohne Monatsabschluss.'
    },

    showcaseTitle: 'Die Kennzahlen liegen verteilt, und keiner sieht das Ganze',
    showcaseSubtitle: 'DMS, Börsenportale, Buchhaltung, Excel: der Inhaber sieht weder Lead-Konversion noch Standzeiten noch Werkstattauslastung in Echtzeit. Das Cockpit entsteht als Ergebnis der anderen Bausteine, nicht als deren Voraussetzung.',

    benefitCards: [
      { number: '1',     label: 'Übersicht',      desc: 'statt vier Systemen und einer Tabelle',   icon: 'target' },
      { number: 'live',  label: 'statt monatlich',desc: 'Zahlen zum Zeitpunkt der Entscheidung',   icon: 'lightning' },
      { number: 'alle',  label: 'Standorte',      desc: 'einzeln und zusammengefasst',             icon: 'users' },
      { number: '0',     label: 'Excel-Pflege',   desc: 'keine manuelle Zusammenstellung mehr',    icon: 'workflow' },
      { number: 'Trend', label: 'statt Momentaufnahme', desc: 'Entwicklung über Wochen sichtbar',  icon: 'chart-bar' },
      { number: 'mobil', label: 'abrufbar',       desc: 'auch vom Telefon aus',                    icon: 'security' }
    ],

    features: [
      'Lead-Eingang, Reaktionszeit und Konversion je Kanal',
      'Standzeiten und Kapitalbindung über den gesamten Bestand',
      'Werkstattauslastung nach Arbeitswert',
      'Aftersales-Reaktivierung und Wiederkehrquote',
      'Bewertungsverlauf je Standort',
      'Vergleich zwischen Standorten und Abteilungen',
      'Entwicklung über Zeit statt Momentaufnahme',
      'Rollenabhängige Sichten für Inhaber, Verkaufs- und Serviceleitung',
      'Mobil abrufbar, ohne eigene App',
      'EU-Hosting, DSGVO-konform, keine Lizenzgebühr pro Nutzer'
    ],

    roiHeadline: 'Das Cockpit ist das Ergebnis, nicht der Anfang.',
    roiSubline: 'Wenn Anfragen, Telefonie, Termine und Kampagnen über eine Infrastruktur laufen, entsteht der einheitliche Datenbestand von selbst.',
    hasWaveBackground: true,

    serviceTypes: [
      { title: 'Vertrieb', tag: 'Leads & Konversion', icon: 'chart-bar',
        desc: 'Wie viele Anfragen kommen rein, wie schnell wird geantwortet, was wird daraus?',
        detailedDesc: 'Eingang je Kanal, Reaktionszeit, Konversion bis zum Termin und bis zum Abschluss, je Verkäufer und je Standort.',
        features: ['Lead-Eingang je Kanal', 'Reaktionszeit als Kennzahl',
                   'Konversion bis zum Abschluss', 'Vergleich je Verkäufer'] },
      { title: 'Bestand', tag: 'Standzeiten & Kapital', icon: 'currency-euro',
        desc: 'Wie viel Kapital steht wie lange auf dem Hof?',
        detailedDesc: 'Standtage, gebundenes Kapital und aufgelaufene Standkosten über den gesamten Bestand, mit den kritischen Fahrzeugen obenauf.',
        features: ['Standtage über den Bestand', 'Kapitalbindung in Euro',
                   'Risikobestand ab 90 Tagen', 'Entwicklung über Zeit'] },
      { title: 'Service', tag: 'Auslastung', icon: 'workflow',
        desc: 'Ist die Werkstatt wirklich ausgelastet, oder nur voll terminiert?',
        detailedDesc: 'Auslastung nach Arbeitswert, Nichterscheinen, Durchsatz und die Quote der freigegebenen Zusatzarbeiten.',
        features: ['Auslastung nach Arbeitswert', 'Nichterscheinen-Quote',
                   'Durchsatz je Woche', 'Zusatzarbeiten-Quote'] },
      { title: 'Standorte', tag: 'im Vergleich', icon: 'users',
        desc: 'Bei mehreren Häusern verschwinden Unterschiede im Durchschnitt.',
        detailedDesc: 'Jede Kennzahl lässt sich je Standort filtern und nebeneinanderlegen. Damit wird sichtbar, wo ein Haus abfällt, und woran es liegt.',
        features: ['Filter je Standort', 'Direkter Vergleich',
                   'Gesamtsicht und Einzelsicht', 'Auffälligkeiten hervorgehoben'] }
    ],

    faq: [
      { q: 'Warum kommt das Cockpit zuletzt und nicht zuerst?',
        a: 'Weil ein Dashboard nur so gut ist wie die Daten darin. Wenn Anfragen, Telefonie, Termine und Kampagnen über eine gemeinsame Infrastruktur laufen, entsteht der einheitliche Datenbestand automatisch. Umgekehrt bauen Sie ein teures Schaufenster auf lückenhafte Daten.' },
      { q: 'Ersetzt das unser DMS?',
        a: 'Nein. Das DMS bleibt führend für Auftrag und Rechnung. Wir sind führend für Kommunikation und Vertrieb, und legen eine Auswertungsschicht darüber. Wer verspricht, das DMS zu ersetzen, unterschätzt Herstellerzertifizierung, Buchhaltung und Gewohnheit.' },
      { q: 'Wer kann was sehen?',
        a: 'Die Sichten sind rollenabhängig. Die Verkaufsleitung sieht Vertriebszahlen, die Serviceleitung die Werkstatt, der Inhaber alles, auch standortübergreifend.' },
      { q: 'Brauchen wir dafür eine App?',
        a: 'Nein. Das Cockpit läuft im Browser und ist auf dem Telefon genauso bedienbar wie am Schreibtisch.' }
    ]
  }

};
