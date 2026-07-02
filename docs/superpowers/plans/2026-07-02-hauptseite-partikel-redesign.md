# Hauptseite Partikel-Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein WebGL-Partikelsystem für nuroy.de: Hero-Ring, der beim Scrollen zu einem vertikalen Partikel-Strahl durch die ganze Seite morpht; die 7 Leistungen leuchten als Stationen am Strahl auf.

**Architecture:** Ein fixierter Full-Viewport-Canvas (`z-index:-1`) hinter dem Seiteninhalt. Ein einziges `THREE.Points`-System (~26k Partikel Desktop / ~10k Mobile) mit Custom-Shadern: jeder Partikel kennt zwei Zielformen (Ring, Strahl in Dokument-Koordinaten); ein Scroll-Uniform blendet zwischen ihnen, Simplex-Noise erzeugt organisches Wabern, Stations-Glow wird über Distanz im Dokument-Raum berechnet. Umsetzung in 2 Stufen: erst Standalone-Prototyp `test-partikel.html`, nach User-Freigabe Einbau in `index.html`.

**Tech Stack:** Vanilla HTML/CSS/JS (kein Build-System), Three.js `0.166.1` per CDN-Import-Map, Node 24 `node:test` für die puren Geometrie-Funktionen, Playwright-MCP für visuelle Verifikation.

**Spec:** `docs/superpowers/specs/2026-07-02-hauptseite-partikel-redesign-design.md`

---

## Kontext für Ausführende (zuerst lesen)

- **Repo:** `/Users/max/Projekte/nuroywebseite` — statische Site, kein Framework, kein Bundler. Lokaler Server: `npm run dev` (serviert auf `http://127.0.0.1:8765`).
- **Branch:** `hauptseite-redesign` — hier arbeiten. **NIEMALS `git push`, kein Deploy** (explizite User-Regel).
- **Working Tree ist dirty:** `api/track.js` hat nicht-committete Änderungen, die NICHT zu diesem Projekt gehören. **Niemals `git add -A` oder `git add .`** — immer nur die konkret geänderten Dateien stagen.
- **Commit-Stil des Repos:** Deutsch mit Emoji-Präfix (z.B. `✨ Partikel: …`). Jede Commit-Message endet mit `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **Verifikation:** Es gibt keine Test-Infrastruktur im Repo. Pure Funktionen werden mit Node's eingebautem Test-Runner getestet (`node --test`, keine Dependencies). Visuelles wird mit den Playwright-MCP-Tools geprüft (`browser_navigate`, `browser_take_screenshot`, `browser_console_messages`, `browser_evaluate`, `browser_resize`).
- **Dateiendung `.mjs`:** Die Partikel-Module heißen `.mjs`, weil `package.json` kein `"type": "module"` hat — so kann Node sie als ES-Module testen, und der Browser lädt sie ohnehin als `<script type="module">`.
- **Design-Referenzen (aus der Spec):** organisch-staubige Partikel wie eine Partikel-DNA (keine cleane Geometrie), dichte hell aufleuchtende Cluster, Sterne im Hintergrund, Farbverlauf Nuroy-Pink `#FF2D7A` → Violett `#8B5CF6`, tiefdunkler Grund.

## Datei-Struktur

| Datei | Verantwortung |
|---|---|
| `assets/particles/shapes.mjs` | **Pure** Punktwolken-Generatoren (Ring, Strahl, Sterne, Zufallsattribute). Kein Three.js-Import → in Node testbar. |
| `assets/particles/shapes.test.mjs` | Node-Tests für die Generatoren. |
| `assets/particles/particle-system.mjs` | Three.js-Verkabelung: Renderer, Shader, Scroll-Kopplung, Stationen, Resize, Fallback, `destroy()`. Öffentliche API: `initParticles(opts)`. |
| `test-partikel.html` | Stufe-1-Prototyp: Dummy-Seite mit Hero + 7 Stationen, lädt das Partikelsystem. |
| `index.html` | Stufe 2: Hero zentriert, Canvas-Mount, `data-station`-Marker, transluzente Sektions-Hintergründe, tote Hero-Dashboard-Reste raus. |

---

### Task 1: Punktwolken-Generatoren (`shapes.mjs`) — TDD

**Files:**
- Test: `assets/particles/shapes.test.mjs`
- Create: `assets/particles/shapes.mjs`

- [ ] **Step 1: Failing Test schreiben**

`assets/particles/shapes.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ringShape, beamShape, randomAttrs, starField } from './shapes.mjs'

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

test('randomAttrs liefert count*4 Werte in [0,1)', () => {
  const a = randomAttrs(1000)
  assert.equal(a.length, 4000)
  for (const v of a) assert.ok(v >= 0 && v < 1)
})

test('starField liefert count*3 Werte, z nach hinten', () => {
  const s = starField(300, { width: 1440, height: 900, depth: 600 })
  assert.equal(s.length, 900)
  for (let i = 0; i < 300; i++) {
    assert.ok(s[i * 3 + 2] <= 0 && s[i * 3 + 2] >= -600)
  }
})
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `node --test assets/particles/`
Expected: FAIL mit `ERR_MODULE_NOT_FOUND` (shapes.mjs existiert noch nicht)

- [ ] **Step 3: Implementierung schreiben**

`assets/particles/shapes.mjs`:

```js
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

/** Pro Partikel 4 Zufallswerte in [0,1): [size, phase, colorMix, stagger]. */
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
```

- [ ] **Step 4: Tests laufen lassen — müssen bestehen**

Run: `node --test assets/particles/`
Expected: `# pass 5`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add assets/particles/shapes.mjs assets/particles/shapes.test.mjs
git commit -m "$(cat <<'EOF'
✨ Partikel: Punktwolken-Generatoren (Ring, Strahl, Sterne) + Node-Tests

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Partikelsystem-Modul (`particle-system.mjs`)

**Files:**
- Create: `assets/particles/particle-system.mjs`

Reine Browser-Logik (Three.js, Shader, Scroll) — kein sinnvoller Unit-Test möglich; Verifikation erfolgt in Task 3 im Browser. Hier nur Syntax-Check + Commit.

- [ ] **Step 1: Modul schreiben**

`assets/particles/particle-system.mjs` (komplette Datei):

```js
/**
 * Nuroy Partikelsystem — Hero-Ring, der beim Scrollen zu einem vertikalen
 * Strahl durch die ganze Seite morpht. Ein THREE.Points-System; das Morphing
 * passiert im Vertex-Shader über den Scroll-Uniform.
 *
 * Nutzung:
 *   <div id="particles-bg" aria-hidden="true"></div>  (CSS: position:fixed; inset:0; z-index:-1; pointer-events:none)
 *   initParticles({ mount: document.getElementById('particles-bg') })
 *
 * Fallback (kein WebGL / prefers-reduced-motion / ?particles=off):
 *   <html> bekommt die Klasse "particles-fallback", es wird nichts gerendert.
 */
import * as THREE from 'three'
import { ringShape, beamShape, randomAttrs, starField } from './shapes.mjs'

const MAX_STATIONS = 8

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`

const VERT = /* glsl */ `
attribute vec3 aRing;
attribute vec3 aBeam;
attribute vec4 aRand; // [size, phase, colorMix, stagger]

uniform float uTime;
uniform float uScrollY;
uniform float uViewportH;
uniform float uMorphStart;
uniform float uMorphEnd;
uniform float uCameraD;
uniform float uPixelRatio;
uniform float uStations[${MAX_STATIONS}];
uniform float uStationGlow[${MAX_STATIONS}];
uniform float uStationCount;

varying float vAlpha;
varying float vColorMix;
varying float vGlow;

${NOISE_GLSL}

void main() {
  // Gestaffeltes Morphing: jeder Partikel startet leicht versetzt (aRand.w),
  // dadurch "fließt" der Ring in den Strahl statt starr zu schalten.
  float span = max(uMorphEnd - uMorphStart, 1.0);
  float p = clamp((uScrollY - uMorphStart) / span, 0.0, 1.0);
  float m = smoothstep(aRand.w * 0.45, aRand.w * 0.45 + 0.55, p);

  // Ring ist im Dokument in der Mitte des ersten Viewports verankert
  vec3 ringDoc = vec3(aRing.x, uViewportH * 0.52 + aRing.y, aRing.z);
  vec3 doc = mix(ringDoc, aBeam, m);

  // Dokument-y (wächst nach unten) -> View-y (wächst nach oben).
  // Canvas ist fixed; die Partikel-"Welt" zieht am Betrachter vorbei.
  float viewY = (uScrollY + uViewportH * 0.5) - doc.y;
  vec3 pos = vec3(doc.x, viewY, doc.z);

  // Organisches Wabern (staubiger DNA-Look)
  float n1 = snoise(vec2(doc.x * 0.004 + aRand.y * 3.0, doc.y * 0.003 + uTime * 0.07));
  float n2 = snoise(vec2(doc.y * 0.0035 + 40.0, uTime * 0.09 + aRand.y * 9.0));
  pos.x += n1 * 16.0;
  pos.y += n2 * 12.0;
  pos.z += snoise(vec2(aRand.y * 20.0, uTime * 0.05)) * 10.0;

  // Stations-Glow: Helligkeits-Boost nahe aktiver Stationen (Dokument-Distanz)
  float glow = 0.0;
  for (int i = 0; i < ${MAX_STATIONS}; i++) {
    if (float(i) >= uStationCount) break;
    float d = abs(doc.y - uStations[i]);
    glow += uStationGlow[i] * exp(-(d * d) / (2.0 * 170.0 * 170.0));
  }
  vGlow = min(glow, 1.5);
  vColorMix = aRand.z;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  // uCameraD/-mv.z == 1.0 auf der z=0-Ebene => size ist ~CSS-Pixel
  float size = (0.9 + aRand.x * 2.4) * (1.0 + vGlow * 1.2);
  gl_PointSize = size * uPixelRatio * (uCameraD / -mv.z);

  // Weit außerhalb des Viewports ausblenden
  float off = max(0.0, abs(viewY) - uViewportH * 0.8);
  vAlpha = (0.3 + 0.7 * aRand.x) * exp(-off * 0.004);
}
`

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vColorMix;
varying float vGlow;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float disc = smoothstep(0.5, 0.05, length(uv));
  disc = pow(disc, 1.8);
  vec3 col = mix(uColorA, uColorB, vColorMix);
  // heißer, fast weißer Kern für aufleuchtende Cluster
  col = mix(col, vec3(1.0, 0.92, 0.98), min(vGlow * 0.55, 0.75));
  float a = disc * vAlpha * (0.55 + vGlow);
  if (a < 0.003) discard;
  gl_FragColor = vec4(col, a);
}
`

const STAR_VERT = /* glsl */ `
attribute float aTwinkle;
uniform float uTime;
uniform float uScrollY;
uniform float uCameraD;
uniform float uPixelRatio;
varying float vA;
void main() {
  vec3 pos = position;
  pos.y += uScrollY * 0.03; // leichte Parallaxe
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.0 + aTwinkle * 1.5) * uPixelRatio * (uCameraD / -mv.z);
  vA = 0.25 + 0.75 * abs(sin(uTime * (0.3 + aTwinkle) + aTwinkle * 20.0));
}
`

const STAR_FRAG = /* glsl */ `
varying float vA;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = smoothstep(0.5, 0.1, length(uv));
  gl_FragColor = vec4(vec3(0.85, 0.87, 1.0), d * vA * 0.5);
}
`

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function initParticles(opts = {}) {
  const {
    mount,
    stationSelector = '[data-station]',
    colorA = '#FF2D7A',
    colorB = '#8B5CF6',
    desktopCount = 26000,
    mobileCount = 10000,
    starCount = 350,
  } = opts

  const host = mount || document.getElementById('particles-bg')
  if (!host) throw new Error('initParticles: mount-Element fehlt')

  const forceOff = new URLSearchParams(location.search).get('particles') === 'off'
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  function fallback(reason) {
    document.documentElement.classList.add('particles-fallback')
    window.__particles = { mode: 'fallback', reason, count: 0 }
    return { mode: 'fallback', destroy() {} }
  }

  if (forceOff) return fallback('param')
  if (reduced) return fallback('reduced-motion')
  if (!hasWebGL()) return fallback('no-webgl')

  const isMobile = innerWidth < 768
  const count = isMobile ? mobileCount : desktopCount
  const dpr = Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 2)
  const fov = 50

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
  } catch {
    return fallback('renderer-error')
  }
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(dpr)
  renderer.setSize(innerWidth, innerHeight)
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 1, 5000)
  let cameraD = innerHeight / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2))
  camera.position.z = cameraD

  let docHeight = 1
  let stationYs = []

  const uniforms = {
    uTime: { value: 0 },
    uScrollY: { value: 0 },
    uViewportH: { value: innerHeight },
    uMorphStart: { value: innerHeight * 0.08 },
    uMorphEnd: { value: innerHeight * 1.15 },
    uCameraD: { value: cameraD },
    uPixelRatio: { value: dpr },
    uColorA: { value: new THREE.Color(colorA) },
    uColorB: { value: new THREE.Color(colorB) },
    uStations: { value: new Float32Array(MAX_STATIONS) },
    uStationGlow: { value: new Float32Array(MAX_STATIONS) },
    uStationCount: { value: 0 },
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute('aRand', new THREE.BufferAttribute(randomAttrs(count), 4))

  function measureDoc() {
    docHeight = Math.max(document.documentElement.scrollHeight, innerHeight)
    const els = [...document.querySelectorAll(stationSelector)].slice(0, MAX_STATIONS)
    stationYs = els.map((el) => {
      const r = el.getBoundingClientRect()
      return scrollY + r.top + r.height / 2
    })
    uniforms.uStationCount.value = stationYs.length
    uniforms.uStations.value.fill(0)
    stationYs.forEach((y, i) => (uniforms.uStations.value[i] = y))
  }

  function buildShapes() {
    const ringR = Math.min(innerWidth, innerHeight) * (isMobile ? 0.34 : 0.28)
    geometry.setAttribute(
      'aRing',
      new THREE.BufferAttribute(ringShape(count, { radius: ringR, tube: ringR * 0.09, scatter: ringR * 0.16 }), 3)
    )
    geometry.setAttribute(
      'aBeam',
      new THREE.BufferAttribute(beamShape(count, { docHeight, radius: isMobile ? 42 : 60 }), 3)
    )
  }

  measureDoc()
  buildShapes()

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  scene.add(points)

  // Sterne
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starField(starCount, { width: innerWidth, height: innerHeight }), 3))
  const twinkle = new Float32Array(starCount)
  for (let i = 0; i < starCount; i++) twinkle[i] = Math.random()
  starGeo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkle, 1))
  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uScrollY: uniforms.uScrollY,
      uCameraD: uniforms.uCameraD,
      uPixelRatio: uniforms.uPixelRatio,
    },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  })
  const stars = new THREE.Points(starGeo, starMat)
  stars.frustumCulled = false
  scene.add(stars)

  function updateGlow() {
    const center = scrollY + innerHeight / 2
    const g = uniforms.uStationGlow.value
    for (let i = 0; i < stationYs.length; i++) {
      const dist = Math.abs(center - stationYs[i])
      const target = dist < innerHeight * 0.4 ? 1 - dist / (innerHeight * 0.4) : 0
      g[i] += (Math.max(target, 0.12) - g[i]) * 0.08
    }
  }

  const clock = new THREE.Clock()
  let raf = null
  function tick() {
    raf = requestAnimationFrame(tick)
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uScrollY.value = scrollY
    updateGlow()
    renderer.render(scene, camera)
  }

  function start() {
    if (raf === null) tick()
  }
  function stop() {
    if (raf !== null) cancelAnimationFrame(raf)
    raf = null
  }

  function onVisibility() {
    document.hidden ? stop() : start()
  }
  document.addEventListener('visibilitychange', onVisibility)

  let resizeTimer = null
  function onResize() {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      camera.aspect = innerWidth / innerHeight
      cameraD = innerHeight / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2))
      camera.position.z = cameraD
      camera.updateProjectionMatrix()
      renderer.setSize(innerWidth, innerHeight)
      uniforms.uCameraD.value = cameraD
      uniforms.uViewportH.value = innerHeight
      uniforms.uMorphStart.value = innerHeight * 0.08
      uniforms.uMorphEnd.value = innerHeight * 1.15
      measureDoc()
      buildShapes()
    }, 250)
  }
  addEventListener('resize', onResize)
  // Nach vollständigem Laden (Fonts/Bilder) Dokumenthöhe + Stationen nachmessen
  addEventListener('load', onResize)

  start()
  window.__particles = { mode: 'webgl', count }

  return {
    mode: 'webgl',
    count,
    remeasure() {
      measureDoc()
    },
    destroy() {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      removeEventListener('resize', onResize)
      removeEventListener('load', onResize)
      geometry.dispose()
      material.dispose()
      starGeo.dispose()
      starMat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
```

- [ ] **Step 2: Syntax-Check**

Run: `node --check assets/particles/particle-system.mjs && echo SYNTAX_OK`
Expected: `SYNTAX_OK` (Node parst nur; der `three`-Import wird nicht aufgelöst — das ist ok)

- [ ] **Step 3: Commit**

```bash
git add assets/particles/particle-system.mjs
git commit -m "$(cat <<'EOF'
✨ Partikel: Three.js-System — Ring→Strahl-Morph, Stations-Glow, Sterne, Fallback

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Prototyp-Seite `test-partikel.html` + Browser-Verifikation

**Files:**
- Create: `test-partikel.html`

- [ ] **Step 1: Prototyp-Seite schreiben**

`test-partikel.html` (komplette Datei). Die 7 Stationen tragen die echten Leistungs-Namen aus `index.html`, Karten alternieren links/rechts, damit der Strahl in der Mitte sichtbar bleibt:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Partikel-Prototyp — Nuroy</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    :root {
      --pink: #FF2D7A;
      --violet: #8B5CF6;
      --fg: #f5f2ec;
      --fg-muted: rgba(245, 242, 236, 0.65);
      --line: rgba(255, 255, 255, 0.08);
    }
    * { box-sizing: border-box; margin: 0; }
    body {
      background: #05050a;
      color: var(--fg);
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    }
    #particles-bg {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
    }
    /* Statischer Fallback (kein WebGL / reduced motion / ?particles=off) */
    .particles-fallback #particles-bg {
      background:
        radial-gradient(ellipse 60% 40% at 50% 8%, rgba(255, 45, 122, 0.14), transparent 70%),
        radial-gradient(ellipse 40% 60% at 50% 60%, rgba(139, 92, 246, 0.1), transparent 70%);
    }
    .hero {
      min-height: 100vh;
      display: grid;
      place-items: center;
      text-align: center;
      padding: 24px;
    }
    .eyebrow {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--pink);
      margin-bottom: 20px;
    }
    h1 {
      font-size: clamp(44px, 7vw, 96px);
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 1.02;
      text-shadow: 0 4px 24px rgba(0, 0, 0, 0.9);
    }
    .sub { margin-top: 20px; color: var(--fg-muted); font-size: 17px; }
    .station {
      min-height: 85vh;
      display: flex;
      align-items: center;
      padding: 0 6vw;
    }
    .station--right { justify-content: flex-end; }
    .card {
      max-width: 380px;
      padding: 32px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: rgba(10, 10, 18, 0.55);
      backdrop-filter: blur(6px);
    }
    .card .num {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      color: var(--pink);
      letter-spacing: 0.1em;
    }
    .card h2 { font-size: 22px; letter-spacing: -0.02em; margin: 10px 0; }
    .card p { font-size: 14px; color: var(--fg-muted); line-height: 1.7; }
    .filler {
      min-height: 70vh;
      display: grid;
      place-items: center;
      color: var(--fg-muted);
      font-family: ui-monospace, monospace;
      font-size: 13px;
      letter-spacing: 0.08em;
    }
  </style>
</head>
<body>
<div id="particles-bg" aria-hidden="true"></div>

<section class="hero">
  <div>
    <p class="eyebrow">01 — Nuroy Prototyp</p>
    <h1>Die Technik-<br>Abteilung.</h1>
    <p class="sub">Scroll: Ring → Strahl → Stationen</p>
  </div>
</section>

<section class="station" data-station>
  <div class="card"><span class="num">01</span><h2>Custom Dashboards</h2><p>Daten aus allen Tools an einem Ort. Live. Übersichtlich. Auf eure KPIs zugeschnitten.</p></div>
</section>
<section class="station station--right" data-station>
  <div class="card"><span class="num">02</span><h2>KI-Agenten &amp; Automatisierungen</h2><p>Workflows automatisieren. KI-Agenten für Vertrieb, Support und interne Prozesse.</p></div>
</section>
<section class="station" data-station>
  <div class="card"><span class="num">03</span><h2>Custom Software-Entwicklung</h2><p>SaaS-Produkte, interne Tools, Kunden-Plattformen. Von der Idee bis zum Live-Betrieb.</p></div>
</section>
<section class="station station--right" data-station>
  <div class="card"><span class="num">04</span><h2>KI-Integration</h2><p>Lead-Scoring, Churn-Prediction, Sentiment-Analyse – direkt in euren Tools.</p></div>
</section>
<section class="station" data-station>
  <div class="card"><span class="num">05</span><h2>Interne Company-AI</h2><p>Euer eigener KI-Assistent. Trainiert auf eure Dokumente, Prozesse und euer Wissen.</p></div>
</section>
<section class="station station--right" data-station>
  <div class="card"><span class="num">06</span><h2>Datenintegration &amp; ETL</h2><p>Datensilos auflösen. Alle Quellen synchronisieren. Ein Data Warehouse für alles.</p></div>
</section>
<section class="station" data-station>
  <div class="card"><span class="num">07</span><h2>Strategy &amp; Audit</h2><p>2-wöchige Discovery-Phase. Tool-Stack prüfen. Roadmap definieren.</p></div>
</section>

<section class="filler">— KUNDENSTIMMEN (DUMMY) —</section>
<section class="filler">— FINAL CTA (DUMMY) —</section>

<script type="importmap">
  { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js" } }
</script>
<script type="module">
  import { initParticles } from './assets/particles/particle-system.mjs'
  initParticles({ mount: document.getElementById('particles-bg') })
</script>
</body>
</html>
```

- [ ] **Step 2: Dev-Server starten (Hintergrund)**

Run (run_in_background): `npm run dev`
Expected: Server lauscht auf `http://127.0.0.1:8765` (einmalig prüfen: `curl -sI http://127.0.0.1:8765/test-partikel.html | head -1` → `HTTP/1.1 200 OK`)

- [ ] **Step 3: Seite laden und Konsole prüfen**

Playwright-MCP:
1. `browser_navigate` → `http://127.0.0.1:8765/test-partikel.html`
2. 2 s warten (`browser_wait_for`), dann `browser_console_messages`

Expected: **keine** Errors (insb. keine Shader-Kompilierfehler, kein 404 auf three.js/das Modul).

3. `browser_evaluate` → `() => window.__particles`
Expected: `{ mode: 'webgl', count: 26000 }`

- [ ] **Step 4: Visuelle Prüfung an 4 Scroll-Positionen**

Für jede Position: `browser_evaluate` mit `(y) => window.scrollTo(0, y)`-Äquivalent, ~800 ms warten, `browser_take_screenshot`:

1. `window.scrollTo(0, 0)` → **Ring**: elliptischer Partikelring um die Headline, staubig, pink-violett, Sterne im Hintergrund
2. `window.scrollTo(0, window.innerHeight * 1.3)` → **Morph abgeschlossen**: vertikaler Strahl in Bildmitte
3. `window.scrollTo(0, document.querySelectorAll('[data-station]')[1].offsetTop)` → **Station 2 glüht**: sichtbare Verdichtung/Aufhellung auf Kartenhöhe
4. `window.scrollTo(0, document.documentElement.scrollHeight)` → Strahl läuft bis zum Seitenende durch

Bewertungskriterien (aus der Spec): organisch/staubig statt geometrisch-clean, leuchtende Cluster, kosmische Farbwelt. Bei Abweichungen: Parameter justieren (Partikelgröße, Noise-Amplituden `16/12/10`, Glow-Sigma `170`, Farben) und Screenshots wiederholen.

- [ ] **Step 5: Schneller Performance-Check**

`browser_evaluate`:

```js
() => new Promise((res) => {
  const t0 = performance.now()
  let n = 0
  function f() { n++; n < 120 ? requestAnimationFrame(f) : res((performance.now() - t0) / 120) }
  requestAnimationFrame(f)
})
```

Expected: Ø Frame-Zeit < 20 ms auf dem Dev-Rechner (M-Serie). Wenn deutlich darüber: `desktopCount` senken (z.B. 18000) und erneut messen.

- [ ] **Step 6: Commit**

```bash
git add test-partikel.html
git commit -m "$(cat <<'EOF'
✨ Partikel: Prototyp-Seite test-partikel.html (Ring→Strahl mit 7 Stationen)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Fallback- und Mobile-Verifikation (Prototyp)

**Files:**
- ggf. Fix-Änderungen an `assets/particles/particle-system.mjs` / `test-partikel.html`

- [ ] **Step 1: Erzwungener Fallback**

1. `browser_navigate` → `http://127.0.0.1:8765/test-partikel.html?particles=off`
2. `browser_evaluate` → `() => window.__particles`
   Expected: `{ mode: 'fallback', reason: 'param', count: 0 }`
3. `browser_take_screenshot` — Expected: statischer Pink/Violett-Gradient sichtbar, alle Texte lesbar, kein Canvas.

- [ ] **Step 2: Mobile-Viewport**

1. `browser_resize` → 390 × 844
2. `browser_navigate` → `http://127.0.0.1:8765/test-partikel.html` (neu laden, damit `isMobile` greift)
3. `browser_evaluate` → `() => window.__particles.count` — Expected: `10000`
4. Screenshots bei `scrollTo(0, 0)` und auf Höhe von Station 2 — Expected: Ring passt in den Viewport (Radius-Faktor 0.34 greift), Strahl mittig, Karten lesbar.

- [ ] **Step 3: Viewport zurücksetzen**

`browser_resize` → 1440 × 900

- [ ] **Step 4: Falls Fixes nötig waren — committen**

```bash
git add assets/particles/particle-system.mjs test-partikel.html
git commit -m "$(cat <<'EOF'
🐛 Partikel: Fixes aus Fallback-/Mobile-Verifikation

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: ⛔ CHECKPOINT — Freigabe durch Max

**Kein Code.** Max schaut sich `http://127.0.0.1:8765/test-partikel.html` lokal an (Server läuft bereits).

- [ ] **Step 1: Max informieren** — kurz zusammenfassen, was zu sehen ist und wie man es öffnet.
- [ ] **Step 2: WARTEN.** Look-Feedback einarbeiten und iterieren (Parameter: Farben, Dichte, Noise, Glow), bis Max den Look freigibt. **Ohne explizites OK nicht mit Task 6 beginnen.**

---

### Task 6: Stufe 2 — Hero in `index.html` zentrieren, Dashboard-Mockup & Waves raus

**Files:**
- Modify: `index.html` (Hero-Markup ~Zeile 1130–1245, Hero-CSS ~Zeile 46–165, Waves-Script ~Zeile 1793, Dashboard-Counter-JS ~Zeile 1853–1874)

**Wichtig:** `funnel/waves-animation.js` selbst NICHT löschen (wird von Funnel-Seiten genutzt) — nur die Einbindung in `index.html` entfernen.

- [ ] **Step 1: Hero-Markup ersetzen**

Den kompletten Block `<section class="hero">…</section>` (inkl. `#waves-container`-Div, `hero-inner`, `hero-left`, `hero-right` mit `hero-dashboard`) ersetzen durch:

```html
<!-- ═══════════════════ HERO ═══════════════════ -->
<section class="hero hero--centered">
  <div class="noise-overlay"></div>
  <div class="container">
    <div class="hero-center">
      <div class="hero-label reveal">
        <span class="hero-label-dot"></span>
        Gegründet 2024 &mdash; 2 Jahre &mdash; DACH remote
      </div>
      <h1 class="hero-headline reveal reveal-d1">
        Die Technik-<br><span class="accent">Abteilung.</span>
      </h1>
      <p class="hero-sub reveal reveal-d2">
        Für KMU, die <span class="hi">bauen</span> wollen, statt zu verwalten.<br>
        Custom Dashboards mit KI, Software und Automatisierung — aus einer Hand.
      </p>
      <div class="hero-ctas reveal reveal-d3">
        <a href="kontakt" class="btn btn-primary btn-lg">
          Erstgespräch buchen
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a href="arbeiten" class="btn btn-secondary btn-lg">Arbeiten ansehen</a>
      </div>
      <div class="hero-meta reveal reveal-d4">
        <span>10+ Experten · DACH remote</span>
        <span class="hero-meta-sep">|</span>
        <span>Paphos, Zypern</span>
        <span class="hero-meta-sep">|</span>
        <span>Remote-First</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Hero-CSS ergänzen**

Im `<style>`-Block von `index.html`, direkt nach der bestehenden `.hero { … }`-Regel einfügen (die alte `.hero`-Regel bleibt, wird aber überschrieben):

```css
/* Zentrierter Hero über dem Partikel-Canvas */
.hero--centered { background: transparent; }
.hero-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 96px 0 64px;
  position: relative;
  z-index: 2;
}
.hero-center .hero-sub {
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}
.hero-center .hero-ctas { justify-content: center; }
.hero-center .hero-meta { justify-content: center; flex-wrap: wrap; }
```

- [ ] **Step 3: Waves-Script-Einbindung entfernen**

Zeile `<script src="funnel/waves-animation.js"></script>` ersatzlos löschen.

- [ ] **Step 4: Dashboard-Counter-JS entfernen**

Den Block `/* ── Dashboard metric counters ───────── */` mit dem `setTimeout(() => { const m1 = … }, 500)` komplett löschen (die Elemente `#m1/#m2/#m3` existieren nach Step 1 nicht mehr). Die Funktion `countUp` und der `statObs`-Block bleiben — sie werden von der Stats-Sektion (`data-count`) weiter genutzt.

- [ ] **Step 5: Zwischencheck im Browser**

`browser_navigate` → `http://127.0.0.1:8765/` (bzw. `/index.html`), `browser_console_messages` prüfen (keine Errors, insb. kein Referenz-Fehler auf `WavesAnimation`/`#m1`), Screenshot: Hero zentriert, noch ohne Partikel (kommt in Task 7), Navigation oben intakt.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
✨ Hauptseite: Hero zentriert — Dashboard-Mockup & Waves-Animation raus

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Stufe 2 — Partikel-Canvas, Stationen & transluzente Hintergründe in `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Canvas-Mount einfügen**

Direkt nach `<body>` (vor `<div id="cursor-glow">`):

```html
<div id="particles-bg" aria-hidden="true"></div>
```

- [ ] **Step 2: Canvas- und Fallback-CSS einfügen**

Am Anfang des `<style>`-Blocks in `index.html`:

```css
/* ── Partikel-Hintergrund ───────────────── */
#particles-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
.particles-fallback #particles-bg {
  background:
    radial-gradient(ellipse 60% 40% at 50% 8%, rgba(255, 45, 122, 0.14), transparent 70%),
    radial-gradient(ellipse 40% 60% at 50% 60%, rgba(139, 92, 246, 0.1), transparent 70%);
}
/* Sektionen mit Voll-Hintergrund werden transluzent, damit der Strahl durchscheint */
.section--tinted {
  background: rgba(8, 8, 14, 0.82);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.manifest { background: rgba(8, 8, 14, 0.6); }
```

Hinweis: `.manifest` hat in der bestehenden Regel `background: var(--bg-2)` — die neue Regel muss NACH der bestehenden `.manifest`-Regel stehen oder die bestehende Regel wird direkt angepasst (sauberer: bestehende `.manifest`-Regel editieren und dort `background: rgba(8, 8, 14, 0.6);` setzen, dann entfällt die Override-Zeile hier).

- [ ] **Step 3: Inline-Hintergründe der Sektionen durch Klasse ersetzen**

Drei Sektionen tragen `style="background:var(--bg-2); border-top:1px solid var(--line); border-bottom:1px solid var(--line);"` (Portfolio-Teaser ~Z. 1392, Stats ~Z. 1593, FAQ ~Z. 1676). Jeweils ersetzen:

```html
<!-- vorher -->
<section class="section" style="background:var(--bg-2); border-top:1px solid var(--line); border-bottom:1px solid var(--line);">
<!-- nachher -->
<section class="section section--tinted">
```

- [ ] **Step 4: `data-station` an die 7 Service-Karten**

An jedem der 7 `<a class="service-card" …>`-Elemente das Attribut `data-station` ergänzen, z.B.:

```html
<a href="leistungen/dashboards" class="service-card reveal reveal-d1" data-num="01" data-station>
```

(analog für alle 7 Karten: dashboards, ki-agenten, software, ki-integration, company-ai, datenintegration, strategy-audit)

- [ ] **Step 5: Import-Map + Init-Script einfügen**

Vor `</body>`, NACH dem bestehenden Inline-`<script>`-Block:

```html
<script type="importmap">
  { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js" } }
</script>
<script type="module">
  import { initParticles } from './assets/particles/particle-system.mjs'
  initParticles({ mount: document.getElementById('particles-bg') })
</script>
```

- [ ] **Step 6: Browser-Verifikation**

1. `browser_navigate` → `http://127.0.0.1:8765/`
2. `browser_console_messages` → keine Errors
3. `browser_evaluate` → `() => window.__particles` → `{ mode: 'webgl', count: 26000 }`
4. Screenshots: (a) Hero mit Ring um die zentrierte Headline, (b) Leistungen-Sektion — Strahl + Glow hinter den Karten sichtbar, (c) Stats/FAQ — Strahl schimmert durch die getönten Sektionen, (d) Final-CTA (opak pink — Strahl endet dort sichtbar, das ist ok)

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
✨ Hauptseite: Partikel-Strahl integriert — Canvas, 7 Stationen, transluzente Sektionen

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Toten Code aus `index.html` entfernen

**Files:**
- Modify: `index.html`

Nach Task 6 sind Hero-Dashboard und Waves weg — die zugehörigen Styles sind tot:

- [ ] **Step 1: CSS-Blöcke löschen**

1. Kompletten Block `/* ── Hero Dashboard ─────────────────────── */` bis einschließlich `.db-feed-item-status--pink { … }` löschen (alle `.db-*`- und `.chart-*`-Regeln inkl. `@keyframes draw-line`/`fade-in`).
2. `.hero-glow { … }`-Regel löschen (das Div wurde in Task 6 entfernt).
3. In den Media-Queries: die Regeln für `#waves-container` (Desktop ~Z. 951 und Mobile ~Z. 1103) sowie den `.hero-right { … }`-Block und `.hero-inner`-Regeln löschen.

**Vorsicht:** Die `.mock-*`-Regeln NICHT löschen — die Portfolio-Karten nutzen sie weiterhin.

- [ ] **Step 2: Verifizieren, dass nichts mehr referenziert**

Run: `grep -n -e 'db-' -e 'waves' -e 'hero-right' -e 'hero-inner' -e 'hero-glow' index.html`
Expected: keine Treffer mehr (bzw. nur irrelevante Wortteile — Ergebnis prüfen).

- [ ] **Step 3: Browser-Gegencheck**

`browser_navigate` → `http://127.0.0.1:8765/`, `browser_console_messages` (keine Errors), Screenshot Hero + Portfolio-Sektion (Mock-Karten intakt).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
🧹 Hauptseite: tote Hero-Dashboard-/Waves-Styles entfernt

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Volle Verifikation der integrierten Seite

**Files:** keine neuen — nur Fixes, falls etwas auffällt.

- [ ] **Step 1: Desktop-Durchlauf (1440×900)**

`browser_resize` 1440×900, `browser_navigate` → `http://127.0.0.1:8765/`. Screenshots an: Scroll 0 (Ring), ~1.3×Viewport (Morph fertig), Leistungen (Stationen glühen), Kundenstimmen, Stats, FAQ, Final-CTA. Konsole: keine Errors.

- [ ] **Step 2: Interaktionen**

1. FAQ: per `browser_click` erste Frage öffnen → Antwort sichtbar (Accordion funktioniert über dem Canvas)
2. Navigation: `browser_click` auf „Arbeiten ansehen"-CTA → navigiert zu `/arbeiten` (dann zurück)
3. `browser_evaluate` → `() => getComputedStyle(document.getElementById('particles-bg')).pointerEvents` → `"none"`

- [ ] **Step 3: Mobile-Durchlauf (390×844)**

`browser_resize` 390×844, neu laden. `window.__particles.count === 10000`. Screenshots: Hero (Ring passt), Leistungen (1-spaltig, Strahl sichtbar), FAQ. Text überall lesbar.

- [ ] **Step 4: Fallback auf der echten Seite**

`http://127.0.0.1:8765/?particles=off` → `__particles.mode === 'fallback'`, Screenshot: Seite voll nutzbar mit statischem Gradient.

- [ ] **Step 5: Performance**

Gleiche 120-Frame-Messung wie Task 3 Step 5 auf der echten Seite. Expected: Ø < 20 ms Desktop. Bei Überschreitung: `desktopCount` runter, erneut messen, Wert im Commit dokumentieren.

- [ ] **Step 6: Fixes committen (falls angefallen)**

```bash
git add index.html assets/particles/
git commit -m "$(cat <<'EOF'
🐛 Hauptseite: Fixes aus der Gesamt-Verifikation des Partikel-Systems

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: ⛔ CHECKPOINT — Finale Abnahme durch Max

- [ ] **Step 1:** Max informieren: neue Hauptseite lokal unter `http://127.0.0.1:8765/` ansehen (Desktop + Handy-Simulation), Feedback einarbeiten.
- [ ] **Step 2:** **KEIN `git push`, KEIN Deploy** — erst wenn Max explizit freigibt. Bis dahin bleibt alles auf dem Branch `hauptseite-redesign`.
