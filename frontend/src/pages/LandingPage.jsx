import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { CreditCard, Shield, Zap, ArrowRight, TrendingUp, Wallet, Star, Lock, Fingerprint } from 'lucide-react'
import HeroVideo from '../assets/Hero.mp4'
import PremiumCard from '../components/PremiumCard'
import ShinyText from '../components/ShinyText'
import './LandingPage.css'

const DEMO_CARDS = [
  { id: 1, bankName: 'HDFC Bank',  cardName: 'Infinia Metal', cardType: 'Credit', cardNetwork: 'Visa',       maskedNumber: 'XXXX XXXX XXXX 4821', holderName: 'VERIFIED HOLDER' },
  { id: 2, bankName: 'ICICI Bank', cardName: 'Emeralde',      cardType: 'Credit', cardNetwork: 'Mastercard', maskedNumber: 'XXXX XXXX XXXX 7543', holderName: 'VERIFIED HOLDER' },
  { id: 3, bankName: 'SBI Bank',   cardName: 'Aurum',         cardType: 'Credit', cardNetwork: 'RuPay',      maskedNumber: 'XXXX XXXX XXXX 2290', holderName: 'VERIFIED HOLDER' },
]

/* ── Dual-audience benefit data ── */
const HOLDER_BENEFITS = [
  { icon: <TrendingUp size={18} strokeWidth={1.5} />, text: 'Earn passive commission on every approved request' },
  { icon: <Shield     size={18} strokeWidth={1.5} />, text: 'Your card details are never shared or stored' },
  { icon: <Star       size={18} strokeWidth={1.5} />, text: 'You control which requests to accept or decline' },
]

const SEEKER_BENEFITS = [
  { icon: <Wallet size={18} strokeWidth={1.5} />, text: 'Access exclusive discounts on dining, travel & shopping' },
  { icon: <Zap    size={18} strokeWidth={1.5} />, text: 'Get matched with verified card holders in seconds' },
  { icon: <Lock   size={18} strokeWidth={1.5} />, text: 'Secure, peer-to-peer — no middleman fees' },
]

const STEPS = [
  { num: '01', title: 'List or Browse',  desc: 'Card holders list their cards with commission rates. Deal seekers browse real offers filtered by bank, network, and cashback.' },
  { num: '02', title: 'Request Access',  desc: 'Seekers send a secure in-app request describing the exact offer. Holders review and respond with full control.' },
  { num: '03', title: 'Connect & Save',  desc: 'Once accepted, contact details are exchanged. The deal is finalised privately — Cardnect never touches your transaction.' },
]

const SECURITY = [
  { icon: <Fingerprint size={28} strokeWidth={1} />, title: 'Zero Data Exposure',    desc: 'No card numbers, CVVs, or banking credentials are ever stored or transmitted.' },
  { icon: <Zap         size={28} strokeWidth={1} />, title: 'Real-time Pulse',       desc: 'WebSocket infrastructure syncs holders and seekers instantly — no polling, no delay.' },
  { icon: <Shield      size={28} strokeWidth={1} />, title: 'Verified Identity',     desc: 'Email-verified accounts and multi-factor authentication for every participant.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthContext()
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = navigator.connection?.saveData === true
    setShouldRenderVideo(!reduceMotion && !saveData)
  }, [])

  const handleCTA = () => navigate(isAuthenticated ? '/dashboard' : '/auth')

  return (
    <div className="landing-min">

      {/* ── HERO ── */}
      <section className="hero-min">
        {shouldRenderVideo ? (
          <video
            className="hero-video-bg"
            src={HeroVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            ref={el => { if (el) el.playbackRate = 0.75 }}
          />
        ) : (
          <div className="hero-static-bg" aria-hidden="true" />
        )}
        <div className="hero-video-overlay" />

        <div className="container hero-min-content hero-min-content--center">
          {/* Brand title */}
          <ShinyText text="CARDNECT" speed={3.5} className="hero-shiny-title" />

          {/* Tagline */}
          <h1 className="hero-min-title">
            Your Card Earns.<br />
            Their Savings <span>Unlock.</span>
          </h1>

          {/* Dual benefit pills */}
          <div className="hero-dual-pills">
            <div className="hero-pill hero-pill--holder">
              <TrendingUp size={14} />
              Card Holder? <strong>Earn commissions.</strong>
            </div>
            <div className="hero-pill-divider">×</div>
            <div className="hero-pill hero-pill--seeker">
              <Wallet size={14} />
              Deal Seeker? <strong>Access discounts.</strong>
            </div>
          </div>

          <p className="hero-min-sub">
            Cardnect is a peer-to-peer marketplace where premium card holders
            monetise their cards' benefits, and deal seekers access exclusive
            offers they'd never qualify for on their own.
          </p>

          {/* CTAs */}
          <div className="hero-min-actions">
            <button className="btn-min-solid" onClick={handleCTA}>
              Join the Network <ArrowRight size={16} />
            </button>
            <a href="#how-it-works" className="btn-min-outline">
              See how it works
            </a>
          </div>


        </div>
      </section>

      {/* ── FOR CARD HOLDERS ── */}
      <section id="for-holders" className="section-min section-audience">
        <div className="container audience-grid">
          <div className="audience-col">
            <div className="audience-label audience-label--holder">
              <CreditCard size={14} /> For Card Holders
            </div>
            <h2 className="audience-heading">
              Your premium card is an<br />
              <span className="audience-accent">untapped income stream.</span>
            </h2>
            <p className="audience-desc">
              You already pay annual fees on your Infinia, Emeralde, or Aurum card.
              List it on Cardnect and earn a commission every time a verified deal
              seeker uses your benefits — without ever sharing your card details.
            </p>
            <ul className="audience-benefits">
              {HOLDER_BENEFITS.map((b, i) => (
                <li key={i} className="audience-benefit-item">
                  <span className="audience-benefit-icon">{b.icon}</span>
                  {b.text}
                </li>
              ))}
            </ul>
            <button className="btn-min-solid" onClick={handleCTA}>
              List My Card <ArrowRight size={15} />
            </button>
          </div>

          <div className="audience-col audience-cards-preview">
            <div className="audience-card-wrap">
              <PremiumCard {...DEMO_CARDS[0]} />
              <div className="card-item-meta">
                <span className="live-indicator" /> Active Now
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR DEAL SEEKERS ── */}
      <section id="for-seekers" className="section-min section-dark section-audience">
        <div className="container audience-grid audience-grid--reverse">
          <div className="audience-col">
            <div className="audience-label audience-label--seeker">
              <Wallet size={14} /> For Deal Seekers
            </div>
            <h2 className="audience-heading">
              Access discounts you<br />
              <span className="audience-accent">never had a card for.</span>
            </h2>
            <p className="audience-desc">
              Premium bank offers — 20% off on Swiggy, airport lounge access,
              fuel surcharge waivers — are locked behind elite cards you may not own.
              Cardnect bridges that gap by connecting you with verified holders
              who are happy to share, for a small fee.
            </p>
            <ul className="audience-benefits">
              {SEEKER_BENEFITS.map((b, i) => (
                <li key={i} className="audience-benefit-item">
                  <span className="audience-benefit-icon">{b.icon}</span>
                  {b.text}
                </li>
              ))}
            </ul>
            <button className="btn-min-solid" onClick={handleCTA}>
              Browse Offers <ArrowRight size={15} />
            </button>
          </div>

          {/* Offer Cards Grid */}
          <div className="audience-col seeker-visual">
            <div className="offer-cards-grid">
              {[
                { icon: '🛒', text: '10% Cashback on Amazon' },
                { icon: '📦', text: '15% off Flipkart Fashion' },
                { icon: '⚡', text: 'Amazon Prime Access' },
                { icon: '🎁', text: 'Extra Rewards Points' },
                { icon: '🛍️', text: '20% Flipkart Offers' },
                { icon: '💳', text: 'Special Payment Discounts' }
              ].map((offer, i) => (
                <div key={i} className="offer-card">
                  <div className="offer-icon">{offer.icon}</div>
                  <div className="offer-text">{offer.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section-min section-flow">
        <div className="container">
          <div className="section-min-header flow-header">
            <h2>The Cardnect Flow</h2>
            <p>A sophisticated peer-to-peer system that connects card holders and deal seekers seamlessly.</p>
          </div>
          
          {/* Minimal Flow Diagram */}
          <div className="flow-diagram-minimal">
            
            {/* Actors Row */}
            <div className="minimal-actors-row">
              <div className="minimal-actor">
                <div className="actor-symbol seeker-symbol">○</div>
                <div className="actor-label">Deal Seeker</div>
                <div className="actor-desc">Browse & Discover exclusive offers from verified card holders</div>
              </div>
              <div className="minimal-arrow">→</div>
              <div className="minimal-actor center">
                <div className="actor-symbol center-symbol">◆</div>
                <div className="actor-label">Cardnect</div>
                <div className="actor-desc-center">Secure P2P Network connecting both parties</div>
              </div>
              <div className="minimal-arrow">→</div>
              <div className="minimal-actor">
                <div className="actor-symbol holder-symbol">■</div>
                <div className="actor-label">Card Holder</div>
                <div className="actor-desc">Review requests & earn commission from verified members</div>
              </div>
            </div>

            {/* Steps Row with Descriptions */}
            <div className="minimal-steps-container">
              <div className="minimal-steps-row">
                {[
                  { symbol: '🔍', title: 'Search', num: '1', desc: 'Browse verified card offers' },
                  { symbol: '📝', title: 'Request', num: '2', desc: 'Send interested inquiry' },
                  { symbol: '✓', title: 'Approve', num: '3', desc: 'Get holder approval' },
                  { symbol: '↔', title: 'Connect', num: '4', desc: 'Chat & coordinate' },
                  { symbol: '✨', title: 'Complete', num: '5', desc: 'Transaction finalized' }
                ].map((step, i) => (
                  <div key={i} className="minimal-step">
                    <div className="step-number">{step.num}</div>
                    <div className="step-label">{step.title}</div>
                    <div className="step-description">{step.desc}</div>
                  </div>
                ))}
              </div>
              <div className="steps-flow-line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section id="security" className="section-min section-trust-min section-dark">
        <div className="container">
          <div className="trust-layout">
            <div className="trust-text-col">
              <h2>Built on Trust</h2>
              <p>No card numbers. No CVVs. No data breaches. We connect people directly — never holding your sensitive information.</p>
              <div className="trust-highlights">
                <div className="trust-highlight-item">
                  <span className="highlight-symbol">✓</span>
                  <span>End-to-end encryption on all communications</span>
                </div>
                <div className="trust-highlight-item">
                  <span className="highlight-symbol">✓</span>
                  <span>Zero-knowledge architecture — we can't access your data</span>
                </div>
                <div className="trust-highlight-item">
                  <span className="highlight-symbol">✓</span>
                  <span>Independent security audits performed quarterly</span>
                </div>
              </div>
            </div>
            <div className="trust-cards-grid">
              {SECURITY.map((f, i) => (
                <div key={i} className="trust-card-clean">
                  <div className="trust-card-icon-wrapper">
                    <div className="trust-card-icon">{f.icon}</div>
                  </div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-min section-cta-min">
        <div className="container">
          <div className="cta-min-box">
            <div className="cta-dual">
              <div className="cta-side">
                <p className="cta-side-label">Card Holder?</p>
                <h3>Start Earning Today</h3>
                <p className="cta-side-sub">List your card in 60 seconds and earn on every approved request.</p>
              </div>
              <div className="cta-divider-v" />
              <div className="cta-side">
                <p className="cta-side-label">Deal Seeker?</p>
                <h3>Browse Live Offers</h3>
                <p className="cta-side-sub">Find verified cards with the exact discount you need, right now.</p>
              </div>
            </div>
            <button className="btn-min-solid btn-min-lg" onClick={handleCTA}>
              Join Cardnect — It's Free <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-min">
        <div className="container footer-min-inner">
          <div className="brand-min">
            <CreditCard size={16} strokeWidth={1.5} />
            <span>CARDNECT</span>
          </div>
          <div className="footer-min-copy">
            © 2026 Cardnect Protocol. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
