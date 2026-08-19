import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/misc';
import { ApiError } from '../../services/api';
import { date, time } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import './AdminNotifications.css';

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

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [deletingAll, setDeletingAll] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
     // console.log This is test debug code🔍 Fetching admin notifications...');
      
      const res = await notificationService.getAll();
      
     // console.log This is test debug code📦 Admin API Response:', res);
      
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
      
     // console.log This is test debug code📊 Loaded admin notifications:', data.length);
      setNotifications(data);
      setTotalUnread(unread);
      
    } catch (err) {
      console.error('❌ Failed to load admin notifications:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to load notifications.');
      setNotifications([]);
      setTotalUnread(0);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the correct booking link
  const getBookingLink = (notification) => {
    if (notification.link) {
      const cleanLink = notification.link.replace('/admin/bookings/', '/bookings/');
      return cleanLink;
    }
    if (notification.relatedBooking) {
      return `/bookings/${notification.relatedBooking}`;
    }
    return '#';
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAdminAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setTotalUnread(prev => Math.max(0, prev - 1));
      setError('');
    } catch (err) {
      // If API fails, update locally anyway
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setTotalUnread(prev => Math.max(0, prev - 1));
      setError('⚠️ Marked as read locally (server error)');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await notificationService.markAllAdminRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setTotalUnread(0);
      setError('');
    } catch (err) {
      // If API fails, update locally anyway
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setTotalUnread(0);
      setError('⚠️ Marked all as read locally (server error)');
      setTimeout(() => setError(''), 3000);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      setDeleting(id);
      await notificationService.deleteAdmin(id);
      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deleted && !deleted.isRead) {
        setTotalUnread(prev => Math.max(0, prev - 1));
      }
      setError('✅ Notification deleted successfully');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      // If API fails, delete locally anyway
      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deleted && !deleted.isRead) {
        setTotalUnread(prev => Math.max(0, prev - 1));
      }
      setError('⚠️ Deleted locally (server error)');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete ALL notifications? This cannot be undone!')) return;
    
    try {
      setDeletingAll(true);
      setError('');
      
     // console.log This is test debug code🗑️ Deleting all notifications...');
      await notificationService.deleteAllAdmin();
      
      setNotifications([]);
      setTotalUnread(0);
      setError('✅ All notifications deleted successfully!');
      setTimeout(() => setError(''), 3000);
      
    } catch (err) {
      console.error('❌ Error deleting all notifications:', err);
      
      // If API fails, clear locally anyway
      setNotifications([]);
      setTotalUnread(0);
      setError('⚠️ Cleared locally (server error)');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeletingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasNotifications = notifications.length > 0;

  if (loading) {
    return (
      <div className="admin-notifications-wrapper">
        <div className="center" style={{ padding: 'var(--space-8) 0' }}>
          <Spinner label="Loading notifications..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notifications-wrapper">
      {/* Header */}
      <div className="admin-notifications-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Notifications</h1>
          <p className="subtitle">
            All system notifications across all users
            {totalUnread > 0 && (
              <span style={{ 
                display: 'inline-block',
                marginLeft: 'var(--space-2)',
                padding: '2px 10px',
                background: 'var(--admin-primary-light)',
                color: 'var(--admin-primary)',
                borderRadius: 'var(--admin-radius-sm)',
                fontSize: 'var(--font-xs)',
                fontWeight: 600
              }}>
                {totalUnread} unread across all users
              </span>
            )}
          </p>
        </div>
        <div className="admin-notifications-actions">
          {hasNotifications && (
            <>
              <button
                className="btn btn--ghost btn--sm"
                onClick={handleMarkAllRead}
                disabled={markingAll || unreadCount === 0}
              >
                {markingAll ? 'Marking...' : `Mark all read (${unreadCount})`}
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={handleDeleteAll}
                disabled={deletingAll}
              >
                {deletingAll ? 'Deleting...' : '🗑️ Delete all'}
              </button>
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

      {/* Error/Success Alert */}
      {error && (
        <div className={`alert ${error.includes('✅') ? 'alert--success' : 'alert--error'}`}>
          <div className="alert__content">
            <span className="alert__icon">{error.includes('✅') ? '✅' : '⚠️'}</span>
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
            const user = notification.user || {};
            const bookingLink = getBookingLink(notification);

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
                      {user.name && (
                        <span className="notification-item__user">
                          👤 {user.name}
                          {user.role && (
                            <span className="notification-item__user-role">
                              ({user.role})
                            </span>
                          )}
                        </span>
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
                      to={bookingLink}
                      className="btn btn--primary btn--sm"
                    >
                      View Details
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