import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ringShape, beamShape, randomAttrs, starField, samplePointsFromAlpha } from './shapes.mjs'

test('ringShape liefert count*3 endliche Werte in plausiblen Grenzen', () => {
  const n = 5000
  const pts = ringShape(n, { radius: 200, tube: 20, scatter: 30 })
  assert.equal(pts.length, n * 3)
  let maxR = 0
  for (let i = 0; i < n; i++) {
    const x = pts[i * 3], y = pts[i * 3 + 1], z = pts[i * 3 + 2]
    assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z))
    maxR = Math.max(maxR, Math.hypot(x, y))
  }
  // Gauss-Ausläufer sind ok, aber jenseits von 6 Sigma wäre es ein Bug
  assert.ok(maxR < 200 + 6 * 20 + 6 * 30, `maxR ${maxR} unplausibel groß`)
})

test('beamShape überspannt die Dokumenthöhe und bleibt nahe der Achse', () => {
  const n = 5000
  const pts = beamShape(n, { docHeight: 8000, radius: 50 })
  assert.equal(pts.length, n * 3)
  let minY = Infinity, maxY = -Infinity
  for (let i = 0; i < n; i++) {
    const y = pts[i * 3 + 1]
    assert.ok(y >= 0 && y <= 8000, `y ${y} außerhalb des Dokuments`)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  assert.ok(minY < 400 && maxY > 7600, 'Strahl deckt nicht die ganze Höhe ab')
})

test('beamShape wirft ohne docHeight', () => {
  assert.throws(() => beamShape(10, {}))
})

test('randomAttrs liefert count*4 Werte in [0,1]', () => {
  const a = randomAttrs(1000)
  assert.equal(a.length, 4000)
  for (const v of a) assert.ok(v >= 0 && v <= 1)
})

test('starField liefert count*3 Werte, z nach hinten', () => {
  const s = starField(300, { width: 1440, height: 900, depth: 600 })
  assert.equal(s.length, 900)
  for (let i = 0; i < 300; i++) {
    assert.ok(s[i * 3 + 2] <= 0 && s[i * 3 + 2] >= -600)
  }
})

test('samplePointsFromAlpha sampelt nur opake Pixel, skaliert, y-Richtung bleibt', () => {
  // 4x2-Bild, nur Pixel (0,0) links oben ist opak
  const width = 4, height = 2
  const data = new Uint8ClampedArray(width * height * 4)
  data[3] = 255
  const pts = samplePointsFromAlpha({ width, height, data }, 200, { targetWidth: 400, jitter: 0, zSpread: 0 })
  assert.equal(pts.length, 600)
  for (let i = 0; i < 200; i++) {
    const x = pts[i * 3], y = pts[i * 3 + 1]
    assert.ok(x < 0, `x ${x} sollte links der Mitte liegen`)
    assert.ok(y < 0, `y ${y} sollte über der Mitte liegen (Bild-y == Attribut-y, kein Flip)`)
    assert.ok(Number.isFinite(pts[i * 3 + 2]))
  }
})

test('samplePointsFromAlpha wirft bei fehlenden Pflichtargumenten', () => {
  const empty = { width: 2, height: 2, data: new Uint8ClampedArray(16) }
  assert.throws(() => samplePointsFromAlpha(empty, 10, { targetWidth: 100 })) // keine opaken Pixel
  const one = { width: 1, height: 1, data: new Uint8ClampedArray([0, 0, 0, 255]) }
  assert.throws(() => samplePointsFromAlpha(one, 10, {})) // targetWidth fehlt
})
