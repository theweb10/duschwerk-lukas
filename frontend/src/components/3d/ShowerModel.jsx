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

// ── Prozedurales Rauschen (Value Noise + FBM) ────────────────
function _sh(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }
function _sf(t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
function _svn(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = _sf(x - xi), v = _sf(y - yi);
  return _sh(xi,yi)*(1-u)*(1-v) + _sh(xi+1,yi)*u*(1-v) + _sh(xi,yi+1)*(1-u)*v + _sh(xi+1,yi+1)*u*v;
}
function _sfbm(x, y, oct = 5) {
  let s = 0, a = 0.5, f = 1.0, n = 0;
  for (let i = 0; i < oct; i++) { s += _svn(x*f,y*f)*a; n+=a; a*=0.5; f*=2.07; }
  return s / n;
}
function _swfbm(x, y) {
  const wx = _sfbm(x,y,4)*3.0, wy = _sfbm(x+5.2,y+1.3,4)*3.0;
  return _sfbm(x+wx, y+wy, 4);
}

// ── Wandfliesen: Großformat 120×240 cm Bianco Statuario Porzellan ────
// Subtile Marmor-Maserung, ultra-poliert, kaum sichtbare Fugen
let _wallTex = null;
function getWallTex() {
  if (_wallTex) return _wallTex;
  const W = 1024, H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;

  // Großformat 120×240 cm → 1 Fliese breit, 2 hoch pro Textur (sehr wenig Fugen)
  const TW = W, TH = H / 2;
  const GR = 3; // nur 3px Fuge — kaum sichtbar

  // Vein-Hilfsfunktion (wie in Marmor)
  function vein(f, thr, sharp) {
    const dist = Math.abs(f * 2.0 - 1.0);
    return dist < thr ? Math.pow(1.0 - dist / thr, sharp) : 0.0;
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const tx = x % TW, ty = y % TH;
      const tileX = (x / TW) | 0, tileY = (y / TH) | 0;
      const isGrout = tx < GR || ty < GR;
      let r, g, b;

      if (isGrout) {
        // Feiner Grau-Grout, kaum sichtbar
        const gn = (_svn(x * 0.4, y * 0.4) - 0.5) * 5;
        r = cl(195 + gn); g = cl(196 + gn); b = cl(198 + gn);
      } else {
        // Normalisierte Koordinaten pro Fliese
        const nx = (tx / TW) * 3.5 + tileX * 2.3;
        const ny = (ty / TH) * 4.0 + tileY * 1.8;

        // Subtile Wolken-Basis (sehr hell, fast weiß)
        const cloud = (_sfbm(nx * 0.4, ny * 0.35, 5) - 0.5) * 12;
        const micro = (_svn(x * 0.5, y * 0.5) - 0.5) * 2;
        const tVar  = (_sh(tileX * 41.2, tileY * 73.6) - 0.5) * 6;
        const base  = 251 + tVar + cloud + micro;

        // Feine Statuario-Äderung (sehr dezent, grau-blau)
        const wx = _sfbm(nx * 0.6,       ny * 0.5,       4) * 2.8;
        const wy = _sfbm(nx * 0.6 + 5.1, ny * 0.5 + 2.3, 4) * 2.8;
        const f1  = _sfbm(nx * 0.8 + wx, ny * 0.7 + wy,  5);
        const v1  = vein(f1, 0.22, 2.5) * 0.6 + vein(f1, 0.08, 4.0) * 0.4;
        const f2  = _sfbm(nx * 1.8 + 1.2, ny * 1.6 + 2.8, 4);
        const v2  = vein(f2, 0.14, 3.0) * 0.5;

        const dk = v1 * 38 + v2 * 18;
        // Leichter Blau-Grau-Ton in den Ädern (typisch Statuario)
        r = cl(base - dk * 0.85);
        g = cl(base - dk * 0.90);
        b = cl(base - dk * 0.65 + 4);
      }
      const i = (y * W + x) * 4;
      d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.9, 1.0);
  tex.anisotropy = 16;
  return (_wallTex = tex);
}

// ── Duschwanne: Anthrazit-Schiefer (512 px, FBM) ─────────────
let _trayTex = null;
function getTrayTex() {
  if (_trayTex) return _trayTex;
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cl = v => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W * 4.5, ny = y / H * 4.5;
      const wf   = _swfbm(nx * 0.8, ny * 0.8);
      const fine  = _sfbm(nx * 3.0, ny * 3.0, 4);
      const micro = (_svn(x * 0.6, y * 0.6) - 0.5) * 4;
      // Anthrazit: dunkles kühles Grau
      const base = 56 + (wf - 0.5) * 24 + (fine - 0.5) * 12 + micro;
      const i = (y * W + x) * 4;
      d[i]   = cl(base + 2);
      d[i+1] = cl(base + 2);
      d[i+2] = cl(base + 4);
      d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 2.5);
  tex.anisotropy = 16;
  return (_trayTex = tex);
}

// Inline JSX-Materialien werden weiter unten direkt in den Meshes definiert.
// Keine Singletons für statische Materialien — verhindert R3F-Cleanup-Crash.

// ── Decken-Regendusche — Premium Quadrat-Kopf (Axor/Hansgrohe) ──────
function RainShower({ w, h }) {
  const headW  = Math.min(w * 0.44, 0.40);
  const headD  = Math.min(D * 0.46, 0.30);
  const armLen = 0.32;
  const topY   = h / 2;
  const headZ  = -(D - armLen) + 0.01;
  const MC = { color: '#dcdcdc', metalness: 0.97, roughness: 0.03, envMapIntensity: 2.2 };
  const MF = { color: '#909090', metalness: 0.97, roughness: 0.06, envMapIntensity: 1.8 };

  return (
    <group>
      {/* Deckenanschluss-Rosette */}
      <mesh position={[0, topY - 0.006, -(D - armLen)]}>
        <cylinderGeometry args={[0.022, 0.022, 0.012, 18]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Deckrohr (rund, poliert) */}
      <mesh position={[0, topY - 0.012, -(D - armLen / 2)]}>
        <cylinderGeometry args={[0.010, 0.010, armLen, 14]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Knickstück oben */}
      <mesh position={[0, topY - 0.022, headZ]}>
        <sphereGeometry args={[0.013, 12, 10]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Vertikales Verbindungsrohr */}
      <mesh position={[0, topY - 0.050, headZ]}>
        <cylinderGeometry args={[0.009, 0.009, 0.058, 14]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Brausekopf-Körper (flacher Quader mit abgerundeten Ecken durch Zylinder-Trick) */}
      <mesh castShadow position={[0, topY - 0.086, headZ]}>
        <boxGeometry args={[headW, 0.018, headD - 0.03 * 2]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      <mesh castShadow position={[0, topY - 0.086, headZ]}>
        <boxGeometry args={[headW - 0.03 * 2, 0.018, headD]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Düsenfläche (dunkel, mit feiner Textur-Andeutung) */}
      <mesh position={[0, topY - 0.096, headZ]}>
        <boxGeometry args={[headW - 0.008, 0.003, headD - 0.008 - 0.03 * 2]} />
        <meshStandardMaterial {...MF} />
      </mesh>
      <mesh position={[0, topY - 0.096, headZ]}>
        <boxGeometry args={[headW - 0.008 - 0.03 * 2, 0.003, headD - 0.008]} />
        <meshStandardMaterial {...MF} />
      </mesh>
      {/* Chromring aussen */}
      <mesh position={[0, topY - 0.082, headZ]}>
        <boxGeometry args={[headW, 0.004, headD - 0.03 * 2]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.98} roughness={0.02} envMapIntensity={2.5} />
      </mesh>
      <mesh position={[0, topY - 0.082, headZ]}>
        <boxGeometry args={[headW - 0.03 * 2, 0.004, headD]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.98} roughness={0.02} envMapIntensity={2.5} />
      </mesh>
    </group>
  );
}

// ── Duschnische (Wände + Boden) ──────────────────────────────
function ShowerEnclosure({ w, h, einbausituation = 'nische' }) {
  const hasRightWall = einbausituation === 'nische';
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
        <boxGeometry args={[hasRightWall ? w + WT * 2 : w + WT, h, WT]} />
        <meshStandardMaterial map={wallTex} roughness={0.03} metalness={0.02} envMapIntensity={0.75} />
      </mesh>
      {/* Linke Wand */}
      <mesh receiveShadow position={[leftX, 0, sideZ]}>
        <boxGeometry args={[WT, h, D]} />
        <meshStandardMaterial map={wallTex} roughness={0.03} metalness={0.02} envMapIntensity={0.75} />
      </mesh>
      {/* Rechte Wand — nur Nische */}
      {hasRightWall && (
        <mesh receiveShadow position={[rightX, 0, sideZ]}>
          <boxGeometry args={[WT, h, D]} />
          <meshStandardMaterial map={wallTex} roughness={0.03} metalness={0.02} envMapIntensity={0.75} />
        </mesh>
      )}

      {/* Duschwanne (heller Stein/Acryl) — Rückseite bündig mit Außenwand */}
      <mesh receiveShadow position={[0, floorY, -(D / 2 + WT / 2)]}>
        <boxGeometry args={[hasRightWall ? w + WT * 2 + 0.01 : w + WT + 0.01, TH, D + WT + 0.01]} />
        <meshStandardMaterial map={trayTex} roughness={0.18} metalness={0.02} envMapIntensity={0.40} />
      </mesh>
      {/* Vordere Wannenlippe */}
      <mesh position={[0, -h / 2 + 0.008, -0.006]}>
        <boxGeometry args={[hasRightWall ? w + WT * 2 + 0.01 : w + WT + 0.01, 0.016, 0.012]} />
        <meshStandardMaterial map={trayTex} roughness={0.18} metalness={0.02} envMapIntensity={0.40} />
      </mesh>

      {/* Rinnenablauf-Abdeckung (Edelstahl) */}
      <mesh position={[0, -h / 2 + 0.006, -(D - 0.032)]}>
        <boxGeometry args={[w * 0.85, 0.003, 0.034]} />
        <meshStandardMaterial color="#909090" metalness={0.95} roughness={0.08} envMapIntensity={1.2} />
      </mesh>

      {/* Ablauf: nur schlanke Edelstahl-Rinne an der Rückwand */}

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
          {/* Rechtes Seitenprofil */}
          <mesh position={[w / 2 - pw / 2, 0, 0]}>
            <boxGeometry args={[pw, h, phe]} />
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
function Drehtuer({ w, h, t, glassMat, metalMat, rahmentyp, doorOpen }) {
  const voll    = rahmentyp === 'vollgerahmt';
  const pw      = voll ? P * 1.7 : P;
  const glassH  = rahmentyp === 'rahmenlos' ? h : h - pw * 2;
  const innerW  = rahmentyp === 'rahmenlos' ? w : w - pw * 2;
  const fixW    = innerW * 0.30;
  const doorW   = innerW - fixW - P;
  const midX    = -w / 2 + (rahmentyp === 'rahmenlos' ? 0 : pw) + fixW + P / 2;
  // Scharnier-Pivot = linke Kante des Türblatts
  const hingeX  = midX + P / 2;

  const doorGroupRef = useRef();
  const angleRef     = useRef(0);

  useFrame(() => {
    const target = doorOpen ? Math.PI * 0.48 : 0;
    angleRef.current += (target - angleRef.current) * 0.07;
    if (doorGroupRef.current) {
      doorGroupRef.current.rotation.y = -angleRef.current;
    }
  });

  return (
    <group>
      {/* Festes Seitenteil (links) */}
      <mesh castShadow position={[-w / 2 + (rahmentyp === 'rahmenlos' ? 0 : pw) + fixW / 2, 0, 0]}>
        <boxGeometry args={[fixW, glassH, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Türblatt — dreht um Scharnier-Pivot */}
      <group ref={doorGroupRef} position={[hingeX, 0, 0]}>
        <mesh castShadow position={[doorW / 2, 0, 0]}>
          <boxGeometry args={[doorW, glassH, t]} />
          <primitive object={glassMat} attach="material" />
        </mesh>
        {/* Griff am Türblatt */}
        <mesh position={[doorW * 0.72, 0, t / 2 + 0.024]}>
          <cylinderGeometry args={[0.009, 0.009, 0.28, 10]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
        {[0.145, -0.145].map((y, i) => (
          <mesh key={i} position={[doorW * 0.72, y, t / 2 + 0.024]}>
            <sphereGeometry args={[0.011, 8, 8]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
        ))}
        {/* Scharniere (am Pivot) */}
        {[h / 2 - 0.13, -h / 2 + 0.13].map((y, i) => (
          <mesh key={i} position={[0, y, t / 2 + 0.011]}>
            <cylinderGeometry args={[0.013, 0.013, 0.055, 10]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Rahmen */}
      <FrameProfiles w={w} h={h} rahmentyp={rahmentyp} metalMat={metalMat} />

      {/* Mittelprofil Türanschlag */}
      <mesh position={[midX, 0, 0]}>
        <boxGeometry args={[P, h - (rahmentyp === 'rahmenlos' ? 0 : pw * 2), PH * 1.5]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}

// ── Schiebetür ───────────────────────────────────────────────
function Schiebetuer({ w, h, t, glassMat, metalMat, rahmentyp, doorOpen }) {
  const voll    = rahmentyp === 'vollgerahmt';
  const pw      = voll ? P * 1.7 : P;
  const innerW  = rahmentyp === 'rahmenlos' ? w : w - pw * 2;
  const pW      = innerW * 0.52;
  const glassH  = rahmentyp === 'rahmenlos' ? h - P * 1.4 : h - pw * 2;
  const off     = rahmentyp === 'rahmenlos' ? 0 : pw;
  const frontX  = -(w / 2 - off - pW / 2);
  const backX   =   w / 2 - off - pW / 2;

  const frontRef  = useRef();
  const slideRef  = useRef(0);

  useFrame(() => {
    const target = doorOpen ? pW * 0.86 : 0;
    slideRef.current += (target - slideRef.current) * 0.07;
    if (frontRef.current) {
      frontRef.current.position.x = frontX + slideRef.current;
    }
  });

  return (
    <group>
      {/* Panel vorne (links) — animiert */}
      <group ref={frontRef} position={[frontX, 0, t * 0.55]}>
        <mesh castShadow>
          <boxGeometry args={[pW, glassH, t]} />
          <primitive object={glassMat} attach="material" />
        </mesh>
        {/* Griff vorne */}
        <mesh position={[pW * 0.28, 0, t / 2 + 0.018]}>
          <cylinderGeometry args={[0.008, 0.008, 0.22, 10]} />
          <primitive object={metalMat} attach="material" />
        </mesh>
      </group>

      {/* Panel hinten (rechts) — statisch */}
      <mesh castShadow position={[backX, 0, -t * 0.55]}>
        <boxGeometry args={[pW, glassH, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Griff hinten */}
      <mesh position={[backX - pW * 0.28, 0, -t * 0.55 - t / 2 - 0.018]}>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Rahmenprofile */}
      <FrameProfiles w={w} h={h} rahmentyp={rahmentyp} metalMat={metalMat} />

      {/* Führungsschienen – nur rahmenlos */}
      {rahmentyp === 'rahmenlos' && (
        [h / 2 + P * 0.4, -h / 2 - P * 0.4].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[w, P * 0.6, P * 2.0]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
        ))
      )}
    </group>
  );
}

// ── Falttür ──────────────────────────────────────────────────
// Korrekte Falttür-Mechanik:
//   - Wandscharnier an der linken Kante des linken Paneels
//   - Faltgelenk in der Mitte (rechte Kante des linken Paneels)
//   - Beim Öffnen: linkes Paneel dreht sich ins Bad (wallHinge +alpha)
//     rechtes Paneel dreht sich relativ dazu zurück (-2*alpha)
//   → Beide hälften falten sich wie ein echtes Buch / eine echte Falttür
function Falttuer({ w, h, t, glassMat, metalMat, rahmentyp, doorOpen }) {
  const voll       = rahmentyp === 'vollgerahmt';
  const pw         = voll ? P * 1.7 : P;
  const innerW     = rahmentyp === 'rahmenlos' ? w : w - pw * 2;
  const panelW     = (innerW - P) / 2;
  const glassH     = rahmentyp === 'rahmenlos' ? h : h - pw * 2;
  const off        = rahmentyp === 'rahmenlos' ? 0 : pw;

  // Wandscharnier: linke Kante des linken Paneels
  const wallHingeX   = -w / 2 + off;
  // Faltgelenk: rechte Kante des linken Paneels (in Wandscharnier-Lokalraum)
  const foldHingeX   = panelW + P / 2;

  const wallRef  = useRef();   // dreht linkes Paneel + ganzen Rest
  const foldRef  = useRef();   // dreht rechtes Paneel relativ zum linken
  const alphaRef = useRef(0);

  useFrame(() => {
    const target = doorOpen ? Math.PI * 0.40 : 0;
    alphaRef.current += (target - alphaRef.current) * 0.07;
    const a = alphaRef.current;
    // Wandscharnier dreht BEIDE Paneele ins Bad
    if (wallRef.current)  wallRef.current.rotation.y  =  a;
    // Faltgelenk dreht rechtes Paneel zurück → Faltform entsteht
    if (foldRef.current)  foldRef.current.rotation.y  = -2 * a;
  });

  return (
    <group>
      {/* ── Wandscharnier-Gruppe (pivot = linke Wand) ────────── */}
      <group ref={wallRef} position={[wallHingeX, 0, 0]}>

        {/* Linkes Glas-Paneel */}
        <mesh castShadow position={[panelW / 2, 0, 0]}>
          <boxGeometry args={[panelW, glassH, t]} />
          <primitive object={glassMat} attach="material" />
        </mesh>

        {/* Faltgelenk-Gruppe (pivot = Mitte der Tür) */}
        <group position={[foldHingeX, 0, 0]}>

          {/* Faltprofil — bewegt sich mit dem Gelenk */}
          <mesh position={[0, 0, t * 0.15]}>
            <boxGeometry args={[P, h - (rahmentyp === 'rahmenlos' ? 0 : pw * 2), PH * 1.2]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          {[h * 0.25, 0, -h * 0.25].map((y, i) => (
            <mesh key={i} position={[0, y, t * 0.15 + PH * 0.6]}>
              <cylinderGeometry args={[0.010, 0.010, 0.04, 8]} />
              <primitive object={metalMat} attach="material" />
            </mesh>
          ))}

          {/* Rechtes Paneel dreht sich relativ zum linken */}
          <group ref={foldRef}>
            <mesh castShadow position={[panelW / 2, 0, 0]}>
              <boxGeometry args={[panelW, glassH, t]} />
              <primitive object={glassMat} attach="material" />
            </mesh>
            {/* Griff an der Außenkante */}
            <mesh position={[panelW * 0.82, 0, t / 2 + 0.020]}>
              <cylinderGeometry args={[0.008, 0.008, 0.20, 10]} />
              <primitive object={metalMat} attach="material" />
            </mesh>
          </group>
        </group>
      </group>

      {/* Rahmen (statisch) */}
      <FrameProfiles w={w} h={h} rahmentyp={rahmentyp} metalMat={metalMat} />
    </group>
  );
}

// ── Duscharmatur: Premium-Thermostat + Handbrause (Hansgrohe/Axor) ──
function ShowerFixture({ h }) {
  const z       = -D + 0.026;
  const tY      = -h / 2 + 1.02;   // Thermostat-Mitte 102 cm
  const barTopY = -h / 2 + 1.00;
  const barBotY = -h / 2 + 0.36;
  const barCY   = (barTopY + barBotY) / 2;
  const barH    = barTopY - barBotY;
  const barX    = 0.095;            // Wandstange rechts vom Thermostat

  const MC  = { color: '#dcdcdc', metalness: 0.97, roughness: 0.03, envMapIntensity: 2.2 };
  const MCA = { color: '#c0c0c0', metalness: 0.98, roughness: 0.02, envMapIntensity: 2.6 };
  const MCD = { color: '#888888', metalness: 0.96, roughness: 0.08, envMapIntensity: 1.6 };

  return (
    <group>
      {/* ── Thermostatarmatur (Hansgrohe ShowerSelect-Stil) ── */}
      {/* Hauptkörper: schlankes Rechteckprofil */}
      <mesh position={[0, tY, z]}>
        <boxGeometry args={[0.195, 0.072, 0.038]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Obere Zier-Kante */}
      <mesh position={[0, tY + 0.033, z + 0.012]}>
        <boxGeometry args={[0.195, 0.003, 0.026]} />
        <meshStandardMaterial {...MCA} />
      </mesh>
      {/* Untere Zier-Kante */}
      <mesh position={[0, tY - 0.033, z + 0.012]}>
        <boxGeometry args={[0.195, 0.003, 0.026]} />
        <meshStandardMaterial {...MCA} />
      </mesh>
      {/* Großer Walzengriff Temperatur (links) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.055, tY, z + 0.030]}>
        <cylinderGeometry args={[0.024, 0.024, 0.032, 20]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Griff-Markierung (Strich oben) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.055, tY + 0.014, z + 0.047]}>
        <boxGeometry args={[0.004, 0.032, 0.003]} />
        <meshStandardMaterial {...MCD} />
      </mesh>
      {/* Kleiner Walzengriff Durchfluss (rechts) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.055, tY, z + 0.030]}>
        <cylinderGeometry args={[0.017, 0.017, 0.032, 16]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Wandrosetten (links + rechts) */}
      {[-0.078, 0.078].map((dx, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[dx, tY, z - 0.004]}>
          <cylinderGeometry args={[0.013, 0.013, 0.006, 14]} />
          <meshStandardMaterial {...MC} />
        </mesh>
      ))}
      {/* Verbindungsrohr Thermostat → Wandstange (unten) */}
      <mesh position={[(0 + barX) / 2, tY - 0.028, z + 0.010]}>
        <cylinderGeometry args={[0.006, 0.006, 0.100, 10]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial {...MC} />
      </mesh>

      {/* ── Wandstange (polierter Chrom-Rundstab) ── */}
      <mesh position={[barX, barCY, z]}>
        <cylinderGeometry args={[0.007, 0.007, barH, 14]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Wandhalterung oben */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[barX, barTopY, z - 0.005]}>
        <cylinderGeometry args={[0.013, 0.013, 0.020, 14]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Wandhalterung unten */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[barX, barBotY, z - 0.005]}>
        <cylinderGeometry args={[0.013, 0.013, 0.020, 14]} />
        <meshStandardMaterial {...MC} />
      </mesh>

      {/* ── Handbrausen-Schlitten ── */}
      <mesh position={[barX, barCY + 0.12, z + 0.002]}>
        <boxGeometry args={[0.028, 0.052, 0.028]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Schlauch-Anschluss */}
      <mesh rotation={[0.42, 0, 0]} position={[barX, barCY + 0.072, z + 0.050]}>
        <cylinderGeometry args={[0.005, 0.005, 0.080, 10]} />
        <meshStandardMaterial {...MC} />
      </mesh>

      {/* ── Handbrause (flache Premium-Scheibe) ── */}
      {/* Äußerer Chromring */}
      <mesh rotation={[Math.PI / 2 - 0.42, 0, 0]} position={[barX, barCY + 0.025, z + 0.090]}>
        <cylinderGeometry args={[0.042, 0.038, 0.020, 22]} />
        <meshStandardMaterial {...MC} />
      </mesh>
      {/* Düsenfläche (dunkel, quadratischer Raster angedeutet) */}
      <mesh rotation={[Math.PI / 2 - 0.42, 0, 0]} position={[barX, barCY + 0.014, z + 0.098]}>
        <cylinderGeometry args={[0.032, 0.032, 0.004, 22]} />
        <meshStandardMaterial {...MCD} />
      </mesh>
      {/* Chromkante Innenseite */}
      <mesh rotation={[Math.PI / 2 - 0.42, 0, 0]} position={[barX, barCY + 0.016, z + 0.097]}>
        <torusGeometry args={[0.030, 0.003, 8, 22]} />
        <meshStandardMaterial {...MCA} />
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

// ── Badewannenarmatur ─────────────────────────────────────────
function BathtubFixture({ w, backZ, tubTopY }) {
  const z  = backZ + WT + 0.026;
  const fY = tubTopY + 0.06;
  const M  = { color: '#d4d4d4', metalness: 0.94, roughness: 0.08, envMapIntensity: 1.3 };

  return (
    <group position={[-w * 0.25, 0, 0]}>
      {/* Armaturkörper */}
      <mesh position={[0, fY, z + 0.018]}>
        <boxGeometry args={[0.145, 0.048, 0.034]} />
        <meshStandardMaterial {...M} />
      </mesh>
      {/* Knopf links (Temperatur) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-0.044, fY + 0.008, z + 0.034]}>
        <cylinderGeometry args={[0.020, 0.020, 0.022, 14]} />
        <meshStandardMaterial {...M} />
      </mesh>
      {/* Knopf rechts (Menge) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.044, fY + 0.008, z + 0.034]}>
        <cylinderGeometry args={[0.014, 0.014, 0.022, 12]} />
        <meshStandardMaterial {...M} />
      </mesh>
      {/* Auslaufrohr (Bogen nach unten-vorne) */}
      <mesh position={[0, fY - 0.040, z + 0.052]} rotation={[0.55, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.095, 12]} />
        <meshStandardMaterial {...M} />
      </mesh>
      {/* Auslaufkopf */}
      <mesh position={[0, fY - 0.082, z + 0.086]}>
        <boxGeometry args={[0.030, 0.014, 0.042]} />
        <meshStandardMaterial {...M} />
      </mesh>
    </group>
  );
}

// ── Badewannen-Modell ─────────────────────────────────────────
// Frei stehende Wanne (keine Umrandungswände) mit Glasaufsatz an der Front.
// Wanne aus offenen Seitenpaneelen → Innenbecken von oben sichtbar.
function BathtubModel({ w, h, t, glassMat, metalMat }) {
  const TUB_H  = 0.52;
  const TUB_D  = 1.70;   // realistische Wannenlänge (170 cm, nicht quadratisch)
  const TW     = 0.055;   // Wannenwandstärke (sichtbarer Rand oben)
  const TUB_CY = -h / 2 - TUB_H / 2;
  const sideZ  = -(TUB_D / 2);
  const backZ  = -(TUB_D + WT / 2);
  const TM = { color: '#f4f1e8', roughness: 0.05, metalness: 0.04, envMapIntensity: 0.75 };

  return (
    <group>
      {/* ── Wanne: 4 Seitenpaneele + Boden (offene Oberseite) ── */}
      {/* Frontseite */}
      <mesh castShadow position={[0, TUB_CY, -TW / 2]}>
        <boxGeometry args={[w, TUB_H, TW]} />
        <meshStandardMaterial {...TM} />
      </mesh>
      {/* Rückseite */}
      <mesh castShadow position={[0, TUB_CY, -TUB_D + TW / 2]}>
        <boxGeometry args={[w, TUB_H, TW]} />
        <meshStandardMaterial {...TM} />
      </mesh>
      {/* Linke Seite */}
      <mesh castShadow position={[-w / 2 + TW / 2, TUB_CY, sideZ]}>
        <boxGeometry args={[TW, TUB_H, TUB_D - TW * 2]} />
        <meshStandardMaterial {...TM} />
      </mesh>
      {/* Rechte Seite */}
      <mesh castShadow position={[w / 2 - TW / 2, TUB_CY, sideZ]}>
        <boxGeometry args={[TW, TUB_H, TUB_D - TW * 2]} />
        <meshStandardMaterial {...TM} />
      </mesh>
      {/* Wannenboden (außen) */}
      <mesh castShadow position={[0, TUB_CY - TUB_H / 2 + TW / 2, sideZ]}>
        <boxGeometry args={[w, TW, TUB_D]} />
        <meshStandardMaterial color="#ece8df" roughness={0.06} metalness={0.02} />
      </mesh>
      {/* Wannenboden (innen, sichtbar durch offene Oberseite) */}
      <mesh position={[0, TUB_CY - TUB_H / 2 + TW + 0.002, sideZ]}>
        <boxGeometry args={[w - TW * 2 - 0.008, 0.005, TUB_D - TW * 2 - 0.008]} />
        <meshStandardMaterial color="#dedad1" roughness={0.04} metalness={0.02} envMapIntensity={0.3} />
      </mesh>

      {/* ── Armatur & Abfluss ── */}
      <BathtubFixture w={w} backZ={backZ} tubTopY={-h / 2} />
      <mesh position={[0, TUB_CY - TUB_H / 2 + TW + 0.003, -TUB_D * 0.62]}>
        <cylinderGeometry args={[0.026, 0.026, 0.005, 16]} />
        <meshStandardMaterial color="#c0bab4" metalness={0.92} roughness={0.10} />
      </mesh>

      {/* ── Glasaufsatz an der Wannenfront ── */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[w, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Oberes Profil */}
      <mesh position={[0, h / 2 - P / 2, 0]}>
        <boxGeometry args={[w, P, PH * 1.2]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}

// ── Glaswand-Modell ───────────────────────────────────────────
// Wie im Icon: Rückwand + linke Wand, Glasscheibe als Trennwand in der Mitte,
// Duschbereich (Wanne) hinter dem Glas.
function GlaswandModel({ w, h, t, glassMat, metalMat, rahmentyp }) {
  const GLASS_Z = -(D * 0.50);   // Glasscheibe in der Tiefenmitte
  const backZ   = -(D + WT / 2);
  const leftX   = -w / 2 - WT / 2;
  const floorY  = -h / 2 - TH / 2;
  const wetD    = D * 0.50;      // Tiefe des Nassbereichs hinter dem Glas
  const wetCZ   = GLASS_Z - wetD / 2;
  const wallTex = getWallTex();
  const trayTex = getTrayTex();

  return (
    <group>
      {/* Rückwand */}
      <mesh receiveShadow position={[0, 0, backZ]}>
        <boxGeometry args={[w + WT, h, WT]} />
        <meshStandardMaterial map={wallTex} roughness={0.03} metalness={0.02} envMapIntensity={0.75} />
      </mesh>
      {/* Linke Wand */}
      <mesh receiveShadow position={[leftX, 0, -(D / 2)]}>
        <boxGeometry args={[WT, h, D]} />
        <meshStandardMaterial map={wallTex} roughness={0.03} metalness={0.02} envMapIntensity={0.75} />
      </mesh>
      {/* Duschwanne im Nassbereich (hinter dem Glas) */}
      <mesh receiveShadow position={[0, floorY, wetCZ]}>
        <boxGeometry args={[w + WT + 0.01, TH, wetD + WT + 0.01]} />
        <meshStandardMaterial map={trayTex} roughness={0.12} metalness={0.02} envMapIntensity={0.30} />
      </mesh>
      {/* Rinnenablauf */}
      <mesh position={[0, -h / 2 + 0.006, wetCZ + 0.04]}>
        <boxGeometry args={[w * 0.80, 0.003, 0.034]} />
        <meshStandardMaterial color="#909090" metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Glasscheibe als Trennwand */}
      <group position={[0, 0, GLASS_Z]}>
        <WalkIn w={w} h={h} t={t} glassMat={glassMat} metalMat={metalMat} rahmentyp={rahmentyp} />
      </group>
    </group>
  );
}

// ── Eck-Seitenglas ────────────────────────────────────────────
// Rechtes Seitenpanel für Eckdusche (WalkIn rotiert)
function EckeSideGlass({ w, h, t, glassMat, metalMat, rahmentyp }) {
  return (
    <group position={[w / 2, 0, -(D / 2)]} rotation={[0, -Math.PI / 2, 0]}>
      <WalkIn
        w={D} h={h} t={t}
        glassMat={glassMat} metalMat={metalMat}
        rahmentyp={rahmentyp}
      />
    </group>
  );
}

// ── Hauptkomponente ──────────────────────────────────────────
export default function ShowerModel({ config, doorOpen = false }) {
  const groupRef   = useRef();
  const prevConfig = useRef(null);
  const prevBreite = useRef(config?.breite ?? 90);
  const prevHoehe  = useRef(config?.hoehe  ?? 200);

  const glassMat = useGlassMaterial();
  const metalMat = useMetalMaterial();
  const { animScale, animOpacity, triggerTransition, tickAnimation } = useModelAnimation();

  const mapped = useMemo(() => mapConfig(config ?? {}), [config]);
  const { w, h, t, glass, metal, typ, einbausituation } = mapped;

  // Transitions bei Konfig-Wechsel
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

  useEffect(() => () => {
    glassMat.current.dispose();
    metalMat.current.dispose();
  }, []);

  useFrame(() => {
    tickAnimation();
    if (groupRef.current) {
      const s = animScale.current;
      groupRef.current.scale.set(s, s, s);
    }
    updateGlassMaterial(glassMat.current, glass, t, animOpacity.current);
    updateMetalMaterial(metalMat.current, metal);
  });

  const TypeComponent = TYPE_COMPONENTS[typ] ?? WalkIn;
  const rahmentyp     = config?.rahmentyp ?? 'teilgerahmt';

  return (
    <group ref={groupRef} position={[0, -h / 2, 0]}>
      <>
        <ShowerEnclosure w={w} h={h} einbausituation={einbausituation} />
        <ShowerFixture h={h} />
        <TypeComponent
          w={w} h={h} t={t}
          glassMat={glassMat.current}
          metalMat={metalMat.current}
          rahmentyp={rahmentyp}
          doorOpen={doorOpen}
        />
        {einbausituation === 'ecke' && (
          <EckeSideGlass
            w={w} h={h} t={t}
            glassMat={glassMat.current}
            metalMat={metalMat.current}
            rahmentyp={rahmentyp}
          />
        )}
      </>
    </group>
  );
}
