import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  dashboardsShape,
  neuralSphereShape,
  codeShape,
  networkGridShape,
  speechBubbleShape,
  dbStackShape,
  compassShape,
  SCULPTURES,
  polylineCloud,
  segmentsCloud,
} from './sculptures.mjs'

const S = 320
const N = 8000

/** Zerlegt ein Float32Array(count*3) in x/y/z-Spalten. */
function cols(pts) {
  const n = pts.length / 3
  const xs = new Array(n), ys = new Array(n), zs = new Array(n)
  for (let i = 0; i < n; i++) {
    xs[i] = pts[i * 3]
    ys[i] = pts[i * 3 + 1]
    zs[i] = pts[i * 3 + 2]
  }
  return { n, xs, ys, zs }
}

/** Robustes Perzentil (p in [0,1]). */
function pct(values, p) {
  const s = [...values].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(p * s.length))]
}

function mean(values) {
  let s = 0
  for (const v of values) s += v
  return s / values.length
}

/** Anteil der Punkte, für die pred(x, y, z) gilt. */
function frac(pts, pred) {
  const n = pts.length / 3
  let hit = 0
  for (let i = 0; i < n; i++) if (pred(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2])) hit++
  return hit / n
}

// ---------------------------------------------------------------------------
// Export-Vertrag
// ---------------------------------------------------------------------------

test('SCULPTURES: genau 7 Generatoren in Stations-Reihenfolge', () => {
  assert.equal(SCULPTURES.length, 7)
  assert.deepEqual(SCULPTURES, [
    dashboardsShape,
    neuralSphereShape,
    codeShape,
    networkGridShape,
    speechBubbleShape,
    dbStackShape,
    compassShape,
  ])
  for (const fn of SCULPTURES) assert.equal(typeof fn, 'function')
})

// ---------------------------------------------------------------------------
// Generische Invarianten für alle 7 Skulpturen
// ---------------------------------------------------------------------------

const ALL = [
  ['dashboardsShape', dashboardsShape, 0.12],
  ['neuralSphereShape', neuralSphereShape, 0.12],
  ['codeShape', codeShape, 0.12],
  ['networkGridShape', networkGridShape, 0.2], // freie Knoten rechts oben → leicht asymmetrisch ok
  ['speechBubbleShape', speechBubbleShape, 0.12],
  ['dbStackShape', dbStackShape, 0.12],
  ['compassShape', compassShape, 0.2], // Nadel nach Nordost → leicht asymmetrisch ok
]

for (const [name, fn, centerTol] of ALL) {
  test(`${name}: Länge, endliche Werte, Bounding-Box, Zentrierung, 3D-Tiefe`, () => {
    const pts = fn(N, { size: S })
    assert.ok(pts instanceof Float32Array, 'muss Float32Array sein')
    assert.equal(pts.length, N * 3)
    const { xs, ys, zs } = cols(pts)
    const maxDims = new Array(N)
    for (let i = 0; i < N; i++) {
      assert.ok(
        Number.isFinite(xs[i]) && Number.isFinite(ys[i]) && Number.isFinite(zs[i]),
        `Punkt ${i} nicht endlich: ${xs[i]},${ys[i]},${zs[i]}`
      )
      maxDims[i] = Math.max(Math.abs(xs[i]), Math.abs(ys[i]))
    }
    // Größenordnung: Form füllt die Größe, ufert aber nicht aus (Staub toleriert)
    const maxAbs = Math.max(...maxDims)
    assert.ok(maxAbs >= 0.3 * S, `Skulptur zu klein: maxAbs ${maxAbs}`)
    assert.ok(maxAbs <= 1.2 * S, `Skulptur/Staub ufert aus: maxAbs ${maxAbs}`)
    assert.ok(pct(maxDims, 0.98) <= 0.8 * S, `Masse zu weit außen: p98 ${pct(maxDims, 0.98)}`)
    // Zentrierung um den Ursprung
    assert.ok(Math.abs(mean(xs)) <= centerTol * S, `mean x ${mean(xs)} nicht zentriert`)
    assert.ok(Math.abs(mean(ys)) <= centerTol * S, `mean y ${mean(ys)} nicht zentriert`)
    // Echte 3D-Tiefe: z darf keine flache Scheibe sein (Rotation um Y muss etwas zeigen)
    const absZ = zs.map(Math.abs)
    assert.ok(pct(absZ, 0.8) >= 0.012 * S, `zu flach: p80(|z|) ${pct(absZ, 0.8)}`)
  })
}

test('alle Skulpturen: Randfälle count=0 und count=1', () => {
  for (const fn of SCULPTURES) {
    assert.equal(fn(0).length, 0)
    const one = fn(1)
    assert.equal(one.length, 3)
    for (const v of one) assert.ok(Number.isFinite(v))
  }
})

// ---------------------------------------------------------------------------
// Helfer
// ---------------------------------------------------------------------------

test('polylineCloud: segmentlängen-gewichtete Verteilung', () => {
  // Zwei Segmente: Länge 100 (auf y=0) und Länge 300 (auf x=100) → ~25%/75%
  const pts = polylineCloud([[0, 0, 0], [100, 0, 0], [100, 300, 0]], 4000)
  assert.equal(pts.length, 12000)
  let onFirst = 0
  for (let i = 0; i < 4000; i++) {
    const x = pts[i * 3], y = pts[i * 3 + 1]
    assert.equal(pts[i * 3 + 2], 0)
    if (y <= 1e-9) {
      onFirst++
      assert.ok(x >= -1e-6 && x <= 100 + 1e-6, `Punkt neben Segment 1: ${x}`)
    } else {
      assert.ok(Math.abs(x - 100) <= 1e-6 && y <= 300 + 1e-6, `Punkt neben Segment 2: ${x},${y}`)
    }
  }
  const f = onFirst / 4000
  assert.ok(f > 0.17 && f < 0.33, `Längengewichtung verletzt: ${f} statt ~0.25`)
})

test('polylineCloud: zSpread begrenzt und wirksam', () => {
  const pts = polylineCloud([[0, 0, 0], [10, 0, 0]], 500, { zSpread: 5 })
  let sawDeep = false
  for (let i = 0; i < 500; i++) {
    const z = pts[i * 3 + 2]
    assert.ok(Math.abs(z) <= 5 + 1e-6, `zSpread überschritten: ${z}`)
    if (Math.abs(z) > 1) sawDeep = true
  }
  assert.ok(sawDeep, 'zSpread hat keine Tiefe erzeugt')
})

test('segmentsCloud: disjunkte Segmente ohne Verbindungsbrücke', () => {
  const pts = segmentsCloud(
    [
      [[0, 0, 0], [10, 0, 0]],
      [[100, 50, 0], [110, 50, 0]],
    ],
    600
  )
  for (let i = 0; i < 600; i++) {
    const x = pts[i * 3], y = pts[i * 3 + 1]
    const onA = Math.abs(y) < 1e-6 && x >= -1e-6 && x <= 10 + 1e-6
    const onB = Math.abs(y - 50) < 1e-6 && x >= 100 - 1e-6 && x <= 110 + 1e-6
    assert.ok(onA || onB, `Punkt zwischen den Segmenten: ${x},${y}`)
  }
})

// ---------------------------------------------------------------------------
// 1) Dashboards — Balken-Skyline
// ---------------------------------------------------------------------------

test('dashboardsShape: ≥5 getrennte x-Cluster, nichts unter der Grundlinie', () => {
  const pts = dashboardsShape(N, { size: S })
  const centers = [-0.405, -0.243, -0.081, 0.081, 0.243, 0.405].map((c) => c * S)
  let clusters = 0
  for (const c of centers) {
    if (frac(pts, (x) => Math.abs(x - c) <= 0.055 * S) >= 0.06) clusters++
  }
  assert.ok(clusters >= 5, `nur ${clusters} deutliche Balken-Cluster`)
  // Lücken zwischen den Balken bleiben dünn besetzt
  for (let i = 0; i < 5; i++) {
    const m = centers[i] + 0.081 * S
    const f = frac(pts, (x) => Math.abs(x - m) <= 0.015 * S)
    assert.ok(f <= 0.025, `Lücke bei ${m} zu voll: ${f}`)
  }
  // Grundlinie: darunter quasi leer
  const { ys } = cols(pts)
  assert.ok(Math.max(...ys) <= 0.35 * S, `Punkte deutlich unter der Grundlinie: maxY ${Math.max(...ys)}`)
  // Spitzen + Kurve existieren oberhalb
  assert.ok(frac(pts, (_x, y) => y < -0.1 * S) >= 0.05, 'keine Masse über den hohen Balken')
})

// ---------------------------------------------------------------------------
// 2) Neuronale Kugel
// ---------------------------------------------------------------------------

test('neuralSphereShape: Masse konzentriert auf der Schale', () => {
  for (const size of [S, 200]) {
    const pts = neuralSphereShape(N, { size })
    const f = frac(pts, (x, y, z) => {
      const r = Math.hypot(x, y, z)
      return r >= 0.36 * size && r <= 0.48 * size
    })
    assert.ok(f >= 0.5, `size ${size}: nur ${f} im Schalenband [0.36,0.48]·size`)
  }
})

// ---------------------------------------------------------------------------
// 3) Code „</>“
// ---------------------------------------------------------------------------

test('codeShape: drei Glyphen-Zonen, Slash fällt von rechts-oben nach links-unten', () => {
  const pts = codeShape(N, { size: S })
  assert.ok(frac(pts, (x) => x < -0.17 * S) >= 0.15, 'linke Klammer fehlt')
  assert.ok(frac(pts, (x) => Math.abs(x) <= 0.17 * S) >= 0.15, 'Slash-Zone fehlt')
  assert.ok(frac(pts, (x) => x > 0.17 * S) >= 0.15, 'rechte Klammer fehlt')
  // Im Mittelstreifen dominiert der Slash: steigend nach rechts oben (y wächst nach unten → corr < 0)
  const bx = [], by = []
  for (let i = 0; i < N; i++) {
    const x = pts[i * 3], y = pts[i * 3 + 1]
    if (Math.abs(x) <= 0.12 * S) { bx.push(x); by.push(y) }
  }
  assert.ok(bx.length > 500, 'zu wenig Punkte im Slash-Streifen')
  const mx = mean(bx), my = mean(by)
  let cxy = 0, vx = 0, vy = 0
  for (let i = 0; i < bx.length; i++) {
    cxy += (bx[i] - mx) * (by[i] - my)
    vx += (bx[i] - mx) ** 2
    vy += (by[i] - my) ** 2
  }
  const corr = cxy / Math.sqrt(vx * vy)
  assert.ok(corr < -0.5, `Slash-Korrelation zu schwach: ${corr}`)
})

// ---------------------------------------------------------------------------
// 4) Knoten-Netz
// ---------------------------------------------------------------------------

test('networkGridShape: 5 Knoten-Spalten plus freie Knoten rechts außen', () => {
  const pts = networkGridShape(N, { size: S })
  const colsX = [-0.44, -0.22, 0, 0.22, 0.44].map((c) => c * S)
  for (const cx of colsX) {
    const f = frac(pts, (x, y) => Math.abs(x - cx) <= 0.05 * S && Math.abs(y) <= 0.42 * S)
    assert.ok(f >= 0.04, `Spalte bei ${cx} zu dünn: ${f}`)
  }
  assert.ok(frac(pts, (x) => x > 0.5 * S) >= 0.02, 'freie Knoten rechts außen fehlen')
})

// ---------------------------------------------------------------------------
// 5) Sprechblase
// ---------------------------------------------------------------------------

test('speechBubbleShape: Outline-Band, Kern, Schwanz unten links', () => {
  const pts = speechBubbleShape(N, { size: S })
  // Outline: max-Norm nahe der Rundquadrat-Kante
  const band = frac(pts, (x, y) => {
    const m = Math.max(Math.abs(x), Math.abs(y)) / (0.45 * S)
    return m >= 0.75 && m <= 1.1
  })
  assert.ok(band >= 0.4, `Outline zu dünn: ${band}`)
  // Kern in der Mitte
  assert.ok(frac(pts, (x, y) => Math.hypot(x, y) < 0.2 * S) >= 0.15, 'Kern fehlt')
  // Schwanz/Kerbe: Masse unterhalb der Blase, links
  assert.ok(frac(pts, (x, y) => y > 0.47 * S && x < 0) >= 0.01, 'Schwanz unten links fehlt')
})

// ---------------------------------------------------------------------------
// 6) Datenbank-Stack
// ---------------------------------------------------------------------------

test('dbStackShape: 3 klar getrennte dichte y-Bänder', () => {
  const pts = dbStackShape(N, { size: S })
  const tops = [-0.245, -0.065, 0.115].map((t) => t * S)
  for (const top of tops) {
    const f = frac(pts, (_x, y) => y >= top && y <= top + 0.13 * S)
    assert.ok(f >= 0.15, `Zylinder-Band bei ${top} zu dünn: ${f}`)
  }
  // Lücken zwischen den Zylindern deutlich dünner besetzt
  for (const [g0, g1] of [[-0.105, -0.075], [0.075, 0.105]]) {
    const f = frac(pts, (_x, y) => y >= g0 * S && y <= g1 * S)
    assert.ok(f <= 0.06, `Lücke [${g0},${g1}] zu voll: ${f}`)
  }
})

// ---------------------------------------------------------------------------
// 7) Kompass
// ---------------------------------------------------------------------------

test('compassShape: Ring dominiert, Nadel zeigt nach Nordost', () => {
  const pts = compassShape(N, { size: S })
  const ring = frac(pts, (x, y) => {
    const r = Math.hypot(x, y)
    return r >= 0.4 * S && r <= 0.5 * S
  })
  assert.ok(ring >= 0.4, `Ring zu dünn: ${ring}`)
  // Nadel-Zone: 2D-Radius zwischen Zentrum und Ring-Innenkante
  let inZone = 0, ne = 0
  for (let i = 0; i < N; i++) {
    const x = pts[i * 3], y = pts[i * 3 + 1]
    const r = Math.hypot(x, y)
    if (r >= 0.18 * S && r <= 0.3 * S) {
      inZone++
      if (x > 0 && y < 0) ne++
    }
  }
  assert.ok(inZone >= 0.015 * N, `Nadel-Zone leer: ${inZone / N}`)
  assert.ok(ne / inZone >= 0.6, `Nadel zeigt nicht nach Nordost: ${ne / inZone}`)
})
