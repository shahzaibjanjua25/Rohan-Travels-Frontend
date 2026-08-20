// frontend/src/pages/admin/AdminUmrahBookings.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { umrahService } from '../../services/umrah';
import { ApiError } from '../../services/api';
import { date, money, titleCase } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import './AdminUmrahBookings.css';

export default function AdminUmrahBookings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const statusFilter = searchParams.get('status') || '';
  const searchTerm = searchParams.get('search') || '';

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

  const handleSearch = (e) => {
    const value = e.target.value;
    const next = Object.fromEntries([...searchParams]);
    if (value) next.search = value;
    else delete next.search;
    delete next.page;
    setSearchParams(next);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (!confirm(`Change booking status to "${titleCase(newStatus)}"?`)) return;

    try {
      await umrahService.updateBookingStatus(bookingId, newStatus);
      setNotice(`Booking status updated to ${titleCase(newStatus)}.`);
      loadBookings();
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update status.');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await umrahService.cancelBooking(bookingId, 'Cancelled by admin');
      setNotice('Booking cancelled successfully.');
      loadBookings();
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel booking.');
    }
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
    return map[type] || type || 'N/A';
  };

  if (loading) {
    return (
      <div className="admin-umrah-bookings-wrapper">
        <div className="center" style={{ padding: '48px 0' }}>
          <Spinner label="Loading bookings..." />
        </div>
      </div>
    );
  }

  const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];

  return (
    <div className="admin-umrah-bookings-wrapper">
      <div className="admin-umrah-bookings-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Umrah Bookings</h1>
          <p className="faint">Manage all Umrah package bookings</p>
        </div>
        <div className="bookings-stats">
          <span className="stats-badge">
            {pagination?.total || bookings.length} bookings
          </span>
        </div>
      </div>

      {notice && <Alert kind="success">{notice}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      {/* Filters */}
      <div className="admin-umrah-filters">
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
        <div className="search-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search by reference or customer..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="search-btn" onClick={loadBookings}>
            🔍
          </button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🕋</div>
          <h3>No Umrah bookings found</h3>
          <p className="faint">Bookings will appear here once customers book Umrah packages.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-umrah-bookings-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Package</th>
                <th>Room Type</th>
                <th>Passengers</th>
                <th>Total</th>
                <th>Booking Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <span className="booking-ref">{booking.bookingReference}</span>
                  </td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{booking.customerDetails?.name || booking.user?.name || 'N/A'}</span>
                      <span className="customer-email">{booking.customerDetails?.email || booking.user?.email || ''}</span>
                    </div>
                  </td>
                  <td>
                    <div className="package-info">
                      <span className="package-name">{booking.package?.packageName?.substring(0, 25) || 'N/A'}</span>
                      <span className="package-flight">{booking.package?.airline || ''} {booking.package?.flightNumber || ''}</span>
                    </div>
                  </td>
                  <td>
                    <span className="room-type">{getRoomLabel(booking.roomType)}</span>
                  </td>
                  <td>
                    <span className="passenger-count">{booking.passengers?.length || 0}</span>
                  </td>
                  <td>
                    <span className="amount">{money(booking.pricing?.totalAmount || 0, booking.pricing?.currency || 'PKR')}</span>
                  </td>
                  <td>
                    <span className="booking-date-cell">{date(booking.createdAt)}</span>
                  </td>
                  <td>
                    <span className={`tag tag--${getStatusColor(booking.status)}`}>
                      {titleCase(booking.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <select
                        className="status-select"
                        value={booking.status}
                        onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                        disabled={booking.status === 'cancelled'}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {titleCase(s)}
                          </option>
                        ))}
                      </select>
                      <Link
                        to={`/umrah/bookings/${booking._id}`}
                        className="btn btn--primary btn--sm"
                      >
                        View
                      </Link>
                      {booking.status !== 'cancelled' && (
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => handleCancel(booking._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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