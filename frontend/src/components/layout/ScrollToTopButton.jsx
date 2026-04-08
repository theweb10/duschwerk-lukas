import { useState, useEffect } from 'react'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleClick() {
    setClicked(true)
    setTimeout(() => setClicked(false), 900)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Nach oben scrollen"
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 999,
        width: 42, height: 42, borderRadius: '50%',
        background: clicked ? '#C62828' : '#1F2E4A',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: clicked
          ? '0 4px 16px rgba(198,40,40,0.35)'
          : '0 4px 16px rgba(31,46,74,0.25)',
        color: '#fff',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.25s, transform 0.25s, background 0.2s, box-shadow 0.2s',
      }}
    >
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
