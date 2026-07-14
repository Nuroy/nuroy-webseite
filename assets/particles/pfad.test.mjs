import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildPath, depthZ, projScale, roadPoint, roadToScreen, roadFocus, roadX, visWindow, ROAD, smooth01, DEPTH_MAX_Z, DEPTH_MIN_Z } from './pfad.mjs'
import { sortiereProjekte, formatDatum, PROJEKTE } from '../projekte-daten.mjs'

const VW = 1440
const VH = 800
const CAM_D = VH / 2 / Math.tan((50 / 2) * (Math.PI / 180)) // wie die Systeme (fov 50)

/** Beispiel-Anker: sanft alternierende Kurve (Detailseiten-Hintergrund). */
function demoAnchors(n = 5) {
  const out = []
  for (let i = 0; i < n + 2; i++) {
    out.push({ x: VW * (i % 2 === 0 ? 0.3 : 0.7), y: 400 + i * 500 })
  }
  return out
}

test('buildPath liefert samples*4 endliche Werte und normierte Tangenten', () => {
  const { pts, length } = buildPath(demoAnchors(), { samples: 512 })
  assert.equal(pts.length, 512 * 4)
  assert.ok(length > 0)
  for (let i = 0; i < 512; i++) {
    for (let k = 0; k < 4; k++) assert.ok(Number.isFinite(pts[i * 4 + k]))
    const tl = Math.hypot(pts[i * 4 + 2], pts[i * 4 + 3])
    assert.ok(Math.abs(tl - 1) < 1e-4, `Tangente ${i} nicht normiert (${tl})`)
  }
})

test('buildPath läuft durch alle Anker', () => {
  const anchors = demoAnchors()
  const { pts } = buildPath(anchors, { samples: 512 })
  for (const a of anchors) {
    let best = Infinity
    for (let i = 0; i < 512; i++) {
      best = Math.min(best, Math.hypot(pts[i * 4] - a.x, pts[i * 4 + 1] - a.y))
    }
    // Resampling-Raster: Nachbar-Stützstellen liegen ~length/511 auseinander
    assert.ok(best < 12, `Anker (${a.x}|${a.y}) verfehlt um ${best.toFixed(1)}px`)
  }
})

test('buildPath ist gleichmäßig nach Bogenlänge gesampelt', () => {
  const { pts, length } = buildPath(demoAnchors(), { samples: 512 })
  const step = length / 511
  for (let i = 1; i < 512; i++) {
    const d = Math.hypot(pts[i * 4] - pts[(i - 1) * 4], pts[i * 4 + 1] - pts[(i - 1) * 4 + 1])
    assert.ok(d > step * 0.5 && d < step * 1.5, `Schrittweite ${i}: ${d.toFixed(1)} vs. ${step.toFixed(1)}`)
  }
})

test('buildPath hat keine Ecken (Tangenten drehen langsam)', () => {
  const { pts } = buildPath(demoAnchors(), { samples: 512 })
  for (let i = 1; i < 512; i++) {
    const dot =
      pts[i * 4 + 2] * pts[(i - 1) * 4 + 2] + pts[i * 4 + 3] * pts[(i - 1) * 4 + 3]
    const ang = Math.acos(Math.min(1, Math.max(-1, dot)))
    assert.ok(ang < 0.2, `Knick bei Stützstelle ${i}: ${ang.toFixed(3)} rad`)
  }
})

test('buildPath wirft bei zu wenigen Ankern', () => {
  assert.throws(() => buildPath([{ x: 0, y: 0 }]))
  assert.throws(() => buildPath([]))
})

test('depthZ: Mitte nah, Vergangenheit fern, monoton, geclampt', () => {
  assert.equal(depthZ(0, VH), 0)
  // unterhalb der Mitte (älter): streng monoton in die Ferne
  let prev = 0
  for (let dy = 100; dy <= 6000; dy += 100) {
    const z = depthZ(dy, VH)
    assert.ok(z <= prev, `depthZ nicht monoton bei dy=${dy}`)
    prev = z
  }
  assert.equal(depthZ(1e6, VH), DEPTH_MIN_Z)
  // oberhalb der Mitte (schon passiert): leicht nach vorn, gedeckelt
  assert.ok(depthZ(-300, VH) > 0)
  assert.equal(depthZ(-1e6, VH), DEPTH_MAX_Z)
})

test('projScale: 1 auf der Null-Ebene, <1 in der Ferne, >1 davor', () => {
  const camD = 955
  assert.equal(projScale(0, camD), 1)
  assert.ok(projScale(-1000, camD) < 0.5)
  assert.ok(projScale(200, camD) > 1)
})

test('smooth01 clamped und monoton', () => {
  assert.equal(smooth01(0, 1, -5), 0)
  assert.equal(smooth01(0, 1, 5), 1)
  assert.ok(smooth01(0, 1, 0.5) > 0 && smooth01(0, 1, 0.5) < 1)
  assert.equal(smooth01(1, 1, 2), 1) // e1 <= e0 → keine Division durch 0
})

test('roadPoint: Straße liegt unten und taucht monoton in die Tiefe', () => {
  // travel 0: Station 0 vorn, wachsende Stationen → z monoton Richtung Horizont
  let prevZ = Infinity
  for (let s = 0; s <= ROAD.window; s += 0.1) {
    const p = roadPoint(s, 0, VW, VH)
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z))
    assert.ok(p.z <= prevZ + 1e-9, `z nicht monoton bei s=${s.toFixed(1)}`)
    assert.ok(p.y < 0, 'Straße muss unter der Bildmitte liegen')
    prevZ = p.z
  }
  assert.equal(roadPoint(0, 0, VW, VH).z, ROAD.zFront)
  assert.equal(roadPoint(ROAD.window, 0, VW, VH).z, ROAD.zBack)
})

test('roadPoint: Kamera sitzt auf der Straße und schaut ihr entlang', () => {
  const off = VW * ROAD.offsetX // die Bahn liegt konstant rechts neben der Kamera
  for (const t of [0, 0.7, 1.3, 2.6, 4.1]) {
    // Punkt an der Kamera-Station: immer am festen Versatz (man fährt AUF der Bahn)
    assert.ok(Math.abs(roadPoint(t, t, VW, VH).x - off) < 1e-9, `Kamera-Punkt verrutscht bei t=${t}`)
    // direkt vor der Kamera startet die Straße geradeaus: O(u²)-Krümmung
    const eps = 0.01
    const near = roadPoint(t + eps, t, VW, VH).x - off
    assert.ok(Math.abs(near) < VW * ROAD.ampX * ROAD.freq * eps * eps * 2, `Straße schert vor der Kamera aus (t=${t}: ${near})`)
  }
})

test('roadPoint: Partikel fliegen vor der Kamera sichtbar vorbei (raumfest)', () => {
  // knapp hinter der Kamera (d < 0): Tiefe läuft weiter Richtung Betrachter …
  const passing = roadPoint(-0.1 * ROAD.window, 0, VW, VH)
  assert.ok(passing.z > ROAD.zFront, 'Punkt vor der Kamera muss näher als zFront sein')
  // … bis zum Vorbeiflug-Cap, hinter dem Horizont clampt zBack
  assert.equal(roadPoint(-ROAD.window, 0, VW, VH).z, ROAD.zPass)
  assert.equal(roadPoint(3 * ROAD.window, 0, VW, VH).z, ROAD.zBack)
  // Vorbeiflug wird unten aus dem Bild projiziert (Straße liegt unter der Kamera)
  const scr = roadToScreen(-0.08 * ROAD.window, 0, VW, VH, CAM_D)
  assert.ok(scr.y > VH, 'vorbeifliegender Straßenpunkt muss unter dem Bildrand liegen')
})

test('roadPoint: Fahrt bringt Stationen näher, Kurven schwenken die Ferne', () => {
  const win = visWindow(5)
  const fern = roadPoint(2, 0, VW, VH, win)
  const nah = roadPoint(2, 1.8, VW, VH, win)
  assert.ok(nah.z > fern.z, 'nach Fahrt muss Station 2 näher sein')
  // kamera-relativ: derselbe Straßenpunkt hat je nach Fahrt-Position
  // unterschiedliche seitliche Lage (der Horizont schwenkt in Kurven)
  assert.notEqual(roadPoint(3, 0, VW, VH, win).x, roadPoint(3, 1.5, VW, VH, win).x)
})

test('visWindow: alle Meilensteine passen vor den Horizont', () => {
  assert.equal(visWindow(1), ROAD.window)
  const win = visWindow(5)
  assert.ok(win > 5)
  // letzter Meilenstein (Station 4) liegt bei Start-Fahrt vor dem Horizont-Fade
  const d = roadPoint(4, -ROAD.focus, VW, VH, win).d
  assert.ok(d < 0.9, `ältester Meilenstein hinter dem Horizont-Fade (d=${d.toFixed(2)})`)
})

test('roadToScreen: nah groß und unten, fern klein Richtung Horizont-Mitte', () => {
  const nah = roadToScreen(ROAD.focus, 0, VW, VH, CAM_D)
  const fern = roadToScreen(ROAD.window * 0.9, 0, VW, VH, CAM_D)
  assert.ok(nah.f > fern.f, 'Perspektiv-Faktor muss mit der Tiefe fallen')
  assert.ok(nah.y > fern.y, 'ferne Punkte müssen höher (Richtung Horizont) liegen')
  assert.ok(nah.y > VH / 2 && nah.y < VH, 'vorderer Straßenpunkt in der unteren Bildhälfte')
})

test('roadFocus: rundet zur Station, blendet zwischen Stationen aus', () => {
  assert.deepEqual(roadFocus(0, 5), { index: 0, amt: 1 })
  assert.equal(roadFocus(2, 5).index, 2)
  assert.equal(roadFocus(2, 5).amt, 1)
  assert.equal(roadFocus(2.5, 5).amt, 0) // Mitte zwischen zwei Stationen
  assert.ok(roadFocus(2.2, 5).amt > 0 && roadFocus(2.2, 5).amt < 1)
  assert.equal(roadFocus(99, 5).index, 4) // hinter der letzten Station geklemmt
  assert.equal(roadFocus(-5, 5).index, 0)
})

test('sortiereProjekte: neueste zuerst, Original bleibt unangetastet', () => {
  const sorted = sortiereProjekte()
  for (let i = 1; i < sorted.length; i++) {
    assert.ok(sorted[i - 1].datum >= sorted[i].datum)
  }
  assert.equal(sorted.length, PROJEKTE.length)
  assert.notEqual(sorted, PROJEKTE)
})

test('formatDatum: YYYY-MM → deutscher Monat, Müll bleibt Müll', () => {
  assert.equal(formatDatum('2026-03'), 'Mär 2026')
  assert.equal(formatDatum('2025-12'), 'Dez 2025')
  assert.equal(formatDatum(''), '')
  assert.equal(formatDatum('irgendwas'), 'irgendwas')
})
