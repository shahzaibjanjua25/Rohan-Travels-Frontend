import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import flightService from '../services/flights';
import { ApiError } from '../services/api';
import { CABIN_CLASSES, MAX_PASSENGERS } from '../utils/constants';
import { duration, inputDate, money, plural, time } from '../utils/format';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';
import Pagination from '../components/ui/Pagination';
import './FlightSearch.css';

const DEFAULTS = {
  origin: '',
  destination: '',
  departureDate: '',
  cabinClass: 'economy',
  passengers: 1,
  sort: 'departureTime',
};

/**
 * One row of the departure board.
 *
 * The stagger is capped: past about ten rows the delay stops reading as a
 * board resolving and starts reading as the page being slow.
 */
function BoardRow({ flight, index, cabin, onSelect }) {
  const seats = flight.cabins?.[cabin]?.availableSeats ?? 0;
  const price = flight.cabins?.[cabin]?.price;

  return (
    <button
      type="button"
      className="board__row"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      onClick={() => onSelect(flight)}
    >
      <span>
        <span className="board__code">{flight.flightNumber}</span>
        <span className="board__airline" style={{ display: 'block' }}>
          {flight.airline}
        </span>
      </span>

      <span className="board__port">
        <span className="board__iata">{flight.origin.airportCode}</span>
        <span className="board__city">{flight.origin.city}</span>
      </span>

      <span className="board__port">
        <span className="board__iata">{flight.destination.airportCode}</span>
        <span className="board__city">{flight.destination.city}</span>
      </span>

      <span>
        <span className="board__time">{time(flight.departureTime)}</span>
        <span className="board__duration" style={{ display: 'block' }}>
          {duration(flight.durationMinutes)}
        </span>
      </span>

      <span>
        <span className="board__time">{time(flight.arrivalTime)}</span>
        {flight.status !== 'scheduled' && (
          <span className="board__duration" style={{ display: 'block', color: 'var(--signal)' }}>
            {flight.status}
          </span>
        )}
      </span>

      <span>
        <span className="board__price">{price != null ? money(price) : '—'}</span>
        <span className="board__seats" style={{ display: 'block' }}>
          {seats > 0 ? `${plural(seats, 'seat')} left` : 'Sold out'}
        </span>
      </span>
    </button>
  );
}

// Custom dropdown component with search
function AirportDropdown({ id, label, placeholder, value, onChange, airports = [], loading = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAirports = airports.filter(airport => {
    const search = searchTerm.toLowerCase();
    return (
      airport.airportCode?.toLowerCase().includes(search) ||
      airport.city?.toLowerCase().includes(search) ||
      airport.airportName?.toLowerCase().includes(search) ||
      airport.country?.toLowerCase().includes(search)
    );
  });

  const handleSelect = (airport) => {
    onChange({ target: { value: airport.airportCode } });
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    onChange(e);
    setIsOpen(true);
  };

  const displayValue = value || searchTerm;

  return (
    <div className="field-group" ref={wrapperRef}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="airport-dropdown">
        <input
          id={id}
          type="text"
          className="field"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          maxLength={3}
          style={{ textTransform: 'uppercase' }}
          autoComplete="off"
        />
        {isOpen && (
          <div className="airport-dropdown-menu">
            {loading ? (
              <div className="airport-dropdown-item loading">
                <span className="spinner" aria-hidden="true" />
                Loading airports...
              </div>
            ) : filteredAirports.length === 0 ? (
              <div className="airport-dropdown-item no-results">
                {searchTerm ? 'No airports found' : 'Start typing to search...'}
              </div>
            ) : (
              filteredAirports.map((airport) => (
                <button
                  key={airport.airportCode}
                  type="button"
                  className="airport-dropdown-item"
                  onClick={() => handleSelect(airport)}
                >
                  <span className="airport-code">{airport.airportCode}</span>
                  <span className="airport-name">
                    {airport.city}, {airport.country}
                    {airport.airportName && <span className="airport-full-name"> · {airport.airportName}</span>}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlightSearch() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({
    ...DEFAULTS,
    ...Object.fromEntries([...params].filter(([, v]) => v !== '')),
  }));
  const [flights, setFlights] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState('');
  const [airports, setAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(false);

  const abortRef = useRef(null);

  // Load airports for dropdown
  const loadAirports = useCallback(async () => {
    setAirportsLoading(true);
    try {
      // Get unique origins and destinations from flights
      const response = await flightService.getFilters();
      const allAirports = [];
      
      // Extract unique airports from origins and destinations
      if (response.data?.origins) {
        response.data.origins.forEach(airport => {
          if (!allAirports.find(a => a.airportCode === airport.airportCode)) {
            allAirports.push(airport);
          }
        });
      }
      if (response.data?.destinations) {
        response.data.destinations.forEach(airport => {
          if (!allAirports.find(a => a.airportCode === airport.airportCode)) {
            allAirports.push(airport);
          }
        });
      }
      
      setAirports(allAirports);
    } catch (err) {
      console.error('Failed to load airports:', err);
    } finally {
      setAirportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAirports();
  }, [loadAirports]);

  const runSearch = useCallback(async (query) => {
    // Cancel the previous request so a slow earlier search cannot land after
    // a faster later one and overwrite the results.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError('');

    try {
      const res = await flightService.search(query, { signal: controller.signal });
      setFlights(res.data);
      setPagination(res.pagination);
      setStatus('ready');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err instanceof ApiError ? err.message : 'Could not load flights.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const query = Object.fromEntries([...params].filter(([, v]) => v !== ''));
    runSearch({ limit: 20, ...query });
  }, [params, runSearch]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const set = (key) => (e) => {
    const value = key === 'origin' || key === 'destination' ? e.target.value.toUpperCase() : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    setParams(next);
  };

  const swap = () =>
    setForm((f) => ({ ...f, origin: f.destination, destination: f.origin }));

  const goToPage = (page) => {
    const next = Object.fromEntries([...params]);
    next.page = page;
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cabin = form.cabinClass || 'economy';

  return (
    <div className="wrap">
      <p className="eyebrow">Departures</p>
      <h1 style={{ marginBottom: 'var(--s-5)' }}>Where are you going?</h1>

      <form className="search" onSubmit={submit}>
        <div className="search__grid">
          <AirportDropdown
            id="origin"
            label="From"
            placeholder="Search airport..."
            value={form.origin}
            onChange={set('origin')}
            airports={airports}
            loading={airportsLoading}
          />

          <div style={{ display: 'grid', placeItems: 'center' }}>
            <button
              type="button"
              className="search__swap"
              onClick={swap}
              aria-label="Swap origin and destination"
              title="Swap"
            >
              ⇄
            </button>
          </div>

          <AirportDropdown
            id="destination"
            label="To"
            placeholder="Search airport..."
            value={form.destination}
            onChange={set('destination')}
            airports={airports}
            loading={airportsLoading}
          />

          <Field
            id="departureDate"
            label="Departing"
            type="date"
            min={inputDate()}
            value={form.departureDate}
            onChange={set('departureDate')}
          />

          <Field id="cabinClass" label="Cabin" as="select" value={form.cabinClass} onChange={set('cabinClass')}>
            {CABIN_CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Field>

          <Field
            id="passengers"
            label="Travellers"
            type="number"
            min={1}
            max={MAX_PASSENGERS}
            value={form.passengers}
            onChange={set('passengers')}
          />

          <button className="btn btn--primary" type="submit" style={{ height: '2.4rem' }}>
            Search
          </button>
        </div>
      </form>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="board" aria-busy={status === 'loading'}>
        <div className="board__head">
          <span>Flight</span>
          <span>From</span>
          <span>To</span>
          <span>Departs</span>
          <span>Arrives</span>
          <span>Fare</span>
        </div>

        {status === 'loading' && (
          <div className="board__empty">
            <span className="spinner" aria-hidden="true" />
            <span className="visually-hidden">Loading flights</span>
          </div>
        )}

        {status === 'ready' && flights.length === 0 && (
          <div className="board__empty">
            <p style={{ marginBottom: 'var(--s-2)' }}>Nothing scheduled on this route.</p>
            <p className="faint" style={{ margin: 0, fontSize: 'var(--step--1)' }}>
              Try a different date, or clear the airport filters to see everything.
            </p>
          </div>
        )}

        {status === 'ready' &&
          flights.map((flight, index) => (
            <BoardRow
              key={flight._id}
              flight={flight}
              index={index}
              cabin={cabin}
              onSelect={(f) => navigate(`/flights/${f._id}?cabin=${cabin}&passengers=${form.passengers}`)}
            />
          ))}
      </div>

      <Pagination pagination={pagination} onChange={goToPage} />
    </div>
  );
}