/**
 * GlassShardScene — Badverglasung Product Visualization
 *
 * Scroll-driven exploded-view of a walk-in glass shower installation.
 *
 * Scene hierarchy:
 *   systemGroup  (outer scale + subtle idle breath)
 *   ├── mainGroup   — front glass panel + chrome bars + handle + seal
 *   ├── sideGroup   — perpendicular side glass panel + chrome bars + seal
 *   ├── hingeGroup  — 3 hinges at the corner junction
 *   └── wallGroup   — vertical wall profile + 2 wall mounts
 *
 * Scroll → animation timeline:
 *   0.00 → 0.20   assembled hero view
 *   0.20 → 0.82   progressive explode (panels separate, hinges reveal)
 *   0.82 → 1.00   full exploded, camera wide
 *
 * Performance:
 *   ✓ MeshStandardMaterial only (no transmission back-buffer pass)
 *   ✓ antialias: false
 *   ✓ frameloop pauses off-screen (active prop → FrameloopController)
 *   ✓ scrollRef pattern — ShowerScene never re-renders from scroll
 *   ✓ All vectors pre-allocated at module scope
 *   ✓ Materials shared across meshes (not duplicated)
 */
import { useRef, useMemo, useEffect, memo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Helpers ────────────────────────────────────────────────── */
const lerp  = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const ease  = t => 1 - Math.pow(1 - t, 3)
const eio   = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2

/* ─── Pre-allocated — zero GC in useFrame ────────────────────── */
const _tp = new THREE.Vector3()
const _cl = new THREE.Vector3()

/* ─── Glass panel dimensions (all in Three.js units) ─────────── */
const MW = 0.72    // main panel width   (~90 cm)
const MH = 1.60    // shared height      (~200 cm)
const SW = 0.44    // side panel width   (~55 cm)
const GT = 0.012   // glass thickness    (~1.5 cm)
const CX = -MW / 2 // corner X = −0.36

/* ─── Home positions for animated groups ─────────────────────── */
const MAIN_HOME  = [ 0,        0, 0       ]
const SIDE_HOME  = [ CX,       0, SW / 2  ]
const HINGE_HOME = [ CX,       0, GT / 2  ]
const WALL_HOME  = [ CX-0.026, 0, 0       ]

/* ─── Camera keyframes (assembled → detail → exploded) ───────── */
const CAMS = [
  { pos: [1.10, 0.40, 2.00], look: [-0.10, -0.05, 0] }, // S0: assembled
  { pos: [1.40, 0.55, 2.40], look: [-0.05,  0.00, 0] }, // S1: separation
  { pos: [0.50, 0.05, 1.10], look: [-0.22,  0.00, 0] }, // S2: hinge detail
  { pos: [1.80, 0.75, 2.80], look: [ 0.00, -0.10, 0] }, // S3: full explode
]

/* ─── Geometry primitives ────────────────────────────────────── */

// Flat glass panel with 4 highlighted edges for thickness illusion
function GlassFace({ g, e, w, h }) {
  const edge = GT * 1.8
  const edD  = GT + edge
  return (
    <group>
      <mesh material={g}><boxGeometry args={[w, h, GT]} /></mesh>
      <mesh material={e} position={[0,  h/2, 0]}><boxGeometry args={[w+edge, edge, edD]} /></mesh>
      <mesh material={e} position={[0, -h/2, 0]}><boxGeometry args={[w+edge, edge, edD]} /></mesh>
      <mesh material={e} position={[-w/2, 0, 0]}><boxGeometry args={[edge, h, edD]} /></mesh>
      <mesh material={e} position={[ w/2, 0, 0]}><boxGeometry args={[edge, h, edD]} /></mesh>
    </group>
  )
}

// Cylindrical hinge with two flanges (rotated on its side)
function Hinge({ m, y }) {
  const rot = [0, 0, Math.PI / 2]
  return (
    <group position={[0, y, 0]}>
      <mesh material={m} rotation={rot}><cylinderGeometry args={[0.020, 0.020, 0.055, 10]} /></mesh>
      <mesh material={m} position={[-0.018, 0, 0]} rotation={rot}><cylinderGeometry args={[0.028, 0.028, 0.009, 10]} /></mesh>
      <mesh material={m} position={[ 0.018, 0, 0]} rotation={rot}><cylinderGeometry args={[0.028, 0.028, 0.009, 10]} /></mesh>
    </group>
  )
}

// Wall bracket with two screw details
function WallMount({ m, y }) {
  return (
    <group position={[0, y, -0.020]}>
      <mesh material={m}><boxGeometry args={[0.030, 0.060, 0.022]} /></mesh>
      <mesh material={m} position={[0,  0.015, 0.012]}><cylinderGeometry args={[0.004, 0.004, 0.006, 6]} /></mesh>
      <mesh material={m} position={[0, -0.015, 0.012]}><cylinderGeometry args={[0.004, 0.004, 0.006, 6]} /></mesh>
    </group>
  )
}

// D-shaped door handle: vertical bar + two mounting brackets
function Handle({ m }) {
  const bx = MW / 2 - 0.022
  return (
    <group position={[bx, 0.05, GT/2 + 0.030]}>
      <mesh material={m}><cylinderGeometry args={[0.009, 0.009, 0.30, 8]} /></mesh>
      <mesh material={m} position={[0,  0.16, -0.028]}><boxGeometry args={[0.016, 0.016, 0.056]} /></mesh>
      <mesh material={m} position={[0, -0.16, -0.028]}><boxGeometry args={[0.016, 0.016, 0.056]} /></mesh>
    </group>
  )
}

/* ─── Inner R3F scene ─────────────────────────────────────────── */
// memo: only re-renders when scrollRef ref identity changes (never).
// All animation is driven by scrollRef.current inside useFrame.
const ShowerScene = memo(function ShowerScene({ scrollRef }) {
  const { camera, clock } = useThree()
  const camPos  = useRef(new THREE.Vector3(...CAMS[0].pos))
  const camLook = useRef(new THREE.Vector3(...CAMS[0].look))

  const systemRef = useRef()  // outer group for subtle idle breath
  const mainRef   = useRef()
  const sideRef   = useRef()
  const hingeRef  = useRef()
  const wallRef   = useRef()

  /* ── Materials — each material instance created once ─────── */
  const glassMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:             new THREE.Color('#c8dff0'),
    transparent:       true,
    opacity:           0.22,
    roughness:         0.04,
    metalness:         0.05,
    side:              THREE.FrontSide,
    depthWrite:        false,
    emissive:          new THREE.Color('#1a3a6a'),
    emissiveIntensity: 0.04,
  }), [])

  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:       new THREE.Color('#9ab8d0'),
    transparent: true,
    opacity:     0.55,
    roughness:   0.08,
    metalness:   0.15,
    side:        THREE.FrontSide,
    depthWrite:  false,
  }), [])

  // Chrome for panels (always visible)
  const chromeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:     new THREE.Color('#dce8f4'),
    metalness: 0.90,
    roughness: 0.10,
  }), [])

  // Hardware: starts hidden, fades in as explode reveals it
  const hingeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:       new THREE.Color('#b0c4d8'),
    metalness:   0.92,
    roughness:   0.08,
    transparent: true,
    opacity:     0.0,
  }), [])

  // Wall mount hardware (same fade-in behavior)
  const wallHardMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:       new THREE.Color('#c8d8e8'),
    metalness:   0.88,
    roughness:   0.12,
    transparent: true,
    opacity:     0.0,
  }), [])

  const sealMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:       new THREE.Color('#e8eeee'),
    transparent: true,
    opacity:     0.80,
    roughness:   0.95,
    metalness:   0.0,
  }), [])

  // Floor plane material
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:       new THREE.Color('#d8e4ee'),
    transparent: true,
    opacity:     0.18,
    roughness:   0.85,
    metalness:   0.05,
  }), [])

  useEffect(() => () => {
    [glassMat, edgeMat, chromeMat, hingeMat, wallHardMat, sealMat, floorMat].forEach(m => m.dispose())
  }, []) // eslint-disable-line

  useFrame(() => {
    const p = scrollRef.current
    const t = clock.getElapsedTime()

    /* ── Camera interpolation ── */
    const raw = p * CAMS.length
    const idx = clamp(Math.floor(raw), 0, CAMS.length - 1)
    const sp  = raw - Math.floor(raw)
    const bt  = ease(clamp((sp - 0.28) / 0.72, 0, 1))
    const nxt = Math.min(idx + 1, CAMS.length - 1)

    _tp.set(
      lerp(CAMS[idx].pos[0],  CAMS[nxt].pos[0],  bt),
      lerp(CAMS[idx].pos[1],  CAMS[nxt].pos[1],  bt),
      lerp(CAMS[idx].pos[2],  CAMS[nxt].pos[2],  bt),
    )
    _cl.set(
      lerp(CAMS[idx].look[0], CAMS[nxt].look[0], bt),
      lerp(CAMS[idx].look[1], CAMS[nxt].look[1], bt),
      lerp(CAMS[idx].look[2], CAMS[nxt].look[2], bt),
    )
    camPos.current.lerp(_tp, 0.04)
    camLook.current.lerp(_cl, 0.04)
    camera.position.copy(camPos.current)
    camera.lookAt(camLook.current)

    /* ── Explode factor: 0 = assembled, 1 = fully separated ── */
    const exT = eio(clamp((p - 0.18) / 0.64, 0, 1))

    /* ── Idle breath on assembled system (stops as explode begins) ── */
    if (systemRef.current) {
      const breathAmt = (1 - clamp(exT * 3, 0, 1)) * 0.008
      systemRef.current.rotation.y = Math.sin(t * 0.22) * breathAmt
    }

    /* ── Main panel: drift forward + subtle outward rotation ── */
    if (mainRef.current) {
      const targetZ   = MAIN_HOME[2] + lerp(0, 0.36, exT)
      const targetRotY = lerp(0, 0.08, exT)   // slight outward tilt
      mainRef.current.position.z  += (targetZ    - mainRef.current.position.z)   * 0.06
      mainRef.current.rotation.y  += (targetRotY - mainRef.current.rotation.y)   * 0.05
    }

    /* ── Side panel: drift left + subtle outward rotation ── */
    if (sideRef.current) {
      const targetX    = SIDE_HOME[0] + lerp(0, -0.28, exT)
      const targetRotY = -Math.PI / 2 + lerp(0, -0.08, exT) // tilt away from corner
      sideRef.current.position.x  += (targetX    - sideRef.current.position.x)   * 0.06
      sideRef.current.rotation.y  += (targetRotY - sideRef.current.rotation.y)   * 0.05
    }

    /* ── Hinges: slide forward + scale up + fade in ── */
    if (hingeRef.current) {
      const targetZ = HINGE_HOME[2] + lerp(0, 0.16, exT)
      hingeRef.current.position.z += (targetZ - hingeRef.current.position.z) * 0.06
      hingeRef.current.scale.setScalar(lerp(1.0, 1.30, clamp(exT * 1.4, 0, 1)))
    }
    // Hardware fade-in: invisible when assembled, fully visible when exploded
    const hwOpacity = ease(clamp((exT - 0.15) / 0.55, 0, 1))
    hingeMat.opacity     = hwOpacity
    wallHardMat.opacity  = hwOpacity

    /* ── Wall system: slide further left to reveal mounts ── */
    if (wallRef.current) {
      const targetX = WALL_HOME[0] + lerp(0, -0.28, exT)
      wallRef.current.position.x += (targetX - wallRef.current.position.x) * 0.06
    }

    /* ── Glass tint: shifts to cleaner blue as explode reveals quality ── */
    const glassOpacity = lerp(0.22, 0.28, ease(exT))
    glassMat.opacity   = glassOpacity
    glassMat.emissiveIntensity = lerp(0.04, 0.06, ease(exT))
  })

  return (
    // Outer group: scale + subtle idle rotation
    <group ref={systemRef} scale={0.85} position={[0.08, 0.04, 0]}>

      {/* ─── MAIN PANEL ─────────────────────────────────────
          Front glass + top/bottom chrome bars + handle + floor seal
          Explodes: forward (+Z) */}
      <group ref={mainRef} position={MAIN_HOME}>
        <GlassFace g={glassMat} e={edgeMat} w={MW} h={MH} />

        {/* Top chrome bar */}
        <mesh material={chromeMat} position={[0, MH/2 + 0.009, 0]}>
          <boxGeometry args={[MW + 0.012, 0.018, 0.020]} />
        </mesh>
        {/* Bottom chrome bar */}
        <mesh material={chromeMat} position={[0, -MH/2 - 0.009, 0]}>
          <boxGeometry args={[MW + 0.012, 0.018, 0.020]} />
        </mesh>

        {/* Door handle */}
        <Handle m={chromeMat} />

        {/* Floor seal strip */}
        <mesh material={sealMat} position={[0, -MH/2 - 0.016, 0.003]}>
          <boxGeometry args={[MW - 0.012, 0.010, 0.005]} />
        </mesh>
      </group>

      {/* ─── SIDE PANEL ─────────────────────────────────────
          Perpendicular glass + chrome bars + floor seal
          Rotation -90° around Y → faces toward camera (+X direction)
          Explodes: left (−X) */}
      <group ref={sideRef} position={SIDE_HOME} rotation={[0, -Math.PI / 2, 0]}>
        <GlassFace g={glassMat} e={edgeMat} w={SW} h={MH} />

        {/* Top chrome bar */}
        <mesh material={chromeMat} position={[0, MH/2 + 0.009, 0]}>
          <boxGeometry args={[SW + 0.012, 0.018, 0.020]} />
        </mesh>
        {/* Bottom chrome bar */}
        <mesh material={chromeMat} position={[0, -MH/2 - 0.009, 0]}>
          <boxGeometry args={[SW + 0.012, 0.018, 0.020]} />
        </mesh>

        {/* Floor seal strip */}
        <mesh material={sealMat} position={[0, -MH/2 - 0.016, 0.003]}>
          <boxGeometry args={[SW - 0.012, 0.010, 0.005]} />
        </mesh>
      </group>

      {/* ─── HINGES ─────────────────────────────────────────
          3 hinges at the corner junction (top / mid / bottom)
          Explodes: forward (+Z) + scale up to spotlight hardware */}
      <group ref={hingeRef} position={HINGE_HOME}>
        <Hinge m={hingeMat} y={ 0.52} />
        <Hinge m={hingeMat} y={ 0.00} />
        <Hinge m={hingeMat} y={-0.52} />
      </group>

      {/* ─── WALL SYSTEM ────────────────────────────────────
          Vertical wall profile + top & bottom wall mounts
          Explodes: left (−X) to reveal mounting method */}
      <group ref={wallRef} position={WALL_HOME}>
        {/* Vertical profile — always visible chrome */}
        <mesh material={chromeMat}>
          <boxGeometry args={[0.022, MH + 0.04, 0.022]} />
        </mesh>
        {/* Wall mounts use hardware material (fade in on explode) */}
        <WallMount m={wallHardMat} y={ 0.55} />
        <WallMount m={wallHardMat} y={-0.55} />
      </group>

      {/* ─── FLOOR PLANE ─────────────────────────────────────
          Thin reflective surface for visual grounding */}
      <mesh
        material={floorMat}
        position={[0, -MH/2 - 0.022, SW/4]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.4, 0.9]} />
      </mesh>

    </group>
  )
})

/* ─── Frameloop controller ───────────────────────────────────── */
function FrameloopController({ active }) {
  const { setFrameloop } = useThree()
  useEffect(() => {
    setFrameloop(active ? 'always' : 'never')
  }, [active, setFrameloop])
  return null
}

/* ─── Canvas wrapper ─────────────────────────────────────────── */
export default function GlassShardScene({ scrollP = 0, active = true }) {
  // scrollRef: update every render without causing ShowerScene to re-render
  const scrollRef = useRef(scrollP)
  scrollRef.current = scrollP

  return (
    <Canvas
      camera={{ fov: 38, position: CAMS[0].pos, near: 0.05, far: 14 }}
      gl={{
        antialias:           false,
        alpha:               true,
        powerPreference:     'high-performance',
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      dpr={[1, 1.5]}
      frameloop="always"
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <AdaptiveDpr pixelated />
      <FrameloopController active={active} />

      {/* 3-light setup: ambient + key + fill + subtle under-rim */}
      <ambientLight intensity={0.60} />
      <directionalLight position={[4, 6, 4]}  intensity={1.10} color="#ffffff" />
      <directionalLight position={[-2, 2, -1]} intensity={0.28} color="#b0d0f0" />
      <directionalLight position={[0, -3, 2]}  intensity={0.12} color="#e0e8f0" />

      <Suspense fallback={null}>
        <ShowerScene scrollRef={scrollRef} />
      </Suspense>
    </Canvas>
  )
}
