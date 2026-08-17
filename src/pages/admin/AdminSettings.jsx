// src/pages/admin/AdminSettings.jsx
import { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings';
import { ApiError } from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import './AdminSettings.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await settingsService.get();
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await settingsService.update(settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults?')) return;
    
    try {
      setSaving(true);
      setError('');
      await settingsService.reset();
      await loadSettings();
      setSuccess('Settings reset to defaults!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to reset settings:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to reset settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings-wrapper">
        <div className="center" style={{ padding: '48px 0' }}>
          <Spinner label="Loading settings..." />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="admin-settings-wrapper">
        <Alert kind="error">No settings found.</Alert>
      </div>
    );
  }

  return (
    <div className="admin-settings-wrapper">
      <div className="admin-settings-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Settings</h1>
          <p className="subtitle">Configure system settings and preferences</p>
        </div>
        <div className="settings-actions">
          <button
            className="btn btn--ghost btn--sm"
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Defaults
          </button>
          <button
            className="btn btn--primary btn--sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {error && <Alert kind="error" onDismiss={() => setError('')}>{error}</Alert>}
      {success && <Alert kind="success" onDismiss={() => setSuccess('')}>{success}</Alert>}

      <div className="admin-settings-grid">
        {/* General Settings */}
        <div className="settings-card">
          <h2 className="settings-card-title">🏢 General</h2>
          <div className="settings-group">
            <label className="settings-label">Site Name</label>
            <input
              type="text"
              className="settings-input"
              value={settings.siteName || ''}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            />
          </div>
          <div className="settings-group">
            <label className="settings-label">Support Email</label>
            <input
              type="email"
              className="settings-input"
              value={settings.supportEmail || ''}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
          </div>
          <div className="settings-group">
            <label className="settings-label">Support Phone</label>
            <input
              type="text"
              className="settings-input"
              value={settings.supportPhone || ''}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
            />
          </div>
          <div className="settings-group">
            <label className="settings-label">Default Currency</label>
            <select
              className="settings-select"
              value={settings.defaultCurrency || 'PKR'}
              onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
            >
              <option value="PKR">PKR - Pakistani Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="settings-card">
          <h2 className="settings-card-title">✈️ Booking</h2>
          <div className="settings-group">
            <label className="settings-label">Max Advance Days</label>
            <input
              type="number"
              className="settings-input"
              value={settings.booking?.maxAdvanceDays || 365}
              onChange={(e) => handleChange('booking', 'maxAdvanceDays', parseInt(e.target.value) || 0)}
              min="1"
            />
            <small className="settings-help">How far ahead customers can book</small>
          </div>
          <div className="settings-group">
            <label className="settings-label">Cutoff Hours</label>
            <input
              type="number"
              className="settings-input"
              value={settings.booking?.cutoffHours || 2}
              onChange={(e) => handleChange('booking', 'cutoffHours', parseInt(e.target.value) || 0)}
              min="0"
            />
            <small className="settings-help">Hours before departure when booking closes</small>
          </div>
          <div className="settings-group">
            <label className="settings-label">Max Passengers Per Booking</label>
            <input
              type="number"
              className="settings-input"
              value={settings.booking?.maxPassengersPerBooking || 9}
              onChange={(e) => handleChange('booking', 'maxPassengersPerBooking', parseInt(e.target.value) || 1)}
              min="1"
              max="9"
            />
          </div>
          <div className="settings-group">
            <label className="settings-label">Tax Rate (%)</label>
            <input
              type="number"
              className="settings-input"
              value={settings.booking?.taxRatePercent || 0}
              onChange={(e) => handleChange('booking', 'taxRatePercent', parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          <div className="settings-group">
            <label className="settings-label">Service Fee</label>
            <input
              type="number"
              className="settings-input"
              value={settings.booking?.serviceFee || 0}
              onChange={(e) => handleChange('booking', 'serviceFee', parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        {/* Cancellation Settings */}
        <div className="settings-card">
          <h2 className="settings-card-title">↩️ Cancellation</h2>
          <div className="settings-group">
            <label className="settings-label">Cancellation Enabled</label>
            <div className="settings-toggle-wrapper">
              <button
                className={`settings-toggle ${settings.cancellation?.enabled ? 'active' : ''}`}
                onClick={() => handleChange('cancellation', 'enabled', !settings.cancellation?.enabled)}
              >
                {settings.cancellation?.enabled ? '✅ Enabled' : '❌ Disabled'}
              </button>
            </div>
          </div>
          <div className="settings-group">
            <label className="settings-label">Allowed Until Hours</label>
            <input
              type="number"
              className="settings-input"
              value={settings.cancellation?.allowedUntilHours || 24}
              onChange={(e) => handleChange('cancellation', 'allowedUntilHours', parseInt(e.target.value) || 0)}
              min="0"
            />
            <small className="settings-help">Hours before departure when cancellation is allowed</small>
          </div>
          <div className="settings-group">
            <label className="settings-label">Refund Percent</label>
            <input
              type="number"
              className="settings-input"
              value={settings.cancellation?.refundPercent || 80}
              onChange={(e) => handleChange('cancellation', 'refundPercent', parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
            />
            <small className="settings-help">Percentage of amount to refund</small>
          </div>
          <div className="settings-group">
            <label className="settings-label">Flat Fee</label>
            <input
              type="number"
              className="settings-input"
              value={settings.cancellation?.flatFee || 0}
              onChange={(e) => handleChange('cancellation', 'flatFee', parseFloat(e.target.value) || 0)}
              min="0"
            />
            <small className="settings-help">Fixed cancellation fee</small>
          </div>
        </div>

        {/* Maintenance */}
        <div className="settings-card">
          <h2 className="settings-card-title">🔧 Maintenance</h2>
          <div className="settings-group">
            <label className="settings-label">Maintenance Mode</label>
            <div className="settings-toggle-wrapper">
              <button
                className={`settings-toggle ${settings.maintenanceMode ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              >
                {settings.maintenanceMode ? '🔴 Enabled' : '🟢 Disabled'}
              </button>
            </div>
          </div>
          <div className="settings-group">
            <label className="settings-label">Maintenance Message</label>
            <textarea
              className="settings-textarea"
              value={settings.maintenanceMessage || ''}
              onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              rows="3"
              placeholder="Message to display during maintenance..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}