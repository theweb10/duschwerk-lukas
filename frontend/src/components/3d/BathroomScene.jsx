import * as THREE from 'three';

// ── Konstanten passend zu ShowerModel ────────────────────────
const SHOWER_D  = 0.90;
const SHOWER_WT = 0.14;

// ── Bodenfliesen-Textur (60×60 cm, warmer Naturstein) ────────
let _floorTex = null;
function getFloorTex() {
  if (_floorTex) return _floorTex;
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
      // 2×2 Fliesen (60×60 cm Großformat)
      const fx = nx % 0.50, fy = ny % 0.50;
      const gPx = 3.5 / W;
      const isGrout = fx < gPx || fy < gPx;
      // Naturstein-Maserung
      const grain =
        Math.sin(nx * 53 + ny * 89)  * 5.0 +
        Math.sin(nx * 137 - ny * 107) * 3.0 +
        Math.sin(nx * 241 + ny * 199) * 1.5;
      const base = isGrout ? 168 : 200;
      const v = base + grain;
      const i = (y * W + x) * 4;
      d[i]   = cl(v + 4);   // R: warm
      d[i+1] = cl(v + 1);
      d[i+2] = cl(v - 5);   // B: weniger Blau → Beige
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 2.2);
  tex.anisotropy = 16;
  return (_floorTex = tex);
}

// ── Wandputz-Textur (warmweiß, dezente Mikrotextur) ──────────
let _plasterTex = null;
function getPlasterTex() {
  if (_plasterTex) return _plasterTex;
  const W = 128, H = 128;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => Math.max(0, Math.min(255, v)) | 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W, ny = y / H;
      const grain =
        Math.sin(nx * 37 + ny * 59) * 2.5 +
        Math.sin(nx * 97 - ny * 71) * 1.5;
      const v = 238 + grain;
      const i = (y * W + x) * 4;
      d[i]   = cl(v + 2);   // leicht warm
      d[i+1] = cl(v + 1);
      d[i+2] = cl(v - 3);
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.anisotropy = 4;
  return (_plasterTex = tex);
}

// ── Badezimmer-Szene ──────────────────────────────────────────
// Koordinatensystem: ShowerModel-Gruppe sitzt bei y=-h/2 in der Szene.
// → Glaskante oben = Szene-y 0, Glaskante unten = Szene-y -h.
export default function BathroomScene({ showerWidth = 1.2, showerHeight = 2.0 }) {
  const h = showerHeight;
  const w = showerWidth;

  // Schlüssel-Y-Werte in Szene-Koordinaten
  const floorY  = -h;           // Bodenniveau = Glaskante unten (Wanne hängt drunter)
  const ceilY   = 0.58;         // Decke 58 cm über Glaskante oben

  // Außenmaße der Duschnische
  const nisLeftX  = -(w / 2 + SHOWER_WT);
  const nisRightX =  (w / 2 + SHOWER_WT);
  const nisBackZ  = -(SHOWER_D + SHOWER_WT + 0.04); // 4 cm Puffer gegen Z-Fighting

  // Zimmer-Ausdehnung
  const roomL  = nisLeftX  - 0.25;    // kurze Verlängerung links
  const roomR  = nisRightX + 1.90;    // Raum rechts der Dusche (gut sichtbar)
  const roomFZ =  2.30;               // Boden/Decke vor der Dusche
  const roomBZ = nisBackZ;            // Rückwand bündig mit Nische

  const roomCX = (roomL + roomR) / 2;
  const roomCZ = (roomFZ + roomBZ) / 2;
  const roomW  = roomR - roomL;
  const roomD  = roomFZ - roomBZ;
  const wallH  = ceilY - floorY;      // Raumhöhe
  const wallMY = floorY + wallH / 2;  // Wandmitte (Y)

  const floorTex   = getFloorTex();
  const plasterTex = getPlasterTex();

  // Fenster-Parameter (rechte Wand, gut im Kamerabild)
  const winH   = 1.30;
  const winW   = 0.95;
  const winY   = floorY + wallH * 0.62;
  const winZ   = -0.35;  // mittig vor Dusche

  return (
    <group>

      {/* ═══ BODEN ══════════════════════════════════════════════ */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[roomCX, floorY, roomCZ]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial
          map={floorTex}
          roughness={0.22}
          metalness={0.05}
          envMapIntensity={0.50}
        />
      </mesh>

      {/* ═══ RÜCKWAND (umschließt die Duschnische) ══════════════ */}
      {/* Linkes Wandstück (links von Nische) */}
      <mesh receiveShadow position={[(roomL + nisLeftX) / 2, wallMY, nisBackZ]}>
        <planeGeometry args={[nisLeftX - roomL, wallH]} />
        <meshStandardMaterial map={plasterTex} roughness={0.86} metalness={0.0} />
      </mesh>
      {/* Rechtes Wandstück (rechts von Nische) */}
      <mesh receiveShadow position={[(nisRightX + roomR) / 2, wallMY, nisBackZ]}>
        <planeGeometry args={[roomR - nisRightX, wallH]} />
        <meshStandardMaterial map={plasterTex} roughness={0.86} metalness={0.0} />
      </mesh>
      {/* Oberes Wandstück (über Duschnische) */}
      <mesh receiveShadow position={[(nisLeftX + nisRightX) / 2, (ceilY + 0) / 2, nisBackZ]}>
        <planeGeometry args={[nisRightX - nisLeftX, ceilY]} />
        <meshStandardMaterial map={plasterTex} roughness={0.86} metalness={0.0} />
      </mesh>

      {/* ═══ RECHTE WAND mit Fenster ════════════════════════════ */}
      <mesh receiveShadow rotation={[0, -Math.PI / 2, 0]} position={[roomR, wallMY, roomCZ]}>
        <planeGeometry args={[roomD, wallH]} />
        <meshStandardMaterial map={plasterTex} roughness={0.86} metalness={0.0} />
      </mesh>

      {/* Fensterlaibung (dunkler Rahmen um Fenster) */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[roomR - 0.12, winY, winZ]}>
        <planeGeometry args={[winW + 0.14, winH + 0.14]} />
        <meshStandardMaterial color="#d4cfc8" roughness={0.90} metalness={0.0} />
      </mesh>
      {/* Fensterglas — emissives Tageslicht */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[roomR - 0.13, winY, winZ]}>
        <planeGeometry args={[winW, winH]} />
        <meshStandardMaterial
          color="#ddeeff"
          emissive="#aacfff"
          emissiveIntensity={2.80}
          roughness={0.05}
          metalness={0.0}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* ═══ LINKE WAND ═════════════════════════════════════════ */}
      <mesh receiveShadow rotation={[0, Math.PI / 2, 0]} position={[roomL, wallMY, roomCZ]}>
        <planeGeometry args={[roomD, wallH]} />
        <meshStandardMaterial map={plasterTex} roughness={0.86} metalness={0.0} />
      </mesh>

      {/* ═══ DECKE ══════════════════════════════════════════════ */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[roomCX, ceilY, roomCZ]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#f6f5f2" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Decken-Unterputz-Spot (zwei Spots) */}
      <mesh position={[0.3, ceilY - 0.01, -0.4]}>
        <cylinderGeometry args={[0.060, 0.060, 0.018, 16]} />
        <meshStandardMaterial color="#e0ddd8" metalness={0.70} roughness={0.18} />
      </mesh>
      <mesh position={[nisRightX + 0.50, ceilY - 0.01, -0.4]}>
        <cylinderGeometry args={[0.060, 0.060, 0.018, 16]} />
        <meshStandardMaterial color="#e0ddd8" metalness={0.70} roughness={0.18} />
      </mesh>

      {/* ═══ BODEN-ÜBERGANGSSCHIENE Nische → Raum ══════════════ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(nisLeftX + nisRightX) / 2, floorY + 0.003, 0]}>
        <planeGeometry args={[nisRightX - nisLeftX, 0.040]} />
        <meshStandardMaterial color="#c4c0ba" roughness={0.12} metalness={0.70} envMapIntensity={1.2} />
      </mesh>

    </group>
  );
}
