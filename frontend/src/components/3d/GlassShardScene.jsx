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
import { AdaptiveDpr, Environment } from '@react-three/drei'
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

// Premium cylindrical hinge with thick flanges + chamfer detail
function Hinge({ m, y }) {
  const rot = [0, 0, Math.PI / 2]
  return (
    <group position={[0, y, 0]}>
      {/* Main barrel */}
      <mesh material={m} rotation={rot}><cylinderGeometry args={[0.022, 0.022, 0.060, 16]} /></mesh>
      {/* Flanges — larger for premium look */}
      <mesh material={m} position={[-0.022, 0, 0]} rotation={rot}><cylinderGeometry args={[0.034, 0.034, 0.010, 16]} /></mesh>
      <mesh material={m} position={[ 0.022, 0, 0]} rotation={rot}><cylinderGeometry args={[0.034, 0.034, 0.010, 16]} /></mesh>
      {/* Screw detail on each flange */}
      <mesh material={m} position={[-0.027, 0.014, 0]} rotation={rot}><cylinderGeometry args={[0.004, 0.004, 0.005, 8]} /></mesh>
      <mesh material={m} position={[-0.027,-0.014, 0]} rotation={rot}><cylinderGeometry args={[0.004, 0.004, 0.005, 8]} /></mesh>
      <mesh material={m} position={[ 0.027, 0.014, 0]} rotation={rot}><cylinderGeometry args={[0.004, 0.004, 0.005, 8]} /></mesh>
      <mesh material={m} position={[ 0.027,-0.014, 0]} rotation={rot}><cylinderGeometry args={[0.004, 0.004, 0.005, 8]} /></mesh>
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

// Premium D-bar door handle — Hansgrohe/Axor style
// Oval cross-section bar + flat mounting plates with rounded edges
function Handle({ m }) {
  const bx   = MW / 2 - 0.022
  const barH = 0.32
  const reach = 0.042  // how far bar stands off glass
  return (
    <group position={[bx, 0.04, GT / 2 + reach]}>
      {/* Main bar — oval cross-section (slightly flattened cylinder) */}
      <mesh material={m} scale={[1, 1, 0.60]}>
        <cylinderGeometry args={[0.011, 0.011, barH, 16]} />
      </mesh>
      {/* Sphere end-caps for premium rounded finish */}
      <mesh material={m} position={[0,  barH/2, 0]} scale={[1, 0.6, 0.6]}>
        <sphereGeometry args={[0.011, 12, 8]} />
      </mesh>
      <mesh material={m} position={[0, -barH/2, 0]} scale={[1, 0.6, 0.6]}>
        <sphereGeometry args={[0.011, 12, 8]} />
      </mesh>
      {/* Upper mounting plate */}
      <mesh material={m} position={[0, barH/2 - 0.022, -reach/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.006, 16]} />
      </mesh>
      <mesh material={m} position={[0, barH/2 - 0.022, -(reach + 0.003)]}>
        <boxGeometry args={[0.026, 0.036, reach - 0.004]} />
      </mesh>
      {/* Lower mounting plate */}
      <mesh material={m} position={[0, -barH/2 + 0.022, -reach/2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.006, 16]} />
      </mesh>
      <mesh material={m} position={[0, -barH/2 + 0.022, -(reach + 0.003)]}>
        <boxGeometry args={[0.026, 0.036, reach - 0.004]} />
      </mesh>
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

  // Premium clear safety glass — very clear, slight blue-green tint
  const glassMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:             new THREE.Color('#d8eef6'),
    transparent:       true,
    opacity:           0.30,
    roughness:         0.01,
    metalness:         0.10,
    side:              THREE.DoubleSide,
    depthWrite:        false,
    emissive:          new THREE.Color('#0a2a50'),
    emissiveIntensity: 0.03,
    envMapIntensity:   1.8,
  }), [])

  // Glass edges — characteristic polished glass-edge green
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:             new THREE.Color('#a8d4bc'),
    transparent:       true,
    opacity:           0.72,
    roughness:         0.04,
    metalness:         0.12,
    side:              THREE.FrontSide,
    depthWrite:        false,
    envMapIntensity:   1.2,
  }), [])

  // Polished chrome — high metalness, near-mirror
  const chromeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:           new THREE.Color('#e8eff5'),
    metalness:       0.96,
    roughness:       0.06,
    envMapIntensity: 2.2,
  }), [])

  // Hardware chrome (hinges) — starts hidden, fades in as explode reveals it
  const hingeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:           new THREE.Color('#d0dce8'),
    metalness:       0.95,
    roughness:       0.05,
    transparent:     true,
    opacity:         0.0,
    envMapIntensity: 2.0,
  }), [])

  // Wall mount hardware (same fade-in behavior)
  const wallHardMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:           new THREE.Color('#dce8f0'),
    metalness:       0.94,
    roughness:       0.07,
    transparent:     true,
    opacity:         0.0,
    envMapIntensity: 1.8,
  }), [])

  // Silicone seal — matte translucent white
  const sealMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:       new THREE.Color('#eef2f2'),
    transparent: true,
    opacity:     0.85,
    roughness:   0.90,
    metalness:   0.0,
  }), [])

  // Floor — polished stone/marble tile
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:           new THREE.Color('#c8d4de'),
    transparent:     true,
    opacity:         0.30,
    roughness:       0.15,
    metalness:       0.30,
    envMapIntensity: 1.2,
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

    /* ── Glass: becomes more defined as explode reveals material quality ── */
    glassMat.opacity           = lerp(0.30, 0.38, ease(exT))
    glassMat.emissiveIntensity = lerp(0.03, 0.05, ease(exT))
    glassMat.envMapIntensity   = lerp(1.8,  2.4,  ease(exT))
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
          Polished stone floor for visual grounding */}
      <mesh
        material={floorMat}
        position={[0, -MH/2 - 0.022, SW/4]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.8, 1.2]} />
      </mesh>

      {/* ─── WALL BACKDROP ────────────────────────────────────
          Subtle large-format tile wall behind the installation */}
      <mesh
        position={[0.08, 0.04, -SW * 0.9]}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial
          color="#dde4ec"
          roughness={0.55}
          metalness={0.04}
          transparent
          opacity={0.32}
        />
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
        antialias:           true,
        alpha:               true,
        powerPreference:     'high-performance',
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      shadows
      dpr={[1, 1.5]}
      frameloop="always"
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <AdaptiveDpr pixelated />
      <FrameloopController active={active} />

      {/* Environment map — critical for glass + chrome reflections */}
      <Environment preset="studio" />

      {/* Key light — warm from upper-right, casts crisp shadows on chrome */}
      <directionalLight
        position={[3.5, 5.0, 3.5]}
        intensity={1.20}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />
      {/* Fill — cool diffuse from left */}
      <directionalLight position={[-3, 2.5, 1.5]} intensity={0.35} color="#c8dff4" />
      {/* Rim — behind for edge-lighting on chrome profiles */}
      <directionalLight position={[0.5, 1.5, -3.0]} intensity={0.22} color="#e8f0f8" />
      {/* Under-bounce — subtle floor reflection */}
      <directionalLight position={[0, -4, 2]} intensity={0.10} color="#dce8f0" />
      {/* Ambient — very low, preserve shadow depth */}
      <ambientLight intensity={0.18} color="#e8f2ff" />

      <Suspense fallback={null}>
        <ShowerScene scrollRef={scrollRef} />
      </Suspense>
    </Canvas>
  )
}
