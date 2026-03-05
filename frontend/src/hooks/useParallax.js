import { useState, useEffect, useRef } from 'react'

/**
 * Smooth mouse parallax hook.
 * Returns normalised { x, y } in range [-1, 1], lerped for silky movement.
 * Auto-disabled on touch/mobile devices.
 */
export function useParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const raf    = useRef(null)

  useEffect(() => {
    // No parallax on touch devices
    if (window.matchMedia('(hover: none)').matches) return

    const onMove = (e) => {
      target.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }

    // Lerp factor: lower = smoother / lazier
    const tick = () => {
      setPos(prev => ({
        x: prev.x + (target.current.x - prev.x) * 0.055,
        y: prev.y + (target.current.y - prev.y) * 0.055,
      }))
      raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return pos
}
