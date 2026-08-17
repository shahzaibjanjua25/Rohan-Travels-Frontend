import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookingService } from '../../services/bookings';
import { ApiError } from '../../services/api';
import { date, money, plural, time, titleCase } from '../../utils/format';
import './AdminBookings.css';

// Status options
const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

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

export default function AdminBookings() {
  console.log('🔴🔴🔴 AdminBookings component MOUNTED');
  
  const [params, setParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  console.log('🔴 State initialized:', { loading, bookings: bookings.length, error });

  const statusFilter = params.get('status') || '';
  const searchTerm = params.get('search') || '';

  console.log('🔴 URL params:', { statusFilter, searchTerm });

  useEffect(() => {
    console.log('🔴🔴🔴 useEffect TRIGGERED');
    let cancelled = false;
    setLoading(true);
    setDebugInfo('Loading bookings...');

    const queryParams = Object.fromEntries([...params].filter(([, v]) => v !== ''));
    console.log('📌 Loading admin bookings with params:', queryParams);

    bookingService
      .list(queryParams)
      .then((res) => {
        console.log('🔴🔴🔴 API SUCCESS - Raw response:', res);
        if (cancelled) return;
        
        console.log('🔴 Response structure:', {
          hasData: !!res.data,
          dataKeys: res.data ? Object.keys(res.data) : 'no data',
          dataType: typeof res.data,
          isArray: Array.isArray(res.data),
        });
        
        // Try different ways to extract data
        let bookingsData = [];
        let paginationData = null;
        
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          console.log('🔴 Using res.data.data (nested)');
          bookingsData = res.data.data;
          paginationData = res.data.pagination || null;
        } else if (res.data && Array.isArray(res.data)) {
          console.log('🔴 Using res.data (direct array)');
          bookingsData = res.data;
        } else if (res.data && res.data.bookings && Array.isArray(res.data.bookings)) {
          console.log('🔴 Using res.data.bookings');
          bookingsData = res.data.bookings;
          paginationData = res.data.pagination || null;
        } else {
          console.log('🔴 No data found, using empty array');
          bookingsData = [];
        }
        
        console.log('🔴 Extracted bookings:', bookingsData.length);
        console.log('🔴 First booking sample:', bookingsData[0]);
        
        setBookings(bookingsData);
        setPagination(paginationData);
        setError('');
        setDebugInfo(`Loaded ${bookingsData.length} bookings`);
      })
      .catch((err) => {
        console.error('🔴🔴🔴 API ERROR:', err);
        if (!cancelled) {
          const errorMsg = err instanceof ApiError ? err.message : 'Could not load bookings.';
          setError(errorMsg);
          setDebugInfo(`Error: ${errorMsg}`);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          console.log('🔴 Loading complete');
        }
      });

    return () => {
      console.log('🔴 Cleanup: cancelled = true');
      cancelled = true;
    };
  }, [params]);

  const setFilter = (status) => {
    console.log('🔴 Setting filter:', status);
    const next = Object.fromEntries([...params]);
    if (status) next.status = status;
    else delete next.status;
    delete next.page;
    setParams(next);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    console.log('🔴 Searching:', value);
    const next = Object.fromEntries([...params]);
    if (value) next.search = value;
    else delete next.search;
    delete next.page;
    setParams(next);
  };

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('🔴 Search submitted:', searchTerm);
    // The search is already applied via the handleSearch onChange
    // Just refresh the data
    const queryParams = Object.fromEntries([...params].filter(([, v]) => v !== ''));
    bookingService.list(queryParams)
      .then((res) => {
        let bookingsData = [];
        let paginationData = null;
        
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          bookingsData = res.data.data;
          paginationData = res.data.pagination || null;
        } else if (res.data && Array.isArray(res.data)) {
          bookingsData = res.data;
        } else if (res.data && res.data.bookings && Array.isArray(res.data.bookings)) {
          bookingsData = res.data.bookings;
          paginationData = res.data.pagination || null;
        }
        
        setBookings(bookingsData);
        setPagination(paginationData);
        setError('');
        setDebugInfo(`Loaded ${bookingsData.length} bookings`);
      })
      .catch((err) => {
        const errorMsg = err instanceof ApiError ? err.message : 'Could not load bookings.';
        setError(errorMsg);
        setDebugInfo(`Error: ${errorMsg}`);
      });
  };

  const goToPage = (page) => {
    console.log('🔴 Going to page:', page);
    const next = Object.fromEntries([...params]);
    next.page = page;
    setParams(next);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    console.log('🔴 Status update:', { bookingId, newStatus });
    if (!window.confirm(`Change booking status to "${titleCase(newStatus)}"?`)) return;
    
    try {
      if (newStatus === 'confirmed') {
        await bookingService.markPaid(bookingId, {
          paymentMethod: 'system',
          transactionId: `ADMIN-${Date.now()}`
        });
      } else {
        await bookingService.updateStatus(bookingId, newStatus);
      }
      
      // Refresh the list
      const queryParams = Object.fromEntries([...params].filter(([, v]) => v !== ''));
      const res = await bookingService.list(queryParams);
      setBookings(res.data?.data || []);
      setPagination(res.data?.pagination || null);
      
    } catch (err) {
      console.error('❌ Error updating status:', err);
      setError(err instanceof ApiError ? err.message : 'Could not update booking status.');
      setTimeout(() => setError(''), 5000);
    }
  };

  // TRY-CATCH around the entire render
  try {
    console.log('🔴 Rendering AdminBookings, loading:', loading);
    
    if (loading) {
      console.log('🔴 Showing loading spinner');
      return (
        <div className="admin-bookings-wrapper">
          <div className="center" style={{ padding: '48px 0' }}>
            <div className="spinner">Loading bookings...</div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
              {debugInfo}
            </div>
          </div>
        </div>
      );
    }

    console.log('🔴 Rendering main content, bookings length:', bookings.length);

    return (
      <div className="admin-bookings-wrapper">
        <div className="admin-bookings-header">
          <div>
            <p className="eyebrow">Administration</p>
            <h1>All Bookings</h1>
            <p className="faint">Manage all bookings across the system</p>
          </div>
          <div className="bookings-stats">
            {pagination && (
              <span className="stats-badge">
                {pagination.total || bookings.length} bookings
              </span>
            )}
          </div>
        </div>

        {/* Status Filters and Search - Combined */}
        <div className="admin-bookings-filters">
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
          
          <form className="search-group" onSubmit={handleSearchSubmit}>
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search by reference or customer..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="alert alert--error">
            <div className="alert__content">
              <span className="alert__icon">⚠️</span>
              <span className="alert__message">{error}</span>
              <button className="alert__close" onClick={() => setError('')}>×</button>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No bookings found</h3>
            <p className="faint">
              {statusFilter ? `No bookings with status "${statusFilter}" found.` : 'No bookings have been created yet.'}
            </p>
            {statusFilter && (
              <button className="btn btn--ghost" onClick={() => setFilter('')}>
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <div className="admin-bookings-table-container">
            <div className="table__scroll">
              <table className="admin-bookings-table">
                <thead>
                  <tr>
                    <th>Booking Reference</th>
                    <th>Customer</th>
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
                  {bookings.map((b, index) => {
                    console.log(`🔴 Rendering booking ${index}:`, b._id);
                    return (
                      <tr key={b._id || index}>
                        <td>
                          <span className="booking-ref">{b.bookingReference || 'N/A'}</span>
                          <span className="booking-date">
                            {b.createdAt ? date(b.createdAt) : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="customer-info">
                            <span className="customer-name">
                              {b.customerDetails?.name || b.user?.name || 'N/A'}
                            </span>
                            <span className="customer-email">
                              {b.customerDetails?.email || b.user?.email || ''}
                            </span>
                          </div>
                        </td>
                        <td>
                          {b.flight ? (
                            <div className="flight-info">
                              <span className="airline-name">{b.flight.airline || 'N/A'}</span>
                              <span className="flight-number">{b.flight.flightNumber || 'N/A'}</span>
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
                              <span className="departure-date">{b.flight.departureTime ? date(b.flight.departureTime) : 'N/A'}</span>
                              <span className="departure-time">{b.flight.departureTime ? time(b.flight.departureTime) : ''}</span>
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
                          <span className={`tag tag--${b.status || 'pending'}`}>
                            {titleCase(b.status || 'pending')}
                          </span>
                        </td>
                        <td>
                          <div className="action-group">
                            <select
                              value={b.status || 'pending'}
                              onChange={(e) => handleStatusUpdate(b._id, e.target.value)}
                              className="status-select"
                            >
                              {BOOKING_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {titleCase(status)}
                                </option>
                              ))}
                            </select>
                            <Link 
                              to={`/bookings/${b._id}`} 
                              className="btn btn--sm btn--primary"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    );
  } catch (renderError) {
    console.error('🔴🔴🔴 RENDER ERROR:', renderError);
    console.error('🔴 Error stack:', renderError.stack);
    return (
      <div className="admin-bookings-wrapper" style={{ padding: '48px', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>❌ Component Render Error</h2>
        <p style={{ color: '#666' }}>{renderError.message}</p>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '8px',
          textAlign: 'left',
          fontSize: '12px',
          overflow: 'auto',
          maxHeight: '300px'
        }}>
          {renderError.stack}
        </pre>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn--primary"
          style={{ marginTop: '16px' }}
        >
          Refresh Page
        </button>
      </div>
    );
  }
}