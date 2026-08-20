import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import bookingService from '../services/bookings';
import { flightService } from '../services/flights';
import { settingsService } from '../services/settings';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { date, dateTime, money, plural, time, titleCase } from '../utils/format';
import Tag from '../components/ui/Tag';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import './BookingDetails.css';

// Status options for admin
const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed'];

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'info',
  };
  return colors[status] || 'secondary';
};

const formatStatus = (status) => {
  if (!status) return 'N/A';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function BookingDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.created ? 'Booking held. Pay to confirm your seats.' : '');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reason, setReason] = useState('');
  
  // Popup state
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error', // 'error' | 'success' | 'warning' | 'info'
    onConfirm: null,
    confirmText: 'OK',
    showCancel: false,
  });

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const bookingResponse = await bookingService.get(id);
      // 

      const bookingData = bookingResponse.data;

      // If booking has a flight ID, fetch full flight details
      if (bookingData.flight || bookingData.flightDetails) {
        try {
          let flightId = null;

          if (bookingData.flight) {
            if (typeof bookingData.flight === 'string') {
              flightId = bookingData.flight;
            } else if (typeof bookingData.flight === 'object' && bookingData.flight._id) {
              flightId = bookingData.flight._id;
            } else if (typeof bookingData.flight === 'object' && bookingData.flight.id) {
              flightId = bookingData.flight.id;
            }
          }

          if (!flightId && bookingData.flightDetails) {
            if (bookingData.flightDetails.flightId) {
              flightId = bookingData.flightDetails.flightId;
            }
          }

          if (flightId) {
            // 
            const flightResponse = await flightService.get(flightId);
            // 

            const fullFlightData = {
              ...bookingData.flightDetails,
              ...flightResponse.data,
              departureTime: flightResponse.data.departureTime || flightResponse.data.departureDate || bookingData.flightDetails?.departureDate,
              arrivalTime: flightResponse.data.arrivalTime || flightResponse.data.arrivalDate || bookingData.flightDetails?.arrivalDate,
              departureDate: flightResponse.data.departureTime || flightResponse.data.departureDate || bookingData.flightDetails?.departureDate,
              arrivalDate: flightResponse.data.arrivalTime || flightResponse.data.arrivalDate || bookingData.flightDetails?.arrivalDate,
              flightType: flightResponse.data.flightType || bookingData.flightDetails?.flightType || 'international',
              travelTypes: flightResponse.data.travelTypes || bookingData.flightDetails?.travelTypes || [],
            };

            bookingData.flightDetails = fullFlightData;
            bookingData.flight = fullFlightData;
          }
        } catch (flightErr) {
          
        }
      }

      setBooking(bookingData);
      setError('');
    } catch (err) {
      console.error('❌ Error loading booking:', err);
      console.error('❌ Error response:', err.response);

      let errorMessage = err instanceof ApiError ? err.message : 'Could not load this booking.';

      if (err.response?.status === 404) {
        errorMessage = `Booking with ID "${id}" was not found.`;
      } else if (err.response?.status === 401) {
        errorMessage = 'You are not authorized to view this booking. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to view this booking.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // Show popup
  const showPopup = (title, message, type = 'error', confirmText = 'OK', onConfirm = null, showCancel = false) => {
    setPopup({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      showCancel,
    });
  };

  // Close popup
  const closePopup = () => {
    setPopup({
      ...popup,
      isOpen: false,
    });
  };

  // Check if cancellation is allowed based on settings
  const checkCancellationAllowed = async () => {
    try {
      // Get settings
      const settingsRes = await settingsService.get();
      const settings = settingsRes.data;
      
      // Check if cancellation is enabled
      if (!settings.cancellation?.enabled) {
        showPopup(
          'Cancellation Not Available',
          'Cancellations are currently disabled by the administrator.',
          'warning'
        );
        return false;
      }

      // Get the flight departure time
      const flight = booking.flight || booking.flightDetails;
      if (!flight || !flight.departureTime) {
        showPopup(
          'Error',
          'Cannot determine departure time. Please contact support.',
          'error'
        );
        return false;
      }

      const departureTime = new Date(flight.departureTime);
      const now = new Date();
      const allowedUntilHours = settings.cancellation?.allowedUntilHours || 24;

      // Calculate hours until departure
      const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

      // 

      // Check if departure time has already passed
      if (hoursUntilDeparture < 0) {
        const absHours = Math.abs(hoursUntilDeparture);
        const hoursPast = Math.floor(absHours);
        const minutesPast = Math.floor((absHours - hoursPast) * 60);
        
        let timePast = '';
        if (hoursPast > 0) {
          timePast = `${hoursPast} hour${hoursPast > 1 ? 's' : ''}`;
          if (minutesPast > 0) {
            timePast += ` and ${minutesPast} minute${minutesPast > 1 ? 's' : ''}`;
          }
        } else {
          timePast = `${minutesPast} minute${minutesPast > 1 ? 's' : ''}`;
        }
        
        showPopup(
          'Cannot Cancel',
          `The flight departed ${timePast} ago. Cancellation is no longer possible.`,
          'error'
        );
        return false;
      }

      // Check if cancellation is within the allowed window
      if (hoursUntilDeparture < allowedUntilHours) {
        const hoursLeft = Math.floor(hoursUntilDeparture);
        const minutesLeft = Math.floor((hoursUntilDeparture - hoursLeft) * 60);
        
        let timeMessage = '';
        if (hoursLeft > 0) {
          timeMessage = `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`;
          if (minutesLeft > 0) {
            timeMessage += ` and ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;
          }
        } else {
          timeMessage = `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;
        }

        showPopup(
          'Cannot Cancel',
          `Cancellation is not allowed within ${allowedUntilHours} hours of departure.\n\nDeparture is in ${timeMessage}.`,
          'warning'
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Error checking cancellation settings:', err);
      showPopup(
        'Error',
        'Could not check cancellation policy. Please try again.',
        'error'
      );
      return false;
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Change booking status to "${formatStatus(newStatus)}"?`)) return;

    setUpdatingStatus(true);
    setError('');

    try {

      let response;

      if (newStatus === 'confirmed') {
        
        response = await bookingService.markPaid(id, {
          paymentMethod: 'system',
          transactionId: `ADMIN-${Date.now()}`
        });
      } else {
        
        response = await bookingService.updateStatus(id, newStatus);
      }

      setNotice(`Booking status updated to ${formatStatus(newStatus)}`);
      await load();
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error('❌ Error updating status:', err);
      console.error('❌ Error response:', err.response?.data);

      let errorMsg = 'Could not update booking.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      const res = await bookingService.cancel(id, reason);
      setBooking(res.data);
      setConfirmCancel(false);
      
      // Show success popup
      const refundAmount = res.refund?.refundAmount || 0;
      const currency = res.data.pricing?.currency || 'PKR';
      const message = refundAmount > 0
        ? `Booking cancelled successfully. ${money(refundAmount, currency)} will be refunded.`
        : 'Booking cancelled successfully.';
      
      showPopup(
        'Booking Cancelled',
        message,
        'success',
        'OK',
        () => {
          closePopup();
          navigate(isAdmin ? '/admin/bookings' : '/bookings');
        }
      );
      
    } catch (err) {
      showPopup(
        'Error',
        err instanceof ApiError ? err.message : 'Could not cancel this booking.',
        'error'
      );
    } finally {
      setCancelling(false);
    }
  };

  // Handle cancel button click - check policy first
  const handleCancelClick = async () => {
    const allowed = await checkCancellationAllowed();
    if (allowed) {
      setConfirmCancel(true);
    }
  };

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getPassengersArray = (bookingData) => {
    if (!bookingData) return [];
    if (Array.isArray(bookingData.passengers)) {
      return bookingData.passengers;
    }
    if (typeof bookingData.passengers === 'string') {
      try {
        const parsed = JSON.parse(bookingData.passengers);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { }
    }
    return [];
  };

  const getPassengerCounts = (bookingData) => {
    if (!bookingData) return { adults: 0, infants: 0, totalSeats: 0 };
    if (bookingData.passengerCounts) {
      return bookingData.passengerCounts;
    }
    const passengers = getPassengersArray(bookingData);
    const adults = passengers.filter(p => p.type === 'adult').length;
    const infants = passengers.filter(p => p.type === 'infant').length;
    return {
      adults: adults || 1,
      infants: infants || 0,
      totalSeats: adults + infants || 1,
    };
  };

  const getFlightData = (bookingData) => {
    if (!bookingData) return {};
    if (bookingData.flightDetails && typeof bookingData.flightDetails === 'object') {
      return bookingData.flightDetails;
    }
    if (bookingData.flight && typeof bookingData.flight === 'object') {
      return bookingData.flight;
    }
    return {};
  };

  const getPricingData = (bookingData) => {
    if (!bookingData) return {};
    return bookingData.pricing || {};
  };

  const getTotalPassengers = (bookingData) => {
    if (!bookingData) return 0;
    const counts = getPassengerCounts(bookingData);
    return counts.adults + counts.infants;
  };

  const formatPassengerName = (passenger) => {
    if (!passenger) return 'N/A';
    if (passenger.firstName || passenger.lastName) {
      let name = '';
      if (passenger.title) name += passenger.title + ' ';
      if (passenger.firstName) name += passenger.firstName + ' ';
      if (passenger.lastName) name += passenger.lastName;
      return name.trim() || 'N/A';
    }
    if (passenger.name) return passenger.name;
    return 'N/A';
  };

  const getPassengerType = (passenger) => {
    if (!passenger) return 'N/A';
    if (passenger.type) return titleCase(passenger.type);
    return 'Adult';
  };

  if (loading) {
    return (
      <div className="wrap center" style={{ padding: 'var(--s-8) 0' }}>
        <Spinner label="Loading booking..." />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="wrap">
        <Alert kind="error">
          <strong>Error Loading Booking</strong>
          <p style={{ marginTop: '0.5rem', marginBottom: '0' }}>{error}</p>
        </Alert>
        <div style={{ marginTop: 'var(--s-4)', display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
          <Link className="btn btn--ghost" to={isAdmin ? "/admin/bookings" : "/bookings"}>
            ← Back to bookings
          </Link>
          <button className="btn btn--primary" onClick={() => navigate(0)}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="wrap">
        <Alert kind="error">Booking not found</Alert>
        <Link className="btn btn--ghost" to={isAdmin ? "/admin/bookings" : "/bookings"} style={{ marginTop: 'var(--s-4)' }}>
          ← Back to bookings
        </Link>
      </div>
    );
  }

  const flight = getFlightData(booking);
  const pricing = getPricingData(booking);
  const passengers = getPassengersArray(booking);
  const totalPassengers = getTotalPassengers(booking);
  const passengerCounts = getPassengerCounts(booking);
  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const isCancelled = booking.status === 'cancelled';

  const customerDetails = booking.customerDetails || {};
  const flightType = booking.flightType || flight?.flightType || 'Not specified';
  const travelTypes = booking.travelTypes || flight?.travelTypes || [];

  return (
    <div className="wrap stack">
      {/* ============================================================
          POPUP MODAL
          ============================================================ */}
      {popup.isOpen && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className={`popup-icon popup-icon--${popup.type}`}>
              {popup.type === 'error' && '❌'}
              {popup.type === 'success' && '✅'}
              {popup.type === 'warning' && '⚠️'}
              {popup.type === 'info' && 'ℹ️'}
            </div>
            <h2 className={`popup-title popup-title--${popup.type}`}>
              {popup.title}
            </h2>
            <p className="popup-message">{popup.message}</p>
            <div className="popup-actions">
              {popup.showCancel && (
                <button 
                  className="btn btn--ghost" 
                  onClick={closePopup}
                >
                  Cancel
                </button>
              )}
              <button 
                className={`btn btn--${popup.type === 'success' ? 'primary' : popup.type === 'warning' ? 'warning' : 'danger'}`}
                onClick={() => {
                  if (popup.onConfirm) {
                    popup.onConfirm();
                  } else {
                    closePopup();
                  }
                }}
              >
                {popup.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Link to={isAdmin ? "/admin/bookings" : "/bookings"} className="eyebrow" style={{ textDecoration: 'none' }}>
        ← {isAdmin ? 'All bookings (Admin)' : 'All bookings'}
      </Link>

      {notice && <Alert kind="success">{notice}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      <div className="pass">
        <div className="pass__body">
          <div className="row row--between row--wrap">
            <div>
              <span className="eyebrow">Booking</span>
              <div className="row" style={{ gap: 'var(--s-3)' }}>
                <Tag status={getStatusColor(booking.status)}>
                  {formatStatus(booking.status)}
                </Tag>
                <Tag status={booking.paymentStatus || 'unpaid'}>
                  {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                </Tag>
              </div>
            </div>
            {flight && <span className="mono muted">{flight.flightNumber}</span>}
          </div>

          {flight ? (
            <>
              <div className="pass__route">
                <span className="pass__leg">
                  <span className="pass__iata">{flight.origin?.airportCode || 'N/A'}</span>
                  <span className="muted">{flight.origin?.city || ''}</span>
                </span>
                <span className="pass__arrow" aria-hidden="true" />
                <span className="pass__leg">
                  <span className="pass__iata">{flight.destination?.airportCode || 'N/A'}</span>
                  <span className="muted">{flight.destination?.city || ''}</span>
                </span>
              </div>

              <div className="grid grid--3">
                <div>
                  <span className="eyebrow">Departs</span>
                  <div className="mono">
                    {flight.departureTime ? time(flight.departureTime) :
                      flight.departureDate ? time(flight.departureDate) :
                        'N/A'}
                  </div>
                  <span className="faint" style={{ fontSize: 'var(--step--1)' }}>
                    {flight.departureTime ? date(flight.departureTime) :
                      flight.departureDate ? date(flight.departureDate) :
                        'N/A'}
                  </span>
                </div>
                <div>
                  <span className="eyebrow">Arrives</span>
                  <div className="mono">
                    {flight.arrivalTime ? time(flight.arrivalTime) :
                      flight.arrivalDate ? time(flight.arrivalDate) :
                        <span style={{ color: 'var(--text-light)' }}>Not specified</span>}
                  </div>
                  <span className="faint" style={{ fontSize: 'var(--step--1)' }}>
                    {flight.arrivalTime ? date(flight.arrivalTime) :
                      flight.arrivalDate ? date(flight.arrivalDate) :
                        'Check flight details'}
                  </span>
                </div>
                <div>
                  <span className="eyebrow">Passengers</span>
                  <div>{totalPassengers}</div>
                  <span className="faint" style={{ fontSize: 'var(--step--1)' }}>
                    {passengerCounts.adults || 0} Adult{passengerCounts.adults !== 1 ? 's' : ''}
                    {passengerCounts.infants > 0 && `, ${passengerCounts.infants} Infant${passengerCounts.infants !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              <div className="grid grid--3" style={{ marginTop: 'var(--s-3)', paddingTop: 'var(--s-3)', borderTop: '1px solid var(--rule)' }}>
                <div>
                  <span className="eyebrow">Flight Type</span>
                  <div>
                    <span className={`flight-type-badge ${flightType === 'international' ? 'international' : 'domestic'}`}>
                      {flightType === 'international' ? '🌍 International' : '🏠 Domestic'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="eyebrow">Travel Types</span>
                  <div>
                    {travelTypes && travelTypes.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {travelTypes.map((type, index) => (
                          <span key={index} className="travel-type-tag">
                            {titleCase(type)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="faint">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="muted">Flight details are no longer available.</p>
          )}
        </div>

        <div className="pass__stub">
          <span className="eyebrow">Reference</span>
          <span className="pass__ref">{booking.bookingReference}</span>
          <span className="faint" style={{ fontSize: 'var(--step--1)' }}>
            Booked {date(booking.createdAt)}
          </span>
        </div>
      </div>

      {/* Customer Details Card */}
      <div className="card">
        <h2 style={{ marginBottom: 'var(--s-4)' }}>Contact Details</h2>
        <div className="grid grid--3" style={{ gap: 'var(--s-4)' }}>
          <div>
            <span className="eyebrow">Full Name</span>
            <div className="mono" style={{ fontWeight: '600' }}>{customerDetails.name || 'N/A'}</div>
          </div>
          <div>
            <span className="eyebrow">Email</span>
            <div>{customerDetails.email || 'N/A'}</div>
          </div>
          <div>
            <span className="eyebrow">Phone</span>
            <div className="mono">{customerDetails.phone || 'N/A'}</div>
          </div>
          {customerDetails.specialRequests && (
            <div style={{ gridColumn: 'span 3' }}>
              <span className="eyebrow">Special Requests</span>
              <div style={{ fontWeight: '500', color: '#1a2332' }}>{customerDetails.specialRequests}</div>
            </div>
          )}
        </div>
      </div>

      {/* Travellers Card */}
      <div className="card">
        <h2 style={{ marginBottom: 'var(--s-4)' }}>Travellers</h2>

        <div style={{ marginBottom: 'var(--s-4)', padding: 'var(--s-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span className="eyebrow">Passenger Summary</span>
          <div style={{ display: 'flex', gap: 'var(--s-4)', marginTop: 'var(--s-2)' }}>
            <span><strong>{passengerCounts.adults || 0}</strong> Adult{passengerCounts.adults !== 1 ? 's' : ''}</span>
            {passengerCounts.infants > 0 && (
              <span><strong>{passengerCounts.infants}</strong> Infant{passengerCounts.infants !== 1 ? 's' : ''}</span>
            )}
            <span><strong>{passengerCounts.totalSeats || totalPassengers}</strong> Total Seats</span>
          </div>
        </div>

        <div className="table__scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Date of Birth</th>
                <th>CNIC / B-Form</th>
                <th>Passport Number</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {passengers && passengers.length > 0 ? (
                passengers.map((p, index) => (
                  <tr key={p._id || index}>
                    <td>
                      <strong style={{ fontSize: '15px' }}>{formatPassengerName(p)}</strong>
                      {p.title && <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginLeft: '4px' }}>({p.title})</span>}
                    </td>
                    <td>{getPassengerType(p)}</td>
                    <td className="mono">{p.dateOfBirth ? date(p.dateOfBirth) : '—'}</td>
                    <td className="mono" style={{ fontWeight: '700', color: '#1a2332', fontSize: '14px' }}>
                      {p.cnic || '—'}
                    </td>
                    <td className="mono" style={{ fontWeight: '700', color: '#1a2332', fontSize: '14px' }}>
                      {p.passportNumber || '—'}
                    </td>
                    <td style={{ fontWeight: '500' }}>{p.address || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="center">
                    {totalPassengers > 0 ? 'Passenger details not available' : 'No passengers in this booking'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fare Card */}
      <div className="card">
        <h2 style={{ marginBottom: 'var(--s-4)' }}>Fare</h2>
        <table className="table">
          <tbody>
            <tr>
              <td>
                {pricing.pricePerSeat ? money(pricing.pricePerSeat, pricing.currency || 'PKR') :
                  pricing.adultPrice ? money(pricing.adultPrice, pricing.currency || 'PKR') :
                    flight.price ? money(flight.price, pricing.currency || 'PKR') : 'N/A'}
                × {pricing.seatCount || totalPassengers || 0}
              </td>
              <td className="right mono">
                {pricing.subtotal ? money(pricing.subtotal, pricing.currency || 'PKR') :
                  pricing.totalAmount ? money(pricing.totalAmount, pricing.currency || 'PKR') :
                    'N/A'}
              </td>
            </tr>
            {pricing.taxes > 0 && (
              <tr>
                <td>Taxes</td>
                <td className="right mono">{money(pricing.taxes, pricing.currency || 'PKR')}</td>
              </tr>
            )}
            {pricing.fees > 0 && (
              <tr>
                <td>Service fee</td>
                <td className="right mono">{money(pricing.fees, pricing.currency || 'PKR')}</td>
              </tr>
            )}
            <tr>
              <td>
                <strong>Total</strong>
              </td>
              <td className="right mono">
                <strong>
                  {pricing.totalAmount ? money(pricing.totalAmount, pricing.currency || 'PKR') :
                    pricing.subtotal ? money(pricing.subtotal, pricing.currency || 'PKR') :
                      'N/A'}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>

        {booking.cancellation?.cancelledAt && (
          <Alert kind="info">
            Cancelled {dateTime(booking.cancellation.cancelledAt)}
            {booking.cancellation.refundAmount != null &&
              ` · refund ${money(booking.cancellation.refundAmount, pricing?.currency || 'PKR')}`}
          </Alert>
        )}
      </div>

      {/* Admin Status Management */}
      {isAdmin && (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--s-3)' }}>Manage Booking Status</h3>
          <div className="row row--wrap" style={{ gap: 'var(--s-3)', alignItems: 'center' }}>
            <div className="field-group" style={{ flex: 1, minWidth: '200px' }}>
              <label className="field__label">Change Status</label>
              <select
                value={booking.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="field"
                disabled={updatingStatus || isCancelled}
                style={{ maxWidth: '300px' }}
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
              {isCancelled && (
                <span className="field-helper" style={{ color: 'var(--danger)' }}>
                  This booking is cancelled and cannot be changed.
                </span>
              )}
              {updatingStatus && <span className="field-helper">Updating...</span>}
            </div>

            {!isCancelled && (
              <button
                className="btn btn--danger"
                onClick={handleCancelClick}
                style={{ marginTop: 'var(--s-2)' }}
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className="card stack">
          <h3>Cancel this booking?</h3>
          <p className="muted">
            Seats are released immediately. Any refund follows the fare rules and appears in your ledger.
          </p>
          <label className="field">
            <span className="field__label">Reason (optional)</span>
            <input
              className="field__input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
          </label>
          <div className="row">
            <button className="btn btn--danger" onClick={cancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Yes, cancel booking'}
            </button>
            <button className="btn btn--ghost" onClick={() => {
              setConfirmCancel(false);
            }} disabled={cancelling}>
              Keep booking
            </button>
          </div>
        </div>
      )}

      {!isAdmin && canCancel && !isCancelled && !confirmCancel && (
        <button className="btn btn--danger" onClick={handleCancelClick}>
          Cancel booking
        </button>
      )}
    </div>
  );
}