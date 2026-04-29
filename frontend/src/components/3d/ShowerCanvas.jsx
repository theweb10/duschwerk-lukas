import React, { useRef, useMemo, Suspense, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import ShowerModel from './ShowerModel';
import BathroomScene from './BathroomScene';
import { mapConfig } from './configurator/useShowerConfig';

// ─────────────────────────────────────────────────────────────
//  Hintergrundfarbe
// ─────────────────────────────────────────────────────────────
function BackgroundColor() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color('#f4ede0');
    return () => { scene.background = null; };
  }, [scene]);
  return null;
}

// ─────────────────────────────────────────────────────────────
//  Zoom-Konstanten
// ─────────────────────────────────────────────────────────────
const ZOOM_MIN   = 1.2;
const ZOOM_MAX   = 10.0;
const ZOOM_SPEED = 0.09;
const ZOOM_STEP  = 0.22;

// ─────────────────────────────────────────────────────────────
//  Kamera-Orbit-Controller
//  - Orbit dreht die Kamera um die Dusche (nicht das Modell)
//  - Inertia nach Loslassen
//  - Smooth-Zoom via zoomRef
// ─────────────────────────────────────────────────────────────
const _camTarget = new THREE.Vector3();

function OrbitController({ h, zoomRef, orbitRef, orbitVelRef, isDragRef }) {
  const { camera } = useThree();
  const curDistRef = useRef(4.5);
  const prevH      = useRef(null);

  // Kamera-Reset wenn sich Duschenhöhe ändert
  useEffect(() => {
    if (prevH.current === h) return;
    prevH.current = h;
    const dist = Math.max(3.8, h * 1.85 + 1.0);
    zoomRef.current      = dist;
    curDistRef.current   = dist;
    orbitRef.current     = { theta: 0.18, phi: 0.06 };
    orbitVelRef.current  = { theta: 0, phi: 0 };
    const centerY = -h / 2 + h * 0.08;
    const lx = -0.05, ly = centerY, lz = -0.35;
    const { theta, phi } = orbitRef.current;
    camera.position.set(
      lx + dist * Math.sin(theta) * Math.cos(phi),
      ly + dist * Math.sin(phi),
      lz + dist * Math.cos(theta) * Math.cos(phi),
    );
    camera.lookAt(lx, ly, lz);
    camera.updateProjectionMatrix();
  }, [h, camera]);

  useFrame(() => {
    // Trägheit nach Loslassen
    if (!isDragRef.current) {
      const vt = orbitVelRef.current.theta;
      const vp = orbitVelRef.current.phi;
      if (Math.abs(vt) > 0.0001 || Math.abs(vp) > 0.0001) {
        orbitRef.current.theta += vt;
        orbitRef.current.phi = Math.max(-0.28, Math.min(0.48, orbitRef.current.phi + vp));
        orbitVelRef.current.theta *= 0.88;
        orbitVelRef.current.phi   *= 0.88;
      }
    }

    // Smooth-Zoom
    const distTarget = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomRef.current));
    curDistRef.current += (distTarget - curDistRef.current) * ZOOM_SPEED;

    const centerY = -h / 2 + h * 0.08;
    const lx = -0.05, ly = centerY, lz = -0.35;
    const dist  = curDistRef.current;
    const theta = orbitRef.current.theta;
    const phi   = orbitRef.current.phi;
    const cosP  = Math.cos(phi);

    _camTarget.set(
      lx + dist * Math.sin(theta) * cosP,
      ly + dist * Math.sin(phi),
      lz + dist * Math.cos(theta) * cosP,
    );

    if (_camTarget.distanceTo(camera.position) > 0.002) {
      camera.position.lerp(_camTarget, 0.18);
      camera.lookAt(lx, ly, lz);
    }
  });

  return null;
}

// ─────────────────────────────────────────────────────────────
//  ShowerCanvas
// ─────────────────────────────────────────────────────────────
export default function ShowerCanvas({ config, isComplete }) {
  const canvasWrapperRef = useRef();
  const zoomRef          = useRef(4.5);
  const [isDragging, setIsDragging] = useState(false);

  // Orbit-State
  const orbitRef    = useRef({ theta: 0.18, phi: 0.06 });
  const orbitVelRef = useRef({ theta: 0, phi: 0 });
  const isDragRef   = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const orbitStart  = useRef({ theta: 0.18, phi: 0.06 });
  const prevMouseRef = useRef({ x: 0, y: 0 });

  const mapped = useMemo(() => mapConfig(config ?? {}), [config]);

  // Zoom-Buttons
  const zoomIn  = useCallback(() => {
    zoomRef.current = Math.max(ZOOM_MIN, zoomRef.current * (1 - ZOOM_STEP));
  }, []);
  const zoomOut = useCallback(() => {
    zoomRef.current = Math.min(ZOOM_MAX, zoomRef.current * (1 + ZOOM_STEP));
  }, []);

  // Orbit-Pointer-Handler
  const onPointerDown = useCallback((e) => {
    if (e.target.closest?.('.canvas-controls') || e.target.tagName === 'BUTTON') return;
    isDragRef.current = true;
    canvasWrapperRef.current?.setPointerCapture(e.pointerId);
    dragStartRef.current  = { x: e.clientX, y: e.clientY };
    orbitStart.current    = { ...orbitRef.current };
    prevMouseRef.current  = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!isDragRef.current) return;
    orbitRef.current.theta = orbitStart.current.theta - (e.clientX - dragStartRef.current.x) * 0.011;
    orbitRef.current.phi   = Math.max(-0.28, Math.min(0.48,
      orbitStart.current.phi + (e.clientY - dragStartRef.current.y) * 0.008));
    orbitVelRef.current.theta = -(e.clientX - prevMouseRef.current.x) * 0.011;
    orbitVelRef.current.phi   =  (e.clientY - prevMouseRef.current.y) * 0.008;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(() => {
    isDragRef.current = false;
    setIsDragging(false);
  }, []);

  return (
    <div
      className={`shower-canvas-wrapper${isDragging ? ' is-dragging' : ''}`}
      ref={canvasWrapperRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Suspense fallback={
        <div className="canvas-loading">
          <div className="canvas-loading-spinner" />
        </div>
      }>
        <Canvas
          gl={{
            antialias:           true,
            alpha:               false,
            toneMapping:         4,
            toneMappingExposure: 1.22,
            outputColorSpace:    'srgb',
            powerPreference:     'high-performance',
          }}
          shadows="soft"
          frameloop="always"
          camera={{ fov: 34, position: [0, 0, 4.5], near: 0.05, far: 80 }}
          dpr={[1, 2]}
          style={{ background: '#f4ede0' }}
        >
          <AdaptiveDpr pixelated />
          <BackgroundColor />

          <OrbitController
            h={mapped.h}
            zoomRef={zoomRef}
            orbitRef={orbitRef}
            orbitVelRef={orbitVelRef}
            isDragRef={isDragRef}
          />

          {/* ── Beleuchtung (warm, Spa-Atmosphäre) ─────────── */}
          {/* Key-Light: warmes Morgenlicht von links-oben */}
          <directionalLight
            position={[-3.0, 7, 4.0]} intensity={1.05} color="#ffe0a8"
            castShadow
            shadow-mapSize-width={2048} shadow-mapSize-height={2048}
            shadow-camera-near={0.5} shadow-camera-far={22}
            shadow-camera-left={-4} shadow-camera-right={4}
            shadow-camera-top={5}   shadow-camera-bottom={-5}
            shadow-bias={-0.0003}   shadow-normalBias={0.020}
          />
          {/* Fill-Light von rechts: warmes indirektes Licht */}
          <directionalLight position={[5, 3, 2.0]} intensity={0.38} color="#ffd8a0" />
          {/* Rim-Light hinten: Gold-Highlights auf Messing/Chrom */}
          <directionalLight position={[0, 2.5, -5]} intensity={0.35} color="#ffe4b0" />
          {/* Top-Light: warme Deckenaufhellung */}
          <directionalLight position={[0, 9, 0]} intensity={0.28} color="#ffecc0" />

          {/* Ambientes Licht — warm, golden */}
          <ambientLight intensity={0.68} color="#ffe8c0" />
          <hemisphereLight skyColor="#fff4d8" groundColor="#d4a060" intensity={0.42} />

          {/* Fensterlicht rechts: warmes Morgenlicht */}
          <pointLight position={[3.8, 0.2, -0.35]} intensity={2.20} color="#ffd890" distance={7} decay={2} />
          {/* Deckenspot über Dusche */}
          <pointLight position={[0.3, 0.50, -0.4]} intensity={1.40} color="#fff4d8" distance={4} decay={2} />
          {/* Deckenspot über Waschtisch */}
          <pointLight position={[2.2, 0.50, -0.4]} intensity={0.90} color="#ffecc4" distance={3.5} decay={2} />
          {/* LED-Spiegel: intensives warmes Messing-Glühen */}
          <pointLight position={[1.30, -0.75, -1.02]} intensity={0.80} color="#ffb830" distance={2.8} decay={2} />
          {/* Kerzen-Warmton (diffuses Kerzenlicht) */}
          <pointLight position={[1.10, -0.62, -0.80]} intensity={0.50} color="#ff8820" distance={1.8} decay={2} />
          {/* Linkes Fenster: warmes Seitenlicht (kein Kalt-Blau) */}
          <pointLight position={[-2.00, -0.40, -0.55]} intensity={1.00} color="#fce8c0" distance={5.0} decay={2} />
          {/* Boden-Reflex: warmes goldenes Aufhellicht */}
          <pointLight position={[0.0, -1.80, 0.5]} intensity={0.35} color="#d4902c" distance={4.0} decay={2} />

          {/* Environment: apartment — warm, weich, ideal für Innenräume */}
          <Environment preset="apartment" />

          {/* Badezimmer-Szene */}
          <BathroomScene
            showerWidth={mapped.w}
            showerHeight={mapped.h}
          />

          {/* Modell — NUR wenn Konfiguration abgeschlossen */}
          {isComplete && (
            <ShowerModel config={config} />
          )}
        </Canvas>
      </Suspense>

      {/* Zoom-Buttons */}
      <div className="canvas-controls" onPointerDown={(e) => e.stopPropagation()}>
        <button className="zoom-btn" title="Vergrößern (Zoom In)" onClick={zoomIn}>+</button>
        <button className="zoom-btn" title="Verkleinern (Zoom Out)" onClick={zoomOut}>−</button>
      </div>

      {isComplete && <div className="viewer-badge">3D</div>}
      {isComplete && <div className="viewer-hint">Ziehen zum Drehen</div>}

      {/* Maßangaben als HTML-Overlay */}
      {isComplete && (
        <div className="measurement-overlay" style={{ pointerEvents: 'none' }}>
          <div className="measurement-width">
            {Math.round(mapped.w * 1000)} mm
          </div>
          <div className="measurement-height">
            {Math.round(mapped.h * 1000)} mm
          </div>
        </div>
      )}

      {!isComplete && <ViewerPlaceholder />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Placeholder
// ─────────────────────────────────────────────────────────────
function ViewerPlaceholder() {
  return (
    <div className="viewer-placeholder">
      <div className="placeholder-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="8" width="40" height="48" rx="2" stroke="#C8D0E0" strokeWidth="1.5" />
          <rect x="18" y="14" width="28" height="36" rx="1" stroke="#DDE3EE" strokeWidth="1" />
          <line x1="12" y1="8" x2="18" y2="14" stroke="#C8D0E0" strokeWidth="1" />
          <line x1="52" y1="8" x2="46" y2="14" stroke="#C8D0E0" strokeWidth="1" />
          <line x1="12" y1="56" x2="18" y2="50" stroke="#C8D0E0" strokeWidth="1" />
          <line x1="52" y1="56" x2="46" y2="50" stroke="#C8D0E0" strokeWidth="1" />
        </svg>
      </div>
      <p className="placeholder-text">3D-Vorschau erscheint<br/>nach vollständiger Konfiguration</p>
      <div className="placeholder-steps">
        <span>Einbau → Türart → Bauart → Maße → Design</span>
      </div>
    </div>
  );
}
