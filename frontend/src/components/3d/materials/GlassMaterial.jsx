import { useRef } from 'react';
import * as THREE from 'three';

export function useGlassMaterial() {
  const mat = useRef(
    new THREE.MeshPhysicalMaterial({
      color:            0xffffff,
      transmission:     0.95,
      roughness:        0.0,
      metalness:        0.1,
      envMapIntensity:  1.5,
      transparent:      true,
      opacity:          0.95,
      ior:              1.5,
      side:             THREE.DoubleSide,
      thickness:        0.6,
    })
  );
  return mat;
}

export function updateGlassMaterial(mat, glass, t, opacity = 1.0) {
  mat.color.set(glass.color);
  mat.transmission = glass.transmission;
  mat.roughness    = glass.roughness;
  mat.thickness    = t * 10;
  mat.opacity      = glass.transmission * opacity;
  mat.needsUpdate  = true;
}
