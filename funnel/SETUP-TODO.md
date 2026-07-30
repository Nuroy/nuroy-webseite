# 🚀 Funnel Setup: TODO Liste

Diese Datei listet alle Platzhalter auf, die noch ausgefüllt werden müssen, bevor die Funnel-Seite live gehen kann.

---

## ✅ Status

- [x] Dateistruktur erstellt
- [x] HTML-Seite erstellt
- [x] CSS-Styles erstellt
- [x] JavaScript-Funktionen erstellt
- [x] robots.txt aktualisiert
- [ ] **Assets erstellt** ⬅️ NEXT STEP
- [ ] Tracking-IDs eingetragen
- [ ] Calendly-Link eingefügt
- [ ] Live-Testing durchgeführt

---

## 📦 1. Assets erstellen (Priorität: HOCH)

### VSL-Video
**Wo:** `dashboard-jetzt.html` Zeile ~95

**Was tun:**
```html
<!-- ERSETZEN: -->
<div style="aspect-ratio: 16/9; ...">
  [VSL-Video hier einfügen]
</div>

<!-- MIT: -->
<lite-youtube videoid="DEINE_YOUTUBE_ID" params="rel=0"></lite-youtube>
<!-- ODER -->
<lite-vimeo videoid="DEINE_VIMEO_ID"></lite-vimeo>
```

**Video-Anforderungen:**
- Länge: 3-5 Minuten
- Inhalt: Dashboard-Vorteile, Beispiele, CTA
- Format: 16:9 (1920×1080)
- Upload: YouTube oder Vimeo

---

### Dashboard-Mockups
**Wo:** `/assets/` Verzeichnis

**Benötigte Dateien:**
1. `dashboard-mockup-main.png` (Haupt-Dashboard, All-in-One View)
2. `dashboard-marketing.png` (Marketing-spezifische Ansicht)
3. `dashboard-sales.png` (Sales-spezifische Ansicht)

**Mockup-Anforderungen:**
- Breite: ~1600px (hochauflösend)
- Format: PNG mit Transparenz (optional) oder JPG
- Inhalt: Mock-Daten (Umsatz, KPIs, Charts)
- Branding: Nuroy Pink (#FF2D7A) als Akzentfarbe
- Dark/Light Mode: empfohlen

**Fallback:** Falls Mockups noch nicht vorhanden, zeigt HTML automatisch Platzhalter-SVG an.

---

### OG-Image (Social Sharing)
**Wo:** `/assets/funnel-og-image.jpg`

**Anforderungen:**
- Größe: 1200×630px (Facebook/LinkedIn Standard)
- Format: JPG oder PNG
- Inhalt:
  - Headline: "Custom Dashboards für Unternehmen"
  - Subline: "Alle Tools, eine Oberfläche"
  - Nuroy Logo
  - Pink-Branding

**Wird verwendet bei:**
- Social Media Sharing aus Ads
- Preview in WhatsApp/Slack
- OG-Meta-Tag in HTML (Zeile 37)

---

### Weitere Kundenlogos (optional)
**Wo:** `/assets/clients/`

**Aktuell vorhanden:**
- `sniffys.png`
- `nomo.png`

**Weitere hinzufügen?** Einfach PNGs in `/assets/clients/` ablegen und in `dashboard-jetzt.html` (Zeile ~129) ergänzen:
```html
<img src="assets/clients/LOGO.png" alt="Kundenname">
```

---

## 🎯 2. Tracking einrichten (Priorität: HOCH)

### Meta Pixel ID
**Wo:** `dashboard-jetzt.html` Zeile 47-58

**Was tun:**
1. Facebook Business Manager → Events Manager öffnen
2. Pixel erstellen/auswählen → Pixel-ID kopieren
3. In HTML einkommentieren (Zeile 47-58)
4. `PLACEHOLDER_PIXEL_ID` ersetzen mit echter ID

**Code:**
```javascript
// Zeile 50 ändern:
fbq('init', '1234567890123456'); // ← Deine echte Pixel-ID
```

---

### Google Tag Manager ID
**Wo:** `dashboard-jetzt.html` Zeile 62-71

**Was tun:**
1. Google Tag Manager → Container erstellen
2. GTM-ID kopieren (z.B. `GTM-XXXXXXX`)
3. In HTML einkommentieren (Zeile 62-71)
4. `PLACEHOLDER_GTM_ID` ersetzen

**Code:**
```javascript
// Zeile 68 ändern:
gtag('config', 'GTM-XXXXXXX'); // ← Deine echte GTM-ID
```

---

## 📅 3. Calendly/Booking einrichten (Priorität: MITTEL)

### Calendly Embed
**Wo:** `dashboard-jetzt.html` Zeile 459

**Was tun:**
1. Calendly-Event erstellen ("Discovery-Call Dashboard")
2. Einstellungen:
   - Dauer: 30 Minuten
   - Pufferzeit: 15 Min
   - Fragen: Name, Firma, Mitarbeiterzahl, Tools
3. Embed-Link kopieren
4. In HTML einfügen

**Code:**
```html
<!-- Zeile 459 ERSETZEN: -->
<div class="funnel-booking-embed">
  <p>📅 Calendly-Embed hier einfügen</p>
</div>

<!-- MIT: -->
<div class="funnel-booking-embed">
  <div class="calendly-inline-widget"
       data-url="https://calendly.com/DEIN_LINK/discovery-call"
       style="min-width:320px;height:630px;">
  </div>
</div>
```

5. Calendly-Script einkommentieren (Zeile 509):
```html
<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
```

---

## 📝 4. Content-Anpassungen (Priorität: NIEDRIG)

Alle Texte sind in `funnel/funnel-content.js` zentral gespeichert. Anpassbar:

### Headlines
```javascript
// Zeile 8-10:
headline: 'Eine Oberfläche.\nFür euer ganzes Unternehmen.',
subline: 'Wir bauen das Dashboard, das eure Tools endlich zusammenführt.',
```

### CTAs
```javascript
// Zeile 12-13:
ctaPrimary: 'Discovery-Call buchen',
ctaSecondary: 'Wie das aussieht ↓'
```

### FAQ erweitern
```javascript
// Zeile 68-105:
faq: {
  items: [
    { q: 'Neue Frage?', a: 'Neue Antwort.' },
    // ...
  ]
}
```

---

## 🧪 5. Testing-Checklist

Vor Live-Schaltung:

### Funktional
- [ ] VSL-Video lädt und spielt ab
- [ ] Alle CTAs scrollen zu #booking
- [ ] Sticky-CTA erscheint nach Hero-Scroll
- [ ] Sticky-CTA verschwindet bei #booking
- [ ] Mockup-Varianten wechseln bei Tab-Klick
- [ ] FAQ-Accordion öffnet/schließt
- [ ] Calendly-Widget lädt

### Tracking
- [ ] Meta Pixel PageView feuert (DevTools → Network)
- [ ] VSL-Play trackt `ViewContent` Event
- [ ] CTA-Clicks tracken `Lead` Event
- [ ] Calendly-Booking trackt `Schedule` Event
- [ ] Google Tag Events sichtbar in GTM Preview

### Mobile
- [ ] Responsive auf iPhone/Android
- [ ] Sticky-CTA nur Button (Text versteckt)
- [ ] VSL-Player mobile-tauglich
- [ ] Text lesbar (keine zu kleine Schrift)

### Performance
- [ ] Lighthouse-Score > 90
- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] Images lazy-loaded
- [ ] Fonts preloaded

### SEO
- [ ] `robots.txt` enthält `Disallow: /dashboard-jetzt.html`
- [ ] Meta-Tag `noindex, nofollow` vorhanden
- [ ] NICHT in Sitemap
- [ ] Kein Link von Hauptseite

---

## 🚀 6. Go-Live

### Domain/Hosting
```
URL: https://nuroy.de/dashboard-jetzt.html
```

### Ads-Setup
1. Meta Ads:
   - URL: `https://nuroy.de/dashboard-jetzt.html?utm_source=facebook&utm_campaign=dashboards`
   - Zielgruppe: B2B, 10+ Mitarbeiter, Management
   - Budget: 50€/Tag (Test)

2. Google Ads:
   - URL: `https://nuroy.de/dashboard-jetzt.html?utm_source=google&utm_campaign=dashboards`
   - Keywords: "custom dashboard", "business dashboard", "reporting tool"
   - Budget: 30€/Tag (Test)

---

## 📊 7. KPIs tracken

### Conversion-Funnel
1. **Impressions** (Ads)
2. **Page Views** (VSL-Seite)
3. **Video Plays** (VSL geklickt)
4. **CTA Clicks** (Booking-Button)
5. **Bookings** (Calendly-Event)

### Ziel-Metriken
- Click-Through-Rate (CTR): > 2%
- Video-Completion-Rate: > 50%
- Booking-Rate: > 5% (von Page Views)
- Cost-per-Lead: < 50€

---

## ✨ 8. A/B-Testing (nach Launch)

### Variante A (Original)
- Headline: "Eine Oberfläche. Für euer ganzes Unternehmen."
- CTA: "Discovery-Call buchen"

### Variante B (Test)
```javascript
// In funnel-content.js ändern:
headline: 'Schluss mit Excel-Chaos.\nEin Dashboard für alle Zahlen.',
ctaPrimary: 'Kostenlosen Call vereinbaren',
```

Datei duplizieren: `dashboard-jetzt-v2.html`
Traffic splitten: 50/50
Laufzeit: 2 Wochen
Conversion-Rates vergleichen

---

## 🆘 Support & Fragen

- **GitHub Issues:** https://github.com/anthropics/claude-code/issues
- **Dokumentation:** `/funnel/README.md`
- **Diese Datei:** `/funnel/SETUP-TODO.md`

---

**Viel Erfolg mit der Funnel-Seite! 🚀**
