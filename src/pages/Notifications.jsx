import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/misc';
import { ApiError } from '../services/api';
import { date, time } from '../utils/format';
import Spinner from '../components/ui/Spinner';
import './Notifications.css';

// Notification Type Icons
const NOTIFICATION_ICONS = {
  booking: '📋',
  payment: '💳',
  flight: '✈️',
  user: '👤',
  system: '⚙️',
  default: '🔔'
};

// Notification Type Colors
const NOTIFICATION_COLORS = {
  booking: 'primary',
  payment: 'success',
  flight: 'info',
  user: 'warning',
  system: 'secondary',
  default: 'secondary'
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Fetch notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching user notifications...');
      
      // ✅ FIXED: Use getUserNotifications instead of list()
      const res = await notificationService.getUserNotifications();
      
      console.log('📦 API Response:', res);
      
      // Extract data from response
      let data = [];
      let unread = 0;
      
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        data = res.data.data;
        unread = res.data.unreadCount || 0;
      } else if (res.data && Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && res.data.notifications && Array.isArray(res.data.notifications)) {
        data = res.data.notifications;
        unread = res.data.unreadCount || 0;
      } else {
        data = [];
      }
      
      console.log('📊 Loaded notifications:', data.length);
      setNotifications(data);
      
    } catch (err) {
      console.error('❌ Failed to load notifications:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      // If API fails, update locally anyway
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setError('Failed to mark as read on server, but updated locally.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await notificationService.markAllRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setError('');
    } catch (err) {
      // If API fails, update locally anyway
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setError('Failed to mark all as read on server, but updated locally.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      setDeleting(id);
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      // If API fails, delete locally anyway
      setNotifications(prev => prev.filter(n => n._id !== id));
      setError('Failed to delete on server, but removed locally.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleting(null);
    }
  };

  // ✅ FIXED: Only delete READ notifications (using clearRead)
  const handleDeleteAllRead = async () => {
    const readCount = notifications.filter(n => n.isRead).length;
    if (readCount === 0) {
      setError('No read notifications to delete.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (!window.confirm(`Delete all ${readCount} read notifications?`)) return;
    
    try {
      await notificationService.clearRead();
      setNotifications(prev => prev.filter(n => !n.isRead));
      setError(`✅ ${readCount} read notifications deleted successfully!`);
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      // If API fails, clear locally anyway
      setNotifications(prev => prev.filter(n => !n.isRead));
      setError('Failed to delete on server, but cleared locally.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;
  const hasNotifications = notifications.length > 0;

  if (loading) {
    return (
      <div className="notifications-wrapper">
        <div className="center" style={{ padding: 'var(--space-8) 0' }}>
          <Spinner label="Loading notifications..." />
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-wrapper">
      {/* Header */}
      <div className="notifications-header">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1>Notifications</h1>
          <p className="subtitle">
            {unreadCount > 0 
              ? `${unreadCount} unread notifications` 
              : 'All caught up!'}
          </p>
        </div>
        <div className="notifications-actions">
          {hasNotifications && (
            <>
              <button
                className="btn btn--ghost btn--sm"
                onClick={handleMarkAllRead}
                disabled={markingAll || unreadCount === 0}
              >
                {markingAll ? 'Marking...' : `Mark all read (${unreadCount})`}
              </button>
              {readCount > 0 && (
                <button
                  className="btn btn--danger btn--sm"
                  onClick={handleDeleteAllRead}
                >
                  Delete read ({readCount})
                </button>
              )}
            </>
          )}
          <button
            className="btn btn--primary btn--sm"
            onClick={loadNotifications}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={`alert ${error.includes('successfully') ? 'alert--success' : 'alert--error'}`}>
          <div className="alert__content">
            <span className="alert__icon">{error.includes('successfully') ? '✅' : '⚠️'}</span>
            <span className="alert__message">{error}</span>
            <button 
              className="alert__close"
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {!hasNotifications ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>No notifications</h3>
          <p className="faint">All caught up! No notifications to display.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => {
            const icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default;
            const color = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default;
            const isRead = notification.isRead;

            return (
              <div
                key={notification._id}
                className={`notification-item ${isRead ? 'notification-item--read' : 'notification-item--unread'}`}
              >
                <div className="notification-item__icon">
                  <span className={`notification-item__icon-${color}`}>
                    {icon}
                  </span>
                </div>
                <div className="notification-item__content">
                  <div className="notification-item__header">
                    <div className="notification-item__title">
                      <span className="notification-item__type">
                        {notification.type?.toUpperCase() || 'SYSTEM'}
                      </span>
                      <span className="notification-item__subject">
                        {notification.title || notification.subject || 'Notification'}
                      </span>
                    </div>
                    <div className="notification-item__meta">
                      {!isRead && (
                        <span className="badge badge--primary">New</span>
                      )}
                      <span className="notification-item__time">
                        {date(notification.createdAt)} {time(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="notification-item__message">
                    {notification.message || notification.body || 'No message content'}
                  </div>
                  <div className="notification-item__actions">
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleMarkAsRead(notification._id)}
                      disabled={isRead}
                    >
                      {isRead ? '✅ Read' : 'Mark read'}
                    </button>
                    <Link
                      to={notification.link || '#'}
                      className="btn btn--primary btn--sm"
                    >
                      View
                    </Link>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDelete(notification._id)}
                      disabled={deleting === notification._id}
                    >
                      {deleting === notification._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}