// frontend/src/components/ui/OTPVerification.jsx
import { useState, useEffect, useRef } from 'react';
import './OTPVerification.css';

export default function OTPVerification({ 
  email, 
  onVerify, 
  onResend, 
  onCancel,
  isResending = false,
  error = null 
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
      setActiveIndex(index - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits) {
      const newOtp = [...otp];
      digits.split('').forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex].focus();
      setActiveIndex(nextIndex);
    }
  };

  const handleSubmit = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      onVerify(otpCode);
    }
  };

  const otpCode = otp.join('');

  return (
    <div className="otp-verification">
      <div className="otp-header">
        <h3>📧 Email Verification</h3>
        <p className="otp-subtitle">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
        <p className="otp-timer" style={{ 
          fontSize: '14px', 
          color: timeLeft < 60 ? '#dc3545' : '#6b7a8f',
          marginTop: '8px'
        }}>
          ⏰ Code expires in: <strong>{formatTime(timeLeft)}</strong>
        </p>
      </div>

      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`otp-input ${digit ? 'filled' : ''} ${activeIndex === index ? 'active' : ''}`}
            autoComplete="off"
            aria-label={`Digit ${index + 1} of 6`}
          />
        ))}
      </div>

      {error && <div className="otp-error">❌ {error}</div>}

      <div className="otp-actions">
        <button 
          className="btn btn--primary btn--block"
          onClick={handleSubmit}
          disabled={otpCode.length !== 6 || timeLeft <= 0}
        >
          {timeLeft <= 0 ? 'Code Expired' : 'Verify Email'}
        </button>
        <button 
          className="btn btn--ghost btn--sm"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>

      <div className="otp-footer">
        <span className="faint">Didn't receive the code?</span>
        <button 
          className="otp-resend"
          onClick={onResend}
          disabled={isResending || timeLeft > 580}
        >
          {isResending ? 'Sending...' : 'Resend Code'}
        </button>
        {timeLeft > 580 && (
          <span style={{ fontSize: '12px', color: '#6b7a8f', display: 'block', marginTop: '4px' }}>
            You can resend after {formatTime(timeLeft - 580)}
          </span>
        )}
      </div>
    </div>
  );
}