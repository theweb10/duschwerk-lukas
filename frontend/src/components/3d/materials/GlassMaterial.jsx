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
      color:             new THREE.Color('#e8f6fc'),
      transmission:      0,
      roughness:         0.0,
      metalness:         0.0,
      ior:               1.52,
      thickness:         0.008,
      envMapIntensity:   2.20,
      specularIntensity: 1.40,
      transparent:       true,
      opacity:           0.16,
      side:              THREE.DoubleSide,
      depthWrite:        false,
    })
  );
  return mat;
}

export function updateGlassMaterial(mat, glass, t, opacity = 1.0) {
  const op = Math.max(0, Math.min(1, opacity));

  // Alle Glastypen: transmission=0, opacity-basiert → kein Doppelbild, immer durchsichtig
  mat.transmission        = 0;
  mat.thickness           = 0;
  mat.attenuationDistance = 10.0;
  mat.attenuationColor.set('#ffffff');
  mat.roughnessMap        = null;
  mat.normalMap           = null;
  mat.metalness           = 0.0;
  mat.ior                 = 1.52;
  mat.specularIntensity   = 1.40;
  mat.envMapIntensity     = 2.20;
  mat.side                = THREE.DoubleSide;

  const glasTyp      = glass?.glasTyp      ?? 'klarglas';
  const catalogColor = glass?.color        ?? null;
  const catalogTrans = glass?.transmission ?? null;

  switch (glasTyp) {

    // ── Satinato ───────────────────────────────────────────────
    case 'satinato': {
      const isMirror = catalogTrans !== null && catalogTrans < 0.50;
      if (isMirror) {
        mat.color.set(catalogColor ?? '#b8ccd8');
        mat.roughness         = 0.02;
        mat.metalness         = 0.15;
        mat.envMapIntensity   = 2.20;
        mat.specularIntensity = 1.40;
        mat.opacity           = 0.92 * op;  // fast opak = Spiegel
      } else {
        mat.color.set('#dde2ee');
        mat.roughness         = 0.55;
        mat.roughnessMap      = getSatinatoMap();
        mat.envMapIntensity   = 0.80;
        mat.specularIntensity = 0.60;
        mat.opacity           = 0.70 * op;  // milchig, aber noch durchscheinend
      }
      break;
    }

    // ── Parsol Bronze / Braunglas ──────────────────────────────
    case 'parsol_bronze': {
      mat.color.set(catalogColor ?? '#b8905c');
      mat.roughness         = 0.02;
      mat.envMapIntensity   = 1.60;
      mat.specularIntensity = 1.10;
      // Transparenz: Bronze ~45 % sichtbar (dunkler als Klarglas, heller als Graphit)
      mat.opacity           = 0.46 * op;
      break;
    }

    // ── Parsol Grau / Grauglas / Graphitglas ──────────────────
    case 'parsol_grau': {
      const trans     = catalogTrans ?? 0.78;
      const isGraphit = trans < 0.65;
      mat.color.set(catalogColor ?? (isGraphit ? '#525a62' : '#8090a0'));
      mat.roughness         = 0.02;
      mat.envMapIntensity   = 1.60;
      mat.specularIntensity = 1.10;
      mat.opacity           = (isGraphit ? 0.60 : 0.44) * op;
      break;
    }

    // ── Klarglas / UltraClear (default) ───────────────────────
    default: {
      const isUltraClear = (catalogTrans ?? 0.97) > 0.96;
      mat.color.set(catalogColor ?? (isUltraClear ? '#e8f6fc' : '#ddf0f8'));
      mat.roughness         = 0.0;
      mat.envMapIntensity   = 2.20;
      mat.specularIntensity = 1.40;
      mat.opacity           = (isUltraClear ? 0.16 : 0.20) * op;
    }
  }

  mat.needsUpdate = true;
}
