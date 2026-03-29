import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sendOtp, resetPassword } from '../api/services'
import { X, Mail, ShieldCheck, Lock, ArrowRight, Loader, AlertTriangle } from 'lucide-react'
import './ChangePasswordModal.css' // Switching to bespoke premium styling

export default function ChangePasswordModal({ isOpen, onClose, userEmail }) {
  const [step, setStep] = useState('send') // 'send' | 'verify'
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStep('send')
      setOtp('')
      setPassword('')
      setConfirm('')
      setError('')
    }
  }, [isOpen])

  const sendOtpMut = useMutation({
    mutationFn: () => sendOtp(userEmail),
    onSuccess: () => {
      setStep('verify')
      setError('')
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to send OTP')
  })

  const resetMut = useMutation({
    mutationFn: () => resetPassword({ email: userEmail, otpCode: otp, newPassword: password }),
    onSuccess: () => {
      onClose()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to reset password')
  })

  const handleSendOtp = (e) => {
    e.preventDefault()
    sendOtpMut.mutate()
  }

  const handleReset = (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      return setError('Passwords do not match')
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    resetMut.mutate()
  }

  if (!isOpen) return null

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
        <button className="premium-modal-close" onClick={onClose}><X size={18} /></button>

        <div className="premium-header">
          <div className="premium-icon-wrap">
            <ShieldCheck size={32} />
          </div>
          <h1>Change Password</h1>
          <p>We'll send a 6-digit code to your email to verify it's you.</p>
        </div>

        {error && <div className="premium-err"><AlertTriangle size={16} /> {error}</div>}

        {step === 'send' ? (
          <form onSubmit={handleSendOtp}>
            <div className="premium-input-group">
              <label className="premium-label">Email Address</label>
              <div className="premium-input-wrap">
                <Mail size={18} className="premium-icon" />
                <input
                  type="email"
                  className="premium-input"
                  value={userEmail || ''}
                  disabled
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center' }}>
                A secure code will be delivered to this address.
              </p>
            </div>

            <button
              type="submit"
              className="premium-btn"
              disabled={sendOtpMut.isPending}
            >
              {sendOtpMut.isPending ? <Loader size={18} className="spin" /> : 'Send Verification Code'}
              {!sendOtpMut.isPending && <ArrowRight size={18} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="premium-input-group">
              <label className="premium-label">6-Digit Verification Code</label>
              <div className="premium-input-wrap">
                <input
                  type="text"
                  className="premium-input premium-otp-input"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="premium-input-group">
              <label className="premium-label">New Password</label>
              <div className="premium-input-wrap">
                <Lock size={18} className="premium-icon" />
                <input
                  type="password"
                  className="premium-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="premium-input-group">
              <label className="premium-label">Confirm Password</label>
              <div className="premium-input-wrap">
                <Lock size={18} className="premium-icon" />
                <input
                  type="password"
                  className="premium-input"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="premium-btn"
              disabled={resetMut.isPending || otp.length !== 6 || !password || !confirm}
            >
              {resetMut.isPending ? <Loader size={18} className="spin" /> : 'Update Password'}
              {!resetMut.isPending && <ShieldCheck size={18} />}
            </button>

            <div className="premium-footer">
              <button type="button" className="premium-text-btn" onClick={() => setStep('send')}>
                Didn't get the code? Resend
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
