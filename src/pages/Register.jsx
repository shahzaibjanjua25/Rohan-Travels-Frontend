import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';
import { MIN_PASSWORD_LENGTH } from '../utils/constants';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setErrors({});

    try {
      // Only send phone when it has a value — the backend treats an empty
      // string as a malformed number rather than as "not provided".
      const payload = { name: form.name, email: form.email, password: form.password };
      if (form.phone.trim()) payload.phone = form.phone.trim();

      await register(payload);
      navigate('/', { replace: true });
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
        <h1 className="auth__title">Create an account</h1>
        <p className="auth__sub">You will need one to hold a booking.</p>

        <form className="card stack" onSubmit={submit} noValidate>
          {message && <Alert kind="error">{message}</Alert>}

          <Field
            id="name"
            label="Full name"
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            required
          />

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
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters. A short phrase is stronger than a short password.`}
            required
          />

          <Field
            id="phone"
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
          />

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>

          <p className="muted center" style={{ fontSize: 'var(--step--1)', margin: 0 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
