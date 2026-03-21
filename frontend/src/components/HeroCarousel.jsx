import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

/* ── Card definitions ──────────────────────────────────────────── */
const CARDS = [
  { bank:'HDFC BANK',  type:'INFINITE',  holder:'SUPREETH G',  last4:'4821', expiry:'09/28', network:'VISA'  },
  { bank:'ICICI BANK', type:'SAPPHIRE',  holder:'RAHUL S',     last4:'7543', expiry:'03/27', network:'MC'    },
  { bank:'STATE BANK', type:'PLATINUM',  holder:'PRIYA M',     last4:'2290', expiry:'11/29', network:'MC'    },
  { bank:'AXIS BANK',  type:'RESERVE',   holder:'ARUN K',      last4:'3319', expiry:'06/27', network:'VISA'  },
  { bank:'KOTAK BANK', type:'LEAGUE',    holder:'DEEPA R',     last4:'9910', expiry:'01/30', network:'MC'    },
  { bank:'YES BANK',   type:'MARQUEE',   holder:'VIKRAM S',    last4:'6614', expiry:'07/28', network:'VISA'  },
  { bank:'AMEX',       type:'PLATINUM',  holder:'ANJALI P',    last4:'5567', expiry:'04/29', network:'AMEX'  },
  { bank:'INDUSIND',   type:'PINNACLE',  holder:'KARAN M',     last4:'8830', expiry:'12/27', network:'MC'    },
]

const N  = CARDS.length  // 8
/**
 *  Geometry layout
 *  ───────────────
 *  CW = card "width"  – this is the RADIAL dimension (long side points outward)
 *  CH = card "height" – TANGENTIAL dimension (short side, perpendicular to radius)
 *  The inner edge sits at INNER_R from the ring centre; card centre at INNER_R + CW/2
 */
const CW      = 2.55   // radial size  (the long 85.6mm dimension)
const CH      = 1.61   // tangential size (the short 54mm dimension)
const CD      = 0.06   // card thickness
const INNER_R = 0.42   // radius of the centre "donut hole"
const R       = INNER_R + CW / 2   // card centre distance from ring centre

/* ── Canvas card texture (face = top, i.e. normal = +Y after layout rotation) ── */
function makeCardTexture(card) {
  const W = 1024, H = 640
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const ctx = cv.getContext('2d')

  // Dark metallic background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0.00, '#0e0e18'); bg.addColorStop(0.30, '#1c1c2e')
  bg.addColorStop(0.55, '#111120'); bg.addColorStop(1.00, '#0a0a14')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Brushed-metal lines
  for (let y = 0; y < H; y += 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y)
    ctx.strokeStyle = `rgba(255,255,255,${(Math.random() * 0.018).toFixed(3)})`
    ctx.lineWidth = 1; ctx.stroke()
  }
  // Specular streak
  const sh = ctx.createLinearGradient(0, 0, W, H)
  sh.addColorStop(0,    'rgba(255,255,255,0)')
  sh.addColorStop(0.44, 'rgba(255,255,255,0.05)')
  sh.addColorStop(0.50, 'rgba(255,255,255,0.22)')
  sh.addColorStop(0.56, 'rgba(255,255,255,0.05)')
  sh.addColorStop(1,    'rgba(255,255,255,0)')
  ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H)
  // Top gloss
  const gl = ctx.createLinearGradient(0, 0, 0, H * 0.48)
  gl.addColorStop(0, 'rgba(255,255,255,0.14)'); gl.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H * 0.48)

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 2
  ctx.strokeRect(2, 2, W - 4, H - 4)

  // EMV Chip
  const cx = 90, cy = 225, cw = 130, ch = 100
  const cg = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch)
  cg.addColorStop(0, '#7a5500'); cg.addColorStop(0.25, '#c8a020')
  cg.addColorStop(0.5, '#f0d060'); cg.addColorStop(0.75, '#c8a020'); cg.addColorStop(1, '#7a5500')
  ctx.fillStyle = cg; ctx.fillRect(cx, cy, cw, ch)
  const cgl = ctx.createLinearGradient(cx, cy, cx, cy + 50)
  cgl.addColorStop(0, 'rgba(255,255,255,0.32)'); cgl.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = cgl; ctx.fillRect(cx, cy, cw, ch)
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.fillRect(cx + 10 + c * 54, cy + 10 + r * 28, 42, 22)
  }
  // NFC arcs
  ;[30, 50, 70].forEach(ar => {
    ctx.beginPath()
    ctx.arc(cx + cw + 52, cy + ch / 2, ar, -Math.PI * 0.65, Math.PI * 0.65)
    ctx.strokeStyle = 'rgba(255,255,255,0.40)'; ctx.lineWidth = 4; ctx.stroke()
  })

  // Bank + type
  ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 8
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = 'bold 62px "DM Sans",Arial'
  ctx.fillText(card.bank, 90, 90)
  ctx.fillStyle = 'rgba(255,255,255,0.40)'; ctx.font = '500 28px "DM Mono",monospace'
  ctx.letterSpacing = '4px'; ctx.fillText(card.type, 90, 130); ctx.shadowBlur = 0

  // Card number
  ctx.shadowBlur = 4; ctx.font = '600 54px "DM Mono","Courier New"'; ctx.letterSpacing = '5px'
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillText(`•••• •••• •••• ${card.last4}`, 90, 415)
  ctx.fillStyle = 'rgba(255,255,255,0.86)'; ctx.fillText(`•••• •••• •••• ${card.last4}`, 88, 412)
  ctx.shadowBlur = 0

  // CARD HOLDER / VALID THRU labels
  ctx.font = '500 24px "DM Mono",monospace'; ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillText('CARD HOLDER', 90, 488); ctx.fillText('VALID THRU', 400, 488)
  ctx.font = '600 32px "DM Sans",Arial'; ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.fillText(card.holder, 90, 528)
  ctx.font = '600 32px "DM Mono",monospace'; ctx.fillText(card.expiry, 400, 528)

  // Network logo
  ctx.textAlign = 'right'
  if (card.network === 'MC') {
    ctx.beginPath(); ctx.arc(W - 138, H - 72, 44, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(215,20,28,0.92)'; ctx.fill()
    ctx.beginPath(); ctx.arc(W - 90, H - 72, 44, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(245,155,20,0.90)'; ctx.fill()
  } else if (card.network === 'VISA') {
    ctx.font = 'italic 900 82px "Times New Roman",serif'
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.shadowBlur = 10
    ctx.fillText('VISA', W - 60, H - 44); ctx.shadowBlur = 0
  } else if (card.network === 'AMEX') {
    ctx.font = 'bold 40px "DM Sans",Arial'
    ctx.fillStyle = 'rgba(100,200,255,0.92)'; ctx.fillText('AMEX', W - 60, H - 52)
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/* ── Card ring ──────────────────────────────────────────────────── */
function CardRing({ textures }) {
  const spinRef  = useRef()

  useFrame((_, dt) => {
    if (spinRef.current) spinRef.current.rotation.z += dt * 0.28
  })

  /**
   *  Rotation maths for flat-disc pinwheel
   *  ────────────────────────────────────
   *  BoxGeometry default:  width=CW along X, height=CH along Y, depth=CD along Z, face = +Z
   *
   *  Goal: card lies flat in XZ plane (face = +Y), long axis (CW) points radially.
   *
   *  Step 1 – Rx( PI/2):  Z→+Y  (face flips up),  Y→-Z
   *  Step 2 – Ry(PI/2-θ): under XYZ-Euler applied AFTER step 1 in world frame,
   *            this rotates the old-X (=CW) toward the radial direction (sinθ, 0, cosθ).
   *  Proof:
   *    After Rx(PI/2) local-X is still world-X = (1,0,0)
   *    Ry(PI/2-θ) maps X → (cos(PI/2-θ), 0, -sin(PI/2-θ)) = (sinθ, 0, -cosθ)   ← nearly radial
   *    …but we want (sinθ, 0, cosθ).  Negate Z by adding PI to the Y angle:
   *    Ry(PI/2-θ+PI) = Ry(3PI/2-θ):
   *      cos(3PI/2-θ) = cos(3PI/2)cosθ + sin(3PI/2)sinθ = 0·cosθ + (-1)·sinθ = -sinθ  ✗
   *
   *  Cleaner: just add Math.PI to the Y rotation to mirror on correct side.
   *  After empirical testing the correct euler for this setup is:
   *       rotation = [-PI/2,  PI/2 + angle,  0]
   *
   *  Verify angle=0 (card at front, position = (0,0,R)):
   *    Rx(-PI/2): face(+Z)→-Y (face down). Hmm. Let me redo:
   *    Actually THREE.js Euler XYZ applies Rz*Ry*Rx (column-major convention).
   *    So for [a,b,0]: result = Ry(b)*Rx(a).
   *
   *  Using rotation = [PI/2, angle+PI, 0]:  (same as current code, which gave vertical cards)
   *  Using rotation = [-PI/2, angle, 0]:
   *    Rx(-PI/2): Z→-Y (face goes down), Y→Z
   *    Ry(angle): side-to-side, card still flat with face down
   *    → not visible from top
   *
   *  SIMPLEST SOLUTION: Use PlaneGeometry (face = +Z) and rotate it to lie horizontal.
   */
  const cards = useMemo(() =>
    CARDS.map((_, i) => {
      const angle = (i / N) * Math.PI * 2
      return {
        x: R * Math.sin(angle),
        z: R * Math.cos(angle),
        // rotation: lay card flat in XZ plane (face = +Y), long axis radial
        // In three.js Euler 'XYZ' order, for a PlaneGeometry (normal = +Z):
        //   Rx(-PI/2) → lays the plane so normal = +Y (face up)
        //   Ry(angle) → rotates the long Y-axis of the plane to point radially
        rx: -Math.PI / 2,
        ry: angle,
      }
    }),
  [])

  return (
    /* outer group: static tilt so we see the disc from a nice angle */
    <group rotation={[-0.85, 0, 0]}>
      {/* inner group: spins around the disc normal (world Z after parent tilt) */}
      <group ref={spinRef}>
        {cards.map((c, i) => (
          <mesh
            key={i}
            position={[c.x, 0, c.z]}
            rotation={[c.rx, c.ry, 0]}
            castShadow
          >
            {/*
              PlaneGeometry: args = [width, height]
                width  → local X axis → after Rx(-PI/2) stays in world X
                height → local Y axis → after Rx(-PI/2) goes to world Z (radial when Ry=angle)
              So use [CH=tangential, CW=radial] as the plane args.
            */}
            <planeGeometry args={[CH, CW]} />
            <meshStandardMaterial
              map={textures[i]}
              metalness={0.50}
              roughness={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ── Root export ────────────────────────────────────────────────── */
export default function HeroCarousel() {
  const textures = useMemo(() => CARDS.map(makeCardTexture), [])

  return (
    <div style={{ width: '100%', height: '680px', position: 'relative' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', display: 'block' }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.5, 10]} fov={50} />
        <ambientLight intensity={1.50} />
        <hemisphereLight args={['#ffffff', '#222244', 1.0]} />
        <pointLight position={[-5, 8, 6]}  intensity={3.5} color="#fff8f0" />
        <pointLight position={[ 6, 4, -4]} intensity={2.0} color="#c8d8ff" />
        <pointLight position={[ 0, -4, -6]} intensity={1.2} color="#a0a8ff" />
        <Suspense fallback={null}>
          <CardRing textures={textures} />
        </Suspense>
      </Canvas>
    </div>
  )
}
