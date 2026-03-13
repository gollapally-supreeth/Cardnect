import { useUser } from '@clerk/react'
import { CheckCircle, AlertCircle, Phone, Mail, Shield, User } from 'lucide-react'
import './Profile.css'

export default function Profile() {
  const { user } = useUser()

  const phone = user?.phoneNumbers?.[0]
  const email = user?.emailAddresses?.[0]
  const phoneVerified = phone?.verification?.status === 'verified'
  const emailVerified = email?.verification?.status === 'verified'
  const isFullyVerified = phoneVerified && emailVerified

  return (
    <div className="profile-page">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account and verification status</p>
      </div>

      {/* Verification Summary Card */}
      <div className={`verif-banner ${isFullyVerified ? 'verified' : 'unverified'}`}>
        <div className="verif-banner-icon">
          {isFullyVerified ? <Shield size={28} /> : <AlertCircle size={28} />}
        </div>
        <div>
          <h3>{isFullyVerified ? 'Account Fully Verified' : 'Verification Incomplete'}</h3>
          <p>{isFullyVerified
            ? 'You have full access to all Cardnect features, including sending card requests.'
            : 'Complete phone and email verification to unlock all features.'
          }</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-grid">
        <div className="card">
          <div className="card-title"><User size={16} />Personal Info</div>
          <div className="divider" />
          <div className="profile-info-row">
            <span className="profile-info-label">Full Name</span>
            <span className="profile-info-value">{user?.fullName || '—'}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Clerk User ID</span>
            <span className="profile-info-value monospace" style={{ fontSize: 11 }}>{user?.id}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Member Since</span>
            <span className="profile-info-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><Shield size={16} />Verification Status</div>
          <div className="divider" />

          {/* Phone */}
          <div className="verif-item">
            <div className="verif-item-left">
              <div className={`verif-icon ${phoneVerified ? 'ok' : 'warn'}`}>
                <Phone size={16} />
              </div>
              <div>
                <p className="verif-item-label">Phone Number</p>
                <p className="verif-item-value">{phone?.phoneNumber || 'Not added'}</p>
              </div>
            </div>
            {phoneVerified
              ? <span className="badge badge-success"><CheckCircle size={12} /> Verified</span>
              : <span className="badge badge-warning"><AlertCircle size={12} /> Not verified</span>
            }
          </div>

          {/* Email */}
          <div className="verif-item">
            <div className="verif-item-left">
              <div className={`verif-icon ${emailVerified ? 'ok' : 'warn'}`}>
                <Mail size={16} />
              </div>
              <div>
                <p className="verif-item-label">Email Address</p>
                <p className="verif-item-value">{email?.emailAddress || 'Not added'}</p>
              </div>
            </div>
            {emailVerified
              ? <span className="badge badge-success"><CheckCircle size={12} /> Verified</span>
              : <span className="badge badge-warning"><AlertCircle size={12} /> Not verified</span>
            }
          </div>

          {!isFullyVerified && (
            <div className="alert alert-info" style={{ marginTop: 16 }}>
              Verification is managed through Clerk. If you need to add or verify your phone or email, your profile settings are accessible via the Clerk user button (top bar avatar area).
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="alert alert-warning" style={{ marginTop: 16 }}>
        <Shield size={18} />
        <div>
          <strong>Security Notice:</strong> Cardnect never stores or processes full card numbers, CVV codes, expiry dates, or OTP codes.
          All card information on this platform is masked. Transactions occur outside the platform and Cardnect is not liable for them.
        </div>
      </div>
    </div>
  )
}
