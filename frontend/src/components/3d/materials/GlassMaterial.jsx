import { useRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * ULTRA-REALISTISCHES GLAS-MATERIAL SYSTEM
 *
 * Design-Philosophie:
 * "Glas soll fast unsichtbar wirken"
 *
 * Technik:
 * - Hohe Transmission (0.97–0.99), kaum Farbe
 * - Fresnel-Effekt nur an den Kanten (hoher IOR mit niedriger Roughness)
 * - Kein Clearcoat (verhindert Spiegel-Look)
 * - Minimale envMapIntensity (keine Umgebungsreflexion)
 * - attenuationColor definiert subtile Glasfarbe bei Dicke
 *
 * Glastyp-Unterschiede:
 * - Klarglas:      Nahezu unsichtbar, hauchfeine Kanten
 * - Satinato:      Mattiert via Roughness — Licht gestreut, Konturen erkennbar
 * - Parsol Bronze: Sehr leichte Wärmetönung
 * - Parsol Grau:   Sehr leichte Kühltönung
 * - Strukturglas:  Normal-Map erzeugt sichtbare Wellenstruktur
 */

// Lazily erzeugte Shared-Texturen (einmalig, kein Remake)
let _satinatoRoughnessMap = null;
let _strukturNormalMap = null;

function getSatinatoRoughnessMap() {
  if (_satinatoRoughnessMap) return _satinatoRoughnessMap;

  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      // Sandstrahl-Effekt: hohe gleichmäßige Roughness mit feinem Korn
      const n = 190 + (Math.random() - 0.5) * 30;
      ctx.fillStyle = `rgb(${n|0},${n|0},${n|0})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  _satinatoRoughnessMap = new THREE.CanvasTexture(canvas);
  _satinatoRoughnessMap.wrapS = _satinatoRoughnessMap.wrapT = THREE.RepeatWrapping;
  _satinatoRoughnessMap.repeat.set(4, 5);
  return _satinatoRoughnessMap;
}

function getStrukturNormalMap() {
  if (_strukturNormalMap) return _strukturNormalMap;

  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Basis: neutral
  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, 256, 256);

  // Feine Wellen-Struktur
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const wx = Math.sin(y * 0.18 + x * 0.03) * 18;
      const wy = Math.sin(x * 0.12) * 14 + Math.cos(y * 0.07) * 8;
      ctx.fillStyle = `rgb(${(128 + wx)|0},${(128 + wy)|0},255)`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  _strukturNormalMap = new THREE.CanvasTexture(canvas);
  _strukturNormalMap.wrapS = _strukturNormalMap.wrapT = THREE.RepeatWrapping;
  _strukturNormalMap.repeat.set(2, 4);
  return _strukturNormalMap;
}

export function useGlassMaterial() {
  const mat = useRef(
    new THREE.MeshPhysicalMaterial({
      // Fast-invisible Basis
      color:               new THREE.Color(0xffffff),
      transmission:        0.98,
      roughness:           0.02,
      metalness:           0.0,
      ior:                 1.50,
      thickness:           0.5,
      attenuationDistance: 1.5,
      attenuationColor:    new THREE.Color('#ffffff'),
      // Minimalste Reflexionen
      envMapIntensity:     0.3,
      // Kein Clearcoat!
      clearcoat:           0.0,
      // Volle Transparenz
      transparent:         true,
      opacity:             1.0,
      side:                THREE.DoubleSide,
      depthWrite:          false, // Wichtig: Verhindert Z-Fighting bei dünnem Glas
    })
  );
  return mat;
}

export function updateGlassMaterial(mat, glass, t, opacity = 1.0) {
  // Deckelwert für Opacity bei Transitions
  const transitionOpacity = Math.max(0, Math.min(1, opacity));

  switch (glass.glasTyp) {
    case 'satinato': {
      // Satinato: Licht gestreut, Konturen erkennbar aber unscharf
      mat.color.set('#f0f2f5');
      mat.transmission   = 0.85;
      mat.roughness      = 0.75;   // Hohe Streuung
      mat.ior            = 1.45;
      mat.thickness      = t * 8;
      mat.attenuationDistance = 0.8;
      mat.attenuationColor.set('#e8eaf0');
      mat.envMapIntensity = 0.1;   // Kaum Reflexion
      mat.roughnessMap   = getSatinatoRoughnessMap();
      mat.normalMap      = null;
      mat.opacity        = 0.88 * transitionOpacity;
      break;
    }
    case 'parsol_bronze': {
      // Sehr leichte Wärmetönung — immer noch fast transparent
      mat.color.set('#c8a882');
      mat.transmission   = 0.88;
      mat.roughness      = 0.04;
      mat.ior            = 1.51;
      mat.thickness      = t * 10;
      mat.attenuationDistance = 0.6;
      mat.attenuationColor.set('#a06830');
      mat.envMapIntensity = 0.25;
      mat.roughnessMap   = null;
      mat.normalMap      = null;
      mat.opacity        = 1.0 * transitionOpacity;
      break;
    }
    case 'parsol_grau': {
      // Sehr leichte Kühltönung
      mat.color.set('#a8aeb4');
      mat.transmission   = 0.86;
      mat.roughness      = 0.04;
      mat.ior            = 1.51;
      mat.thickness      = t * 10;
      mat.attenuationDistance = 0.5;
      mat.attenuationColor.set('#404850');
      mat.envMapIntensity = 0.25;
      mat.roughnessMap   = null;
      mat.normalMap      = null;
      mat.opacity        = 1.0 * transitionOpacity;
      break;
    }
    case 'strukturglas': {
      // Wellenstruktur — Normal-Map erzeugt Brechungseffekt
      mat.color.set('#f4f6f8');
      mat.transmission   = 0.82;
      mat.roughness      = 0.12;
      mat.ior            = 1.53;
      mat.thickness      = t * 9;
      mat.attenuationDistance = 1.0;
      mat.attenuationColor.set('#f0f0f0');
      mat.envMapIntensity = 0.2;
      mat.roughnessMap   = null;
      mat.normalMap      = getStrukturNormalMap();
      mat.normalScale    = new THREE.Vector2(0.5, 0.5);
      mat.opacity        = 1.0 * transitionOpacity;
      break;
    }
    default: {
      // Klarglas — nahezu unsichtbar
      mat.color.set('#ffffff');
      mat.transmission   = 0.98;
      mat.roughness      = 0.02;
      mat.ior            = 1.50;
      mat.thickness      = t * 8;
      mat.attenuationDistance = 2.0;
      mat.attenuationColor.set('#ffffff');
      mat.envMapIntensity = 0.3;
      mat.roughnessMap   = null;
      mat.normalMap      = null;
      mat.opacity        = 1.0 * transitionOpacity;
    }
  }

  mat.needsUpdate = true;
}
