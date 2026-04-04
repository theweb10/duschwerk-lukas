import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'

/**
 * 3D Page Transitions via View Transitions API.
 *
 * Intercepts every internal <a href> click in the capture phase,
 * then wraps React Router's navigate() in startViewTransition so the
 * browser can snapshot old → new and play the CSS animations in between.
 *
 * flushSync forces React to flush the route update synchronously,
 * which is required for the View Transitions snapshot to be correct.
 *
 * Falls back gracefully in browsers without View Transitions support.
 */
export function usePageTransition() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a[href]')
      if (!link) return

      const href = link.getAttribute('href')

      // Only handle internal routes (starts with /)
      if (!href || !href.startsWith('/')) return
      // Skip blank targets
      if (link.target === '_blank') return
      // Skip if already prevented (e.g. by another handler)
      if (e.defaultPrevented) return
      // Graceful fallback: no View Transitions = browser navigates normally
      if (!document.startViewTransition) return
      // Skip transition when already on the target page
      if (href === window.location.pathname) return

      e.preventDefault()

      document.startViewTransition(() => {
        // flushSync: makes React process the navigate() update
        // synchronously so the browser captures the correct new DOM
        flushSync(() => {
          navigate(href)
        })
      })
    }

    // capture:true → fires before React Router's own click handler
    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [navigate])
}
