import React from 'react';
import * as THREE from 'three';

/**
 * Studio Scene — Duka-style product photography
 *
 * - Pure white cyclorama background (seamless floor-to-wall)
 * - Slightly glossy floor for subtle product reflection
 * - No shadow blobs — clean, minimal
 */
export default function StudioScene({ showerHeight = 2.0 }) {
  const h       = showerHeight;
  const floorY  = -h;

  return (
    <group>
      {/* ── Glossy white floor — subtle product reflection ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial
          color="#f7f8fa"
          roughness={0.08}
          metalness={0.04}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* ── Cyclorama back wall — seamless white ── */}
      <mesh position={[0, floorY + 5, -4]}>
        <planeGeometry args={[24, 14]} />
        <meshBasicMaterial color="#f8f9fb" side={THREE.FrontSide} />
      </mesh>

      {/* ── Left side fill ── */}
      <mesh position={[-6, floorY + 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshBasicMaterial color="#f5f6f8" side={THREE.FrontSide} />
      </mesh>

      {/* ── Right side fill ── */}
      <mesh position={[6, floorY + 4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshBasicMaterial color="#f5f6f8" side={THREE.FrontSide} />
      </mesh>
    </group>
  );
}
