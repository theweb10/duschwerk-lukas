/**
 * GlassCard — interactive card built on GlassPanel.
 *
 * Adds hover lift + press feedback. The CSS transitions are only applied
 * to transform/box-shadow — both GPU-composited — so there's zero layout
 * cost at any frame rate.
 *
 * Usage:
 *   <GlassCard variant="light" padding={24} onClick={handleClick}>
 *     ...content...
 *   </GlassCard>
 */
import { forwardRef } from 'react'
import { GlassPanel } from './GlassPanel'

export const GlassCard = forwardRef(function GlassCard(
  {
    variant   = 'light',
    padding   = 20,
    hover     = true,
    className = '',
    style,
    children,
    ...rest
  },
  ref
) {
  return (
    <GlassPanel
      ref={ref}
      variant={variant}
      className={`${hover ? 'glass-card-hover' : ''} ${className}`.trim()}
      style={{
        padding,
        cursor: rest.onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </GlassPanel>
  )
})
