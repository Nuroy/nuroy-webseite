/**
 * Ruhiger Partikel-Strom entlang eines weichen Pfads (Catmull-Rom als
 * DataTexture). Wird als Hintergrund der Projekt-Detailseiten benutzt
 * (initDetailStream: sanfte S-Kurve hinter dem Inhalt, keine Tiefe).
 * Auf den Detailseiten steht das Feld FEST IM VIEWPORT (Max' Vorgabe):
 * der Scroll fließt gar nicht ein, nur der Content bewegt sich davor —
 * kein Fluss, nur Wobble/Twinkle halten das Feld lebendig.
 *
 * Fallback wie beim Reaktor: kein WebGL2 / reduced motion / ?particles=off
 * → Klasse "particles-fallback" + "stream-arrived" (Inhalt sofort sichtbar).
 */
import * as THREE from 'three'
import { starField, randomAttrs, gaussian } from './shapes.mjs'
import { buildPath, DEPTH_BACK, DEPTH_FRONT, DEPTH_MIN_Z, DEPTH_MAX_Z } from './pfad.mjs'

const TAU = Math.PI * 2
const PATH_N = 512 // Stützstellen der Pfad-Textur
// Feste Dokument-Spanne (in Viewport-Höhen) für dokument-verankerte Sterne
// (starsDoc-Modus). Bewusst nicht an die echte Seitenhöhe gekoppelt: Lazy-
// Bilder verlängern die Seite nach und nach, Neuspannen würde sichtbar springen.
const DOC_SPAN_VH = 24

// dt-normierte Easing-Raten (wie reactor.mjs: Faktor = 1 − exp(−K·dt))
const K_SCROLL = 7.67

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
attribute vec4 aSeed; // [Größe, Wobble-Phase, colorMix, Ankunfts-Stagger] in [0,1]
attribute float aT;   // Position entlang des Pfads (0 = oben/jetzt)
attribute vec2 aOff;  // [Quer-Offset (gauß, ±~3), z-Rohr-Offset px]

uniform float uTime;
uniform float uScroll;      // geglätteter Scroll (px)
uniform float uCameraD;
uniform float uPixelRatio;
uniform vec2 uVp;           // Viewport (w, h) px
uniform sampler2D uPathTex; // Pfad: [x, y, tangX, tangY] pro Texel (Dokument-Raum)
uniform float uPathN;
uniform float uFlow;        // Fluss-Geschwindigkeit in t/s (negativ = zum Jetzt)
uniform float uStreamW;     // halbe Strom-Breite in px
uniform float uDepthOn;     // 1 = Zeitreise-Tiefe, 0 = flach (Detailseiten)
uniform float uCalm;        // 1 = Feld steht: keine Puls-Wellen, konstante Breite
uniform float uBright;      // globaler Helligkeits-Faktor
uniform float uSizeMul;     // Punktgrößen-Faktor (Detailseiten: größer, damit der Blur sie nicht schluckt)
uniform float uFocusDoc;    // Dokument-y des fokussierten Projekts
uniform float uFocusAmt;    // 0..1 Aufflammen

varying float vAlpha;
varying float vColorMix;
varying float vHot;

${NOISE_GLSL}

void main() {
  // --- Position auf dem Pfad: fract-Wrap → endloser Strom
  float t = fract(aT + uTime * uFlow);
  float f = t * (uPathN - 1.0);
  int i0 = int(floor(f));
  int i1 = int(min(float(i0 + 1), uPathN - 1.0));
  float fr = f - floor(f);
  vec4 s0 = texelFetch(uPathTex, ivec2(i0, 0), 0);
  vec4 s1 = texelFetch(uPathTex, ivec2(i1, 0), 0);
  vec2 P = mix(s0.xy, s1.xy, fr);
  vec2 T = normalize(mix(s0.zw, s1.zw, fr));
  vec2 Nv = vec2(-T.y, T.x);

  // Querschnitt: gaußsches Rohr, atmet leicht entlang des Pfads (ruhend: konstant)
  float w = uStreamW * mix(0.8 + 0.2 * sin(t * 31.0 + uTime * 0.5), 1.0, uCalm);
  vec2 xy = P + Nv * (aOff.x * w);

  // --- Zeitreise-Tiefe relativ zur Viewport-Mitte (Konstanten == pfad.mjs)
  float centerDoc = uScroll + uVp.y * 0.5;
  float dy = xy.y - centerDoc;
  float zBack = -dy * ${DEPTH_BACK.toFixed(4)};
  float zFront = -dy * ${DEPTH_FRONT.toFixed(4)};
  float z = mix(zFront, zBack, smoothstep(-0.2 * uVp.y, 0.2 * uVp.y, dy));
  z = clamp(z, ${DEPTH_MIN_Z.toFixed(1)}, ${DEPTH_MAX_Z.toFixed(1)}) * uDepthOn + aOff.y;

  vec3 world = vec3(xy.x - uVp.x * 0.5, centerDoc - xy.y, z);
  // Ohne Tiefe-Modus: y so vorskalieren, dass die PROJEKTION exakt auf der
  // Dokument-Position landet — sonst driften Partikel mit z≠0 beim Scrollen
  // perspektivisch gegen den Inhalt (bis ±14%), das Feld "schwimmt" mit
  world.y *= mix((uCameraD - world.z) / uCameraD, 1.0, uDepthOn);

  // mildes organisches Wabern (staubiger Look wie beim Reaktor)
  world.x += snoise(vec2(world.y * 0.004 + aSeed.y * 7.0, uTime * 0.08)) * 5.0;
  world.y += snoise(vec2(world.x * 0.004 + 23.0, uTime * 0.1 + aSeed.y * 5.0)) * 5.0;
  world.z += snoise(vec2(aSeed.y * 17.0, uTime * 0.06)) * 5.0 * uDepthOn;

  // --- Aufflammen am fokussierten Projekt (lokal, gaußsches Fenster)
  float fd = xy.y - uFocusDoc;
  float sig = uVp.y * 0.16;
  float hot = uFocusAmt * exp(-fd * fd / (2.0 * sig * sig)) * (0.35 + 0.65 * aSeed.x);
  // Energie-Pakete, die den Strom entlangwandern — im ruhenden Feld aus
  hot += (1.0 - uCalm) * 0.2 * pow(max(0.0, sin(t * 40.0 + uTime * 0.9)), 24.0);

  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;

  vHot = hot;
  vColorMix = aSeed.z;

  float size = (0.9 + aSeed.x * 2.4) * uSizeMul * (1.0 + min(hot, 1.5) * 0.6);
  gl_PointSize = min(size * uPixelRatio * (uCameraD / -mv.z), 110.0);

  vAlpha = (0.3 + 0.7 * aSeed.x) * uBright;
  // Strom-Enden weich ausblenden (Einlauf oben, Auslauf in die Ferne)
  vAlpha *= smoothstep(0.0, 0.05, t) * smoothstep(1.0, 0.94, t);
  // Tiefen-Dämpfung: die Vergangenheit verliert sich im Dunkel
  vAlpha *= exp(min(world.z, 0.0) * 0.0007);
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
  col = mix(col, uColorHot, clamp(vHot, 0.0, 0.85));
  float a = disc * vAlpha * (0.55 + min(vHot, 1.5) * 0.6);
  if (a < 0.003) discard;
  gl_FragColor = vec4(col, a);
}
`

const STAR_VERT = /* glsl */ `
attribute float aTwinkle;
uniform float uTime;
uniform float uScroll;
uniform float uCameraD;
uniform float uPixelRatio;
uniform float uStarPar; // 0.03 = fast viewport-fest (Parallaxe), 1 = steht in der Seite
varying float vA;
void main() {
  vec3 pos = position;
  // (uCameraD − z)/uCameraD: gleicht die Perspektive aus, damit die Sterne
  // beim Scrollen exakt mit dem Inhalt wandern statt leicht nachzuziehen
  pos.y += uScroll * uStarPar * (uCameraD - pos.z) / uCameraD;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.0 + aTwinkle * 1.5) * uPixelRatio * (uCameraD / -mv.z);
  vA = 0.25 + 0.75 * abs(sin(uTime * (0.3 + aTwinkle) + aTwinkle * 20.0));
}
`

const STAR_FRAG = /* glsl */ `
uniform float uStarA;
varying float vA;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = smoothstep(0.5, 0.1, length(uv));
  gl_FragColor = vec4(vec3(0.85, 0.87, 1.0), d * vA * uStarA);
}
`

// Nebel-Ebene: wenige große, sehr transparente Glow-Wolken entlang des Pfads.
// Kleine Punkte verschwinden unter backdrop-filter: blur — diese Wolken sind
// größer als der Blur-Kernel und bleiben als milchiges Licht sichtbar.
const GLOW_VERT = /* glsl */ `
attribute vec3 aG; // [t entlang des Pfads, Quer-Offset (gauß), Seed 0..1]
uniform sampler2D uPathTex;
uniform float uPathN;
uniform float uTime;
uniform float uScroll;
uniform float uCameraD;
uniform float uPixelRatio;
uniform vec2 uVp;
uniform float uStreamW;
uniform float uBright;
varying float vA;
varying float vMix;
void main() {
  float f = aG.x * (uPathN - 1.0);
  int i0 = int(floor(f));
  int i1 = int(min(float(i0 + 1), uPathN - 1.0));
  float fr = f - floor(f);
  vec4 s0 = texelFetch(uPathTex, ivec2(i0, 0), 0);
  vec4 s1 = texelFetch(uPathTex, ivec2(i1, 0), 0);
  vec2 P = mix(s0.xy, s1.xy, fr);
  vec2 T = normalize(mix(s0.zw, s1.zw, fr));
  vec2 Nv = vec2(-T.y, T.x);
  vec2 xy = P + Nv * (aG.y * uStreamW * 2.2);
  float centerDoc = uScroll + uVp.y * 0.5;
  vec3 world = vec3(xy.x - uVp.x * 0.5, centerDoc - xy.y, -40.0);
  world.y *= (uCameraD - world.z) / uCameraD; // Perspektiv-Ausgleich: klebt an der Seite
  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min((80.0 + aG.z * 110.0) * uPixelRatio * (uCameraD / -mv.z), 380.0);
  // ganz langsames Atmen, damit die Wolken nicht tot wirken
  vA = (0.5 + 0.5 * aG.z) * (0.8 + 0.2 * sin(uTime * 0.25 + aG.z * 12.0)) * uBright;
  vA *= smoothstep(0.0, 0.05, aG.x) * smoothstep(1.0, 0.94, aG.x);
  vMix = fract(aG.z * 7.31);
}
`

const GLOW_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vA;
varying float vMix;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = smoothstep(0.5, 0.0, length(uv));
  d = d * d;
  vec3 col = mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(col, d * vA * 0.075);
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

function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x))
}

/**
 * Kern-Engine: Sternenfeld + Pfad-Strom + Strahl-Ankunft. getAnchors()
 * liefert die Anker in Dokument-Koordinaten (Init und Resize).
 * onFrame(ctx) läuft pro Frame nach dem Uniform-Update (Fokus/Karten-Sync
 * der Zeitstrahl-Seite hängt sich hier ein).
 */
export function initStream(opts = {}) {
  const {
    mount,
    getAnchors,
    onFrame = null,
    depth = true,
    flowSpeed = 90, // px/s entlang des Pfads Richtung Jetzt (0 = Feld steht)
    streamWidth = null, // halbe Breite px (Default: min(vw,vh)·0.045)
    calm = false, // true: keine Puls-Wellen/Atmung — Feld ruht
    brightness = 1, // Alpha-Faktor für die Strom-Partikel
    sizeMul = 1, // Punktgrößen-Faktor
    widthFactor = 0.045, // halbe Strom-Breite als Anteil von min(vw, vh)
    scrollLag = true, // false: uScroll folgt scrollY sofort (Feld klebt an der Seite)
    scrollFollow = true, // false: Scroll fließt GAR NICHT ein — Feld steht fest im Viewport
    starsDoc = false, // true: Sterne über die ganze Dokumenthöhe, scrollen 1:1 mit
    starAlpha = null, // Stern-Helligkeit (Default je nach Modus)
    colorA = '#FF2D7A',
    colorB = '#8B5CF6',
    colorHot = '#FFF0F6',
    desktopCount = 16000,
    mobileCount = 7000,
    starCount = 350,
    glowCount = 0, // Nebel-Wolken entlang des Pfads (0 = aus)
  } = opts

  const host = mount || document.getElementById('particles-bg')
  if (!host) throw new Error('initStream: mount-Element fehlt')

  const forceOff = new URLSearchParams(location.search).get('particles') === 'off'
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  function fallback(reason) {
    document.documentElement.classList.add('particles-fallback', 'stream-arrived')
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
  const camera = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 1, 6000)
  let cameraD = innerHeight / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2))
  camera.position.z = cameraD

  // --- Pfad-Textur (RGBA32F: x, y, tangX, tangY — Dokument-Raum)
  const pathData = new Float32Array(PATH_N * 4)
  const pathTex = new THREE.DataTexture(pathData, PATH_N, 1, THREE.RGBAFormat, THREE.FloatType)
  pathTex.minFilter = THREE.NearestFilter
  pathTex.magFilter = THREE.NearestFilter
  pathTex.needsUpdate = true

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: scrollFollow ? scrollY : 0 },
    uCameraD: { value: cameraD },
    uPixelRatio: { value: dpr },
    uVp: { value: new THREE.Vector2(innerWidth, innerHeight) },
    uPathTex: { value: pathTex },
    uPathN: { value: PATH_N },
    uFlow: { value: 0 },
    uStreamW: { value: streamWidth || Math.min(innerWidth, innerHeight) * widthFactor },
    uDepthOn: { value: depth ? 1 : 0 },
    uCalm: { value: calm ? 1 : 0 },
    uBright: { value: brightness },
    uSizeMul: { value: sizeMul },
    uFocusDoc: { value: -1e6 },
    uFocusAmt: { value: 0 },
    uColorA: { value: new THREE.Color(colorA).convertLinearToSRGB() },
    uColorB: { value: new THREE.Color(colorB).convertLinearToSRGB() },
    uColorHot: { value: new THREE.Color(colorHot).convertLinearToSRGB() },
  }

  function rebuildPath() {
    const anchors = getAnchors()
    const { pts, length } = buildPath(anchors, { samples: PATH_N })
    pathData.set(pts)
    pathTex.needsUpdate = true
    // Fluss Richtung Jetzt (t=0 liegt oben) → negativ, in t/s
    uniforms.uFlow.value = -flowSpeed / Math.max(length, 1)
  }
  rebuildPath()

  // --- Partikel: gleichverteilt entlang t, gaußscher Querschnitt
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)) // Dummy
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(randomAttrs(count), 4))
  const tArr = new Float32Array(count)
  const offArr = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    tArr[i] = (i + Math.random()) / count
    offArr[i * 2] = gaussian() * (Math.random() < 0.12 ? 2.6 : 1) // ~12% Staub-Ausreißer
    offArr[i * 2 + 1] = gaussian() * 40 // z-Rohr
  }
  geometry.setAttribute('aT', new THREE.BufferAttribute(tArr, 1))
  geometry.setAttribute('aOff', new THREE.BufferAttribute(offArr, 2))

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

  // --- Sterne. starsDoc: fest in der Seite — einmalig über die feste Spanne
  // verteilt und flach bei z≈0, damit sie exakt mit dem Inhalt scrollen.
  // Kein Neuverteilen (das würde sichtbar springen).
  const starN = starsDoc ? Math.min(Math.round((starCount * DOC_SPAN_VH) / 1.4), 9000) : starCount
  const starGeo = new THREE.BufferGeometry()
  {
    const arr = new Float32Array(starN * 3)
    if (starsDoc) {
      for (let i = 0; i < starN; i++) {
        arr[i * 3 + 0] = (Math.random() - 0.5) * innerWidth * 1.4
        arr[i * 3 + 1] = innerHeight * 0.7 - Math.random() * (DOC_SPAN_VH * innerHeight) // Welt-y = vh/2 − Dokument-y
        arr[i * 3 + 2] = -Math.random() * 60
      }
    } else {
      arr.set(starField(starN, { width: innerWidth, height: innerHeight }))
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  }
  const twinkle = new Float32Array(starN)
  for (let i = 0; i < starN; i++) twinkle[i] = Math.random()
  starGeo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkle, 1))
  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
      uScroll: uniforms.uScroll,
      uCameraD: uniforms.uCameraD,
      uPixelRatio: uniforms.uPixelRatio,
      uStarPar: { value: starsDoc ? 1 : 0.03 },
      uStarA: { value: starAlpha ?? (starsDoc ? 0.7 : 0.5) },
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

  // --- Nebel-Wolken (teilen sich Pfad-Textur und Uniforms mit dem Strom)
  let glowGeo = null
  let glowMat = null
  if (glowCount > 0) {
    const gN = isMobile ? Math.round(glowCount * 0.5) : glowCount
    glowGeo = new THREE.BufferGeometry()
    glowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gN * 3), 3)) // Dummy
    const gArr = new Float32Array(gN * 3)
    for (let i = 0; i < gN; i++) {
      gArr[i * 3 + 0] = (i + Math.random()) / gN
      gArr[i * 3 + 1] = gaussian()
      gArr[i * 3 + 2] = Math.random()
    }
    glowGeo.setAttribute('aG', new THREE.BufferAttribute(gArr, 3))
    glowMat = new THREE.ShaderMaterial({
      uniforms: {
        uPathTex: uniforms.uPathTex,
        uPathN: uniforms.uPathN,
        uTime: uniforms.uTime,
        uScroll: uniforms.uScroll,
        uCameraD: uniforms.uCameraD,
        uPixelRatio: uniforms.uPixelRatio,
        uVp: uniforms.uVp,
        uStreamW: uniforms.uStreamW,
        uBright: uniforms.uBright,
        uColorA: uniforms.uColorA,
        uColorB: uniforms.uColorB,
      },
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    const glow = new THREE.Points(glowGeo, glowMat)
    glow.frustumCulled = false
    scene.add(glow)
  }

  // Inhalt sofort einblenden lassen (CSS-Transition macht den weichen Rest)
  document.documentElement.classList.add('stream-arrived')

  let scrollSmooth = scrollY

  function update(t, dt) {
    const ease = (k) => 1 - Math.exp(-k * dt)
    scrollSmooth += (scrollY - scrollSmooth) * (scrollLag ? ease(K_SCROLL) : 1)
    // scrollFollow aus: der Scroll fließt nicht ein — der Hintergrund steht
    // fest im Viewport, nur der Content davor bewegt sich (Max' Vorgabe)
    uniforms.uScroll.value = scrollFollow ? scrollSmooth : 0
    if (onFrame) {
      onFrame({
        dt,
        ease,
        uniforms,
        scrollSmooth,
        centerDoc: scrollSmooth + innerHeight / 2,
        cameraD,
        vw: innerWidth,
        vh: innerHeight,
      })
    }
  }

  const clock = new THREE.Clock()
  let raf = null
  let tAcc = 0
  function tick() {
    raf = requestAnimationFrame(tick)
    const dt = clamp(clock.getDelta(), 0.001, 0.1)
    tAcc += dt
    uniforms.uTime.value = tAcc
    update(tAcc, dt)
    renderer.render(scene, camera)
  }
  function start() {
    if (raf !== null) return
    clock.getDelta()
    tick()
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
  const resizeHooks = []
  function onResize() {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      camera.aspect = innerWidth / innerHeight
      cameraD = innerHeight / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2))
      camera.position.z = cameraD
      camera.updateProjectionMatrix()
      renderer.setSize(innerWidth, innerHeight)
      uniforms.uCameraD.value = cameraD
      uniforms.uVp.value.set(innerWidth, innerHeight)
      if (!streamWidth) uniforms.uStreamW.value = Math.min(innerWidth, innerHeight) * widthFactor
      for (const fn of resizeHooks) fn()
      rebuildPath()
    }, 250)
  }
  addEventListener('resize', onResize)
  addEventListener('load', onResize)

  start()
  window.__particles = { mode: 'webgl', count, concept: 'timeline' }

  return {
    mode: 'webgl',
    count,
    onResizeHook(fn) {
      resizeHooks.push(fn)
    },
    remeasure() {
      for (const fn of resizeHooks) fn()
      rebuildPath()
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
      if (glowGeo) glowGeo.dispose()
      if (glowMat) glowMat.dispose()
      pathTex.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

/**
 * Detailseiten-Hintergrund: FEST IM VIEWPORT stehendes Feld (Max' Vorgabe:
 * „beim Scrollen bleibt der Hintergrund stehen, nur der Content vorne
 * bewegt sich"). Der Scroll fließt nicht ins Feld ein — eine ruhende
 * S-Kurve über den Bildschirm mit Staub, Sternen und Nebel-Wolken; nur
 * Wobble/Twinkle halten es lebendig. Hell und dicht genug, dass hinter
 * der Milchglas-Ebene das verschwommene Licht sichtbar bleibt.
 */
export function initDetailStream(opts = {}) {
  return initStream({
    flowSpeed: 0,
    desktopCount: 6500,
    mobileCount: 3000,
    calm: true,
    brightness: 1.8,
    sizeMul: 1.6,
    widthFactor: 0.07,
    scrollLag: false,
    scrollFollow: false,
    starCount: 550,
    starAlpha: 0.65,
    glowCount: 90,
    ...opts,
    depth: false,
    getAnchors: () => {
      const vw = innerWidth
      const vh = innerHeight
      // ruhige Serpentine einmal über den Bildschirm (Enden außerhalb)
      return [
        { x: vw * 0.85, y: -0.35 * vh },
        { x: vw * 0.3, y: 0.18 * vh },
        { x: vw * 0.72, y: 0.55 * vh },
        { x: vw * 0.22, y: 0.9 * vh },
        { x: vw * 0.6, y: 1.35 * vh },
      ]
    },
  })
}
