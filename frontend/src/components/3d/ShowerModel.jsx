import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { mapConfig } from './configurator/useShowerConfig';
import { useModelAnimation } from './configurator/useModelAnimation';
import { useGlassMaterial, updateGlassMaterial } from './materials/GlassMaterial';
import { useMetalMaterial, updateMetalMaterial } from './materials/MetalMaterial';

// ── Dimensionen ─────────────────────────────────────────────
const P   = 0.022;   // Profilbreite  22 mm
const PH  = 0.016;   // Profiltiefe   16 mm
const D   = 0.90;    // Duschtiefe front→back
const WT  = 0.14;    // Wandstärke
const TH  = 0.055;   // Wanenhöhe

// ── Tile-Textur ──────────────────────────────────────────────
let _wallTex = null;
function getWallTex() {
  if (_wallTex) return _wallTex;
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const COLS = 2, ROWS = 4;
  const TW = W / COLS, TH2 = H / ROWS;
  const GP = 4; // grout px

  // Fuge
  ctx.fillStyle = '#a8a49c';
  ctx.fillRect(0, 0, W, H);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TW + GP, y = r * TH2 + GP;
      const tw = TW - GP * 2, th = TH2 - GP * 2;

      // Kachel Grundton (leichte Variation pro Kachel)
      const variation = (Math.random() - 0.5) * 14;
      const base = 194 + variation;
      ctx.fillStyle = `rgb(${base|0},${(base - 2)|0},${(base - 5)|0})`;
      ctx.fillRect(x, y, tw, th);

      // Feines Korn auf Kachel
      for (let i = 0; i < 300; i++) {
        const nx = x + Math.random() * tw;
        const ny = y + Math.random() * th;
        const a = Math.random() * 0.035;
        ctx.fillStyle = Math.random() > 0.5
          ? `rgba(255,252,248,${a})` : `rgba(100,96,90,${a})`;
        ctx.fillRect(nx, ny, Math.random() * 10 + 2, 1);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.5, 1);
  tex.anisotropy = 8;
  return (_wallTex = tex);
}

let _floorTex = null;
function getFloorTex() {
  if (_floorTex) return _floorTex;
  const W = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = W;
  const ctx = canvas.getContext('2d');

  const N = 4, S = W / N, GP = 4;
  ctx.fillStyle = '#9c9890';
  ctx.fillRect(0, 0, W, W);

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = c * S + GP, y = r * S + GP;
      const s = S - GP * 2;
      const v = 168 + (Math.random() - 0.5) * 16;
      ctx.fillStyle = `rgb(${v|0},${(v-3)|0},${(v-7)|0})`;
      ctx.fillRect(x, y, s, s);
      for (let i = 0; i < 80; i++) {
        const a = Math.random() * 0.04;
        ctx.fillStyle = Math.random() > 0.5
          ? `rgba(255,252,248,${a})` : `rgba(80,76,70,${a})`;
        ctx.fillRect(x + Math.random() * s, y + Math.random() * s, Math.random() * 8 + 2, 1);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.anisotropy = 8;
  return (_floorTex = tex);
}

// ── Statische Materialien ────────────────────────────────────
let _wMat = null, _tMat = null, _drainMat = null;
const getWMat = () => _wMat || (_wMat = new THREE.MeshStandardMaterial({
  map: getWallTex(), roughness: 0.55, metalness: 0.01, envMapIntensity: 0.20,
}));
const getTMat = () => _tMat || (_tMat = new THREE.MeshStandardMaterial({
  map: getFloorTex(), roughness: 0.38, metalness: 0.02, envMapIntensity: 0.25,
}));
const getDrainMat = () => _drainMat || (_drainMat = new THREE.MeshStandardMaterial({
  color: '#a0a0a0', metalness: 0.92, roughness: 0.12,
}));

// ── Duschnische (Wände + Boden) ──────────────────────────────
function ShowerEnclosure({ w, h }) {
  const backZ  = -(D + WT / 2);
  const sideZ  = -(D / 2);
  const leftX  = -w / 2 - WT / 2;
  const rightX =  w / 2 + WT / 2;
  const floorY = -h / 2 - TH / 2;

  return (
    <group>
      {/* Rückwand */}
      <mesh receiveShadow position={[0, 0, backZ]}>
        <boxGeometry args={[w + WT * 2, h, WT]} />
        <primitive object={getWMat()} attach="material" />
      </mesh>
      {/* Linke Wand */}
      <mesh receiveShadow position={[leftX, 0, sideZ]}>
        <boxGeometry args={[WT, h, D]} />
        <primitive object={getWMat()} attach="material" />
      </mesh>
      {/* Rechte Wand */}
      <mesh receiveShadow position={[rightX, 0, sideZ]}>
        <boxGeometry args={[WT, h, D]} />
        <primitive object={getWMat()} attach="material" />
      </mesh>
      {/* Duschwanne */}
      <mesh receiveShadow position={[0, floorY, sideZ]}>
        <boxGeometry args={[w + WT * 2 + 0.01, TH, D + WT + 0.01]} />
        <primitive object={getTMat()} attach="material" />
      </mesh>
      {/* Ablauffuge */}
      <mesh position={[0, -h / 2 + 0.003, -D * 0.10]}>
        <boxGeometry args={[w * 0.70, 0.004, 0.052]} />
        <primitive object={getDrainMat()} attach="material" />
      </mesh>
    </group>
  );
}

// ── Hilfsfunktion: Profile bedingt rendern ───────────────────
function FrameProfiles({ w, h, rahmentyp, metalMat, noLeft = false, noRight = false }) {
  if (rahmentyp === 'rahmenlos') return null;
  const partial = rahmentyp === 'teilgerahmt';

  return (
    <>
      {/* Oben */}
      <mesh position={[0, h / 2 - P / 2, 0]}>
        <boxGeometry args={[w, P, PH]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Unten – nur vollgerahmt */}
      {!partial && (
        <mesh position={[0, -h / 2 + P / 2, 0]}>
          <boxGeometry args={[w, P, PH]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      )}
      {/* Links */}
      {!noLeft && (
        <mesh position={[-w / 2 + P / 2, 0, 0]}>
          <boxGeometry args={[P, h, PH]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      )}
      {/* Rechts */}
      {!noRight && (
        <mesh position={[w / 2 - P / 2, 0, 0]}>
          <boxGeometry args={[P, h, PH]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      )}
    </>
  );
}

// ── Walk-In ──────────────────────────────────────────────────
function WalkIn({ w, h, t, glassMat, metalMat, rahmentyp }) {
  const rahmenlos = rahmentyp === 'rahmenlos' || !rahmentyp;
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {!rahmenlos && (
        <mesh position={[-w / 2 - P / 2, 0, 0]}>
          <boxGeometry args={[P, h + P, PH]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      )}
      {/* Wandklemmen */}
      {[h / 2 - 0.08, -h / 2 + 0.08].map((y, i) => (
        <mesh key={i} position={[-w / 2 - 0.008, y, 0]}>
          <boxGeometry args={[0.018, 0.06, 0.048]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ── Drehtür ──────────────────────────────────────────────────
function Drehtuer({ w, h, t, glassMat, metalMat, rahmentyp }) {
  const fixW  = w * 0.26;
  const doorW = w - fixW - P * 3;

  return (
    <group>
      {/* Festes Seitenteil (links) */}
      <mesh castShadow position={[-w / 2 + fixW / 2 + P, 0, 0]}>
        <boxGeometry args={[fixW, h - P * 2, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Türblatt */}
      <mesh castShadow position={[w / 2 - doorW / 2 - P, 0, 0]}>
        <boxGeometry args={[doorW, h - P * 2, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Rahmen */}
      <FrameProfiles w={w} h={h} rahmentyp={rahmentyp} metalMat={metalMat} />

      {/* Mittelprofil Türanschlag */}
      <mesh position={[-w / 2 + fixW + P * 1.5, 0, 0]}>
        <boxGeometry args={[P, h - (rahmentyp === 'rahmenlos' ? 0 : P * 2), PH * 1.5]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Scharniere */}
      {[h / 2 - 0.13, -h / 2 + 0.13].map((y, i) => (
        <mesh key={i} position={[-w / 2 + fixW + P * 1.5 + 0.001, y, t / 2 + 0.011]}>
          <cylinderGeometry args={[0.013, 0.013, 0.055, 10]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      ))}

      {/* Griff */}
      <mesh position={[w / 2 - doorW - P * 2 + 0.055, 0, t / 2 + 0.024]}>
        <cylinderGeometry args={[0.009, 0.009, 0.28, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {[0.145, -0.145].map((y, i) => (
        <mesh key={i} position={[w / 2 - doorW - P * 2 + 0.055, y, t / 2 + 0.024]}>
          <sphereGeometry args={[0.011, 8, 8]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ── Schiebetür ───────────────────────────────────────────────
function Schiebetuer({ w, h, t, glassMat, metalMat, rahmentyp }) {
  const pW  = w * 0.57;
  const ovl = pW * 0.13;

  return (
    <group>
      {/* Führungsschienen (immer vorhanden – funktional) */}
      {[h / 2 + P * 0.4, -h / 2 - P * 0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[w, P * 0.6, P * 2.0]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      ))}

      {/* Panel vorne (links) */}
      <mesh castShadow position={[-(w / 2 - pW / 2 - ovl), 0, t * 0.55]}>
        <boxGeometry args={[pW, h - P * 1.4, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Panel hinten (rechts) */}
      <mesh castShadow position={[(w / 2 - pW / 2 - ovl), 0, -t * 0.55]}>
        <boxGeometry args={[pW, h - P * 1.4, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Seitenprofile – abhängig von rahmentyp */}
      {rahmentyp !== 'rahmenlos' && (
        <>
          <mesh position={[-w / 2 + P / 2, 0, 0]}>
            <boxGeometry args={[P, h, PH]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          <mesh position={[w / 2 - P / 2, 0, 0]}>
            <boxGeometry args={[P, h, PH]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
        </>
      )}

      {/* Griffe */}
      {[
        [-(w / 2 - pW / 2 - ovl) + pW * 0.28, t * 0.55 + t / 2 + 0.018],
        [ (w / 2 - pW / 2 - ovl) - pW * 0.28, -t * 0.55 - t / 2 - 0.018],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <cylinderGeometry args={[0.008, 0.008, 0.22, 10]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ── Falttür ──────────────────────────────────────────────────
function Falttuer({ w, h, t, glassMat, metalMat, rahmentyp }) {
  // 2 Paneele: linkes (fest an Wand), rechtes (Tür)
  const panelW = (w - P * 3) / 2;

  return (
    <group>
      {/* Festes Paneel (links) */}
      <mesh castShadow position={[-w / 2 + P + panelW / 2, 0, 0]}>
        <boxGeometry args={[panelW, h - P * 2, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Türpaneel (rechts, leicht vorgezogen) */}
      <mesh castShadow position={[w / 2 - P - panelW / 2, 0, t * 0.4]}>
        <boxGeometry args={[panelW, h - P * 2, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Rahmen */}
      <FrameProfiles w={w} h={h} rahmentyp={rahmentyp} metalMat={metalMat} />

      {/* Mittelprofil (Faltgelenk) */}
      <mesh position={[0, 0, t * 0.2]}>
        <boxGeometry args={[P, h - (rahmentyp === 'rahmenlos' ? 0 : P * 2), PH * 1.2]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Faltgelenk-Zylinder */}
      {[h * 0.25, 0, -h * 0.25].map((y, i) => (
        <mesh key={i} position={[0, y, t * 0.2 + PH * 0.6]}>
          <cylinderGeometry args={[0.010, 0.010, 0.04, 8]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      ))}

      {/* Griff am Türpaneel */}
      <mesh position={[w / 2 - P - 0.04, 0, t * 0.4 + t / 2 + 0.020]}>
        <cylinderGeometry args={[0.008, 0.008, 0.20, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}

const TYPE_COMPONENTS = {
  'Walk-in':    WalkIn,
  'Drehtür':    Drehtuer,
  'Schiebetür': Schiebetuer,
  'Nische':     Schiebetuer,
  'Falttür':    Falttuer,
};

// ── Hauptkomponente ──────────────────────────────────────────
export default function ShowerModel({ config, canvasRef }) {
  const groupRef   = useRef();
  const prevConfig = useRef(null);
  const prevBreite = useRef(config?.breite ?? 90);
  const prevHoehe  = useRef(config?.hoehe  ?? 200);

  const isDragging = useRef(false);
  const dragStart  = useRef({ x: 0, y: 0 });
  const rotStart   = useRef({ x: 0, y: 0 });
  const currentRot = useRef({ x: 0.06, y: -0.28 });

  const glassMat = useGlassMaterial();
  const metalMat = useMetalMaterial();
  const { animScale, animOpacity, triggerTransition, tickAnimation } = useModelAnimation();

  const mapped = useMemo(() => mapConfig(config ?? {}), [config]);
  const { w, h, t, glass, metal, typ } = mapped;

  // Transitions
  useEffect(() => {
    if (!prevConfig.current) { prevConfig.current = config; return; }
    const prev = prevConfig.current;
    const dB = Math.abs((config?.breite ?? 90)  - prevBreite.current);
    const dH = Math.abs((config?.hoehe  ?? 200) - prevHoehe.current);
    if (config?.typ !== prev?.typ) triggerTransition('crossfade');
    else if (config?.glas !== prev?.glas || config?.profil !== prev?.profil) triggerTransition('morph');
    else if (config?.staerke !== prev?.staerke) triggerTransition('pulse');
    else if ((dB > 5 || dH > 5) && dB > 2 && dH > 2) triggerTransition('pulse');
    prevBreite.current = config?.breite ?? 90;
    prevHoehe.current  = config?.hoehe  ?? 200;
    prevConfig.current = config;
  }, [config]);

  // Drag-Rotate
  useEffect(() => {
    if (!canvasRef?.current) return;
    const el = canvasRef.current;
    const onDown = (e) => {
      isDragging.current = true;
      el.setPointerCapture(e.pointerId);
      dragStart.current = { x: e.clientX, y: e.clientY };
      rotStart.current  = { ...currentRot.current };
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      currentRot.current.y = rotStart.current.y + (e.clientX - dragStart.current.x) * 0.007;
      currentRot.current.x = Math.max(-0.30, Math.min(0.30,
        rotStart.current.x + (e.clientY - dragStart.current.y) * 0.007));
    };
    const onUp = () => { isDragging.current = false; };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup',   onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup',   onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [canvasRef]);

  useEffect(() => () => {
    glassMat.current.dispose();
    metalMat.current.dispose();
  }, []);

  useFrame(() => {
    tickAnimation();
    if (groupRef.current) {
      const s = animScale.current;
      groupRef.current.scale.set(s, s, s);
      groupRef.current.rotation.y += (currentRot.current.y - groupRef.current.rotation.y) * 0.07;
      groupRef.current.rotation.x += (currentRot.current.x - groupRef.current.rotation.x) * 0.07;
    }
    updateGlassMaterial(glassMat.current, glass, t, animOpacity.current);
    updateMetalMaterial(metalMat.current, metal);
  });

  const TypeComponent = TYPE_COMPONENTS[typ] ?? WalkIn;

  return (
    <group ref={groupRef} position={[0, -h / 2, 0]}>
      <ShowerEnclosure w={w} h={h} />
      <TypeComponent
        w={w} h={h} t={t}
        glassMat={glassMat.current}
        metalMat={metalMat.current}
        rahmentyp={config?.rahmentyp ?? 'teilgerahmt'}
      />
    </group>
  );
}
