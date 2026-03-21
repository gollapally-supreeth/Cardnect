import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { CreditCard, Shield, Zap, Users, ArrowRight, Star, CheckCircle, Bell, ChevronRight } from 'lucide-react'
import HeroCarousel from '../components/HeroCarousel'
import './LandingPage.css'

const DEMO_CARDS = [
  { id: 1, bank: 'HDFC Bank', type: 'Credit', network: 'Visa', masked: 'XXXX XXXX XXXX 4821', commission: 2.5, rating: 4.9 },
  { id: 2, bank: 'ICICI Bank', type: 'Debit', network: 'Mastercard', masked: 'XXXX XXXX XXXX 7543', commission: 1.5, rating: 4.7 },
  { id: 3, bank: 'SBI Bank', type: 'Credit', network: 'RuPay', masked: 'XXXX XXXX XXXX 2290', commission: 3.0, rating: 5.0 },
]

const STEPS = [
  { icon: <Users size={24} />, title: 'Browse Offers', desc: 'Explore card holders who share their eligible bank cards for exclusive discounts.' },
  { icon: <CreditCard size={24} />, title: 'Request a Card', desc: 'Send a request to a card holder with the offer details you need help with.' },
  { icon: <Bell size={24} />, title: 'Get Connected', desc: 'Card holder receives a notification and reaches out to you directly via WhatsApp.' },
  { icon: <CheckCircle size={24} />, title: 'Save & Enjoy', desc: 'Complete your purchase using the discount. Pay a small commission to the card holder.' },
]

const FEATURES = [
  { icon: <Shield size={20} />, title: 'Zero Sensitive Data', desc: 'We never store card numbers, CVV, or expiry. Only masked identifiers.' },
  { icon: <Zap size={20} />, title: 'Instant Notifications', desc: 'Real-time WebSocket alerts so card holders never miss a request.' },
  { icon: <Users size={20} />, title: 'Verified Users Only', desc: 'Phone OTP + email verification ensures every user is trustworthy.' },
]

function CardDemo({ card }) {
  return (
    <div className="demo-card animate-fade-in">
      <div className="demo-card-header">
        <div>
          <p className="demo-card-bank">{card.bank}</p>
          <p className="demo-card-sub">{card.type} · {card.network}</p>
        </div>
        <div className="demo-card-rating">
          <Star size={13} fill="currentColor" />
          <span>{card.rating}</span>
        </div>
      </div>
      <div className="demo-card-number">{card.masked}</div>
      <div className="demo-card-footer">
        <div className="badge badge-primary">{card.commission}% commission</div>
        <span className="demo-card-active">● Active</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthContext()

  const handleCTA = () => navigate(isAuthenticated ? '/dashboard' : '/auth')

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <span className="notification-dot" style={{ position: 'absolute', top: -2, right: -2 }}></span>
              <CreditCard size={18} />
            </div>
            <span>Cardnect</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">Docs</a>
            <a href="#offers" className="nav-link">Pricing</a>
          </div>
          <div className="landing-nav-actions">
            {isAuthenticated ? (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>
                Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/auth')}>Log in</button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>Get Started <ArrowRight size={14} /></button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        {/* Background grid */}
        <div className="hero-grid-bg" />
        {/* Radial glow */}
        <div className="hero-radial" />

        <div className="container hero-content">
          {/* ── LEFT: Copy ── */}
          <div className="hero-text">
            {/* Trust badge */}
            <div className="hero-trust-badge">
              <span className="hero-trust-dot" />
              <span>Trusted by 2,000+ verified users</span>
            </div>

            <h1 className="hero-title">
              Connect <em>Card</em><br />
              Rewards without<br />
              <span className="hero-title-line3">friction</span>
            </h1>

            <p className="hero-sub">
              The most direct way to deliver transactional rewards that users want. Tap 
              into curated card perks with verified users and zero card exposure at scale.
            </p>

            {/* CTA row */}
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={handleCTA}>
                Get started <ArrowRight size={16} />
              </button>
              <a href="#how-it-works" className="btn-hero-ghost">
                Documentation →
              </a>
            </div>

            {/* Stats strip */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-num">500+</span>
                <span className="hero-stat-label">Active Card Listings</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">2,000+</span>
                <span className="hero-stat-label">Verified Users</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">₹50L+</span>
                <span className="hero-stat-label">Discounts Shared</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: 3-D Rotating Card Ring ── */}
          <div className="hero-visual hero-visual--carousel">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* DEMO CARDS */}
      <section id="offers" className="section-offers">
        <div className="container">
          <div className="section-header">
            <div className="badge-ghost" style={{ marginBottom: 12 }}>● LIVE <span style={{ opacity: 0.8 }}>v2.0.0</span></div>
            <h2>Live Card Offers</h2>
            <p>Browse real card listings from verified holders</p>
          </div>
          <div className="demo-cards-grid">
            {DEMO_CARDS.map(card => <CardDemo key={card.id} card={card} />)}
          </div>
          <div className="text-center" style={{ marginTop: '32px' }}>
            <button className="btn btn-secondary" onClick={handleCTA}>
              View All Offers <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ADVANCED PROJECT FLOW */}
      <section id="how-it-works" className="section-steps">
        <div className="container">
          <div className="section-header">
            <div className="label-mono" style={{ color: 'var(--color-accent)', marginBottom: 10 }}>// flow</div>
            <h2>Frictionless Connection Flow</h2>
            <p>A completely restructured approach to sharing bank discounts securely and instantly.</p>
          </div>
          
          <div className="project-flow-container">
            <div className="flow-line" />
            {STEPS.map((step, i) => (
              <div key={i} className={`flow-node ${i % 2 === 0 ? 'flow-left' : 'flow-right'}`}>
                <div className="flow-content card-glass animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="flow-number">0{i + 1}</div>
                  <div className="flow-icon-wrapper">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
                <div className="flow-point">
                  <div className="flow-point-inner" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section-features">
        <div className="container section-features-inner">
          <div className="section-features-text">
            <div className="badge-ghost" style={{ marginBottom: '16px' }}>NEW</div>
            <h2>Security First,<br />Always</h2>
            <p>Cardnect is designed to connect people without ever compromising security. No card numbers, no CVVs — ever.</p>
            <ul className="features-list">
              {FEATURES.map((f, i) => (
                <li key={i} className="feature-item">
                  <div className="feature-icon">{f.icon}</div>
                  <div>
                    <strong>{f.title}</strong>
                    <p>{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="section-features-visual">
            <div className="security-card card-glass">
              <div className="security-card-header">
                <Shield size={24} color="var(--color-success)" />
                <span>Security Certificate</span>
              </div>
              <div className="divider" />
              <div className="security-item"><CheckCircle size={16} color="var(--color-success)" /> Phone OTP Verified</div>
              <div className="security-item"><CheckCircle size={16} color="var(--color-success)" /> Email Verified</div>
              <div className="security-item"><CheckCircle size={16} color="var(--color-success)" /> No Card Data Stored</div>
              <div className="security-item"><CheckCircle size={16} color="var(--color-success)" /> Rate Limited APIs</div>
              <div className="security-item"><CheckCircle size={16} color="var(--color-success)" /> Input Validation</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="section-cta">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-bg-blob" />
            <h2>Ready to Start Saving?</h2>
            <p>Join thousands of verified users already using Cardnect to unlock exclusive bank discounts.</p>
            <button className="btn btn-primary btn-lg" onClick={handleCTA}>
              Create Free Account <ArrowRight size={18} />
            </button>
            <p className="cta-disclaimer">
              ⚠️ Disclaimer: This platform only connects users and card holders. All transactions occur outside the platform. Cardnect is not responsible for any transactions.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon" style={{ position: 'relative' }}>
              <CreditCard size={16} />
            </div>
            <span>Cardnect</span>
          </div>
          <p className="footer-text">© 2026 Cardnect. Connecting card holders and deal seekers.</p>
        </div>
      </footer>
    </div>
  )
}
