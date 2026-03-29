import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { CheckCircle, AlertCircle, Phone, Lock, Zap, ChevronRight } from 'lucide-react'
import VerifyPhoneModal from '../components/VerifyPhoneModal'
import ChangePasswordModal from '../components/ChangePasswordModal'
import Silk from '../components/Silk'
import './Profile.css'

const formatCardId = (id) => {
  if (!id) return '0000 0000 0000 0000'
  const clean = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().padEnd(16, 'X')
  return `${clean.substring(0,4)} ${clean.substring(4,8)} ${clean.substring(8,12)} ${clean.substring(12,16)}`
}

export default function Profile() {
  const { user } = useAuthContext()
  const emailVerified   = !!user?.emailVerified
  const phoneVerified   = !!user?.phoneVerified
  const isFullyVerified = emailVerified && phoneVerified;

  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showPwdModal, setShowPwdModal]       = useState(false)
  const [isFlipped, setIsFlipped]             = useState(false)

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month:'2-digit', year:'2-digit' })
    : '12/24'

  return (
    <div className="prof-page-vmax">
      <div className="vmax-ambient-glow" />

      <div className="vmax-scene">
        <div className={`vmax-card ${isFlipped ? 'flipped' : ''}`}>
          
          {/* ════ FRONT OF CARD ════ */}
          <div className="vmax-face vmax-front" style={{ pointerEvents: isFlipped ? 'none' : 'auto' }}>
            <div className="vmax-glare" />

            {/* Custom R3F Silk Background */}
            <div className="vmax-silk-bg">
              <Silk
                speed={4.5} // Increased speed
                scale={1.2}
                color="#ffffff"
                noiseIntensity={1.3} // Slightly more intense ripples
                rotation={15}
              />
            </div>
            
            {/* Advanced Geometry Background */}
            <div className="vmax-geo">
              <div className="vmax-circle c1" />
              <div className="vmax-circle c2" />
            </div>

            <div className="vmax-inner">
              <div className="vmax-header">
                <div className="vmax-brand">
                  <div className="vmax-logo-dots">
                    <span className="dot d1"/>
                    <span className="dot d2"/>
                  </div>
                  CARDNECT
                </div>
                <Zap size={20} className="vmax-icon-contactless" />
              </div>

              <div className="vmax-chip">
                <div className="vmax-chip-lines" />
              </div>

              <div className="vmax-number-group">
                <span className="vmax-number-label">UID / SYSTEM IDENTIFICATION</span>
                <div className="vmax-number">{formatCardId(user?.id)}</div>
              </div>

              <div className="vmax-meta">
                <div className="vmax-label-group">
                  <span>VALID<br/>THRU</span>
                  <strong>{memberSince}</strong>
                </div>
              </div>

              <div className="vmax-footer">
                <div className="vmax-name">{user?.name || 'MEMBER ACCOUNT'}</div>
                <div className={`vmax-hologram ${isFullyVerified ? 'is-verified' : ''}`}>
                  {isFullyVerified ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                </div>
              </div>
            </div>

            <button 
              className="vmax-btn-flip to-back" 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
            >
              Security Center <ChevronRight size={14} />
            </button>
          </div>

          {/* ════ BACK OF CARD ════ */}
          <div className="vmax-face vmax-back" style={{ pointerEvents: isFlipped ? 'auto' : 'none' }}>
            <div className="vmax-glare" />

            {/* Custom R3F Silk Background for Back Face */}
            <div className="vmax-silk-bg">
              <Silk
                speed={4.5} 
                scale={1.2}
                color="#ffffff"
                noiseIntensity={1.3} 
                rotation={45}
              />
            </div>

            {/* Magstripe at the top */}
            <div className="vmax-magstripe" />
            
            <div className="vmax-back-inner">
              
              {/* Signature Panel with proper email handling */}
              <div className="vmax-signature-wrap">
                <span className="sig-label">AUTHORIZED CREDENTIAL <span className="sig-arrow">►</span></span>
                <div className="vmax-signature">
                  <div className="sig-value" title={user?.email}>{user?.email || '—'}</div>
                  {emailVerified && <div className="sig-badge">✓ Verified</div>}
                </div>
              </div>

              {/* Action Center - Refined Minimal Buttons */}
              <div className="vmax-actions">
                <div className="vmax-action-row">
                  <div className="vmax-action-info">
                    <Phone size={14} className="action-icon" /> 
                    <span className="action-text">{user?.phone || 'No phone linked'}</span>
                  </div>
                  {phoneVerified ? (
                    <span className="vmax-status ok">Secured</span>
                  ) : (
                    <button className="vmax-action-btn" onClick={(e) => {
                      e.stopPropagation();
                      setShowVerifyModal(true);
                    }}>Verify Now</button>
                  )}
                </div>

                <div className="vmax-action-row">
                  <div className="vmax-action-info">
                    <Lock size={14} className="action-icon" /> 
                    <span className="action-text">Account Password</span>
                  </div>
                  <button className="vmax-action-btn" onClick={(e) => {
                    e.stopPropagation();
                    setShowPwdModal(true);
                  }}>Change</button>
                </div>
              </div>

              <div className="vmax-disclaimer">
                <strong>GLOBAL IDENTIFICATION PROTOCOL</strong><br/>
                This physical asset proxy is cryptographically secured via zero-knowledge architecture. Authorized personnel only. If found, return to issuing authority immediately.
              </div>

            </div>

            <button 
              className="vmax-btn-flip to-front" 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
            >
              <ChevronRight size={14} style={{transform: 'rotate(180deg)'}} /> Front
            </button>
          </div>

        </div>
      </div>

      <VerifyPhoneModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        userPhone={user?.phone || ''}
        onVerified={() => setShowVerifyModal(false)}
      />

      <ChangePasswordModal
        isOpen={showPwdModal}
        onClose={() => setShowPwdModal(false)}
        userEmail={user?.email}
      />
    </div>
  )
}
