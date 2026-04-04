import { useRef } from 'react';
import * as THREE from 'three';

export function useMetalMaterial() {
  const mat = useRef(
    new THREE.MeshStandardMaterial({
      color:           0xe8e8e8,
      metalness:       0.95,
      roughness:       0.05,
      envMapIntensity: 1.2,
    })
  );
  return mat;
}

export function updateMetalMaterial(mat, metal) {
  mat.color.set(metal.color);
  mat.metalness       = metal.metalness;
  mat.roughness       = metal.roughness;
  mat.needsUpdate     = true;
}
