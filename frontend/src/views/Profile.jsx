import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '../context/AuthContext'
import { CheckCircle, AlertCircle, Phone, Mail, Shield, CreditCard, Clock, Award, MessageCircle } from 'lucide-react'
import { fetchMyListings } from '../api/services'
import VerifyPhoneModal from '../components/VerifyPhoneModal'
import './Profile.css'

export default function Profile() {
  const { user } = useAuthContext()
  const emailVerified   = !!user?.emailVerified
  const isFullyVerified = emailVerified;

  const [showVerifyModal, setShowVerifyModal] = useState(false)

  const { data: listings = [] } = useQuery({ queryKey: ['my-listings'], queryFn: fetchMyListings })

  const initials = (user?.name || user?.email || 'U')?.[0]?.toUpperCase() || 'U'
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month:'long', year:'numeric' })
    : '—'

  return (
    <div className="prof-page">
      {/* Hero section */}
      <div className="prof-hero">
        <div className="prof-avatar-wrap">
          <div className="prof-avatar">{initials}</div>
          <div className={`prof-avatar-ring ${isFullyVerified ? 'ok' : 'warn'}`} />
        </div>

        <div className="prof-hero-info">
          <h1 className="prof-name">{user?.name || 'User'}</h1>
          <p className="prof-email">{user?.email}</p>
          <div className={`prof-verif-badge ${isFullyVerified ? 'ok' : 'warn'}`}>
            {isFullyVerified
              ? <><CheckCircle size={13} /> Verified User</>
              : <><AlertCircle size={13} /> Verification Pending</>}
          </div>
        </div>

        {/* Quick stats */}
        <div className="prof-quick-stats">
          <div className="prof-qs-item">
            <CreditCard size={16} />
            <span className="prof-qs-num">{listings.length}</span>
            <span className="prof-qs-lbl">Listings</span>
          </div>
          <div className="prof-qs-sep" />
          <div className="prof-qs-item">
            <Award size={16} />
            <span className="prof-qs-num">{listings.filter(l=>l.active).length}</span>
            <span className="prof-qs-lbl">Active</span>
          </div>
          <div className="prof-qs-sep" />
          <div className="prof-qs-item">
            <Clock size={16} />
            <span className="prof-qs-num">—</span>
            <span className="prof-qs-lbl">Requests</span>
          </div>
        </div>
      </div>

      <div className="prof-grid">
        {/* Personal info */}
        <div className="prof-section">
          <div className="prof-section-title"><Shield size={15} /> Personal Info</div>
          <div className="prof-rows">
            <div className="prof-row">
              <span className="prof-row-lbl">Display Name</span>
              <span className="prof-row-val">{user?.name || '—'}</span>
            </div>
            <div className="prof-row">
              <span className="prof-row-lbl">User ID</span>
              <span className="prof-row-val prof-mono" style={{ fontSize:11 }}>{user?.id || '—'}</span>
            </div>
            <div className="prof-row">
              <span className="prof-row-lbl">Member Since</span>
              <span className="prof-row-val">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="prof-section">
          <div className="prof-section-title"><Shield size={15} /> Verification Status</div>
          <div className="prof-rows">


            {/* Email */}
            <div className="prof-verif-row">
              <div className={`prof-verif-icon ${emailVerified ? 'ok' : 'warn'}`}>
                <Mail size={15} />
              </div>
              <div className="prof-verif-body">
                <p className="prof-verif-label">Email Address</p>
                <p className="prof-verif-val">{user?.email || 'Not added'}</p>
              </div>
              <span className={`prof-badge ${emailVerified ? 'ok' : 'warn'}`}>
                {emailVerified ? <><CheckCircle size={11} /> Verified</> : <><AlertCircle size={11} /> Unverified</>}
              </span>
            </div>
          </div>

          {!isFullyVerified && (
            <div className="alert alert-warning" style={{ marginTop:14, fontSize:12 }}>
              Please verify your email to unlock all platform features.
            </div>
          )}
        </div>
      </div>

      {/* Security notice */}
      <div className="prof-security-note">
        <Shield size={15} />
        <p>
          <strong>Security:</strong> Cardnect never stores full card numbers, CVV codes, expiry dates, or OTP codes.
          All card data on this platform is masked. Transactions occur outside the platform.
        </p>
      </div>

      <VerifyPhoneModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        userPhone={user?.phone || ''}
        onVerified={() => setShowVerifyModal(false)}
      />
    </div>
  )
}
