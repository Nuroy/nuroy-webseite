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
