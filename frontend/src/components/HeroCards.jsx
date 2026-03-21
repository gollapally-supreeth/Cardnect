import { useState, useEffect, useCallback } from 'react'
import './HeroCards.css'

/* Premium metal card palette — no colour glow, no holo, no tint */
const CARDS = [
  {
    id: 0,
    bank: 'HDFC BANK',
    holder: 'Supreeth G.',
    type: 'DINERS CLUB BLACK',
    network: 'visa',
    masked: '4821',
    expiry: '09 / 28',
    badge: 'INFINITE',
    /* Dark titanium — like Apple Card */
    bg: 'linear-gradient(112deg,#161616 0%,#242424 18%,#1a1a1a 28%,#2e2e2e 42%,#1c1c1c 56%,#262626 72%,#161616 100%)',
    streak: 'linear-gradient(105deg,transparent 38%,rgba(255,255,255,0.11) 48%,rgba(255,255,255,0.22) 52%,rgba(255,255,255,0.10) 58%,transparent 68%)',
    chip: { b: '#be9a28', m: '#e8c860', d: '#8a6a00' },
    textColor: 'rgba(255,255,255,0.82)',
  },
  {
    id: 1,
    bank: 'ICICI BANK',
    holder: 'Rahul S.',
    type: 'SAPPHIRE DEBIT',
    network: 'mastercard',
    masked: '7543',
    expiry: '03 / 27',
    badge: 'SIGNATURE',
    /* Midnight steel blue-black */
    bg: 'linear-gradient(112deg,#0a0e18 0%,#141c2c 18%,#0c1220 28%,#1a2538 42%,#0e1424 56%,#161e30 72%,#0a0e18 100%)',
    streak: 'linear-gradient(105deg,transparent 38%,rgba(120,180,255,0.09) 48%,rgba(200,230,255,0.20) 52%,rgba(120,180,255,0.08) 58%,transparent 68%)',
    chip: { b: '#c8a951', m: '#f0cc60', d: '#8e6e20' },
    textColor: 'rgba(220,235,255,0.82)',
  },
  {
    id: 2,
    bank: 'STATE BANK OF INDIA',
    holder: 'Priya M.',
    type: 'PLATINUM ELITE',
    network: 'rupay',
    masked: '2290',
    expiry: '11 / 29',
    badge: 'PLATINUM',
    /* Gunmetal / space-grey matte */
    bg: 'linear-gradient(112deg,#1e2020 0%,#2a2e2e 18%,#222626 28%,#323838 42%,#242828 56%,#2c3030 72%,#1e2020 100%)',
    streak: 'linear-gradient(105deg,transparent 38%,rgba(255,255,255,0.09) 48%,rgba(255,255,255,0.19) 52%,rgba(255,255,255,0.08) 58%,transparent 68%)',
    chip: { b: '#d4af37', m: '#f2cc50', d: '#9a7d10' },
    textColor: 'rgba(230,238,235,0.82)',
  },
  {
    id: 3,
    bank: 'AXIS BANK',
    holder: 'Arun K.',
    type: 'RESERVE CREDIT',
    network: 'visa',
    masked: '3319',
    expiry: '06 / 27',
    badge: 'RESERVE',
    /* Deep obsidian black */
    bg: 'linear-gradient(112deg,#0e0e0e 0%,#1c1c1c 18%,#141414 28%,#222222 42%,#121212 56%,#1a1a1a 72%,#0e0e0e 100%)',
    streak: 'linear-gradient(105deg,transparent 38%,rgba(255,255,255,0.08) 48%,rgba(255,255,255,0.18) 52%,rgba(255,255,255,0.08) 58%,transparent 68%)',
    chip: { b: '#c8a030', m: '#e8bc48', d: '#886a00' },
    textColor: 'rgba(255,255,255,0.78)',
  },
  {
    id: 4,
    bank: 'KOTAK MAHINDRA',
    holder: 'Deepa R.',
    type: 'LEAGUE INFINITE',
    network: 'mastercard',
    masked: '9910',
    expiry: '01 / 30',
    badge: 'LEAGUE',
    /* Brushed dark gold / champagne */
    bg: 'linear-gradient(112deg,#1a1400 0%,#2a2000 18%,#201800 28%,#342a00 42%,#261c00 56%,#2e2400 72%,#1a1400 100%)',
    streak: 'linear-gradient(105deg,transparent 38%,rgba(255,220,80,0.10) 48%,rgba(255,240,160,0.22) 52%,rgba(255,220,80,0.10) 58%,transparent 68%)',
    chip: { b: '#d4a800', m: '#f0c818', d: '#8e6a00' },
    textColor: 'rgba(255,245,210,0.82)',
  },
]

const FAN = [
  { x: 0,   y: 0,    z: 0,    rot: 0,   scale: 1,    op: 1    },
  { x: 72,  y: -42,  z: -50,  rot: 15,  scale: 0.83, op: 1    },
  { x: 130, y: -76,  z: -95,  rot: 27,  scale: 0.70, op: 1    },
  { x: 172, y: -100, z: -130, rot: 36,  scale: 0.60, op: 0.78 },
  { x: 200, y: -118, z: -160, rot: 43,  scale: 0.52, op: 0.55 },
]

function NetLogo({ network, textColor }) {
  if (network === 'mastercard') return (
    <div className="hc-mc">
      <div className="hc-mc-r" /><div className="hc-mc-y" />
    </div>
  )
  if (network === 'visa') return (
    <span className="hc-visa" style={{ color: textColor }}>VISA</span>
  )
  return (
    <span className="hc-rupay" style={{ color: textColor }}>
      Ru<span style={{ opacity: 0.7 }}>Pay</span>
    </span>
  )
}

function Chip({ chip }) {
  return (
    <div className="hc-chip" style={{ '--cb': chip.b, '--cm': chip.m, '--cd': chip.d }}>
      <div className="hc-chip-grid">
        {[...Array(6)].map((_, i) => <div key={i} className="cp" />)}
      </div>
      <div className="hc-chip-notch" />
    </div>
  )
}

function Card({ card, fanPos, isExiting }) {
  const f = FAN[fanPos]
  const isActive = fanPos === 0

  const transform = isExiting
    ? `translate(-50%,-50%) translateX(-240px) translateY(-110px) scale(0.58) rotateZ(-26deg)`
    : `translate(-50%,-50%)
       translateX(${f.x}px) translateY(${f.y}px) translateZ(${f.z}px)
       rotateZ(${f.rot}deg) scale(${f.scale})`

  return (
    <div
      className={`hc-card${isActive ? ' hc-card--active' : ''}${isExiting ? ' hc-card--exit' : ''}`}
      style={{ background: card.bg, transform, opacity: isExiting ? 0 : f.op, zIndex: isExiting ? 0 : 10 - fanPos }}
    >
      {/* Grain texture */}
      <div className="hc-grain" />
      {/* Top gloss */}
      <div className="hc-gloss" />
      {/* Metallic streak (per-card tinted) */}
      <div className="hc-metal" style={{ background: card.streak }} />

      {/* TOP ROW */}
      <div className="hc-top-row">
        <span className="hc-bank-name" style={{ color: card.textColor }}>{card.bank}</span>
        <span className="hc-badge" style={{ color: card.textColor, borderColor: card.textColor + '44' }}>
          {card.badge}
        </span>
      </div>

      {/* CHIP + NFC */}
      <div className="hc-chip-row">
        <Chip chip={card.chip} />
        <div className="hc-nfc">
          <div className="hc-nfc-a" /><div className="hc-nfc-a" /><div className="hc-nfc-a" />
        </div>
      </div>

      {/* CARD NUMBER — embossed */}
      <div className="hc-number" style={{ color: card.textColor }}>
        <span>••••</span><span>••••</span><span>••••</span>
        <span className="hc-last4">{card.masked}</span>
      </div>

      {/* BOTTOM ROW */}
      <div className="hc-bot-row">
        <div className="hc-fields">
          <div>
            <div className="hc-lbl">CARD HOLDER</div>
            <div className="hc-val" style={{ color: card.textColor }}>{card.holder}</div>
          </div>
          <div>
            <div className="hc-lbl">VALID THRU</div>
            <div className="hc-val hc-mono" style={{ color: card.textColor }}>{card.expiry}</div>
          </div>
        </div>
        <NetLogo network={card.network} textColor={card.textColor} />
      </div>

      {/* Type watermark */}
      <div className="hc-card-type" style={{ color: card.textColor + '44' }}>{card.type}</div>
      {/* Subtle edge line */}
      <div className="hc-edge" style={{ background: `linear-gradient(90deg,transparent,${card.textColor}33,transparent)` }} />
    </div>
  )
}

export default function HeroCards() {
  const [order, setOrder]     = useState(CARDS.map(c => c.id))
  const [exiting, setExiting] = useState(null)

  const advance = useCallback(() => {
    setOrder(prev => {
      const exitId = prev[0]
      setExiting(exitId)
      setTimeout(() => {
        setOrder(o => [...o.slice(1), exitId])
        setExiting(null)
      }, 450)
      return prev
    })
  }, [])

  useEffect(() => {
    const t = setInterval(advance, 1800)
    return () => clearInterval(t)
  }, [advance])

  return (
    <div className="hc-root">
      <div className="hc-scene">
        {[...order].reverse().map(id => (
          <Card
            key={id}
            card={CARDS.find(c => c.id === id)}
            fanPos={order.indexOf(id)}
            isExiting={id === exiting}
          />
        ))}
      </div>

      <div className="hc-bub hc-bub--tl">
        <span className="hc-bub-ico">💳</span>
        <div><div className="hc-bub-v">500+</div><div className="hc-bub-l">Active Offers</div></div>
      </div>
      <div className="hc-bub hc-bub--br">
        <span className="hc-bub-ico">✦</span>
        <div><div className="hc-bub-v">₹50L+</div><div className="hc-bub-l">Savings Unlocked</div></div>
      </div>
    </div>
  )
}
