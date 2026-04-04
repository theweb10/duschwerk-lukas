import React, { useRef, useMemo, Suspense, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, AdaptiveDpr } from '@react-three/drei';
import ShowerModel from './ShowerModel';
import MeasurementLines from './MeasurementLines';
import StudioScene from './StudioScene';
import { mapConfig } from './configurator/useShowerConfig';

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

    const dist     = Math.max(3.2, h * 1.65 + 0.8);   // Weiter weg als vorher
    const centerY  = -h / 2 + h * 0.08;

    zoomRef.current = dist;
    camera.position.set(0.15, centerY + h * 0.10, dist);
    camera.lookAt(0, centerY, 0);
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

    // Richtungsvektor: Kamera → Zoom-Center
    _zc.x = 0; _zc.y = centerY; _zc.z = 0;

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
            toneMapping:         3,
            toneMappingExposure: 1.0,
            outputColorSpace:    'srgb',
          }}
          frameloop="always"
          shadows="soft"
          camera={{ fov: 38, position: [0, 0, 4.5], near: 0.05, far: 80 }}
          style={{ background: '#f4f4f4' }}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
        >
          <AdaptiveDpr pixelated />

          {/* Kamera-Setup (einmalig bei h-Änderung) */}
          <CameraSetup h={mapped.h} zoomRef={zoomRef} />

          {/* Zoom-Lerp (jeder Frame) */}
          <ZoomController h={mapped.h} zoomRef={zoomRef} />

          {/* Beleuchtung */}
          <ambientLight intensity={0.65} color="#ffffff" />
          <directionalLight
            position={[-3, 5, 4]} intensity={0.7} castShadow
            shadow-mapSize-width={1024} shadow-mapSize-height={1024}
            shadow-camera-far={12} shadow-camera-left={-2.5}
            shadow-camera-right={2.5} shadow-camera-top={3}
            shadow-camera-bottom={-3} shadow-bias={-0.0005}
            shadow-normalBias={0.02} color="#ffffff"
          />
          <directionalLight position={[4, 3, 2]} intensity={0.3} color="#eef2ff" />
          <hemisphereLight skyColor="#ffffff" groundColor="#e8e8e8" intensity={0.25} />
          <Environment preset="studio" />

          {/* Hintergrund */}
          <StudioScene showerHeight={mapped.h} />

          {/* Modell — NUR wenn Konfiguration abgeschlossen */}
          {isComplete && (
            <ShowerModel
              config={config}
              canvasRef={canvasWrapperRef}
            />
          )}

          {/* Maßlinien — nur wenn Modell sichtbar */}
          {isComplete && (
            <MeasurementLines w={mapped.w} h={mapped.h} />
          )}
        </Canvas>
      </Suspense>

      {/* Zoom-Buttons: + oben, − unten */}
      <div className="canvas-controls">
        <button className="zoom-btn" title="Vergrößern (Zoom In)" onClick={zoomIn}>+</button>
        <button className="zoom-btn" title="Verkleinern (Zoom Out)" onClick={zoomOut}>−</button>
      </div>

      {isComplete && <div className="viewer-badge">3D</div>}
      {isComplete && <div className="viewer-hint">Ziehen zum Drehen</div>}

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
        <span>Serie → Einbau → Maße → Design</span>
      </div>
    </div>
  );
}
