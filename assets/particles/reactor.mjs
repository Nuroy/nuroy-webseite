/**
 * Nuroy „Ringreaktor" — Gyroskop-Maschine aus 5 ineinander kippenden Ringen,
 * glühendem Kern und eingefangenem Orbit-Staub. Scroll treibt die Ringe wie
 * ein Getriebe gegenläufig an; an jeder [data-station] kippt die Maschine in
 * eine eigene Pose, schwenkt zur Seite und morpht in eine Themen-Skulptur
 * (SCULPTURES aus sculptures.mjs). Am Seitenende konvergiert alles und die
 * Partikel formen das N-Logo (Finale).
 *
 * Nutzung:
 *   <div id="particles-bg" aria-hidden="true"></div>  (CSS: position:fixed; inset:0; z-index:-1; pointer-events:none)
 *   initReactor({ mount: document.getElementById('particles-bg') })
 *
 * Fallback (kein WebGL2 / prefers-reduced-motion / ?particles=off):
 *   <html> bekommt die Klasse "particles-fallback", es wird nichts gerendert.
 */
import * as THREE from 'three'
import { starField, samplePointsFromAlpha, gaussian, randomAttrs } from './shapes.mjs'
import { SCULPTURES } from './sculptures.mjs'

const TAU = Math.PI * 2

// Maximal so viele Stationen wie Skulpturen; der Slot dahinter ist das Logo (Finale = „Station 8").
const STATION_MAX = SCULPTURES.length
const LOGO_SLOT = SCULPTURES.length

// Ring-Radius-Faktoren (außen → innen), relativ zu uMachineR
const RING_F = [1, 0.82, 0.66, 0.5, 0.36]

// Getriebe: Übersetzung pro Ring (Scroll-Antrieb) + Leerlauf-Drehung (Maschine lebt ohne Scroll)
const GEARS = [1.0, -1.6, 2.2, -0.7, 1.3]
const IDLE = [0.05, -0.07, 0.09, -0.04, 0.06]

/**
 * Posen der 5 Ringe: tx/tz = Kipp-Winkel (rad) um X bzw. Z, rs = Radius-Skalierung.
 * Index 0 = Hero, 1-7 = Stationen (Reihenfolge wie SCULPTURES), 8 = Finale.
 */
const POSES = [
  // Hero: chaotisch-organisches Gyroskop
  { tx: [0.5, 1.1, 0.3, -0.8, 1.4], tz: [0.2, -0.4, 1.2, 0.6, -1.0], rs: [1, 1, 1, 1, 1] },
  // 1 Dashboards: flach aufgefächerte Schalen
  { tx: [0.15, 0.3, 0.45, 0.6, 0.75], tz: [0, 0, 0, 0, 0], rs: [1, 0.9, 0.8, 0.7, 0.6] },
  // 2 KI-Agenten: wildes Kreiseln
  { tx: [0.2, 1.3, 0.7, -1.1, 2.0], tz: [0.4, 1.8, -1.2, 0.9, -0.5], rs: [1, 0.85, 0.95, 0.75, 0.9] },
  // 3 Software: alle hochkant, leicht gestaffelt verdreht
  { tx: [1.5708, 1.5708, 1.5708, 1.5708, 1.5708], tz: [0, 0.12, 0.24, 0.36, 0.48], rs: [1, 0.92, 0.84, 0.76, 0.68] },
  // 4 KI-Integration: zwei gegeneinander gekippte Paare + kleiner Innenring
  { tx: [0.9, 0.9, -0.9, -0.9, 0], tz: [0, 0.3, 0, -0.3, 0], rs: [0.9, 0.9, 0.9, 0.9, 0.5] },
  // 5 Company-AI: Trichter
  { tx: [0.25, 0.35, 0.45, 0.55, 0.65], tz: [0.1, -0.15, 0.2, -0.25, 0.3], rs: [1, 0.85, 0.7, 0.55, 0.4] },
  // 6 Datenintegration: fast liegende, dicht genestete Scheiben
  { tx: [1.45, 1.45, 1.45, 1.45, 1.45], tz: [0, 0, 0, 0, 0], rs: [1, 0.98, 0.96, 0.94, 0.92] },
  // 7 Strategie: Atommodell (orthogonale + diagonale Ebenen)
  { tx: [0, 1.5708, 0, 0.7854, -0.7854], tz: [0, 0, 1.5708, 0.7854, 0.7854], rs: [1, 0.95, 0.9, 0.85, 0.8] },
  // Finale: alle Ringe frontal, eng genestet
  { tx: [0, 0, 0, 0, 0], tz: [0, 0, 0, 0, 0], rs: [1, 0.97, 0.94, 0.91, 0.88] },
]

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
attribute vec4 aSeed;   // [Größe, Phase, colorMix, Stagger] in [0,1]
attribute float aRole;  // 0-4 = Ring-Index, 5 = Kern, 6 = Staub
attribute float aAngle; // Basiswinkel auf dem Ring / Bahn / Kern-Azimut
attribute float aRadius;// Ring: Tube-Jitter px | Kern: Radiusfaktor | Staub: Orbitradius-Faktor
attribute vec3 aShape;  // Skulptur-Slot (View-Raum, y nach oben)

uniform float uTime;
uniform float uScrollSmooth;
uniform float uCameraD;
uniform float uPixelRatio;
uniform vec2 uCenter;       // Maschinen-Zentrum in px (View-Raum)
uniform float uScale;       // Maschinen-Skalierung
uniform float uMachineR;    // Basisradius der Maschine in px
uniform float uSpin[5];     // Drehwinkel pro Ring (Getriebe)
uniform float uRingR[5];    // effektiver Ringradius in px (Faktor · uMachineR · Pose-rs)
uniform float uTiltX[5];    // Kippwinkel um X pro Ring
uniform float uTiltZ[5];    // Kippwinkel um Z pro Ring
uniform float uCoreHeat;    // Kern-Glut (0.25 Ruhe … ~1.75 Vollgas)
uniform float uFlare;       // Stations-Aufflammen (alle Partikel)
uniform float uSculptMix;   // 0 = Maschine, 1 = Skulptur
uniform float uSculptSpin;  // Rotation der Skulptur um die eigene Y-Achse
uniform vec2 uSculptCenter; // Skulptur-Zentrum in px (View-Raum)

varying float vAlpha;
varying float vColorMix;
varying float vHot;

${NOISE_GLSL}

mat3 rotX(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(1.0, 0.0, 0.0,  0.0, c, s,  0.0, -s, c);
}
mat3 rotY(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(c, 0.0, -s,  0.0, 1.0, 0.0,  s, 0.0, c);
}
mat3 rotZ(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(c, s, 0.0,  -s, c, 0.0,  0.0, 0.0, 1.0);
}

void main() {
  int role = int(aRole + 0.5);
  vec3 local = vec3(0.0);
  float coreBoost = 1.0;

  if (role <= 4) {
    // --- Ring: Parameter über konstante Schleife + break holen
    // (sichere Array-Indizierung, dynamischer Index ist in GLSL ES 1.00
    //  im Fragment tabu und auch im Vertex nicht auf allen Treibern robust)
    float spin = 0.0;
    float ringR = 0.0;
    float tiltX = 0.0;
    float tiltZ = 0.0;
    for (int i = 0; i < 5; i++) {
      if (i == role) {
        spin = uSpin[i];
        ringR = uRingR[i];
        tiltX = uTiltX[i];
        tiltZ = uTiltZ[i];
        break;
      }
    }
    float theta = aAngle + spin;
    local = vec3(cos(theta), sin(theta), 0.0) * (ringR + aRadius);
    local.z += (aSeed.y * 2.0 - 1.0) * 6.0; // Tube-Dicke in z
    local = rotX(tiltX) * (rotZ(tiltZ) * local);
  } else if (role == 5) {
    // --- Kern: Gauß-Wolke (Richtung aus aAngle/aSeed.z, Radius aus aRadius)
    float ct = aSeed.z * 2.0 - 1.0;
    float st = sqrt(max(0.0, 1.0 - ct * ct));
    local = vec3(cos(aAngle) * st, sin(aAngle) * st, ct) * (aRadius * uMachineR * 0.1);
    // Simplex-Wabern: der Kern brodelt
    local += vec3(
      snoise(vec2(aSeed.x * 9.0, uTime * 0.35)),
      snoise(vec2(aSeed.y * 9.0 + 31.0, uTime * 0.3)),
      snoise(vec2(aSeed.z * 9.0 + 57.0, uTime * 0.32))
    ) * (uMachineR * 0.02);
    coreBoost = 0.6 + uCoreHeat * 2.2;
  } else {
    // --- Staub: geneigte Kreisbahn — wie von der Maschine eingefangen
    float oa = aAngle + uTime * (0.1 + aSeed.y * 0.25) + uScrollSmooth * 0.0008;
    local = vec3(cos(oa), sin(oa), 0.0) * (aRadius * uMachineR);
    // zwei fixe, aus dem Seed abgeleitete Bahn-Neigungen
    local = rotX(aSeed.z * 2.6 - 1.3) * (rotZ(aSeed.w * 6.2831853) * local);
  }

  vec3 machineWorld = local * uScale + vec3(uCenter, 0.0);

  // --- Skulptur-Blend mit per-Partikel-Stagger: die Maschine „schüttet"
  // ihre Partikel nach und nach in die Skulptur um
  float m = smoothstep(aSeed.w * 0.35, aSeed.w * 0.35 + 0.65, uSculptMix);
  vec3 sculptWorld = rotY(uSculptSpin) * aShape + vec3(uSculptCenter, 0.0);
  vec3 world = mix(machineWorld, sculptWorld, m);

  // mildes organisches Wabern auf allen Rollen (±5px, staubiger Look)
  world.x += snoise(vec2(world.y * 0.004 + aSeed.y * 7.0, uTime * 0.08)) * 5.0;
  world.y += snoise(vec2(world.x * 0.004 + 23.0, uTime * 0.1 + aSeed.y * 5.0)) * 5.0;
  world.z += snoise(vec2(aSeed.y * 17.0, uTime * 0.06)) * 5.0;

  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;

  // --- Weißglut: Kern-Rolle + Stations-Flare + Skulptur-Highlights
  float hot = uFlare * 0.6 + uSculptMix * aSeed.x * 0.35;
  if (role == 5) hot += uCoreHeat;
  vHot = hot;
  vColorMix = aSeed.z;

  // Punkte vor der z=0-Ebene minimal größer/heller — billiger 3D-Eindruck
  float front = smoothstep(0.0, 60.0, world.z);

  // uCameraD/-mv.z == 1.0 auf der z=0-Ebene => size ist ~CSS-Pixel
  float size = (0.9 + aSeed.x * 2.4) * (1.0 + min(hot, 1.5) * 0.6) * (1.0 + front * 0.15);
  gl_PointSize = size * uPixelRatio * (uCameraD / -mv.z);

  vAlpha = (0.3 + 0.7 * aSeed.x) * coreBoost * (1.0 + front * 0.25);
  vAlpha *= exp(min(world.z, 0.0) * 0.002); // hinten liegende Punkte leicht dämpfen
}
`

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorHot;
varying float vAlpha;
varying float vColorMix;
varying float vHot;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float disc = smoothstep(0.5, 0.05, length(uv));
  disc = pow(disc, 1.8);
  vec3 col = mix(uColorA, uColorB, vColorMix);
  // Weißglut: heiße Partikel kippen Richtung uColorHot
  col = mix(col, uColorHot, clamp(vHot, 0.0, 0.85));
  float a = disc * vAlpha * (0.55 + min(vHot, 1.5) * 0.6);
  if (a < 0.003) discard;
  gl_FragColor = vec4(col, a);
}
`

const STAR_VERT = /* glsl */ `
attribute float aTwinkle;
uniform float uTime;
uniform float uScrollSmooth;
uniform float uCameraD;
uniform float uPixelRatio;
varying float vA;
void main() {
  vec3 pos = position;
  pos.y += uScrollSmooth * 0.03; // leichte Parallaxe
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
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}

/** Lädt das Logo und liefert (verkleinertes) ImageData für das Alpha-Sampling. */
async function loadLogoImageData(url) {
  const img = new Image()
  img.src = url
  await img.decode()
  const s = Math.min(1, 256 / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(img.naturalWidth * s))
  c.height = Math.max(1, Math.round(img.naturalHeight * s))
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, c.width, c.height)
  return ctx.getImageData(0, 0, c.width, c.height)
}

function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x))
}

/** GLSL-artiges smoothstep, robust gegen e1 <= e0 (Division durch 0). */
function smooth01(e0, e1, x) {
  const t = clamp((x - e0) / Math.max(e1 - e0, 1e-6), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Winkel-Lerp über den kürzesten Weg (Differenz auf [-π, π] normalisiert). */
function angleLerp(a, b, t) {
  let d = (b - a) % TAU
  if (d > Math.PI) d -= TAU
  if (d < -Math.PI) d += TAU
  return a + d * t
}

/**
 * Skulpturen/Logo kommen in Dokument-Konvention (y wächst nach unten),
 * der Shader arbeitet im View-Raum (y wächst nach oben) → einmal spiegeln.
 * Mutiert das Array in-place und gibt es zurück.
 */
function flipY(arr) {
  for (let i = 1; i < arr.length; i += 3) arr[i] = -arr[i]
  return arr
}

export function initReactor(opts = {}) {
  const {
    mount,
    stationSelector = '[data-station]',
    colorA = '#FF2D7A',
    colorB = '#8B5CF6',
    colorHot = '#FFF0F6',
    logoUrl = '/assets/logo-icon.png',
    desktopCount = 26000,
    mobileCount = 10000,
    starCount = 350,
  } = opts

  const host = mount || document.getElementById('particles-bg')
  if (!host) throw new Error('initReactor: mount-Element fehlt')

  const forceOff = new URLSearchParams(location.search).get('particles') === 'off'
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  function fallback(reason) {
    document.documentElement.classList.add('particles-fallback')
    window.__particles = { mode: 'fallback', reason, count: 0 }
    return { mode: 'fallback', count: 0, destroy() {}, remeasure() {} }
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

  function machineRadius() {
    return Math.min(innerWidth, innerHeight) * (isMobile ? 0.42 : 0.36)
  }

  const uniforms = {
    uTime: { value: 0 },
    uScrollSmooth: { value: scrollY },
    uCameraD: { value: cameraD },
    uPixelRatio: { value: dpr },
    uCenter: { value: new THREE.Vector2(0, 0) },
    uScale: { value: 1 },
    uMachineR: { value: machineRadius() },
    uSpin: { value: new Float32Array(5) },
    uRingR: { value: new Float32Array(5) },
    uTiltX: { value: new Float32Array(5) },
    uTiltZ: { value: new Float32Array(5) },
    uCoreHeat: { value: 0.25 },
    uFlare: { value: 0 },
    uSculptMix: { value: 0 },
    uSculptSpin: { value: 0 },
    uSculptCenter: { value: new THREE.Vector2(0, 0) },
    uColorA: { value: new THREE.Color(colorA).convertLinearToSRGB() },
    uColorB: { value: new THREE.Color(colorB).convertLinearToSRGB() },
    uColorHot: { value: new THREE.Color(colorHot).convertLinearToSRGB() },
  }

  // --- Partikel-Budget: 5 Ringe / Kern / Staub, bei abweichendem count
  // proportional skaliert (Defaults treffen die Spec exakt: 5·3800+3000+4000
  // bzw. 5·1450+1200+1550)
  const BUDGET = isMobile
    ? { ring: 1450, core: 1200, total: 10000 }
    : { ring: 3800, core: 3000, total: 26000 }
  const bf = count / BUDGET.total
  const nRing = Math.max(0, Math.round(BUDGET.ring * bf))
  const nCore = Math.max(0, Math.round(BUDGET.core * bf))

  const roleArr = new Float32Array(count)
  const angleArr = new Float32Array(count)
  const radiusArr = new Float32Array(count)
  let p = 0
  for (let r = 0; r < 5 && p < count; r++) {
    for (let i = 0; i < nRing && p < count; i++, p++) {
      roleArr[p] = r
      angleArr[p] = Math.random() * TAU
      radiusArr[p] = gaussian() * 10 // Tube-Jitter in px
    }
  }
  for (let i = 0; i < nCore && p < count; i++, p++) {
    roleArr[p] = 5
    angleArr[p] = Math.random() * TAU // Azimut der Kern-Richtung
    radiusArr[p] = Math.min(Math.abs(gaussian()) + 0.15, 3) // Kern-Radiusfaktor
  }
  for (; p < count; p++) {
    // Rest = Orbit-Staub (Defaults: 4000 desktop / 1550 mobil)
    roleArr[p] = 6
    angleArr[p] = Math.random() * TAU
    radiusArr[p] = 0.2 + Math.random() * 1.05 // Orbitradius-Faktor ∈ [0.2, 1.25]
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)) // Dummy
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(randomAttrs(count), 4))
  geometry.setAttribute('aRole', new THREE.BufferAttribute(roleArr, 1))
  geometry.setAttribute('aAngle', new THREE.BufferAttribute(angleArr, 1))
  geometry.setAttribute('aRadius', new THREE.BufferAttribute(radiusArr, 1))
  const aShapeAttr = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
  geometry.setAttribute('aShape', aShapeAttr)

  // --- Stationen + Dokumenthöhe
  let docHeight = 1
  let stationYs = []

  function measureDoc() {
    docHeight = Math.max(document.documentElement.scrollHeight, innerHeight)
    const els = [...document.querySelectorAll(stationSelector)].slice(0, STATION_MAX)
    stationYs = els.map((el) => {
      const r = el.getBoundingClientRect()
      return scrollY + r.top + r.height / 2
    })
  }

  // --- Skulptur-Slots: alle 7 Skulpturen + Logo werden vorgebaut, aShape
  // trägt immer genau eine davon (Swap nur bei uSculptMix ≈ 0, s. update)
  let logoData = null // ImageData des Logos nach erstem Laden (Cache für Resizes)
  let shapes = []
  let currentShape = -1 // welcher Slot gerade im aShape-Attribut liegt

  function sculptSize() {
    return Math.min(innerWidth, innerHeight) * (isMobile ? 0.6 : 0.5)
  }

  function buildLogoShape() {
    // Bis das Logo geladen ist (oder wenn es nicht ladbar ist): Slot mit Nullen —
    // das Finale zieht die Partikel dann zunächst nur ins Zentrum.
    if (!logoData) return new Float32Array(count * 3)
    return flipY(samplePointsFromAlpha(logoData, count, { targetWidth: sculptSize() }))
  }

  function buildShapes() {
    const size = sculptSize()
    shapes = SCULPTURES.map((fn) => flipY(fn(count, { size })))
    shapes.push(buildLogoShape())
    // Nach Resize liegt die aktuelle Form in neuer Größe vor → Slot auffrischen
    if (currentShape >= 0) {
      aShapeAttr.array.set(shapes[currentShape])
      aShapeAttr.needsUpdate = true
    }
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

  // --- Sterne (eigenes Points-Objekt, Twinkle + Scroll-Parallaxe)
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starField(starCount, { width: innerWidth, height: innerHeight }), 3))
  const twinkle = new Float32Array(starCount)
  for (let i = 0; i < starCount; i++) twinkle[i] = Math.random()
  starGeo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkle, 1))
  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uScrollSmooth: uniforms.uScrollSmooth,
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

  // --- CPU-Zustand für die Frame-Logik
  let scrollSmooth = scrollY
  let lastScrollY = scrollY
  let heat = 0 // Kern-Hitze aus Scroll-Geschwindigkeit
  let flare = 0 // Stations-Aufflammen
  let sculptMix = 0
  let sculptAnchor = 0 // Dokument-y, relativ zu dem die Skulptur rotiert

  function update(t) {
    scrollSmooth += (scrollY - scrollSmooth) * 0.12
    uniforms.uScrollSmooth.value = scrollSmooth
    const dScroll = scrollY - lastScrollY
    lastScrollY = scrollY

    const vh = Math.max(innerHeight, 1)
    const centerDoc = scrollSmooth + vh / 2

    // --- Getriebe: Scroll treibt die Ringe gegenläufig, Idle hält sie lebendig
    const spins = uniforms.uSpin.value
    for (let i = 0; i < 5; i++) spins[i] = scrollSmooth * GEARS[i] * 0.0035 + t * IDLE[i]

    // --- Kern-Hitze aus der Scroll-Geschwindigkeit
    heat += (clamp(Math.abs(dScroll) / 40, 0, 1) - heat) * 0.08

    // --- Stationen: Aktivierung über Abstand zur Viewport-Mitte
    let active = -1
    let aBest = 0
    for (let i = 0; i < stationYs.length; i++) {
      const a = Math.max(0, 1 - Math.abs(centerDoc - stationYs[i]) / (vh * 0.42))
      if (a > aBest) {
        aBest = a
        active = i
      }
    }
    // Rast-Easing: kleine „Einrast"-Delle, Aktivierung klebt an 0 und 1
    const aPrime = clamp(aBest - Math.sin(TAU * aBest) * 0.1, 0, 1)

    // --- Finale nur, wenn es überhaupt Stationen gibt: auf Hero-only-Seiten
    // (Prototyp) bleibt die Maschine einfach Maschine, uSculptMix bleibt 0.
    const hasStations = stationYs.length > 0
    const f = hasStations ? smooth01(docHeight - 2.4 * vh, docHeight - 1.1 * vh, centerDoc) : 0
    const f2 = hasStations ? smooth01(docHeight - 1.3 * vh, docHeight - 0.5 * vh, centerDoc) : 0

    // --- Skulptur-Slot: Swap nur, wenn die Skulptur (fast) unsichtbar ist.
    // Bekannte, akzeptierte Grenze: bei extrem schnellem Scrubben über mehrere
    // Stationen kann uSculptMix nicht rechtzeitig unter 0.06 fallen — der
    // Slot behält dann kurz die alte Form, bis der Mix einmal abgeklungen ist.
    let desired = currentShape
    if (f2 > 0) desired = LOGO_SLOT // Finale zählt als „Station 8"
    else if (active >= 0) desired = active
    if (desired !== currentShape && desired >= 0 && sculptMix < 0.06) {
      aShapeAttr.array.set(shapes[desired])
      aShapeAttr.needsUpdate = true
      currentShape = desired
    }

    // --- Skulptur-Mix (Maschine ↔ Skulptur) + Stations-Flare
    let mixTarget = active >= 0 ? smooth01(0.15, 0.8, aPrime) : 0
    mixTarget = Math.max(mixTarget, f2)
    sculptMix += (mixTarget - sculptMix) * 0.1
    uniforms.uSculptMix.value = sculptMix

    // kurzes Aufflammen beim Einrasten (a' > 0.75): schnell auf, langsam ab
    const flareTarget = Math.max(0, aPrime - 0.75) * 4
    flare += (flareTarget - flare) * (flareTarget > flare ? 0.3 : 0.06)
    uniforms.uFlare.value = flare

    uniforms.uCoreHeat.value = 0.25 + heat + f * 0.5

    // --- Skulptur-Rotation: dreht mit dem Scroll um die eigene Y-Achse,
    // friert im Finale sanft auf 0 ein (Logo steht frontal)
    if (f2 > 0) sculptAnchor = docHeight - 0.5 * vh
    else if (active >= 0) sculptAnchor = stationYs[active]
    let spinTarget = (centerDoc - sculptAnchor) * 0.004
    spinTarget *= 1 - smooth01(0.9, 1.0, f2)
    uniforms.uSculptSpin.value = spinTarget

    // --- Posen: Hero-Basis → Winkel-Lerp zur Stations-Pose → Finale-Blend
    const machineR = uniforms.uMachineR.value
    const hero = POSES[0]
    const fin = POSES[POSES.length - 1]
    const pose = active >= 0 ? POSES[1 + active] : null
    const tiltX = uniforms.uTiltX.value
    const tiltZ = uniforms.uTiltZ.value
    const ringR = uniforms.uRingR.value
    for (let i = 0; i < 5; i++) {
      let tx = hero.tx[i]
      let tz = hero.tz[i]
      let rs = hero.rs[i]
      if (pose) {
        tx = angleLerp(tx, pose.tx[i], aPrime)
        tz = angleLerp(tz, pose.tz[i], aPrime)
        rs += (pose.rs[i] - rs) * aPrime
      }
      tx = angleLerp(tx, fin.tx[i], f)
      tz = angleLerp(tz, fin.tz[i], f)
      rs += (fin.rs[i] - rs) * f
      tiltX[i] = tx
      tiltZ[i] = tz
      ringR[i] = RING_F[i] * machineR * rs
    }

    // Finale: die Getriebe-Spins konvergieren auf ihren Mittelwert
    if (f > 0) {
      let mean = 0
      for (let i = 0; i < 5; i++) mean += spins[i]
      mean /= 5
      for (let i = 0; i < 5; i++) spins[i] += (mean - spins[i]) * f
    }

    // --- Seiten-Schwenk: Prototyp-Karten alternieren links (gerade Indizes
    // 0,2,4,6) → Maschine/Skulptur weichen auf +x aus, sonst −x. Finale zieht
    // beides zurück in die Mitte.
    const sideX = active >= 0 ? (active % 2 === 0 ? 1 : -1) * innerWidth * 0.24 : 0
    const targetX = sideX * (1 - f)
    uniforms.uCenter.value.x += (targetX - uniforms.uCenter.value.x) * 0.06
    uniforms.uSculptCenter.value.x += (targetX - uniforms.uSculptCenter.value.x) * 0.06

    // --- Skalierung: Hero 1.0 → 0.62 bei aktiver Station, Finale → 0.85
    const scaleBase = active >= 0 ? 0.62 : 1.0
    const scaleTarget = scaleBase + (0.85 - scaleBase) * f
    uniforms.uScale.value += (scaleTarget - uniforms.uScale.value) * 0.06
  }

  const clock = new THREE.Clock()
  let raf = null
  function tick() {
    raf = requestAnimationFrame(tick)
    const t = clock.getElapsedTime()
    uniforms.uTime.value = t
    update(t)
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
      uniforms.uMachineR.value = machineRadius()
      measureDoc()
      buildShapes()
    }, 250)
  }
  addEventListener('resize', onResize)
  // Nach vollständigem Laden (Fonts/Bilder) Dokumenthöhe + Stationen nachmessen
  addEventListener('load', onResize)

  start()
  window.__particles = { mode: 'webgl', count, concept: 'reactor' }

  loadLogoImageData(logoUrl)
    .then((d) => {
      logoData = d
      shapes[LOGO_SLOT] = buildLogoShape()
      if (currentShape === LOGO_SLOT) {
        aShapeAttr.array.set(shapes[LOGO_SLOT])
        aShapeAttr.needsUpdate = true
      }
    })
    .catch(() => {
      // Logo nicht ladbar → Slot bleibt bei Nullen (Finale sammelt im Zentrum)
    })

  return {
    mode: 'webgl',
    count,
    remeasure() {
      measureDoc()
    },
    destroy() {
      clearTimeout(resizeTimer)
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
