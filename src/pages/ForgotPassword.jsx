import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/auth';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.forgotPassword(email);
    } catch {
      // Deliberately ignored. The endpoint answers identically whether or not
      // the address is registered, and surfacing a difference here would
      // reintroduce the account enumeration the backend avoids.
    } finally {
      setSent(true);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <p className="eyebrow">Rohan Travels</p>
        <h1 className="auth__title">Reset your password</h1>
        <p className="auth__sub">We will email a link that works for 15 minutes.</p>

        {sent ? (
          <div className="card stack">
            <Alert kind="success">
              If an account exists for that address, a reset link is on its way.
            </Alert>
            <p className="muted" style={{ fontSize: 'var(--step--1)' }}>
              Nothing arrived? Check spam, or try again in a few minutes.
            </p>
            <Link className="btn btn--ghost btn--block" to="/login">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="card stack" onSubmit={submit} noValidate>
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
            <p className="center" style={{ fontSize: 'var(--step--1)', margin: 0 }}>
              <Link to="/login">Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
