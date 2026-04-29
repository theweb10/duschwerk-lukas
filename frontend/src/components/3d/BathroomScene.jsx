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
//  PROZEDURALES RAUSCHEN (Value Noise + FBM — keine Sinus-Artefakte)
// ─────────────────────────────────────────────────────────────────────

function _bh(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }
function _bf(t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
function _bvn(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = _bf(x - xi), v = _bf(y - yi);
  return _bh(xi, yi)     * (1-u) * (1-v)
       + _bh(xi+1, yi)   * u     * (1-v)
       + _bh(xi, yi+1)   * (1-u) * v
       + _bh(xi+1, yi+1) * u     * v;
}
function _bfbm(x, y, oct = 6) {
  let s = 0, a = 0.5, f = 1.0, n = 0;
  for (let i = 0; i < oct; i++) { s += _bvn(x*f, y*f)*a; n+=a; a*=0.5; f*=2.07; }
  return s / n;
}
function _bwfbm(x, y) {
  const wx = _bfbm(x,       y,       5) * 3.2;
  const wy = _bfbm(x + 5.2, y + 1.3, 5) * 3.2;
  return _bfbm(x + wx, y + wy, 5);
}

// ─────────────────────────────────────────────────────────────────────
//  TEXTUREN (2048 px, echter Value Noise — kein Zeichentrick-Look)
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
  const cl = v => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;

  // Großformat-Feinsteinzeug 120×60 cm → 2×2 Fliesen pro Textur
  const TW = W / 2, TH = H / 2;
  const GR = 5; // Fuge

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tx = x % TW, ty = y % TH;
      const tileX = (x / TW) | 0, tileY = (y / TH) | 0;
      const isGrout = tx < GR || ty < GR;
      let r, g, b;
      if (isGrout) {
        // Fuge: dunkleres Kühles Grau
        const gn = (_bvn(x * 0.28, y * 0.28) - 0.5) * 7;
        r = cl(128 + gn); g = cl(130 + gn); b = cl(133 + gn);
      } else {
        // Hellgrauer Naturstein — kühl, leicht bläulich-grau
        const gx = x / W * 4.2 + tileX * 1.9;
        const gy = y / H * 3.0 + tileY * 2.5;
        const cloud = (_bfbm(gx * 0.55, gy * 0.55, 5) - 0.5) * 20;
        const mid   = (_bfbm(gx * 2.0,  gy * 2.0,  4) - 0.5) * 9;
        const micro = (_bvn(x * 0.20,   y * 0.20)      - 0.5) * 4;
        const tVar  = (_bh(tileX * 31.4, tileY * 57.9) - 0.5) * 8;
        const base  = 178 + tVar + cloud + mid * 0.55 + micro;
        // Kühler Grau-Blau-Ton (Bardiglio / Vals Quarzit-Stil)
        r = cl(base - 1); g = cl(base + 1); b = cl(base + 5);
      }
      const i = (y * W + x) * 4;
      d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3.8, 2.8);
  tex.anisotropy = 16;
  return (_floorTex = tex);
}

// Calacatta Gold — ultra-realistische Steinstruktur mit dramatischen Adern
let _marbleTex = null;
function getMarbleTex() {
  if (_marbleTex) return _marbleTex;
  const W = 1024, H = 512;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;

  // Vein helper: sharp smooth band from FBM value
  function vein(f, thresh, sharpness) {
    const dist = Math.abs(f * 2.0 - 1.0);
    return dist < thresh ? Math.pow(1.0 - dist / thresh, sharpness) : 0.0;
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W * 5.5, ny = y / H * 3.0;

      // ── Basis: polierte Calacatta-Oberfläche ──────────────────────────
      // Großflächige Wolken (typische Grau-Wolken im Calacatta)
      const cloud1 = (_bfbm(nx * 0.38, ny * 0.38, 6) - 0.5) * 38;
      const cloud2 = (_bfbm(nx * 0.85 + 2.1, ny * 0.85 + 1.7, 5) - 0.5) * 18;
      // Mikrokristalline Oberfläche (winzige Körner, typisch polierter Stein)
      const crystal = (_bvn(x * 0.55, y * 0.55) - 0.5) * 4;
      const base = 247.0 + cloud1 + cloud2 * 0.6 + crystal;

      // ── Adern: 3 hierarchische Familien ───────────────────────────────
      // Familie 1: Grosse Bold-Adern (Hauptmerkmal Calacatta)
      const wx1 = _bfbm(nx * 0.7,       ny * 0.7,       5) * 4.5;
      const wy1 = _bfbm(nx * 0.7 + 6.3, ny * 0.7 + 2.1, 5) * 4.5;
      const f1  = _bfbm(nx + wx1, ny + wy1, 5);
      const main1 = vein(f1, 0.38, 2.2) * 0.80 + vein(f1, 0.14, 4.0) * 0.20;

      // Familie 2: Mittlere verzweigte Adern (leicht bläulich-grau)
      const wx2 = _bfbm(nx * 1.5 + 1.1, ny * 1.5 + 3.3, 5) * 3.0;
      const wy2 = _bfbm(nx * 1.5 + 7.7, ny * 1.5 + 0.9, 5) * 3.0;
      const f2  = _bfbm(nx * 1.6 + wx2, ny * 1.6 + wy2, 5);
      const main2 = vein(f2, 0.28, 2.8);

      // Familie 3: Feine Kapillar-Adern (sehr häufig, dünn)
      const f3a = _bfbm(nx * 3.8 + 2.7, ny * 3.8 + 0.8, 4);
      const f3b = _bfbm(nx * 4.2 + 5.1, ny * 4.2 + 3.4, 4);
      const cap = vein(f3a, 0.18, 3.5) * 0.55 + vein(f3b, 0.15, 3.0) * 0.45;

      // ── Gold-Mineral (warme okker-goldene Einschlüsse) ──────────────
      const gf1 = _bfbm(nx * 2.0 + 9.1, ny * 2.0 + 5.6, 4);
      const gf2 = _bfbm(nx * 1.2 + 3.4, ny * 1.2 + 8.2, 4);
      const gold = Math.max(0, gf1 - 0.64) * Math.max(0, gf2 - 0.58) * 280;

      // ── Farbmischung ──────────────────────────────────────────────────
      // Adern: Hauptadern dunkelgrau-anthrazit, feine Adern mittleres Grau
      const veinDark  = main1 * 112 + main2 * 55;  // dunkle Hauptadern
      const veinMid   = main2 * 28  + cap * 32;    // graue Nebenanteile
      // Blaustich in den grauen Adern (charakteristisch für echten Marmor)
      const blueShift = (main1 * 0.4 + main2 * 0.6) * 14;

      const i = (y * W + x) * 4;
      d[i]   = cl(base - veinDark       + gold * 1.1);
      d[i+1] = cl(base - veinDark * 0.9 - veinMid * 0.3 + gold * 0.55);
      d[i+2] = cl(base - veinDark * 0.6 - veinMid * 0.6 + blueShift - gold * 0.4 - 10);
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.9, 0.65);
  tex.anisotropy = 16;
  return (_marbleTex = tex);
}

// Nussbaum-Holz — radiale Jahresringe vom virtuellen Baumkern, realistische Maserung
let _woodTex = null;
function getWoodTex() {
  if (_woodTex) return _woodTex;
  const W = 1024, H = 512;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;

  // Virtuelles Baumsegment: Schnitt durch einen Nussbaum-Stamm
  // Baumkern liegt weit unterhalb des Bretts → elliptische Jahresringe
  const CX = W * 0.48, CY = H * 4.8; // Kernmittelpunkt weit ausserhalb
  const RING_FREQ = 0.026;            // Ringabstand (px → ring-Wert)

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Radiale Distanz zum virtuellen Baumkern (elliptisch → natürlichere Ringe)
      const dx = (x - CX) / W * 1.0;
      const dy = (y - CY) / H * 2.6;
      const r  = Math.sqrt(dx * dx + dy * dy);

      // Domain-Warp: leichte organische Biegung der Jahresringe
      const wx = _bfbm(x / W * 2.2, y / H * 1.1, 4) * 0.035;
      const wy = _bfbm(x / W * 1.8 + 5, y / H * 0.9 + 3, 4) * 0.020;
      const rw = Math.sqrt((dx + wx) * (dx + wx) + (dy + wy) * (dy + wy));

      // Jahresringe: sanfte Sinus-ähnliche Variation aus der Ringdistanz
      // fract(r * freq) erzeugt periodische Bänder — genau wie echte Jahresringe
      const ringPhase = (rw * RING_FREQ) % 1.0;
      const ringVal   = 0.5 - 0.5 * Math.cos(ringPhase * Math.PI * 2);

      // Frühholz (hell) vs. Spätholz (dunkel) — asymmetrisch wie echtes Holz
      const ring = ringPhase < 0.55 ? ringVal / 0.55 : (1 - ringVal) / 0.45;

      // Holzfasern: fein, entlang der Maserung (geringe Y-Frequenz, hohe X-Frequenz)
      const grain = _bfbm(x / W * 12.0, y / H * 1.6 + wx * 4, 5);

      // Knoten: seltene lokale Anomalien
      const kn1 = _bfbm(x / W * 8.0 + 0.5, y / H * 8.0 + 1.3, 3);
      const kn2 = _bfbm(x / W * 7.0 + 3.1, y / H * 7.0 + 4.7, 3);
      const knot = Math.max(0, (kn1 - 0.62) / 0.38) * Math.max(0, (kn2 - 0.62) / 0.38) * 0.55;

      // Mikro-Politur: sehr feines Rauschen
      const micro = (_bvn(x * 0.18, y * 0.18) - 0.5) * 0.06;

      // Kombinieren: Jahresringe dominieren, Fasern fügen Textur hinzu
      const v = ring * 0.58 + grain * 0.26 + knot * 0.12 + micro + 0.04;

      // Nussbaum-Palette: warmes Schokoladenbraun (Frühholz hell, Spätholz dunkel)
      // Basis-Frühholz: #c8904c  Basis-Spätholz: #4a2410
      const i = (y * W + x) * 4;
      d[i]   = cl(74  + v * 130); // R: 74..204
      d[i+1] = cl(36  + v *  88); // G: 36..124
      d[i+2] = cl(16  + v *  36); // B: 16..52
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.2, 0.8);
  tex.anisotropy = 16;
  return (_woodTex = tex);
}

// Naturstein-Arbeitsplatte (Quarzit, poliert) — FBM, kein Sinus-Muster
let _stoneTex = null;
function getStoneTex() {
  if (_stoneTex) return _stoneTex;
  const W = 512, H = 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W * 3.8, ny = y / H * 2.2;
      const wf   = _bwfbm(nx * 0.75, ny * 0.75);
      const fine  = _bfbm(nx * 3.5, ny * 3.5, 5);
      const micro = (_bvn(x * 0.55, y * 0.55) - 0.5) * 4;
      const base  = 214 + (wf - 0.5) * 28 + (fine - 0.5) * 14 + micro;
      const i = (y * W + x) * 4;
      d[i]   = cl(base + 5);
      d[i+1] = cl(base + 2);
      d[i+2] = cl(base - 5);
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.0, 0.6);
  tex.anisotropy = 16;
  return (_stoneTex = tex);
}

// Teppich — geometrisches Luxus-Muster mit Rahmen und Webstruktur
let _rugTex = null;
function getRugTex() {
  if (_rugTex) return _rugTex;
  const W = 512, H = 320;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // Hintergrund: warmes Elfenbein
  ctx.fillStyle = '#c8bfa8';
  ctx.fillRect(0, 0, W, H);

  // Webstruktur (subtiles Rauschen über alles)
  const img = ctx.createImageData(W, H);
  const d = img.data;
  // Erst Basis-Pixel lesen und Webtextur überlagern
  const id = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const weave = (_bvn(x * 0.9, y * 0.9) - 0.5) * 14
                  + (_bvn(x * 3.2, y * 3.2) - 0.5) * 6;
      const idx = (y * W + x) * 4;
      id.data[idx]   = Math.min(255, Math.max(0, id.data[idx]   + weave));
      id.data[idx+1] = Math.min(255, Math.max(0, id.data[idx+1] + weave));
      id.data[idx+2] = Math.min(255, Math.max(0, id.data[idx+2] + weave * 0.7));
    }
  }
  ctx.putImageData(id, 0, 0);

  // Äußerer Rahmen (dunkelgrau)
  const BW = 28; // Breite Außenrahmen
  ctx.fillStyle = '#3a3530';
  ctx.fillRect(0, 0, W, BW);
  ctx.fillRect(0, H - BW, W, BW);
  ctx.fillRect(0, 0, BW, H);
  ctx.fillRect(W - BW, 0, BW, H);

  // Innerer dünner Rahmen (Gold-Taupe)
  const IB = BW + 6;
  ctx.strokeStyle = '#9a8e74';
  ctx.lineWidth = 3;
  ctx.strokeRect(IB, IB, W - IB * 2, H - IB * 2);

  // Zweiter innerer Rahmen (dünn)
  ctx.strokeStyle = '#7a6e58';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(IB + 8, IB + 8, W - (IB + 8) * 2, H - (IB + 8) * 2);

  // Mittiges Rauten-Motiv
  const cx = W / 2, cy = H / 2;
  const rw = 60, rh = 40;
  ctx.strokeStyle = '#6a6050';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - rh); ctx.lineTo(cx + rw, cy);
  ctx.lineTo(cx, cy + rh); ctx.lineTo(cx - rw, cy);
  ctx.closePath(); ctx.stroke();
  // Innere Raute
  ctx.beginPath();
  ctx.moveTo(cx, cy - rh * 0.5); ctx.lineTo(cx + rw * 0.5, cy);
  ctx.lineTo(cx, cy + rh * 0.5); ctx.lineTo(cx - rw * 0.5, cy);
  ctx.closePath(); ctx.stroke();
  // Mittel-Punkt
  ctx.fillStyle = '#7a6e58';
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();

  // Eck-Ornamente
  [[BW+14, BW+14], [W-BW-14, BW+14], [BW+14, H-BW-14], [W-BW-14, H-BW-14]].forEach(([ex, ey]) => {
    ctx.strokeStyle = '#7a6e58'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
  });

  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = 16;
  return (_rugTex = tex);
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
        <meshStandardMaterial color="#6e6c6a" roughness={0.78} metalness={0.02} />
      </mesh>
      <mesh position={[0, -POT_H * 0.5 + 0.004 * scale, 0]}>
        <cylinderGeometry args={[SAU_R * 0.74, SAU_R * 0.74, 0.003 * scale, 24]} />
        <meshStandardMaterial color="#1a1816" roughness={0.94} metalness={0.0} />
      </mesh>

      {/* Topf (modernes Beton-Grau mit leichtem Zementcharakter) */}
      <mesh castShadow>
        <cylinderGeometry args={[POT_R, POT_R * 0.74, POT_H, 32]} />
        <meshStandardMaterial color="#8a8880" roughness={0.82} metalness={0.02} />
      </mesh>
      {/* Rand-Wulst */}
      <mesh position={[0, topY - 0.004 * scale, 0]}>
        <torusGeometry args={[POT_R * 0.96, 0.010 * scale, 10, 36]} />
        <meshStandardMaterial color="#767472" roughness={0.78} metalness={0.02} />
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
//  SPA-HOCKER  (Naturstein-Sitzfläche, gebürstete Chrom-Beine)
//  → Luxus-Spa-Stil à la Dornbracht / Agape
// ─────────────────────────────────────────────────────────────────────
function BathStool({ position }) {
  const legH = 0.44;
  // Dunkel polierter Nero-Marquina-Stein für die Sitzfläche
  const STONE = { color: '#2a2826', roughness: 0.08, metalness: 0.04, envMapIntensity: 0.80 };
  // Gebürsteter Chrom für die Beine
  const LEG_M = { color: '#c8c6c4', metalness: 0.94, roughness: 0.08, envMapIntensity: 2.0 };

  return (
    <group position={position}>
      {/* Steinplatte Sitzfläche */}
      <mesh castShadow position={[0, legH + 0.022, 0]}>
        <boxGeometry args={[0.38, 0.038, 0.26]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      {/* Polierte Kante vorne */}
      <mesh position={[0, legH + 0.036, 0.128]}>
        <cylinderGeometry args={[0.009, 0.009, 0.374, 14]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial {...STONE} />
      </mesh>
      {/* Quersteg aus Chrom */}
      <mesh castShadow position={[0, legH * 0.38, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.280, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial {...LEG_M} />
      </mesh>
      {/* 4 schlanke Chrom-Beine */}
      {[[-0.155, -0.100], [0.155, -0.100], [-0.155, 0.100], [0.155, 0.100]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, legH / 2, z]}
          rotation={[z * 0.08, 0, x * 0.06]}>
          <cylinderGeometry args={[0.010, 0.008, legH, 14]} />
          <meshStandardMaterial {...LEG_M} />
        </mesh>
      ))}
      {/* Gummifüße */}
      {[[-0.155, -0.100], [0.155, -0.100], [-0.155, 0.100], [0.155, 0.100]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.006, z]}>
          <cylinderGeometry args={[0.012, 0.012, 0.012, 10]} />
          <meshStandardMaterial color="#1a1818" roughness={0.92} metalness={0.0} />
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
//  FREISTEHENDE LUXUS-BADEWANNE — organisch gerundete Form
//  Rounded-Rectangle-Technik: Zwei überlagernde Boxen + 4 Ecken-Zylinder
//  → perfektes Oval-Rechteck-Profil wie echte Designerwannen
// ─────────────────────────────────────────────────────────────────────
function LuxuryBathtub({ position }) {
  const TL = 1.72, TW = 0.76, TH = 0.58;
  const CR  = 0.052;  // Eckenradius
  const WT  = 0.054;  // Wandstärke
  const FH  = 0.066;  // Fusshöhe
  const RO  = 0.022;  // Rand-Überhang
  const RH  = 0.018;  // Rand-Höhe
  const topY = FH + TH;

  // Materialien — Guss-Acryl, hochglanz
  const RM  = { color: '#f2f0ec', roughness: 0.07, metalness: 0.0, envMapIntensity: 0.52 };
  const INN = { color: '#e8e6e0', roughness: 0.06, metalness: 0.0, envMapIntensity: 0.38 };
  const RIM_M = { color: '#f9f8f5', roughness: 0.015, metalness: 0.01, envMapIntensity: 0.92 };
  const CM  = { color: '#d0d0d0', metalness: 0.97, roughness: 0.04, envMapIntensity: 2.8 };

  const corners = [
    [-TW/2+CR, -TL/2+CR], [TW/2-CR, -TL/2+CR],
    [-TW/2+CR,  TL/2-CR], [TW/2-CR,  TL/2-CR],
  ];

  return (
    <group position={position}>

      {/* ── Äußerer Wannenkörper (Rounded Rectangle) ─────────────────── */}
      {/* Zwei überlagernde Boxen */}
      <mesh castShadow position={[0, FH+TH/2, 0]}>
        <boxGeometry args={[TW, TH, TL - CR*2]} />
        <meshStandardMaterial {...RM} />
      </mesh>
      <mesh castShadow position={[0, FH+TH/2, 0]}>
        <boxGeometry args={[TW - CR*2, TH, TL]} />
        <meshStandardMaterial {...RM} />
      </mesh>
      {/* 4 Ecken-Zylinder */}
      {corners.map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, FH+TH/2, z]}>
          <cylinderGeometry args={[CR, CR, TH, 28]} />
          <meshStandardMaterial {...RM} />
        </mesh>
      ))}

      {/* ── Polierter Rand (ebenfalls Rounded Rectangle) ──────────────── */}
      <mesh position={[0, topY+RH/2, 0]}>
        <boxGeometry args={[TW+RO*2, RH, TL-CR*2+RO*2]} />
        <meshStandardMaterial {...RIM_M} />
      </mesh>
      <mesh position={[0, topY+RH/2, 0]}>
        <boxGeometry args={[TW-CR*2+RO*2, RH, TL+RO*2]} />
        <meshStandardMaterial {...RIM_M} />
      </mesh>
      {corners.map(([x, z], i) => (
        <mesh key={i} position={[x, topY+RH/2, z]}>
          <cylinderGeometry args={[CR+RO, CR+RO, RH, 28]} />
          <meshStandardMaterial {...RIM_M} />
        </mesh>
      ))}

      {/* ── Innenbereich (von oben sichtbar) ─────────────────────────── */}
      <mesh position={[0, topY - WT*0.45, 0]}>
        <boxGeometry args={[TW-WT*2, WT+0.004, TL-WT*2-CR*2]} />
        <meshStandardMaterial {...INN} />
      </mesh>
      <mesh position={[0, topY - WT*0.45, 0]}>
        <boxGeometry args={[TW-WT*2-CR*2, WT+0.004, TL-WT*2]} />
        <meshStandardMaterial {...INN} />
      </mesh>
      {/* Wannenboden */}
      <mesh position={[0, FH+WT+0.003, 0]}>
        <boxGeometry args={[TW-WT*2.4, 0.006, TL-WT*2.4-CR*2]} />
        <meshStandardMaterial {...INN} />
      </mesh>
      <mesh position={[0, FH+WT+0.003, 0]}>
        <boxGeometry args={[TW-WT*2.4-CR*2, 0.006, TL-WT*2.4]} />
        <meshStandardMaterial {...INN} />
      </mesh>

      {/* ── 4 Chromfüße (Kugel + Zylinder + Fußplatte) ───────────────── */}
      {corners.map(([x, z], i) => (
        <group key={i} position={[x*0.86, 0, z*0.88]}>
          {/* Kugelgelenk oben */}
          <mesh castShadow position={[0, FH*0.62, 0]}>
            <sphereGeometry args={[0.023, 18, 14]} />
            <meshStandardMaterial {...CM} />
          </mesh>
          {/* Zylindrischer Schaft */}
          <mesh castShadow position={[0, FH*0.26, 0]}>
            <cylinderGeometry args={[0.013, 0.017, FH*0.48, 14]} />
            <meshStandardMaterial {...CM} />
          </mesh>
          {/* Fußplatte */}
          <mesh position={[0, 0.007, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.013, 16]} />
            <meshStandardMaterial {...CM} />
          </mesh>
        </group>
      ))}

      {/* ── Ablauf ────────────────────────────────────────────────────── */}
      <mesh position={[0, FH+WT+0.004, -TL*0.28]}>
        <cylinderGeometry args={[0.021, 0.021, 0.006, 20]} />
        <meshStandardMaterial color="#b8b4b0" metalness={0.95} roughness={0.06} />
      </mesh>
      {/* Ablauf-Ring */}
      <mesh position={[0, FH+WT+0.007, -TL*0.28]}>
        <torusGeometry args={[0.018, 0.003, 8, 20]} />
        <meshStandardMaterial color="#a8a4a0" metalness={0.96} roughness={0.05} />
      </mesh>

      {/* ── Freistehende Wannenarmatur (schlanke Säulenform) ─────────── */}
      <group position={[-TW/2 - 0.16, 0, -TL*0.26]}>
        {/* Bodenplatte */}
        <mesh position={[0, 0.009, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.017, 20]} />
          <meshStandardMaterial {...CM} />
        </mesh>
        {/* Hauptsäule */}
        <mesh position={[0, 0.33, 0]}>
          <cylinderGeometry args={[0.011, 0.013, 0.62, 16]} />
          <meshStandardMaterial {...CM} />
        </mesh>
        {/* Auslaufbogen */}
        <mesh rotation={[0.52, 0, 0]} position={[0, 0.60, 0.092]}>
          <cylinderGeometry args={[0.008, 0.010, 0.22, 12]} />
          <meshStandardMaterial {...CM} />
        </mesh>
        {/* Auslauf-Düse */}
        <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0.61, 0.175]}>
          <cylinderGeometry args={[0.013, 0.013, 0.022, 16]} />
          <meshStandardMaterial {...CM} />
        </mesh>
        {/* Zwei Griffe */}
        {[-0.028, 0.028].map((dz, i) => (
          <group key={i}>
            <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0.31+dz*0.8, 0.024]}>
              <cylinderGeometry args={[0.010, 0.010, 0.020, 12]} />
              <meshStandardMaterial {...CM} />
            </mesh>
            <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0.31+dz*0.8, 0.046]}>
              <cylinderGeometry args={[0.006, 0.008, 0.042, 10]} />
              <meshStandardMaterial {...CM} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── AO-Schatten ───────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[TW+0.26, TL+0.26]} />
        <meshBasicMaterial color="#080604" transparent opacity={0.30} />
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

  // Materialien — Premium-Spa, PBR-korrekt
  const M_WALL = { map: marbleTex, roughness: 0.05, metalness: 0.01, envMapIntensity: 0.72 };
  const M_CHR  = { color: '#d0d0d0', metalness: 0.96, roughness: 0.04, envMapIntensity: 2.4 };
  const M_BRASS= { color: '#9e9c9a', metalness: 0.92, roughness: 0.10, envMapIntensity: 2.2 };
  const M_WOOD = { color: '#1a1816', roughness: 0.04, metalness: 0.04, envMapIntensity: 1.0 };
  const M_STONE= { map: stoneTex, roughness: 0.06, metalness: 0.04, envMapIntensity: 0.90 };

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
        <meshStandardMaterial map={floorTex} roughness={0.06} metalness={0.04} envMapIntensity={0.90} />
      </mesh>
      {/* Rechts der Nische */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[(nisRightX + roomR) / 2, floorY, roomCZ]}>
        <planeGeometry args={[roomR - nisRightX, roomD]} />
        <meshStandardMaterial map={floorTex} roughness={0.06} metalness={0.04} envMapIntensity={0.90} />
      </mesh>
      {/* Mitte vor der Dusche (nisBackZ..roomFZ exkl. Nische) */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[(nisLeftX + nisRightX) / 2, floorY, roomFZ / 2]}>
        <planeGeometry args={[nisRightX - nisLeftX, roomFZ]} />
        <meshStandardMaterial map={floorTex} roughness={0.06} metalness={0.04} envMapIntensity={0.90} />
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
        <meshStandardMaterial color="#f2eee6" roughness={0.90} metalness={0.0} />
      </mesh>
      {/* Cove-Licht: umlaufender LED-Streifen an der Decken-Wand-Kante */}
      {/* Hintere Kante */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[roomCX, ceilY - 0.006, nisBackZ + 0.028]}>
        <planeGeometry args={[roomW, 0.018]} />
        <meshStandardMaterial color="#fff6d8" emissive="#ffe8b0" emissiveIntensity={1.1} roughness={0.9} />
      </mesh>
      {/* Rechte Kante */}
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} position={[roomR - 0.028, ceilY - 0.006, roomCZ]}>
        <planeGeometry args={[roomD, 0.018]} />
        <meshStandardMaterial color="#fff6d8" emissive="#ffe8b0" emissiveIntensity={1.1} roughness={0.9} />
      </mesh>
      {/* Linke Kante */}
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} position={[roomL + 0.028, ceilY - 0.006, roomCZ]}>
        <planeGeometry args={[roomD, 0.018]} />
        <meshStandardMaterial color="#fff6d8" emissive="#ffe8b0" emissiveIntensity={1.1} roughness={0.9} />
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
          color="#e8f0f8" emissive="#c8ddf0" emissiveIntensity={1.40}
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
        <meshStandardMaterial {...M_STONE} />
      </mesh>

      {/* ═══ DECKEN-EINBAU-SPOTS — symmetrisches 2×2-Raster ═══════════ */}
      {[
        [roomCX - 0.88, -0.44],
        [roomCX + 0.88, -0.44],
        [roomCX - 0.88,  1.06],
        [roomCX + 0.88,  1.06],
      ].map(([x, z], i) => (
        <group key={i}>
          {/* Bündig-Einbau: Deckenöffnung (dunkle Aussparung) */}
          <mesh position={[x, ceilY - 0.001, z]}>
            <cylinderGeometry args={[0.048, 0.048, 0.004, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.95} metalness={0.0} />
          </mesh>
          {/* Dünner Alu-Trim-Ring (bündig mit Decke) */}
          <mesh position={[x, ceilY - 0.001, z]}>
            <torusGeometry args={[0.048, 0.003, 8, 28]} />
            <meshStandardMaterial color="#c0bebe" metalness={0.92} roughness={0.06} />
          </mesh>
          {/* Leuchtfläche (emissiv, tief eingelassen) */}
          <mesh position={[x, ceilY - 0.008, z]}>
            <cylinderGeometry args={[0.034, 0.034, 0.002, 20]} />
            <meshStandardMaterial color="#fff8f0" emissive="#ffe8c0" emissiveIntensity={2.2} roughness={0.9} />
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

      {/* Unterschrank (Nussbaum, schwebend) */}
      <mesh castShadow receiveShadow position={[vX, cbY, vZ]}>
        <boxGeometry args={[vW, cbH, vD]} />
        <meshStandardMaterial {...M_WOOD} />
      </mesh>
      {/* Schranktür-Paneele */}
      {[-0.175, 0.175].map((dx, i) => (
        <mesh key={i} position={[vX + dx * 0.82, cbY, vZ + vD / 2 + 0.007]}>
          <boxGeometry args={[0.268, cbH * 0.82, 0.006]} />
          <meshStandardMaterial {...M_WOOD} />
        </mesh>
      ))}
      {/* Messing-Griffe (D-Form) */}
      {[-0.175, 0.175].map((dx, i) => (
        <mesh key={i} castShadow rotation={[0, 0, Math.PI / 2]} position={[vX + dx * 0.82, cbY, vZ + vD / 2 + 0.028]}>
          <cylinderGeometry args={[0.006, 0.006, 0.064, 12]} />
          <meshStandardMaterial {...M_BRASS} />
        </mesh>
      ))}
      {/* LED-Streifen unter Unterschrank (Floating-Cabinet-Effekt) */}
      <mesh position={[vX, cbB - 0.007, vZ]}>
        <boxGeometry args={[vW - 0.060, 0.004, vD - 0.040]} />
        <meshStandardMaterial color="#fff0d0" emissive="#ffcc70" emissiveIntensity={2.2} roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Bodenschatten unter LED-Licht */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[vX, floorY + 0.002, vZ]}>
        <planeGeometry args={[vW + 0.20, vD + 0.16]} />
        <meshBasicMaterial color="#f5e8c0" transparent opacity={0.12} />
      </mesh>

      {/* Untere Metallleiste */}
      <mesh position={[vX, cbB - 0.009, vZ]}>
        <boxGeometry args={[vW + 0.006, 0.015, vD + 0.006]} />
        <meshStandardMaterial color="#b8b4aa" roughness={0.24} metalness={0.08} />
      </mesh>

      {/* Waschtischplatte (Naturstein, poliert) */}
      <mesh castShadow position={[vX, ctY - 0.016, vZ]}>
        <boxGeometry args={[vW + 0.024, 0.032, vD + 0.024]} />
        <meshStandardMaterial {...M_STONE} />
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

      {/* ═══ SPIEGEL — RAHMENLOS, COOL-WHITE LED-HINTERLEUCHTUNG ══════ */}
      {/* Wandplatte hinter Spiegel (leuchtet als diffuser Halo hervor) */}
      <mesh position={[vX, mCY, nisBackZ + 0.001]}>
        <boxGeometry args={[vW + 0.048, mH + 0.048, 0.003]} />
        <meshStandardMaterial
          color="#ddeeff" emissive="#c8e4ff" emissiveIntensity={2.0}
          roughness={0.9} metalness={0.0}
        />
      </mesh>
      {/* Ultradünner Alu-Rahmen (4 mm, kaum sichtbar) */}
      <mesh position={[vX, mCY, nisBackZ + 0.014]}>
        <boxGeometry args={[vW + 0.008, mH + 0.008, 0.010]} />
        <meshStandardMaterial color="#c4c2c0" metalness={0.94} roughness={0.06} envMapIntensity={1.8} />
      </mesh>
      {/* Spiegelfläche (poliert, realistisch gedämpft) */}
      <mesh position={[vX, mCY, nisBackZ + 0.022]}>
        <boxGeometry args={[vW, mH, 0.004]} />
        <meshStandardMaterial color="#d8eaf2" roughness={0.04} metalness={0.88} envMapIntensity={1.6} />
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

      {/* ═══ CHROM-HANDTUCHHEIZKÖRPER (rechte Wand, zwischen Spots) ═══ */}
      {(() => {
        const htrX = roomR - 0.032;
        const htrZ = 0.08;
        const htrBot = floorY + 0.30, htrTop = floorY + 1.18;
        const htrH = htrTop - htrBot;
        const railSpan = 0.42;
        const rails = [htrBot + htrH * 0.08, htrBot + htrH * 0.25, htrBot + htrH * 0.44,
                       htrBot + htrH * 0.63, htrBot + htrH * 0.82, htrBot + htrH * 0.96];
        const MC = { color: '#d8d8d8', metalness: 0.96, roughness: 0.06, envMapIntensity: 2.2 };
        return (
          <group>
            {/* Zwei Vertikalrohre */}
            {[-railSpan / 2, railSpan / 2].map((dz, i) => (
              <mesh key={i} castShadow position={[htrX, htrBot + htrH / 2, htrZ + dz]}>
                <cylinderGeometry args={[0.012, 0.012, htrH, 16]} />
                <meshStandardMaterial {...MC} />
              </mesh>
            ))}
            {/* Horizontalrohre */}
            {rails.map((y, i) => (
              <mesh key={i} castShadow rotation={[0, 0, Math.PI / 2]} position={[htrX, y, htrZ]}>
                <cylinderGeometry args={[0.010, 0.010, railSpan, 14]} />
                <meshStandardMaterial {...MC} />
              </mesh>
            ))}
            {/* Wandhalterungen */}
            {[htrBot + 0.06, htrTop - 0.06].map((y, i) => (
              <mesh key={i} rotation={[0, -Math.PI / 2, 0]} position={[htrX + 0.018, y, htrZ]}>
                <cylinderGeometry args={[0.016, 0.016, 0.022, 12]} />
                <meshStandardMaterial {...MC} />
              </mesh>
            ))}
            {/* Handtuch am Heizkörper */}
            <mesh castShadow position={[htrX - 0.008, htrBot + htrH * 0.52, htrZ]}>
              <boxGeometry args={[0.010, htrH * 0.58, railSpan * 0.86]} />
              <meshStandardMaterial color="#ece6d8" roughness={0.90} metalness={0.0} />
            </mesh>
          </group>
        );
      })()}

      {/* ═══ LUXUS-TEPPICH (Mitte des Raums) ════════════════════════════ */}
      {(() => {
        const rugTex = getRugTex();
        const RW = 1.80, RD = 1.10; // 180×110 cm
        const rugX = roomCX - 0.10, rugZ = 0.72;
        return (
          <group>
            {/* Teppich-Körper (leicht erhöht, Dicke 8mm) */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[rugX, floorY + 0.005, rugZ]}>
              <planeGeometry args={[RW, RD]} />
              <meshStandardMaterial map={rugTex} roughness={0.96} metalness={0.0} envMapIntensity={0.10} />
            </mesh>
            {/* Fransen links */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[rugX, floorY + 0.003, rugZ - RD / 2 - 0.020]}>
              <planeGeometry args={[RW, 0.038]} />
              <meshStandardMaterial color="#b0a890" roughness={0.98} metalness={0.0} />
            </mesh>
            {/* Fransen rechts */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[rugX, floorY + 0.003, rugZ + RD / 2 + 0.020]}>
              <planeGeometry args={[RW, 0.038]} />
              <meshStandardMaterial color="#b0a890" roughness={0.98} metalness={0.0} />
            </mesh>
            {/* AO-Schatten unter Teppich */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[rugX, floorY + 0.001, rugZ]}>
              <planeGeometry args={[RW + 0.06, RD + 0.08]} />
              <meshBasicMaterial color="#080604" transparent opacity={0.14} />
            </mesh>
          </group>
        );
      })()}

      {/* ═══ BADEMATTE vor der Dusche ════════════════════════════════════ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.004, 0.80]}>
        <planeGeometry args={[0.68, 0.44]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.98} metalness={0.0} />
      </mesh>
      {/* Fransen-Kante vorne */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.003, 1.02]}>
        <planeGeometry args={[0.68, 0.016]} />
        <meshStandardMaterial color="#ccc6b8" roughness={0.99} metalness={0.0} />
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
          color="#ebf4fa" emissive="#b8d8f0" emissiveIntensity={1.10}
          roughness={0.04} metalness={0.0} transparent opacity={0.86}
        />
      </mesh>
      <mesh castShadow position={[roomL + 0.106, leftWinY - leftWinH / 2 - 0.018, leftWinZ]}>
        <boxGeometry args={[0.188, 0.034, leftWinW + 0.10]} />
        <meshStandardMaterial {...M_STONE} />
      </mesh>

      {/* ═══ LINKE SEITE — PFLANZEN, HOCKER, LEITER ════════════════════ */}

      {/* ═══ FREISTEHENDE LUXUS-BADEWANNE (linke Seite) ════════════════ */}
      <LuxuryBathtub position={[roomL + 0.62, floorY, 0.55]} />

      {/* ═══ PFLANZEN ═══════════════════════════════════════════════════ */}
      {/* Großer Topfbaum: hintere linke Ecke (hinter Badewanne) */}
      <BathroomPlant position={[roomL + 0.26, floorY, nisBackZ + 0.38]} scale={1.55} />

      {/* Mittelgroße Pflanze: rechts neben Badewanne */}
      <BathroomPlant position={[roomL + 1.42, floorY, 1.25]} scale={0.90} />

      {/* Mini-Pflanze auf linker Fensterbank */}
      <BathroomPlant
        position={[roomL + 0.128, leftWinY - leftWinH / 2 + 0.022, leftWinZ - 0.08]}
        scale={0.26}
      />

      {/* ═══ SPA-HOCKER neben Badewanne ══════════════════════════════════ */}
      <BathStool position={[roomL + 0.50, floorY, 1.55]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roomL + 0.50, floorY + 0.001, 1.55]}>
        <planeGeometry args={[0.42, 0.32]} />
        <meshBasicMaterial color="#0a0704" transparent opacity={0.18} />
      </mesh>

      {/* ═══ DEKO-VASE neben Hocker (sicher außerhalb Dusche) ═══════════ */}
      <mesh castShadow position={[roomL + 0.82, floorY + 0.220, 1.55]}>
        <cylinderGeometry args={[0.030, 0.052, 0.440, 24]} />
        <meshStandardMaterial color="#f0ede6" roughness={0.12} metalness={0} envMapIntensity={0.50} />
      </mesh>
      <mesh castShadow position={[roomL + 0.82, floorY + 0.448, 1.55]}>
        <cylinderGeometry args={[0.018, 0.030, 0.040, 20]} />
        <meshStandardMaterial color="#f0ede6" roughness={0.12} metalness={0} />
      </mesh>
      {[-0.008, 0, 0.010].map((dx, i) => (
        <mesh key={i} castShadow position={[roomL + 0.82 + dx, floorY + 0.640 + i * 0.035, 1.55]}>
          <cylinderGeometry args={[0.003, 0.003, 0.38 + i * 0.06, 6]} />
          <meshStandardMaterial color="#b89060" roughness={0.88} metalness={0.0} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roomL + 0.82, floorY + 0.001, 1.55]}>
        <planeGeometry args={[0.14, 0.14]} />
        <meshBasicMaterial color="#0a0704" transparent opacity={0.20} />
      </mesh>

      {/* ═══ HANDTUCH-TABLETT neben Dusche ═══════════════════════════════ */}
      <mesh castShadow position={[nisLeftX - 0.55, floorY + 0.010, 0.28]}>
        <boxGeometry args={[0.240, 0.018, 0.150]} />
        <meshStandardMaterial {...M_WOOD} />
      </mesh>
      {[0, 0.075, 0.150].map((dx, i) => (
        <mesh key={i} castShadow
          rotation={[Math.PI / 2, 0, 0]}
          position={[nisLeftX - 0.61 + dx, floorY + 0.064, 0.28]}>
          <cylinderGeometry args={[0.044, 0.044, 0.130, 18]} />
          <meshStandardMaterial color={i === 1 ? '#d8d0bc' : '#e2dace'} roughness={0.86} metalness={0.0} />
        </mesh>
      ))}

    </group>
  );
}
