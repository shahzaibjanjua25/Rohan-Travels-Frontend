import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/auth';
import { ApiError } from '../services/api';
import { MIN_PASSWORD_LENGTH } from '../utils/constants';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setErrors({});
    try {
      await authService.resetPassword(token, password);
      navigate('/login', { replace: true, state: { reset: true } });
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

  if (!token) {
    return (
      <div className="auth">
        <div className="auth__card card stack">
          <Alert kind="error">This reset link is missing its token.</Alert>
          <Link className="btn btn--ghost btn--block" to="/forgot-password">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <p className="eyebrow">Rohan Travels</p>
        <h1 className="auth__title">Choose a new password</h1>
        <p className="auth__sub">This signs you out everywhere else.</p>

        <form className="card stack" onSubmit={submit} noValidate>
          {message && <Alert kind="error">{message}</Alert>}
          <Field
            id="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            required
          />
          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      </div>
    </div>
  );
}
