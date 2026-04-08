import * as THREE from 'three';

/**
 * Studio-Boden für den Shower-Konfigurator.
 * Polierter dunkler Stein mit Schattenempfang und Soft-Reflexion.
 */
export default function BathroomScene({ showerWidth = 1.2, showerHeight = 2.0 }) {
  const h      = showerHeight;
  const floorY = -h - 0.06; // direkt unter Wannenboden (TH=0.055)

  return (
    <group>
      {/* Polierter Reflexionsboden — dunkler Naturstein */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, -1.0]}>
        <planeGeometry args={[20, 14]} />
        <meshStandardMaterial
          color="#0a0c10"
          roughness={0.08}
          metalness={0.12}
          envMapIntensity={0.55}
        />
      </mesh>

      {/* Weit entfernte Rückwand — sehr dunkel, nur als Tiefenhinweis */}
      <mesh position={[0, floorY + (h + 3) / 2, -4.5]}>
        <planeGeometry args={[16, h + 6]} />
        <meshStandardMaterial
          color="#080a0d"
          roughness={0.95}
          metalness={0.0}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}
