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
