/**
 * Pure Pfad-Geometrie für den Partikel-Zeitstrahl — kein Three.js-Import,
 * läuft auch in Node (Tests). Koordinaten in CSS-Pixeln, Dokument-Konvention
 * (y wächst nach unten, x = Viewport-x).
 *
 * Der Zeitstrahl ist eine Catmull-Rom-Kurve durch die Karten-Anker
 * (alternierend links/rechts) — dadurch automatisch weich, keine Ecken.
 * Für die GPU wird die Kurve dicht gesampelt und nach Bogenlänge
 * gleichverteilt resampled (gleichmäßige Partikeldichte entlang des Stroms).
 */

function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x))
}

/** GLSL-artiges smoothstep, robust gegen e1 <= e0. */
export function smooth01(e0, e1, x) {
  const t = clamp((x - e0) / Math.max(e1 - e0, 1e-6), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Catmull-Rom-Spline durch anchors [{x,y}, …], nach Bogenlänge gleichmäßig
 * auf `samples` Stützstellen resampled. Rückgabe:
 *   { pts: Float32Array(samples*4)  — [x, y, tangX, tangY] pro Stützstelle,
 *     length: Gesamt-Bogenlänge in px }
 * Tangenten sind normiert. Endpunkte werden geklemmt (kein Überschwingen
 * hinter dem ersten/letzten Anker).
 */
export function buildPath(anchors, { samples = 512, dense = 32 } = {}) {
  if (!anchors || anchors.length < 2) throw new Error('buildPath: mindestens 2 Anker erforderlich')
  const n = anchors.length
  const P = (i) => anchors[clamp(i, 0, n - 1)]

  // 1) dicht sampeln (uniformer Catmull-Rom, tension 0.5)
  const raw = []
  for (let s = 0; s < n - 1; s++) {
    const p0 = P(s - 1)
    const p1 = P(s)
    const p2 = P(s + 1)
    const p3 = P(s + 2)
    const last = s === n - 2
    const steps = dense
    for (let k = 0; k < steps + (last ? 1 : 0); k++) {
      const t = k / steps
      const t2 = t * t
      const t3 = t2 * t
      const cr = (a, b, c, d) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      raw.push(cr(p0.x, p1.x, p2.x, p3.x), cr(p0.y, p1.y, p2.y, p3.y))
    }
  }
  const m = raw.length / 2

  // 2) Bogenlängen aufsummieren
  const cum = new Float64Array(m)
  let total = 0
  for (let i = 1; i < m; i++) {
    total += Math.hypot(raw[i * 2] - raw[(i - 1) * 2], raw[i * 2 + 1] - raw[(i - 1) * 2 + 1])
    cum[i] = total
  }
  if (total <= 0) throw new Error('buildPath: Pfad hat keine Länge')

  // 3) gleichmäßig nach Bogenlänge resampeln
  const pts = new Float32Array(samples * 4)
  let j = 1
  for (let i = 0; i < samples; i++) {
    const d = (i / (samples - 1)) * total
    while (j < m - 1 && cum[j] < d) j++
    const lo = cum[j - 1]
    const t = (d - lo) / (cum[j] - lo || 1)
    pts[i * 4] = raw[(j - 1) * 2] + (raw[j * 2] - raw[(j - 1) * 2]) * t
    pts[i * 4 + 1] = raw[(j - 1) * 2 + 1] + (raw[j * 2 + 1] - raw[(j - 1) * 2 + 1]) * t
  }

  // 4) Tangenten aus Nachbar-Stützstellen (zentrale Differenz, normiert)
  for (let i = 0; i < samples; i++) {
    const a = Math.max(0, i - 1)
    const b = Math.min(samples - 1, i + 1)
    let tx = pts[b * 4] - pts[a * 4]
    let ty = pts[b * 4 + 1] - pts[a * 4 + 1]
    const l = Math.hypot(tx, ty) || 1
    pts[i * 4 + 2] = tx / l
    pts[i * 4 + 3] = ty / l
  }

  return { pts, length: total }
}

// Tiefen-Konstanten — MÜSSEN mit dem GLSL in timeline.mjs übereinstimmen
// (die Karten werden auf der CPU mit exakt derselben Formel projiziert,
// damit DOM und Partikel auf derselben Schlange sitzen).
export const DEPTH_BACK = 0.55 // älter (unter der Mitte) → in die Ferne
export const DEPTH_FRONT = 0.2 // schon passiert (über der Mitte) → leicht nach vorn
export const DEPTH_MIN_Z = -2600
export const DEPTH_MAX_Z = 300

/**
 * Tiefen-z eines Dokument-Punkts relativ zur Viewport-Mitte.
 * dy = docY − centerDoc (positiv = unterhalb der Mitte = älter).
 */
export function depthZ(dy, vh) {
  const zBack = -dy * DEPTH_BACK
  const zFront = -dy * DEPTH_FRONT
  const s = smooth01(-0.2 * vh, 0.2 * vh, dy)
  return clamp(zFront + (zBack - zFront) * s, DEPTH_MIN_Z, DEPTH_MAX_Z)
}

/** Perspektiv-Faktor der Kamera für Tiefe z (z=0 → 1, ferne z → <1). */
export function projScale(z, cameraD) {
  return cameraD / (cameraD - z)
}

// ---------------------------------------------------------------------------
// Partikel-Straße (Zeitachse als Fahrt): perspektivische Straße unten im
// Viewport, schlängelt sich in die Tiefe. Einheit entlang der Straße =
// „Segment" (1 Segment = Abstand zwischen zwei Meilensteinen).
//
// Die KAMERA SITZT AUF DER STRASSE und folgt ihr (Rennspiel-Perspektive):
// Von jedem Straßenpunkt werden Position UND Blickrichtung der Kamera-
// Station abgezogen — der Punkt direkt vor der Kamera liegt dadurch immer
// mittig (man fährt auf der Fahrbahn), und Kurven zeigen sich als seitliches
// Wegkrümmen der Straße vor einem / Schwenken des Horizonts.
//
// Konstanten MÜSSEN mit dem GLSL in strasse.mjs übereinstimmen (Linien und
// Karten werden auf der CPU mit exakt derselben Formel projiziert).
// ---------------------------------------------------------------------------

export const ROAD = {
  window: 3.0, // Mindest-Sichtweite in Segmenten (Seiten nutzen visWindow(n))
  zFront: 320, // z am vorderen Straßenrand (vor der z=0-Ebene, nah)
  zBack: -2800, // z am Horizont
  zPass: 620, // bis hierhin fliegen Partikel sichtbar an der Kamera vorbei (Cap)
  ampX: 0.2, // Schlängel-Amplitude als Anteil der Viewport-Breite
  freq: 1.15, // Schlängel-Frequenz (rad pro Segment)
  phase: 0.7, // Schlängel-Phase — der vorderste Meilenstein sitzt rechts unten
  offsetX: 0.11, // Straße liegt rechts der Bildmitte (Welt-Raum; vorne ≈ 2/3 der Breite)
  groundY: -0.34, // Straßen-Höhe als Anteil der Viewport-Höhe (unten)
  hillAmp: 0.018, // sanfte Hügel (Anteil Viewport-Höhe)
  hillFreq: 0.7,
  focus: 0.42, // Fokus-Station: so viele Segmente vor der Kamera parkt der aktive Meilenstein
}

/** Sichtweite, in die alle n Meilensteine passen (Panorama wie im Template). */
export function visWindow(n) {
  return Math.max(ROAD.window, (n - 1) + ROAD.focus + 1.0)
}

/** Seitliche Lage der Straßen-Mittellinie an Station s (Welt-px). */
export function roadX(s, vw) {
  return Math.sin((s + ROAD.phase) * ROAD.freq) * vw * ROAD.ampX
}

/** Ableitung von roadX nach s — Blickrichtung der Kamera an Station s. */
export function roadDX(s, vw) {
  return ROAD.freq * Math.cos((s + ROAD.phase) * ROAD.freq) * vw * ROAD.ampX
}

function roadHill(s, vh) {
  return Math.sin(s * ROAD.hillFreq) * vh * ROAD.hillAmp
}

/**
 * Punkt der Straßen-Mittellinie an Station s (Segmente) bei Fahrt-Position
 * travel. View-Raum: x rechts, y oben, z zur Kamera; Ursprung Bildmitte.
 * → { x, y, z, d } — d = normierte Tiefe (0 = Kamera, 1 = Horizont).
 */
export function roadPoint(s, travel, vw, vh, window = ROAD.window) {
  const u = s - travel
  const d = u / window
  // Tiefe LINEAR über d — und vor der Kamera (d < 0) läuft sie weiter,
  // damit Partikel sichtbar an der Kamera vorbeifliegen (unten aus dem
  // Bild), statt an einer unsichtbaren Wand zu verharren
  const z = clamp(ROAD.zFront + (ROAD.zBack - ROAD.zFront) * d, ROAD.zBack, ROAD.zPass)
  // Kamera-relativ: Position und Tangente der Kamera-Station abziehen —
  // vor der Kamera startet die Straße immer geradeaus (O(u²)-Krümmung).
  // offsetX legt die ganze Bahn rechts neben die Kamera (Blick von links).
  const x = roadX(s, vw) - roadX(travel, vw) - roadDX(travel, vw) * u + vw * ROAD.offsetX
  const y = vh * ROAD.groundY + roadHill(s, vh) - roadHill(travel, vh)
  return { x, y, z, d }
}

/**
 * Projiziert einen Straßen-Punkt auf Bildschirm-Pixel (top-left-Ursprung).
 * Gleiche Projektion wie der Shader: xy · cameraD/(cameraD − z).
 */
export function roadToScreen(s, travel, vw, vh, cameraD, window = ROAD.window) {
  const p = roadPoint(s, travel, vw, vh, window)
  const f = projScale(p.z, cameraD)
  const sx = vw / 2 + p.x * f
  const sy = vh / 2 - p.y * f
  return { x: sx, y: sy, f, d: p.d }
}

/**
 * Fokus-Logik der Fahrt: welcher Meilenstein (Station i·1.0) ist „vorne"?
 * travel in Segmenten; n = Anzahl Meilensteine. amt ∈ [0,1] blendet die
 * Karte/Linie zwischen zwei Stationen weich aus und wieder ein.
 */
export function roadFocus(travel, n) {
  const i = clamp(Math.round(travel), 0, Math.max(n - 1, 0))
  const amt = clamp(1 - Math.abs(travel - i) * 2.2, 0, 1)
  return { index: i, amt }
}
