import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Realistisches Metall-Material
 *
 * Strategie: PBR-Metall mit differenzierten Eigenschaften
 * - Chrom: Spiegel-ähnlich, sehr hohe Reflexion
 * - Edelstahl gebürstet: Weiche gerichtete Reflexion, leichte Anisotropie
 * - Schwarz matt: Pulverbeschichtet, kaum Reflexion
 * - Gold/Kupfer: Warm, mittlere Reflexion
 *
 * Performance: Keine prozeduralen Texturen (zu teuer).
 * Unterschiede nur über metalness/roughness/envMapIntensity.
 */

// Shared: einmalig gebaut, nie neu erstellt
let _brushedRoughnessMap = null;

function getBrushedRoughnessMap() {
  if (_brushedRoughnessMap) return _brushedRoughnessMap;

  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 256; // Schmal & hoch = Bürstrichtung
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 64; x++) {
      // Horizontale Kratzer: hohe Roughness in X, niedrig in Y
      const scratch = Math.abs(Math.sin(y * 1.2 + Math.random() * 0.5)) * 25;
      const base = 135 + scratch;
      const v = Math.min(255, base + (Math.random() - 0.5) * 20) | 0;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  _brushedRoughnessMap = new THREE.CanvasTexture(canvas);
  _brushedRoughnessMap.wrapS = _brushedRoughnessMap.wrapT = THREE.RepeatWrapping;
  _brushedRoughnessMap.repeat.set(1, 6);
  return _brushedRoughnessMap;
}

export function useMetalMaterial() {
  const mat = useRef(
    new THREE.MeshStandardMaterial({
      color:           new THREE.Color(0xe8e8e8),
      metalness:       0.95,
      roughness:       0.04,
      envMapIntensity: 1.8,
    })
  );
  return mat;
}

export function updateMetalMaterial(mat, metal) {
  mat.color.set(metal.color);

  switch (metal.metalTyp) {
    case 'poliert': {
      // Chrom: fast perfekter Spiegel
      mat.metalness       = 0.97;
      mat.roughness       = 0.03;
      mat.envMapIntensity = 2.0;
      mat.roughnessMap    = null;
      break;
    }
    case 'gebürstet': {
      // Edelstahl gebürstet: gerichtete Reflexion
      mat.metalness       = 0.90;
      mat.roughness       = 0.25;
      mat.envMapIntensity = 1.2;
      mat.roughnessMap    = getBrushedRoughnessMap();
      break;
    }
    case 'matt': {
      // Schwarz matt: kaum Reflexion
      mat.metalness       = 0.65;
      mat.roughness       = 0.55;
      mat.envMapIntensity = 0.3;
      mat.roughnessMap    = null;
      break;
    }
    case 'gold': {
      // Gold gebürstet: warm, mittlere Reflexion
      mat.metalness       = 0.90;
      mat.roughness       = 0.20;
      mat.envMapIntensity = 1.4;
      mat.roughnessMap    = getBrushedRoughnessMap();
      break;
    }
    case 'kupfer': {
      // Kupfer: warm, etwas matter als Gold
      mat.metalness       = 0.85;
      mat.roughness       = 0.30;
      mat.envMapIntensity = 1.0;
      mat.roughnessMap    = null;
      break;
    }
    default: {
      mat.metalness       = 0.95;
      mat.roughness       = 0.04;
      mat.envMapIntensity = 1.8;
      mat.roughnessMap    = null;
    }
  }

  mat.needsUpdate = true;
}
