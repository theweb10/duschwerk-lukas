import React from 'react';
import * as THREE from 'three';

/**
 * White Studio Scene
 *
 * Fokus auf Produkt:
 * - Weiß/Hellgrau Hintergrund (#f4f4f4)
 * - Weicher Boden-Schatten (keine harte Grenze)
 * - Gleichmäßiges Licht, kein Spot-Charakter
 * - Optional: Szenen-Wechsel zu Badezimmer möglich
 */
export default function StudioScene({ showerHeight = 2.0, showFloorShadow = true }) {
  const h = showerHeight;
  const floorY = -h;

  return (
    <group>
      {/* Weicher Gradient-Boden (Softbox-Look) */}
      {showFloorShadow && (
        <>
          {/* Haupt-Bodenfläche */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial
              color="#f0f0f0"
              roughness={0.9}
              metalness={0.0}
            />
          </mesh>

          {/* Weicher Schatten-Blob unter dem Modell */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.002, 0]}>
            <planeGeometry args={[2.5, 1.5]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.06} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.003, 0]}>
            <planeGeometry args={[1.8, 1.0]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.05} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.004, 0]}>
            <planeGeometry args={[1.0, 0.5]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.04} />
          </mesh>
        </>
      )}

      {/* Hintergrundfläche (Cyclorama-Effekt) */}
      <mesh position={[0, floorY + 3, -2.5]}>
        <planeGeometry args={[12, 10]} />
        <meshBasicMaterial color="#f6f6f6" side={THREE.FrontSide} />
      </mesh>
      <mesh position={[-4, floorY + 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 10]} />
        <meshBasicMaterial color="#f4f4f4" side={THREE.FrontSide} />
      </mesh>
    </group>
  );
}
