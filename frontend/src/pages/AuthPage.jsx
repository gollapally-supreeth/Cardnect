import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, ArrowLeft, Loader } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import './AuthPage.css'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { sendOtp, verifyOtp } = useAuthContext()

  const handleSendOtp = async () => {
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      await sendOtp(email.trim())
      setOtpSent(true)
      setMessage('Verification code sent. Please check your inbox.')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      await verifyOtp(email.trim(), otpCode.trim())
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-blob auth-bg-blob-1" />
      <div className="auth-bg-blob auth-bg-blob-2" />

      <div className="auth-container">
        {/* Back button */}
        <button className="auth-back btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><CreditCard size={20} /></div>
          <span>Cardnect</span>
        </div>

        <div className="auth-tabs">
          <button className="auth-tab active">Email OTP Login</button>
        </div>

        <div className="auth-clerk-wrapper">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting || otpSent}
              />
            </div>

            {otpSent && (
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

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-info">{message}</div>}

            {!otpSent ? (
              <button className="btn btn-primary" onClick={handleSendOtp} disabled={submitting || !email.trim()}>
                {submitting ? <><Loader size={16} className="spin" /> Sending OTP...</> : 'Send OTP'}
              </button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={handleVerifyOtp} disabled={submitting || otpCode.length !== 6}>
                  {submitting ? <><Loader size={16} className="spin" /> Verifying...</> : 'Verify OTP'}
                </button>
                <button className="btn btn-ghost" onClick={() => { setOtpSent(false); setOtpCode(''); setMessage('') }} disabled={submitting}>
                  Use another email
                </button>
              </>
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
