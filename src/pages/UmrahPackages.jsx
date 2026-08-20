// frontend/src/pages/UmrahPackages.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { umrahService } from '../services/umrah';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { date, money } from '../utils/format';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import './UmrahPackages.css';

export default function UmrahPackages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const [packages, setPackages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    departureDate: searchParams.get('departureDate') || '',
    airline: searchParams.get('airline') || '',
    origin: searchParams.get('origin') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  useEffect(() => {
    loadPackages();
  }, [searchParams]);

  const loadPackages = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = Object.fromEntries([...searchParams]);
      const response = await umrahService.getPackages(params);
      
      setPackages(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load Umrah packages.');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '')
    );
    setSearchParams(params);
  };

  const handleReset = () => {
    setFilters({
      departureDate: '',
      airline: '',
      origin: '',
      minPrice: '',
      maxPrice: '',
    });
    setSearchParams({});
  };

  const getLowestPrice = (pkg) => {
    const prices = [
      pkg.sharingPrices?.quad,
      pkg.sharingPrices?.triple,
      pkg.sharingPrices?.double,
      pkg.perPersonPrice
    ].filter(p => p && p > 0);
    return prices.length ? Math.min(...prices) : pkg.perPersonPrice;
  };

  const getRoomLabel = (type) => {
    const map = { quad: 'Quad', triple: 'Triple', double: 'Double' };
    return map[type] || type;
  };

  if (loading) {
    return (
      <div className="umrah-wrapper">
        <div className="center" style={{ padding: '48px 0' }}>
          <Spinner label="Loading Umrah packages..." />
        </div>
      </div>
    );
  }

  return (
    <div className="umrah-wrapper">
      <div className="umrah-hero">
        <h1>Umrah Packages</h1>
        <p>Complete Umrah packages with flights, hotels, and transportation</p>
      </div>

      {/* Filters */}
      <form className="umrah-filters" onSubmit={handleSearch}>
        <div className="filter-grid">
          <div className="filter-group">
            <label>Departure Date</label>
            <input
              type="date"
              name="departureDate"
              value={filters.departureDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Airline</label>
            <input
              type="text"
              name="airline"
              placeholder="Search airline..."
              value={filters.airline}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Origin City</label>
            <input
              type="text"
              name="origin"
              placeholder="From city..."
              value={filters.origin}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Min Price</label>
            <input
              type="number"
              name="minPrice"
              placeholder="0"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Max Price</label>
            <input
              type="number"
              name="maxPrice"
              placeholder="500000"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="filter-actions">
          <button type="submit" className="btn btn--primary">Search</button>
          <button type="button" className="btn btn--ghost" onClick={handleReset}>Reset</button>
        </div>
      </form>

      {error && <Alert kind="error">{error}</Alert>}

      {packages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🕋</div>
          <h3>No Umrah packages found</h3>
          <p className="faint">Try adjusting your filters or check back later for new packages.</p>
        </div>
      ) : (
        <div className="umrah-grid">
          {packages.map((pkg) => {
            const lowestPrice = getLowestPrice(pkg);
            return (
              <div key={pkg._id} className="umrah-card">
                <div className="umrah-card-header">
                  <div className="airline-info">
                    <span className="airline-code">{pkg.airlineCode || pkg.airline.substring(0, 2).toUpperCase()}</span>
                    <span className="airline-name">{pkg.airline}</span>
                  </div>
                  <span className="flight-number">{pkg.flightNumber}</span>
                </div>

                <div className="umrah-route">
                  <div className="route-city">
                    <span className="city-code">{pkg.origin?.airportCode || 'N/A'}</span>
                    <span className="city-name">{pkg.origin?.city || 'N/A'}</span>
                  </div>
                  <span className="route-arrow">→</span>
                  <div className="route-city">
                    <span className="city-code">{pkg.destination?.airportCode || 'N/A'}</span>
                    <span className="city-name">{pkg.destination?.city || 'N/A'}</span>
                  </div>
                </div>

                <div className="umrah-dates">
                  <div className="date-group">
                    <span className="label">Departure</span>
                    <span className="value">{date(pkg.departureDate)}</span>
                  </div>
                  <div className="date-group">
                    <span className="label">Return</span>
                    <span className="value">{date(pkg.returnDate)}</span>
                  </div>
                  <div className="date-group">
                    <span className="label">Duration</span>
                    <span className="value">{pkg.duration} Days</span>
                  </div>
                </div>

                <div className="umrah-hotels">
                  <div className="hotel-item">
                    <span className="hotel-city">Makkah</span>
                    <span className="hotel-name">{pkg.makkahHotel?.name || 'N/A'}</span>
                    <span className="hotel-distance">{pkg.makkahHotel?.distance || ''}</span>
                    <span className="hotel-nights">{pkg.makkahHotel?.nights || 0} Nights</span>
                  </div>
                  <div className="hotel-item">
                    <span className="hotel-city">Madinah</span>
                    <span className="hotel-name">{pkg.madinahHotel?.name || 'N/A'}</span>
                    <span className="hotel-distance">{pkg.madinahHotel?.distance || ''}</span>
                    <span className="hotel-nights">{pkg.madinahHotel?.nights || 0} Nights</span>
                  </div>
                </div>

                <div className="umrah-pricing">
                  <div className="price-main">
                    <span className="price-label">Package Price</span>
                    <span className="price-value">{money(lowestPrice)}</span>
                    <span className="price-per">Per Person</span>
                  </div>
                  <div className="sharing-prices">
                    {pkg.sharingPrices?.quad > 0 && (
                      <span>Quad: {money(pkg.sharingPrices.quad)}</span>
                    )}
                    {pkg.sharingPrices?.triple > 0 && (
                      <span>Triple: {money(pkg.sharingPrices.triple)}</span>
                    )}
                    {pkg.sharingPrices?.double > 0 && (
                      <span>Double: {money(pkg.sharingPrices.double)}</span>
                    )}
                  </div>
                  {pkg.childWithoutBedPrice > 0 && (
                    <div className="child-price">Child w/o Bed: {money(pkg.childWithoutBedPrice)}</div>
                  )}
                  {pkg.infantPrice > 0 && (
                    <div className="infant-price">Infant: {money(pkg.infantPrice)}</div>
                  )}
                </div>

                <div className="umrah-actions">
                  <span className="seats-available">
                    {pkg.totalSeats > 0 ? `${pkg.availableSeats || 0} seats` : 'Unlimited'}
                  </span>
                  <Link
                    to={isAuthenticated ? `/umrah/packages/${pkg._id}/book` : `/login`}
                    className="btn btn--gold btn--sm"
                    state={isAuthenticated ? undefined : { from: `/umrah/packages/${pkg._id}/book` }}
                  >
                    {isAuthenticated ? 'Book Now' : 'Sign in to Book'}
                  </Link>
                </div>
              </div>
            );
          })}
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