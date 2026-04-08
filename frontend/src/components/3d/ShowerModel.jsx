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

// ── Marmor-Textur: sin-basiertes Domain-Warping (performant) ─
let _wallTex = null;
function getWallTex() {
  if (_wallTex) return _wallTex;
  // 256×256 — ausreichend für 3D-Viewer, keine UI-Blockade
  const W = 256, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = (v) => v < 80 ? 80 : v > 248 ? 248 : v;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W, ny = y / H;

      // Leichtgewichtiges Domain-Warping mit sin-Kaskade
      const wx = nx * 3.8
        + Math.sin(nx * 6.2 + ny * 4.1) * 0.55
        + Math.sin(ny * 9.8 - nx * 3.3) * 0.28
        + Math.sin(nx * 18 + ny * 14)   * 0.12;
      const wy = ny * 5.2
        + Math.sin(ny * 5.5 - nx * 7.3) * 0.50
        + Math.sin(nx * 11  + ny * 8.2) * 0.24
        + Math.sin(ny * 21  - nx * 16)  * 0.10;

      // Hauptadern: schmale, fließende Linien
      const t1 = Math.sin(wx * 1.4 + wy * 1.1);
      const v1 = Math.pow(Math.max(0, 1 - Math.abs(t1)), 3.0) * 88;
      // Feinadern
      const t2 = Math.sin(wx * 3.2 + wy * 2.5 + Math.sin(wx) * 1.2);
      const v2 = Math.pow(Math.max(0, 1 - Math.abs(t2)), 5.5) * 36;
      // Hintergrundrauschen (winzige Körnung)
      const grain = Math.sin(nx * 97 + ny * 137) * 4 + Math.sin(nx * 213 - ny * 179) * 2;

      // Calacatta: helles Creme-Weiß (232), dunkelgraue Adern
      const base = 232 + grain;
      const v    = base - v1 - v2;

      // Leichter Warmton im Untergrund
      const warm = Math.sin(nx * 2.1 + ny * 1.6) * 7;
      const i = (y * W + x) * 4;
      d[i]   = cl(v + warm)       | 0;
      d[i+1] = cl(v + warm * 0.3) | 0;
      d[i+2] = cl(v - warm * 0.5) | 0;
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.0, 0.85);
  tex.anisotropy = 16;
  return (_wallTex = tex);
}

// ── Dunkler Anthrazit-Stein (Duschwanne) ─────────────────────
let _trayTex = null;
function getTrayTex() {
  if (_trayTex) return _trayTex;
  const W = 128;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = W;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, W);
  const d = img.data;

  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W, ny = y / W;
      const grain =
        Math.sin(nx * 41  + ny * 73)  * 6 +
        Math.sin(nx * 127 - ny * 89)  * 4 +
        Math.sin(nx * 211 + ny * 163) * 2;
      const v = Math.max(20, Math.min(58, 36 + grain));
      const i = (y * W + x) * 4;
      d[i] = v | 0; d[i+1] = v | 0; d[i+2] = (v + 3) | 0; d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 8;
  return (_trayTex = tex);
}

// Inline JSX-Materialien werden weiter unten direkt in den Meshes definiert.
// Keine Singletons für statische Materialien — verhindert R3F-Cleanup-Crash.

// ── Decken-Regendusche (schwarzes Design) ────────────────────
function RainShower({ w, h }) {
  const headW  = Math.min(w * 0.42, 0.38);
  const headD  = Math.min(D * 0.44, 0.28);
  const armLen = 0.28;
  const topY   = h / 2;
  const headZ  = -(D - armLen) + 0.01;

  return (
    <group>
      <mesh position={[0, topY - 0.018, -(D - armLen / 2)]}>
        <boxGeometry args={[0.020, 0.020, armLen]} />
        <meshStandardMaterial color="#141414" metalness={0.82} roughness={0.22} envMapIntensity={0.8} />
      </mesh>
      <mesh position={[0, topY - 0.055, headZ]}>
        <boxGeometry args={[0.020, 0.074, 0.020]} />
        <meshStandardMaterial color="#141414" metalness={0.82} roughness={0.22} envMapIntensity={0.8} />
      </mesh>
      <mesh castShadow position={[0, topY - 0.094, headZ]}>
        <boxGeometry args={[headW, 0.016, headD]} />
        <meshStandardMaterial color="#141414" metalness={0.82} roughness={0.22} envMapIntensity={0.8} />
      </mesh>
      <mesh position={[0, topY - 0.103, headZ]}>
        <boxGeometry args={[headW - 0.012, 0.002, headD - 0.012]} />
        <meshStandardMaterial color="#888888" metalness={0.95} roughness={0.08} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
}

// ── Duschnische (Wände + Boden) ──────────────────────────────
function ShowerEnclosure({ w, h }) {
  const backZ  = -(D + WT / 2);
  const sideZ  = -(D / 2);
  const leftX  = -w / 2 - WT / 2;
  const rightX =  w / 2 + WT / 2;
  const floorY = -h / 2 - TH / 2;

  const wallTex  = getWallTex();
  const trayTex  = getTrayTex();

  return (
    <group>
      {/* Rückwand */}
      <mesh receiveShadow position={[0, 0, backZ]}>
        <boxGeometry args={[w + WT * 2, h, WT]} />
        <meshStandardMaterial map={wallTex} roughness={0.12} metalness={0.02} envMapIntensity={0.55} />
      </mesh>
      {/* Linke Wand */}
      <mesh receiveShadow position={[leftX, 0, sideZ]}>
        <boxGeometry args={[WT, h, D]} />
        <meshStandardMaterial map={wallTex} roughness={0.12} metalness={0.02} envMapIntensity={0.55} />
      </mesh>
      {/* Rechte Wand */}
      <mesh receiveShadow position={[rightX, 0, sideZ]}>
        <boxGeometry args={[WT, h, D]} />
        <meshStandardMaterial map={wallTex} roughness={0.12} metalness={0.02} envMapIntensity={0.55} />
      </mesh>

      {/* Duschwanne (polierter Anthrazit) */}
      <mesh receiveShadow position={[0, floorY, sideZ]}>
        <boxGeometry args={[w + WT * 2 + 0.01, TH, D + WT + 0.01]} />
        <meshStandardMaterial map={trayTex} roughness={0.06} metalness={0.08} envMapIntensity={0.70} />
      </mesh>
      {/* Vordere Wannenlippe */}
      <mesh position={[0, -h / 2 + 0.008, -0.006]}>
        <boxGeometry args={[w + WT * 2 + 0.01, 0.016, 0.012]} />
        <meshStandardMaterial map={trayTex} roughness={0.06} metalness={0.08} envMapIntensity={0.70} />
      </mesh>

      {/* Rinnenablauf-Abdeckung (Edelstahl) */}
      <mesh position={[0, -h / 2 + 0.006, -(D - 0.032)]}>
        <boxGeometry args={[w * 0.85, 0.003, 0.034]} />
        <meshStandardMaterial color="#909090" metalness={0.95} roughness={0.08} envMapIntensity={1.2} />
      </mesh>

      {/* Decken-Regendusche */}
      <RainShower w={w} h={h} />
    </group>
  );
}

// ── Hilfsfunktion: Profile bedingt rendern ───────────────────
// vollgerahmt = kräftige Profile rundum; teilgerahmt = schmale Profile oben+seiten; rahmenlos = null
function FrameProfiles({ w, h, rahmentyp, metalMat, noLeft = false, noRight = false }) {
  if (rahmentyp === 'rahmenlos') return null;
  const partial = rahmentyp === 'teilgerahmt';
  // vollgerahmt: deutlich breitere Profile für sichtbaren Unterschied
  const pw  = partial ? P       : P * 1.7;   // Profilbreite
  const phe = partial ? PH      : PH * 1.5;  // Profiltiefe

  return (
    <>
      {/* Oben */}
      <mesh position={[0, h / 2 - pw / 2, 0]}>
        <boxGeometry args={[w, pw, phe]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Unten – nur vollgerahmt */}
      {!partial && (
        <mesh position={[0, -h / 2 + pw / 2, 0]}>
          <boxGeometry args={[w, pw, phe]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      )}
      {/* Links */}
      {!noLeft && (
        <mesh position={[-w / 2 + pw / 2, 0, 0]}>
          <boxGeometry args={[pw, h, phe]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      )}
      {/* Rechts */}
      {!noRight && (
        <mesh position={[w / 2 - pw / 2, 0, 0]}>
          <boxGeometry args={[pw, h, phe]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      )}
    </>
  );
}

// ── Walk-In ──────────────────────────────────────────────────
function WalkIn({ w, h, t, glassMat, metalMat, rahmentyp }) {
  const rahmenlos  = rahmentyp === 'rahmenlos' || !rahmentyp;
  const voll       = rahmentyp === 'vollgerahmt';
  const pw         = voll ? P * 1.7 : P;
  const phe        = voll ? PH * 1.5 : PH;

  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w - (rahmenlos ? 0 : pw * 2), h - (voll ? pw * 2 : 0), t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Seiten- und Querprofile je nach rahmentyp */}
      {!rahmenlos && (
        <>
          {/* Linkes Seitenprofil (Wandseite) */}
          <mesh position={[-w / 2 + pw / 2, 0, 0]}>
            <boxGeometry args={[pw, h, phe]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          {/* Oberes Querprofil */}
          <mesh position={[0, h / 2 - pw / 2, 0]}>
            <boxGeometry args={[w, pw, phe]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          {/* Unteres Querprofil – nur vollgerahmt */}
          {voll && (
            <mesh position={[0, -h / 2 + pw / 2, 0]}>
              <boxGeometry args={[w, pw, phe]} />
              <primitive object={metalMat} attach="material" />
            </mesh>
          )}
        </>
      )}

      {/* Wandklemmen (rahmenlos) */}
      {rahmenlos && [h / 2 - 0.08, -h / 2 + 0.08].map((y, i) => (
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

// ── Duscharmatur: Stange + Handbrause + Thermostat ───────────
function ShowerFixture({ w, h, metalMat }) {
  const x  = -w / 2 + 0.023;   // innere linke Wand + 23 mm
  const bz = -(D * 0.38);       // 38 % Tiefe
  const tY = -h / 2 + 1.00;    // Thermostat 100 cm ab Boden
  const barCY = -h / 2 + 0.68; // Stangenmitte

  return (
    <group>
      {/* ── Thermostatarmatur ── */}
      <mesh position={[x, tY, bz]}>
        <boxGeometry args={[0.040, 0.060, 0.140]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Knopf Temperatur (links, größer) */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[x + 0.032, tY + 0.010, bz - 0.040]}>
        <cylinderGeometry args={[0.020, 0.020, 0.024, 16]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Knopf Menge (rechts, kleiner) */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[x + 0.032, tY + 0.010, bz + 0.040]}>
        <cylinderGeometry args={[0.015, 0.015, 0.024, 16]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Auslaufstutzen */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[x + 0.036, tY - 0.018, bz]}>
        <cylinderGeometry args={[0.009, 0.009, 0.016, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* ── Wandstange ── */}
      <mesh position={[x, barCY, bz]}>
        <cylinderGeometry args={[0.010, 0.010, 0.60, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Halterung oben */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[x - 0.004, barCY + 0.28, bz]}>
        <cylinderGeometry args={[0.016, 0.016, 0.020, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Halterung unten */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[x - 0.004, barCY - 0.28, bz]}>
        <cylinderGeometry args={[0.016, 0.016, 0.020, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* ── Handbrausen-Schlitten ── */}
      <mesh position={[x + 0.004, barCY + 0.10, bz]}>
        <boxGeometry args={[0.034, 0.044, 0.034]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Anschlussrohr Schlitten → Kopf */}
      <mesh rotation={[0.35, 0, 0]} position={[x + 0.038, barCY + 0.06, bz + 0.042]}>
        <cylinderGeometry args={[0.007, 0.007, 0.072, 8]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Handbrause-Kopf */}
      <mesh rotation={[Math.PI / 2 - 0.35, 0, 0]} position={[x + 0.044, barCY + 0.03, bz + 0.076]}>
        <cylinderGeometry args={[0.030, 0.026, 0.018, 14]} />
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
  const velocity   = useRef({ x: 0, y: 0 });
  const prevMouse  = useRef({ x: 0, y: 0 });

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
      currentRot.current.y = rotStart.current.y + (e.clientX - dragStart.current.x) * 0.011;
      currentRot.current.x = Math.max(-0.44, Math.min(0.44,
        rotStart.current.x + (e.clientY - dragStart.current.y) * 0.011));
      // Track velocity for inertia
      velocity.current.y = (e.clientX - prevMouse.current.x) * 0.011;
      velocity.current.x = (e.clientY - prevMouse.current.y) * 0.011;
      prevMouse.current  = { x: e.clientX, y: e.clientY };
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
    // Inertia: continue rotation after release, decay with friction
    if (!isDragging.current) {
      const vy = velocity.current.y, vx = velocity.current.x;
      if (Math.abs(vy) > 0.00008 || Math.abs(vx) > 0.00008) {
        currentRot.current.y += vy;
        currentRot.current.x = Math.max(-0.44, Math.min(0.44, currentRot.current.x + vx));
        velocity.current.y *= 0.88;
        velocity.current.x *= 0.88;
      }
    }
    if (groupRef.current) {
      const s = animScale.current;
      groupRef.current.scale.set(s, s, s);
      groupRef.current.rotation.y += (currentRot.current.y - groupRef.current.rotation.y) * 0.20;
      groupRef.current.rotation.x += (currentRot.current.x - groupRef.current.rotation.x) * 0.20;
    }
    updateGlassMaterial(glassMat.current, glass, t, animOpacity.current);
    updateMetalMaterial(metalMat.current, metal);
  });

  const TypeComponent = TYPE_COMPONENTS[typ] ?? WalkIn;

  return (
    <group ref={groupRef} position={[0, -h / 2, 0]}>
      <ShowerEnclosure w={w} h={h} />
      <ShowerFixture w={w} h={h} metalMat={metalMat.current} />
      <TypeComponent
        w={w} h={h} t={t}
        glassMat={glassMat.current}
        metalMat={metalMat.current}
        rahmentyp={config?.rahmentyp ?? 'teilgerahmt'}
      />
    </group>
  );
}
