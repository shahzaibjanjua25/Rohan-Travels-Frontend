import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import flightService from '../services/flights';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import { date, time, money } from '../utils/format';
import './UserFlights.css';

// Travel Types for filter
const TRAVEL_TYPES = [
  { value: 'tour', label: 'Tour' },
  { value: 'work_visa', label: 'Work Visa' },
  { value: 'study_visa', label: 'Study Visa' },
  { value: 'umrah', label: 'Umrah' },
  { value: 'hajj', label: 'Hajj' },
  { value: 'business', label: 'Business' },
  { value: 'family', label: 'Family Visit' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];

// Flight Types for filter
const FLIGHT_TYPES = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'international', label: 'International' },
];

export default function UserFlights() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTravelType = searchParams.get('travelType') || '';

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
    flightType: '',
    travelType: initialTravelType,
    minPrice: '',
    maxPrice: '',
  });

  // Get unique origins and destinations from flights for filter dropdowns
  const airportOptions = useMemo(() => {
    const origins = new Set();
    const destinations = new Set();
    flights.forEach(flight => {
      if (flight.origin?.airportCode) origins.add(flight.origin.airportCode);
      if (flight.destination?.airportCode) destinations.add(flight.destination.airportCode);
    });
    return {
      origins: Array.from(origins).sort(),
      destinations: Array.from(destinations).sort(),
    };
  }, [flights]);

  // In UserFlights.jsx, the loadFlights function
  const loadFlights = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: page,
        limit: 20,
      };

      // Only add filters if they have values
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();
      if (filters.origin && filters.origin.trim()) params.origin = filters.origin.trim();
      if (filters.destination && filters.destination.trim()) params.destination = filters.destination.trim();
      if (filters.departureDate && filters.departureDate.trim()) params.departureDate = filters.departureDate.trim();
      if (filters.flightType && filters.flightType.trim()) params.flightType = filters.flightType.trim();
      if (filters.travelType && filters.travelType.trim()) params.travelType = filters.travelType.trim();
      if (filters.minPrice && filters.minPrice.trim()) params.minPrice = filters.minPrice.trim();
      if (filters.maxPrice && filters.maxPrice.trim()) params.maxPrice = filters.maxPrice.trim();

      console.log('🔍 Fetching flights with params:', params);

      const response = await flightService.search(params);
      console.log('✅ Flights response:', response);

      // Handle different response structures
      let flightsData = [];
      let paginationData = null;

      if (response.data) {
        if (Array.isArray(response.data)) {
          flightsData = response.data;
          paginationData = response.pagination || null;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          flightsData = response.data.data;
          paginationData = response.data.pagination || null;
        } else {
          flightsData = response.data.data || [];
          paginationData = response.data.pagination || null;
        }
      }

      console.log('📊 Processed flights:', flightsData.length);
      console.log('📄 Pagination:', paginationData);

      setFlights(flightsData);
      setPagination(paginationData);
      setError('');
    } catch (err) {
      console.error('❌ Error loading flights:', err);
      console.error('❌ Error details:', err.response?.data);

      if (err instanceof ApiError) {
        setError(err.message || 'Could not load flights.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Could not load flights. Please try again.');
      }
      setFlights([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
  }, [page]);

  // Update filters when URL params change (for travelType from navigation)
  useEffect(() => {
    const travelType = searchParams.get('travelType');
    if (travelType && travelType !== filters.travelType) {
      setFilters(prev => ({ ...prev, travelType }));
      setPage(1);
    }
  }, [searchParams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadFlights();
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      origin: '',
      destination: '',
      departureDate: '',
      flightType: '',
      travelType: '',
      minPrice: '',
      maxPrice: '',
    });
    setPage(1);
    setSearchParams({});
    setTimeout(() => loadFlights(), 100);
  };

  const handleBookNow = (flightId) => {
    console.log('📌 Booking flight with ID:', flightId);
    navigate(`/flights/${flightId}/book`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'scheduled': { label: 'Scheduled', color: '#3b82f6' },
      'boarding': { label: 'Boarding', color: '#f59e0b' },
      'departed': { label: 'Departed', color: '#10b981' },
      'arrived': { label: 'Arrived', color: '#10b981' },
      'cancelled': { label: 'Cancelled', color: '#6b7280' },
      'delayed': { label: 'Delayed', color: '#ef4444' },
    };
    return statusMap[status] || statusMap.scheduled;
  };

  if (loading && page === 1) {
    return (
      <div className="user-flights-wrapper">
        <div className="user-flights-header">
          <h1>Available Flights</h1>
          <p className="faint">Browse and book flights from our network</p>
        </div>
        <div className="center" style={{ padding: 'var(--s-8) 0' }}>
          <Spinner label="Loading flights..." />
        </div>
      </div>
    );
  }

  const getTravelTypeLabel = (value) => {
    const found = TRAVEL_TYPES.find(t => t.value === value);
    return found ? found.label : value;
  };

  return (
    <div className="user-flights-wrapper">
      <div className="user-flights-header">
        <div>
          <h1>Available Flights</h1>
          <p className="faint">Browse and book flights from our network</p>
          {filters.travelType && (
            <span className="active-filter-badge">
              ✈️ Showing flights for: <strong>{getTravelTypeLabel(filters.travelType)}</strong>
            </span>
          )}
        </div>
        <div className="flight-count">
          {pagination && (
            <span className="count-badge">{pagination.total || flights.length} flights available</span>
          )}
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {/* Always Visible Filters */}
      <form onSubmit={handleFilterSubmit} className="user-flights-filters always-visible">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by airline, flight #..."
              className="field"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Origin</label>
            <select
              name="origin"
              value={filters.origin}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">All Origins</option>
              {airportOptions.origins.map(code => (
                <option key={code} value={code}>{code}</option>
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
              <option value="">All Destinations</option>
              {airportOptions.destinations.map(code => (
                <option key={code} value={code}>{code}</option>
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
            <label className="filter-label">Flight Type</label>
            <select
              name="flightType"
              value={filters.flightType}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">All Types</option>
              {FLIGHT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Travel Type</label>
            <select
              name="travelType"
              value={filters.travelType}
              onChange={handleFilterChange}
              className="field"
            >
              <option value="">All Travel Types</option>
              {TRAVEL_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Min Price (PKR)</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="0"
              className="field"
              min="0"
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
              className="field"
              min="0"
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

      {/* Flight Table */}
      {flights.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✈️</div>
          <h3>No flights found</h3>
          <p className="faint">Try adjusting your search filters or check back later</p>
          {filters.travelType && (
            <p className="faint" style={{ marginTop: '8px' }}>
              Currently filtering by: <strong>{getTravelTypeLabel(filters.travelType)}</strong>
            </p>
          )}
          <button className="btn btn--primary" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="flights-table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight) => {
                  const statusInfo = getStatusBadge(flight.status);

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
                      <td data-label="Route">
                        <div className="route-cell">
                          <div className="route-origin">
                            <span className="route-code">{flight.origin?.airportCode || 'N/A'}</span>
                            <span className="route-city">{flight.origin?.city || 'N/A'}</span>
                          </div>
                          <span className="route-arrow">→</span>
                          <div className="route-destination">
                            <span className="route-code">{flight.destination?.airportCode || 'N/A'}</span>
                            <span className="route-city">{flight.destination?.city || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Departure">
                        <div className="time-cell">
                          <span className="time-value">{flight.departureTime ? time(flight.departureTime) : 'N/A'}</span>
                          <span className="date-value">{flight.departureTime ? date(flight.departureTime) : 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="Arrival">
                        <div className="time-cell">
                          <span className="time-value">{flight.arrivalTime ? time(flight.arrivalTime) : 'N/A'}</span>
                          <span className="date-value">{flight.arrivalTime ? date(flight.arrivalTime) : 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="Type">
                        <span className={`flight-type-badge ${flight.flightType === 'international' ? 'international' : 'domestic'}`}>
                          {flight.flightType === 'international' ? '🌍 International' : '🏠 Domestic'}
                        </span>
                        {flight.travelTypes && flight.travelTypes.length > 0 && (
                          <div className="travel-types">
                            {flight.travelTypes.slice(0, 2).map(type => (
                              <span key={type} className="travel-type-tag">{type}</span>
                            ))}
                            {flight.travelTypes.length > 2 && (
                              <span className="travel-type-tag more">+{flight.travelTypes.length - 2}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td data-label="Price">
                        <span className="price-value">
                          {money(flight.cabins?.economy?.price || 0, 'PKR')}
                        </span>
                      </td>
                      <td data-label="Seats">
                        <span className={`seats-value ${flight.cabins?.economy?.availableSeats <= 5 ? 'low' : ''}`}>
                          {flight.cabins?.economy?.availableSeats || 0}
                        </span>
                      </td>
                      <td data-label="Status">
                        <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td data-label="Action">
                        {isAuthenticated ? (
                          <button
                            onClick={() => handleBookNow(flight._id)}
                            className="btn btn--primary btn--sm"
                          >
                            Book
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

          {pagination && pagination.pages > 1 && (
            <Pagination
              current={pagination.page}
              total={pagination.pages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}