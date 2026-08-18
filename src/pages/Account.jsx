import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth';
import { ledgerService } from '../services/misc';
import { ApiError } from '../services/api';
import { MIN_PASSWORD_LENGTH } from '../utils/constants';
import { dateTime, money, titleCase } from '../utils/format';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import './Account.css';

export default function Account() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [ledger, setLedger] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({ 
        name: user.name || '', 
        phone: user.phone || '' 
      });
    }
  }, [user]);

  useEffect(() => {
    const loadLedger = async () => {
      try {
        const [ledgerRes, balanceRes] = await Promise.all([
          ledgerService.list({ limit: 10 }),
          ledgerService.balance()
        ]);
        setLedger(ledgerRes.data || []);
        setBalance(balanceRes.data || null);
      } catch (err) {
        console.error('Failed to load ledger:', err);
      } finally {
        setLoadingLedger(false);
      }
    };
    loadLedger();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    setProfileError('');
    setProfileErrors({});
    try {
      const payload = { name: profile.name };
      if (profile.phone?.trim()) payload.phone = profile.phone.trim();
      const res = await authService.updateProfile(payload);
      updateUser(res.data);
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setProfileErrors(err.fieldErrors);
        } else {
          setProfileError(err.message || 'Failed to update profile');
        }
      } else {
        setProfileError('Failed to update profile');
      }
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
      setPasswordMsg('Password changed successfully! All other devices have been signed out.');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setPasswordErrors(err.fieldErrors);
        } else {
          setPasswordError(err.message || 'Failed to change password');
        }
      } else {
        setPasswordError('Failed to change password');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // Show loading state
  if (!user) {
    return (
      <div className="account-wrapper">
        <div className="center" style={{ padding: 'var(--space-8) 0' }}>
          <Spinner label="Loading account..." />
        </div>
      </div>
    );
  }

  return (
    <div className="account-wrapper">
      {/* Header */}
      <div className="account-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>{user?.name || 'User'}</h1>
          <p className="faint mono">{user?.email}</p>
          <div className="account-badge">
            <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'user'}`}>
              {user?.role === 'admin' ? 'Administrator' : 'Agent'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile & Password Grid */}
      <div className="account-grid">
        {/* Profile Form */}
        <form className="card account-card" onSubmit={saveProfile} noValidate>
          <h2>Your Details</h2>
          {profileMsg && <Alert kind="success">{profileMsg}</Alert>}
          {profileError && <Alert kind="error">{profileError}</Alert>}
          
          <Field
            id="name"
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            error={profileErrors.name}
            required
          />
          
          <Field
            id="phone"
            label="Phone Number"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            error={profileErrors.phone}
            placeholder="+92-XXX-XXXXXXX"
          />
          
          <div className="field-hint">
            <span className="faint">Email cannot be changed here. Contact an administrator if you need it updated.</span>
          </div>
          
          <button className="btn btn--primary" type="submit" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Password Form */}
        <form className="card account-card" onSubmit={savePassword} noValidate>
          <h2>Change Password</h2>
          {passwordMsg && <Alert kind="success">{passwordMsg}</Alert>}
          {passwordError && <Alert kind="error">{passwordError}</Alert>}
          
          <Field
            id="currentPassword"
            label="Current Password"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
            error={passwordErrors.currentPassword}
            required
          />
          
          <Field
            id="newPassword"
            label="New Password"
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
            error={passwordErrors.newPassword}
            hint={`At least ${MIN_PASSWORD_LENGTH || 10} characters. This will sign out your other devices.`}
            required
          />
          
          <button className="btn btn--primary" type="submit" disabled={savingPassword}>
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Ledger / Transactions */}
      <div className="card account-card account-transactions">
        <div className="ledger-header">
          <h2>Payments & Refunds</h2>
          {balance !== null && (
            <div className="balance-display">
              <span className="balance-label">Balance</span>
              <span className={`balance-value ${balance.balance >= 0 ? 'positive' : 'negative'}`}>
                {money(balance.balance || 0)}
              </span>
            </div>
          )}
        </div>

        {loadingLedger ? (
          <div className="center" style={{ padding: 'var(--space-4) 0' }}>
            <Spinner label="Loading transactions..." />
          </div>
        ) : ledger.length === 0 ? (
          <div className="empty-transactions">
            <div className="empty-icon">💰</div>
            <p className="faint">No transactions yet.</p>
            <p className="faint" style={{ fontSize: 'var(--font-xs)' }}>
              Your payment history will appear here once you make a booking.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry._id}>
                    <td className="mono faint">{entry.entryNumber || '—'}</td>
                    <td>
                      {entry.description}
                      <span className="faint" style={{ marginLeft: 'var(--s-2)', fontSize: 'var(--font-xs)' }}>
                        {titleCase(entry.category || '')}
                      </span>
                    </td>
                    <td className="mono">{dateTime(entry.createdAt)}</td>
                    <td className="right mono" style={{ 
                      color: entry.type === 'credit' ? 'var(--success)' : 'var(--text-primary)' 
                    }}>
                      {entry.type === 'credit' ? '+' : '−'}
                      {money(entry.amount || 0, entry.currency || 'PKR')}
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