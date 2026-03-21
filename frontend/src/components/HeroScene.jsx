import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Environment, ContactShadows, Points, PointMaterial, Text } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Card colour palettes ─────────────────────────────────────────── */
const CARD_DATA = [
  {
    id: 0,
    label: 'HDFC Bank',
    network: 'VISA',
    type: 'Rewards Credit',
    offer: '5% cashback on fuel',
    commission: '2.5%',
    masked: '•••• •••• •••• 4821',
    color1: '#1a1a2e',
    color2: '#16213e',
    accent: '#4a90d9',
    chipColor: '#c8a951',
    // fan: slightly behind-left
    position: [-1.8, 0.6, -1.2],
    rotation: [-0.12, 0.55, 0.18],
    floatSpeed: 1.4,
    floatIntensity: 0.9,
  },
  {
    id: 1,
    label: 'ICICI Bank',
    network: 'Mastercard',
    type: 'Debit Card',
    offer: '10% off at Amazon',
    commission: '1.5%',
    masked: '•••• •••• •••• 7543',
    color1: '#0d0d0d',
    color2: '#1a0a00',
    accent: '#e85d04',
    chipColor: '#e0c060',
    // fan: front-centre
    position: [0.1, -0.05, 0],
    rotation: [-0.08, 0.1, 0.04],
    floatSpeed: 1.8,
    floatIntensity: 1.1,
  },
  {
    id: 2,
    label: 'SBI Bank',
    network: 'RuPay',
    type: 'Platinum Credit',
    offer: '₹500 off per ₹5000',
    commission: '3.0%',
    masked: '•••• •••• •••• 2290',
    color1: '#0f2027',
    color2: '#203a43',
    accent: '#2ecc71',
    chipColor: '#d4af37',
    // fan: behind-right
    position: [1.9, -0.5, -1.4],
    rotation: [-0.06, -0.4, -0.12],
    floatSpeed: 1.6,
    floatIntensity: 0.8,
  },
]

/* ─── Mouse-tracking rig ────────────────────────────────────────────── */
function CameraRig({ mouse }) {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.current[0] * 0.5, 0.04)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mouse.current[1] * 0.3, 0.04)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

/* ─── Single Credit Card ────────────────────────────────────────────── */
function CreditCard({ data, isHovered, onHover }) {
  const groupRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // subtle breathe on Y
    groupRef.current.position.y = data.position[1] + Math.sin(t * data.floatSpeed + data.id) * 0.08
    // glow pulse
    if (glowRef.current) {
      glowRef.current.intensity = isHovered
        ? 2.5 + Math.sin(t * 3) * 0.4
        : 0.6 + Math.sin(t * 1.5 + data.id) * 0.2
    }
  })

  const cardW = 3.2
  const cardH = 2.0
  const cardD = 0.055

  // gradient texture for card body
  const bodyTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 320
    const ctx = c.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 512, 320)
    grad.addColorStop(0, data.color1)
    grad.addColorStop(1, data.color2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 320)
    // subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let i = 0; i < 512; i += 40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,320); ctx.stroke() }
    for (let j = 0; j < 320; j += 40) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(512,j); ctx.stroke() }
    return new THREE.CanvasTexture(c)
  }, [data.color1, data.color2])

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      onPointerOver={() => onHover(data.id)}
      onPointerOut={() => onHover(null)}
    >
      <Float speed={data.floatSpeed} rotationIntensity={isHovered ? 0.2 : 0.8} floatIntensity={data.floatIntensity}>
        {/* Card body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[cardW, cardH, cardD]} />
          <meshPhysicalMaterial
            map={bodyTex}
            metalness={0.85}
            roughness={0.18}
            envMapIntensity={isHovered ? 2.8 : 1.6}
            clearcoat={1}
            clearcoatRoughness={0.08}
            reflectivity={0.9}
          />
        </mesh>

        {/* Chip */}
        <mesh position={[-1.08, 0.42, cardD / 2 + 0.002]}>
          <boxGeometry args={[0.42, 0.32, 0.008]} />
          <meshStandardMaterial color={data.chipColor} metalness={1} roughness={0.15} />
        </mesh>
        {/* Chip lines */}
        {[-0.04, 0.04].map((offX, i) => (
          <mesh key={i} position={[-1.08 + offX, 0.42, cardD / 2 + 0.007]}>
            <boxGeometry args={[0.01, 0.28, 0.001]} />
            <meshBasicMaterial color="#333" />
          </mesh>
        ))}

        {/* Contactless icon – simple rings */}
        {[0.09, 0.16, 0.23].map((r, i) => (
          <mesh key={i} position={[-0.62, 0.42, cardD / 2 + 0.003]} rotation={[0, 0, 0]}>
            <torusGeometry args={[r, 0.008, 8, 24, Math.PI]} />
            <meshBasicMaterial color="rgba(255,255,255,0.35)" />
          </mesh>
        ))}

        {/* Accent stripe along bottom */}
        <mesh position={[0, -cardH / 2 + 0.12, cardD / 2 + 0.002]}>
          <planeGeometry args={[cardW - 0.1, 0.22]} />
          <meshBasicMaterial color={data.accent} opacity={0.18} transparent />
        </mesh>

        {/* Network logo (dual circles for Mastercard / single for others) */}
        {data.network === 'Mastercard' ? (
          <>
            <mesh position={[1.12, -0.62, cardD / 2 + 0.003]}>
              <circleGeometry args={[0.21, 32]} />
              <meshBasicMaterial color="#eb001b" opacity={0.85} transparent />
            </mesh>
            <mesh position={[1.33, -0.62, cardD / 2 + 0.003]}>
              <circleGeometry args={[0.21, 32]} />
              <meshBasicMaterial color="#f79e1b" opacity={0.75} transparent />
            </mesh>
          </>
        ) : data.network === 'VISA' ? (
          <mesh position={[1.14, -0.64, cardD / 2 + 0.003]}>
            <planeGeometry args={[0.58, 0.22]} />
            <meshBasicMaterial color="#1a1f71" opacity={0.0} transparent />
          </mesh>
        ) : (
          /* RuPay – coloured rectangle */
          <mesh position={[1.1, -0.64, cardD / 2 + 0.003]}>
            <planeGeometry args={[0.6, 0.2]} />
            <meshBasicMaterial color={data.accent} opacity={0.6} transparent />
          </mesh>
        )}

        {/* Hover glow point light */}
        <pointLight
          ref={glowRef}
          position={[0, 0, 0.6]}
          color={data.accent}
          intensity={0.6}
          distance={3}
        />
      </Float>
    </group>
  )
}

/* ─── Floating particles ────────────────────────────────────────────── */
function Particles() {
  const ref = useRef()
  const count = 200
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14
    }
    return arr
  }, [])

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y -= dt * 0.04
      ref.current.rotation.x -= dt * 0.02
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#ffffff" size={0.04} sizeAttenuation depthWrite={false} opacity={0.55} />
      </Points>
    </group>
  )
}

/* ─── Scene ─────────────────────────────────────────────────────────── */
function Scene({ mouse }) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <>
      <CameraRig mouse={mouse} />
      <ambientLight intensity={0.35} />
      <spotLight position={[8, 10, 8]} angle={0.18} penumbra={1} intensity={1.4} castShadow />
      <pointLight position={[-8, -6, -6]} intensity={0.7} color="#7c6af7" />
      <pointLight position={[8, -6, 6]}  intensity={0.5} color="#00d2ff" />
      <pointLight position={[0, 8, 4]}   intensity={0.4} color="#ffffff" />

      {CARD_DATA.map((card) => (
        <CreditCard
          key={card.id}
          data={card}
          isHovered={hoveredId === card.id}
          onHover={setHoveredId}
        />
      ))}

      <Particles />
      <Environment preset="city" />
      <ContactShadows position={[0, -2.6, 0]} opacity={0.35} scale={14} blur={2.5} far={5} />
    </>
  )
}

/* ─── Overlay label ─────────────────────────────────────────────────── */
function CardLabel({ card, index }) {
  const badges = {
    0: { bg: 'rgba(74,144,217,0.15)', border: 'rgba(74,144,217,0.4)', text: '#4a90d9' },
    1: { bg: 'rgba(232,93,4,0.15)',   border: 'rgba(232,93,4,0.4)',   text: '#e85d04' },
    2: { bg: 'rgba(46,204,113,0.15)', border: 'rgba(46,204,113,0.4)', text: '#2ecc71' },
  }
  const b = badges[card.id]

  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${18 + index * 80}px`,
        right: index === 1 ? '18px' : index === 0 ? '130px' : '6px',
        background: 'rgba(0,0,0,0.72)',
        border: `1px solid ${b.border}`,
        borderRadius: '10px',
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        minWidth: '160px',
        pointerEvents: 'none',
        animation: `fadeInUp 0.6s ease ${0.15 * index}s both`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.text, boxShadow: `0 0 6px ${b.text}` }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'inherit' }}>{card.label}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginLeft: 2 }}>{card.network}</span>
      </div>
      <div style={{ fontSize: 12, color: b.text, fontWeight: 600, marginBottom: 2 }}>{card.offer}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{card.type} · {card.commission} commission</div>
    </div>
  )
}

/* ─── Root export ────────────────────────────────────────────────────── */
export default function HeroScene() {
  const mouse = useRef([0, 0])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    const y = -((e.clientY - rect.top)  / rect.height - 0.5) * 2
    mouse.current = [x, y]
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ width: '100%', height: '100%', minHeight: '420px', position: 'relative', cursor: 'grab' }}
    >
      {/* 3-D Canvas */}
      <Canvas camera={{ position: [0, 0, 6.5], fov: 42 }} dpr={[1, 2]} shadows>
        <Scene mouse={mouse} />
      </Canvas>

      {/* Overlay card info badges */}
      {CARD_DATA.map((card, i) => (
        <CardLabel key={card.id} card={card} index={i} />
      ))}

      {/* Top floating tag */}
      <div style={{
        position: 'absolute',
        top: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '6px 16px',
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}>
        ✦ Drag to explore · Hover a card for details
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
