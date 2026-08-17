import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setErrors({});

    try {
      await login(form.email, form.password);
      // Return them to wherever the guard interrupted, not always home.
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
        <p className="eyebrow">Rohan Travels</p>
        <h1 className="auth__title">Sign in</h1>
        <p className="auth__sub">Manage your bookings and travel documents.</p>

        <form className="card stack" onSubmit={submit} noValidate>
          {message && <Alert kind="error">{message}</Alert>}

          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            required
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
          />

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="row row--between" style={{ fontSize: 'var(--step--1)' }}>
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
