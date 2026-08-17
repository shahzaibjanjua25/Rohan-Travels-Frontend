import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/misc';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { date, money, plural, time } from '../utils/format';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import Tag from '../components/ui/Tag';
import './Dashboard.css';

// Period options
const PERIODS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'ytd', label: 'Year' },
];

// Stat Card Component
function StatCard({
  label,
  value,
  note,
  icon,
  type = 'primary',
  valuePrefix = '',
  valueSuffix = ''
}) {
  return (
    <div className={`stat-card stat-card--${type}`}>
      <div className="stat-card__top">
        <div className={`stat-card__icon stat-card__icon--${type}`}>
          {icon}
        </div>
      </div>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">
        {valuePrefix}{value}{valueSuffix}
      </span>
      {note && (
        <div className="stat-card__note">
          <span className="note-dot"></span>
          {note}
        </div>
      )}
    </div>
  );
}

// Daily Bars Chart Component
function DailyBars({ series, currency = 'PKR' }) {
  if (!series || !Array.isArray(series) || series.length === 0) {
    return (
      <div className="flex-center" style={{ height: '140px' }}>
        <span className="faint">No revenue data available</span>
      </div>
    );
  }

  const max = Math.max(...series.map((d) => d.amount || 0), 1);

  return (
    <div className="chart-container">
      <div className="chart-bars">
        {series.map((d, index) => {
          const height = Math.max(((d.amount || 0) / max) * 100, 1);
          const isPositive = (d.amount || 0) >= 0;

          return (
            <div key={d.date || index} className="chart-bar-wrapper">
              <div
                className={`chart-bar ${isPositive ? 'chart-bar--positive' : 'chart-bar--negative'}`}
                style={{ height: `${height}%` }}
              >
                <div className="chart-bar__tooltip">
                  {d.date}: {money(d.amount || 0, currency)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chart-labels">
        <span className="faint">{series[0]?.date || 'Start'}</span>
        <span className="faint">{series[series.length - 1]?.date || 'End'}</span>
      </div>
    </div>
  );
}

// Route Item Component
function RouteItem({ rank, route, bookings, revenue, currency = 'PKR' }) {
  const rankClasses = {
    1: 'route-item__rank--gold',
    2: 'route-item__rank--silver',
    3: 'route-item__rank--bronze',
  };

  return (
    <div className="route-item">
      <div className="flex" style={{ alignItems: 'center', flex: 1 }}>
        <span className={`route-item__rank ${rankClasses[rank] || ''}`}>
          {rank}
        </span>
        <span className="route-item__name">
          {route}
        </span>
      </div>
      <div className="route-item__stats">
        <span className="route-item__count">{plural(bookings, 'booking')}</span>
        <span className="route-item__revenue">{money(revenue, currency)}</span>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Define gradient once
  const headerGradient = 'linear-gradient(135deg, #0a2463 0%, #1a4a8a 50%, #2a6aaa 100%)';
  const headerStyle = {
    background: headerGradient,
    color: '#ffffff',
    padding: '16px 20px',
    fontWeight: 700,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: '2px solid rgba(255,255,255,0.15)',
    whiteSpace: 'nowrap',
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const calls = [dashboardService.get({ period })];
    if (isAdmin) calls.push(dashboardService.revenue({ period }));

    Promise.all(calls)
      .then(([summary, series]) => {
        if (cancelled) return;
        setData(summary.data);
        if (series) setRevenue(series.data);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load the dashboard.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, isAdmin]);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="center" style={{ padding: 'var(--space-8) 0' }}>
          <Spinner label="Loading dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <Alert kind="error">{error}</Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-wrapper">
        <Alert kind="error">No data available</Alert>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">
            {isAdmin ? 'Operations' : `Hello, ${user?.name?.split(' ')[0] || 'Traveler'}`}
          </p>
          <h1>{isAdmin ? 'Overview' : 'My travel'}</h1>
        </div>
        <div className="period-selector">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`btn ${period === p.value ? 'btn--active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isAdmin ? (
        // ============================================
        // ADMIN DASHBOARD
        // ============================================
        <>
          {/* Stats Grid */}
          <div className="grid grid--4">
            <StatCard
              label="Net Revenue"
              value={data.revenue?.net || 0}
              icon="💰"
              type="primary"
              note={`${money(data.revenue?.gross || 0, 'PKR')} collected · ${money(data.revenue?.refunded || 0, 'PKR')} refunded`}
            />
            <StatCard
              label="Total Bookings"
              value={data.bookings?.total || 0}
              icon="📋"
              type="success"
              note={`${data.bookings?.confirmed || 0} confirmed`}
            />
            <StatCard
              label="Cancellation Rate"
              value={`${data.bookings?.cancellationRate || 0}`}
              suffix="%"
              icon="📊"
              type="warning"
              note={`${data.bookings?.cancelled || 0} cancelled`}  // ✅ This works
            />
            <StatCard
              label="Active Users"
              value={data.users?.total || 0}
              icon="👥"
              type="info"
              note={`${data.users?.customers || 0} customers`}
            />
          </div>

          {/* Revenue Chart */}
          {revenue && revenue.length > 0 && (
            <div className="card">
              <div className="row row--between row--wrap" style={{ marginBottom: 'var(--space-5)' }}>
                <div>
                  <h2 style={{ marginBottom: 'var(--space-1)' }}>Daily Net Revenue</h2>
                  <span className="faint" style={{ fontSize: 'var(--font-sm)' }}>
                    {revenue.length} days • {money(revenue.reduce((sum, d) => sum + (d.amount || 0), 0), 'PKR')} total
                  </span>
                </div>
                <span className="mono" style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>
                  {money(revenue.reduce((sum, d) => sum + (d.amount || 0), 0), 'PKR')}
                </span>
              </div>
              <DailyBars series={revenue} currency="PKR" />
            </div>
          )}

          {/* Grid Cards */}
          <div className="grid grid--2">
            {/* Top Routes */}
            <div className="card">
              <div className="row row--between" style={{ marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, margin: 0 }}>
                  🌍 Busiest Routes
                </h3>
                <span className="badge badge--primary">
                  {data.topRoutes?.length || 0} routes
                </span>
              </div>
              {!data.topRoutes || data.topRoutes.length === 0 ? (
                <p className="faint">No bookings in this period.</p>
              ) : (
                data.topRoutes.map((r, index) => (
                  <RouteItem
                    key={r.route || index}
                    rank={index + 1}
                    route={r.route}
                    bookings={r.bookings}
                    revenue={r.revenue || 0}
                    currency="PKR"
                  />
                ))
              )}
            </div>

            {/* Fleet Status */}
            <div className="card">
              <div className="row row--between" style={{ marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, margin: 0 }}>
                  ✈️ Fleet Status
                </h3>
                <span className="badge badge--primary">
                  {data.flights?.total || 0} total
                </span>
              </div>
              <div className="grid grid--2" style={{ gap: 'var(--space-3)' }}>
                <StatCard
                  label="Scheduled"
                  value={data.flights?.scheduled || 0}
                  icon="🟢"
                  type="success"
                />
                <StatCard
                  label="Cancelled"
                  value={data.flights?.cancelled || 0}
                  icon="🔴"
                  type="danger"
                />
                <StatCard
                  label="Departed"
                  value={data.flights?.departed || 0}
                  icon="🟡"
                  type="warning"
                />
                <StatCard
                  label="Arrived"
                  value={data.flights?.arrived || 0}
                  icon="🔵"
                  type="info"
                />
              </div>
            </div>
          </div>

          {/* Recent Bookings Table - WITH INLINE STYLES */}
          <div className="card card--flush">
            <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--dash-border-light)' }}>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, margin: 0 }}>
                📋 Recent Bookings
              </h3>
            </div>
            <div className="table__scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{
                      ...headerStyle,
                      paddingLeft: '24px',
                      borderRadius: '8px 0 0 0'
                    }}>
                      Reference
                    </th>
                    <th style={headerStyle}>
                      Customer
                    </th>
                    <th style={headerStyle}>
                      Route
                    </th>
                    <th style={{
                      ...headerStyle,
                      textAlign: 'right',
                      paddingRight: '24px',
                      borderRadius: '0 8px 0 0'
                    }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings && data.recentBookings.length > 0 ? (
                    data.recentBookings.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <Link
                            className="booking-ref"
                            to={`/bookings/${b._id}`}
                          >
                            {b.bookingReference}
                          </Link>
                        </td>
                        <td>
                          <div className="customer-info">
                            <div className="customer-name">{b.user?.name || b.customerDetails?.name || '—'}</div>
                            <div className="customer-email">{b.user?.email || b.customerDetails?.email || ''}</div>
                          </div>
                        </td>
                        <td className="mono">
                          {b.flight
                            ? `${b.flight.origin?.airportCode || 'N/A'} → ${b.flight.destination?.airportCode || 'N/A'}`
                            : '—'
                          }
                        </td>
                        <td className="right">
                          <span className="amount">
                            {money(b.pricing?.totalAmount || 0, 'PKR')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="center faint" style={{ padding: 'var(--space-6)' }}>
                        No recent bookings
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        // ============================================
        // USER DASHBOARD
        // ============================================
        <>
          {/* Stats Grid */}
          <div className="grid grid--4">
            <StatCard
              label="Trips Booked"
              value={data.bookings?.total || 0}
              icon="✈️"
              type="primary"
              note={`${data.bookings?.confirmed || 0} confirmed`}
            />
            <StatCard
              label="Total Spent"
              value={data.spendInPeriod?.amount || 0}
              prefix="PKR "
              icon="💳"
              type="success"
              note={`across ${plural(data.spendInPeriod?.bookings || 0, 'booking')}`}
            />
            <StatCard
              label="Account Balance"
              value={data.accountBalance || 0}
              prefix="PKR "
              icon="💰"
              type="info"
            />
            <StatCard
              label="Unread Notices"
              value={data.unreadNotifications || 0}
              icon="🔔"
              type="warning"
              note={data.unreadNotifications > 0 ? 'You have new notifications' : 'All caught up'}
            />
          </div>

          {/* Upcoming Trips */}
          <div className="card">
            <div className="row row--between" style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, margin: 0 }}>
                📅 Upcoming Trips
              </h3>
              <span className="badge badge--primary">
                {data.upcomingTrips?.length || 0} trips
              </span>
            </div>
            {!data.upcomingTrips || data.upcomingTrips.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🧳</div>
                <h3>No upcoming trips</h3>
                <p className="faint">Nothing booked yet. Find your next adventure!</p>
                <Link to="/flights" className="btn btn--primary">
                  ✈️ Search Flights
                </Link>
              </div>
            ) : (
              <div className="stack">
                {data.upcomingTrips.map((b) => (
                  <Link
                    key={b._id}
                    to={`/bookings/${b._id}`}
                    className="row row--between"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      padding: 'var(--space-3) var(--space-4)',
                      borderBottom: '1px solid var(--dash-border-light)',
                      transition: 'all var(--transition-base)',
                      borderRadius: 'var(--dash-radius-md)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--dash-bg-tertiary)';
                      e.currentTarget.style.paddingLeft = 'var(--space-5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.paddingLeft = 'var(--space-4)';
                    }}
                  >
                    <div className="row" style={{ gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                      <span className="mono" style={{ fontWeight: 600, padding: '2px 10px', background: 'var(--dash-primary-light)', borderRadius: 'var(--dash-radius-sm)' }}>
                        {b.flight?.flightNumber || 'N/A'}
                      </span>
                      <span className="faint">
                        {b.flight?.origin?.airportCode || 'N/A'}
                        <span style={{ color: 'var(--dash-secondary)', margin: '0 4px' }}>→</span>
                        {b.flight?.destination?.airportCode || 'N/A'}
                      </span>
                      <span className="mono" style={{ fontSize: 'var(--font-sm)' }}>
                        {b.flight?.departureTime
                          ? `${date(b.flight.departureTime)} ${time(b.flight.departureTime)}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <Tag status={b.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}