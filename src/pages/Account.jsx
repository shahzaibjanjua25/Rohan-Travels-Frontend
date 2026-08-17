import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth';
import { ledgerService } from '../services/misc';
import { ApiError } from '../services/api';
import { MIN_PASSWORD_LENGTH } from '../utils/constants';
import { dateTime, money, titleCase } from '../utils/format';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';


export default function Account() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    ledgerService.list({ limit: 10 }).then((res) => setLedger(res.data)).catch(() => {});
    ledgerService.balance().then((res) => setBalance(res.data)).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    setProfileErrors({});
    try {
      const payload = { name: profile.name };
      if (profile.phone.trim()) payload.phone = profile.phone.trim();
      const res = await authService.updateProfile(payload);
      updateUser(res.data);
      setProfileMsg('Profile saved.');
    } catch (err) {
      if (err instanceof ApiError) setProfileErrors(err.fieldErrors);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg('');
    setPasswordError('');
    setPasswordErrors({});
    try {
      await authService.changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: '', newPassword: '' });
      setPasswordMsg('Password changed. Other devices have been signed out.');
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordErrors(err.fieldErrors);
        setPasswordError(err.details?.length ? '' : err.message);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="wrap stack">
      <div>
        <p className="eyebrow">Account</p>
        <h1>{user?.name}</h1>
        <p className="muted mono">{user?.email}</p>
      </div>

      <div className="grid grid--2">
        <form className="card stack" onSubmit={saveProfile} noValidate>
          <h2>Your details</h2>
          {profileMsg && <Alert kind="success">{profileMsg}</Alert>}
          <Field
            id="name"
            label="Full name"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            error={profileErrors.name}
          />
          <Field
            id="phone"
            label="Phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            error={profileErrors.phone}
          />
          <p className="field__hint" style={{ margin: 0 }}>
            Email cannot be changed here. Ask an administrator if you need it updated.
          </p>
          <button className="btn btn--primary" type="submit" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <form className="card stack" onSubmit={savePassword} noValidate>
          <h2>Change password</h2>
          {passwordMsg && <Alert kind="success">{passwordMsg}</Alert>}
          {passwordError && <Alert kind="error">{passwordError}</Alert>}
          <Field
            id="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
            error={passwordErrors.currentPassword}
            required
          />
          <Field
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
            error={passwordErrors.newPassword}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters. This signs out your other devices.`}
            required
          />
          <button className="btn btn--primary" type="submit" disabled={savingPassword}>
            {savingPassword ? 'Saving…' : 'Change password'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="row row--between" style={{ marginBottom: 'var(--s-4)' }}>
          <h2>Payments and refunds</h2>
          {balance && <span className="mono">{money(balance.balance)}</span>}
        </div>
        {ledger.length === 0 ? (
          <p className="muted">No transactions yet.</p>
        ) : (
          <div className="table__scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Entry</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((e) => (
                  <tr key={e._id}>
                    <td className="mono faint">{e.entryNumber}</td>
                    <td>
                      {e.description}
                      <span className="faint" style={{ marginLeft: 'var(--s-2)', fontSize: 'var(--step--1)' }}>
                        {titleCase(e.category)}
                      </span>
                    </td>
                    <td className="mono">{dateTime(e.createdAt)}</td>
                    <td className="right mono" style={{ color: e.type === 'credit' ? 'var(--clear)' : 'inherit' }}>
                      {e.type === 'credit' ? '+' : '−'}
                      {money(e.amount, e.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
