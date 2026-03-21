import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, ArrowLeft, Loader } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import './AuthPage.css'

const DEV_BYPASS = (import.meta.env.VITE_DEV_BYPASS_OTP === 'true') || (import.meta.env.VITE_BYPASS_OTP === 'true')

export default function AuthPage() {
  const navigate = useNavigate()
  const { sendOtp, verifyOtp } = useAuthContext()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const canSendOtp = !!name.trim() && !!email.trim() && !!phone.trim() && !submitting
  const canVerify = !!name.trim() && !!email.trim() && !!phone.trim() && (DEV_BYPASS || otpCode.trim().length === 6) && !submitting

  const handleSendOtp = async () => {
    setError('')
    setMessage('')

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Name, email, and phone are required.')
      return
    }

    if (DEV_BYPASS) {
      setOtpSent(true)
      setMessage('Development mode: OTP verification is bypassed.')
      return
    }

    setSubmitting(true)
    try {
      await sendOtp(email.trim())
      setOtpSent(true)
      setMessage('Verification code sent. Please check your email inbox.')
    } catch (e) {
      setError(e?.message || 'Unable to send OTP right now.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    setMessage('')

    if (!canVerify) {
      setError(DEV_BYPASS ? 'Name, email, and phone are required.' : 'Please enter a valid 6-digit OTP.')
      return
    }

    setSubmitting(true)
    try {
      await verifyOtp({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        otpCode: DEV_BYPASS ? '' : otpCode.trim(),
      })
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e?.message || 'OTP verification failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-blob auth-bg-blob-1" />
      <div className="auth-bg-blob auth-bg-blob-2" />

      <div className="auth-container">
        <button className="auth-back btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <span className="notification-dot" style={{ position: 'absolute', top: -3, right: -3 }}></span>
            <CreditCard size={20} />
          </div>
          <span>Cardnect</span>
        </div>

        <div className="auth-tabs">
          <button className="auth-tab active">Email OTP Login</button>
        </div>

        <div className="auth-clerk-wrapper">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gmail / Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
              />
            </div>

            {!DEV_BYPASS && otpSent && (
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input
                  className="form-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  disabled={submitting}
                />
              </div>
            )}

            {DEV_BYPASS && (
              <div className="alert alert-info">
                Development bypass is enabled. Submit will sign you in without OTP.
              </div>
            )}

            {message && <div className="alert alert-info">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!otpSent ? (
              <button className="btn btn-primary" onClick={handleSendOtp} disabled={!canSendOtp}>
                {submitting ? <><Loader size={16} className="spin" /> Sending OTP...</> : 'Send OTP'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleVerifyOtp} disabled={!canVerify}>
                  {submitting ? <><Loader size={16} className="spin" /> Verifying...</> : (DEV_BYPASS ? 'Continue' : 'Verify OTP')}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setOtpSent(false)
                    setOtpCode('')
                    setMessage('')
                    setError('')
                  }}
                  disabled={submitting}
                >
                  Use another email
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="auth-disclaimer">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          Cardnect never stores sensitive card data.
        </p>
      </div>
    </div>
  )
}
