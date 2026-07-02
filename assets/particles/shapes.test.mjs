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

test('samplePointsFromAlpha: Bounding-Box-Zentrierung, Skalierung, y-Richtung bleibt', () => {
  // 4x4-Bild: opak sind nur (0,0) oben links und (3,3) unten rechts —
  // transparentes Padding drumherum darf Größe/Zentrum nicht beeinflussen
  const width = 4, height = 4
  const data = new Uint8ClampedArray(width * height * 4)
  data[(0 * width + 0) * 4 + 3] = 255
  data[(3 * width + 3) * 4 + 3] = 255
  const pts = samplePointsFromAlpha({ width, height, data }, 400, { targetWidth: 400, jitter: 0, zSpread: 0 })
  assert.equal(pts.length, 1200)
  let sawLeft = false, sawRight = false
  for (let i = 0; i < 400; i++) {
    const x = pts[i * 3], y = pts[i * 3 + 1]
    assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(pts[i * 3 + 2]))
    if (x < 0) { sawLeft = true; assert.ok(y < 0, `oberer Pixel muss y<0 haben, war ${y} — vertikaler Flip?`) }
    if (x > 0) { sawRight = true; assert.ok(y > 0, `unterer Pixel muss y>0 haben, war ${y}`) }
    assert.ok(Math.abs(x) <= 250 && Math.abs(y) <= 250, `Punkt (${x},${y}) außerhalb der skalierten Bounding-Box`)
  }
  assert.ok(sawLeft && sawRight, 'beide opaken Pixel sollten gesampelt werden')
})

test('samplePointsFromAlpha wirft bei fehlenden Pflichtargumenten', () => {
  const empty = { width: 2, height: 2, data: new Uint8ClampedArray(16) }
  assert.throws(() => samplePointsFromAlpha(empty, 10, { targetWidth: 100 })) // keine opaken Pixel
  const one = { width: 1, height: 1, data: new Uint8ClampedArray([0, 0, 0, 255]) }
  assert.throws(() => samplePointsFromAlpha(one, 10, {})) // targetWidth fehlt
})
