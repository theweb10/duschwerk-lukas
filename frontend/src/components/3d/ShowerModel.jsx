import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Reusable vectors — allocated once, mutated each frame to avoid GC
const _zoomCenter = new THREE.Vector3();
const _zoomDir    = new THREE.Vector3();
import { mapConfig } from './configurator/useShowerConfig';
import { useModelAnimation } from './configurator/useModelAnimation';
import { useGlassMaterial, updateGlassMaterial } from './materials/GlassMaterial';
import { useMetalMaterial, updateMetalMaterial } from './materials/MetalMaterial';

const PROFILE = 0.04;

function WalkIn({ w, h, t, glassMat, metalMat }) {
  return (
    <group>
      {/* Main glass panel */}
      <mesh castShadow>
        <boxGeometry args={[w, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Left vertical profile */}
      <mesh position={[-w / 2 - PROFILE / 2, 0, 0]} castShadow>
        <boxGeometry args={[PROFILE, h, PROFILE]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Top profile */}
      <mesh position={[0, h / 2 + PROFILE / 2, 0]} castShadow>
        <boxGeometry args={[w + PROFILE * 2, PROFILE, PROFILE]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Bottom profile */}
      <mesh position={[0, -h / 2 - PROFILE / 2, 0]} castShadow>
        <boxGeometry args={[w + PROFILE * 2, PROFILE, PROFILE]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Return side panel */}
      <mesh position={[w / 2 + 0.15, 0, -0.15]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.3, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
    </group>
  );
}

function Drehtuer({ w, h, t, glassMat, metalMat }) {
  return (
    <group>
      {/* Frame left */}
      <mesh position={[-w / 2 + PROFILE / 2, 0, 0]} castShadow>
        <boxGeometry args={[PROFILE, h, PROFILE]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Frame right */}
      <mesh position={[w / 2 - PROFILE / 2, 0, 0]} castShadow>
        <boxGeometry args={[PROFILE, h, PROFILE]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Frame top */}
      <mesh position={[0, h / 2 - PROFILE / 2, 0]} castShadow>
        <boxGeometry args={[w, PROFILE, PROFILE]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Frame bottom */}
      <mesh position={[0, -h / 2 + PROFILE / 2, 0]} castShadow>
        <boxGeometry args={[w, PROFILE, PROFILE]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Glass panel */}
      <mesh castShadow>
        <boxGeometry args={[w - PROFILE * 2, h - PROFILE * 2, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Hinge top */}
      <mesh position={[-w / 2 + PROFILE / 2, h / 2 - 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Hinge bottom */}
      <mesh position={[-w / 2 + PROFILE / 2, -h / 2 + 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Handle */}
      <mesh position={[w / 2 - 0.08, 0, t / 2 + 0.015]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}

function Schiebetuer({ w, h, t, glassMat, metalMat }) {
  return (
    <group>
      {/* Top track */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, PROFILE * 0.5, PROFILE * 2]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Bottom track */}
      <mesh position={[0, -h / 2, 0]} castShadow>
        <boxGeometry args={[w, PROFILE * 0.5, PROFILE * 2]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Panel 1 (front) */}
      <mesh position={[-w * 0.1, 0, t * 0.6]} castShadow>
        <boxGeometry args={[w * 0.6, h - PROFILE, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Panel 2 (back) */}
      <mesh position={[w * 0.1, 0, -t * 0.6]} castShadow>
        <boxGeometry args={[w * 0.6, h - PROFILE, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Handle front panel */}
      <mesh position={[w * 0.1, 0, t * 0.6 + t / 2 + 0.015]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.25, 8]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
    </group>
  );
}

function Nische({ w, h, t, glassMat, metalMat }) {
  return (
    <group>
      {/* Front center panel */}
      <mesh castShadow>
        <boxGeometry args={[w * 0.6, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Left side panel */}
      <mesh position={[-w * 0.3 - 0.15, 0, -0.15]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.3, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Right side panel */}
      <mesh position={[w * 0.3 + 0.15, 0, -0.15]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.3, h, t]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* Top profile */}
      <mesh position={[0, h / 2 + PROFILE / 2, 0]} castShadow>
        <boxGeometry args={[w * 0.6 + PROFILE, PROFILE, PROFILE]} />
        <primitive object={metalMat} attach="material" />
      </mesh>
      {/* Bottom profile */}
      <mesh position={[0, -h / 2 - PROFILE / 2, 0]} castShadow>
        <boxGeometry args={[w * 0.6 + PROFILE, PROFILE, PROFILE]} />
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

export default function ShowerModel({ config, canvasRef, zoomRef }) {
  const groupRef   = useRef();
  const hoverLight = useRef();
  const prevConfig  = useRef(null);
  const prevBreite  = useRef(config?.breite ?? 90);
  const prevHoehe   = useRef(config?.hoehe  ?? 200);

  const isDragging  = useRef(false);
  const dragStart   = useRef({ x: 0, y: 0 });
  const rotStart    = useRef({ x: 0, y: 0 });
  const currentRot  = useRef({ x: 0, y: 0 });

  const { camera } = useThree();

  const glassMat = useGlassMaterial();
  const metalMat = useMetalMaterial();

  const { animScale, animOpacity, triggerTransition, tickAnimation } = useModelAnimation();

  const mapped = useMemo(() => mapConfig(config ?? {}), [config]);
  const { w, h, t, glass, metal, typ } = mapped;

  // Detect config changes for crossfade
  useEffect(() => {
    if (!prevConfig.current) {
      prevConfig.current = config;
      return;
    }
    const deltaBreite = Math.abs((config?.breite ?? 90)  - prevBreite.current);
    const deltaHoehe  = Math.abs((config?.hoehe  ?? 200) - prevHoehe.current);
    const isSliderOnly =
      (deltaBreite > 0 && deltaBreite <= 5) ||
      (deltaHoehe  > 0 && deltaHoehe  <= 5);

    if (!isSliderOnly) {
      triggerTransition('crossfade');
    }
    prevBreite.current = config?.breite ?? 90;
    prevHoehe.current  = config?.hoehe  ?? 200;
    prevConfig.current = config;
  }, [config]);

  // Drag-rotate listeners
  useEffect(() => {
    if (!canvasRef?.current) return;
    const el = canvasRef.current;

    const onPointerDown = (e) => {
      isDragging.current = true;
      el.setPointerCapture(e.pointerId);
      dragStart.current = { x: e.clientX, y: e.clientY };
      rotStart.current  = { x: currentRot.current.x, y: currentRot.current.y };
    };
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      currentRot.current.y = rotStart.current.y + dx * 0.008;
      currentRot.current.x = Math.max(-0.25, Math.min(0.25, rotStart.current.x + dy * 0.008));
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, [canvasRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      glassMat.current.dispose();
      metalMat.current.dispose();
    };
  }, []);

  useFrame(() => {
    // 1. Tick animation
    tickAnimation();

    // 2. Apply scale + rotation
    if (groupRef.current) {
      const s = animScale.current;
      groupRef.current.scale.set(s, s, s);

      // 3. Smooth lerp rotation
      groupRef.current.rotation.y += (currentRot.current.y - groupRef.current.rotation.y) * 0.08;
      groupRef.current.rotation.x += (currentRot.current.x - groupRef.current.rotation.x) * 0.08;
    }

    // 4. Camera zoom lerp — direction-based, preserves camera angle
    if (zoomRef) {
      _zoomCenter.set(0, -h / 2, 0);
      _zoomDir.subVectors(camera.position, _zoomCenter);
      const currentDist = _zoomDir.length();
      const targetDist  = zoomRef.current;
      if (currentDist > 0.001 && Math.abs(currentDist - targetDist) > 0.001) {
        const newDist = currentDist + (targetDist - currentDist) * 0.1;
        _zoomDir.normalize().multiplyScalar(newDist);
        camera.position.x = _zoomCenter.x + _zoomDir.x;
        camera.position.y = _zoomCenter.y + _zoomDir.y;
        camera.position.z = _zoomCenter.z + _zoomDir.z;
        camera.lookAt(_zoomCenter);
      }
    }

    // 5. Update materials
    updateGlassMaterial(glassMat.current, glass, t, animOpacity.current);
    updateMetalMaterial(metalMat.current, metal);

    // 6. Hover light (constant)
    if (hoverLight.current) {
      hoverLight.current.intensity = 0.4;
    }
  });

  const TypeComponent = TYPE_COMPONENTS[typ] ?? WalkIn;

  return (
    <group ref={groupRef} position={[0, -h / 2, 0]}>
      <TypeComponent w={w} h={h} t={t} glassMat={glassMat.current} metalMat={metalMat.current} />
      <pointLight ref={hoverLight} position={[0, h * 0.6, 1.5]} intensity={0.4} />
      {/* Floor shadow — placed just below the bottom profile in local space */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -h / 2 - PROFILE - 0.02, 0]}>
        <planeGeometry args={[4, 4]} />
        <shadowMaterial opacity={0.15} />
      </mesh>
    </group>
  );
}
