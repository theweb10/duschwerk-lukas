/**
 * Regensburg Skyline – basiert auf dem echten Stadtbild.
 *
 * variant="light"  → für helle Hintergründe (Hero, weiß/hellgrau)
 * variant="dark"   → für dunkle Hintergründe (Footer, CTA-Section)
 */
export default function RegensburgSilhouette({ variant = 'light', className = '' }) {
  const style =
    variant === 'dark'
      ? {
          // Auf dunklem Hintergrund: Bild invertieren → weiße Linien
          filter: 'invert(1)',
          mixBlendMode: 'screen',
          opacity: 0.10,
        }
      : {
          // Auf hellem Hintergrund: multiply entfernt Weiß, Linien bleiben dunkel
          mixBlendMode: 'multiply',
          opacity: 0.11,
        }

  return (
    <img
      src="/regensburg-skyline.png"
      alt=""
      aria-hidden="true"
      draggable="false"
      className={`w-full h-auto block select-none pointer-events-none ${className}`}
      style={style}
    />
  )
}
