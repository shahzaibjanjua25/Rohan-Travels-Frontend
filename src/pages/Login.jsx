// frontend/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';
import api from '../services/api';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';
import logo from '../assests/logo.png';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Prime CSRF on page load
  useEffect(() => {
    api.primeCsrf(true).then(() => {
      
    });
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setErrors({});

    try {
      // ✅ Ensure CSRF is fresh before login
      await api.primeCsrf(true);
      
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setMessage(err.details?.length ? '' : err.message);
      } else {
        setMessage('Something went wrong. Try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__logo">
          <img src={logo} alt="Rohan Travels & Tours" className="auth__logo-img" />
        </div>
        <h1 className="auth__title">Welcome Back</h1>
        <p className="auth__sub">Sign in to manage your bookings and travel documents.</p>

        <form className="card stack" onSubmit={submit} noValidate>
          {message && <Alert kind="error">{message}</Alert>}

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
            autoComplete="current-password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            required
            placeholder="Enter your password"
          />

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="row">
            <Link to="/forgot-password">Forgot your password?</Link>
            <span className="muted">
              New here? <Link to="/register">Create an account</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
//testing foront