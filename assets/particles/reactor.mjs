/**
 * Nuroy „Ringreaktor" — Story-Fassung: Gyroskop-Maschine aus 5 ineinander
 * kippenden Ringen, glühendem Kern und Orbit-Staub im Hero. Beim ersten
 * Scroll kondensiert die Maschine an der ersten [data-station="logo"]-Sektion
 * zum Partikel-N; ab deren Mitte wird der Basis-Zustand unwiderruflich auf
 * einen organisch fließenden Partikel-Strom (flowWorld) umgeblendet.
 *
 * Strahl == Icon: Die Endpunkte jedes Fluss-Segments sind die Skulpturen
 * selbst (aShapeFrom/aShapeTo, SCULPTURES aus sculptures.mjs). Jedes
 * Partikel reist von seinem Punkt im alten Icon direkt zu seinem Punkt im
 * nächsten — das Icon schmilzt vorwärts in den Strahl, und der Strahl wird
 * am Ziel unmittelbar zum Icon; es gibt keinen separaten Kondensations-
 * Schritt mehr. Nur das Logo-N läuft weiter über das uSculptMix-System
 * (Maschine→N bzw. Strom→N am Seitenende); an Logo-Enden eines Segments
 * steht statt einer Form eine kleine Blob-Wolke.
 *
 * Nutzung:
 *   <div id="particles-bg" aria-hidden="true"></div>  (CSS: position:fixed; inset:0; z-index:-1; pointer-events:none)
 *   <section data-station="dashboards">…  (Namen: siehe SLOT_BY_NAME)
 *   initReactor({ mount: document.getElementById('particles-bg') })
 *
 * Fallback (kein WebGL2 / prefers-reduced-motion / ?particles=off):
 *   <html> bekommt die Klasse "particles-fallback", es wird nichts gerendert.
 */
import * as THREE from 'three'
import { starField, samplePointsFromAlpha, gaussian, randomAttrs } from './shapes.mjs'
import { SCULPTURES, brainShape } from './sculptures.mjs'

const TAU = Math.PI * 2

// Skulptur-Slots hinter den 7 Themen-Skulpturen: N-Logo und Gehirn.
// Alles ab LOGO_SLOT sind „Sculpt-Momente" (uSculptMix-System, zentriert,
// kondensieren aus dem Basis-Zustand) statt Fluss-Endpunkte.
const LOGO_SLOT = SCULPTURES.length
const BRAIN_SLOT = LOGO_SLOT + 1

/**
 * data-station-Namen → Skulptur-Slot. „logo" darf mehrfach vorkommen
 * (N-Sektion nach dem Hero + Schluss-Klammer vor dem CTA); „brain" ist
 * die Team-Sektion („Das Gehirn hinter Nuroy") in Akt 2.
 */
export const SLOT_BY_NAME = {
  dashboards: 0,
  'ki-agenten': 1,
  software: 2,
  'ki-integration': 3,
  'company-ai': 4,
  datenintegration: 5,
  strategy: 6,
  logo: LOGO_SLOT,
  brain: BRAIN_SLOT,
}

// Ring-Radius-Faktoren (außen → innen), relativ zu uMachineR
const RING_F = [1, 0.82, 0.66, 0.5, 0.36]

// Getriebe: Übersetzung pro Ring (Scroll-Antrieb) + Leerlauf-Drehung (Maschine lebt ohne Scroll)
const GEARS = [1.0, -1.6, 2.2, -0.7, 1.3]
const IDLE = [0.05, -0.07, 0.09, -0.04, 0.06]

// dt-normierte Easing-Raten (pro Sekunde) statt fixer per-Frame-Faktoren, damit
// 30/60/120 Hz identisch laufen: Faktor pro Frame = 1 - exp(-K·dt).
// K = -60·ln(1-f) erhält exakt das Verhalten der früheren 60fps-Faktoren f.
const K_SCROLL = 7.67 // f = 0.12 (Scroll-Glättung)
const K_HEAT = 5.0 // f = 0.08 (Kern-Hitze)
// Logo-N: 1-Pol-Tiefpass wie gehabt — reagiert ab dem ersten Scroll-Pixel
// (bewusst KEIN Ease-in, die N-Auflösung ist mühsam scroll-gebunden getunt)
const K_MIX_LOGO = 3.5

// Fluss-Segment: Halte-Plateau an geformten Endpunkten (Anteil des Segment-
// Fortschritts, in dem das Icon komplett steht — S klebt an 0 bzw. 1) und
// Rest-Plateau an Blob-Enden (Logo/Seitenrand: kein Icon zu halten).
const FLOW_HOLD = 0.22
const FLOW_HOLD_BLOB = 0.02
const K_FLARE_UP = 21.4 // f = 0.30 (Flare-Attack)
const K_FLARE_DOWN = 3.71 // f = 0.06 (Flare-Decay)
const K_PAN = 3.71 // f = 0.06 (Seiten-Schwenk / Skalierung)

// Scroll-Geschwindigkeit (px/s) für volle Kern-Hitze (früher 40 px/Frame @ 60fps)
const HEAT_SPEED = 2400

/**
 * Posen der 5 Ringe: tx/tz = Kipp-Winkel (rad) um X bzw. Z, rs = Radius-Skalierung.
 * Index 0 = Hero, 1-7 = Slots 0-6 (Reihenfolge wie SCULPTURES), 8 = Logo-Slot
 * (frontal genestete Ringe — die Maschine faltet sich flach, während das N
 * kondensiert; relevant nur an der ersten logo-Station, danach ist die
 * Maschine im Fluss-Bereich unsichtbar).
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
  // Logo-Slot: alle Ringe frontal, eng genestet
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
attribute vec3 aShape;  // Skulptur-Slot des uSculptMix-Systems (Logo-N)
attribute vec3 aShapeFrom; // Fluss: Form am Segment-Start (Icon oder Blob)
attribute vec3 aShapeTo;   // Fluss: Form am Segment-Ziel (Icon oder Blob)

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
uniform float uFlowZone;     // 0 = Maschine ist Basis, 1 = Fluss-Strom ist Basis
uniform float uFlowProgress; // Fortschritt des Stroms im aktuellen Segment (0..1)
uniform vec2 uFlowFromC;     // Zentrum der Start-Form in px (View-Raum)
uniform vec2 uFlowToC;       // Zentrum der Ziel-Form in px (View-Raum)
uniform float uFromSpin;     // Scroll-Rotation der Start-Form um Y
uniform float uToSpin;       // Scroll-Rotation der Ziel-Form um Y
uniform float uHoldFrom;     // Halte-Plateau am Segment-Start (Anteil 0..1)
uniform float uHoldTo;       // Halte-Plateau am Segment-Ziel (Anteil 0..1)
uniform float uViewportH;    // Viewport-Höhe in px (Amplituden des Stroms)
uniform float uViewportW;    // Viewport-Breite in px (Ozean-Feld)
uniform float uOceanZone;    // 0 = Strahl/Icons, 1 = Partikel-Meer (Akt 2)
uniform float uOceanAmp;     // Wellen-Amplitude (1 normal, → 0.25 ruhige See)
uniform float uWaterY;       // Wasserlinie in px (View-Raum, negativ = unten)

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

  // --- Fluss-Strom: die Pfad-Endpunkte sind die Formen selbst. Jedes
  // Partikel reist von seinem Punkt in aShapeFrom zu seinem Punkt in
  // aShapeTo — der Strahl wird am Ziel DIREKT zum Icon (kein separates
  // Ankommen + Verwandeln), und das alte Icon schmilzt vorwärts in den
  // Strahl. uHoldFrom/uHoldTo halten die Icons um die Stationsmitte komplett
  // geformt (S klebt an 0 bzw. 1); dadurch ist auch der Segment-Wechsel an
  // der Stationsmitte exakt stetig: S=1 auf Form k+1 == S=0 auf Form k+1
  // im Folgesegment (kein Teleport).
  float span = max(1.0 - uHoldFrom - uHoldTo, 0.001);
  float pe = clamp((uFlowProgress - uHoldFrom) / span, 0.0, 1.0);
  // Staffelung: Partikel starten nacheinander (Strahl-Länge), alle sind bei
  // pe=1 angekommen — das Icon baut sich aus dem Strahlkopf Stück für Stück
  // auf und löst sich beim Verlassen Partikel für Partikel ab
  float flowT = clamp(pe * 1.5 - aSeed.w * 0.5, 0.0, 1.0);
  // Zeit-Drift ENTLANG des Pfads (Strom fließt sichtbar); an den Enden
  // ausgeblendet, damit die stehenden Icons nicht wabern
  float drift = snoise(vec2(aSeed.w * 24.0, uTime * 0.35)) * 0.05 * sin(flowT * 3.14159);
  float s = smoothstep(0.0, 1.0, clamp(flowT + drift, 0.0, 1.0));
  vec3 fromPos = rotY(uFromSpin) * aShapeFrom + vec3(uFlowFromC, 0.0);
  vec3 toPos = rotY(uToSpin) * aShapeTo + vec3(uFlowToC, 0.0);
  // Mäander: geschwungener Fluss-Pfad statt gerader Linie. Die sin(s*PI)-
  // Hüllkurve lässt beide Enden exakt auf den Formen zusammenlaufen, die
  // Mitte schwingt weit aus — die Phase wandert mit der Zeit (lebendig).
  float env = sin(s * 3.14159);
  float meander = (sin(s * 3.6 + uFlowToC.x * 0.012 + uTime * 0.22)
                 + 0.35 * sin(s * 8.0 - uTime * 0.35)) * uViewportH * 0.055 * env;
  // Quer-Streuung: bewusst schmal — die Bahnen tragen ohnehin schon den
  // Querschnitt der Icons, mehr Streuung macht aus dem Strahl eine Wolke.
  // An den Enden liegt jedes Partikel exakt auf seinem Form-Punkt.
  float crossW = (aSeed.x - 0.5) * uViewportH * 0.06 * env;
  vec3 flowWorld = mix(fromPos, toPos, s);
  // Bündelung: in der Flugmitte zieht sich der Strahl auf ~40% des Icon-
  // Querschnitts zur Pfad-Linie zusammen und fächert an beiden Enden in die
  // Form auf — liest sich als gerichteter Strahl statt wandernder Wolke
  vec3 lineP = vec3(mix(uFlowFromC, uFlowToC, s), 0.0);
  flowWorld = mix(flowWorld, lineP, env * 0.6);
  flowWorld.x += snoise(vec2(aSeed.y * 40.0, uTime * 0.3)) * 20.0 * env;
  flowWorld.y += meander + crossW + snoise(vec2(aSeed.z * 40.0, uTime * 0.35 + 7.0)) * 16.0 * env;
  flowWorld.z += ((aSeed.z - 0.5) * 110.0 + snoise(vec2(aSeed.x * 30.0, uTime * 0.25)) * 18.0) * env;

  // --- Ozean (Akt 2): Partikel-Meer, Kamera knapp über dem Wasser. Tiefe
  // aus dem Seed, nah dichter besetzt (pow) — die Perspektive der Kamera
  // staucht die Ferne von selbst zum Horizont. Die Feld-Breite folgt dem
  // Frustum der jeweiligen Tiefe, damit jede Ebene den Schirm füllt.
  float dpt = pow(aSeed.y, 1.7);
  float zO = mix(500.0, -1400.0, dpt);
  float frw = (uCameraD - zO) / uCameraD;
  float xO = (fract(aSeed.x * 13.73 + aSeed.z * 7.19) - 0.5) * uViewportW * 1.2 * frw;
  // Wellen: zwei laufende Züge + Simplex-Ripple (ambient, zeitgetrieben);
  // uOceanAmp beruhigt die See vor dem Finale
  float wave = (sin(xO * 0.0045 + zO * 0.0035 + uTime * 0.9) * 14.0
              + sin(xO * 0.011 - zO * 0.006 + uTime * 0.55) * 8.0
              + snoise(vec2(xO * 0.008, zO * 0.008 + uTime * 0.18)) * 10.0) * uOceanAmp;
  vec3 oceanWorld = vec3(xO, uWaterY + wave, zO);

  // --- Basis-Zustand: unterhalb der N-Sektion wird die Maschine unwider-
  // ruflich gegen den Fluss-Strom getauscht; nach der letzten Leistung
  // regnet der Strahl gestaffelt ins Meer (leichter Durchhang beim Sinken).
  // Skulpturen kondensieren aus dem jeweils aktiven Basis-Zustand — das
  // End-N steigt dadurch automatisch aus dem Wasser.
  vec3 base = mix(machineWorld, flowWorld, uFlowZone);
  float mo = smoothstep(aSeed.w * 0.6, aSeed.w * 0.6 + 0.4, uOceanZone);
  base = mix(base, oceanWorld, mo);
  base.y -= sin(mo * 3.14159) * (20.0 + aSeed.z * 40.0);
  // Staffelung: Partikel tröpfeln nacheinander ein statt als Block zu
  // springen; Fenster 0.55 (statt 0.45) — jedes Partikel ist länger
  // unterwegs, niedrigere Spitzengeschwindigkeit, ruhigerer Aufbau
  float m = smoothstep(aSeed.w * 0.45, aSeed.w * 0.45 + 0.55, uSculptMix);
  vec3 sculptWorld = rotY(uSculptSpin) * aShape + vec3(uSculptCenter, 0.0);
  vec3 world = mix(base, sculptWorld, m);
  // Bogenflug statt Beeline: seitliche Auslenkung senkrecht zur Flugbahn,
  // ∝ Flugdistanz, an beiden Enden null (sin-Hüllkurve), Richtung und
  // Stärke aus dem Seed — Partikel schwenken in die Form ein statt
  // geradlinig einzuschlagen
  vec3 fvec = sculptWorld - base;
  float fdist = length(fvec);
  float fenv = sin(m * 3.14159);
  vec2 fperp = vec2(-fvec.y, fvec.x) / max(fdist, 1.0);
  world.xy += fperp * fenv * fdist * (aSeed.y - 0.5) * 0.5;
  world.z += fenv * fdist * (aSeed.z - 0.5) * 0.25;

  // mildes organisches Wabern auf allen Rollen (±5px, staubiger Look)
  world.x += snoise(vec2(world.y * 0.004 + aSeed.y * 7.0, uTime * 0.08)) * 5.0;
  world.y += snoise(vec2(world.x * 0.004 + 23.0, uTime * 0.1 + aSeed.y * 5.0)) * 5.0;
  world.z += snoise(vec2(aSeed.y * 17.0, uTime * 0.06)) * 5.0;

  vec4 mv = modelViewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;

  // --- Weißglut: Kern-Rolle + Stations-Flare + Skulptur-Highlights.
  // Fluss-Icons funkeln, sobald das Partikel auf seinem Form-Punkt sitzt;
  // im Meer funkeln die Wellenkämme.
  float formed = uFlowZone * smoothstep(0.92, 1.0, s);
  float crest = smoothstep(10.0, 24.0, wave) * mo;
  float hot = uFlare * 0.6 + max(uSculptMix, formed) * aSeed.x * 0.35 + crest * 0.45;
  if (role == 5) hot += uCoreHeat;
  vHot = hot;
  vColorMix = aSeed.z;

  // Punkte vor der z=0-Ebene minimal größer/heller — billiger 3D-Eindruck
  float front = smoothstep(0.0, 60.0, world.z);

  // uCameraD/-mv.z == 1.0 auf der z=0-Ebene => size ist ~CSS-Pixel
  float size = (0.9 + aSeed.x * 2.4) * (1.0 + min(hot, 1.5) * 0.6) * (1.0 + front * 0.15);
  gl_PointSize = size * uPixelRatio * (uCameraD / -mv.z);

  vAlpha = (0.3 + 0.7 * aSeed.x) * coreBoost * (1.0 + front * 0.25);
  // hinten liegende Punkte dämpfen — im Ozean deutlich schwächer, sonst
  // wäre das ferne Wasser (z bis −1400) unsichtbar; Horizont blasst
  // stattdessen sanft über die Tiefe aus
  vAlpha *= exp(min(world.z, 0.0) * mix(0.002, 0.0005, mo));
  vAlpha *= 1.0 - mo * dpt * 0.55;
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

/**
 * Pure pro-Frame-Logik für Stationen, Fluss-Zone und Fluss-Segment — von
 * update() benutzt und ohne DOM/WebGL in Node testbar (Scroll-Simulationen).
 *
 * Das uSculptMix-System bedient die Sculpt-Momente — LOGO-Stationen und die
 * Gehirn-Station der Team-Sektion (Maschine→N am
 * Anfang, Strom→N am Ende) — die Leistungs-Icons entstehen seit dem
 * Strahl-Umbau direkt aus den Fluss-Endpunkten (aShapeFrom/aShapeTo) und
 * tauchen hier nur noch als Segment-Grenzen auf. Drain-then-Fill zwischen
 * den beiden N-Stationen bleibt (gleicher Slot → nur der initiale Swap
 * passiert wirklich). Das N folgt seinem Ziel per 1-Pol-Tiefpass
 * (K_MIX_LOGO — reagiert ab dem ersten Scroll-Pixel, scroll-gebunden
 * getunt, kein Ease-in).
 *
 * Fluss-Zone: 0 im Hero und bis zur Mitte der ersten logo-Station; danach
 * eased → 1 über ein Fenster von 0.7·vh. Rein positionsabhängig — rückwärts
 * scrollen bringt die Maschine wieder zurück.
 *
 * Fluss-Segment: flowSeg = Index k der letzten Station mit Mitte über der
 * Viewport-Mitte (-1 davor); der Strom läuft von Form k zu Form k+1,
 * flowProgress ist der Scroll-Fortschritt dazwischen.
 *
 * Ozean (Akt 2): oceanZone rampt nach der letzten Leistungs-Station über
 * 0.8·vh auf 1 (Strahl regnet ins Meer, rückwärts scrollen hebt es zurück);
 * oceanCalm rampt vor der End-Logo-Station auf 1 (ruhige See fürs Finale).
 *
 * state: { currentShape, sculptMix }
 * env:   { stations: [{ y, h, slot, side }] (in Dokument-Reihenfolge, y aufsteigend),
 *          vh, centerDoc, logoReady, dt }
 * → { active, aPrime, sculptMix, currentShape, swap (Slot oder -1),
 *     flowZone, flowProgress, flowSeg, oceanZone, oceanCalm }
 */
export function sculptStep({ currentShape, sculptMix }, { stations, vh, centerDoc, logoReady, dt }) {
  // Sculpt-Momente (Logo-N, Gehirn): Aktivierung asymmetrisch — FRÜH
  // kondensieren (sobald die Sektions-Oberkante in den Viewport kommt),
  // voll HALTEN solange der Text im Viewport ist, und erst lösen, wenn der
  // Text oben rausgeht.
  let active = -1
  let aBest = 0
  for (let i = 0; i < stations.length; i++) {
    const st = stations[i]
    if (st.slot < LOGO_SLOT) continue
    const top = st.y - (st.h || 0) / 2
    // Einstieg erst, wenn der Hero-Text oben rausgescrollt ist (textfreier
    // Moment), und bewusst langsam über ~0.7 Viewport-Höhen aufbauend
    const ain = smooth01(top + 0.15 * vh, top + 0.7 * vh, centerDoc)
    // Auflösen: LINEAR und FRÜH — beginnt, sobald der Sektions-Text die
    // Bildschirmmitte passiert (Text sitzt bei ~0.76vh der Sektion, plus
    // halbe Texthöhe ≈ 0.85vh). Breites Fenster (0.9vh): scroll-gebunden,
    // parken jederzeit möglich, kein Zeit-Weglaufen.
    const aout = 1 - clamp((centerDoc - (top + 0.85 * vh)) / (0.9 * vh), 0, 1)
    const a = Math.min(ain, aout)
    if (a > aBest) {
      aBest = a
      active = i
    }
  }
  const aPrime = aBest

  // --- Fluss-Zone: ab der Mitte der ersten logo-Station eased → 1
  let flowZone = 0
  for (let i = 0; i < stations.length; i++) {
    if (stations[i].slot === LOGO_SLOT) {
      flowZone = smooth01(stations[i].y, stations[i].y + 0.7 * vh, centerDoc)
      break
    }
  }

  // --- Fluss-Segment: letzte Station mit Mitte über der Viewport-Mitte = k,
  // der Strom läuft von Form k zu Form k+1. Nach der letzten Station läuft
  // der Fortschritt über eine Viewport-Höhe aus.
  let k = -1
  for (let i = 0; i < stations.length; i++) if (stations[i].y <= centerDoc) k = i
  let flowProgress = 0
  if (k >= 0) {
    const span = k === stations.length - 1 ? Math.max(vh, 1) : Math.max(stations[k + 1].y - stations[k].y, 1e-6)
    flowProgress = clamp((centerDoc - stations[k].y) / span, 0, 1)
  }

  // --- Ozean-Zone: nach der letzten Leistungs-Station sinkt der Strahl ins
  // Meer; vor der End-Logo-Station beruhigt sich die See (calm), damit das
  // N aus glattem Wasser steigen kann. Beides rein positionsabhängig.
  let lastIcon = null
  let endLogo = null
  for (let i = 0; i < stations.length; i++) {
    if (stations[i].slot === LOGO_SLOT) endLogo = stations[i]
    else if (stations[i].slot < LOGO_SLOT) lastIcon = stations[i] // Gehirn zählt nicht
  }
  const oceanZone = lastIcon ? smooth01(lastIcon.y + 0.35 * vh, lastIcon.y + 1.15 * vh, centerDoc) : 0
  const oceanCalm = endLogo
    ? smooth01(endLogo.y - (endLogo.h || 0) / 2 - 1.6 * vh, endLogo.y - (endLogo.h || 0) / 2 - 0.3 * vh, centerDoc)
    : 0

  // Gewünschter Slot = Slot des aktiven Sculpt-Moments (Logo oder Gehirn).
  // Das N kondensiert nur mit wirklich geladenem Logo — sonst bliebe der
  // Slot bei Nullen und 26k additive Partikel würden zu einem gleißenden
  // Punkt kondensieren; ohne Logo läuft der Fluss einfach durch.
  const activeSlot = active >= 0 ? stations[active].slot : -1
  const desired = activeSlot < 0 || (activeSlot === LOGO_SLOT && !logoReady) ? -1 : activeSlot

  // Rampe DIREKT als Ziel — die Auflösung startet ohne Totzone genau
  // dort, wo der Text oben rauszugehen beginnt, und folgt dem Scroll 1:1.
  let mixTarget = desired >= 0 ? aPrime : 0

  let swap = -1
  if (desired >= 0 && desired !== currentShape) {
    if (sculptMix < 0.06) {
      swap = desired
      currentShape = desired
    } else {
      mixTarget = 0 // Drain: erst auflösen, geswappt wird beim nächsten Unterschreiten
    }
  }
  sculptMix += (mixTarget - sculptMix) * (1 - Math.exp(-K_MIX_LOGO * dt))

  return { active, aPrime, sculptMix, currentShape, swap, flowZone, flowProgress, flowSeg: k, oceanZone, oceanCalm }
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
    uFlowZone: { value: 0 },
    uFlowProgress: { value: 0 },
    uOceanZone: { value: 0 },
    uOceanAmp: { value: 1 },
    uWaterY: { value: -0.28 * innerHeight },
    uViewportW: { value: innerWidth },
    uFlowFromC: { value: new THREE.Vector2(0, 0) },
    uFlowToC: { value: new THREE.Vector2(0, 0) },
    uFromSpin: { value: 0 },
    uToSpin: { value: 0 },
    uHoldFrom: { value: FLOW_HOLD_BLOB },
    uHoldTo: { value: FLOW_HOLD_BLOB },
    uViewportH: { value: innerHeight },
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
  const aShapeFromAttr = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
  geometry.setAttribute('aShapeFrom', aShapeFromAttr)
  const aShapeToAttr = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
  geometry.setAttribute('aShapeTo', aShapeToAttr)

  // --- Stationen: pro data-station-Element { y: Dokument-Mitte, slot, side }.
  // side: logo-Stationen 0 (zentriert), Leistungen alternierend — NUR über
  // die Nicht-Logo-Stationen gezählt (erste Leistung → +1 = Skulptur rechts).
  let stations = []

  function measureDoc() {
    const els = [...document.querySelectorAll(stationSelector)]
    stations = []
    let leistung = 0
    for (const el of els) {
      const name = (el.getAttribute('data-station') || '').trim()
      const slot = SLOT_BY_NAME[name]
      if (slot === undefined) {
        console.warn(`reactor: unbekannte data-station="${name}" — Element wird ignoriert`, el)
        continue
      }
      const r = el.getBoundingClientRect()
      let side = 0
      if (slot < LOGO_SLOT) {
        // nur echte Leistungs-Stationen alternieren; Sculpt-Momente
        // (Logo/Gehirn) stehen zentriert
        side = leistung % 2 === 0 ? 1 : -1
        leistung++
      }
      stations.push({ y: scrollY + r.top + r.height / 2, h: r.height, slot, side })
    }
  }

  // --- Skulptur-Slots: alle 7 Skulpturen + Logo werden vorgebaut, aShape
  // trägt immer genau eine davon (Drain-then-Fill-Swap, s. sculptStep)
  let logoData = null // ImageData des Logos nach erstem Laden (Cache für Resizes)
  let logoReady = false // erst dann dürfen logo-Stationen das N kondensieren
  let shapes = []
  let currentShape = -1 // welcher Slot gerade im aShape-Attribut liegt

  function sculptSize() {
    return Math.min(innerWidth, innerHeight) * (isMobile ? 0.6 : 0.5)
  }

  function buildLogoShape() {
    // Bis das Logo geladen ist (oder wenn es nicht ladbar ist): Slot mit Nullen —
    // logo-Stationen sind über logoReady ohnehin gegen Kondensation gesperrt.
    if (!logoData) return new Float32Array(count * 3)
    // N etwas kleiner als die Themen-Skulpturen (×0.85): sitzt über dem Text.
    return flipY(samplePointsFromAlpha(logoData, count, { targetWidth: sculptSize() * 0.85 }))
  }

  // Blob-Wolke als Endpunkt-Form für Logo-Enden und Segment-Ränder: dort
  // hält der Fluss kein Icon, darf aber auch nicht auf einen gleißenden
  // Punkt kollabieren.
  function buildBlob() {
    const arr = new Float32Array(count * 3)
    const r = Math.min(innerWidth, innerHeight) * 0.05
    for (let i = 0; i < count; i++) {
      arr[i * 3] = gaussian() * r
      arr[i * 3 + 1] = gaussian() * r
      arr[i * 3 + 2] = gaussian() * r * 0.8
    }
    return arr
  }
  let blob = null
  let flowSegDirty = true // Fluss-Endpunkte beim nächsten Frame neu spiegeln

  function buildShapes() {
    const size = sculptSize()
    shapes = SCULPTURES.map((fn) => flipY(fn(count, { size })))
    shapes.push(buildLogoShape())
    shapes.push(flipY(brainShape(count, { size: size * 0.95 }))) // BRAIN_SLOT
    blob = buildBlob()
    // Nach Resize liegt die aktuelle Form in neuer Größe vor → Slot auffrischen
    if (currentShape >= 0) {
      aShapeAttr.array.set(shapes[currentShape])
      aShapeAttr.needsUpdate = true
    }
    flowSegDirty = true
  }

  /** Endpunkt-Form eines Fluss-Segments: Icon der Station oder Blob
   *  (Sculpt-Momente wie Logo/Gehirn laufen über das uSculptMix-System). */
  function endpointShape(station) {
    if (!station || station.slot >= LOGO_SLOT) return blob
    return shapes[station.slot]
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
  let curSeg = -2 // aktuell in den Attributen gespiegeltes Fluss-Segment
  let sculptAnchor = 0 // Dokument-y, relativ zu dem die Skulptur rotiert
  let anchorStation = null // Station, deren Skulptur gerade angezeigt wird

  function update(t, dt) {
    // dt-normierte Easings: identisches Verhalten bei 30/60/120 Hz
    const ease = (k) => 1 - Math.exp(-k * dt)

    scrollSmooth += (scrollY - scrollSmooth) * ease(K_SCROLL)
    uniforms.uScrollSmooth.value = scrollSmooth
    const dScroll = scrollY - lastScrollY
    lastScrollY = scrollY

    const vh = Math.max(innerHeight, 1)
    const vw = Math.max(innerWidth, 1)
    const centerDoc = scrollSmooth + vh / 2

    // --- Kern-Hitze aus der Scroll-Geschwindigkeit (px/s, framerate-unabhängig)
    heat += (clamp(Math.abs(dScroll) / dt / HEAT_SPEED, 0, 1) - heat) * ease(K_HEAT)
    uniforms.uCoreHeat.value = 0.25 + heat

    // --- Stationen, Fluss-Zone und Skulptur-Slot (pure Frame-Logik, s. sculptStep)
    const st = sculptStep(
      { currentShape, sculptMix },
      { stations, vh, centerDoc, logoReady, dt }
    )
    if (st.swap >= 0) {
      aShapeAttr.array.set(shapes[st.swap])
      aShapeAttr.needsUpdate = true
    }
    currentShape = st.currentShape
    sculptMix = st.sculptMix
    uniforms.uSculptMix.value = sculptMix
    uniforms.uFlowZone.value = st.flowZone
    uniforms.uFlowProgress.value = st.flowProgress
    uniforms.uOceanZone.value = st.oceanZone
    uniforms.uOceanAmp.value = 1 - 0.75 * st.oceanCalm

    // --- Fluss-Endpunkte: Formen, Zentren und Halte-Plateaus des aktuellen
    // Segments in Attribute/Uniforms spiegeln — nur bei Segmentwechsel oder
    // nach Resize (der Upload von 2× count Vertices ist nichts für jeden
    // Frame). Am Wechselpunkt ist die Position stetig: die Ziel-Form des
    // alten Segments wird zur Start-Form des neuen.
    const seg = st.flowSeg
    if (seg !== curSeg || flowSegDirty) {
      curSeg = seg
      flowSegDirty = false
      const fromSt = seg >= 0 ? stations[seg] : null
      const toSt = seg + 1 < stations.length ? stations[seg + 1] : null
      aShapeFromAttr.array.set(endpointShape(fromSt))
      aShapeFromAttr.needsUpdate = true
      aShapeToAttr.array.set(endpointShape(toSt))
      aShapeToAttr.needsUpdate = true
      uniforms.uFlowFromC.value.set(fromSt ? fromSt.side * vw * 0.24 : 0, 0)
      uniforms.uFlowToC.value.set(toSt ? toSt.side * vw * 0.24 : 0, 0)
      uniforms.uHoldFrom.value = fromSt && fromSt.slot !== LOGO_SLOT ? FLOW_HOLD : FLOW_HOLD_BLOB
      uniforms.uHoldTo.value = toSt && toSt.slot !== LOGO_SLOT ? FLOW_HOLD : FLOW_HOLD_BLOB
    }
    // Scroll-Rotation der Endpunkt-Icons (gleiche Rate wie früher die
    // uSculptSpin-Skulpturen): steht aufrecht genau an der Stationsmitte
    uniforms.uFromSpin.value = seg >= 0 ? (centerDoc - stations[seg].y) * 0.004 : 0
    uniforms.uToSpin.value = seg + 1 < stations.length ? (centerDoc - stations[seg + 1].y) * 0.004 : 0

    const active = st.active
    const aPrime = st.aPrime
    const activeStation = active >= 0 ? stations[active] : null
    const ePan = ease(K_PAN)

    // --- Anker: Dreh-Punkt und Seite folgen der ANGEZEIGTEN Skulptur
    // (currentShape), nicht der aktiven Station — sonst schwenkt/dreht die
    // halb aufgelöste Wolke beim Stationswechsel schlagartig um ("springt").
    // Der Anker wechselt erst nach dem Slot-Swap (sculptMix ≈ 0, unsichtbar).
    if (activeStation && activeStation.slot === currentShape) anchorStation = activeStation
    // Sculpt-Momente (Logo-N, Gehirn): zentriert, leicht erhöht, gedrosselter Spin
    const isMomentDisplayed = anchorStation !== null && anchorStation.slot >= LOGO_SLOT
    if (anchorStation) sculptAnchor = anchorStation.y

    // Aufflammen erst, wenn die Form wirklich steht (sculptMix statt aPrime:
    // kein Blitz mehr auf halb geformte Wolken beim schnellen Durchscrollen)
    const flareTarget = Math.max(0, sculptMix - 0.8) * 5
    flare += (flareTarget - flare) * ease(flareTarget > flare ? K_FLARE_UP : K_FLARE_DOWN)
    uniforms.uFlare.value = flare

    // --- Skulptur-Rotation: dreht mit dem Scroll um die eigene Y-Achse;
    // Logo leicht gedrosselt (steht frontal am Text-Moment der Sektionsmitte).
    let spinTarget = (centerDoc - sculptAnchor) * 0.004
    if (isMomentDisplayed) spinTarget *= 0.6
    uniforms.uSculptSpin.value += (spinTarget - uniforms.uSculptSpin.value) * ePan

    // --- Maschinen-CPU-Arbeit nur solange die Maschine sichtbar ist; im
    // Fluss-Bereich (flowZone == 1) ist sie komplett ausgeblendet. Die
    // billigen Idle-/Getriebe-Spins laufen weiter (unsichtbar, aber beim
    // Rückwärts-Scrollen sofort wieder konsistent).
    const spins = uniforms.uSpin.value
    for (let i = 0; i < 5; i++) spins[i] = scrollSmooth * GEARS[i] * 0.0035 + t * IDLE[i]
    if (st.flowZone < 0.999) {
      // Posen: Hero-Basis → Winkel-Lerp zur Pose des aktiven Slots
      // (Logo-Slot = frontal genestete Ringe, POSES[8])
      const machineR = uniforms.uMachineR.value
      const hero = POSES[0]
      // Slots oberhalb des Logos (Gehirn) teilen sich dessen Pose — die
      // Maschine ist dort ohnehin längst unsichtbar (Fluss-/Ozean-Zone)
      const pose = activeStation ? POSES[1 + Math.min(activeStation.slot, LOGO_SLOT)] : null
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
        tiltX[i] = tx
        tiltZ[i] = tz
        ringR[i] = RING_F[i] * machineR * rs
      }
    }

    // --- Seiten-Schwenk: Maschine/Skulptur folgen der Seite der aktiven
    // Station (side ∈ {−1, 0, +1}); logo-Stationen zentrieren. Das Skulptur-
    // Zentrum sitzt bei logo-Stationen zusätzlich um +0.10·vh höher (View-
    // Raum: +y = oben), damit unter dem N Platz für den Text bleibt.
    const panStation = anchorStation || activeStation
    const targetX = panStation ? panStation.side * vw * 0.24 : 0
    // Gehirn höher als das N (größere Skulptur, Text + Gründer darunter)
    const momentLift = anchorStation && anchorStation.slot === BRAIN_SLOT ? 0.16 : 0.1
    const targetY = isMomentDisplayed ? vh * momentLift : 0
    uniforms.uCenter.value.x += (targetX - uniforms.uCenter.value.x) * ePan
    uniforms.uSculptCenter.value.x += (targetX - uniforms.uSculptCenter.value.x) * ePan
    uniforms.uSculptCenter.value.y += (targetY - uniforms.uSculptCenter.value.y) * ePan

    // --- Skalierung: Hero 1.0 → 0.62 bei aktiver Station
    const scaleTarget = activeStation ? 0.62 : 1.0
    uniforms.uScale.value += (scaleTarget - uniforms.uScale.value) * ePan
  }

  const clock = new THREE.Clock()
  let raf = null
  // Eigene Zeitachse, die nur bei laufendem rAF weiterzählt — getElapsedTime()
  // liefe bei verstecktem Tab weiter und ließe die Idle-Rotationen springen.
  let tAcc = 0
  function tick() {
    raf = requestAnimationFrame(tick)
    // Delta deckeln: lange Frames/Ruckler dürfen keine Zeit-/Easing-Sprünge erzeugen
    const dt = clamp(clock.getDelta(), 0.001, 0.1)
    tAcc += dt
    uniforms.uTime.value = tAcc
    update(tAcc, dt)
    renderer.render(scene, camera)
  }

  function start() {
    if (raf !== null) return
    clock.getDelta() // im pausierten Zustand aufgelaufene Zeit einmalig verwerfen
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
      uniforms.uMachineR.value = machineRadius()
      uniforms.uViewportH.value = innerHeight
      uniforms.uViewportW.value = innerWidth
      uniforms.uWaterY.value = -0.28 * innerHeight
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
      logoReady = true
      if (currentShape === LOGO_SLOT) {
        aShapeAttr.array.set(shapes[LOGO_SLOT])
        aShapeAttr.needsUpdate = true
      }
    })
    .catch(() => {
      // Logo nicht ladbar → logoReady bleibt false: logo-Stationen konden-
      // sieren nicht (kein gleißender Null-Punkt), der Fluss läuft durch.
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
