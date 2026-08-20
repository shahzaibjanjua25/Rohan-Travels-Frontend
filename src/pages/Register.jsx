import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';
import authService from '../services/auth';
import { MIN_PASSWORD_LENGTH } from '../utils/constants';
import Swal from 'sweetalert2';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';
import OTPVerification from '../components/ui/OTPVerification';
import logo from '../assests/logo.png';
import './Login.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '#e2e8f0' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, label: 'Weak', color: '#ef4444' },
      { score: 1, label: 'Weak', color: '#ef4444' },
      { score: 2, label: 'Fair', color: '#f59e0b' },
      { score: 3, label: 'Good', color: '#10b981' },
      { score: 4, label: 'Strong', color: '#10b981' },
      { score: 5, label: 'Very Strong', color: '#10b981' },
    ];

    return levels[score] || levels[0];
  };

  // Show error popup
  const showErrorPopup = (title, message, details = null) => {
    let htmlContent = `<div style="text-align: left;">`;

    if (details && typeof details === 'object') {
      htmlContent += `<p><strong>${message}</strong></p>`;
      htmlContent += `<ul style="list-style-type: none; padding-left: 0; margin-top: 8px;">`;
      Object.entries(details).forEach(([field, error]) => {
        htmlContent += `<li style="padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="color: #dc3545;">✕</span> 
          <strong>${field}:</strong> ${error}
        </li>`;
      });
      htmlContent += `</ul>`;
    } else {
      htmlContent += `<p>${message}</p>`;
    }

    htmlContent += `</div>`;

    Swal.fire({
      icon: 'error',
      title: title,
      html: htmlContent,
      confirmButtonColor: '#0a2463',
      confirmButtonText: 'OK, I\'ll fix it',
      timer: 5000,
      timerProgressBar: true,
    });
  };

  // Show success popup
  const showSuccessPopup = () => {
    Swal.fire({
      icon: 'success',
      title: 'Account Created! 🎉',
      html: `
        <div style="text-align: left;">
          <p><strong>Welcome to Rohan Travels!</strong></p>
          <p style="color: #6b7a8f; font-size: 14px;">
            Your account has been created and verified successfully.<br>
            You can now start booking flights and managing your travel.
          </p>
        </div>
      `,
      confirmButtonColor: '#0a2463',
      confirmButtonText: 'Start Exploring',
      timer: 3000,
      timerProgressBar: true,
    }).then(() => {
      navigate('/', { replace: true });
    });
  };

  // Show loading popup
  const showLoadingPopup = () => {
    Swal.fire({
      title: 'Creating Account...',
      text: 'Please wait while we set up your account.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const closeLoadingPopup = () => {
    Swal.close();
  };

  // Send OTP via auth service
  // frontend/src/pages/Register.jsx
  // Find the sendOTP function and update it

  // frontend/src/pages/Register.jsx
  // Find the sendOTP function and replace it

  const sendOTP = async () => {
    setOtpError('');

    try {
      
      const response = await authService.requestOTP(form.email, 'verification');

      if (response.success) {
        // Always show the OTP in the console for testing
        if (response.otp) {
          
          // Show a notification with the OTP
          Swal.fire({
            icon: 'info',
            title: '📧 OTP Sent!',
            html: `
            <div style="text-align: center;">
              <p>We've sent a verification code to <strong>${form.email}</strong></p>
              <div style="background: #e8edf7; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="font-size: 12px; color: #6b7a8f; margin: 0;">Your OTP Code</p>
                <p style="font-size: 32px; font-weight: 700; color: #0a2463; letter-spacing: 4px; margin: 4px 0;">${response.otp}</p>
              </div>
              <p style="font-size: 13px; color: #6b7a8f;">Check your email or use the code above</p>
            </div>
          `,
            confirmButtonColor: '#0a2463',
            confirmButtonText: 'OK, I have the code',
            timer: 8000,
            timerProgressBar: true,
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Register] Send OTP error:', error);
      setOtpError(error.message || 'Failed to send verification code.');
      return false;
    }
  };
  // Handle OTP verification
  const handleVerifyOTP = async (enteredOtp) => {
    try {
      const response = await authService.verifyOTP(form.email, enteredOtp, 'verification');
      if (response.success) {
        setIsVerified(true);
        setShowOTP(false);
        await completeRegistration();
      }
    } catch (error) {
      setOtpError(error.message || 'Invalid verification code. Please try again.');
    }
  };

  // Complete registration after OTP verification
  const completeRegistration = async () => {
    showLoadingPopup();

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        isVerified: true
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();

      await register(payload);

      closeLoadingPopup();
      showSuccessPopup();

    } catch (err) {
      closeLoadingPopup();

      if (err instanceof ApiError) {
        setErrors(err.fieldErrors || {});

        let errorTitle = 'Registration Failed';
        let errorMessage = err.message || 'Something went wrong.';
        let errorDetails = err.fieldErrors || null;

        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          errorTitle = 'Email Already Registered';
          errorMessage = 'An account with this email already exists.';
          errorDetails = { 'Email': 'This email is already registered. Please use a different email or sign in.' };
        } else if (err.fieldErrors) {
          errorTitle = 'Validation Error';
          errorMessage = 'Please fix the following issues:';
          errorDetails = err.fieldErrors;
        }

        showErrorPopup(errorTitle, errorMessage, errorDetails);
        setMessage(err.details?.length ? '' : err.message);
      } else {
        showErrorPopup('Registration Error', err.message || 'Something went wrong. Please try again.');
        setMessage('Something went wrong. Try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setOtpError('');
    const success = await sendOTP();
    setIsResending(false);

    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Code Sent!',
        text: 'A new verification code has been sent to your email.',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setErrors({});

    // Validate name
    if (!form.name || form.name.trim() === '') {
      showErrorPopup('Registration Error', 'Please enter your full name.');
      setBusy(false);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      showErrorPopup('Registration Error', 'Please enter a valid email address.', {
        'Email': 'Invalid email format (e.g., name@example.com)'
      });
      setBusy(false);
      return;
    }

    // Validate password length
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      showErrorPopup('Registration Error', `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`, {
        'Password': `Minimum ${MIN_PASSWORD_LENGTH} characters required`
      });
      setBusy(false);
      return;
    }

    // Validate password match
    if (form.password !== form.confirmPassword) {
      showErrorPopup('Registration Error', 'Passwords do not match.', {
        'Confirm Password': 'Please make sure both passwords are identical'
      });
      setBusy(false);
      return;
    }

    // Validate phone (if provided)
    if (form.phone.trim()) {
      const phoneDigits = form.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        showErrorPopup('Registration Error', 'Please enter a valid phone number.', {
          'Phone': 'Must be at least 10 digits'
        });
        setBusy(false);
        return;
      }
    }

    // Send OTP and show verification popup
    const otpSent = await sendOTP();
    setBusy(false);

    if (otpSent) {
      setShowOTP(true);
      Swal.fire({
        title: 'Verification Code Sent',
        text: `We've sent a 6-digit code to ${form.email}`,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  // If OTP verification is shown
  if (showOTP) {
    return (
      <div className="auth">
        <div className="auth__card">
          <OTPVerification
            email={form.email}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            onCancel={() => {
              setShowOTP(false);
              setOtpError('');
            }}
            isResending={isResending}
            error={otpError}
          />
        </div>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__logo">
          <img
            src={logo}
            alt="Rohan Travels & Tours"
            className="auth__logo-img"
          />
        </div>

        <p className="eyebrow">Rohan Travels</p>
        <h1 className="auth__title">Create an account</h1>
        <p className="auth__sub">Join us to start booking your dream flights.</p>

        <form className="card stack" onSubmit={submit} noValidate>
          {message && <Alert kind="error">{message}</Alert>}

          <Field
            id="name"
            label="Full Name"
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            required
            placeholder="Enter your full name"
          />

          <Field
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            required
            placeholder="you@example.com"
          />

          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters. A short phrase is stronger than a short password.`}
            required
            placeholder="Enter your password"
          />

          {/* Password Strength Indicator */}
          {form.password && (
            <div style={{
              marginTop: '-8px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                flex: 1,
                height: '4px',
                background: '#e2e8f0',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  height: '100%',
                  background: passwordStrength.color,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: passwordStrength.color,
                minWidth: '60px',
                textAlign: 'right'
              }}>
                {passwordStrength.label}
              </span>
            </div>
          )}

          <Field
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            required
            placeholder="Re-enter your password"
          />

          {/* Password Match Indicator */}
          {form.confirmPassword && (
            <div style={{
              fontSize: '13px',
              color: form.password === form.confirmPassword ? '#10b981' : '#ef4444',
              marginTop: '-8px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {form.password === form.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
            </div>
          )}

          <Field
            id="phone"
            label="Phone Number (optional)"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
            placeholder="+92-XXX-XXXXXXX"
          />

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="muted center" style={{ fontSize: 'var(--step--1)', margin: 0 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}