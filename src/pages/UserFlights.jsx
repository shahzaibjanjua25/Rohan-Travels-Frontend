// frontend/src/pages/UserFlights.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import flightService from '../services/flights';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import { date, time, money } from '../utils/format';
import { TRIP_TYPES, TRAVEL_TYPES, flightMatchesTravelType } from '../utils/constants';
import './UserFlights.css';

const FLIGHT_TYPES = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'international', label: 'International' },
];

const tripTypeMeta = (value) =>
  TRIP_TYPES.find((t) => t.value === value) || TRIP_TYPES[0];

const travelTypeLabel = (value) =>
  TRAVEL_TYPES.find((t) => t.value === value)?.label || value;

const STATUS_META = {
  scheduled: { label: 'Scheduled', color: '#3b82f6' },
  boarding: { label: 'Boarding', color: '#f59e0b' },
  departed: { label: 'Departed', color: '#10b981' },
  arrived: { label: 'Arrived', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#6b7280' },
  delayed: { label: 'Delayed', color: '#ef4444' },
};

/**
 * Describe the shape of an itinerary in one short line.
 */
const describeStops = (flight) => {
  if (flight.tripType === 'multi_city' && flight.segments?.length > 1) {
    const via = flight.segments
      .slice(0, -1)
      .map((s) => s.destination?.airportCode)
      .filter(Boolean);
    const noun = via.length === 1 ? 'stop' : 'stops';
    return `${via.length} ${noun} · via ${via.join(' · ')}`;
  }
  if (flight.tripType === 'round_trip' && flight.returnSegment) {
    return 'Round trip';
  }
  return 'Direct';
};

export default function UserFlights() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [flights, setFlights] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    flightType: '',
    travelType: searchParams.get('travelType') || '',
    tripType: searchParams.get('tripType') || '',
    minPrice: '',
    maxPrice: '',
  });

  // ------------------------------------------------------------------
  // Data
  // ------------------------------------------------------------------

  const loadFlights = async (overrides = {}) => {
    setLoading(true);
    setError('');

    const active = { ...filters, ...overrides };

    try {
      const params = { page, limit: 50, sort: 'route' };

      Object.entries(active).forEach(([key, value]) => {
        if (typeof value === 'string' ? value.trim() : value) {
          params[key] = typeof value === 'string' ? value.trim() : value;
        }
      });

      const response = await flightService.search(params);

      let data = [];
      let meta = null;

      if (Array.isArray(response?.data)) {
        data = response.data;
        meta = response.pagination || null;
      } else if (Array.isArray(response?.data?.data)) {
        data = response.data.data;
        meta = response.data.pagination || null;
      }

      // Filter by travel type if needed (including generic support)
      if (active.travelType) {
        data = data.filter(flight => flightMatchesTravelType(flight, active.travelType));
      }

      setFlights(data);
      setPagination(meta);
    } catch (err) {
      console.error('Error loading flights:', err);
      setError(err instanceof ApiError ? err.message : 'Could not load flights. Please try again.');
      setFlights([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Deep links from the home page tour cards arrive as ?travelType=umrah
  useEffect(() => {
    const travelType = searchParams.get('travelType') || '';
    const tripType = searchParams.get('tripType') || '';
    if (travelType !== filters.travelType || tripType !== filters.tripType) {
      setFilters((prev) => ({ ...prev, travelType, tripType }));
      setPage(1);
      loadFlights({ travelType, tripType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ------------------------------------------------------------------
  // Grouping - Group flights with same origin and destination
  // ------------------------------------------------------------------

  const routeGroups = useMemo(() => {
    const groups = new Map();

    flights.forEach((flight) => {
      const from = flight.origin?.airportCode || 'XXX';
      const to = flight.destination?.airportCode || 'XXX';
      const key = `${from}-${to}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          origin: flight.origin,
          destination: flight.destination,
          flights: [],
        });
      }
      groups.get(key).flights.push(flight);
    });

    const list = Array.from(groups.values());

    list.forEach((group) => {
      group.flights.sort(
        (a, b) => new Date(a.departureTime || 0) - new Date(b.departureTime || 0)
      );
      group.earliest = group.flights[0]?.departureTime || null;
      group.cheapest = group.flights.reduce((min, f) => {
        const p = f.cabins?.economy?.price;
        return p != null && (min == null || p < min) ? p : min;
      }, null);
      // Count trip types in this group
      group.tripTypeCounts = group.flights.reduce((acc, f) => {
        const type = f.tripType || 'one_way';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
    });

    return list.sort((a, b) => new Date(a.earliest || 0) - new Date(b.earliest || 0));
  }, [flights]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadFlights();
  };

  const handleResetFilters = () => {
    const cleared = {
      search: '',
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      flightType: '',
      travelType: '',
      tripType: '',
      minPrice: '',
      maxPrice: '',
    };
    setFilters(cleared);
    setPage(1);
    setSearchParams({});
    loadFlights(cleared);
  };

  const handleBookNow = (flightId) => navigate(`/flights/${flightId}/book`);

  const airportOptions = useMemo(() => {
    const origins = new Set();
    const destinations = new Set();
    flights.forEach((f) => {
      if (f.origin?.airportCode) origins.add(f.origin.airportCode);
      if (f.destination?.airportCode) destinations.add(f.destination.airportCode);
    });
    return {
      origins: Array.from(origins).sort(),
      destinations: Array.from(destinations).sort(),
    };
  }, [flights]);

  // Helper to get trip type icon
  const getTripTypeIcon = (tripType) => {
    const meta = tripTypeMeta(tripType);
    return meta.icon || '→';
  };

  // Helper to render return info for round trip
  const renderReturnInfo = (flight) => {
    if (flight.tripType === 'round_trip' && flight.returnSegment?.departureTime) {
      return (
        <span className="trip-return">
          returns {date(flight.returnSegment.departureTime)}
          {flight.returnSegment.departureTime && ` at ${time(flight.returnSegment.departureTime)}`}
        </span>
      );
    }
    return null;
  };

  // Helper to render multi-city stops
  const renderMultiCityStops = (flight) => {
    if (flight.tripType === 'multi_city' && flight.segments?.length > 1) {
      const stops = flight.segments.map((s, i) => (
        <span key={i} className="multi-city-stop">
          {s.origin?.airportCode || '?'} → {s.destination?.airportCode || '?'}
          {i < flight.segments.length - 1 && ' · '}
        </span>
      ));
      return <span className="multi-city-stops">{stops}</span>;
    }
    return null;
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const totalCount = pagination?.total ?? flights.length;

  return (
    <div className="user-flights-wrapper">
      <div className="flights-hero">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="flights-hero-image"
        />
        <div className="flights-hero-overlay">
          <h2>Find your route</h2>
          <p>One way, round trip, or a full multi-city itinerary</p>
        </div>
        <div className="flights-hero-badge">Best Price Guarantee</div>
      </div>

      <div className="user-flights-header">
        <div>
          <h1>Available Flights</h1>
          <p className="faint">Grouped by route — every departure on a route in one table</p>
          {(filters.travelType || filters.tripType) && (
            <span className="active-filter-badge">
              {filters.travelType && (
                <>
                  Purpose: <strong>{travelTypeLabel(filters.travelType)}</strong>
                  {filters.travelType !== 'generic' && ' (generic itineraries included)'}
                </>
              )}
              {filters.travelType && filters.tripType && ' · '}
              {filters.tripType && (
                <>
                  Trip: <strong>{tripTypeMeta(filters.tripType).label}</strong>
                </>
              )}
            </span>
          )}
        </div>
        <div className="flight-count">
          <span className="count-badge">
            {totalCount} flights · {routeGroups.length} routes
          </span>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {/* -------------------------------------------------- Filters */}
      <form onSubmit={handleFilterSubmit} className="user-flights-filters">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Airline, flight #, city..."
              className="field"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Trip Type</label>
            <select
              name="tripType"
              value={filters.tripType}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">All trip types</option>
              {TRIP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Travel Purpose</label>
            <select
              name="travelType"
              value={filters.travelType}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">All purposes</option>
              {TRAVEL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Flight Type</label>
            <select
              name="flightType"
              value={filters.flightType}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">All</option>
              {FLIGHT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Origin</label>
            <select
              name="origin"
              value={filters.origin}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">All origins</option>
              {airportOptions.origins.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Destination</label>
            <select
              name="destination"
              value={filters.destination}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">All destinations</option>
              {airportOptions.destinations.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Departure Date</label>
            <input
              type="date"
              name="departureDate"
              value={filters.departureDate}
              onChange={handleFilterChange}
              className="field"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Return Date</label>
            <input
              type="date"
              name="returnDate"
              value={filters.returnDate}
              onChange={handleFilterChange}
              className="field"
              disabled={filters.tripType === 'one_way' || filters.tripType === 'multi_city'}
            />
            <span className="filter-hint">Round trips only</span>
          </div>

          <div className="filter-group">
            <label className="filter-label">Min Price (PKR)</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="0"
              min="0"
              className="field"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Max Price (PKR)</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="100000"
              min="0"
              className="field"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button type="submit" className="btn btn--primary">
            Search
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleResetFilters}>
            Reset All
          </button>
        </div>
      </form>

      {/* -------------------------------------------------- Results */}
      {loading ? (
        <div className="center" style={{ padding: '4rem 0' }}>
          <Spinner label="Loading flights..." />
        </div>
      ) : routeGroups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✈️</div>
          <h3>No flights found</h3>
          <p className="faint">Try widening your filters or check back later.</p>
          <button className="btn btn--primary" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {routeGroups.map((group) => (
            <section className="route-group" key={group.key}>
              <header className="route-group__header">
                <div className="route-group__title">
                  <span className="route-group__endpoint">
                    <span className="route-group__city">{group.origin?.city || 'Unknown'}</span>
                    <span className="route-group__code">{group.origin?.airportCode || 'N/A'}</span>
                  </span>
                  <span className="route-group__arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="route-group__endpoint">
                    <span className="route-group__city">
                      {group.destination?.city || 'Unknown'}
                    </span>
                    <span className="route-group__code">
                      {group.destination?.airportCode || 'N/A'}
                    </span>
                  </span>
                </div>
                <div className="route-group__meta">
                  <span className="route-group__count">
                    {group.flights.length}{' '}
                    {group.flights.length === 1 ? 'departure' : 'departures'}
                  </span>
                  {group.cheapest != null && (
                    <span className="route-group__from">
                      from <strong>{money(group.cheapest, 'PKR')}</strong>
                    </span>
                  )}
                  {/* Show trip type counts */}
                  {Object.entries(group.tripTypeCounts).map(([type, count]) => (
                    <span key={type} className="route-group__trip-badge">
                      {tripTypeMeta(type).icon} {count}
                    </span>
                  ))}
                </div>
              </header>

              <div className="table-container">
                <table className="flights-table">
                  <thead>
                    <tr>
                      <th>Flight</th>
                      <th>Trip</th>
                      <th>Route Details</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>Purpose</th>
                      <th>Price</th>
                      <th>Seats</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.flights.map((flight) => {
                      const status = STATUS_META[flight.status] || STATUS_META.scheduled;
                      const trip = tripTypeMeta(flight.tripType);
                      const seats = flight.cabins?.economy?.availableSeats ?? 0;
                      const purposes = flight.travelTypes || [];
                      const isGeneric = purposes.includes('generic');

                      return (
                        <tr key={flight._id}>
                          <td data-label="Flight">
                            <div className="flight-cell">
                              <span className="flight-number">{flight.flightNumber}</span>
                              <span className="flight-airline">{flight.airline}</span>
                              {flight.aircraft && (
                                <span className="flight-aircraft">{flight.aircraft}</span>
                              )}
                            </div>
                          </td>

                          <td data-label="Trip">
                            <span className={`trip-badge trip-badge--${flight.tripType || 'one_way'}`}>
                              <span aria-hidden="true">{trip.icon}</span> {trip.label}
                            </span>
                            {renderReturnInfo(flight)}
                            {flight.tripType === 'multi_city' && (
                              <span className="multi-city-label">Multi-stop</span>
                            )}
                          </td>

                          <td data-label="Route Details">
                            <div className="route-details-cell">
                              {flight.tripType === 'multi_city' && flight.segments?.length > 1 ? (
                                <div className="multi-city-route">
                                  {flight.segments.map((s, i) => (
                                    <span key={i} className="segment">
                                      <span className="segment-code">{s.origin?.airportCode || '?'}</span>
                                      <span className="segment-arrow">→</span>
                                      <span className="segment-code">{s.destination?.airportCode || '?'}</span>
                                      {i < flight.segments.length - 1 && ' · '}
                                    </span>
                                  ))}
                                </div>
                              ) : flight.tripType === 'round_trip' ? (
                                <div className="round-trip-route">
                                  <span>{flight.origin?.airportCode || '?'} → {flight.destination?.airportCode || '?'}</span>
                                  <span className="return-arrow">↔</span>
                                  <span>{flight.destination?.airportCode || '?'} → {flight.origin?.airportCode || '?'}</span>
                                </div>
                              ) : (
                                <span className="direct-route">
                                  {flight.origin?.airportCode || '?'} → {flight.destination?.airportCode || '?'}
                                </span>
                              )}
                              <span className="stops-info">{describeStops(flight)}</span>
                            </div>
                          </td>

                          <td data-label="Departure">
                            <div className="time-cell">
                              <span className="time-value">
                                {flight.departureTime ? time(flight.departureTime) : '—'}
                              </span>
                              <span className="date-value">
                                {flight.departureTime ? date(flight.departureTime) : '—'}
                              </span>
                            </div>
                          </td>

                          <td data-label="Arrival">
                            <div className="time-cell">
                              <span className="time-value">
                                {flight.arrivalTime ? time(flight.arrivalTime) : '—'}
                              </span>
                              <span className="date-value">
                                {flight.arrivalTime ? date(flight.arrivalTime) : '—'}
                              </span>
                            </div>
                          </td>

                          <td data-label="Purpose">
                            <div className="travel-types">
                              {isGeneric ? (
                                <span className="travel-type-tag generic">All purposes</span>
                              ) : (
                                <>
                                  {purposes.slice(0, 2).map((t) => (
                                    <span key={t} className="travel-type-tag">
                                      {travelTypeLabel(t)}
                                    </span>
                                  ))}
                                  {purposes.length > 2 && (
                                    <span className="travel-type-tag more">
                                      +{purposes.length - 2}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>

                          <td data-label="Price">
                            <span className="price-value">
                              {money(flight.cabins?.economy?.price || 0, 'PKR')}
                            </span>
                          </td>

                          <td data-label="Seats">
                            <span className={`seats-value ${seats <= 5 ? 'low' : ''}`}>{seats}</span>
                          </td>

                          <td data-label="Status">
                            <span className="status-badge" style={{ backgroundColor: status.color }}>
                              {status.label}
                            </span>
                          </td>

                          <td data-label="Action">
                            {isAuthenticated ? (
                              <button
                                onClick={() => handleBookNow(flight._id)}
                                className="btn btn--primary btn--sm"
                                disabled={seats === 0}
                              >
                                {seats === 0 ? 'Full' : 'Book'}
                              </button>
                            ) : (
                              <Link
                                to="/login"
                                className="btn btn--primary btn--sm"
                                state={{ from: `/flights/${flight._id}/book` }}
                              >
                                Sign in
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          {pagination && pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}