/**
 * Nuroy Partikel-Straße — die Zeitachse als Fahrt. Unten im Viewport liegt
 * eine perspektivische Straße aus Partikeln, die sich in die Tiefe
 * schlängelt (Vorbild: Meilenstein-Infografik). Auf der Straße sitzen
 * glühende Meilenstein-Knoten — einer pro Projekt, das NEUESTE direkt
 * vor der Kamera, die älteren dahinter Richtung Horizont. Die Sichtweite
 * (visWindow) ist so bemessen, dass ALLE Meilensteine gleichzeitig auf
 * der Straße stehen (Panorama wie im Template).
 *
 * Scroll = Fahrt AUF der Straße: die Kamera folgt der Fahrbahn
 * (Rennspiel-Perspektive, siehe pfad.mjs) — vor der Kamera liegt die
 * Straße immer mittig, Kurven krümmen sich vor einem weg. Der Meilenstein
 * an der Fokus-Station lässt die Straße lokal aufglühen. Pro Frame werden
 * die Bildschirm-Positionen ALLER Meilensteine mit derselben Formel
 * (roadToScreen) projiziert und an onFrame gemeldet — die Seite verankert
 * daran ihre Karten/Linien/Pins.
 *
 * Kein Auftritts-Effekt: Die Seite wird per View-Transition-Crossfade
 * betreten, die Straße fließt beim ersten Frame einfach schon.
 *
 * initStrasse({ mount, milestones: n, onFrame }) →
 *   { mode, count, setTravelTarget(seg), destroy }
 * onFrame({ travel, focus: {index, amt}, milestones: [{index, x, y, d, f}] })
 * läuft pro Frame (Screen-Pixel; f = Perspektiv-Faktor der Tiefe).
 *
 * Fallback wie immer: kein WebGL2 / reduced motion / ?particles=off →
 * Klasse "particles-fallback" (Seite zeigt dann die statische Liste).
 */
import * as THREE from 'three'
import { starField, randomAttrs, gaussian } from './shapes.mjs'
import { ROAD, visWindow, roadToScreen, roadFocus } from './pfad.mjs'

const TAU = Math.PI * 2
const MAX_MS = 12 // GLSL-Array-Größe (uniform float[12]) — max. Meilensteine

// dt-normierte Easing-Raten (Faktor = 1 − exp(−K·dt), wie reactor.mjs)
const K_TRAVEL = 5.0 // Fahrt folgt dem Scroll weich
const K_GLOW = 6.0

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

// Straßen-Geometrie im Shader — MUSS pfad.mjs (ROAD/roadPoint) entsprechen
const ROAD_GLSL = /* glsl */ `
uniform float uWindow; // Sichtweite in Segmenten (visWindow(n))
const float R_ZFRONT = ${ROAD.zFront.toFixed(1)};
const float R_ZBACK = ${ROAD.zBack.toFixed(1)};
const float R_ZPASS = ${ROAD.zPass.toFixed(1)};
const float R_AMPX = ${ROAD.ampX.toFixed(3)};
const float R_FREQ = ${ROAD.freq.toFixed(3)};
const float R_PHASE = ${ROAD.phase.toFixed(3)};
const float R_GROUNDY = ${ROAD.groundY.toFixed(3)};
const float R_HILLA = ${ROAD.hillAmp.toFixed(4)};
const float R_HILLF = ${ROAD.hillFreq.toFixed(3)};
const float R_OFFX = ${ROAD.offsetX.toFixed(3)};

float roadX(float s, vec2 vp) { return sin((s + R_PHASE) * R_FREQ) * vp.x * R_AMPX; }
float roadHill(float s, vec2 vp) { return sin(s * R_HILLF) * vp.y * R_HILLA; }

// Mittellinie an Station s, KAMERA-relativ: Position + Blickrichtung der
// Kamera-Station abgezogen — man fährt auf der Fahrbahn, Kurven krümmen
// sich vor einem weg (Rennspiel-Perspektive). d = normierte Tiefe; Tiefe
// linear und vor der Kamera weiterlaufend (sichtbares Vorbeifliegen).
vec3 roadCenter(float s, float travel, vec2 vp, out float d) {
  float u = s - travel;
  d = u / uWindow;
  float z = clamp(R_ZFRONT + (R_ZBACK - R_ZFRONT) * d, R_ZBACK, R_ZPASS);
  float dx = R_FREQ * cos((travel + R_PHASE) * R_FREQ) * vp.x * R_AMPX;
  float x = roadX(s, vp) - roadX(travel, vp) - dx * u + vp.x * R_OFFX;
  float y = vp.y * R_GROUNDY + roadHill(s, vp) - roadHill(travel, vp);
  return vec3(x, y, z);
}
`

const VERT = /* glsl */ `
attribute vec4 aSeed;  // [Größe, Streu-y, colorMix, Phase] in [0,1]
attribute float aS;    // Band: absolute Station auf der Straße | Meilenstein: ungenutzt
attribute float aCross;// Quer-Offset in Straßenbreiten (Mitte/Kanten/Streuner)
attribute float aRole; // 0 = Straßenband, 1 = Meilenstein-Knoten
attribute float aMs;   // Meilenstein-Index (nur role 1)

uniform float uTime;
uniform float uTravel;    // Fahrt-Position in Segmenten (geglättet)
uniform float uCameraD;
uniform float uPixelRatio;
uniform vec2 uVp;
uniform float uWidth;     // Straßenbreiten-Einheit in px (σ der Mitte ≈ 0.55·uWidth)
uniform float uMsS[${MAX_MS}];    // Stationen der Meilensteine
uniform float uMsGlow[${MAX_MS}]; // Glüh-Anteil pro Meilenstein (0..1)
uniform float uFocusS;    // Station des fokussierten Meilensteins
uniform float uFocusAmt;  // 0..1 — Straße glüht lokal unter dem Fokus

varying float vAlpha;
varying float vColorMix;
varying float vHot;

${NOISE_GLSL}
${ROAD_GLSL}

void main() {
  int role = int(aRole + 0.5);
  float s;
  float d;
  vec3 world;
  float hot = 0.0;

  if (role == 0) {
    // --- Straßenband: RAUMFEST — jedes Partikel sitzt an seiner absoluten
    // Station auf der Straße. Beim Fahren kommen die hinteren aus der
    // Ferne heran, werden größer und schneller und fliegen vorne unten
    // sichtbar aus dem Bild (echter Motion-Parallax: man bewegt sich).
    s = aS;
    world = roadCenter(s, uTravel, uVp, d);
    // Querschnitt: dichte Mitte + markierte Kanten (aCross trägt die Spur)
    world.x += aCross * uWidth;
    world.y += abs(aCross) * uWidth * 0.04 + (aSeed.y - 0.5) * 10.0;
    world.z += (aSeed.z - 0.5) * 30.0;
  } else {
    // --- Meilenstein: kleiner glühender Hügel auf der Straße
    float msS = 0.0;
    for (int i = 0; i < ${MAX_MS}; i++) {
      if (i == int(aMs + 0.5)) { msS = uMsS[i]; break; }
    }
    s = msS;
    world = roadCenter(s, uTravel, uVp, d);
    // kompakter Pin-Punkt, leicht über der Fahrbahn
    world.x += aCross * uWidth * 0.3;
    world.y += abs(aSeed.y) * uVp.y * 0.018 + 2.0;
    world.z += (aSeed.z - 0.5) * uWidth * 0.5;
    float g = 0.0;
    for (int i = 0; i < ${MAX_MS}; i++) {
      if (i == int(aMs + 0.5)) { g = uMsGlow[i]; break; }
    }
    hot += 0.2 + g * (0.25 + 0.35 * aSeed.x);
  }

  // Straße glüht lokal unter dem fokussierten Meilenstein dezent auf
  float fd = s - uFocusS;
  hot += uFocusAmt * exp(-fd * fd / 0.018) * (0.15 + 0.25 * aSeed.x);
  // Licht-Pulse, die der Kamera entgegenlaufen — die Straße lebt auch im
  // Stand, und die Fließrichtung stützt das Fahrgefühl
  hot += 0.14 * pow(max(0.0, sin(s * 2.6 + uTime * 1.1)), 12.0);

  // organisches Wabern: das Band lebt spürbar (aber dezent), die
  // Meilenstein-Knoten bleiben ruhiger (DOM-Linie/Punkt hängen an ihnen)
  float wob = role == 0 ? 1.0 : 0.4;
  world.x += snoise(vec2(aSeed.y * 7.0 + s, uTime * 0.18)) * 6.5 * wob;
  world.y += snoise(vec2(aSeed.z * 9.0 + 23.0, uTime * 0.22)) * 5.5 * wob;
  world.z += snoise(vec2(aSeed.x * 11.0 + 47.0, uTime * 0.15)) * 4.0 * wob;

  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;

  vHot = hot;
  vColorMix = aSeed.z;

  // vorne fetter: nahe Straße liest sich als Band, nicht als Nebel
  float front = 1.0 - smoothstep(0.0, 0.4, d);
  float size = (0.9 + aSeed.x * 2.4) * (1.0 + min(hot, 1.5) * 0.6);
  size *= 1.0 + front * 0.8;
  if (role == 1) size *= 1.15;
  gl_PointSize = min(size * uPixelRatio * (uCameraD / -mv.z), 110.0);

  vAlpha = (0.35 + 0.65 * aSeed.x) * (1.0 + front * 0.35);
  // vorn: erst NACH dem Vorbeiflug ausblenden (Partikel verlassen das Bild
  // sichtbar nach unten); Horizont erst ganz am Ende verblassen (Panorama)
  vAlpha *= smoothstep(-0.1, -0.03, d) * (1.0 - smoothstep(0.9, 1.0, d));
  vAlpha *= exp(min(world.z, 0.0) * 0.00025);
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
uniform float uCameraD;
uniform float uPixelRatio;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
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

function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x))
}

export function initStrasse(opts = {}) {
  const {
    mount,
    milestones = 0, // Anzahl Meilensteine; Station i = i · 1.0 Segmente
    onFrame = null, // ({ travel, focus, milestones: [{index,x,y,d,f}] }) pro Frame
    colorA = '#FF2D7A',
    colorB = '#8B5CF6',
    colorHot = '#FFF0F6',
    // raumfeste Verteilung: nur das Sichtfenster ist gleichzeitig zu sehen,
    // deshalb mehr Partikel als bei den anderen Systemen
    desktopCount = 26000,
    mobileCount = 11000,
    starCount = 350,
  } = opts

  if (milestones > MAX_MS) throw new Error(`initStrasse: max. ${MAX_MS} Meilensteine`)

  const host = mount || document.getElementById('particles-bg')
  if (!host) throw new Error('initStrasse: mount-Element fehlt')

  const forceOff = new URLSearchParams(location.search).get('particles') === 'off'
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  function fallback(reason) {
    document.documentElement.classList.add('particles-fallback')
    window.__particles = { mode: 'fallback', reason, count: 0 }
    return { mode: 'fallback', count: 0, setTravelTarget() {}, destroy() {} }
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

  const msS = new Float32Array(MAX_MS)
  for (let i = 0; i < milestones; i++) msS[i] = i

  // Panorama-Sichtweite: alle Meilensteine passen gleichzeitig auf die Straße
  const win = visWindow(milestones)
  // Gesamtlänge der Straße: ganze Fahrt (Meilensteine + Outro-Auslauf) plus
  // volle Sichtweite dahinter — am Fahrt-Ende endet die Straße nie im Bild
  const sTotal = Math.max(milestones - 1, 0) + 2 + win

  const uniforms = {
    uTime: { value: 0 },
    uTravel: { value: -ROAD.focus }, // Start: Meilenstein 0 parkt an der Fokus-Station
    uCameraD: { value: cameraD },
    uPixelRatio: { value: dpr },
    uVp: { value: new THREE.Vector2(innerWidth, innerHeight) },
    uWidth: { value: Math.min(innerWidth, innerHeight) * (isMobile ? 0.075 : 0.055) },
    uWindow: { value: win },
    uMsS: { value: msS },
    uMsGlow: { value: new Float32Array(MAX_MS) },
    uFocusS: { value: 0 },
    uFocusAmt: { value: 0 },
    uColorA: { value: new THREE.Color(colorA).convertLinearToSRGB() },
    uColorB: { value: new THREE.Color(colorB).convertLinearToSRGB() },
    uColorHot: { value: new THREE.Color(colorHot).convertLinearToSRGB() },
  }

  // --- Partikel-Budget: ~86% Straßenband, Rest gleichmäßig auf die Knoten
  const nMs = milestones ? Math.round((count * 0.14) / milestones) : 0
  const nRoad = count - nMs * milestones

  const sArr = new Float32Array(count)
  const crossArr = new Float32Array(count)
  const roleArr = new Float32Array(count)
  const msArr = new Float32Array(count)
  let p = 0
  for (let i = 0; i < nRoad; i++, p++) {
    roleArr[p] = 0
    sArr[p] = -0.6 + Math.random() * (sTotal + 0.6) // absolute Station (raumfest, etwas Vorlauf)
    // Spur-Aufbau wie eine echte Straße: dichte Mitte, markierte Kanten,
    // ein paar Streuner im Bankett
    const r = Math.random()
    if (r < 0.62) crossArr[p] = gaussian() * 0.55 // Fahrbahn
    else if (r < 0.92) crossArr[p] = (Math.random() < 0.5 ? -1 : 1) * (1.5 + gaussian() * 0.12) // Kanten
    else crossArr[p] = gaussian() * 2.6 // Bankett-Staub
  }
  for (let m = 0; m < milestones; m++) {
    for (let i = 0; i < nMs; i++, p++) {
      roleArr[p] = 1
      msArr[p] = m
      sArr[p] = m
      crossArr[p] = gaussian() * 0.8
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)) // Dummy
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(randomAttrs(count), 4))
  geometry.setAttribute('aS', new THREE.BufferAttribute(sArr, 1))
  geometry.setAttribute('aCross', new THREE.BufferAttribute(crossArr, 1))
  geometry.setAttribute('aRole', new THREE.BufferAttribute(roleArr, 1))
  geometry.setAttribute('aMs', new THREE.BufferAttribute(msArr, 1))

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

  // --- Sterne
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starField(starCount, { width: innerWidth, height: innerHeight }), 3))
  const twinkle = new Float32Array(starCount)
  for (let i = 0; i < starCount; i++) twinkle[i] = Math.random()
  starGeo.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkle, 1))
  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime,
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

  // --- Fahrt-Zustand: Ziel kommt von der Seite (Scroll), Fahrt folgt weich
  let travelTarget = 0
  let travel = 0
  const glow = new Float32Array(MAX_MS)

  function update(t, dt) {
    const ease = (k) => 1 - Math.exp(-k * dt)
    travel += (travelTarget - travel) * ease(K_TRAVEL)
    // Fahrt so verschieben, dass Meilenstein i bei travel=i an der
    // Fokus-Station (ROAD.focus Segmente vor der Kamera) parkt
    uniforms.uTravel.value = travel - ROAD.focus

    const { index, amt } = roadFocus(travel, milestones)
    uniforms.uFocusS.value = index
    uniforms.uFocusAmt.value += (amt - uniforms.uFocusAmt.value) * ease(K_GLOW)
    for (let i = 0; i < milestones; i++) {
      const target = i === index ? amt : 0
      glow[i] += (target - glow[i]) * ease(K_GLOW)
      uniforms.uMsGlow.value[i] = glow[i]
    }

    if (onFrame) {
      const t = uniforms.uTravel.value
      const ms = []
      for (let i = 0; i < milestones; i++) {
        const pt = roadToScreen(i, t, innerWidth, innerHeight, cameraD, win)
        ms.push({ index: i, x: pt.x, y: pt.y, d: pt.d, f: pt.f })
      }
      onFrame({
        travel,
        focus: { index, amt: uniforms.uFocusAmt.value },
        milestones: ms,
        // beliebige Station auf den Schirm projizieren (Zeitmarken etc.)
        project: (s) => roadToScreen(s, t, innerWidth, innerHeight, cameraD, win),
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
      uniforms.uWidth.value = Math.min(innerWidth, innerHeight) * (isMobile ? 0.075 : 0.055)
    }, 250)
  }
  addEventListener('resize', onResize)

  start()
  window.__particles = { mode: 'webgl', count, concept: 'strasse' }

  return {
    mode: 'webgl',
    count,
    /** Fahrt-Ziel in Segmenten (Meilenstein i = i.0); die Fahrt eased hin.
     *  instant = true springt ohne Anfahrt (Scroll-Restore beim Zurückkommen). */
    setTravelTarget(seg, instant = false) {
      travelTarget = seg
      if (instant) travel = seg
    },
    destroy() {
      clearTimeout(resizeTimer)
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      starGeo.dispose()
      starMat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
