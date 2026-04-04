import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Realistische Badezimmer-Umgebung
 * - Fliesen-Boden mit Fugenraster
 * - Rückwand + Seitenwand (Ecke)
 * - Duschrinne / Ablauf-Markierung
 * - Referenzobjekte für Größenverständnis
 */

const TILE_SIZE = 0.6;
const GROUT_WIDTH = 0.008;
const GROUT_COLOR = '#d0cec8';

// Prozeduraler Fliesen-Boden via Canvas-Textur
function useTileTexture(tileColor, groutColor, size, repeat) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fuge
    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, 512, 512);

    // Fliese
    const groutPx = 8;
    ctx.fillStyle = tileColor;
    ctx.fillRect(groutPx, groutPx, 512 - groutPx * 2, 512 - groutPx * 2);

    // Subtile Variation auf der Fliese (natürlicher Look)
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 30 + 5;
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    tex.anisotropy = 8;
    return tex;
  }, [tileColor, groutColor, repeat]);
}

function useWallTexture(tileColor, groutColor, cols, rows) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const tileW = 512 / cols;
    const tileH = 512 / rows;
    const groutPx = 4;

    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, 512, 512);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Leichtes offset jede zweite Reihe (Mauerverband)
        const offsetX = r % 2 === 0 ? 0 : tileW * 0.5;
        const x = c * tileW + offsetX;
        const y = r * tileH;

        ctx.fillStyle = tileColor;
        ctx.fillRect(x + groutPx, y + groutPx, tileW - groutPx * 2, tileH - groutPx * 2);

        // Subtile Farbvariation pro Fliese
        const variation = (Math.random() - 0.5) * 0.04;
        if (variation > 0) {
          ctx.fillStyle = `rgba(255,255,255,${variation})`;
        } else {
          ctx.fillStyle = `rgba(0,0,0,${-variation})`;
        }
        ctx.fillRect(x + groutPx, y + groutPx, tileW - groutPx * 2, tileH - groutPx * 2);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
  }, [tileColor, groutColor, cols, rows]);
}

// Duschrinne (Ablauf im Boden)
function DrainChannel({ w }) {
  return (
    <group position={[0, 0.002, w / 2 + 0.1]}>
      {/* Edelstahl-Abdeckung */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.8, 0.08]} />
        <meshStandardMaterial
          color="#b8b8b8"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      {/* Einlass-Schatten */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[w * 0.8 + 0.02, 0.1]} />
        <meshStandardMaterial color="#444" metalness={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}

// Handtuchhalter (Referenzobjekt — Größe verständlich machen)
function TowelHolder({ position }) {
  return (
    <group position={position}>
      {/* Halterung */}
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Wandhalter links */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.03, 0.03, 0.05]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Wandhalter rechts */}
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[0.03, 0.03, 0.05]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Handtuch (angedeutet) */}
      <mesh position={[0.04, 0, 0]}>
        <boxGeometry args={[0.015, 0.42, 0.35]} />
        <meshStandardMaterial color="#e8e4df" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function BathroomScene({ showerWidth = 1.2, showerHeight = 2.0 }) {
  const w = showerWidth;
  const h = showerHeight;

  // Bodenfliesen: helles Grau, großformat
  const floorTex = useTileTexture('#e8e5e0', GROUT_COLOR, 6, 6);
  const floorNormal = useTileTexture('#8888aa', '#666688', 6, 6);

  // Wandfliesen: weiß/hellgrau, rechteckig
  const wallTex = useWallTexture('#f5f3ef', '#d5d3ce', 3, 6);
  const sideWallTex = useWallTexture('#f2f0ec', '#d5d3ce', 3, 6);

  // Duschbereich-Boden (etwas dunkler, Nassbereich)
  const wetFloorTex = useTileTexture('#d5d2cc', '#bbb8b2', 4, 4);

  const wallHeight = h + 0.5; // Wand etwas höher als Dusche
  const floorY = -h;          // Boden auf Dusch-Unterkante

  return (
    <group>
      {/* ── BODEN ───────────────────────────────── */}
      {/* Haupt-Boden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial
          map={floorTex}
          roughness={0.6}
          metalness={0.05}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Nassbereich-Boden (unter der Dusche, leicht dunkler) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.003, -0.1]} receiveShadow>
        <planeGeometry args={[w + 0.4, w * 0.8 + 0.3]} />
        <meshStandardMaterial
          map={wetFloorTex}
          roughness={0.4}
          metalness={0.08}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* ── RÜCKWAND ───────��────────────────────── */}
      <mesh position={[0, floorY + wallHeight / 2, -w * 0.5]} receiveShadow>
        <planeGeometry args={[3.5, wallHeight]} />
        <meshStandardMaterial
          map={wallTex}
          roughness={0.45}
          metalness={0.02}
          envMapIntensity={0.2}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* ── SEITENWAND (links) ──────────────────── */}
      <mesh
        position={[-w / 2 - 0.25, floorY + wallHeight / 2, -w * 0.25 + 0.5]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[2.5, wallHeight]} />
        <meshStandardMaterial
          map={sideWallTex}
          roughness={0.45}
          metalness={0.02}
          envMapIntensity={0.2}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* ── DUSCHRINNE ──────────────────────────── */}
      <DrainChannel w={w} />

      {/* ── REFERENZ-OBJEKTE ────────────────────── */}
      {/* Handtuchhalter an der Seitenwand */}
      <TowelHolder
        position={[-w / 2 - 0.22, floorY + h * 0.55, 0.6]}
      />

      {/* ── SUBTILE SCHATTEN / AMBIENT OCCLUSION ── */}
      {/* Ecke Wand/Boden — dunkler Streifen */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, floorY + 0.001, -w * 0.5 + 0.15]}
      >
        <planeGeometry args={[3.5, 0.3]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.06} />
      </mesh>

      {/* ── BELEUCHTUNG (Badezimmer-typisch) ────── */}
      {/* Deckenspot direkt über Dusche */}
      <spotLight
        position={[0, floorY + wallHeight + 0.5, 0.5]}
        angle={0.6}
        penumbra={0.8}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
        color="#fff5e8"
      />

      {/* Indirektes Deckenlicht (warm) */}
      <pointLight
        position={[1.5, floorY + wallHeight, 1.5]}
        intensity={0.4}
        color="#ffe8d0"
        distance={6}
      />

      {/* Seitliches Fill-Licht (kühler — Tageslicht-Simulation) */}
      <pointLight
        position={[2, floorY + h * 0.5, 2]}
        intensity={0.25}
        color="#d8e8ff"
        distance={5}
      />

      {/* Boden-Reflexionslicht */}
      <pointLight
        position={[0, floorY + 0.1, 0.3]}
        intensity={0.08}
        color="#ffffff"
        distance={2}
      />
    </group>
  );
}
