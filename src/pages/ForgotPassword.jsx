// frontend/src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../services/api';
import authService from '../services/auth';
import Swal from 'sweetalert2';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';
import OTPVerification from '../components/ui/OTPVerification';
import logo from '../assests/logo.png';
import './Login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setBusy(false);
      return;
    }

    try {
      // Check if email exists
      const response = await authService.checkEmail(email);
      console.log('Check email response:', response);
      
      if (response.exists) {
        // Request OTP
        const otpResponse = await authService.requestOTP(email, 'reset');
        console.log('OTP request response:', otpResponse);
        
        if (otpResponse.success) {
          setShowOTP(true);
          Swal.fire({
            icon: 'info',
            title: 'Verification Code Sent',
            text: `We've sent a 6-digit code to ${email}`,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        setError('No account found with this email address.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOTP = async (enteredOtp) => {
    try {
      // Verify OTP
      const response = await authService.verifyOTP(email, enteredOtp, 'reset');
      console.log('OTP verification response:', response);
      
      if (response.success) {
        setShowOTP(false);
        setShowResetForm(true);
        setOtpError('');
        
        // Store the reset token from the response
        setResetToken(response.resetToken);
        
        Swal.fire({
          icon: 'success',
          title: 'Verified!',
          text: 'Please enter your new password.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError(error.message || 'Invalid verification code. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setOtpError('');
    
    try {
      const response = await authService.requestOTP(email, 'reset');
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Code Sent!',
          text: 'A new verification code has been sent to your email.',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      setOtpError(error.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters long.');
      setBusy(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setBusy(false);
      return;
    }

    try {
      await authService.resetPasswordWithToken(email, resetToken, newPassword);
      Swal.fire({
        icon: 'success',
        title: 'Password Reset!',
        text: 'Your password has been changed successfully. Please sign in with your new password.',
        confirmButtonColor: '#0a2463',
        confirmButtonText: 'Sign In',
      }).then(() => {
        navigate('/login');
      });
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // If OTP verification is shown
  if (showOTP) {
    return (
      <div className="auth">
        <div className="auth__card">
          <OTPVerification
            email={email}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            onCancel={() => {
              setShowOTP(false);
              setOtpError('');
              navigate('/login');
            }}
            isResending={isResending}
            error={otpError}
          />
        </div>
      </div>
    );
  }

  // If reset password form is shown
  if (showResetForm) {
    return (
      <div className="auth">
        <div className="auth__card">
          <div className="auth__logo">
            <img src={logo} alt="Rohan Travels & Tours" className="auth__logo-img" />
          </div>
          <p className="eyebrow">Rohan Travels</p>
          <h1 className="auth__title">Reset Password</h1>
          <p className="auth__sub">Enter your new password for <strong>{email}</strong></p>

          <form className="card stack" onSubmit={handleResetPassword} noValidate>
            {error && <Alert kind="error">{error}</Alert>}

            <Field
              id="newPassword"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              hint="At least 10 characters"
            />

            <Field
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />

            <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
              {busy ? 'Resetting...' : 'Reset Password'}
            </button>

            <p className="muted center" style={{ fontSize: 'var(--step--1)', margin: 0 }}>
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Main forgot password form
  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__logo">
          <img src={logo} alt="Rohan Travels & Tours" className="auth__logo-img" />
        </div>
        <p className="eyebrow">Rohan Travels</p>
        <h1 className="auth__title">Forgot Password</h1>
        <p className="auth__sub">Enter your email to receive a verification code</p>

        <form className="card stack" onSubmit={handleSubmit} noValidate>
          {error && <Alert kind="error">{error}</Alert>}
          {message && <Alert kind="success">{message}</Alert>}

          <Field
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Sending...' : 'Send Verification Code'}
          </button>

          <p className="muted center" style={{ fontSize: 'var(--step--1)', margin: 0 }}>
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}