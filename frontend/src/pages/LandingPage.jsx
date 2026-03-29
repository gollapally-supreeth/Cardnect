import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { CreditCard, Shield, Zap, Users, ArrowRight, CheckCircle, TrendingUp, Wallet, Bell, Star, Lock, ChevronRight, Fingerprint } from 'lucide-react'
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

/* ── Animated rotating benefit line ── */
const HERO_LINES = [
  'Earn passive income on your premium cards.',
  'Unlock exclusive card discounts, instantly.',
  'Card holders earn. Deal seekers save. Win-win.',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthContext()
  const handleCTA = () => navigate(isAuthenticated ? '/dashboard' : '/auth')

  return (
    <div className="landing-min">

      {/* ── NAV ── */}
      <nav className="nav-min">
        <div className="container nav-min-inner">
          <div className="brand-min">
            <CreditCard size={18} strokeWidth={1.5} />
            <span>CARDNECT</span>
          </div>
          <div className="nav-min-links">
            <a href="#for-holders">For Holders</a>
            <a href="#for-seekers">For Seekers</a>
            <a href="#how-it-works">Platform</a>
            <a href="#security">Security</a>
          </div>
          <div className="nav-min-actions">
            {isAuthenticated ? (
              <button className="btn-min-primary" onClick={() => navigate('/dashboard')}>
                Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <button className="btn-min-primary" onClick={() => navigate('/auth')}>
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-min">
        <video
          className="hero-video-bg"
          src={HeroVideo}
          autoPlay loop muted playsInline
          ref={el => { if (el) el.playbackRate = 0.75 }}
        />
        <div className="hero-video-overlay" />

        <div className="container hero-min-content hero-min-content--center">

          {/* Badge */}
          <div className="hero-min-badge">
            <span className="hero-min-dot" />
            India's First P2P Card-Discount Network
          </div>

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

          {/* Stats */}
          <div className="hero-min-stats">
            <div className="stat-min"><h4>₹50L+</h4><p>Offers Unlocked</p></div>
            <div className="stat-min-divider" />
            <div className="stat-min"><h4>2K+</h4><p>Verified Members</p></div>
            <div className="stat-min-divider" />
            <div className="stat-min"><h4>4.9★</h4><p>Trust Score</p></div>
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
            {DEMO_CARDS.map(card => (
              <div className="audience-card-wrap" key={card.id}>
                <PremiumCard {...card} />
                <div className="card-item-meta">
                  <span className="live-indicator" /> Active Now
                </div>
              </div>
            ))}
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

          {/* Decorative benefit tags */}
          <div className="audience-col seeker-visual">
            <div className="seeker-tags">
              {['20% off on Swiggy', 'Airport Lounge Access', '5% Fuel Cashback',
                'Hotel Upgrades', '10% off Myntra', '₹500 Zomato Credit'].map((tag, i) => (
                <div key={i} className={`seeker-tag seeker-tag--${i % 3}`}>{tag}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section-min">
        <div className="container">
          <div className="section-min-header">
            <h2>The Protocol</h2>
            <p>Three clean steps. Two sides. One win-win marketplace.</p>
          </div>
          <div className="steps-min-grid">
            {STEPS.map((step, i) => (
              <div key={i} className="step-min-card">
                <div className="step-min-num">{step.num}</div>
                <div className="step-min-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section id="security" className="section-min section-features-min section-dark">
        <div className="container">
          <div className="features-min-layout">
            <div className="features-min-text">
              <h2>Engineered for Trust</h2>
              <p>Cardnect operates on a zero-trust architecture. We bridge both sides without ever touching sensitive information.</p>
              <div className="features-min-list">
                {SECURITY.map((f, i) => (
                  <div key={i} className="feature-min-item">
                    <div className="feature-min-icon">{f.icon}</div>
                    <div className="feature-min-info">
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="features-min-cert">
              <div className="cert-glass">
                <div className="cert-header">
                  <Shield size={20} className="cert-icon" />
                  <span>Platform Architecture</span>
                </div>
                <div className="cert-items">
                  <div className="cert-item"><CheckCircle size={14} /> End-to-End Encrypted</div>
                  <div className="cert-item"><CheckCircle size={14} /> Email OTP Verification</div>
                  <div className="cert-item"><CheckCircle size={14} /> WebSocket Secured</div>
                  <div className="cert-item"><CheckCircle size={14} /> PCI-DSS Scope Zero</div>
                  <div className="cert-item"><CheckCircle size={14} /> No Card Data Storage</div>
                  <div className="cert-item"><CheckCircle size={14} /> In-App Consent Flow</div>
                </div>
              </div>
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
