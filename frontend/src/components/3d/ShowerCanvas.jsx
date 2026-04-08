import React, { useRef, useMemo, Suspense, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import ShowerModel from './ShowerModel';
import BathroomScene from './BathroomScene';
import { mapConfig } from './configurator/useShowerConfig';

// ─────────────────────────────────────────────────────────────
//  Gradient-Hintergrund (studio look: dunkel oben → dunkelblau-grau unten)
// ─────────────────────────────────────────────────────────────
function BackgroundGradient() {
  const { scene } = useThree();

  useEffect(() => {
    const W = 4, H = 512;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.00, '#07080a');   // oben: fast schwarz
    g.addColorStop(0.35, '#0e1118');   // mitte-oben: dunkel
    g.addColorStop(0.75, '#141c28');   // mitte-unten: blau-grau Stich
    g.addColorStop(1.00, '#0a0e14');   // unten: zurück dunkel (Boden)
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    scene.background = tex;

    return () => { tex.dispose(); scene.background = null; };
  }, [scene]);

  return null;
}

// ─────────────────────────────────────────────────────────────
//  Zoom-Konstanten
// ─────────────────────────────────────────────────────────────
const ZOOM_MIN   = 1.2;   // Nächster Abstand (nicht durch Glas)
const ZOOM_MAX   = 10.0;  // Weitester Abstand
const ZOOM_SPEED = 0.09;  // Lerp-Faktor pro Frame (0=kein Zoom, 1=sofort)
const ZOOM_STEP  = 0.22;  // Anteil pro Button-Klick

// ─────────────────────────────────────────────────────────────
//  CameraSetup — setzt Position einmalig wenn h sich ändert
//  (schreibt NICHT in zoomRef, damit Buttons nicht überschrieben werden)
// ─────────────────────────────────────────────────────────────
function CameraSetup({ h, zoomRef }) {
  const { camera } = useThree();
  const prevH = useRef(null);

  useEffect(() => {
    if (prevH.current === h) return;
    prevH.current = h;

    const dist     = Math.max(3.8, h * 1.85 + 1.0);
    const centerY  = -h / 2 + h * 0.08;

    zoomRef.current = dist;
    // Leicht von links-vorne für 3/4-Ansicht der Nische
    camera.position.set(-dist * 0.18, centerY + h * 0.12, dist * 0.97);
    camera.lookAt(-0.05, centerY, -0.35);
    camera.updateProjectionMatrix();
  }, [h, camera]);

  return null;
}

// ─────────────────────────────────────────────────────────────
//  ZoomController — eigenständiger Lerp im Canvas-Kontext
//  Liest zoomRef.current (Target), bewegt Kamera smooth dazu
// ─────────────────────────────────────────────────────────────
const _zc = { x: 0, y: 0, z: 0 }; // Zoom-Center (stack-alloc simuliert)

function ZoomController({ h, zoomRef }) {
  const { camera } = useThree();

  useFrame(() => {
    const centerY = -h / 2 + h * 0.08;
    const target  = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomRef.current));

    // Richtungsvektor: Kamera → Zoom-Center (leicht in Nische versetzt)
    _zc.x = -0.05; _zc.y = centerY; _zc.z = -0.35;

    const dx = camera.position.x - _zc.x;
    const dy = camera.position.y - _zc.y;
    const dz = camera.position.z - _zc.z;
    const cur = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (Math.abs(cur - target) < 0.002) return;

    const next  = cur + (target - cur) * ZOOM_SPEED;
    const scale = next / Math.max(cur, 0.001);

    camera.position.x = _zc.x + dx * scale;
    camera.position.y = _zc.y + dy * scale;
    camera.position.z = _zc.z + dz * scale;
    camera.lookAt(_zc.x, _zc.y, _zc.z);
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

  const mapped = useMemo(() => mapConfig(config ?? {}), [config]);

  // Zoom: Button-Handler — klemmt auf Grenzen
  const zoomIn  = useCallback(() => {
    zoomRef.current = Math.max(ZOOM_MIN, zoomRef.current * (1 - ZOOM_STEP));
  }, []);
  const zoomOut = useCallback(() => {
    zoomRef.current = Math.min(ZOOM_MAX, zoomRef.current * (1 + ZOOM_STEP));
  }, []);

  return (
    <div
      className={`shower-canvas-wrapper${isDragging ? ' is-dragging' : ''}`}
      ref={canvasWrapperRef}
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
            toneMappingExposure: 1.10,
            outputColorSpace:    'srgb',
            powerPreference:     'high-performance',
          }}
          shadows="soft"
          frameloop="always"
          camera={{ fov: 38, position: [0, 0, 4.5], near: 0.05, far: 80 }}
          dpr={[1, 2]}
          style={{ background: '#07080a' }}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
        >
          <AdaptiveDpr pixelated />
          <BackgroundGradient />

          <CameraSetup h={mapped.h} zoomRef={zoomRef} />
          <ZoomController h={mapped.h} zoomRef={zoomRef} />

          {/* ── Beleuchtung ─────────────────────────────────── */}
          {/* Hauptlicht: schräg von oben-links (Deckenspot) */}
          <directionalLight
            position={[-1.5, 6, 3.5]} intensity={0.85} color="#fffcf8"
            castShadow
            shadow-mapSize-width={1024} shadow-mapSize-height={1024}
            shadow-camera-near={0.5} shadow-camera-far={18}
            shadow-camera-left={-3} shadow-camera-right={3}
            shadow-camera-top={4}   shadow-camera-bottom={-4}
            shadow-bias={-0.0004}   shadow-normalBias={0.025}
          />
          {/* Fülllicht rechts (kühler, Fensterseite) */}
          <directionalLight position={[4, 2, 2.5]} intensity={0.28} color="#dde8ff" />
          {/* Rücklicht für Chromkanten */}
          <directionalLight position={[0.5, 1.5, -4]} intensity={0.16} color="#ffffff" />
          {/* Ambientes Licht — warm, dezent */}
          <ambientLight intensity={0.70} color="#fff5ee" />
          <hemisphereLight skyColor="#ffffff" groundColor="#c8c0b4" intensity={0.35} />

          {/* Environment: warehouse — scharfe Chrome-Reflexionen */}
          <Environment preset="warehouse" />

          {/* Badezimmer-Szene — bei Badewanne Boden tiefer für Wannengehäuse */}
          <BathroomScene
            showerWidth={mapped.w}
            showerHeight={config?.einbausituation === 'badewanne' ? mapped.h + 0.16 : mapped.h}
          />

          {/* Modell — NUR wenn Konfiguration abgeschlossen */}
          {isComplete && (
            <ShowerModel
              config={config}
              canvasRef={canvasWrapperRef}
            />
          )}

          {/* Maßlinien werden innerhalb ShowerModel gerendert (lokale Koordinaten) */}
        </Canvas>
      </Suspense>

      {/* Zoom-Buttons: + oben, − unten */}
      <div className="canvas-controls" onPointerDown={(e) => e.stopPropagation()}>
        <button className="zoom-btn" title="Vergrößern (Zoom In)" onClick={zoomIn}>+</button>
        <button className="zoom-btn" title="Verkleinern (Zoom Out)" onClick={zoomOut}>−</button>
      </div>

      {isComplete && <div className="viewer-badge">3D</div>}
      {isComplete && <div className="viewer-hint">Ziehen zum Drehen</div>}

      {/* Maßangaben als HTML-Overlay — immer gerade, unabhängig von 3D-Rotation */}
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

      {/* Placeholder — wird angezeigt solange Wizard nicht fertig */}
      {!isComplete && <ViewerPlaceholder />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Placeholder: Warte-State vor vollständiger Konfiguration
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
