import './ShinyText.css'

/**
 * ShinyText — ReactBits-style animated shine sweep on metallic text.
 *
 * Technique:
 *   Two CSS background layers with background-clip: text
 *     Layer 1 (top) — animated shine beam that sweeps left→right
 *     Layer 2 (base) — static polished silver vertical gradient
 *   The animation only moves layer 1's background-position.
 */
export default function ShinyText({
  text      = 'CARDNECT',
  className = '',
  speed     = 4,           // seconds per sweep
  disabled  = false,
}) {
  return (
    <span
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={{ '--shine-speed': `${speed}s` }}
      aria-label={text}
    >
      {text}
    </span>
  )
}
