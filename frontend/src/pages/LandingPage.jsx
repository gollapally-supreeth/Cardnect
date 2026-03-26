import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { CreditCard, Shield, Zap, Users, ArrowRight, CheckCircle, Bell, ChevronRight, Fingerprint } from 'lucide-react'
import HeroVideo from '../assets/Hero.mp4'
import PremiumCard from '../components/PremiumCard'
import './LandingPage.css'

const DEMO_CARDS = [
  { id: 1, bankName: 'HDFC Bank', cardName: 'Infinia Metal', cardType: 'Credit', cardNetwork: 'Visa', maskedNumber: 'XXXX XXXX XXXX 4821', holderName: 'VERIFIED HOLDER' },
  { id: 2, bankName: 'ICICI Bank', cardName: 'Emeralde', cardType: 'Credit', cardNetwork: 'Mastercard', maskedNumber: 'XXXX XXXX XXXX 7543', holderName: 'VERIFIED HOLDER' },
  { id: 3, bankName: 'SBI Bank', cardName: 'Aurum', cardType: 'Credit', cardNetwork: 'RuPay', maskedNumber: 'XXXX XXXX XXXX 2290', holderName: 'VERIFIED HOLDER' },
]

const STEPS = [
  { num: '01', title: 'Discover', desc: 'Explore premium cards shared by verified holders for exclusive discounts.' },
  { num: '02', title: 'Request', desc: 'Send a secure request detailing the exact offer you wish to unlock.' },
  { num: '03', title: 'Connect', desc: 'Match instantly and finalize the transaction safely off-platform.' }
]

const FEATURES = [
  { icon: <Fingerprint size={28} strokeWidth={1} />, title: 'Zero Data Exposure', desc: 'No sensitive card numbers or CVVs are ever stored or transmitted in our ecosystem.' },
  { icon: <Zap size={28} strokeWidth={1} />, title: 'Real-time Pulse', desc: 'Advanced WebSocket infrastructure perfectly synchronizes deal seekers with card holders instantly.' },
  { icon: <Shield size={28} strokeWidth={1} />, title: 'Verified Identity', desc: 'Strict multi-factor authentication ensures every participant belongs to a trusted community.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthContext()

  const handleCTA = () => navigate(isAuthenticated ? '/dashboard' : '/auth')

  return (
    <div className="landing-min">
      {/* MINIMAL NAV */}
      <nav className="nav-min">
        <div className="container nav-min-inner">
          <div className="brand-min">
            <CreditCard size={18} strokeWidth={1.5} />
            <span>CARDNECT</span>
          </div>
          <div className="nav-min-links">
            <a href="#offers">Offers</a>
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

      {/* HERO SECTION */}
      <section className="hero-min">
        <div className="hero-min-glow"></div>
        <div className="container hero-min-content">
          <div className="hero-min-text">
            <div className="hero-min-badge">
              <span className="hero-min-dot" /> TRUSTED NETWORK
            </div>
            
            <h1 className="hero-min-title">
              Unlock <span>Premium</span><br />
              Card Rewards<br />
              Instantly.
            </h1>
            
            <p className="hero-min-sub">
              A frictionless protocol to connect deal seekers with verified card holders. Secure, minimal, and entirely peer-to-peer.
            </p>
            
            <div className="hero-min-actions">
              <button className="btn-min-solid" onClick={handleCTA}>
                Enter App <ArrowRight size={16} />
              </button>
              <a href="#how-it-works" className="btn-min-outline">
                How it works
              </a>
            </div>

            <div className="hero-min-stats">
              <div className="stat-min">
                <h4>₹50L+</h4>
                <p>Volume</p>
              </div>
              <div className="stat-min-divider"></div>
              <div className="stat-min">
                <h4>2K+</h4>
                <p>Verified</p>
              </div>
            </div>
          </div>

          <div className="hero-min-visual">
            <div className="video-min-wrapper">
              <video 
                className="hero-video-element" 
                src={HeroVideo} 
                autoPlay 
                loop 
                muted 
                playsInline
              />
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM CARDS SHOWCASE */}
      <section id="offers" className="section-min section-cards">
        <div className="container">
          <div className="section-min-header">
            <h2>Live Network</h2>
            <p>Real-time access to top-tier banking card discounts globally.</p>
          </div>
          
          <div className="premium-cards-grid">
            {DEMO_CARDS.map(card => (
              <div className="premium-card-item" key={card.id}>
                <PremiumCard {...card} />
                <div className="card-item-meta">
                  <span className="live-indicator"></span> Active Now
                </div>
              </div>
            ))}
          </div>

          <div className="center-action">
            <button className="btn-min-outline" onClick={handleCTA}>
              View All Cards
            </button>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="how-it-works" className="section-min section-dark">
        <div className="container">
          <div className="section-min-header">
            <h2>The Protocol</h2>
            <p>Three steps to infinite savings without the friction.</p>
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

      {/* FEATURES / SECURITY */}
      <section id="security" className="section-min section-features-min">
        <div className="container">
          <div className="features-min-layout">
            <div className="features-min-text">
              <h2>Engineered for Trust</h2>
              <p>Cardnect operates on a zero-trust architecture. We bridge the gap without ever touching your sensitive information.</p>
              
              <div className="features-min-list">
                {FEATURES.map((f, i) => (
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
                  <span>Architecture</span>
                </div>
                <div className="cert-items">
                  <div className="cert-item"><CheckCircle size={14} /> End-to-End Encrypted</div>
                  <div className="cert-item"><CheckCircle size={14} /> OTP Verification</div>
                  <div className="cert-item"><CheckCircle size={14} /> WebSocket Secured</div>
                  <div className="cert-item"><CheckCircle size={14} /> PCI-DSS Scope Zero</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-min section-cta-min">
        <div className="container">
          <div className="cta-min-box">
            <h2>Experience the Network.</h2>
            <p>Join the elusive club of deal seekers and premium cardholders today.</p>
            <button className="btn-min-solid btn-min-lg" onClick={handleCTA}>
              Ignite Access <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
