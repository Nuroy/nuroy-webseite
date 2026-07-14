/**
 * 7 prozedurale Punktwolken-„Skulpturen" für die Leistungs-Sektionen des
 * Ringreaktor-Partikelsystems. Reihenfolge in SCULPTURES = Stationen 1-7.
 *
 * Konventionen wie in shapes.mjs: pure Funktionen ohne Three.js, Koordinaten
 * in CSS-Pixel-Einheiten, zentriert um den Ursprung, y wächst nach unten,
 * Rückgabe Float32Array(count*3). Alle Formen haben echte z-Tiefe, damit die
 * Scroll-Rotation um die Y-Achse etwas zeigt, plus ~10% „Staub"-Ausreißer für
 * den organischen Look.
 *
 * Jede Skulptur: (count, { size = 320 } = {}) → Float32Array(count*3);
 * size ≈ Breite/Höhe der Skulptur in px (Bounding-Box-Größenordnung).
 */

import { gaussian } from './shapes.mjs'
import { brainTemplate } from './brain-points.mjs'

const TAU = Math.PI * 2

/**
 * Teilt count ganzzahlig nach Gewichten auf (Summe stimmt exakt; Rest geht
 * an die größten Nachkommaanteile).
 */
function splitCounts(count, weights) {
  const total = weights.reduce((a, b) => a + b, 0) || 1
  const raw = weights.map((w) => (count * w) / total)
  const counts = raw.map(Math.floor)
  let rest = count - counts.reduce((a, b) => a + b, 0)
  const order = raw
    .map((r, i) => [r - counts[i], i])
    .sort((a, b) => b[0] - a[0])
  for (let k = 0; rest > 0; k = (k + 1) % order.length, rest--) counts[order[k][1]]++
  return counts
}

/** Hängt mehrere Float32Arrays aneinander. */
function merge(chunks) {
  let n = 0
  for (const c of chunks) n += c.length
  const out = new Float32Array(n)
  let o = 0
  for (const c of chunks) {
    out.set(c, o)
    o += c.length
  }
  return out
}

/**
 * Verteilt count Punkte längengewichtet über eine Menge unabhängiger
 * 3D-Segmente [[a,b], ...]. jitter = Gauß-σ auf allen Achsen,
 * zSpread = zusätzliche gleichverteilte z-Streuung ±zSpread.
 */
export function segmentsCloud(segments, count, { jitter = 0, zSpread = 0 } = {}) {
  const out = new Float32Array(count * 3)
  if (!segments.length || !count) return out
  const cum = new Float64Array(segments.length)
  let total = 0
  for (let i = 0; i < segments.length; i++) {
    const [a, b] = segments[i]
    total += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])
    cum[i] = total
  }
  for (let i = 0; i < count; i++) {
    const d = Math.random() * total
    let s = 0
    while (s < segments.length - 1 && cum[s] < d) s++
    const [a, b] = segments[s]
    const lo = s ? cum[s - 1] : 0
    const t = (d - lo) / (cum[s] - lo || 1)
    out[i * 3] = a[0] + (b[0] - a[0]) * t + gaussian() * jitter
    out[i * 3 + 1] = a[1] + (b[1] - a[1]) * t + gaussian() * jitter
    out[i * 3 + 2] = a[2] + (b[2] - a[2]) * t + gaussian() * jitter + (Math.random() * 2 - 1) * zSpread
  }
  return out
}

/** Verteilt count Punkte segmentlängen-gewichtet entlang einer 3D-Polyline. */
export function polylineCloud(points, count, opts) {
  const segs = []
  for (let i = 1; i < points.length; i++) segs.push([points[i - 1], points[i]])
  return segmentsCloud(segs, count, opts)
}

/**
 * ~10%-Staub: streut n Ausreißer um zufällige Punkte der fertigen Skulptur.
 * Offsets sind auf ±3σ geclampte Gauß-Werte → Staub bleibt beschränkt und
 * folgt der Silhouette. maxY deckelt optional (z.B. Grundlinie).
 */
function dustCloud(base, n, sigma, maxY = Infinity) {
  const out = new Float32Array(n * 3)
  const m = (base.length / 3) | 0
  const lim = 3 * sigma
  for (let i = 0; i < n; i++) {
    const k = m ? ((Math.random() * m) | 0) * 3 : -1
    for (let a = 0; a < 3; a++) {
      const off = Math.max(-lim, Math.min(lim, gaussian() * sigma))
      out[i * 3 + a] = (k >= 0 ? base[k + a] : 0) + off
    }
    if (out[i * 3 + 1] > maxY) out[i * 3 + 1] = maxY
  }
  return out
}

// ---------------------------------------------------------------------------
// 1) Dashboards — 3D-Balken-Skyline mit steigender Kurve über den Spitzen
// ---------------------------------------------------------------------------

export function dashboardsShape(count, { size = 320 } = {}) {
  const S = size
  const heights = [0.35, 0.55, 0.42, 0.7, 0.5, 0.85].map((h) => h * 0.55 * S)
  const w = 0.09 * S // Balkenbreite und -tiefe
  const step = 0.162 * S // Breite + Lücke
  const baseY = 0.26 * S // gemeinsame Grundlinie (y wächst nach unten)
  const jit = 0.01 * S
  const [nBars, nCurve, nDust] = splitCounts(count, [0.7, 0.2, 0.1])
  const perBar = splitCounts(nBars, heights.map((h) => h + w)) // ~Oberfläche
  const bars = new Float32Array(nBars * 3)
  let j = 0
  for (let b = 0; b < 6; b++) {
    const cx = (b - 2.5) * step
    const top = baseY - heights[b]
    for (let i = 0; i < perBar[b]; i++, j += 3) {
      let x, y, z
      if (Math.random() < 0.3) {
        // Deckelfläche
        y = top
        x = (Math.random() - 0.5) * w
        z = (Math.random() - 0.5) * w
      } else {
        // Mantelflächen: eine Achse auf die Kante gesnappt → Kanten-/Flächen-Look
        y = top + Math.random() * heights[b]
        const edge = (Math.random() < 0.5 ? -0.5 : 0.5) * w
        const free = (Math.random() - 0.5) * w
        if (Math.random() < 0.5) {
          x = edge
          z = free
        } else {
          x = free
          z = edge
        }
      }
      bars[j] = cx + x + gaussian() * jit
      bars[j + 1] = y + gaussian() * jit
      bars[j + 2] = z + gaussian() * jit
    }
  }
  // Geschwungene, steigende Kurve über den Balkenspitzen (leichtes z-Mäandern)
  const curvePts = []
  for (let k = 0; k <= 12; k++) {
    const u = k / 12
    curvePts.push([
      (u - 0.5) * 0.98 * S,
      baseY - 0.55 * S * (0.42 + 0.55 * u) - 0.04 * S * Math.sin(u * 4.7),
      Math.sin(u * 7.3) * 0.03 * S,
    ])
  }
  const curve = polylineCloud(curvePts, nCurve, { jitter: 0.012 * S, zSpread: 0.02 * S })
  const main = merge([bars, curve])
  // Staub bleibt oberhalb der Grundlinie (Skyline steht auf dem Boden)
  return merge([main, dustCloud(main, nDust, 0.06 * S, baseY + 0.02 * S)])
}

// ---------------------------------------------------------------------------
// 2) Neuronale Kugel — Fibonacci-Schale, 3 Orbit-Bänder, heller Kern
// ---------------------------------------------------------------------------

export function neuralSphereShape(count, { size = 320 } = {}) {
  const S = size
  const R = 0.42 * S
  const [nShell, nBands, nCore, nDust] = splitCounts(count, [0.55, 0.25, 0.12, 0.08])
  // Schale: Fibonacci-Sphäre mit Jitter
  const shell = new Float32Array(nShell * 3)
  const GA = Math.PI * (3 - Math.sqrt(5))
  const sj = 0.015 * S
  for (let i = 0; i < nShell; i++) {
    const v = 1 - (2 * (i + 0.5)) / nShell
    const r = Math.sqrt(Math.max(0, 1 - v * v))
    const a = i * GA
    shell[i * 3] = Math.cos(a) * r * R + gaussian() * sj
    shell[i * 3 + 1] = v * R + gaussian() * sj
    shell[i * 3 + 2] = Math.sin(a) * r * R + gaussian() * sj
  }
  // 3 gekippte Großkreis-Bänder (dichter, wie Orbits)
  const bands = new Float32Array(nBands * 3)
  const tilts = [
    [0.4, 0.3],
    [1.25, 1.4],
    [2.0, 2.6],
  ]
  const bj = 0.01 * S
  for (let i = 0; i < nBands; i++) {
    const [tx, ry] = tilts[i % 3]
    const a = Math.random() * TAU
    const x = Math.cos(a) * R
    // Kreis in XY → um X kippen, dann um Y drehen
    const y2 = Math.sin(a) * R * Math.cos(tx)
    const z2 = Math.sin(a) * R * Math.sin(tx)
    bands[i * 3] = x * Math.cos(ry) + z2 * Math.sin(ry) + gaussian() * bj
    bands[i * 3 + 1] = y2 + gaussian() * bj
    bands[i * 3 + 2] = -x * Math.sin(ry) + z2 * Math.cos(ry) + gaussian() * bj
  }
  // Heller Kern
  const core = new Float32Array(nCore * 3)
  for (let i = 0; i < core.length; i++) core[i] = gaussian() * 0.04 * S
  const main = merge([shell, bands, core])
  return merge([main, dustCloud(main, nDust, 0.08 * S)])
}

// ---------------------------------------------------------------------------
// 3) Code „</>" — zwei spitze Klammern und ein Slash als Polylines
// ---------------------------------------------------------------------------

export function codeShape(count, { size = 320 } = {}) {
  const S = size
  const h = 0.3 * S // halbe Höhe
  const lt = [[-0.24 * S, -h, 0], [-0.5 * S, 0, 0], [-0.24 * S, h, 0]]
  const slash = [[0.1 * S, -h, 0], [-0.1 * S, h, 0]] // oben rechts → unten links
  const gt = [[0.24 * S, -h, 0], [0.5 * S, 0, 0], [0.24 * S, h, 0]]
  const lenBracket = 2 * Math.hypot(0.26, 0.3)
  const lenSlash = Math.hypot(0.2, 0.6)
  const [nMain, nDust] = splitCounts(count, [0.9, 0.1])
  const [nLt, nSl, nGt] = splitCounts(nMain, [lenBracket, lenSlash, lenBracket])
  const o = { jitter: 0.02 * S, zSpread: 0.05 * S }
  const main = merge([polylineCloud(lt, nLt, o), polylineCloud(slash, nSl, o), polylineCloud(gt, nGt, o)])
  return merge([main, dustCloud(main, nDust, 0.06 * S)])
}

// ---------------------------------------------------------------------------
// 4) Knoten-Netz — 5×4-Raster mit Verbindungslinien + 3 freie Knoten rechts oben
// ---------------------------------------------------------------------------

export function networkGridShape(count, { size = 320 } = {}) {
  const S = size
  const sp = 0.22 * S
  // Sanfte z-Welle über das Raster → echte Tiefe statt flacher Platte
  const node = (c, r) => [(c - 2) * sp, (r - 1.5) * sp, Math.sin(c * 1.7 + r * 1.1) * 0.05 * S]
  const grid = []
  const segs = []
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 4; r++) {
      grid.push(node(c, r))
      if (c < 4) segs.push([node(c, r), node(c + 1, r)])
      if (r < 3) segs.push([node(c, r), node(c, r + 1)])
    }
  }
  const free = [
    [0.58 * S, -0.4 * S, 0.06 * S],
    [0.68 * S, -0.24 * S, -0.05 * S],
    [0.6 * S, -0.08 * S, 0.03 * S],
  ]
  // Freie Knoten docken per Linie ans Raster an
  segs.push([node(4, 0), free[0]], [node(4, 0), free[1]], [node(4, 1), free[2]])
  const [nNodes, nFree, nEdges, nDust] = splitCounts(count, [0.52, 0.08, 0.3, 0.1])
  const nodes = new Float32Array(nNodes * 3)
  for (let i = 0; i < nNodes; i++) {
    const p = grid[(Math.random() * grid.length) | 0]
    nodes[i * 3] = p[0] + gaussian() * 0.02 * S
    nodes[i * 3 + 1] = p[1] + gaussian() * 0.02 * S
    nodes[i * 3 + 2] = p[2] + gaussian() * 0.025 * S
  }
  const fr = new Float32Array(nFree * 3)
  for (let i = 0; i < nFree; i++) {
    const p = free[(Math.random() * free.length) | 0]
    fr[i * 3] = p[0] + gaussian() * 0.022 * S
    fr[i * 3 + 1] = p[1] + gaussian() * 0.022 * S
    fr[i * 3 + 2] = p[2] + gaussian() * 0.022 * S
  }
  const edges = segmentsCloud(segs, nEdges, { jitter: 0.012 * S, zSpread: 0.03 * S })
  const main = merge([nodes, fr, edges])
  return merge([main, dustCloud(main, nDust, 0.06 * S)])
}

// ---------------------------------------------------------------------------
// 5) Sprechblase — Superellipsen-Outline mit Kerbe + Schwanz unten links, Kern
// ---------------------------------------------------------------------------

export function speechBubbleShape(count, { size = 320 } = {}) {
  const S = size
  const a = 0.45 * S
  const b = 0.43 * S
  const p = 0.5 // Superellipse n=4 → abgerundetes Quadrat
  const f = (t) => {
    const c = Math.cos(t)
    const s = Math.sin(t)
    return [Math.sign(c) * Math.abs(c) ** p * a, Math.sign(s) * Math.abs(s) ** p * b, 0]
  }
  // Kerbe unten links: Parameterfenster [0.62π, 0.78π] bleibt offen,
  // beide Kerben-Enden laufen diagonal in die Schwanzspitze aus (wie im Logo).
  const t0 = 0.78 * Math.PI
  const t1 = 2.62 * Math.PI
  const tip = [-0.4 * S, 0.56 * S, 0]
  const loop = [tip]
  const STEPS = 72
  for (let k = 0; k <= STEPS; k++) loop.push(f(t0 + ((t1 - t0) * k) / STEPS))
  loop.push(tip)
  const [nOutline, nCore, nDust] = splitCounts(count, [0.56, 0.3, 0.14])
  const outline = polylineCloud(loop, nOutline, { jitter: 0.015 * S, zSpread: 0.04 * S })
  // Pulsierender Kern
  const core = new Float32Array(nCore * 3)
  for (let i = 0; i < nCore; i++) {
    core[i * 3] = gaussian() * 0.06 * S
    core[i * 3 + 1] = gaussian() * 0.06 * S
    core[i * 3 + 2] = gaussian() * 0.02 * S
  }
  const main = merge([outline, core])
  return merge([main, dustCloud(main, nDust, 0.07 * S)])
}

// ---------------------------------------------------------------------------
// 6) Datenbank — 3 gestapelte Zylinder + 4 einfließende Daten-Ströme
// ---------------------------------------------------------------------------

export function dbStackShape(count, { size = 320 } = {}) {
  const S = size
  const R = 0.32 * S
  const mh = 0.13 * S // Mantelhöhe
  const gap = 0.05 * S
  const tops = [-(1.5 * mh + gap), -0.5 * mh, 0.5 * mh + gap] // Oberkanten (y wächst nach unten)
  const [nStack, nStreams, nDust] = splitCounts(count, [0.75, 0.2, 0.05])
  const perCyl = splitCounts(nStack, [1, 1, 1.12]) // unterster etwas mehr (hat auch Boden)
  const stack = new Float32Array(nStack * 3)
  let j = 0
  for (let c = 0; c < 3; c++) {
    const top = tops[c]
    const isBottom = c === 2
    for (let i = 0; i < perCyl[c]; i++, j += 3) {
      const u = Math.random()
      const ang = Math.random() * TAU
      let x, y, z
      if (u < 0.58) {
        // Mantel
        const r = R + gaussian() * 0.01 * S
        x = Math.cos(ang) * r
        z = Math.sin(ang) * r
        y = top + Math.random() * mh
      } else {
        // Deckel-Ellipse (unterster Zylinder auch Boden)
        const r = R * Math.sqrt(Math.random())
        x = Math.cos(ang) * r
        z = Math.sin(ang) * r
        y = (isBottom && u > 0.87 ? top + mh : top) + gaussian() * 0.008 * S
      }
      stack[j] = x
      stack[j + 1] = y
      stack[j + 2] = z
    }
  }
  // 4 geschwungene Ströme von außen (auch aus der z-Tiefe) zur Stack-Mitte
  const bez = (P0, P1, t) =>
    P0.map((v, k) => (1 - t) * (1 - t) * v + 2 * (1 - t) * t * P1[k]) // P2 = Ursprung
  const streams = [
    [[0.55 * S, -0.38 * S, 0.1 * S], [0.3 * S, -0.3 * S, 0.05 * S]],
    [[-0.55 * S, 0.3 * S, 0.12 * S], [-0.35 * S, 0.05 * S, 0.3 * S]],
    [[0.08 * S, -0.12 * S, -0.55 * S], [0.15 * S, -0.25 * S, -0.28 * S]],
    [[-0.3 * S, -0.5 * S, 0.3 * S], [-0.05 * S, -0.28 * S, 0.15 * S]],
  ]
  const segs = []
  for (const [P0, P1] of streams) {
    let prev = P0
    for (let k = 1; k <= 10; k++) {
      const q = bez(P0, P1, k / 10)
      segs.push([prev, q])
      prev = q
    }
  }
  const str = segmentsCloud(segs, nStreams, { jitter: 0.012 * S })
  const main = merge([stack, str])
  return merge([main, dustCloud(main, nDust, 0.07 * S)])
}

// ---------------------------------------------------------------------------
// 7) Kompass — Ring, 12 Ticks, schlanke Nadel Richtung Nordost
// ---------------------------------------------------------------------------

export function compassShape(count, { size = 320 } = {}) {
  const S = size
  const R = 0.45 * S
  const [nRing, nTicks, nNeedle, nDust] = splitCounts(count, [0.45, 0.2, 0.2, 0.15])
  // Kreisring in der XY-Ebene mit Dicke-Jitter
  const ring = new Float32Array(nRing * 3)
  for (let i = 0; i < nRing; i++) {
    const ang = Math.random() * TAU
    const r = R + gaussian() * 0.015 * S
    ring[i * 3] = Math.cos(ang) * r
    ring[i * 3 + 1] = Math.sin(ang) * r
    ring[i * 3 + 2] = gaussian() * 0.015 * S
  }
  // 12 radiale Ticks innen am Ring, die 4 Haupt-Ticks länger + doppelt gewichtet
  const segs = []
  for (let k = 0; k < 12; k++) {
    const ang = (k * TAU) / 12
    const major = k % 3 === 0
    const r0 = major ? 0.335 * S : 0.385 * S
    const r1 = 0.435 * S
    const seg = [
      [Math.cos(ang) * r0, Math.sin(ang) * r0, 0],
      [Math.cos(ang) * r1, Math.sin(ang) * r1, 0],
    ]
    segs.push(seg)
    if (major) segs.push(seg) // dichter
  }
  const ticks = segmentsCloud(segs, nTicks, { jitter: 0.01 * S, zSpread: 0.02 * S })
  // Nadel: schlanke Raute Richtung Nordost (Bildschirm: +x/-y), Gegenspitze kürzer
  const needle = new Float32Array(nNeedle * 3)
  const dx = Math.SQRT1_2
  const dy = -Math.SQRT1_2
  const Lf = 0.85 * R
  const Lb = 0.35 * R
  const halfW = 0.03 * S
  for (let i = 0; i < nNeedle; i++) {
    const s = -Lb + Math.random() * (Lf + Lb)
    // (Lf||1)/(Lb||1): bei size=0 wäre s/Lf sonst 0/0 = NaN
    const w = halfW * (s >= 0 ? 1 - s / (Lf || 1) : 1 + s / (Lb || 1))
    const off = (Math.random() * 2 - 1) * w
    needle[i * 3] = dx * s - dy * off
    needle[i * 3 + 1] = dy * s + dx * off
    needle[i * 3 + 2] = gaussian() * 0.015 * S
  }
  const main = merge([ring, ticks, needle])
  return merge([main, dustCloud(main, nDust, 0.07 * S)])
}

// ---------------------------------------------------------------------------
// 8) Gehirn — echtes anatomisches SEITENPROFIL, aus einem 3D-Modell gesampelt
//    (siehe brain-points.mjs / CREDITS.md, CC BY 4.0). Frontallappen links,
//    Kleinhirn unten rechts, Hirnstamm nach unten. Kein Leistungs-Slot:
//    gehört zur Team-Sektion („Das Gehirn hinter Nuroy") und wird deshalb
//    NICHT in SCULPTURES gelistet.
// ---------------------------------------------------------------------------

// Template einmal dekodieren (Float32, Dokument-Konvention, BBox-Radius 1)
const BRAIN_TEMPLATE = brainTemplate()
const BRAIN_T = BRAIN_TEMPLATE.length / 3

/**
 * Erzeugt count Punkte, indem das gebackene Oberflächen-Template mit leichtem
 * Jitter auf die gewünschte Größe resampled wird. size ≈ Breite/Höhe der
 * Skulptur in px (wie bei den anderen Formen). ~7% Staub für den organischen
 * Rand. Rückgabe in Dokument-Konvention (y wächst nach unten) — reactor.mjs
 * spiegelt via flipY in den View-Raum.
 */
export function brainShape(count, { size = 320 } = {}) {
  // Template ist auf BBox-Radius 1 normiert; Faktor bringt das Profil auf
  // ~0.9·size Breite, vergleichbar mit den anderen Skulpturen.
  const scale = 0.62 * size
  const jit = 0.006 * size // Oberflächen-Jitter (verwischt die int8-Raster)
  const dustFrac = 0.07
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const k = ((Math.random() * BRAIN_T) | 0) * 3
    const dust = Math.random() < dustFrac
    const s = dust ? 0.05 * size : jit
    out[i * 3] = BRAIN_TEMPLATE[k] * scale + gaussian() * s
    out[i * 3 + 1] = BRAIN_TEMPLATE[k + 1] * scale + gaussian() * s
    out[i * 3 + 2] = BRAIN_TEMPLATE[k + 2] * scale + gaussian() * s
  }
  return out
}

/** Reihenfolge = Stationen 1-7 auf der Seite. */
export const SCULPTURES = [
  dashboardsShape,
  neuralSphereShape,
  codeShape,
  networkGridShape,
  speechBubbleShape,
  dbStackShape,
  compassShape,
]
