import React from 'react';
import * as THREE from 'three';

// ── Konstanten ─────────────────────────────────────────────────────
const SHOWER_D  = 0.90;
const SHOWER_WT = 0.14;

// ── Aufsatzbecken-Profil (Lathe, Draufsicht XY = Radius/Höhe) ──────
// Erzeugt ein organisches, gerundetes Vessel-Basin bei 360° Rotation
const BASIN_POINTS = [
  new THREE.Vector2(0.000, 0.000),  // Boden-Mitte aussen
  new THREE.Vector2(0.058, 0.000),  // Boden flach aussen
  new THREE.Vector2(0.138, 0.032),  // Untere Außenwand
  new THREE.Vector2(0.158, 0.072),  // Mittlere Außenwand
  new THREE.Vector2(0.162, 0.096),  // Obere Außenwand
  new THREE.Vector2(0.167, 0.106),  // Rand-Außenkante
  new THREE.Vector2(0.165, 0.110),  // Rand-Oberkante
  new THREE.Vector2(0.158, 0.106),  // Rand-Innenkante
  new THREE.Vector2(0.145, 0.090),  // Obere Innenwand
  new THREE.Vector2(0.112, 0.042),  // Mittlere Innenwand
  new THREE.Vector2(0.052, 0.008),  // Untere Innenwand
  new THREE.Vector2(0.012, 0.004),  // Innenboden-Rand
  new THREE.Vector2(0.000, 0.004),  // Innenboden-Mitte
];

// ── Blatt-Daten für Tropenpflanze ──────────────────────────────────
// [azimut, elevation, länge, breite, dunkel?]
const TROPICAL_LEAVES = [
  // Außenring — ausgewachsene Blätter, leicht hängend
  [0.00, 0.52, 0.46, 0.130, false],
  [0.63, 0.56, 0.43, 0.120, true ],
  [1.26, 0.50, 0.48, 0.140, false],
  [1.88, 0.58, 0.44, 0.125, true ],
  [2.51, 0.54, 0.47, 0.135, false],
  [3.14, 0.56, 0.42, 0.125, true ],
  [3.77, 0.52, 0.45, 0.130, false],
  [4.40, 0.58, 0.41, 0.115, true ],
  [5.03, 0.54, 0.44, 0.125, false],
  [5.65, 0.52, 0.47, 0.140, true ],
  // Innenring — jüngere, aufrechte Blätter
  [0.31, 0.80, 0.34, 0.095, false],
  [1.05, 0.84, 0.32, 0.090, true ],
  [1.88, 0.78, 0.36, 0.100, false],
  [2.82, 0.82, 0.31, 0.088, true ],
  [3.77, 0.80, 0.34, 0.095, false],
  [4.71, 0.84, 0.30, 0.085, true ],
  // Mittelzone — entrollende Jungtriebe
  [0.62, 0.92, 0.22, 0.068, false],
  [2.20, 0.94, 0.20, 0.062, true ],
  [4.10, 0.90, 0.24, 0.072, false],
  [5.50, 0.93, 0.18, 0.058, true ],
];

// ─────────────────────────────────────────────────────────────────────
//  TEXTUREN
// ─────────────────────────────────────────────────────────────────────

let _floorTex = null;
function getGrayFloorTex() {
  if (_floorTex) return _floorTex;
  const W = 1024, H = 1024;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => Math.max(0, Math.min(255, v)) | 0;
  // 2×2 großformatige Porzellan-Fliesen (60×60 cm) pro Textur-Repeat
  const TILE_PX = W / 2, TILE_PY = H / 2;
  const GROUT = 5; // 5px Fuge — klar und sauber
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tileX = Math.floor(x / TILE_PX);
      const tileY = Math.floor(y / TILE_PY);
      const gx = x % TILE_PX;
      const gy = y % TILE_PY;
      const isGrout = gx < GROUT || gy < GROUT;
      // Deterministisches Per-Fliesen-Rauschen: jede Fliese leicht individuell
      const hash = Math.abs(Math.sin(tileX * 127.1 + tileY * 311.7) * 43758.5453) % 1;
      const tileVar = (hash - 0.5) * 14;
      // Lokale Fliesenkoordinaten (0–1) für einheitliches internes Muster
      const lx = gx < GROUT ? 0 : (gx - GROUT) / (TILE_PX - GROUT);
      const ly = gy < GROUT ? 0 : (gy - GROUT) / (TILE_PY - GROUT);
      let r, g, b;
      if (isGrout) {
        r = 150; g = 146; b = 140;
      } else {
        // Einheitliche interne Maserung pro Fliese (exakt gleiches Muster in jeder Fliese)
        const grain  = Math.sin(lx * 79  + ly * 131) * 1.8
                     + Math.sin(lx * 197 - ly * 163) * 1.1
                     + Math.sin(lx * 311 + ly * 239) * 0.55;
        // Großflächige Wolken-Variation (polierter Stein-Look)
        const cloud  = Math.sin(lx * 4.8  + ly * 3.6) * 4.2
                     + Math.sin(lx * 2.9  - ly * 5.3) * 2.6
                     + Math.sin(lx * 7.1  + ly * 2.0) * 1.3;
        const micro  = Math.sin(lx * 421  + ly * 383) * 0.35;
        const base   = 194 + tileVar + grain + cloud + micro;
        // Warmer Creme-Beige-Ton (Feinsteinzeug Natur)
        r = cl(base + 10); g = cl(base + 6); b = cl(base - 6);
      }
      const i = (y * W + x) * 4;
      d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4.0, 3.0); // 8×6 Fliesen gesamt
  tex.anisotropy = 16;
  return (_floorTex = tex);
}

// Calacatta-Marmor — dramatische Äderung, tiefes Elfenbein-Weiß, luxuriöse Tiefe
let _marbleTex = null;
function getMarbleTex() {
  if (_marbleTex) return _marbleTex;
  const W = 1024, H = 1024;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => Math.max(0, Math.min(255, v)) | 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W, ny = y / H;
      // Domain-Warping für natürlichen Äder-Fluss
      const w1 = Math.sin(nx * 5.2  + ny * 2.8)  * 0.95;
      const w2 = Math.sin(nx * 2.1  - ny * 4.6)  * 0.62;
      const w3 = Math.sin(nx * 3.8  + ny * 1.2)  * 0.44;
      // Hauptadern (breit, dramatisch — Calacatta-typisch)
      const vMain1 = Math.abs(Math.sin((nx + ny * 0.55 + w1) * 9.5)) * 30;
      const vMain2 = Math.abs(Math.sin((nx * 0.42 - ny + w2 * 0.68) * 5.5)) * 22;
      // Sekundäradern (fein, verzweigt)
      const vSec1  = Math.abs(Math.sin((nx * 1.8  + ny * 0.8 + w3)        * 15.0)) * 11;
      const vSec2  = Math.abs(Math.sin((nx * 0.6  + ny * 2.2 + w1 * 0.4)  * 11.0)) *  7;
      const vSec3  = Math.abs(Math.sin((nx * 2.4  - ny * 1.5 + w2 * 0.3)  * 19.0)) *  5;
      // Gold-Akzent-Ader
      const vGold  = Math.abs(Math.sin((nx * 1.3  - ny * 0.7 + w2 * 0.5)  * 13.0)) *  9;
      // Mikro-Oberfläche (Polierstein-Tiefe)
      const micro  = Math.sin(nx * 211 + ny * 283) * 1.5 + Math.sin(nx * 337 - ny * 317) * 0.9;
      const base   = 248 - vMain1 * 0.84 - vMain2 * 0.70
                       - vSec1 * 0.42 - vSec2 * 0.30 - vSec3 * 0.18 + micro;
      const i = (y * W + x) * 4;
      d[i]   = cl(base +  8 - vGold * 0.28);  // R: warm ivory
      d[i+1] = cl(base +  2 - vGold * 0.55);  // G
      d[i+2] = cl(base - 20 - vGold * 0.80);  // B: kalt unterdrückt
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.0, 0.75);
  tex.anisotropy = 16;
  return (_marbleTex = tex);
}

// Dunkles Nussbaum-Holz — warme Maserung, luxuriöse Tiefe (1024px für 4K)
let _woodTex = null;
function getWoodTex() {
  if (_woodTex) return _woodTex;
  const W = 1024, H = 1024;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => Math.max(0, Math.min(255, v)) | 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W, ny = y / H;
      // Breite Jahresringe mit organischer Verzerrung
      const g1 = Math.sin(ny * 44  + Math.sin(nx * 4.2) * 3.2) * 16;
      // Feine Maserung
      const g2 = Math.sin(ny * 98  + Math.sin(nx * 7.8) * 2.0) * 8;
      // Sehr feine Holzfasern
      const g3 = Math.sin(ny * 218 + nx * 2.1) * 3.0;
      // Quer-Variation
      const g4 = Math.sin(nx * 31  + ny * 8.4) * 4.0;
      // Astigkeit / Makeln
      const g5 = Math.sin(nx * 73  + ny * 127) * 2.2 + Math.sin(nx * 151 - ny * 89) * 1.4;
      // Glanzpunkte (poliertes Holz)
      const g6 = Math.sin(nx * 7.2 + ny * 3.1) * 3.5 + Math.sin(nx * 2.8 - ny * 9.4) * 2.0;
      const grain = g1 + g2 + g3 + g4 + g5 + g6;
      const i = (y * W + x) * 4;
      d[i]   = cl(120 + grain * 1.08);  // warmes Nussbraun
      d[i+1] = cl(80  + grain * 0.82);
      d[i+2] = cl(46  + grain * 0.46);
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.0, 0.7);
  tex.anisotropy = 16;
  return (_woodTex = tex);
}

let _stoneTex = null;
function getStoneTex() {
  if (_stoneTex) return _stoneTex;
  const W = 256, H = 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => Math.max(0, Math.min(255, v)) | 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W, ny = y / H;
      const warp = Math.sin(nx * 5.5 + ny * 2.8) * 0.55;
      const v1   = Math.abs(Math.sin((nx + ny * 0.7 + warp) * 9)) * 5;
      const v2   = Math.abs(Math.sin((nx * 0.4 - ny + warp * 0.4) * 6)) * 3.5;
      const grain = Math.sin(nx * 43 + ny * 71) * 1.5 + Math.sin(nx * 97 - ny * 53) * 1.0;
      const base  = 222 - v1 - v2;
      const i = (y * W + x) * 4;
      d[i]   = cl(base + grain + 3);
      d[i+1] = cl(base + grain - 1);
      d[i+2] = cl(base + grain - 9);
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.0, 0.6);
  tex.anisotropy = 8;
  return (_stoneTex = tex);
}

// Blatt-Textur — zugespitztes Oval, reicher Farbverlauf, Rippen, Oberflächendetail (128px)
let _leafTex = null;
function getLeafTex() {
  if (_leafTex) return _leafTex;
  const W = 128, H = 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(W / 2, H - 1);
  ctx.bezierCurveTo(W * 0.04, H * 0.76, W * 0.01, H * 0.21, W / 2, 1);
  ctx.bezierCurveTo(W * 0.99, H * 0.21, W * 0.96, H * 0.76, W / 2, H - 1);
  ctx.closePath();
  ctx.clip();

  // Satter Farbverlauf: tiefes Dunkelgrün → lebendiges Grasgrün
  const grad = ctx.createLinearGradient(W / 2, H, W / 2, 0);
  grad.addColorStop(0.00, '#193810');
  grad.addColorStop(0.25, '#265219');
  grad.addColorStop(0.55, '#356b22');
  grad.addColorStop(0.80, '#447d2e');
  grad.addColorStop(1.00, '#58943c');
  ctx.fillStyle = grad;
  ctx.fill();

  // Leichte radiale Aufhellung in der Mitte (3D-Wölbung)
  const radGrad = ctx.createRadialGradient(W/2, H*0.45, 0, W/2, H*0.45, W*0.55);
  radGrad.addColorStop(0,   'rgba(180,255,120,0.13)');
  radGrad.addColorStop(0.5, 'rgba(180,255,120,0.05)');
  radGrad.addColorStop(1,   'rgba(0,0,0,0.08)');
  ctx.fillStyle = radGrad;
  ctx.fill();

  // Seitliche Aufhellung (Lichteinfall simuliert)
  const sideGrad = ctx.createLinearGradient(0, 0, W, 0);
  sideGrad.addColorStop(0.0, 'rgba(255,255,200,0.06)');
  sideGrad.addColorStop(0.38, 'rgba(255,255,200,0.14)');
  sideGrad.addColorStop(0.62, 'rgba(255,255,200,0.14)');
  sideGrad.addColorStop(1.0, 'rgba(255,255,200,0.06)');
  ctx.fillStyle = sideGrad;
  ctx.fill();

  // Mittelrippe (stärker, realistischer)
  ctx.strokeStyle = 'rgba(210,255,140,0.34)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(W / 2, H - 1);
  ctx.quadraticCurveTo(W / 2 + 3, H * 0.5, W / 2, 1);
  ctx.stroke();

  // Seitenrippen
  ctx.lineWidth = 1.1;
  for (let i = 2; i <= 12; i++) {
    const fy = i / 13;
    const py = fy * H;
    const spread = (W / 2 - 3) * 0.82 * Math.sin(Math.PI * fy);
    const dy = -H * 0.055;
    ctx.strokeStyle = `rgba(210,255,140,${0.06 + 0.13 * Math.sin(Math.PI * fy)})`;
    ctx.beginPath(); ctx.moveTo(W / 2, py); ctx.lineTo(W / 2 - spread, py + dy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2, py); ctx.lineTo(W / 2 + spread, py + dy); ctx.stroke();
  }

  ctx.restore();
  const tex = new THREE.CanvasTexture(cv);
  return (_leafTex = tex);
}

// ─────────────────────────────────────────────────────────────────────
//  ZIMMERPFLANZE — Terracotta-Topf, Unterteller, flache Blätter
// ─────────────────────────────────────────────────────────────────────
function BathroomPlant({ position, scale = 1 }) {
  const POT_H  = 0.22 * scale;
  const POT_R  = 0.100 * scale;
  const SAU_R  = 0.126 * scale;
  const topY   = POT_H * 0.5;
  const leafTex = getLeafTex();

  return (
    <group position={position}>

      {/* Untersetzer */}
      <mesh receiveShadow position={[0, -POT_H * 0.5 - 0.011 * scale, 0]}>
        <cylinderGeometry args={[SAU_R, SAU_R * 0.93, 0.022 * scale, 28]} />
        <meshStandardMaterial color="#7a3418" roughness={0.82} metalness={0.0} />
      </mesh>
      <mesh position={[0, -POT_H * 0.5 + 0.004 * scale, 0]}>
        <cylinderGeometry args={[SAU_R * 0.74, SAU_R * 0.74, 0.003 * scale, 24]} />
        <meshStandardMaterial color="#1c0e04" roughness={0.96} metalness={0.0} />
      </mesh>

      {/* Topf (Terracotta — warmes gebranntes Orange-Rot) */}
      <mesh castShadow>
        <cylinderGeometry args={[POT_R, POT_R * 0.74, POT_H, 32]} />
        <meshStandardMaterial color="#a84020" roughness={0.80} metalness={0.0} />
      </mesh>
      {/* Rand-Wulst */}
      <mesh position={[0, topY - 0.004 * scale, 0]}>
        <torusGeometry args={[POT_R * 0.96, 0.010 * scale, 10, 36]} />
        <meshStandardMaterial color="#8c3218" roughness={0.76} metalness={0.0} />
      </mesh>
      {/* Erde */}
      <mesh position={[0, topY - 0.006 * scale, 0]}>
        <cylinderGeometry args={[POT_R - 0.012 * scale, POT_R - 0.010 * scale, 0.018 * scale, 24]} />
        <meshStandardMaterial color="#1e0e04" roughness={0.98} metalness={0.0} />
      </mesh>

      {/* Blätter — Canvas-Textur mit Blattform-Alpha und Rippenzeichnung */}
      {TROPICAL_LEAVES.map(([az, el, len, w], i) => {
        const elAdj   = el - Math.max(0, (len - 0.28) * 0.28);
        const halfLen = len * 0.5 * scale;
        const px = Math.cos(elAdj) * Math.sin(az) * halfLen;
        const py = topY + Math.sin(elAdj) * halfLen;
        const pz = Math.cos(elAdj) * Math.cos(az) * halfLen;
        return (
          <mesh
            key={i}
            position={[px, py, pz]}
            rotation={[Math.PI / 2 - elAdj, az, 0]}
            castShadow
          >
            <planeGeometry args={[w * scale, len * scale]} />
            <meshStandardMaterial
              map={leafTex}
              roughness={0.62}
              metalness={0.0}
              side={THREE.DoubleSide}
              transparent
              alphaTest={0.30}
              envMapIntensity={0.18}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  SPA-HOCKER  (Massivholz, vier leicht konische Beine)
// ─────────────────────────────────────────────────────────────────────
function BathStool({ position }) {
  const woodTex = getWoodTex();
  const legH    = 0.44;
  return (
    <group position={position}>
      {/* Sitzfläche */}
      <mesh castShadow position={[0, legH + 0.025, 0]}>
        <boxGeometry args={[0.38, 0.046, 0.26]} />
        <meshStandardMaterial map={woodTex} roughness={0.38} metalness={0.0} envMapIntensity={0.45} />
      </mesh>
      {/* Abrundung Oberkante (schmale Leiste vorne) */}
      <mesh position={[0, legH + 0.044, 0.128]}>
        <cylinderGeometry args={[0.010, 0.010, 0.36, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial map={woodTex} roughness={0.40} metalness={0.0} envMapIntensity={0.40} />
      </mesh>
      {/* Querstrebe */}
      <mesh position={[0, legH * 0.38, 0]}>
        <boxGeometry args={[0.290, 0.018, 0.016]} />
        <meshStandardMaterial map={woodTex} roughness={0.45} metalness={0.0} envMapIntensity={0.40} />
      </mesh>
      {/* 4 Beine */}
      {[[-0.155, -0.100], [0.155, -0.100], [-0.155, 0.100], [0.155, 0.100]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, legH / 2, z]}
          rotation={[z * 0.08, 0, x * 0.06]}>
          <cylinderGeometry args={[0.016, 0.012, legH, 10]} />
          <meshStandardMaterial map={woodTex} roughness={0.55} metalness={0.0} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  HOLZ-LEITER-HANDTUCHHALTER
// ─────────────────────────────────────────────────────────────────────
const LADDER_RUNGS = [0.30, 0.58, 0.88, 1.18, 1.46];

function WoodenLadder({ position }) {
  const woodTex = getWoodTex();
  const SPAN    = 0.38;
  const RAIL_H  = 1.65;
  return (
    <group position={position} rotation={[0, 0, 0.09]}>
      {[-SPAN / 2, SPAN / 2].map((x, i) => (
        <mesh key={i} castShadow position={[x, RAIL_H / 2, 0]}>
          <cylinderGeometry args={[0.022, 0.022, RAIL_H, 16]} />
          <meshStandardMaterial map={woodTex} roughness={0.42} metalness={0.0} envMapIntensity={0.40} />
        </mesh>
      ))}
      {LADDER_RUNGS.map((ry, i) => (
        <mesh key={i} castShadow rotation={[0, 0, Math.PI / 2]} position={[0, ry, 0]}>
          <cylinderGeometry args={[0.016, 0.016, SPAN, 14]} />
          <meshStandardMaterial map={woodTex} roughness={0.42} metalness={0.0} envMapIntensity={0.40} />
        </mesh>
      ))}
      {/* Handtuch (groß, natürlich drapiert) */}
      <mesh castShadow position={[0, LADDER_RUNGS[2] - 0.18, 0.008]}>
        <boxGeometry args={[0.010, 0.52, 0.56]} />
        <meshStandardMaterial color="#ded5c0" roughness={0.90} metalness={0.0} />
      </mesh>
      {/* Handtuch Überhang oben */}
      <mesh castShadow position={[0, LADDER_RUNGS[2] + 0.10, 0.040]}>
        <boxGeometry args={[0.008, 0.120, 0.54]} />
        <meshStandardMaterial color="#d8ceb8" roughness={0.88} metalness={0.0} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  BADEZIMMER-SZENE
// ─────────────────────────────────────────────────────────────────────
export default function BathroomScene({ showerWidth = 1.2, showerHeight = 2.0 }) {
  const h = showerHeight;
  const w = showerWidth;

  const floorY = -h;
  const ceilY  =  0.58;

  const nisLeftX  = -(w / 2 + SHOWER_WT);
  const nisRightX =  (w / 2 + SHOWER_WT);
  const nisBackZ  = -(SHOWER_D + SHOWER_WT + 0.04);

  const roomL  = nisLeftX  - 1.40;
  const roomR  = nisRightX + 1.90;
  const roomFZ =  2.30;
  const roomBZ = nisBackZ;

  const roomCX = (roomL + roomR) / 2;
  const roomCZ = (roomFZ + roomBZ) / 2;
  const roomW  = roomR - roomL;
  const roomD  = roomFZ - roomBZ;
  const wallH  = ceilY - floorY;
  const wallMY = floorY + wallH / 2;

  const floorTex  = getGrayFloorTex();
  const marbleTex = getMarbleTex();
  const woodTex   = getWoodTex();
  const stoneTex  = getStoneTex();

  // Fenster rechts
  const winH = 1.30, winW = 0.95;
  const winY = floorY + wallH * 0.62;
  const winZ = -0.35;

  // Waschtisch
  const vX  = nisRightX + 0.55;
  const vW  = 0.70;
  const vD  = 0.48;
  const vZ  = nisBackZ + vD / 2;
  const ctY = floorY + 0.88;
  const cbB = floorY + 0.42;
  const cbH = ctY - 0.030 - cbB;
  const cbY = cbB + cbH / 2;

  // Spiegel
  const mH  = 0.92;
  const mCY = ctY + 0.06 + mH / 2;

  // Handtuchhalter
  const railY = floorY + 1.12;
  const railZ = 1.15;

  // Linkes Fenster
  const leftWinH = 1.55, leftWinW = 0.44;
  const leftWinY = floorY + wallH * 0.52;
  const leftWinZ = nisBackZ + 0.54;

  // Sockelleisten
  const skH = 0.090, skT = 0.014;
  const skY = floorY + skH / 2;

  // Calacatta-Marmor — ultra-poliert, tiefer Glanz
  const M_WALL = { map: marbleTex, roughness: 0.06, metalness: 0.01, envMapIntensity: 0.90 };
  const M_CHR  = { color: '#cdcdcd', metalness: 0.94, roughness: 0.06, envMapIntensity: 1.6 };
  const M_BRASS= { color: '#c8a030', metalness: 0.88, roughness: 0.18, envMapIntensity: 1.4 };

  return (
    <group>

      {/* ═══ UMGEBUNGS-BOX (BackSide) ══════════════════════════════════ */}
      <mesh>
        <boxGeometry args={[30, 18, 30]} />
        <meshBasicMaterial color="#f4ede0" side={THREE.BackSide} />
      </mesh>

      {/* ═══ BODEN (3 Sektionen → kein Z-Fighting unter Dusch-Nische) ════ */}
      {/* Links der Nische */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[(roomL + nisLeftX) / 2, floorY, roomCZ]}>
        <planeGeometry args={[nisLeftX - roomL, roomD]} />
        <meshStandardMaterial map={floorTex} roughness={0.07} metalness={0.03} envMapIntensity={0.80} />
      </mesh>
      {/* Rechts der Nische */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[(nisRightX + roomR) / 2, floorY, roomCZ]}>
        <planeGeometry args={[roomR - nisRightX, roomD]} />
        <meshStandardMaterial map={floorTex} roughness={0.07} metalness={0.03} envMapIntensity={0.80} />
      </mesh>
      {/* Mitte vor der Dusche (nisBackZ..roomFZ exkl. Nische) */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[(nisLeftX + nisRightX) / 2, floorY, roomFZ / 2]}>
        <planeGeometry args={[nisRightX - nisLeftX, roomFZ]} />
        <meshStandardMaterial map={floorTex} roughness={0.07} metalness={0.03} envMapIntensity={0.80} />
      </mesh>
      {/* AO-Schatten an Wand-Boden-Übergängen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roomCX, floorY + 0.002, nisBackZ + 0.060]}>
        <planeGeometry args={[roomW, 0.120]} />
        <meshBasicMaterial color="#0a0704" transparent opacity={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roomR - 0.060, floorY + 0.002, roomCZ]}>
        <planeGeometry args={[0.120, roomD]} />
        <meshBasicMaterial color="#0a0704" transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roomL + 0.060, floorY + 0.002, roomCZ]}>
        <planeGeometry args={[0.120, roomD]} />
        <meshBasicMaterial color="#0a0704" transparent opacity={0.15} />
      </mesh>

      {/* ═══ RÜCKWAND (Carrara-Marmor) ══════════════════════════════════ */}
      <mesh receiveShadow position={[(roomL + nisLeftX) / 2, wallMY, nisBackZ]}>
        <planeGeometry args={[nisLeftX - roomL, wallH]} />
        <meshStandardMaterial {...M_WALL} />
      </mesh>
      <mesh receiveShadow position={[(nisRightX + roomR) / 2, wallMY, nisBackZ]}>
        <planeGeometry args={[roomR - nisRightX, wallH]} />
        <meshStandardMaterial {...M_WALL} />
      </mesh>
      <mesh receiveShadow position={[(nisLeftX + nisRightX) / 2, (ceilY + 0) / 2, nisBackZ]}>
        <planeGeometry args={[nisRightX - nisLeftX, ceilY]} />
        <meshStandardMaterial {...M_WALL} />
      </mesh>

      {/* ═══ RECHTE WAND (Marmor) ═══════════════════════════════════════ */}
      <mesh receiveShadow rotation={[0, -Math.PI / 2, 0]} position={[roomR, wallMY, roomCZ]}>
        <planeGeometry args={[roomD, wallH]} />
        <meshStandardMaterial {...M_WALL} />
      </mesh>

      {/* ═══ LINKE WAND (Marmor) ════════════════════════════════════════ */}
      <mesh receiveShadow rotation={[0, Math.PI / 2, 0]} position={[roomL, wallMY, roomCZ]}>
        <planeGeometry args={[roomD, wallH]} />
        <meshStandardMaterial {...M_WALL} />
      </mesh>

      {/* ═══ DECKE ══════════════════════════════════════════════════════ */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[roomCX, ceilY, roomCZ]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.92} metalness={0.0} />
      </mesh>

      {/* ═══ DADO-RAIL (horizontale Marmorleiste, ~0.90m Höhe) ══════════ */}
      {/* Rückwand links */}
      <mesh position={[(roomL + nisLeftX) / 2, floorY + 0.895, nisBackZ + 0.007]}>
        <boxGeometry args={[nisLeftX - roomL, 0.028, 0.014]} />
        <meshStandardMaterial {...M_WALL} roughness={0.08} metalness={0.04} />
      </mesh>
      {/* Rückwand rechts */}
      <mesh position={[(nisRightX + roomR) / 2, floorY + 0.895, nisBackZ + 0.007]}>
        <boxGeometry args={[roomR - nisRightX, 0.028, 0.014]} />
        <meshStandardMaterial {...M_WALL} roughness={0.08} metalness={0.04} />
      </mesh>
      {/* Rechte Wand */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[roomR - 0.007, floorY + 0.895, roomCZ]}>
        <boxGeometry args={[roomD, 0.028, 0.014]} />
        <meshStandardMaterial {...M_WALL} roughness={0.08} metalness={0.04} />
      </mesh>
      {/* Linke Wand */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[roomL + 0.007, floorY + 0.895, roomCZ]}>
        <boxGeometry args={[roomD, 0.028, 0.014]} />
        <meshStandardMaterial {...M_WALL} roughness={0.08} metalness={0.04} />
      </mesh>

      {/* ═══ SOCKELLEISTEN ══════════════════════════════════════════════ */}
      {[
        [roomR - skT / 2, roomCZ, [skT, skH, roomD], 0],
        [roomL + skT / 2, roomCZ, [skT, skH, roomD], 0],
        [(nisRightX + roomR) / 2, nisBackZ + skT / 2, [roomR - nisRightX, skH, skT], 0],
        [(roomL + nisLeftX) / 2, nisBackZ + skT / 2, [nisLeftX - roomL, skH, skT], 0],
      ].map(([x, z, size, _], i) => (
        <mesh key={i} receiveShadow position={[x, skY, z]}>
          <boxGeometry args={size} />
          <meshStandardMaterial color="#e6e2dc" roughness={0.40} metalness={0.05} />
        </mesh>
      ))}

      {/* ═══ FENSTER RECHTS ═════════════════════════════════════════════ */}
      {/* Laibung */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[roomR - 0.115, winY, winZ]}>
        <planeGeometry args={[winW + 0.18, winH + 0.18]} />
        <meshStandardMaterial color="#d2cec8" roughness={0.88} metalness={0.0} />
      </mesh>
      {/* Glas (Tageslicht-Emission) */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[roomR - 0.128, winY, winZ]}>
        <planeGeometry args={[winW, winH]} />
        <meshStandardMaterial
          color="#e8f0f8" emissive="#c8ddf0" emissiveIntensity={2.80}
          roughness={0.04} metalness={0.0} transparent opacity={0.88}
        />
      </mesh>
      {/* Sprosse vertikal */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[roomR - 0.112, winY, winZ]}>
        <planeGeometry args={[0.028, winH]} />
        <meshStandardMaterial color="#cdc8c0" roughness={0.90} metalness={0.0} />
      </mesh>
      {/* Sprosse horizontal */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[roomR - 0.112, winY + 0.06, winZ]}>
        <planeGeometry args={[winW, 0.028]} />
        <meshStandardMaterial color="#cdc8c0" roughness={0.90} metalness={0.0} />
      </mesh>
      {/* Fensterbank (Naturstein) */}
      <mesh castShadow position={[roomR - 0.106, winY - winH / 2 - 0.019, winZ]}>
        <boxGeometry args={[0.200, 0.036, winW + 0.12]} />
        <meshStandardMaterial map={stoneTex} roughness={0.15} metalness={0.04} envMapIntensity={0.5} />
      </mesh>

      {/* ═══ DECKEN-EINBAU-SPOTS ════════════════════════════════════════ */}
      {[[0.30, -0.40], [nisRightX + 0.55, -0.40], [-0.50, -0.60], [nisRightX + 0.55, 0.80]].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, ceilY - 0.011, z]}>
            <cylinderGeometry args={[0.055, 0.055, 0.018, 20]} />
            <meshStandardMaterial color="#d4d0ca" metalness={0.72} roughness={0.15} />
          </mesh>
          {/* Spot-Reflektor-Ring */}
          <mesh position={[x, ceilY - 0.018, z]}>
            <torusGeometry args={[0.042, 0.006, 8, 24]} />
            <meshStandardMaterial color="#c0bab0" metalness={0.80} roughness={0.12} />
          </mesh>
        </group>
      ))}

      {/* ═══ BODEN-ÜBERGANGSSCHIENE ═════════════════════════════════════ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(nisLeftX + nisRightX) / 2, floorY + 0.003, 0]}>
        <planeGeometry args={[nisRightX - nisLeftX, 0.040]} />
        <meshStandardMaterial color="#b0aca6" roughness={0.08} metalness={0.76} envMapIntensity={1.4} />
      </mesh>

      {/* ═══ WASCHTISCH ═════════════════════════════════════════════════ */}

      {/* AO-Schatten */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[vX, floorY + 0.003, vZ]}>
        <planeGeometry args={[vW + 0.10, vD + 0.08]} />
        <meshBasicMaterial color="#140f08" transparent opacity={0.22} />
      </mesh>

      {/* Unterschrank (Eiche, schwebend) */}
      <mesh castShadow receiveShadow position={[vX, cbY, vZ]}>
        <boxGeometry args={[vW, cbH, vD]} />
        <meshStandardMaterial map={woodTex} roughness={0.48} metalness={0.0} envMapIntensity={0.15} />
      </mesh>
      {/* Schranktür-Paneele (sichtbare Holzfräsung) */}
      {[-0.175, 0.175].map((dx, i) => (
        <mesh key={i} position={[vX + dx * 0.82, cbY, vZ + vD / 2 + 0.007]}>
          <boxGeometry args={[0.268, cbH * 0.82, 0.006]} />
          <meshStandardMaterial map={woodTex} roughness={0.42} metalness={0.0} />
        </mesh>
      ))}
      {/* Messing-Griffe (D-Form) */}
      {[-0.175, 0.175].map((dx, i) => (
        <mesh key={i} castShadow rotation={[0, 0, Math.PI / 2]} position={[vX + dx * 0.82, cbY, vZ + vD / 2 + 0.028]}>
          <cylinderGeometry args={[0.006, 0.006, 0.064, 12]} />
          <meshStandardMaterial {...M_BRASS} />
        </mesh>
      ))}
      {/* Untere Metallleiste */}
      <mesh position={[vX, cbB - 0.009, vZ]}>
        <boxGeometry args={[vW + 0.006, 0.015, vD + 0.006]} />
        <meshStandardMaterial color="#b8b4aa" roughness={0.24} metalness={0.08} />
      </mesh>

      {/* Waschtischplatte (Naturstein, leicht überstehend) */}
      <mesh castShadow position={[vX, ctY - 0.016, vZ]}>
        <boxGeometry args={[vW + 0.024, 0.032, vD + 0.024]} />
        <meshStandardMaterial map={stoneTex} roughness={0.10} metalness={0.04} envMapIntensity={0.60} />
      </mesh>

      {/* Aufsatzbecken (Lathe-Geometrie, organisches Vessel-Basin) */}
      <mesh castShadow position={[vX, ctY, vZ - 0.012]}>
        <latheGeometry args={[BASIN_POINTS, 56]} />
        <meshStandardMaterial
          color="#f0ece2"
          roughness={0.12}
          metalness={0.01}
          envMapIntensity={0.40}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Abfluss */}
      <mesh position={[vX, ctY + 0.005, vZ - 0.012]}>
        <cylinderGeometry args={[0.016, 0.016, 0.003, 20]} />
        <meshStandardMaterial color="#585450" metalness={0.82} roughness={0.22} />
      </mesh>

      {/* Wasserfall-Armatur (modern, schlank) */}
      {/* Sockelplatte */}
      <mesh position={[vX, ctY + 0.004, vZ - 0.148]}>
        <boxGeometry args={[0.050, 0.008, 0.032]} />
        <meshStandardMaterial {...M_CHR} />
      </mesh>
      {/* Säule */}
      <mesh position={[vX, ctY + 0.086, vZ - 0.146]}>
        <boxGeometry args={[0.013, 0.158, 0.013]} />
        <meshStandardMaterial {...M_CHR} />
      </mesh>
      {/* Auslauf-Blatt */}
      <mesh position={[vX, ctY + 0.162, vZ - 0.108]}>
        <boxGeometry args={[0.015, 0.009, 0.082]} />
        <meshStandardMaterial {...M_CHR} />
      </mesh>
      {/* Auslauf-Kante (Wasserfall-Lippe) */}
      <mesh position={[vX, ctY + 0.160, vZ - 0.068]}>
        <boxGeometry args={[0.013, 0.007, 0.007]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.92} roughness={0.04} envMapIntensity={1.8} />
      </mesh>

      {/* ═══ SPIEGEL MIT MESSING-RAHMEN UND LED-HINTERLEUCHTUNG ════════ */}
      {/* LED-Halo (leuchtendes Glühen hinter Rahmen) */}
      <mesh position={[vX, mCY, nisBackZ + 0.004]}>
        <boxGeometry args={[vW + 0.060, mH + 0.100, 0.006]} />
        <meshStandardMaterial
          color="#ffc060" emissive="#ff9020" emissiveIntensity={1.60}
          roughness={0.9} metalness={0.0}
        />
      </mesh>
      {/* Messing-Rahmen */}
      <mesh position={[vX, mCY, nisBackZ + 0.022]}>
        <boxGeometry args={[vW + 0.028, mH + 0.068, 0.026]} />
        <meshStandardMaterial {...M_BRASS} />
      </mesh>
      {/* Spiegelfläche (ultra-poliert) */}
      <mesh position={[vX, mCY, nisBackZ + 0.042]}>
        <boxGeometry args={[vW - 0.040, mH - 0.010, 0.004]} />
        <meshStandardMaterial color="#cce2ea" roughness={0.01} metalness={1.0} envMapIntensity={3.5} />
      </mesh>

      {/* ═══ ACCESSOIRES ════════════════════════════════════════════════ */}
      {/* Naturstein-Ablage */}
      <mesh castShadow position={[vX + 0.185, ctY + 0.004, vZ - 0.014]}>
        <boxGeometry args={[0.200, 0.008, 0.110]} />
        <meshStandardMaterial color="#aca498" roughness={0.52} metalness={0.02} />
      </mesh>
      {/* Seifenspender (Milchglas mit Messing-Pumpe) */}
      <mesh castShadow position={[vX + 0.140, ctY + 0.080, vZ - 0.012]}>
        <cylinderGeometry args={[0.025, 0.032, 0.162, 18]} />
        <meshStandardMaterial color="#eeeae0" roughness={0.22} metalness={0.0} transparent opacity={0.80} />
      </mesh>
      <mesh position={[vX + 0.140, ctY + 0.172, vZ - 0.012]}>
        <cylinderGeometry args={[0.007, 0.007, 0.026, 10]} />
        <meshStandardMaterial {...M_BRASS} />
      </mesh>
      {/* Schlanker Glas-Flakon */}
      <mesh castShadow position={[vX + 0.212, ctY + 0.068, vZ - 0.012]}>
        <cylinderGeometry args={[0.017, 0.021, 0.136, 16]} />
        <meshStandardMaterial color="#dcd4c0" roughness={0.16} metalness={0.0} transparent opacity={0.86} />
      </mesh>
      {/* Runder Bernstein-Flakon */}
      <mesh castShadow position={[vX + 0.255, ctY + 0.044, vZ - 0.012]}>
        <cylinderGeometry args={[0.022, 0.022, 0.088, 16]} />
        <meshStandardMaterial color="#b87820" roughness={0.12} metalness={0.0} transparent opacity={0.72} />
      </mesh>

      {/* Kerzen (links neben Spiegel) */}
      {[
        [vX - 0.310, ctY - 0.004, vZ + 0.060, 0.022, 0.058, '#f4f0e0'],
        [vX - 0.255, ctY + 0.025, vZ + 0.024, 0.030, 0.110, '#f0ece4'],
        [vX - 0.192, ctY + 0.010, vZ + 0.042, 0.018, 0.074, '#ece8de'],
      ].map(([x, y, z, r, ch, col], i) => (
        <group key={i}>
          <mesh castShadow position={[x, y + ch / 2, z]}>
            <cylinderGeometry args={[r, r * 0.97, ch, 16]} />
            <meshStandardMaterial color={col} roughness={0.88} metalness={0.0} />
          </mesh>
          {/* Docht */}
          <mesh position={[x, y + ch + 0.008, z]}>
            <cylinderGeometry args={[0.003, 0.003, 0.016, 6]} />
            <meshStandardMaterial color="#2c1a08" roughness={0.90} />
          </mesh>
          {/* Flamme */}
          <mesh position={[x, y + ch + 0.018, z]}>
            <sphereGeometry args={[0.009, 8, 5]} />
            <meshStandardMaterial
              color="#ffcc40" emissive="#ff7000" emissiveIntensity={4.0}
              roughness={0.0} metalness={0.0} transparent opacity={0.92}
            />
          </mesh>
        </group>
      ))}

      {/* ═══ HANDTUCHHALTER + HANDTÜCHER ════════════════════════════════ */}
      {[railZ - 0.33, railZ + 0.33].map((z, i) => (
        <mesh key={i} castShadow position={[roomR - 0.040, railY, z]}>
          <boxGeometry args={[0.080, 0.018, 0.014]} />
          <meshStandardMaterial {...M_BRASS} />
        </mesh>
      ))}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[roomR - 0.090, railY, railZ]}>
        <cylinderGeometry args={[0.010, 0.010, 0.660, 14]} />
        <meshStandardMaterial {...M_BRASS} />
      </mesh>
      {/* Gefaltetes Handtuch */}
      <mesh castShadow position={[roomR - 0.090, railY - 0.007, railZ]}>
        <boxGeometry args={[0.026, 0.032, 0.520]} />
        <meshStandardMaterial color="#e2d8c4" roughness={0.90} metalness={0.0} />
      </mesh>
      <mesh castShadow position={[roomR - 0.090, railY - 0.280, railZ]}>
        <boxGeometry args={[0.012, 0.520, 0.510]} />
        <meshStandardMaterial color="#e2d8c4" roughness={0.88} metalness={0.0} />
      </mesh>
      {/* Zweiter Handtuchring unten (Messing) */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[roomR - 0.060, floorY + 0.62, 0.45]}>
        <torusGeometry args={[0.075, 0.009, 10, 28]} />
        <meshStandardMaterial {...M_BRASS} />
      </mesh>
      {/* Kleines Handtuch daran */}
      <mesh castShadow position={[roomR - 0.060, floorY + 0.52, 0.45]}>
        <boxGeometry args={[0.008, 0.360, 0.120]} />
        <meshStandardMaterial color="#d8d0bc" roughness={0.88} metalness={0.0} />
      </mesh>

      {/* ═══ ZIMMERPFLANZE RECHTS (nahe Fenster) ═══════════════════════ */}
      <BathroomPlant position={[roomR - 0.230, floorY, winZ + 0.850]} scale={1.02} />

      {/* ═══ LINKES FENSTER ═════════════════════════════════════════════ */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[roomL + 0.115, leftWinY, leftWinZ]}>
        <planeGeometry args={[leftWinW + 0.16, leftWinH + 0.16]} />
        <meshStandardMaterial color="#ccc8c0" roughness={0.88} metalness={0.0} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[roomL + 0.128, leftWinY, leftWinZ]}>
        <planeGeometry args={[leftWinW, leftWinH]} />
        <meshStandardMaterial
          color="#ebf4fa" emissive="#b8d8f0" emissiveIntensity={2.00}
          roughness={0.04} metalness={0.0} transparent opacity={0.86}
        />
      </mesh>
      <mesh castShadow position={[roomL + 0.106, leftWinY - leftWinH / 2 - 0.018, leftWinZ]}>
        <boxGeometry args={[0.188, 0.034, leftWinW + 0.10]} />
        <meshStandardMaterial map={stoneTex} roughness={0.16} metalness={0.04} envMapIntensity={0.45} />
      </mesh>

      {/* ═══ LINKE SEITE — PFLANZEN, HOCKER, LEITER ════════════════════ */}

      {/* Großer Topfbaum: hintere linke Ecke */}
      <BathroomPlant position={[roomL + 0.32, floorY, nisBackZ + 0.50]} scale={1.55} />

      {/* Mittlere Pflanze: links neben Dusche — weit genug von Hocker und Leiter */}
      <BathroomPlant position={[nisLeftX - 0.58, floorY, 1.25]} scale={0.90} />

      {/* Mini-Pflanze auf linker Fensterbank */}
      <BathroomPlant
        position={[roomL + 0.128, leftWinY - leftWinH / 2 + 0.022, leftWinZ - 0.08]}
        scale={0.26}
      />

      {/* Spa-Holzhocker — vor der Dusche, frei stehend */}
      <BathStool position={[nisLeftX - 0.45, floorY, 0.55]} />

      {/* AO-Schatten unter Hocker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[nisLeftX - 0.45, floorY + 0.001, 0.55]}>
        <planeGeometry args={[0.42, 0.32]} />
        <meshBasicMaterial color="#0a0704" transparent opacity={0.20} />
      </mesh>

      {/* Dekorative Keramikvase (schlank, hoch, Crème-Weiß) */}
      <mesh castShadow position={[roomL + 0.24, floorY + 0.185, nisBackZ + 0.92]}>
        <cylinderGeometry args={[0.036, 0.058, 0.370, 22]} />
        <meshStandardMaterial color="#f2ede4" roughness={0.22} metalness={0.0} envMapIntensity={0.30} />
      </mesh>
      {/* Vasenhals */}
      <mesh castShadow position={[roomL + 0.24, floorY + 0.385, nisBackZ + 0.92]}>
        <cylinderGeometry args={[0.022, 0.036, 0.038, 22]} />
        <meshStandardMaterial color="#f2ede4" roughness={0.22} metalness={0.0} />
      </mesh>
      {/* Vasenrand */}
      <mesh position={[roomL + 0.24, floorY + 0.406, nisBackZ + 0.92]}>
        <torusGeometry args={[0.022, 0.005, 8, 22]} />
        <meshStandardMaterial color="#e8e3da" roughness={0.18} metalness={0.0} />
      </mesh>
      {/* Trockenblumen-Stängel */}
      {[-0.008, 0, 0.008].map((dx, i) => (
        <mesh key={i} castShadow position={[roomL + 0.24 + dx, floorY + 0.580 + i * 0.030, nisBackZ + 0.92]}>
          <cylinderGeometry args={[0.003, 0.003, 0.36 + i * 0.06, 6]} />
          <meshStandardMaterial color="#b89060" roughness={0.88} metalness={0.0} />
        </mesh>
      ))}
      {/* AO unter Vase */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roomL + 0.24, floorY + 0.001, nisBackZ + 0.92]}>
        <planeGeometry args={[0.14, 0.14]} />
        <meshBasicMaterial color="#0a0704" transparent opacity={0.22} />
      </mesh>

      {/* Holz-Leiter-Handtuchhalter — 0.42m von linker Wand, kein Clipping */}
      <WoodenLadder position={[roomL + 0.42, floorY, 0.74]} />

      {/* Rollen-Handtücher auf kleinem Holztablett (auf dem Boden) */}
      <mesh castShadow position={[nisLeftX - 0.70, floorY + 0.010, 0.30]}>
        <boxGeometry args={[0.260, 0.020, 0.160]} />
        <meshStandardMaterial map={woodTex} roughness={0.52} metalness={0.0} />
      </mesh>
      {[0, 0.080, 0.160].map((dx, i) => (
        <mesh key={i} castShadow
          rotation={[Math.PI / 2, 0, 0]}
          position={[nisLeftX - 0.76 + dx, floorY + 0.068, 0.30]}>
          <cylinderGeometry args={[0.048, 0.048, 0.140, 18]} />
          <meshStandardMaterial
            color={i === 1 ? '#d8d0bc' : '#e2dace'}
            roughness={0.88} metalness={0.0}
          />
        </mesh>
      ))}

    </group>
  );
}
