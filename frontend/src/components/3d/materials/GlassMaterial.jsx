import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Glass Material — supports all catalog glass types via render object
 *
 * glasTyp values from productCatalog:
 *   'klarglas'     → clear / ultraclear (differentiated by transmission)
 *   'satinato'     → frosted / mirror glass (differentiated by transmission < 0.5)
 *   'parsol_grau'  → grey tint (grauglas/graphitglas via transmission)
 *   'parsol_bronze'→ bronze tint (braunglas)
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

  // Always reset maps first
  mat.roughnessMap = null;
  mat.normalMap    = null;

  const glasTyp      = glass?.glasTyp      ?? 'klarglas';
  const catalogColor = glass?.color        ?? null;
  const catalogTrans = glass?.transmission ?? null;
  const catalogRough = glass?.roughness    ?? null;

  switch (glasTyp) {

    // ── Satinato + Spiegelglas ─────────────────────────────────
    case 'satinato': {
      const isMirror = catalogTrans !== null && catalogTrans < 0.50;

      if (isMirror) {
        // Spiegelglas: high reflection, low transmission
        mat.color.set(catalogColor ?? '#c8d8e8');
        mat.transmission        = 0.25;
        mat.roughness           = 0.03;
        mat.metalness           = 0.08;
        mat.ior                 = 1.55;
        mat.thickness           = t * 5;
        mat.attenuationDistance = 0.35;
        mat.attenuationColor.set('#8899aa');
        mat.envMapIntensity     = 0.90;
        mat.opacity             = op;
      } else {
        // Satinato: frosted
        mat.color.set('#eef0f6');
        mat.transmission        = 0.80;
        mat.roughness           = 0.66;
        mat.metalness           = 0.0;
        mat.ior                 = 1.46;
        mat.thickness           = t * 9;
        mat.attenuationDistance = 0.90;
        mat.attenuationColor.set('#e2e6f0');
        mat.envMapIntensity     = 0.07;
        mat.roughnessMap        = getSatinatoMap();
        mat.opacity             = 0.92 * op;
      }
      break;
    }

    // ── Parsol Bronze / Braunglas ──────────────────────────────
    case 'parsol_bronze': {
      mat.color.set(catalogColor ?? '#c49870');
      mat.transmission        = catalogTrans ?? 0.82;
      mat.roughness           = catalogRough ?? 0.04;
      mat.metalness           = 0.0;
      mat.ior                 = 1.52;
      mat.thickness           = t * 12;
      mat.attenuationDistance = 0.50;
      mat.attenuationColor.set('#7a4818');
      mat.envMapIntensity     = 0.20;
      mat.opacity             = op;
      break;
    }

    // ── Parsol Grau / Grauglas / Graphitglas ──────────────────
    case 'parsol_grau': {
      const trans = catalogTrans ?? 0.78;
      const isGraphit = trans < 0.65;

      mat.color.set(catalogColor ?? (isGraphit ? '#505860' : '#909aa4'));
      mat.transmission        = trans;
      mat.roughness           = 0.03;
      mat.metalness           = 0.0;
      mat.ior                 = 1.52;
      mat.thickness           = t * (isGraphit ? 16 : 12);
      mat.attenuationDistance = isGraphit ? 0.28 : 0.44;
      mat.attenuationColor.set(isGraphit ? '#181e24' : '#303840');
      mat.envMapIntensity     = 0.22;
      mat.opacity             = op;
      break;
    }

    // ── Klarglas / UltraClear (default) ───────────────────────
    default: {
      const trans = catalogTrans ?? 0.97;
      const isUltraClear = trans > 0.96;

      mat.color.set(catalogColor ?? (isUltraClear ? '#f8fffc' : '#f6f9ff'));
      mat.transmission        = trans;
      mat.roughness           = catalogRough ?? 0.015;
      mat.metalness           = 0.0;
      mat.ior                 = 1.52;
      mat.thickness           = t * 10;
      mat.attenuationDistance = isUltraClear ? 3.0 : 2.5;
      mat.attenuationColor.set(isUltraClear ? '#e8fff4' : '#ddeeff');
      mat.envMapIntensity     = 0.18;
      mat.opacity             = op;
    }
  }

  mat.needsUpdate = true;
}
