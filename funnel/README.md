# Nuroy Funnel: Dashboard Landing Page

Diese Funnel-Seite ist eine **isolierte Landing Page** für bezahlte Werbung (Meta Ads, Google Ads).

## 📋 Setup-Checklist

### 1. Assets erstellen & hochladen

#### VSL-Video
- [ ] 3-Minuten-Video erstellen (Dashboard-Erklärung)
- [ ] Video auf YouTube/Vimeo hochladen
- [ ] Video-ID eintragen in `dashboard-jetzt.html` (Zeile ~95):
  ```html
  <lite-youtube videoid="DEINE_VIDEO_ID"></lite-youtube>
  ```

#### Dashboard-Mockups
- [ ] Haupt-Mockup erstellen: `/assets/dashboard-mockup-main.png` (1600px breit)
- [ ] Marketing-Variante: `/assets/dashboard-marketing.png`
- [ ] Sales-Variante: `/assets/dashboard-sales.png`
- [ ] All-in-One bleibt gleich wie Haupt-Mockup

#### Weitere Assets
- [ ] OG-Image erstellen: `/assets/funnel-og-image.jpg` (1200×630px)
- [ ] Kundenlogos zu `/assets/clients/` hinzufügen (falls mehr gewünscht)

### 2. Tracking einrichten

#### Meta Pixel
1. Facebook Business Manager → Pixel ID erhalten
2. In `dashboard-jetzt.html` (Zeile ~47) einkommentieren & ID eintragen:
   ```javascript
   fbq('init', 'DEINE_PIXEL_ID');
   ```

#### Google Tag Manager
1. GTM → Tag ID erhalten
2. In `dashboard-jetzt.html` (Zeile ~62) einkommentieren & ID eintragen:
   ```javascript
   gtag('config', 'DEINE_GTM_ID');
   ```

### 3. Calendly/Booking einrichten

1. Calendly-Link erstellen für Discovery-Call
2. Embed-Code erhalten
3. In `dashboard-jetzt.html` (Zeile ~459) einfügen:
   ```html
   <div class="calendly-inline-widget"
        data-url="https://calendly.com/DEIN_LINK"
        style="min-width:320px;height:630px;">
   </div>
   ```
4. Calendly-Script einkommentieren (Zeile ~509)

### 4. Content anpassen (optional)

Alle Texte sind in `funnel-content.js` zentral gespeichert und können dort angepasst werden:
- Headlines
- CTAs
- FAQ-Fragen/Antworten
- Prozess-Beschreibungen

## 🚀 Testing

Vor Live-Schaltung testen:

- [ ] **Lokal testen**: `dashboard-jetzt.html` im Browser öffnen
- [ ] **VSL lädt**: Video-Player funktioniert
- [ ] **CTAs funktionieren**: Alle Buttons scrollen zu #booking
- [ ] **Sticky-CTA erscheint**: Nach Hero-Scroll
- [ ] **Mockup-Varianten**: Tab-Switcher funktioniert
- [ ] **FAQ-Accordion**: Details öffnen/schließen
- [ ] **Mobile-Ansicht**: Responsive auf Smartphone testen
- [ ] **Tracking feuert**: Browser DevTools → Network → fb/gtm Events

## 📊 Tracking-Events

Folgende Events werden automatisch getrackt (siehe `funnel-scripts.js`):

| Event | Wann | Meta Pixel | Google Tag |
|-------|------|------------|------------|
| `PageView` | Seite geladen | ✓ | ✓ |
| `ViewContent` | VSL abgespielt | ✓ | ✓ |
| `Lead` | CTA geklickt | ✓ | ✓ |
| `Schedule` | Call gebucht | ✓ | ✓ |

## 🔒 SEO & Isolation

Die Funnel-Seite ist komplett vom Rest der Website isoliert:

- ✅ `robots.txt` → `Disallow: /dashboard-jetzt.html`
- ✅ Meta-Tag `noindex, nofollow`
- ✅ NICHT in Sitemap aufgenommen
- ✅ Kein Link von Hauptseite
- ✅ Logo nicht klickbar

## 📁 Dateistruktur

```
/Users/jouls/Desktop/Nuroy-Webseite/
├── dashboard-jetzt.html          ← Funnel-Hauptseite
├── funnel/
│   ├── funnel-content.js         ← Content-Daten (A/B-testbar)
│   ├── funnel-styles.css         ← Funnel-Styles
│   ├── funnel-scripts.js         ← VSL, Sticky-CTA, Tracking
│   └── README.md                 ← Diese Datei
├── robots.txt                    ← SEO Disallow
└── assets/
    ├── dashboard-mockup-main.png ← TODO: erstellen
    ├── dashboard-marketing.png   ← TODO: erstellen
    ├── dashboard-sales.png       ← TODO: erstellen
    └── funnel-og-image.jpg       ← TODO: erstellen
```

## 🧪 A/B-Testing

Um Varianten zu testen:

1. Datei duplizieren: `cp dashboard-jetzt.html dashboard-jetzt-v2.html`
2. In `funnel-content.js` Headlines/CTAs anpassen
3. Traffic splitten (50/50)
4. Conversion-Rates vergleichen

## 🆘 Support

Bei Fragen oder Problemen:
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Dokumentation: Diese README
