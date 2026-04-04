/**
 * GlassPanel — foundational liquid-glass component.
 *
 * Implements Apple-style glassmorphism:
 *  • backdrop-filter blur + saturation                 (GPU composited)
 *  • specular top-rim highlight                        (1px gradient)
 *  • inner radial gleam (light scatter simulation)
 *  • optional film-grain noise texture                 (SVG data-URI, no asset)
 *  • @supports fallback for Firefox without flag
 *
 * All visual knobs are CSS-var-driven so you can override with a className
 * without creating a new variant.
 *
 * Variants:  'light' | 'dark' | 'blue' | 'chrome'
 */
import { forwardRef } from 'react'

const VARIANTS = {
  light: {
    fill:     'rgba(255,255,255,0.18)',
    border:   'rgba(255,255,255,0.70)',
    gleam:    'rgba(255,255,255,0.52)',
    shadow:   '0 8px 32px rgba(0,0,0,0.07)',
    fallback: 'rgba(255,255,255,0.97)',
  },
  dark: {
    fill:     'rgba(8,16,36,0.45)',
    border:   'rgba(255,255,255,0.13)',
    gleam:    'rgba(255,255,255,0.18)',
    shadow:   '0 8px 40px rgba(0,0,0,0.30)',
    fallback: 'rgba(18,28,52,0.97)',
  },
  blue: {
    fill:     'rgba(43,90,168,0.16)',
    border:   'rgba(160,200,255,0.55)',
    gleam:    'rgba(210,230,255,0.46)',
    shadow:   '0 8px 32px rgba(43,90,168,0.18)',
    fallback: 'rgba(240,246,255,0.97)',
  },
  chrome: {
    fill:     'rgba(200,215,235,0.22)',
    border:   'rgba(255,255,255,0.80)',
    gleam:    'rgba(255,255,255,0.65)',
    shadow:   '0 6px 24px rgba(0,0,0,0.12)',
    fallback: 'rgba(232,238,248,0.97)',
  },
}

export const GlassPanel = forwardRef(function GlassPanel(
  {
    variant    = 'light',
    blur       = 22,
    saturation = 1.65,
    radius     = 16,
    shimmer    = true,  // top specular rim line
    gleam      = true,  // inner radial highlight
    noise      = false, // film-grain texture overlay
    className  = '',
    style,
    children,
    ...rest
  },
  ref
) {
  const v = VARIANTS[variant] ?? VARIANTS.light

  return (
    <div
      ref={ref}
      className={`glass-panel-root${noise ? ' glass-noise' : ''} ${className}`.trim()}
      style={{
        // Expose as CSS vars so subclasses can override without new props
        '--glass-fill':     v.fill,
        '--glass-border':   v.border,
        '--glass-gleam':    v.gleam,
        '--glass-blur':     `${blur}px`,
        '--glass-sat':      saturation,
        '--glass-radius':   `${radius}px`,
        '--glass-fallback': v.fallback,
        position:           'relative',
        borderRadius:       'var(--glass-radius)',
        background:         'var(--glass-fill)',
        backdropFilter:     `blur(var(--glass-blur)) saturate(var(--glass-sat)) brightness(1.02)`,
        WebkitBackdropFilter: `blur(var(--glass-blur)) saturate(var(--glass-sat)) brightness(1.02)`,
        border:             '1px solid var(--glass-border)',
        boxShadow:          `${v.shadow}, inset 0 1px 0 var(--glass-gleam)`,
        overflow:           'hidden',
        ...style,
      }}
      {...rest}
    >
      {/* Top specular rim — 1px gradient simulating light hitting the glass edge */}
      {shimmer && (
        <span
          aria-hidden="true"
          style={{
            position:   'absolute',
            top: 0, left: '8%', right: '8%',
            height:     '1px',
            background: `linear-gradient(90deg,
              transparent 0%,
              var(--glass-gleam) 20%,
              var(--glass-gleam) 80%,
              transparent 100%)`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}

      {/* Inner radial gleam — simulates diffused light scatter inside the glass */}
      {gleam && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '62%', height: '58%',
            background: `radial-gradient(ellipse at 22% 18%,
              rgba(255,255,255,0.26) 0%,
              transparent 65%)`,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}

      {/* Content — above all glass layers */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        {children}
      </div>
    </div>
  )
})
