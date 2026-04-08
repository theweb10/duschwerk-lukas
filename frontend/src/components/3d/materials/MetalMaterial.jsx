import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Professional Metal Material — Duka-style chrome & finishes
 *
 * - Polished chrome: near-mirror, cool white, high env reflections
 * - Brushed: directional sheen, anisotropic look via roughness
 * - Matt: powder-coat feel, low reflection
 * - Gold/Copper: warm with appropriate metalness
 *
 * Performance: no procedural textures — PBR values only.
 */

export function useMetalMaterial() {
  const mat = useRef(
    new THREE.MeshStandardMaterial({
      color:           new THREE.Color('#f2f2f4'),
      metalness:       0.96,
      roughness:       0.04,
      envMapIntensity: 2.2,
    })
  );
  return mat;
}

export function updateMetalMaterial(mat, metal) {
  mat.color.set(metal.color);

  switch (metal.metalTyp) {

    case 'poliert': {
      // Mirror-chrome — high-end product look
      mat.metalness       = 0.97;
      mat.roughness       = 0.03;
      mat.envMapIntensity = 2.5;
      break;
    }

    case 'gebürstet': {
      // Satin / brushed — muted directional sheen
      mat.metalness       = 0.92;
      mat.roughness       = 0.28;
      mat.envMapIntensity = 1.4;
      break;
    }

    case 'matt': {
      // Powder-coat — minimal reflection
      mat.metalness       = 0.60;
      mat.roughness       = 0.60;
      mat.envMapIntensity = 0.25;
      break;
    }

    case 'gold': {
      // Brushed gold — warm, medium reflection
      mat.metalness       = 0.92;
      mat.roughness       = 0.22;
      mat.envMapIntensity = 1.6;
      break;
    }

    case 'kupfer': {
      // Copper — warm, slightly rougher
      mat.metalness       = 0.88;
      mat.roughness       = 0.28;
      mat.envMapIntensity = 1.2;
      break;
    }

    default: {
      mat.metalness       = 0.96;
      mat.roughness       = 0.04;
      mat.envMapIntensity = 2.2;
    }
  }

  mat.needsUpdate = true;
}
