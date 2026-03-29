import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, Mail, Phone, User, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import './AuthPage.css'

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_OTP === 'true' || import.meta.env.VITE_BYPASS_OTP === 'true'

/* ─── Field ─────────────────────────────────────────────────── */
function Field({ icon: Icon, label, type = 'text', value, onChange, placeholder, disabled, right }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="ap-field">
      <label className="ap-label">{label}</label>
      <div className="ap-input-wrap">
        <Icon size={15} className="ap-input-icon" />
        <input
          className="ap-input"
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        {isPassword && (
          <button type="button" className="ap-eye" onClick={() => setShow(v => !v)} tabIndex={-1}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
        {right}
      </div>
    </div>
  )
}

/* ─── 6-box OTP ─────────────────────────────────────────────── */
function OtpBoxes({ value, onChange, disabled }) {
  return (
    <div className="ap-field">
      <label className="ap-label">6-digit OTP code</label>
      <div className="ap-otp-row">
        {[0,1,2,3,4,5].map(i => (
          <input key={i} id={`otp-${i}`} className="ap-otp-box"
            type="text" inputMode="numeric" maxLength={1}
            value={value[i] || ''} disabled={disabled}
            onChange={e => {
              const v = e.target.value.replace(/\D/, '')
              const arr = value.split(''); arr[i] = v; onChange(arr.join(''))
              if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus()
            }}
            onKeyDown={e => {
              if (e.key === 'Backspace' && !value[i] && i > 0)
                document.getElementById(`otp-${i - 1}`)?.focus()
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── SIGN IN (card front) ──────────────────────────────────── */
function SignInForm({ onFlip }) {
  const { sendOtp, verifyOtp, loginPassword } = useAuthContext()
  const navigate = useNavigate()

  const [mode,     setMode]     = useState('otp')   // 'otp' | 'password'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [otp,      setOtp]      = useState('')
  const [otpSent,  setOtpSent]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [msg,      setMsg]      = useState('')

  const reset = () => { setOtpSent(false); setOtp(''); setError(''); setMsg('') }

  const handleSendOtp = async () => {
    if (!email.trim()) { setError('Enter your email address'); return }
    setError(''); setLoading(true)
    try {
      if (!DEV_BYPASS) await sendOtp(email.trim())
      setOtpSent(true)
      setMsg(DEV_BYPASS ? 'Dev mode — OTP bypassed.' : 'OTP sent — check your inbox.')
    } catch(e) { setError(e?.response?.data?.message || e?.message || 'Failed to send OTP.') }
    finally { setLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (!DEV_BYPASS && otp.length < 6) { setError('Enter the 6-digit OTP.'); return }
    setError(''); setLoading(true)
    try {
      await verifyOtp({ email: email.trim(), otpCode: DEV_BYPASS ? '' : otp })
      navigate('/dashboard', { replace: true })
    } catch(e) { setError(e?.response?.data?.message || e?.message || 'Incorrect OTP.') }
    finally { setLoading(false) }
  }

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Enter email and password.'); return }
    setError(''); setLoading(true)
    try {
      await loginPassword({ email: email.trim(), password })
      navigate('/dashboard', { replace: true })
    } catch(e) { setError(e?.response?.data?.message || e?.message || 'Invalid email or password.') }
    finally { setLoading(false) }
  }

  return (
    <div className="ap-face ap-front">
      <div className="ap-card-decor" aria-hidden="true">
        <div className="ap-card-chip" />
        <div className="ap-card-network">CARDNECT SECURE</div>
      </div>

      <div className="ap-form-header">
        <h2 className="ap-form-title">Welcome back</h2>
        <p className="ap-form-sub">Sign in to your Cardnect account</p>
      </div>

      <div className="ap-mode-tabs">
        <button className={`ap-mode-tab ${mode === 'otp' ? 'active' : ''}`}
          onClick={() => { setMode('otp'); reset() }}>Email OTP</button>
        <button className={`ap-mode-tab ${mode === 'password' ? 'active' : ''}`}
          onClick={() => { setMode('password'); reset() }}>Password</button>
      </div>

      <div className="ap-fields">
        <Field icon={Mail} label="Email address" type="email" value={email}
          onChange={v => { setEmail(v); reset() }}
          placeholder="you@gmail.com" disabled={loading || (mode === 'otp' && otpSent)} />

        {mode === 'otp' && otpSent && <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />}

        {mode === 'password' && (
          <Field icon={Lock} label="Password" type="password" value={password}
            onChange={setPassword} placeholder="Your password" disabled={loading} />
        )}
      </div>

      {error && <p className="ap-error">{error}</p>}
      {msg   && <p className="ap-msg">{msg}</p>}

      <div className="ap-actions">
        {mode === 'otp' ? (
          !otpSent
            ? <button className="ap-btn-primary" onClick={handleSendOtp} disabled={loading}>
                {loading ? <><Loader size={15} className="spin" /> Sending…</> : 'Send OTP →'}
              </button>
            : <>
                <button className="ap-btn-primary" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? <><Loader size={15} className="spin" /> Verifying…</> : 'Verify & Sign In →'}
                </button>
                <button className="ap-btn-ghost" onClick={reset} disabled={loading}>Different email</button>
              </>
        ) : (
          <button className="ap-btn-primary" onClick={handlePasswordLogin} disabled={loading}>
            {loading ? <><Loader size={15} className="spin" /> Signing in…</> : 'Sign In →'}
          </button>
        )}
      </div>

      <div className="ap-switch">
        Don't have an account?{' '}
        <button className="ap-switch-link" onClick={onFlip}>Sign up</button>
      </div>
    </div>
  )
}

/* ─── SIGN UP (card back) ───────────────────────────────────── */
function SignUpForm({ onFlip }) {
  const { sendOtp, register } = useAuthContext()
  const navigate = useNavigate()

  const [firstName,     setFirstName]     = useState('')
  const [lastName,      setLastName]      = useState('')
  const [email,         setEmail]         = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [otp,           setOtp]           = useState('')
  const [otpSent,       setOtpSent]       = useState(false)
  const [phone,         setPhone]         = useState('')
  const [password,      setPassword]      = useState('')
  const [loading,       setLoading]       = useState(false)
  const [otpLoading,    setOtpLoading]    = useState(false)
  const [error,         setError]         = useState('')
  const [msg,           setMsg]           = useState('')

  const handleSendEmailOtp = async () => {
    if (!email.trim()) { setError('Enter your email first'); return }
    setError(''); setOtpLoading(true)
    try {
      if (!DEV_BYPASS) await sendOtp(email.trim())
      setOtpSent(true)
      setMsg(DEV_BYPASS ? 'Dev mode — OTP bypassed.' : `OTP sent to ${email.trim()}`)
    } catch(e) { setError(e?.response?.data?.message || e?.message || 'Could not send OTP.') }
    finally { setOtpLoading(false) }
  }

  const handleConfirmEmailOtp = async () => {
    if (!DEV_BYPASS && otp.length < 6) { setError('Enter the 6-digit OTP'); return }
    // We don't call verifyOtp here — we'll pass the OTP to /register directly
    // Just mark email as locally verified so the rest of the form unlocks
    setEmailVerified(true)
    setMsg('')
    setError('')
  }

  const handleRegister = async () => {
    if (!firstName.trim()) { setError('First name is required'); return }
    if (!phone.trim())     { setError('Phone number is required'); return }
    if (!password.trim())  { setError('Password is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(''); setLoading(true)
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim()
      await register({
        name,
        email: email.trim(),
        phone: phone.trim(),
        password,
        otpCode: DEV_BYPASS ? '' : otp,
      })
      navigate('/dashboard', { replace: true })
    } catch(e) { setError(e?.response?.data?.message || e?.message || 'Registration failed.') }
    finally { setLoading(false) }
  }

  return (
    <div className="ap-face ap-back">
      <div className="ap-card-decor" aria-hidden="true">
        <div className="ap-card-chip" />
        <div className="ap-card-network">PREMIUM ACCESS</div>
      </div>

      <div className="ap-form-header">
        <h2 className="ap-form-title">Create account</h2>
        <p className="ap-form-sub">Join Cardnect — it's free</p>
      </div>

      <div className="ap-fields">
        {/* Name row */}
        <div className="ap-row2">
          <Field icon={User} label="First name" value={firstName} onChange={setFirstName}
            placeholder="Jane" disabled={loading} />
          <Field icon={User} label="Last name" value={lastName} onChange={setLastName}
            placeholder="Doe" disabled={loading} />
        </div>

        {/* Email + inline verify */}
        <div className="ap-field">
          <label className="ap-label">Gmail / Email</label>
          <div className="ap-input-wrap">
            <Mail size={15} className="ap-input-icon" />
            <input className="ap-input" type="email" value={email}
              onChange={e => { setEmail(e.target.value); setEmailVerified(false); setOtpSent(false); setOtp('') }}
              placeholder="you@gmail.com" disabled={loading || emailVerified} />
            {emailVerified
              ? <span className="ap-email-verified"><CheckCircle size={14} /> Verified</span>
              : <button className="ap-verify-btn" onClick={handleSendEmailOtp}
                  disabled={!email.trim() || otpLoading || otpSent}>
                  {otpLoading ? <Loader size={12} className="spin" /> : otpSent ? 'Resend' : 'Verify'}
                </button>
            }
          </div>
        </div>

        {/* Inline OTP confirm */}
        {otpSent && !emailVerified && (
          <>
            <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />
            <button className="ap-btn-secondary" onClick={handleConfirmEmailOtp}
              disabled={!DEV_BYPASS && otp.length < 6}>
              Confirm Email OTP →
            </button>
          </>
        )}

        {/* Phone + Password — unlocked ONLY after email verified */}
        {emailVerified && (
          <>
            <Field icon={Phone} label="Phone number" type="tel" value={phone}
              onChange={setPhone} placeholder="+91 98765 43210" disabled={loading} />
            <Field icon={Lock} label="Password" type="password" value={password}
              onChange={setPassword} placeholder="Create a strong password" disabled={loading} />
          </>
        )}
      </div>

      {error && <p className="ap-error">{error}</p>}
      {msg   && <p className="ap-msg">{msg}</p>}

      {emailVerified && (
        <div className="ap-actions">
          <button className="ap-btn-primary" onClick={handleRegister} disabled={loading}>
            {loading ? <><Loader size={15} className="spin" /> Creating account…</> : 'Create Account →'}
          </button>
        </div>
      )}

      <div className="ap-switch">
        Already have an account?{' '}
        <button className="ap-switch-link" onClick={onFlip}>Sign in</button>
      </div>
    </div>
  )
}

/* ─── Root ──────────────────────────────────────────────────── */
export default function AuthPage() {
  const navigate  = useNavigate()
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="ap-page">
      <button className="ap-back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="ap-logo">
        <img src="/cardnect-logo.svg" alt="Cardnect logo" className="ap-logo-mark" loading="lazy" decoding="async" />
        <span>Cardnect</span>
      </div>

      <div className={`ap-card-scene ${flipped ? 'flipped' : ''}`}>
        <div className="ap-card-inner">
          <SignInForm onFlip={() => setFlipped(true)}  />
          <SignUpForm onFlip={() => setFlipped(false)} />
        </div>
      </div>

      <p className="ap-disclaimer">
        By continuing you agree to our Terms of Service and Privacy Policy.<br />
        Cardnect never stores full card numbers or CVV codes.
      </p>
    </div>
  )
}
