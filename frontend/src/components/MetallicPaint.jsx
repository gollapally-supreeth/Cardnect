import { useEffect, useRef } from 'react'
import './MetallicPaint.css'

/* ─────────────────────────────────────────────────────────────
   3D Embossed Chrome Text — Canvas 2D
   Replicates the bubbly, shiny chrome look from the reference:
     • Chrome vertical gradient (white → silver → dark → silver → white)
     • Layered drop-shadows for 3D depth
     • Animated specular shine sweep across letters
     • Soft bevel glow at top and bottom edges
───────────────────────────────────────────────────────────── */

export default function MetallicPaint({
  text       = 'CARDNECT',
  className  = '',
}) {
  const canvasRef = useRef(null)
  const shineRef  = useRef(0)    // 0..1 position of shimmer

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let raf
    let t0 = performance.now()

    /* ── Resize ── */
    const fit = () => {
      const p = canvas.parentElement
      canvas.width  = p.offsetWidth  || 900
      canvas.height = p.offsetHeight || 160
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas.parentElement)

    /* ── Mouse → shine position ── */
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      shineRef.current = (e.clientX - r.left) / r.width
    }
    window.addEventListener('mousemove', onMove)

    const FONT_FAMILY = "'Nunito', 'DM Sans', system-ui, sans-serif"
    const FONT_WEIGHT = '900'

    const draw = () => {
      const W = canvas.width, H = canvas.height
      if (!W || !H) { raf = requestAnimationFrame(draw); return }

      const t = (performance.now() - t0) / 1000

      ctx.clearRect(0, 0, W, H)

      /* Auto-fit font size */
      const fs = Math.floor(H * 0.78)
      ctx.font        = `${FONT_WEIGHT} ${fs}px ${FONT_FAMILY}`
      ctx.textAlign   = 'center'
      ctx.textBaseline = 'middle'

      const cx = W / 2, cy = H / 2

      /* ── LAYER 1: deep drop shadow (3D base emboss) ── */
      ctx.save()
      ctx.shadowColor   = 'rgba(0,0,0,0.55)'
      ctx.shadowBlur    = 18
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 6
      ctx.fillStyle = '#888'
      ctx.fillText(text, cx, cy)
      ctx.restore()

      /* ── LAYER 2: bottom bevel (bright rim bottom) ── */
      ctx.save()
      ctx.shadowColor   = 'rgba(255,255,255,0.30)'
      ctx.shadowBlur    = 6
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = -3
      ctx.fillStyle = '#bbb'
      ctx.fillText(text, cx, cy + 1)
      ctx.restore()

      /* ── LAYER 3: main chrome gradient fill ── */
      const grad = ctx.createLinearGradient(0, cy - H * 0.45, 0, cy + H * 0.45)
      grad.addColorStop(0.00, '#ffffff')   // bright top highlight
      grad.addColorStop(0.12, '#f0f0f0')
      grad.addColorStop(0.28, '#b8b8b8')   // upper slope
      grad.addColorStop(0.45, '#888888')   // dark inner band
      grad.addColorStop(0.55, '#c0c0c0')   // lower reflective band
      grad.addColorStop(0.72, '#e8e8e8')
      grad.addColorStop(0.88, '#f8f8f8')   // bottom rim highlight
      grad.addColorStop(1.00, '#d0d0d0')

      ctx.save()
      ctx.shadowColor   = 'rgba(0,0,0,0.25)'
      ctx.shadowBlur    = 4
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 2
      ctx.fillStyle = grad
      ctx.fillText(text, cx, cy)
      ctx.restore()

      /* ── LAYER 4: top specular highlight (bright white bubbly cap) ── */
      const specH = H * 0.38
      const specGrad = ctx.createLinearGradient(0, cy - H * 0.45, 0, cy - H * 0.45 + specH)
      specGrad.addColorStop(0.0, 'rgba(255,255,255,0.92)')
      specGrad.addColorStop(0.3, 'rgba(255,255,255,0.55)')
      specGrad.addColorStop(0.7, 'rgba(255,255,255,0.08)')
      specGrad.addColorStop(1.0, 'rgba(255,255,255,0.00)')

      // Clip to text shape, then fill specular rect
      ctx.save()
      ctx.globalCompositeOperation = 'source-atop'

      // Re-draw background chrome text to establish clipping region
      ctx.fillStyle = grad
      ctx.fillText(text, cx, cy)

      // Overlay specular gradient
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = specGrad
      ctx.fillRect(0, cy - H * 0.45, W, specH)
      ctx.restore()

      /* ── LAYER 5: animated shine sweep ── */
      // Auto-sweep + mouse override
      const autoX = (t * 0.18) % 1.4 - 0.2
      const mX    = shineRef.current
      const shineX = (mX > 0.01 ? mX : autoX) * W

      const shineGrad = ctx.createLinearGradient(shineX - 80, 0, shineX + 80, 0)
      shineGrad.addColorStop(0,    'rgba(255,255,255,0)')
      shineGrad.addColorStop(0.4,  'rgba(255,255,255,0.0)')
      shineGrad.addColorStop(0.48, 'rgba(255,255,255,0.55)')
      shineGrad.addColorStop(0.5,  'rgba(255,255,255,0.85)')
      shineGrad.addColorStop(0.52, 'rgba(255,255,255,0.55)')
      shineGrad.addColorStop(0.6,  'rgba(255,255,255,0.0)')
      shineGrad.addColorStop(1,    'rgba(255,255,255,0)')

      ctx.save()
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = grad
      ctx.fillText(text, cx, cy)      // re-establish letter clip
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = shineGrad
      ctx.fillRect(0, 0, W, H)
      ctx.restore()

      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
    }
  }, [text])

  return (
    <div className={`mp-root ${className}`}>
      <canvas ref={canvasRef} className="mp-canvas" aria-label={text} />
    </div>
  )
}
