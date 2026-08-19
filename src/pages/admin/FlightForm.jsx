import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { flightService } from '../../services/flights';
import { airportsFor, findAirport } from '../../data/airports';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import './flightform.css';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const TRIP_TYPES = [
  { value: 'one_way', label: 'One way', hint: 'A single hop, origin to destination.' },
  { value: 'round_trip', label: 'Round trip', hint: 'Out and back. The return always flies destination to origin.' },
  { value: 'multi_city', label: 'Multi-city', hint: 'A chain of legs, e.g. JED → MED → ISB. Route and times are taken from the segments.' },
];

// `generic` is not a purpose. It marks the itinerary as sellable under every
// purpose, so it appears in umrah results, hajj results, family results and so
// on. Listed first because it is the widest net, not the narrowest.
const GENERIC_OPTION = {
  value: 'generic',
  label: 'Generic — sells under every purpose',
};

const DOMESTIC_TRAVEL_TYPES = [
  GENERIC_OPTION,
  { value: 'tour', label: 'Tour' },
  { value: 'family', label: 'Family Visit' },
  { value: 'medical', label: 'Medical' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
];

const INTERNATIONAL_TRAVEL_TYPES = [
  GENERIC_OPTION,
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

const MAX_SEGMENTS = 8;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const blankEndpoint = () => ({ airportCode: '', airportName: '', city: '', country: '', terminal: '' });

const blankSegment = () => ({
  origin: blankEndpoint(),
  destination: blankEndpoint(),
  departureTime: '',
  arrivalTime: '',
  flightNumber: '',
  airline: '',
});

/**
 * Format a date for a datetime-local input.
 *
 * Deliberately not toISOString().slice(0,16): that yields UTC, so an admin in
 * PKT would open an 18:00 departure and see 13:00, then "correct" it and shift
 * the real departure by five hours.
 */
const toLocalInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIso = (localValue) => {
  if (!localValue) return undefined;
  const d = new Date(localValue);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

const hydrateEndpoint = (source) => ({
  airportCode: source?.airportCode || '',
  airportName: source?.airportName || '',
  city: source?.city || '',
  country: source?.country || '',
  terminal: source?.terminal || '',
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FlightForm({ initialData = null, isEdit = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState(() => {
    const base = {
      flightNumber: '',
      airline: '',
      aircraft: '',
      flightType: 'domestic',
      tripType: 'one_way',
      origin: blankEndpoint(),
      destination: blankEndpoint(),
      departureTime: '',
      arrivalTime: '',
      returnSegment: { departureTime: '', arrivalTime: '', flightNumber: '', aircraft: '' },
      segments: [],
      baggageAllowance: { cabinKg: 7, checkedKg: 23 },
      price: 0,
      totalSeats: 0,
      availableSeats: 0,
      isActive: true,
      travelTypes: ['generic'],
    };

    if (!initialData) return base;

    return {
      ...base,
      flightNumber: initialData.flightNumber || '',
      airline: initialData.airline || '',
      aircraft: initialData.aircraft || '',
      flightType: initialData.flightType || 'domestic',
      tripType: initialData.tripType || 'one_way',
      origin: hydrateEndpoint(initialData.origin),
      destination: hydrateEndpoint(initialData.destination),
      departureTime: toLocalInput(initialData.departureTime),
      arrivalTime: toLocalInput(initialData.arrivalTime),
      returnSegment: {
        departureTime: toLocalInput(initialData.returnSegment?.departureTime),
        arrivalTime: toLocalInput(initialData.returnSegment?.arrivalTime),
        flightNumber: initialData.returnSegment?.flightNumber || '',
        aircraft: initialData.returnSegment?.aircraft || '',
      },
      segments: (initialData.segments || []).map((s) => ({
        origin: hydrateEndpoint(s.origin),
        destination: hydrateEndpoint(s.destination),
        departureTime: toLocalInput(s.departureTime),
        arrivalTime: toLocalInput(s.arrivalTime),
        flightNumber: s.flightNumber || '',
        airline: s.airline || '',
      })),
      baggageAllowance: {
        cabinKg: initialData.baggageAllowance?.cabinKg ?? 7,
        checkedKg: initialData.baggageAllowance?.checkedKg ?? 23,
      },
      price: initialData.cabins?.economy?.price ?? 0,
      totalSeats: initialData.cabins?.economy?.totalSeats ?? 0,
      availableSeats: initialData.cabins?.economy?.availableSeats ?? 0,
      isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      travelTypes: initialData.travelTypes?.length ? initialData.travelTypes : ['generic'],
    };
  });

  const isMultiCity = formData.tripType === 'multi_city';
  const isRoundTrip = formData.tripType === 'round_trip';

  const availableAirports = airportsFor(formData.flightType);
  const availableTravelTypes =
    formData.flightType === 'international' ? INTERNATIONAL_TRAVEL_TYPES : DOMESTIC_TRAVEL_TYPES;

  const clearFieldError = (name) =>
    setValidationErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  // -------------------------------------------------------------------------
  // Generic field handlers
  // -------------------------------------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    clearFieldError(name);

    const nextValue = type === 'checkbox' ? checked : value;

    if (name.includes('.')) {
      const [group, key] = name.split('.');
      setFormData((prev) => ({ ...prev, [group]: { ...prev[group], [key]: nextValue } }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleTripTypeChange = (e) => {
    const tripType = e.target.value;
    setValidationErrors({});
    setFormData((prev) => ({
      ...prev,
      tripType,
      // A multi-city itinerary is meaningless with fewer than two legs, so
      // seed the minimum rather than show an empty section.
      segments:
        tripType === 'multi_city' && (!prev.segments || prev.segments.length < 2)
          ? [blankSegment(), blankSegment()]
          : prev.segments,
    }));
  };

  const handleFlightTypeChange = (e) => {
    const flightType = e.target.value;
    setValidationErrors({});
    // Airport lists differ per flight type, so previously chosen airports may
    // no longer be selectable. Clearing is safer than leaving a stale code.
    setFormData((prev) => ({
      ...prev,
      flightType,
      origin: blankEndpoint(),
      destination: blankEndpoint(),
      segments: (prev.segments || []).map(() => blankSegment()),
      travelTypes: ['generic'],
    }));
  };

  const handleAirportChange = (field, e) => {
    const code = e.target.value;
    const airport = findAirport(code, formData.flightType);
    clearFieldError(`${field}.airportCode`);

    setFormData((prev) => ({
      ...prev,
      [field]: {
        airportCode: code,
        airportName: airport?.name || '',
        city: airport?.city || '',
        country: airport?.country || '',
        terminal: prev[field]?.terminal || '',
      },
    }));
  };

  const handleTravelTypeToggle = (value) => {
    setFormData((prev) => {
      const current = prev.travelTypes || [];

      // `generic` already covers every purpose, so pairing it with specific
      // ones is contradictory. Selecting it clears the rest, and selecting a
      // specific purpose clears it.
      if (value === 'generic') {
        return { ...prev, travelTypes: current.includes('generic') ? [] : ['generic'] };
      }

      const withoutGeneric = current.filter((t) => t !== 'generic');
      return {
        ...prev,
        travelTypes: withoutGeneric.includes(value)
          ? withoutGeneric.filter((t) => t !== value)
          : [...withoutGeneric, value],
      };
    });
  };

  // -------------------------------------------------------------------------
  // Segment handlers
  // -------------------------------------------------------------------------

  const addSegment = () =>
    setFormData((prev) => {
      const segments = [...(prev.segments || [])];
      if (segments.length >= MAX_SEGMENTS) return prev;

      const next = blankSegment();
      // The server rejects a gap in the chain, so prefill the new leg's origin
      // from the previous leg's destination rather than let the admin discover
      // the mismatch only on submit.
      const prevSeg = segments[segments.length - 1];
      if (prevSeg?.destination?.airportCode) {
        next.origin = { ...prevSeg.destination };
      }
      return { ...prev, segments: [...segments, next] };
    });

  const removeSegment = (index) =>
    setFormData((prev) => ({
      ...prev,
      segments: prev.segments.filter((_, i) => i !== index),
    }));

  const updateSegment = (index, field, value) =>
    setFormData((prev) => ({
      ...prev,
      segments: prev.segments.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));

  const updateSegmentAirport = (index, side, code) => {
    const airport = findAirport(code, formData.flightType);
    updateSegment(index, side, {
      airportCode: code,
      airportName: airport?.name || '',
      city: airport?.city || '',
      country: airport?.country || '',
      terminal: '',
    });
  };

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  const validateForm = () => {
    const errors = {};

    if (!formData.flightNumber) {
      errors.flightNumber = 'Flight number is required';
    } else if (!/^[A-Z0-9]{2}\d{1,4}$/.test(formData.flightNumber.toUpperCase())) {
      errors.flightNumber = 'Looks like AA100 or BA1326';
    }

    if (!formData.airline) errors.airline = 'Airline is required';

    if (!formData.travelTypes?.length) {
      errors.travelTypes = 'Pick at least one travel purpose (or Generic)';
    }

    // --- route and times -----------------------------------------------------
    if (isMultiCity) {
      const segs = formData.segments || [];
      if (segs.length < 2) {
        errors.segments = 'A multi-city itinerary needs at least 2 segments';
      }

      segs.forEach((s, i) => {
        const n = i + 1;
        if (!s.origin.airportCode) errors[`segments.${i}.origin`] = `Segment ${n} needs an origin`;
        if (!s.destination.airportCode) errors[`segments.${i}.destination`] = `Segment ${n} needs a destination`;
        if (s.origin.airportCode && s.origin.airportCode === s.destination.airportCode) {
          errors[`segments.${i}.destination`] = `Segment ${n} departs and arrives at the same airport`;
        }
        if (!s.departureTime) errors[`segments.${i}.departureTime`] = `Segment ${n} needs a departure time`;
        if (!s.arrivalTime) errors[`segments.${i}.arrivalTime`] = `Segment ${n} needs an arrival time`;
        if (s.departureTime && s.arrivalTime && new Date(s.arrivalTime) <= new Date(s.departureTime)) {
          errors[`segments.${i}.arrivalTime`] = `Segment ${n} arrives before it departs`;
        }

        if (i > 0) {
          const prev = segs[i - 1];
          if (
            prev.destination.airportCode &&
            s.origin.airportCode &&
            prev.destination.airportCode !== s.origin.airportCode
          ) {
            errors[`segments.${i}.origin`] =
              `Segment ${n} must start at ${prev.destination.airportCode}, where segment ${i} lands`;
          }
          if (prev.arrivalTime && s.departureTime && new Date(s.departureTime) < new Date(prev.arrivalTime)) {
            errors[`segments.${i}.departureTime`] = `Segment ${n} departs before segment ${i} has landed`;
          }
        }
      });
    } else {
      // Only single-hop itineraries carry top-level route and times. On a
      // multi-city trip the server derives them from the segment chain.
      if (!formData.origin.airportCode) errors['origin.airportCode'] = 'Origin airport is required';
      if (!formData.destination.airportCode) errors['destination.airportCode'] = 'Destination airport is required';
      if (
        formData.origin.airportCode &&
        formData.origin.airportCode === formData.destination.airportCode
      ) {
        errors['destination.airportCode'] = 'Origin and destination cannot be the same';
      }

      if (!formData.departureTime) errors.departureTime = 'Departure time is required';
      if (!formData.arrivalTime) errors.arrivalTime = 'Arrival time is required';
      if (
        formData.departureTime &&
        formData.arrivalTime &&
        new Date(formData.arrivalTime) <= new Date(formData.departureTime)
      ) {
        errors.arrivalTime = 'Arrival must be after departure';
      }
    }

    // --- return leg ----------------------------------------------------------
    if (isRoundTrip) {
      const ret = formData.returnSegment;
      if (!ret.departureTime) errors['returnSegment.departureTime'] = 'Return departure is required';
      if (!ret.arrivalTime) errors['returnSegment.arrivalTime'] = 'Return arrival is required';
      if (ret.departureTime && ret.arrivalTime && new Date(ret.arrivalTime) <= new Date(ret.departureTime)) {
        errors['returnSegment.arrivalTime'] = 'The return arrives before it departs';
      }
      if (
        formData.arrivalTime &&
        ret.departureTime &&
        new Date(ret.departureTime) < new Date(formData.arrivalTime)
      ) {
        errors['returnSegment.departureTime'] = 'The return departs before the outbound has landed';
      }
    }

    // --- inventory -----------------------------------------------------------
    const total = Number(formData.totalSeats);
    const available = Number(formData.availableSeats);
    if (!Number.isFinite(total) || total < 1) {
      errors.totalSeats = 'Total seats must be at least 1';
    }
    if (Number.isFinite(available) && Number.isFinite(total) && available > total) {
      errors.availableSeats = 'Available seats cannot exceed total seats';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      document.querySelector('.field--error')?.focus();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        flightNumber: formData.flightNumber.toUpperCase().trim(),
        airline: formData.airline.trim(),
        aircraft: formData.aircraft?.trim() || undefined,
        flightType: formData.flightType,
        tripType: formData.tripType,
        travelTypes: formData.travelTypes,
        cabins: {
          economy: {
            totalSeats: Number(formData.totalSeats) || 0,
            availableSeats: Number(formData.availableSeats) || 0,
            price: Number(formData.price) || 0,
          },
        },
        baggageAllowance: {
          cabinKg: Number(formData.baggageAllowance.cabinKg) || 7,
          checkedKg: Number(formData.baggageAllowance.checkedKg) || 23,
        },
        isActive: formData.isActive,
      };

      if (isMultiCity) {
        // Origin, destination and the journey times are deliberately omitted:
        // the model derives them from the chain, so sending our own guess
        // would create a second source of truth that could drift.
        payload.segments = formData.segments.map((s) => ({
          origin: { ...s.origin },
          destination: { ...s.destination },
          departureTime: toIso(s.departureTime),
          arrivalTime: toIso(s.arrivalTime),
          flightNumber: s.flightNumber?.toUpperCase().trim() || undefined,
          airline: s.airline?.trim() || undefined,
        }));
      } else {
        payload.origin = { ...formData.origin };
        payload.destination = { ...formData.destination };
        payload.departureTime = toIso(formData.departureTime);
        payload.arrivalTime = toIso(formData.arrivalTime);

        if (isRoundTrip) {
          payload.returnSegment = {
            departureTime: toIso(formData.returnSegment.departureTime),
            arrivalTime: toIso(formData.returnSegment.arrivalTime),
            flightNumber: formData.returnSegment.flightNumber?.toUpperCase().trim() || undefined,
            aircraft: formData.returnSegment.aircraft?.trim() || undefined,
          };
        }
      }

      if (isEdit && initialData) {
        await flightService.update(initialData._id, payload);
      } else {
        await flightService.create(payload);
      }

      navigate('/admin/flights');
    } catch (err) {
      console.error('Error saving flight:', err);

      const data = err.response?.data;
      setError(data?.message || err.message || 'Failed to save flight');

      if (Array.isArray(data?.details)) {
        setValidationErrors(
          Object.fromEntries(data.details.map((d) => [d.field, d.message]))
        );
      }
      setLoading(false);
    }
  };

  const fieldError = (name) => validationErrors[name] || '';

  if (loading) {
    return (
      <div className="flight-form-loading">
        <Spinner label={isEdit ? 'Updating flight...' : 'Creating flight...'} />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const airportOptions = availableAirports.map((a) => (
    <option key={a.code} value={a.code}>
      {a.city}, {a.country} ({a.code})
    </option>
  ));

  return (
    <div className="flight-form-wrapper">
      <div className="flight-form-header">
        <p className="eyebrow">Administration</p>
        <h1>{isEdit ? 'Edit Flight' : 'Create Flight'}</h1>
        <p className="faint">
          {isEdit ? 'Update this itinerary.' : 'Add a new itinerary to the system.'}
        </p>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="flight-form">
        <div className="card">
          {/* ---------------------------------------------- Flight type */}
          <section className="form-section">
            <h3 className="form-section-title">Flight &amp; Trip Type</h3>
            <div className="form-row form-row--2col">
              <div className="field-group">
                <label className="field__label">
                  Flight Type <span className="required">*</span>
                </label>
                <select
                  name="flightType"
                  value={formData.flightType}
                  onChange={handleFlightTypeChange}
                  className="field"
                  required
                >
                  <option value="domestic">Domestic (within Pakistan)</option>
                  <option value="international">International</option>
                </select>
                <div className="field-helper">
                  {formData.flightType === 'domestic'
                    ? 'Airport list is limited to Pakistan.'
                    : 'Full international airport list.'}
                </div>
              </div>

              <div className="field-group">
                <label className="field__label">
                  Trip Type <span className="required">*</span>
                </label>
                <select
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleTripTypeChange}
                  className="field"
                  required
                >
                  {TRIP_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="field-helper">
                  {TRIP_TYPES.find((t) => t.value === formData.tripType)?.hint}
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------- Basics */}
          <section className="form-section">
            <h3 className="form-section-title">Flight Information</h3>
            <div className="form-row form-row--3col">
              <div className="field-group">
                <label className="field__label">
                  Flight Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleChange}
                  className={`field ${fieldError('flightNumber') ? 'field--error' : ''}`}
                  placeholder="e.g. PK123"
                  required
                />
                {fieldError('flightNumber') && (
                  <div className="field-helper field-helper--error">{fieldError('flightNumber')}</div>
                )}
              </div>

              <div className="field-group">
                <label className="field__label">
                  Airline <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="airline"
                  value={formData.airline}
                  onChange={handleChange}
                  className={`field ${fieldError('airline') ? 'field--error' : ''}`}
                  placeholder="e.g. Pakistan International Airlines"
                  required
                />
                {fieldError('airline') && (
                  <div className="field-helper field-helper--error">{fieldError('airline')}</div>
                )}
              </div>

              <div className="field-group">
                <label className="field__label">
                  Aircraft <span className="optional">(optional)</span>
                </label>
                <input
                  type="text"
                  name="aircraft"
                  value={formData.aircraft}
                  onChange={handleChange}
                  className="field"
                  placeholder="e.g. Boeing 777-300ER"
                />
              </div>
            </div>
          </section>

          {/* ---------------------------------------------- Route (non multi-city) */}
          {!isMultiCity && (
            <section className="form-section">
              <h3 className="form-section-title">Route</h3>
              <div className="form-row form-row--2col">
                <div className="field-group">
                  <label className="field__label">
                    Origin <span className="required">*</span>
                  </label>
                  <select
                    value={formData.origin.airportCode}
                    onChange={(e) => handleAirportChange('origin', e)}
                    className={`field ${fieldError('origin.airportCode') ? 'field--error' : ''}`}
                    required
                  >
                    <option value="">Select origin airport</option>
                    {airportOptions}
                  </select>
                  {fieldError('origin.airportCode') ? (
                    <div className="field-helper field-helper--error">
                      {fieldError('origin.airportCode')}
                    </div>
                  ) : (
                    formData.origin.airportName && (
                      <div className="field-helper">{formData.origin.airportName}</div>
                    )
                  )}
                </div>

                <div className="field-group">
                  <label className="field__label">
                    Destination <span className="required">*</span>
                  </label>
                  <select
                    value={formData.destination.airportCode}
                    onChange={(e) => handleAirportChange('destination', e)}
                    className={`field ${fieldError('destination.airportCode') ? 'field--error' : ''}`}
                    required
                  >
                    <option value="">Select destination airport</option>
                    {airportOptions}
                  </select>
                  {fieldError('destination.airportCode') ? (
                    <div className="field-helper field-helper--error">
                      {fieldError('destination.airportCode')}
                    </div>
                  ) : (
                    formData.destination.airportName && (
                      <div className="field-helper">{formData.destination.airportName}</div>
                    )
                  )}
                </div>
              </div>

              <div className="form-row form-row--2col">
                <div className="field-group">
                  <label className="field__label">
                    Departure Time <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleChange}
                    className={`field ${fieldError('departureTime') ? 'field--error' : ''}`}
                    required
                  />
                  {fieldError('departureTime') && (
                    <div className="field-helper field-helper--error">{fieldError('departureTime')}</div>
                  )}
                </div>

                <div className="field-group">
                  <label className="field__label">
                    Arrival Time <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleChange}
                    className={`field ${fieldError('arrivalTime') ? 'field--error' : ''}`}
                    required
                  />
                  {fieldError('arrivalTime') && (
                    <div className="field-helper field-helper--error">{fieldError('arrivalTime')}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label className="field__label">
                    Origin Terminal <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="origin.terminal"
                    value={formData.origin.terminal || ''}
                    onChange={handleChange}
                    className="field"
                    placeholder="e.g. Terminal 1"
                  />
                </div>
              </div>
            </section>
          )}

          {/* ---------------------------------------------- Return leg */}
          {isRoundTrip && (
            <section className="form-section">
              <h3 className="form-section-title">Return Leg</h3>
              <p className="faint" style={{ marginBottom: 'var(--s-3)' }}>
                Flies {formData.destination.airportCode || '—'} → {formData.origin.airportCode || '—'}.
                The route is fixed by the outbound leg; for an open-jaw return, use multi-city instead.
              </p>
              <div className="form-row form-row--3col">
                <div className="field-group">
                  <label className="field__label">
                    Return Departure <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="returnSegment.departureTime"
                    value={formData.returnSegment.departureTime}
                    onChange={handleChange}
                    className={`field ${fieldError('returnSegment.departureTime') ? 'field--error' : ''}`}
                    required
                  />
                  {fieldError('returnSegment.departureTime') && (
                    <div className="field-helper field-helper--error">
                      {fieldError('returnSegment.departureTime')}
                    </div>
                  )}
                </div>

                <div className="field-group">
                  <label className="field__label">
                    Return Arrival <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="returnSegment.arrivalTime"
                    value={formData.returnSegment.arrivalTime}
                    onChange={handleChange}
                    className={`field ${fieldError('returnSegment.arrivalTime') ? 'field--error' : ''}`}
                    required
                  />
                  {fieldError('returnSegment.arrivalTime') && (
                    <div className="field-helper field-helper--error">
                      {fieldError('returnSegment.arrivalTime')}
                    </div>
                  )}
                </div>

                <div className="field-group">
                  <label className="field__label">
                    Return Flight # <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="returnSegment.flightNumber"
                    value={formData.returnSegment.flightNumber}
                    onChange={handleChange}
                    className="field"
                    placeholder="e.g. PK234"
                  />
                </div>
              </div>
            </section>
          )}

          {/* ---------------------------------------------- Multi-city segments */}
          {isMultiCity && (
            <section className="form-section">
              <div className="form-section-header">
                <h3 className="form-section-title">Itinerary Segments</h3>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={addSegment}
                  disabled={formData.segments.length >= MAX_SEGMENTS}
                >
                  + Add Segment
                </button>
              </div>

              <p className="faint" style={{ marginBottom: 'var(--s-3)' }}>
                Each leg must start where the previous one landed. The overall route and journey
                times are taken from the first and last segment.
              </p>

              {fieldError('segments') && (
                <div className="field-helper field-helper--error">{fieldError('segments')}</div>
              )}

              {formData.segments.map((seg, i) => (
                <div key={i} className="passenger-section">
                  <h4 className="passenger-title">
                    <span>
                      Segment {i + 1}
                      {seg.origin.airportCode && seg.destination.airportCode && (
                        <span className="passenger-type">
                          {seg.origin.airportCode} → {seg.destination.airportCode}
                        </span>
                      )}
                    </span>
                    {formData.segments.length > 2 && (
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => removeSegment(i)}
                      >
                        Remove
                      </button>
                    )}
                  </h4>

                  <div className="form-row form-row--2col">
                    <div className="field-group">
                      <label className="field__label">
                        From <span className="required">*</span>
                      </label>
                      <select
                        className={`field ${fieldError(`segments.${i}.origin`) ? 'field--error' : ''}`}
                        value={seg.origin.airportCode}
                        onChange={(e) => updateSegmentAirport(i, 'origin', e.target.value)}
                        required
                      >
                        <option value="">Select airport</option>
                        {airportOptions}
                      </select>
                      {fieldError(`segments.${i}.origin`) && (
                        <div className="field-helper field-helper--error">
                          {fieldError(`segments.${i}.origin`)}
                        </div>
                      )}
                    </div>

                    <div className="field-group">
                      <label className="field__label">
                        To <span className="required">*</span>
                      </label>
                      <select
                        className={`field ${fieldError(`segments.${i}.destination`) ? 'field--error' : ''}`}
                        value={seg.destination.airportCode}
                        onChange={(e) => updateSegmentAirport(i, 'destination', e.target.value)}
                        required
                      >
                        <option value="">Select airport</option>
                        {airportOptions}
                      </select>
                      {fieldError(`segments.${i}.destination`) && (
                        <div className="field-helper field-helper--error">
                          {fieldError(`segments.${i}.destination`)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row form-row--3col">
                    <div className="field-group">
                      <label className="field__label">
                        Departure <span className="required">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className={`field ${fieldError(`segments.${i}.departureTime`) ? 'field--error' : ''}`}
                        value={seg.departureTime}
                        onChange={(e) => updateSegment(i, 'departureTime', e.target.value)}
                        required
                      />
                      {fieldError(`segments.${i}.departureTime`) && (
                        <div className="field-helper field-helper--error">
                          {fieldError(`segments.${i}.departureTime`)}
                        </div>
                      )}
                    </div>

                    <div className="field-group">
                      <label className="field__label">
                        Arrival <span className="required">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className={`field ${fieldError(`segments.${i}.arrivalTime`) ? 'field--error' : ''}`}
                        value={seg.arrivalTime}
                        onChange={(e) => updateSegment(i, 'arrivalTime', e.target.value)}
                        required
                      />
                      {fieldError(`segments.${i}.arrivalTime`) && (
                        <div className="field-helper field-helper--error">
                          {fieldError(`segments.${i}.arrivalTime`)}
                        </div>
                      )}
                    </div>

                    <div className="field-group">
                      <label className="field__label">
                        Leg Flight # <span className="optional">(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="field"
                        value={seg.flightNumber}
                        onChange={(e) => updateSegment(i, 'flightNumber', e.target.value)}
                        placeholder="Operating flight for this leg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ---------------------------------------------- Travel purposes */}
          <section className="form-section">
            <h3 className="form-section-title">Travel Purposes</h3>
            <p className="faint" style={{ marginBottom: 'var(--s-3)' }}>
              Choose <strong>Generic</strong> to make this itinerary appear under every purpose
              filter, or pick specific purposes.
            </p>

            <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {availableTravelTypes.map((type) => {
                const checked = (formData.travelTypes || []).includes(type.value);
                const dimmed =
                  type.value !== 'generic' && (formData.travelTypes || []).includes('generic');

                return (
                  <label
                    key={type.value}
                    className="field-checkbox"
                    style={{ marginRight: '1rem', opacity: dimmed ? 0.45 : 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTravelTypeToggle(type.value)}
                    />
                    <span className="checkbox-label">{type.label}</span>
                  </label>
                );
              })}
            </div>

            {fieldError('travelTypes') && (
              <div className="field-helper field-helper--error">{fieldError('travelTypes')}</div>
            )}

            {(formData.travelTypes || []).includes('generic') && (
              <div className="field-helper" style={{ marginTop: 'var(--s-2)' }}>
                Generic is selected, so this itinerary shows up in every purpose filter and the
                specific purposes above are redundant.
              </div>
            )}
          </section>

          {/* ---------------------------------------------- Pricing */}
          <section className="form-section">
            <h3 className="form-section-title">Pricing &amp; Seats</h3>
            <p className="faint" style={{ marginBottom: 'var(--s-3)' }}>
              Price and seats cover the <strong>entire itinerary</strong>, including the return leg
              or every multi-city segment — legs are not sold separately.
            </p>
            <div className="form-row form-row--3col">
              <div className="field-group">
                <label className="field__label">
                  Price (PKR) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="field"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div className="field-group">
                <label className="field__label">
                  Total Seats <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  className={`field ${fieldError('totalSeats') ? 'field--error' : ''}`}
                  min="1"
                  required
                />
                {fieldError('totalSeats') && (
                  <div className="field-helper field-helper--error">{fieldError('totalSeats')}</div>
                )}
              </div>

              <div className="field-group">
                <label className="field__label">
                  Available Seats <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  className={`field ${fieldError('availableSeats') ? 'field--error' : ''}`}
                  min="0"
                  required
                />
                {fieldError('availableSeats') && (
                  <div className="field-helper field-helper--error">
                    {fieldError('availableSeats')}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ---------------------------------------------- Baggage */}
          <section className="form-section">
            <h3 className="form-section-title">Baggage Allowance (kg)</h3>
            <div className="form-row form-row--2col">
              <div className="field-group">
                <label className="field__label">Cabin Baggage</label>
                <input
                  type="number"
                  name="baggageAllowance.cabinKg"
                  value={formData.baggageAllowance.cabinKg}
                  onChange={handleChange}
                  className="field"
                  min="0"
                />
              </div>
              <div className="field-group">
                <label className="field__label">Checked Baggage</label>
                <input
                  type="number"
                  name="baggageAllowance.checkedKg"
                  value={formData.baggageAllowance.checkedKg}
                  onChange={handleChange}
                  className="field"
                  min="0"
                />
              </div>
            </div>
          </section>

          {/* ---------------------------------------------- Status */}
          <section className="form-section">
            <h3 className="form-section-title">Status</h3>
            <div className="form-row">
              <div className="field-group">
                <label className="field-checkbox">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span className="checkbox-label">Active (visible to customers)</span>
                </label>
              </div>
            </div>
          </section>

          <div className="form-actions">
            <Link to="/admin/flights" className="btn btn--ghost">
              Cancel
            </Link>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Flight' : 'Create Flight'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}