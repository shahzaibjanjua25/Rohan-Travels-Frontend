// frontend/src/pages/UmrahBookings.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { umrahService } from '../services/umrah';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { date, money, titleCase } from '../utils/format';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import './UmrahBookings.css';

export default function UmrahBookings() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    loadBookings();
  }, [searchParams]);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries([...searchParams]);
      const response = await umrahService.getBookings(params);
      setBookings(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (status) => {
    const next = Object.fromEntries([...searchParams]);
    if (status) next.status = status;
    else delete next.status;
    delete next.page;
    setSearchParams(next);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info'
    };
    return colors[status] || 'secondary';
  };

  const getRoomLabel = (type) => {
    const map = { quad: 'Quad', triple: 'Triple', double: 'Double' };
    return map[type] || type;
  };

  if (loading) {
    return (
      <div className="umrah-bookings-wrapper">
        <div className="center" style={{ padding: '48px 0' }}>
          <Spinner label="Loading bookings..." />
        </div>
      </div>
    );
  }

  const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];

  return (
    <div className="umrah-bookings-wrapper">
      <div className="umrah-bookings-header">
        <div>
          <p className="eyebrow">My Bookings</p>
          <h1>Umrah Bookings</h1>
          <p className="faint">View and manage your Umrah package bookings</p>
        </div>
        <div className="bookings-stats">
          <span className="stats-badge">
            {pagination?.total || bookings.length} bookings
          </span>
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {/* Status Filters */}
      <div className="bookings-filters">
        <div className="filter-buttons">
          <button
            className={`btn btn--sm ${!statusFilter ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setFilter('')}
          >
            All
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              className={`btn btn--sm ${statusFilter === s ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setFilter(s)}
            >
              {titleCase(s)}
            </button>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🕋</div>
          <h3>No Umrah bookings yet</h3>
          <p className="faint">Book your Umrah package to start your spiritual journey.</p>
          <Link to="/umrah" className="btn btn--gold">
            Browse Umrah Packages
          </Link>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card-header">
                <div>
                  <span className="booking-ref">{booking.bookingReference}</span>
                  <span className="booking-date">{date(booking.createdAt)}</span>
                </div>
                <span className={`tag tag--${getStatusColor(booking.status)}`}>
                  {titleCase(booking.status)}
                </span>
              </div>

              <div className="booking-package">
                <h3>{booking.package?.packageName || 'N/A'}</h3>
                <div className="package-meta">
                  <span>{booking.package?.airline || 'N/A'}</span>
                  <span>{booking.package?.flightNumber || 'N/A'}</span>
                </div>
                <div className="package-route">
                  <span>{booking.package?.origin?.city || 'N/A'}</span>
                  <span className="arrow">→</span>
                  <span>{booking.package?.destination?.city || 'N/A'}</span>
                  <span className="date">{date(booking.package?.departureDate)}</span>
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <span className="label">Room Type</span>
                  <span className="value">{getRoomLabel(booking.roomType)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Passengers</span>
                  <span className="value">{booking.passengers?.length || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Amount</span>
                  <span className="value price">
                    {money(booking.pricing?.totalAmount || 0, booking.pricing?.currency || 'PKR')}
                  </span>
                </div>
              </div>

              <div className="booking-actions">
                <Link
                  to={`/umrah/bookings/${booking._id}`}
                  className="btn btn--primary btn--sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}