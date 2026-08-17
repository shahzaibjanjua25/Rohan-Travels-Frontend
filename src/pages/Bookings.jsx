//user booking
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import bookingService from '../services/bookings';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BOOKING_STATUSES } from '../utils/constants';
import { date, money, plural, time, titleCase } from '../utils/format';
import Tag from '../components/ui/Tag';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import './Bookings.css';

export default function Bookings() {
  const [params, setParams] = useSearchParams();
  const { isAdmin } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusFilter = params.get('status') || '';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    bookingService
      .list(Object.fromEntries([...params].filter(([, v]) => v !== '')))
      .then((res) => {
        if (cancelled) return;
        setBookings(res.data);
        setPagination(res.pagination);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load bookings.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  const setFilter = (status) => {
    const next = Object.fromEntries([...params]);
    if (status) next.status = status;
    else delete next.status;
    delete next.page;
    setParams(next);
  };

  const goToPage = (page) => setParams({ ...Object.fromEntries([...params]), page });

  // Helper to get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info',
    };
    return colors[status] || 'secondary';
  };

  return (
    <div className="bookings-wrapper">
      <div className="bookings-header">
        <div>
          <p className="eyebrow">{isAdmin ? 'All bookings' : 'Your trips'}</p>
          <h1>Bookings</h1>
          <p className="faint">
            {isAdmin ? 'Manage all bookings across the system' : 'View and manage your flight bookings'}
          </p>
        </div>
        <div className="bookings-stats">
          {pagination && (
            <span className="stats-badge">
              {pagination.total || bookings.length} bookings
            </span>
          )}
        </div>
      </div>

      {/* Status Filters */}
      <div className="bookings-filters">
        <div className="filter-buttons">
          <button
            className={`btn btn--sm ${!statusFilter ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setFilter('')}
          >
            All
          </button>
          {BOOKING_STATUSES.map((s) => (
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

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <div className="center" style={{ padding: 'var(--s-8) 0' }}>
          <Spinner label="Loading bookings" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="When you hold a flight it will appear here with its reference and status."
          action={
            <Link className="btn btn--primary" to="/flights">
              Search flights
            </Link>
          }
        />
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking Reference</th>
                <th>Flight</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Passengers</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <span className="booking-ref">{b.bookingReference}</span>
                    <span className="booking-date">
                      {date(b.createdAt)}
                    </span>
                  </td>
                  <td>
                    {b.flight ? (
                      <div className="flight-info">
                        <span className="airline-name">{b.flight.airline}</span>
                        <span className="flight-number">{b.flight.flightNumber}</span>
                      </div>
                    ) : (
                      <span className="muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {b.flight ? (
                      <div className="route-info">
                        <span className="origin-code">{b.flight.origin?.airportCode || 'N/A'}</span>
                        <span className="route-arrow">→</span>
                        <span className="dest-code">{b.flight.destination?.airportCode || 'N/A'}</span>
                      </div>
                    ) : (
                      <span className="muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {b.flight ? (
                      <div className="departure-info">
                        <span className="departure-date">{date(b.flight.departureTime)}</span>
                        <span className="departure-time">{time(b.flight.departureTime)}</span>
                      </div>
                    ) : (
                      <span className="muted">N/A</span>
                    )}
                  </td>
                  <td>
                    <span className="passenger-count">
                      {plural(b.passengers?.length || 0, 'traveller')}
                    </span>
                  </td>
                  <td>
                    <span className="booking-amount">
                      {money(b.pricing?.totalAmount || 0, b.pricing?.currency || 'PKR')}
                    </span>
                  </td>
                  <td>
                    <Tag status={getStatusColor(b.status)}>
                      {titleCase(b.status)}
                    </Tag>
                  </td>
                  <td>
                    <Link 
                      to={`/bookings/${b._id}`} 
                      className="btn btn--sm btn--primary"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={pagination} onChange={goToPage} />
    </div>
  );
}