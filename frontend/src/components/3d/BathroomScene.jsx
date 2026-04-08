import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Bathroom context scene — Duka-style configurator
 *
 * Shows the shower in a realistic tiled corner:
 *  - Back wall (tiled) directly behind the glass
 *  - Left side wall (where the shower is mounted)
 *  - Tiled floor + wet-area inset
 *  - Shower tray (white stone)
 *  - Drain channel
 *
 * Coordinate system (matches ShowerModel):
 *  - Floor at y = -h
 *  - Glass front face at z ≈ 0
 *  - Back wall at z = -DEPTH
 *  - Left wall at x = -w/2
 */

const DEPTH = 1.0; // front-to-back depth of the shower enclosure

// ── Tile texture helpers ────────────────────────────────────
function makeTileTexture(tileColor, groutColor, tilesU, tilesV) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = groutColor;
  ctx.fillRect(0, 0, 512, 512);
  const gp = 7;
  const tw = 512 / tilesU;
  const th = 512 / tilesV;
  for (let r = 0; r < tilesV; r++) {
    for (let c = 0; c < tilesU; c++) {
      ctx.fillStyle = tileColor;
      const x = c * tw + gp;
      const y = r * th + gp;
      ctx.fillRect(x, y, tw - gp * 2, th - gp * 2);
      // subtle per-tile variation
      const v = (Math.random() - 0.5) * 0.035;
      ctx.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`;
      ctx.fillRect(x, y, tw - gp * 2, th - gp * 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function useTile(tileColor, groutColor, u, v) {
  return useMemo(() => makeTileTexture(tileColor, groutColor, u, v), [tileColor, groutColor, u, v]);
}

// ── Drain channel ───────────────────────────────────────────
function Drain({ w, floorY }) {
  return (
    <group position={[0, floorY + 0.002, -DEPTH * 0.12]}>
      {/* Drain cover — stainless steel strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.75, 0.065]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.92} roughness={0.12} />
      </mesh>
      {/* Recess around drain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.001]}>
        <planeGeometry args={[w * 0.75 + 0.025, 0.09]} />
        <meshStandardMaterial color="#555" metalness={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── Main scene ──────────────────────────────────────────────
export default function BathroomScene({ showerWidth = 1.2, showerHeight = 2.0 }) {
  const w      = showerWidth;
  const h      = showerHeight;
  const floorY = -h;
  const wallH  = h + 0.6;  // wall extends above shower

  // Floor: large warm grey tiles
  const floorTex = useTile('#dbd7d0', '#b8b4ac', 5, 5);
  // Wet area inset: slightly darker
  const wetTex   = useTile('#cec9c1', '#aaa69e', 4, 4);
  // Wall: tall white/off-white tiles (3 wide × 6 tall per repeat)
  const wallTex  = useTile('#efefec', '#d2cfca', 2, 4);

  return (
    <group>
      {/* ── FLOOR ─────────────────────────────────────────── */}
      {/* Main bathroom floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, -DEPTH * 0.5 + 0.15]}>
        <planeGeometry args={[w + 2.0, DEPTH + 1.2]} />
        <meshStandardMaterial map={floorTex} roughness={0.55} metalness={0.04} envMapIntensity={0.2} />
      </mesh>

      {/* Wet-area inset (under shower, slightly elevated + darker) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.001, -DEPTH * 0.45]}>
        <planeGeometry args={[w - 0.06, DEPTH - 0.15]} />
        <meshStandardMaterial map={wetTex} roughness={0.45} metalness={0.05} envMapIntensity={0.25} />
      </mesh>

      {/* ── SHOWER TRAY ───────────────────────────────────── */}
      <mesh position={[0, floorY + 0.025, -DEPTH * 0.45]}>
        <boxGeometry args={[w - 0.06, 0.05, DEPTH - 0.15]} />
        <meshStandardMaterial color="#f3f1ec" roughness={0.35} metalness={0.02} />
      </mesh>
      {/* Tray front lip (visible from camera) */}
      <mesh position={[0, floorY + 0.025, 0.01]}>
        <boxGeometry args={[w - 0.06, 0.05, 0.025]} />
        <meshStandardMaterial color="#e8e5df" roughness={0.3} metalness={0.02} />
      </mesh>

      {/* ── DRAIN ─────────────────────────────────────────── */}
      <Drain w={w} floorY={floorY} />

      {/* ── BACK WALL ─────────────────────────────────────── */}
      <mesh position={[0, floorY + wallH / 2, -DEPTH + 0.01]}>
        <planeGeometry args={[w + 0.08, wallH]} />
        <meshStandardMaterial map={wallTex} roughness={0.40} metalness={0.02} envMapIntensity={0.15} side={THREE.FrontSide} />
      </mesh>
      {/* extend behind walls left/right */}
      <mesh position={[0, floorY + wallH / 2, -DEPTH + 0.01]}>
        <planeGeometry args={[w + 2.5, wallH]} />
        <meshStandardMaterial color="#eae8e3" roughness={0.5} metalness={0.01} side={THREE.FrontSide} />
      </mesh>
      {/* tile wall takes priority, re-render on top */}
      <mesh position={[0, floorY + wallH / 2, -DEPTH + 0.015]}>
        <planeGeometry args={[w + 0.08, wallH]} />
        <meshStandardMaterial map={wallTex} roughness={0.40} metalness={0.02} envMapIntensity={0.15} side={THREE.FrontSide} />
      </mesh>

      {/* ── LEFT SIDE WALL ────────────────────────────────── */}
      <mesh
        position={[-w / 2 - 0.01, floorY + wallH / 2, -DEPTH / 2 + 0.08]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[DEPTH + 0.05, wallH]} />
        <meshStandardMaterial map={wallTex} roughness={0.40} metalness={0.02} envMapIntensity={0.15} side={THREE.FrontSide} />
      </mesh>
      {/* Left wall extension (outside shower) */}
      <mesh
        position={[-w / 2 - 0.9, floorY + wallH / 2, -DEPTH / 2 + 0.08]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[DEPTH + 1.4, wallH]} />
        <meshStandardMaterial color="#eae8e3" roughness={0.5} metalness={0.01} side={THREE.FrontSide} />
      </mesh>

      {/* ── CEILING (subtle — partial) ────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, floorY + wallH, -DEPTH / 2]}>
        <planeGeometry args={[w + 3, DEPTH + 1]} />
        <meshStandardMaterial color="#f5f5f3" roughness={0.9} metalness={0.0} side={THREE.FrontSide} />
      </mesh>

      {/* ── FLOOR EDGE shadow strip (wall/floor junction) ─── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.001, -DEPTH + 0.08]}>
        <planeGeometry args={[w + 2.5, 0.22]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.05} />
      </mesh>
      <mesh
        position={[-w / 2, floorY + 0.001, -DEPTH / 2 + 0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.22, DEPTH + 0.2]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}
