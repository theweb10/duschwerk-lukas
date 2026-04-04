import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { mapConfig } from './configurator/useShowerConfig';
import { useModelAnimation } from './configurator/useModelAnimation';
import { useGlassMaterial, updateGlassMaterial } from './materials/GlassMaterial';
import { useMetalMaterial, updateMetalMaterial } from './materials/MetalMaterial';

// Profil-Dimensionen (realistisch für Duschkabine)
const P  = 0.025;  // Profil-Breite (25mm)
const PH = 0.018;  // Profil-Tiefe (18mm)

// ── Walk-In ────────────────────────────────────────────────
function WalkIn({ w, h, t, glassMat, metalMat, rahmentyp }) {
  const rahmenlos = rahmentyp === 'rahmenlos' || !rahmentyp;

  return (
    <group>
      {/* Haupt-Glasscheibe */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Profile — nur wenn nicht rahmenlos */}
      {!rahmenlos && (
        <>
          {/* Linkes Wandprofil */}
          <mesh position={[-w / 2 - P / 2, 0, 0]}>
            <boxGeometry args={[P, h + P, PH]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          {/* Oberes Profil */}
          <mesh position={[0, h / 2 + P / 2, 0]}>
            <boxGeometry args={[w + P * 2, P, PH]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
          {/* Unteres Bodenprofil */}
          <mesh position={[0, -h / 2 - P / 2, 0]}>
            <boxGeometry args={[w + P * 2, P, PH]} />
            <primitive object={metalMat} attach="material" />
          </mesh>
        </>
      )}

      {/* Rückseitige Glasscheibe (Stellwand) */}
      <mesh position={[w / 2 + 0.12, 0, -0.12]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.25, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Wandhalterung oben */}
      <mesh position={[-w / 2 - 0.01, h / 2 - 0.08, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.06]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Wandhalterung unten */}
      <mesh position={[-w / 2 - 0.01, -h / 2 + 0.08, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.06]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}

// ── Drehtür ────────────────────────────────────────────────
function Drehtuer({ w, h, t, glassMat, metalMat }) {
  // Türblatt-Breite (80% der Gesamtbreite)
  const doorW = w * 0.82;

  return (
    <group>
      {/* Seitenpanel (fest) */}
      <mesh position={[-w / 2 + (w - doorW) / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - doorW - P, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Türblatt */}
      <mesh position={[w / 2 - doorW / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[doorW, h - P * 2, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Rahmen */}
      {/* Links */}
      <mesh position={[-w / 2 + P / 2, 0, 0]}>
        <boxGeometry args={[P, h, PH]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Rechts */}
      <mesh position={[w / 2 - P / 2, 0, 0]}>
        <boxGeometry args={[P, h, PH]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Oben */}
      <mesh position={[0, h / 2 - P / 2, 0]}>
        <boxGeometry args={[w, P, PH]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Unten */}
      <mesh position={[0, -h / 2 + P / 2, 0]}>
        <boxGeometry args={[w, P, PH]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Türanschlag-Profil (Mitte) */}
      <mesh position={[-w / 2 + (w - doorW) + P / 2, 0, 0]}>
        <boxGeometry args={[P, h, PH]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Scharnier oben */}
      <mesh position={[-w / 2 + (w - doorW) + P, h / 2 - 0.12, t / 2 + 0.012]}>
        <cylinderGeometry args={[0.014, 0.014, 0.07, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Scharnier unten */}
      <mesh position={[-w / 2 + (w - doorW) + P, -h / 2 + 0.12, t / 2 + 0.012]}>
        <cylinderGeometry args={[0.014, 0.014, 0.07, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Griff — vertikale Stange */}
      <mesh position={[w / 2 - 0.07, 0, t / 2 + 0.025]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.28, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Griff-Endkappe oben */}
      <mesh position={[w / 2 - 0.07, 0.15, t / 2 + 0.025]}>
        <sphereGeometry args={[0.011, 8, 8]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Griff-Endkappe unten */}
      <mesh position={[w / 2 - 0.07, -0.15, t / 2 + 0.025]}>
        <sphereGeometry args={[0.011, 8, 8]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}

// ── Schiebetür ─────────────────────────────────────────────
function Schiebetuer({ w, h, t, glassMat, metalMat }) {
  const panelW = w * 0.58;
  const overlap = panelW * 0.15; // Überlappungsbereich

  return (
    <group>
      {/* Obere Führungsschiene */}
      <mesh position={[0, h / 2 + P / 2, 0]}>
        <boxGeometry args={[w, P * 0.7, P * 2.5]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Untere Führungsschiene */}
      <mesh position={[0, -h / 2 - P / 2, 0]}>
        <boxGeometry args={[w, P * 0.7, P * 2.5]} />
        <primitive object={metalMat} attach="material" />
      </mesh>

      {/* Panel 1 (linke Seite, vorn) */}
      <mesh position={[-(w / 2 - panelW / 2 - overlap), 0, t * 0.7]} castShadow receiveShadow>
        <boxGeometry args={[panelW, h - P * 2, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Panel 2 (rechte Seite, hinten) */}
      <mesh position={[(w / 2 - panelW / 2 - overlap), 0, -t * 0.7]} castShadow receiveShadow>
        <boxGeometry args={[panelW, h - P * 2, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Griff Panel 1 */}
      <mesh position={[-(w / 2 - panelW / 2 - overlap) + panelW * 0.3, 0, t * 0.7 + t / 2 + 0.02]}>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Griff Panel 2 */}
      <mesh position={[(w / 2 - panelW / 2 - overlap) - panelW * 0.3, 0, -t * 0.7 - t / 2 - 0.02]}>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 10]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}

// ── Nische ─────────────────────────────────────────────────
function Nische({ w, h, t, glassMat, metalMat }) {
  const frontW = w * 0.65;
  const sideD  = 0.28;

  return (
    <group>
      {/* Frontscheibe */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[frontW, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Linke Seitenscheibe */}
      <mesh position={[-frontW / 2 - sideD / 2, 0, -sideD / 2]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sideD, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Rechte Seitenscheibe */}
      <mesh position={[frontW / 2 + sideD / 2, 0, -sideD / 2]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sideD, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>

      {/* Profile oben */}
      <mesh position={[0, h / 2 + P / 2, -sideD / 4]}>
        <boxGeometry args={[frontW + sideD * 2, P, PH]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Profile unten */}
      <mesh position={[0, -h / 2 - P / 2, -sideD / 4]}>
        <boxGeometry args={[frontW + sideD * 2, P, PH]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}

const TYPE_COMPONENTS = {
  'Walk-in':    WalkIn,
  'Drehtür':    Drehtuer,
  'Schiebetür': Schiebetuer,
  'Nische':     Nische,
};

export default function ShowerModel({ config, canvasRef }) {
  const groupRef    = useRef();
  const prevConfig  = useRef(null);
  const prevBreite  = useRef(config?.breite ?? 90);
  const prevHoehe   = useRef(config?.hoehe  ?? 200);

  const isDragging  = useRef(false);
  const dragStart   = useRef({ x: 0, y: 0 });
  const rotStart    = useRef({ x: 0, y: 0 });
  const currentRot  = useRef({ x: 0, y: 0 });

  const glassMat = useGlassMaterial();
  const metalMat = useMetalMaterial();

  const { animScale, animOpacity, triggerTransition, tickAnimation } = useModelAnimation();

  const mapped = useMemo(() => mapConfig(config ?? {}), [config]);
  const { w, h, t, glass, metal, typ } = mapped;

  // Transitions bei Konfigurationsänderungen
  useEffect(() => {
    if (!prevConfig.current) { prevConfig.current = config; return; }
    const prev = prevConfig.current;
    const deltaBreite = Math.abs((config?.breite ?? 90)  - prevBreite.current);
    const deltaHoehe  = Math.abs((config?.hoehe  ?? 200) - prevHoehe.current);
    const sliderOnly  = deltaBreite <= 5 || deltaHoehe <= 5;

    if (config?.typ !== prev?.typ) {
      triggerTransition('crossfade');
    } else if (config?.glas !== prev?.glas || config?.profil !== prev?.profil) {
      triggerTransition('morph');
    } else if (config?.staerke !== prev?.staerke) {
      triggerTransition('pulse');
    } else if (!sliderOnly && (deltaBreite > 5 || deltaHoehe > 5)) {
      triggerTransition('pulse');
    }

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
      rotStart.current  = { x: currentRot.current.x, y: currentRot.current.y };
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      currentRot.current.y = rotStart.current.y + dx * 0.007;
      currentRot.current.x = Math.max(-0.22, Math.min(0.22, rotStart.current.x + dy * 0.007));
    };
    const onUp = () => { isDragging.current = false; };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [canvasRef]);

  // Cleanup
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

    // Materialien updaten (Zoom liegt jetzt im ZoomController)
    updateGlassMaterial(glassMat.current, glass, t, animOpacity.current);
    updateMetalMaterial(metalMat.current, metal);
  });

  const TypeComponent = TYPE_COMPONENTS[typ] ?? WalkIn;
  const rahmentyp = config?.rahmentyp || null;

  return (
    <group ref={groupRef} position={[0, -h / 2, 0]}>
      <TypeComponent
        w={w} h={h} t={t}
        glassMat={glassMat.current}
        metalMat={metalMat.current}
        rahmentyp={rahmentyp}
      />
      {/* Weicher Bodenschatten */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -h / 2 - 0.001, 0]}>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial opacity={0.12} />
      </mesh>
    </group>
  );
}
