# Hauptseite-Redesign: Partikel-Strahl (Scrollytelling)

**Datum:** 2026-07-02 · **Branch:** `hauptseite-redesign` · **Status:** Design freigegeben (mündlich), Spec zur Review

## Ziel

Die Hauptseite `index.html` bekommt ein durchgehendes WebGL-Partikelsystem als visuelles Rückgrat: ein Wow-Objekt im Hero, das beim Scrollen zu einem vertikalen Partikel-Strahl morpht, der als roter Faden durch die **gesamte Seite** läuft — die Leistungen docken als leuchtende Stationen daran an.

## Ästhetik / Referenzen

- **Referenz 1 (Reel textura.us):** zentrierter Hero, großes leuchtendes Partikel-Objekt, Weltraum-Atmosphäre, dezente CTAs.
- **Referenz 2 (DNA-Partikelbild):** organische, staubartige Partikel (keine cleane Geometrie), dichte hell aufleuchtende Cluster an Knotenpunkten, vereinzelte Sterne im Hintergrund.
- **Farbwelt:** Verlauf von Nuroy-Pink `#FF2D7A` ins Violett der DNA-Referenz; Hintergrund tiefdunkel (Schwarz/Nachtblau). Marke bleibt erkennbar, Look wird kosmischer.

## Architektur

- Statische Vanilla-Site ohne Build-System bleibt erhalten. **Three.js per CDN** (ES Module, gepinnte Version).
- Neues Modul `assets/particles/` (Partikelsystem, Formen-Definitionen, Konfiguration).
- **Ein fixierter Full-Viewport-Canvas** (`position: fixed`, hinter dem Content, `pointer-events: none`, `aria-hidden`); der Seiteninhalt scrollt darüber.
- **Ein einziges Partikelsystem** (`THREE.Points`, ~20.000–30.000 Partikel, Custom-ShaderMaterial):
  - Pro Partikel: Zielposition **Hero-Form (Ring)**, Zielposition **Strahl**, Zufallsattribute (Größe, Phase).
  - Uniform `scrollProgress` (0–1) steuert das Morphing zwischen den Formen; Simplex-/Curl-Noise erzeugt das organische „Wabern".
  - Additives Blending + weiche runde Glow-Sprites, Größen- und Helligkeitsvariation für den staubigen Cluster-Look.
- **Scroll-Kopplung:** rAF-Loop liest den Scroll-Fortschritt (kein Scroll-Listener-Jank). Sektionen tragen `data-station`-Marker; erreicht der Scroll eine Station, verdichtet sich der Strahl dort und leuchtet auf.
- **Sterne:** zweite, statische dünne Punktwolke im Hintergrund.

## Verhalten pro Sektion

- **Hero:** zentriertes Layout wie Referenz 1 — Typo im/unter dem Partikel-Ring. Das bisherige Zwei-Spalten-Layout mit Dashboard-Mockup entfällt (Dashboard-Optik bleibt über die Portfolio-Karten auf der Seite vertreten).
- **Ab Scroll:** Ring fließt zum vertikalen Strahl auseinander.
- **Leistungen:** die 7 Leistungen als Stationen entlang des Strahls, Aufleuchten beim Erreichen.
- **Übrige Sektionen** (Kundenstimmen, Portfolio, Prozess, Stats, Team, FAQ, Final-CTA): der Strahl läuft weiter bis zum Seitenende; ob er dort ausdünnt, ausweicht oder durchläuft, wird **bewusst iterativ beim Bauen justiert** (explizite Absprache).

## Performance & Fallbacks

- `devicePixelRatio` auf max. 2 geklemmt; Partikelzahl auf Mobile reduziert (~8.000–12.000).
- `prefers-reduced-motion` oder kein WebGL → statischer Gradient-/Sternen-Hintergrund, Seite bleibt voll nutzbar.
- Animation pausiert bei `document.hidden`.
- Canvas ist rein dekorativ: kein Einfluss auf Layout (kein CLS), keine Interaktions-Blockade.

## Umsetzung in 2 Stufen

1. **Prototyp `test-partikel.html`** (eigenständige Datei, Dummy-Sektionen): Hero-Ring → Morph → Strahl mit Stationen. Validierung des Looks lokal (`npm run dev`, Port 8765) und per Browser-Screenshots, Iteration bis der Look sitzt.
2. **Einbau in `index.html`** auf diesem Branch: ersetzt die bisherige Waves-Hero-Animation (`funnel/waves-animation.js` bleibt für die Funnel-Seiten unberührt). Inhalte/Texte bleiben in dieser Stufe unverändert.

## Nicht-Ziele

- Keine Text-/Content-Überarbeitung der Sektionen in dieser Stufe.
- Kein Umbau anderer Seiten (`lp/`, `funnel/`, Unterseiten).
- **Kein Deploy, kein Push** — alles bleibt auf dem Branch bis zur expliziten Freigabe.

## Erfolgskriterien

- Look trifft die Referenzen: organisch, staubig, leuchtende Cluster, kosmisch.
- Flüssig (~60 fps) auf aktuellem Desktop, nutzbar und ruckelfrei auf aktuellem Smartphone.
- Seite bleibt voll bedienbar (Navigation, FAQ, CTAs), Fallbacks greifen zuverlässig.

## Update 2026-07-02 (nach Prototyp-Checkpoint)

**Hero-Form ist das Nuroy-Logo statt des Rings** (User-Entscheid am Checkpoint): Die Partikel formen im Hero das N-Mark (`assets/logo-icon.png`), erzeugt per Alpha-Sampling der Logo-Pixel (`samplePointsFromAlpha` in `shapes.mjs`, pure/Node-testbar). Das geladene ImageData wird gecacht und bei Resize synchron neu skaliert. Bis das Logo geladen ist bzw. wenn es nicht ladbar ist, bleibt der staubige Ring als Fallback-Form. Sign-Konvention: Bild-y (nach unten) = Attribut-y (nach unten) = Dokument-y — kein vertikales Spiegeln. `window.__particles.hero` meldet `'logo'` oder `'ring'` für die Verifikation. Morph zum Strahl, Stationen und alle Fallbacks bleiben unverändert.

## Update 2 (2026-07-02, nach Ideen-Runde): Konzept „Ringreaktor" ersetzt Logo→Strahl

Der User hat den Logo→Strahl-Ansatz verworfen („nicht außergewöhnlich genug") und aus drei Panel-Konzepten den **Ringreaktor** gewählt, erweitert um **Themen-Skulpturen**:

- **Hero:** Gyroskop-Maschine aus 5 ineinander gekippten Partikel-Leuchtringen um einen weißglühenden Kern, dazu Orbit-Staub und das vorhandene Sternenfeld. Lebt im Viewport-Raum (nicht Dokument-Raum). Headline im ruhigen Zentrum.
- **Scroll = Getriebe:** Jeder Ring rotiert mit eigener Übersetzung direkt an den Scroll gekoppelt (gears ≈ +1.0/−1.6/+2.2/−0.7/+1.3), vor- und rückwärts scrubbar. Ein CPU-gelerptes `uScrollSmooth` (Faktor ~0.12) gibt Schwungmasse. Rast-Easing `p − sin(2πp)·0.12` pro Sektionsabschnitt: die Maschine „klickt" von Stellung zu Stellung. Kern-Helligkeit an geglättete Scroll-Geschwindigkeit gekoppelt.
- **Zwischen Sektionen:** Maschine schwenkt zur textfreien Seite (alternierend, ~60% Skalierung), Posen der Ringe wechseln per Keyframe-Interpolation.
- **7 Stationen = Schalt-Stellungen + Skulpturen:** An jeder Leistung kondensiert aus dem Ring-Schwung eine themenspezifische Partikel-Skulptur, die per Scroll um die eigene Achse rotiert (DNA-Gefühl pro Objekt) und beim Verlassen zurück in die Maschine zerstäubt. Vom User abgenommene Liste: Dashboards = 3D-Balken-Skyline mit Kurve · KI-Agenten = neuronale Kugel · Software = „</>" aus Partikeln · KI-Integration = Knoten-Netz, das ins Raster einrastet · Company-AI = Sprechblase mit pulsierendem Kern · Datenintegration = Datenbank-Zylinder-Stack mit einfließenden Strömen · Strategy & Audit = Kompass mit Nadel.
- **Finale:** Ringe falten sich zu einem frontalen Portal, Kern flammt auf, die Partikel kondensieren zum **N-Logo** (vorhandenes Alpha-Sampling), CTA sitzt im Portal-Zentrum.
- **Farben (User-Entscheid):** Pink `#FF2D7A` → Violett `#8B5CF6` bleibt, **neu: Weißglut-Akzente** (Kern, Stations-Flare, Skulptur-Highlights, ~`#FFF0F6`).
- **Architektur:** Neues Modul `assets/particles/reactor.mjs` + pure Skulptur-Generatoren `assets/particles/sculptures.mjs` (Node-testbar, prozedurale Punktwolken statt Bild-Sampling) + Browser-Helfer `assets/particles/load-image.mjs`. Das bisherige `particle-system.mjs`/`test-partikel.html` bleibt unangetastet als Vergleich; neuer Prototyp: `test-reaktor.html`. Performance-/Fallback-Anforderungen unverändert.
