import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, CheckCircle, ArrowLeft, Loader, MessageCircle } from 'lucide-react';
import { sendWhatsAppOtp, verifyWhatsAppOtp } from '../api/services';
import './VerifyPhoneModal.css';

export default function VerifyPhoneModal({ isOpen, onClose, userPhone, onVerified }) {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Success
  const [phone, setPhone] = useState(userPhone || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [shake, setShake] = useState(false);
  
  const otpRefs = useRef([]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtp(['', '', '', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Enter a valid 10-digit number');
      return;
    }
    
    setLoading(true);
    try {
      await sendWhatsAppOtp(cleanPhone);
      setStep(2);
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      // Auto focus first otp box
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeStr) => {
    setError('');
    setLoading(true);
    try {
      await verifyWhatsAppOtp({ phone: phone.replace(/\D/g, ''), otp: codeStr });
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP');
      setShake(true);
      setTimeout(() => setShake(false), 500); // Remove shake class
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto submit if full
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && value) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      if (pastedData.length === 6) {
        handleVerifyOtp(pastedData);
      } else {
        otpRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div className="vpm-overlay">
      <div className="vpm-container">
        
        {step === 1 && (
          <div className="vpm-screen animate-fade-in">
            <button className="vpm-close" onClick={onClose}>×</button>
            <div className="vpm-icon-wrapper wa-green">
              <MessageCircle size={28} color="#fff" />
            </div>
            <h2 className="vpm-title">Verify via WhatsApp</h2>
            <p className="vpm-subtitle">We use WhatsApp to keep Cardnect safe and ensure everyone is a real person.</p>
            
            <div className="vpm-phone-input-wrap">
              <div className="vpm-prefix">+91</div>
              <input 
                type="tel" 
                maxLength={10}
                placeholder="98765 43210" 
                className="vpm-phone-input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="vpm-wa-preview">
              <div className="vpm-wa-bubble">
                <p>🔐 Your Cardnect OTP is: <strong>123456</strong></p>
                <p>Valid for 5 minutes.</p>
                <span className="vpm-wa-time">Just now</span>
              </div>
            </div>

            {error && <div className="vpm-error">{error}</div>}

            <button className="vpm-btn-gold" onClick={handleSendOtp} disabled={loading || phone.length < 10}>
              {loading ? <Loader className="spin" size={18} /> : 'Send OTP on WhatsApp'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="vpm-screen animate-fade-in">
            <button className="vpm-back" onClick={() => setStep(1)}><ArrowLeft size={18} /></button>
            <h2 className="vpm-title">Enter OTP</h2>
            <p className="vpm-subtitle">We sent a WhatsApp message to <br/><strong>+91 {phone}</strong> <span className="vpm-link" onClick={() => setStep(1)}>Change</span></p>
            
            <div className={`vpm-otp-row ${shake ? 'shake' : ''}`} onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  className="vpm-otp-box"
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={loading}
                />
              ))}
            </div>

            {error && <div className="vpm-error">{error}</div>}

            <div className="vpm-resend-row">
              {countdown > 0 ? (
                <span className="vpm-timer">Resend code in 0:{countdown < 10 ? `0${countdown}` : countdown}</span>
              ) : (
                <button className="vpm-link" onClick={handleSendOtp} disabled={loading}>Resend WhatsApp Message</button>
              )}
            </div>

            <button 
              className="vpm-btn-gold" 
              onClick={() => handleVerifyOtp(otp.join(''))} 
              disabled={loading || otp.join('').length < 6}
            >
              {loading ? <Loader className="spin" size={18} /> : 'Verify Phone Number'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="vpm-screen vpm-success animate-fade-in">
            <div className="vpm-success-icon">
              <CheckCircle size={56} color="#c9a84c" />
            </div>
            <h2 className="vpm-title">Phone Verified!</h2>
            <p className="vpm-subtitle">Your WhatsApp number is successfully linked. You can now request card offers.</p>
            
            <button className="vpm-btn-gold mt-6" onClick={() => {
              onVerified();
              onClose();
            }}>
              Continue to Cardnect
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
