import { SignIn, SignUp } from '@clerk/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, ArrowLeft } from 'lucide-react'
import './AuthPage.css'

export default function AuthPage() {
  const [mode, setMode] = useState('signin')
  const navigate = useNavigate()

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

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => setMode('signin')}
          >Sign In</button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >Sign Up</button>
        </div>

        {/* Clerk component */}
        <div className="auth-clerk-wrapper">
          {mode === 'signin' ? (
            <SignIn
              routing="hash"
              afterSignInUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: '#3b82f6',
                  colorBackground: '#111c30',
                  colorInputBackground: '#060b14',
                  colorText: '#f1f5f9',
                  colorTextSecondary: '#94a3b8',
                  colorInputText: '#f1f5f9',
                  borderRadius: '12px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
                elements: {
                  card: { boxShadow: 'none', background: 'transparent', border: 'none' },
                  headerTitle: { display: 'none' },
                  headerSubtitle: { display: 'none' },
                  socialButtonsBlockButton: { border: '1px solid rgba(255,255,255,0.06)', background: '#0d1526' },
                  formFieldInput: { borderColor: 'rgba(255,255,255,0.06)' },
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              afterSignUpUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: '#3b82f6',
                  colorBackground: '#111c30',
                  colorInputBackground: '#060b14',
                  colorText: '#f1f5f9',
                  colorTextSecondary: '#94a3b8',
                  colorInputText: '#f1f5f9',
                  borderRadius: '12px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
                elements: {
                  card: { boxShadow: 'none', background: 'transparent', border: 'none' },
                  headerTitle: { display: 'none' },
                  headerSubtitle: { display: 'none' },
                  formFieldInput: { borderColor: 'rgba(255,255,255,0.06)' },
                },
              }}
            />
          )}
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
