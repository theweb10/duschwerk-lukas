import * as THREE from 'three';

/**
 * Minimaler Schattenboden für den Shower-Konfigurator.
 * Kein Hintergrundgeometrie — dunkler Canvas-Hintergrund reicht.
 * Der Boden liegt tief genug, dass er nie mit der Duschwanne überlappt.
 */
export default function BathroomScene({ showerWidth = 1.2, showerHeight = 2.0 }) {
  const h      = showerHeight;
  // Deutlich tiefer als Wanne (TH=0.055), damit keine Überschneidung beim Kippen
  const floorY = -h - 0.30;

  return (
    <group>
      {/* Schattenboden — nur Schattenempfänger, kein visueller Hintergrund */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, -0.5]}>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial
          color="#0e1012"
          roughness={0.70}
          metalness={0.02}
          envMapIntensity={0.04}
        />
      </mesh>
    </group>
  );
}
