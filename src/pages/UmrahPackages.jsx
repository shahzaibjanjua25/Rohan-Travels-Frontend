// frontend/src/pages/UmrahPackages.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { umrahService } from '../services/umrah';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { date, money } from '../utils/format';
import Alert from '../components/ui/Alert';
import './UmrahPackages.css';

const EMPTY_FILTERS = {
    departureDate: '',
    airline: '',
    origin: '',
    minPrice: '',
    maxPrice: '',
};

const AIRLINE_MARKS = {
    'Saudi Arabian Airlines': '#1a6b3c',
    'Pakistan International Airlines': '#1a5c2a',
    'Fly Jinnah': '#e31837',
    'Riyadh Air': '#4a2d7a',
    Emirates: '#d71921',
    'Qatar Airways': '#8a1538',
    'Etihad Airways': '#5c1a2d',
    'Oman Air': '#8a6a1f',
    'Gulf Air': '#c8102e',
    'Kuwait Airways': '#1a3a6a',
};

const STATUS_TONE = {
    scheduled: 'neutral',
    boarding: 'warn',
    departed: 'go',
    arrived: 'go',
    cancelled: 'stop',
    delayed: 'stop',
};

function initials(name = '') {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '··';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

function lowestPrice(pkg) {
    const prices = [
        pkg.sharingPrices?.quad,
        pkg.sharingPrices?.triple,
        pkg.sharingPrices?.double,
        pkg.perPersonPrice,
    ].filter((p) => p && p > 0);
    return prices.length ? Math.min(...prices) : pkg.perPersonPrice;
}

function PlaneRail({ duration }) {
    return (
        <div className="pkg-rail" aria-hidden="true">
            <span className="pkg-rail-nights">{duration ? `${duration} days` : 'Round trip'}</span>
            <span className="pkg-rail-track">
                <svg className="pkg-rail-plane" viewBox="0 0 24 24" width="13" height="13">
                    <path
                        fill="currentColor"
                        d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
                    />
                </svg>
            </span>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="pkg-card pkg-card--ghost" aria-hidden="true">
            <div className="sk sk-head" />
            <div className="sk sk-route" />
            <div className="sk sk-row" />
            <div className="sk sk-row sk-row--short" />
            <div className="sk sk-price" />
        </div>
    );
}

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

    // Load packages when search params change
    useEffect(() => {
        let cancelled = false;

        const loadPackages = async () => {
            setLoading(true);
            setError('');
            try {
                // Build params from searchParams
                const params = {};
                for (const [key, value] of searchParams.entries()) {
                    if (value && value !== '') {
                        params[key] = value;
                    }
                }

                // Add default limit
                params.limit = 20;

                const response = await umrahService.getPackages(params);
                if (cancelled) return;
                setPackages(response.data || []);
                setPagination(response.pagination || null);
            } catch (err) {
                if (cancelled) return;
                console.error('Error loading Umrah packages:', err);
                setError(
                    err instanceof ApiError
                        ? err.message
                        : 'Packages could not be loaded. Check your connection and search again.'
                );
                setPackages([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadPackages();
        return () => {
            cancelled = true;
        };
    }, [searchParams]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Build params object from filters, filtering out empty values
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '') {
                params[key] = value;
            }
        });
        setSearchParams(params);
    };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        setSearchParams({});
    };

    const goToPage = (page) => {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            if (key !== 'page') {
                params[key] = value;
            }
        }
        params.page = page;
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasFilters = Object.values(filters).some((v) => v !== '');

    return (
        <div className="umrah-wrapper">
            <header className="umrah-hero">
                <div className="umrah-hero-content">
                    <p className="umrah-eyebrow">Flights · Hotels · Ziyarat transport</p>
                    <h1>
                        Umrah <em>packages</em>
                    </h1>
                    <p className="umrah-lede">
                        Every package below is a complete journey — return flight, hotels in Makkah and
                        Madinah, and ground transport between them.
                    </p>
                    <span className="umrah-rule" />
                </div>
            </header>

            <form className="umrah-filters" onSubmit={handleSearch}>
                <div className="filter-grid">
                    <div className="filter-group">
                        <label htmlFor="f-date">Departing</label>
                        <input
                            id="f-date"
                            type="date"
                            name="departureDate"
                            value={filters.departureDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="f-airline">Airline</label>
                        <input
                            id="f-airline"
                            type="text"
                            name="airline"
                            placeholder="Any airline"
                            value={filters.airline}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="f-origin">Leaving from</label>
                        <input
                            id="f-origin"
                            type="text"
                            name="origin"
                            placeholder="Any city"
                            value={filters.origin}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="f-min">Min price</label>
                        <input
                            id="f-min"
                            type="number"
                            name="minPrice"
                            placeholder="PKR 0"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="f-max">Max price</label>
                        <input
                            id="f-max"
                            type="number"
                            name="maxPrice"
                            placeholder="PKR 500,000"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>
                <div className="filter-actions">
                    {hasFilters && (
                        <button type="button" className="btn btn--ghost" onClick={handleReset}>
                            Clear filters
                        </button>
                    )}
                    <button type="submit" className="btn btn--primary">
                        Search packages
                    </button>
                </div>
            </form>

            {error && <Alert kind="error">{error}</Alert>}

            {!loading && !error && packages.length > 0 && (
                <p className="umrah-count">
                    {pagination?.total ?? packages.length} packages
                    {hasFilters ? ' match your search' : ' available'}
                </p>
            )}

            {loading ? (
                <div className="umrah-grid" aria-busy="true">
                    {[0, 1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : packages.length === 0 ? (
                <div className="empty-state">
                    <h3>No packages match this search</h3>
                    <p>Try a wider date range, or clear the filters to see everything on offer.</p>
                    {hasFilters && (
                        <button type="button" className="btn btn--primary" onClick={handleReset}>
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="umrah-grid">
                    {packages.map((pkg) => {
                        const status = pkg.status || 'scheduled';
                        const price = lowestPrice(pkg);
                        const bookHref = `/umrah/packages/${pkg._id}/book`;

                        return (
                            <article key={pkg._id} className="pkg-card">
                                {pkg.isFeatured && <p className="pkg-flag">⭐ Featured</p>}

                                <header className="pkg-head">
                                    <div className="pkg-airline">
                                        <span
                                            className="pkg-mark"
                                            style={{ '--mark': AIRLINE_MARKS[pkg.airline] || '#1F6B58' }}
                                        >
                                            {initials(pkg.airline)}
                                        </span>
                                        <span className="pkg-airline-text">
                                            <span className="pkg-airline-name">{pkg.airline || 'Airline TBC'}</span>
                                            <span className="pkg-flight">{pkg.flightNumber || '—'}</span>
                                        </span>
                                    </div>
                                    <span className="pkg-status" data-tone={STATUS_TONE[status] || 'neutral'}>
                                        {status}
                                    </span>
                                </header>

                                <div className="pkg-route">
                                    <div className="pkg-port">
                                        <span className="pkg-code">{pkg.origin?.airportCode || '—'}</span>
                                        <span className="pkg-city">{pkg.origin?.city || 'Origin TBC'}</span>
                                        <span className="pkg-when">{date(pkg.departureDate)}</span>
                                    </div>
                                    <PlaneRail duration={pkg.duration} />
                                    <div className="pkg-port pkg-port--end">
                                        <span className="pkg-code">{pkg.destination?.airportCode || '—'}</span>
                                        <span className="pkg-city">{pkg.destination?.city || 'Destination TBC'}</span>
                                        <span className="pkg-when">{date(pkg.returnDate)}</span>
                                    </div>
                                </div>

                                <div className="pkg-tear" aria-hidden="true" />

                                // In the package card rendering, update the hotel display:
                                <ul className="pkg-stays">
                                    <li>
                                        <span className="pkg-stay-label">Makkah</span>
                                        <span className="pkg-stay-name">{pkg.makkahHotel?.name || 'Hotel TBC'}</span>
                                        <span className="pkg-stay-meta">
                                            {pkg.makkahHotel?.distance ? `${pkg.makkahHotel.distance} · ` : ''}
                                            {pkg.makkahHotel?.nights || 0} nights  {/* ← This should now show correctly */}
                                        </span>
                                    </li>
                                    <li>
                                        <span className="pkg-stay-label">Madinah</span>
                                        <span className="pkg-stay-name">{pkg.madinahHotel?.name || 'Hotel TBC'}</span>
                                        <span className="pkg-stay-meta">
                                            {pkg.madinahHotel?.distance ? `${pkg.madinahHotel.distance} · ` : ''}
                                            {pkg.madinahHotel?.nights || 0} nights  {/* ← This should now show correctly */}
                                        </span>
                                    </li>
                                </ul>

                                <div className="pkg-price">
                                    <p className="pkg-price-eyebrow">From, per person</p>
                                    <p className="pkg-price-amount">{money(price)}</p>

                                    {(pkg.sharingPrices?.quad > 0 ||
                                        pkg.sharingPrices?.triple > 0 ||
                                        pkg.sharingPrices?.double > 0) && (
                                            <dl className="pkg-shares">
                                                {pkg.sharingPrices?.quad > 0 && (
                                                    <div>
                                                        <dt>Quad</dt>
                                                        <dd>{money(pkg.sharingPrices.quad)}</dd>
                                                    </div>
                                                )}
                                                {pkg.sharingPrices?.triple > 0 && (
                                                    <div>
                                                        <dt>Triple</dt>
                                                        <dd>{money(pkg.sharingPrices.triple)}</dd>
                                                    </div>
                                                )}
                                                {pkg.sharingPrices?.double > 0 && (
                                                    <div>
                                                        <dt>Double</dt>
                                                        <dd>{money(pkg.sharingPrices.double)}</dd>
                                                    </div>
                                                )}
                                            </dl>
                                        )}

                                    {(pkg.childWithoutBedPrice > 0 || pkg.infantPrice > 0) && (
                                        <p className="pkg-extras">
                                            {pkg.childWithoutBedPrice > 0 && (
                                                <span>Child without bed {money(pkg.childWithoutBedPrice)}</span>
                                            )}
                                            {pkg.infantPrice > 0 && <span>Infant {money(pkg.infantPrice)}</span>}
                                        </p>
                                    )}
                                </div>

                                <footer className="pkg-foot">
                                    <span className="pkg-seats">
                                        {pkg.totalSeats > 0 ? `${pkg.totalSeats} seats left` : 'Seats available'}
                                    </span>
                                    <Link
                                        to={isAuthenticated ? bookHref : '/login'}
                                        className="pkg-book"
                                        state={isAuthenticated ? undefined : { from: bookHref }}
                                    >
                                        Book now
                                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                                            <path
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 12h13m-5-6 6 6-6 6"
                                            />
                                        </svg>
                                    </Link>
                                </footer>
                            </article>
                        );
                    })}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <nav className="pagination" aria-label="Package pages">
                    <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                    >
                        Next
                    </button>
                </nav>
            )}
        </div>
    );
}