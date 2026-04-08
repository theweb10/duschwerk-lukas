import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Metal Material — all catalog finish types
 *
 * metalTyp values:
 *   'poliert'   → mirror chrome / hochglanz
 *   'gebürstet' → satin / brushed (gebürstet, nickel, optic-nickel)
 *   'matt'      → powder-coat matte (adapts: dark=metallic, light=non-metallic)
 *   'gold'      → brushed gold / pvd gold
 *   'kupfer'    → copper / bronze tones
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
  // Set color from catalog first
  mat.color.set(metal.color);

  // Detect light colors (white/cream profiles → powder-coat look, not chrome)
  const c = mat.color;
  const brightness = (c.r + c.g + c.b) / 3;
  const isLightColor = brightness > 0.75;

  switch (metal.metalTyp) {

    case 'poliert': {
      // Mirror chrome / polished
      mat.metalness       = 0.97;
      mat.roughness       = 0.03;
      mat.envMapIntensity = 2.6;
      break;
    }

    case 'gebürstet': {
      // Satin / brushed
      mat.metalness       = 0.92;
      mat.roughness       = 0.28;
      mat.envMapIntensity = 1.4;
      break;
    }

    case 'matt': {
      if (isLightColor) {
        // Weiß / Creme → Pulverbeschichtung (non-metallic)
        mat.metalness       = 0.04;
        mat.roughness       = 0.82;
        mat.envMapIntensity = 0.06;
      } else {
        // Schwarz matt / Dunkel
        mat.metalness       = 0.58;
        mat.roughness       = 0.62;
        mat.envMapIntensity = 0.22;
      }
      break;
    }

    case 'gold': {
      // PVD gold / brushed gold
      mat.metalness       = 0.93;
      mat.roughness       = 0.20;
      mat.envMapIntensity = 1.7;
      break;
    }

    case 'kupfer': {
      // Copper / bronze tones
      mat.metalness       = 0.88;
      mat.roughness       = 0.26;
      mat.envMapIntensity = 1.3;
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
