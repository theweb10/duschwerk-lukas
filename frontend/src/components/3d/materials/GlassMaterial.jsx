import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Professional Glass Material — Duka-style product rendering
 *
 * Design goals:
 * - Klarglas: nearly invisible, glass-edge only via IOR, subtle blue-grey attenuation
 * - Tinted glass: visible colour while remaining translucent
 * - Satinato: soft diffusion, no clear depth
 *
 * Performance: shared textures, created once.
 */

let _satinatoMap = null;

function getSatinatoMap() {
  if (_satinatoMap) return _satinatoMap;
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const n = 185 + (Math.random() - 0.5) * 28;
      ctx.fillStyle = `rgb(${n|0},${n|0},${n|0})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  _satinatoMap = new THREE.CanvasTexture(canvas);
  _satinatoMap.wrapS = _satinatoMap.wrapT = THREE.RepeatWrapping;
  _satinatoMap.repeat.set(4, 5);
  return _satinatoMap;
}

export function useGlassMaterial() {
  const mat = useRef(
    new THREE.MeshPhysicalMaterial({
      color:               new THREE.Color('#ffffff'),
      transmission:        0.98,
      roughness:           0.02,
      metalness:           0.0,
      ior:                 1.52,
      thickness:           0.6,
      attenuationDistance: 2.0,
      attenuationColor:    new THREE.Color('#ddeeff'),
      envMapIntensity:     0.25,
      clearcoat:           0.0,
      transparent:         true,
      opacity:             1.0,
      side:                THREE.DoubleSide,
      depthWrite:          false,
    })
  );
  return mat;
}

export function updateGlassMaterial(mat, glass, t, opacity = 1.0) {
  const op = Math.max(0, Math.min(1, opacity));

  // Reset shared state
  mat.roughnessMap = null;
  mat.normalMap    = null;

  switch (glass.glasTyp) {

    case 'satinato': {
      mat.color.set('#eef0f5');
      mat.transmission        = 0.82;
      mat.roughness           = 0.68;
      mat.ior                 = 1.46;
      mat.thickness           = t * 9;
      mat.attenuationDistance = 0.9;
      mat.attenuationColor.set('#e4e8f0');
      mat.envMapIntensity     = 0.08;
      mat.roughnessMap        = getSatinatoMap();
      mat.opacity             = 0.90 * op;
      break;
    }

    case 'parsol_bronze': {
      mat.color.set('#c4986a');
      mat.transmission        = 0.84;
      mat.roughness           = 0.04;
      mat.ior                 = 1.52;
      mat.thickness           = t * 12;
      mat.attenuationDistance = 0.55;
      mat.attenuationColor.set('#8c5820');
      mat.envMapIntensity     = 0.22;
      mat.opacity             = op;
      break;
    }

    case 'parsol_grau': {
      mat.color.set('#9aa2aa');
      mat.transmission        = 0.80;
      mat.roughness           = 0.03;
      mat.ior                 = 1.52;
      mat.thickness           = t * 12;
      mat.attenuationDistance = 0.45;
      mat.attenuationColor.set('#383e46');
      mat.envMapIntensity     = 0.22;
      mat.opacity             = op;
      break;
    }

    default: {
      // Klarglas — product-photography grade transparency
      mat.color.set('#f8faff');
      mat.transmission        = 0.97;
      mat.roughness           = 0.015;
      mat.ior                 = 1.52;
      mat.thickness           = t * 10;
      mat.attenuationDistance = 2.5;
      mat.attenuationColor.set('#ddeeff');
      mat.envMapIntensity     = 0.20;
      mat.opacity             = op;
    }
  }

  mat.needsUpdate = true;
}
