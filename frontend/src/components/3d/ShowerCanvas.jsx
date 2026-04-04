import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import ShowerModel from './ShowerModel';
import MeasurementLines from './MeasurementLines';
import { mapConfig } from './configurator/useShowerConfig';

function CameraController({ h, zoomRef }) {
  const { camera } = useThree();
  useEffect(() => {
    const centerY = -h / 2;
    const dist = Math.max(2.8, h * 1.4 + 0.5);
    zoomRef.current = dist;
    camera.position.set(0, centerY + h * 0.05, dist);
    camera.lookAt(0, centerY, 0);
    camera.updateProjectionMatrix();
  }, [h, camera]);
  return null;
}

export default function ShowerCanvas({ config }) {
  const canvasWrapperRef = useRef();
  const zoomRef = useRef(3);

  const mapped = useMemo(() => mapConfig(config ?? {}), [config]);

  return (
    <div className="shower-canvas-wrapper" ref={canvasWrapperRef}>
      <Suspense fallback={null}>
        <Canvas
          gl={{ antialias: true, alpha: true }}
          frameloop="always"
          shadows
          camera={{ fov: 45, position: [0, 0, 4], near: 0.1, far: 100 }}
          style={{ background: 'transparent' }}
        >
          <CameraController h={mapped.h} zoomRef={zoomRef} />
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.0}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-3, 4, 3]} intensity={0.6} color="#ffffff" />
          <pointLight position={[3, 2, -3]} intensity={0.3} color="#B0C8FF" />
          <Environment preset="apartment" />
          <ShowerModel config={config} canvasRef={canvasWrapperRef} zoomRef={zoomRef} />
          <MeasurementLines w={mapped.w} h={mapped.h} />
        </Canvas>
      </Suspense>
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={() => { zoomRef.current = Math.min(zoomRef.current * 1.15, 8.0); }}>−</button>
        <button className="zoom-btn" onClick={() => { zoomRef.current = Math.max(zoomRef.current * 0.85, 1.0); }}>+</button>
      </div>
    </div>
  );
}
