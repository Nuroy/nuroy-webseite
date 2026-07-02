/**
 * Pure Punktwolken-Generatoren für das Partikelsystem.
 * Kein Three.js-Import — alles liefert Float32Arrays und läuft auch in Node.
 * Koordinaten in CSS-Pixel-Einheiten (Kamera ist so kalibriert, dass
 * 1 Welt-Einheit = 1 px auf der z=0-Ebene).
 */

/** Standard-Normalverteilung via Box-Muller. */
export function gaussian() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

/**
 * Staubiger Ring in der XY-Ebene, zentriert auf den Ursprung.
 * radius: Ringradius, tube: halbe Dicke, scatter: zusätzliche Staub-Streuung
 * für die ~15% "verirrten" Partikel (organischer Look, keine cleane Geometrie).
 */
export function ringShape(count, { radius = 260, tube = 26, scatter = 40 } = {}) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const r = radius + gaussian() * tube
    const dust = Math.random() < 0.15 ? gaussian() * scatter : 0
    out[i * 3 + 0] = Math.cos(a) * (r + dust)
    out[i * 3 + 1] = Math.sin(a) * (r + dust) * 0.92 // leicht elliptisch
    out[i * 3 + 2] = gaussian() * (tube * 0.6)
  }
  return out
}

/**
 * Vertikaler Strahl in DOKUMENT-Koordinaten: y = Pixel ab Dokumentanfang
 * (0..docHeight, y wächst nach unten wie im DOM). x/z gaussisch um die Achse,
 * der Radius "atmet" leicht entlang der Höhe. Der Shader rechnet Dokument-y
 * über den Scroll-Fortschritt in View-Koordinaten um.
 */
export function beamShape(count, { docHeight, radius = 60 } = {}) {
  if (!docHeight || docHeight <= 0) throw new Error('beamShape: docHeight erforderlich')
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const y = Math.random() * docHeight
    const r = radius * (0.7 + 0.6 * Math.abs(Math.sin(y * 0.0016)))
    const dust = Math.random() < 0.12 ? gaussian() * radius * 1.8 : 0
    out[i * 3 + 0] = gaussian() * r + dust
    out[i * 3 + 1] = y
    out[i * 3 + 2] = gaussian() * r
  }
  return out
}

/** Pro Partikel 4 Zufallswerte in [0,1] (Float32-Rundung kann exakt 1.0 erzeugen): [size, phase, colorMix, stagger]. */
export function randomAttrs(count) {
  const out = new Float32Array(count * 4)
  for (let i = 0; i < out.length; i++) out[i] = Math.random()
  return out
}

/**
 * Auflöse-Reihenfolge für die Logo-Punkte beim Scroll-Morph: 0 = löst sich
 * zuerst, 1 = zuletzt. Segmentierung rein geometrisch (Ursprung = Zentrum,
 * y wächst nach unten): Punkte nahe der Außenkante der Form zählen als Rahmen,
 * der Rest als N. Ablauf: N von oben nach unten (0 → nStop), dann der Rahmen
 * ab der Kerbe unten links einmal herum — links hoch, oben rüber, rechts
 * runter, unten zurück (nStop → 1). Pure Funktion — Node-testbar.
 */
export function dissolveOrder(positions, { frameBand = 0.18, nStop = 0.35 } = {}) {
  const count = positions.length / 3
  let hw = 0, hh = 0
  for (let i = 0; i < count; i++) {
    hw = Math.max(hw, Math.abs(positions[i * 3]))
    hh = Math.max(hh, Math.abs(positions[i * 3 + 1]))
  }
  if (hw === 0) hw = 1
  if (hh === 0) hh = 1
  const out = new Float32Array(count)
  const START = (225 * Math.PI) / 180 // Kerbe unten links
  for (let i = 0; i < count; i++) {
    const x = positions[i * 3]
    const y = positions[i * 3 + 1]
    const edge = Math.max(Math.abs(x) / hw, Math.abs(y) / hh)
    if (edge > 1 - frameBand) {
      // Rahmen: Winkel-Parametrisierung, Start unten links, links hoch zuerst
      const theta = Math.atan2(-y, x) // y nach unten → mathematische Orientierung
      let t = (START - theta) / (Math.PI * 2)
      t -= Math.floor(t) // wrap in [0,1)
      out[i] = nStop + t * (1 - nStop)
    } else {
      // N: von oben nach unten
      out[i] = ((y + hh) / (2 * hh)) * nStop
    }
  }
  return out
}

/** Dünnes Sternenfeld im View-Raum, z nach hinten versetzt. */
export function starField(count, { width, height, depth = 600 } = {}) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    out[i * 3 + 0] = (Math.random() - 0.5) * width * 1.4
    out[i * 3 + 1] = (Math.random() - 0.5) * height * 1.4
    out[i * 3 + 2] = -Math.random() * depth
  }
  return out
}

/**
 * Sampelt count Punkte aus den opaken Pixeln eines ImageData-ähnlichen Objekts
 * ({width, height, data: RGBA}). Transparentes Padding wird ignoriert: Zentrum
 * und Skalierung beziehen sich auf die Bounding-Box der opaken Pixel, targetWidth
 * ist also die Breite der sichtbaren Form. WICHTIG: Bild-y und Attribut-y
 * wachsen beide nach unten (Dokument-Konvention) — kein vertikales Spiegeln.
 * Pure Funktion — Node-testbar.
 */
export function samplePointsFromAlpha(imageData, count, { targetWidth, jitter = 3, zSpread = 14, alphaThreshold = 40 } = {}) {
  if (!imageData || !imageData.width || !imageData.height || !imageData.data) {
    throw new Error('samplePointsFromAlpha: imageData erforderlich')
  }
  if (!targetWidth || targetWidth <= 0) throw new Error('samplePointsFromAlpha: targetWidth erforderlich')
  const { width, height, data } = imageData
  const candidates = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > alphaThreshold) candidates.push(x, y)
    }
  }
  if (candidates.length === 0) throw new Error('samplePointsFromAlpha: keine opaken Pixel gefunden')
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (let i = 0; i < candidates.length; i += 2) {
    const x = candidates[i], y = candidates[i + 1]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const scale = targetWidth / (maxX - minX + 1)
  const cx = (minX + maxX + 1) / 2
  const cy = (minY + maxY + 1) / 2
  const n = candidates.length / 2
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const k = (Math.random() * n) | 0
    out[i * 3 + 0] = (candidates[k * 2] - cx + Math.random() - 0.5) * scale + gaussian() * jitter
    out[i * 3 + 1] = (candidates[k * 2 + 1] - cy + Math.random() - 0.5) * scale + gaussian() * jitter
    out[i * 3 + 2] = gaussian() * (zSpread * 0.5)
  }
  return out
}
