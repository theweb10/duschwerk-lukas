/**
 * useScrollProgress — canonical scroll controller for the site.
 *
 * Returns { raw, smooth, velocity } normalised to [0, 1] across
 * a container element's scrollable range.
 *
 * Design decisions:
 *  - passive scroll listener: never blocks the main thread
 *  - single RAF loop with delta-threshold: zero renders when idle
 *  - lerp factor exposed so callers tune sluggishness independently
 *  - velocity useful for momentum-style effects and direction detection
 */
import { useState, useEffect, useRef } from 'react'

const lerp  = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function useScrollProgress(containerRef, {
  lerpFactor = 0.11,   // 0.08 = dreamy / 0.18 = snappy
  threshold  = 0.00015 // min delta before React re-renders
} = {}) {
  const [state, setState] = useState({ raw: 0, smooth: 0, velocity: 0 })
  const rawRef    = useRef(0)
  const smoothRef = useRef(0)
  const rafRef    = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current
      if (!el) return
      const rect  = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) return
      rawRef.current = clamp(-rect.top / total, 0, 1)
    }

    const tick = () => {
      const prev = smoothRef.current
      const next = lerp(prev, rawRef.current, lerpFactor)
      const vel  = next - prev
      smoothRef.current = next

      if (Math.abs(vel) > threshold || Math.abs(rawRef.current - next) > threshold) {
        setState({ raw: rawRef.current, smooth: next, velocity: vel })
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [containerRef, lerpFactor, threshold])

  return state
}
