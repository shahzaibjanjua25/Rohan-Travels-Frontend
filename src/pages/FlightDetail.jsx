import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import flightService from '../services/flights';
import bookingService from '../services/bookings';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { MAX_PASSENGERS } from '../utils/constants';
import { date, duration, money, plural, time } from '../utils/format';
import Field from '../components/ui/Field';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import Tag from '../components/ui/Tag';
import { CABIN_CLASSES } from '../utils/constants';


// Travel types
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

const blankPassenger = () => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  type: 'adult',
  travelType: 'tour',
});

export default function FlightDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cabinClass, setCabinClass] = useState(params.get('cabin') || 'economy');
  const [passengers, setPassengers] = useState(() => {
    const count = Math.min(Number(params.get('passengers')) || 1, MAX_PASSENGERS);
    return Array.from({ length: count }, blankPassenger);
  });
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    flightService
      .get(id)
      .then((res) => {
        if (!cancelled) setFlight(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load this flight.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (user?.email && !contactEmail) setContactEmail(user.email);
    if (user?.phone && !contactPhone) setContactPhone(user.phone);
  }, [user, contactEmail, contactPhone]);

  const cabin = flight?.cabins?.[cabinClass];

  // Indicative only — the server prices the booking authoritatively, and
  // showing a total here that the server later disagrees with would be worse
  // than showing none.
  const estimate = useMemo(() => {
    if (!cabin?.price) return null;
    return cabin.price * passengers.length;
  }, [cabin, passengers.length]);

  const setPassenger = (index, key) => (e) => {
    const value = e.target.value;
    setPassengers((list) => list.map((p, i) => (i === index ? { ...p, [key]: value } : p)));
  };

  const addPassenger = () =>
    setPassengers((list) => (list.length < MAX_PASSENGERS ? [...list, blankPassenger()] : list));

  const removePassenger = (index) =>
    setPassengers((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setSubmitError('');
    setFieldErrors({});

    try {
      const payload = {
        flightId: id,
        cabinClass,
        contactEmail,
        passengers: passengers.map((p) => {
          // Optional fields are dropped when empty rather than sent blank —
          // the backend validates format and an empty string fails it.
          const clean = {
            firstName: p.firstName.trim(),
            lastName: p.lastName.trim(),
            dateOfBirth: p.dateOfBirth,
            type: p.type,
          };
          if (p.travelType) clean.travelType = p.travelType;
          return clean;
        }),
      };
      if (contactPhone.trim()) payload.contactPhone = contactPhone.trim();

      const res = await bookingService.create(payload);
      navigate(`/bookings/${res.data._id}`, { state: { created: true } });
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setSubmitError(err.details?.length ? 'Check the highlighted fields.' : err.message);
      } else {
        setSubmitError('Could not complete the booking. Try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap center" style={{ padding: 'var(--s-8) 0' }}>
        <Spinner label="Loading flight" />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="wrap">
        <Alert kind="error">{error || 'Flight not found.'}</Alert>
        <Link className="btn btn--ghost" to="/" style={{ marginTop: 'var(--s-4)' }}>
          Back to search
        </Link>
      </div>
    );
  }

  const seatsLeft = cabin?.availableSeats ?? 0;
  const notEnoughSeats = seatsLeft < passengers.length;

  return (
    <div className="wrap">
      <Link to="/" className="eyebrow" style={{ textDecoration: 'none' }}>
        ← All departures
      </Link>

      <div className="card" style={{ margin: 'var(--s-4) 0 var(--s-5)' }}>
        <div className="row row--between row--wrap" style={{ marginBottom: 'var(--s-4)' }}>
          <div>
            <span className="mono" style={{ fontSize: 'var(--step-2)', fontWeight: 700 }}>
              {flight.flightNumber}
            </span>
            <span className="muted" style={{ marginLeft: 'var(--s-3)' }}>
              {flight.airline}
              {flight.aircraft ? ` · ${flight.aircraft}` : ''}
            </span>
          </div>
          <Tag status={flight.status} />
        </div>

        <div className="pass__route">
          <span className="pass__leg">
            <span className="pass__iata">{flight.origin.airportCode}</span>
            <span className="muted">{flight.origin.city}</span>
            <span className="mono" style={{ fontSize: 'var(--step-1)' }}>
              {time(flight.departureTime)}
            </span>
            <span className="faint" style={{ fontSize: 'var(--step--1)' }}>
              {date(flight.departureTime)}
            </span>
          </span>

          <span className="pass__arrow" aria-hidden="true" />

          <span className="pass__leg">
            <span className="pass__iata">{flight.destination.airportCode}</span>
            <span className="muted">{flight.destination.city}</span>
            <span className="mono" style={{ fontSize: 'var(--step-1)' }}>
              {time(flight.arrivalTime)}
            </span>
            <span className="faint" style={{ fontSize: 'var(--step--1)' }}>
              {date(flight.arrivalTime)}
            </span>
          </span>
        </div>

        <div className="row row--wrap muted" style={{ fontSize: 'var(--step--1)', gap: 'var(--s-5)' }}>
          <span>Flight time {duration(flight.durationMinutes)}</span>
          <span>
            Baggage {flight.baggageAllowance?.checkedKg}kg checked · {flight.baggageAllowance?.cabinKg}kg cabin
          </span>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="card center">
          <h3 style={{ marginBottom: 'var(--s-3)' }}>Sign in to book this flight</h3>
          <p className="muted">You need an account to hold a booking.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link className="btn btn--primary" to="/login" state={{ from: { pathname: `/flights/${id}` } }}>
              Sign in
            </Link>
            <Link className="btn btn--ghost" to="/register">
              Create account
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="card stack" style={{ marginBottom: 'var(--s-5)' }}>
            <h2>Cabin</h2>
            <div className="grid grid--3">
              {CABIN_CLASSES.map((c) => {
                const option = flight.cabins?.[c.value];
                const available = option && option.totalSeats > 0;
                return (
                  <label
                    key={c.value}
                    className="card"
                    style={{
                      padding: 'var(--s-4)',
                      cursor: available ? 'pointer' : 'not-allowed',
                      opacity: available ? 1 : 0.45,
                      borderColor: cabinClass === c.value ? 'var(--azure)' : 'var(--rule)',
                      borderWidth: cabinClass === c.value ? '2px' : '1px',
                    }}
                  >
                    <span className="row row--between">
                      <span className="row" style={{ gap: 'var(--s-2)' }}>
                        <input
                          type="radio"
                          name="cabinClass"
                          value={c.value}
                          checked={cabinClass === c.value}
                          disabled={!available}
                          onChange={() => setCabinClass(c.value)}
                        />
                        <strong>{c.label}</strong>
                      </span>
                      <span className="mono">{available ? money(option.price) : '—'}</span>
                    </span>
                    <span className="faint" style={{ fontSize: 'var(--step--1)' }}>
                      {available ? `${plural(option.availableSeats, 'seat')} available` : 'Not offered'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="card stack" style={{ marginBottom: 'var(--s-5)' }}>
            <div className="row row--between">
              <h2>Travellers</h2>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={addPassenger}
                disabled={passengers.length >= MAX_PASSENGERS}
              >
                Add traveller
              </button>
            </div>

            {passengers.map((p, i) => (
              <fieldset
                key={i}
                style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius)', padding: 'var(--s-4)' }}
              >
                <legend className="eyebrow" style={{ padding: '0 var(--s-2)' }}>
                  Traveller {i + 1}
                </legend>

                <div className="grid grid--2">
                  <Field
                    id={`first-${i}`}
                    label="First name"
                    value={p.firstName}
                    onChange={setPassenger(i, 'firstName')}
                    error={fieldErrors[`passengers[${i}].firstName`]}
                    required
                  />
                  <Field
                    id={`last-${i}`}
                    label="Last name"
                    value={p.lastName}
                    onChange={setPassenger(i, 'lastName')}
                    error={fieldErrors[`passengers[${i}].lastName`]}
                    required
                  />
                  <Field
                    id={`dob-${i}`}
                    label="Date of birth"
                    type="date"
                    value={p.dateOfBirth}
                    onChange={setPassenger(i, 'dateOfBirth')}
                    error={fieldErrors[`passengers[${i}].dateOfBirth`]}
                    required
                  />
                  <Field id={`type-${i}`} label="Ticket type" as="select" value={p.type} onChange={setPassenger(i, 'type')}>
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="infant">Infant</option>
                  </Field>
                  <Field id={`travelType-${i}`} label="Travel Type" as="select" value={p.travelType} onChange={setPassenger(i, 'travelType')}>
                    {TRAVEL_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Field>
                </div>

                {passengers.length > 1 && (
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    style={{ marginTop: 'var(--s-3)' }}
                    onClick={() => removePassenger(i)}
                  >
                    Remove traveller {i + 1}
                  </button>
                )}
              </fieldset>
            ))}
          </div>

          <div className="card stack" style={{ marginBottom: 'var(--s-5)' }}>
            <h2>Contact</h2>
            <p className="muted" style={{ fontSize: 'var(--step--1)' }}>
              Where we send confirmation and any changes to this flight.
            </p>
            <div className="grid grid--2">
              <Field
                id="contactEmail"
                label="Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                error={fieldErrors.contactEmail}
                required
              />
              <Field
                id="contactPhone"
                label="Phone (optional)"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                error={fieldErrors.contactPhone}
              />
            </div>
          </div>

          <div className="card">
            {submitError && <Alert kind="error">{submitError}</Alert>}

            {notEnoughSeats && (
              <Alert kind="warn">
                Only {plural(seatsLeft, 'seat')} left in {cabinClass}. Remove a traveller or choose another cabin.
              </Alert>
            )}

            <div className="row row--between row--wrap" style={{ marginTop: 'var(--s-4)' }}>
              <div>
                <span className="eyebrow">Estimated fare</span>
                <div className="mono" style={{ fontSize: 'var(--step-3)' }}>
                  {estimate != null ? money(estimate) : '—'}
                </div>
                <span className="faint" style={{ fontSize: 'var(--step--1)' }}>
                  {plural(passengers.length, 'traveller')} · taxes and fees added at confirmation
                </span>
              </div>

              <button className="btn btn--primary" type="submit" disabled={busy || notEnoughSeats}>
                {busy ? 'Holding your seats…' : 'Hold booking'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}