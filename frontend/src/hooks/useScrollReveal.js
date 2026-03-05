import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll-reveal via IntersectionObserver.
 * Elements with [data-reveal] fade in + lift when they enter the viewport.
 * Optional [data-reveal-delay="150"] for stagger (ms).
 * Re-runs on every route change so new pages animate correctly.
 */
export function useScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Let React flush the new page first
    const setup = setTimeout(() => {
      const els = document.querySelectorAll('[data-reveal]')

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const delay = Number(entry.target.dataset.revealDelay ?? 0)
            setTimeout(() => {
              entry.target.classList.add('revealed')
            }, delay)
            observer.unobserve(entry.target)
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
      )

      els.forEach((el) => {
        el.classList.remove('revealed') // reset on page change
        observer.observe(el)
      })

      return () => observer.disconnect()
    }, 60)

    return () => clearTimeout(setup)
  }, [pathname])
}
