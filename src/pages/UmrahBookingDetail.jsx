// frontend/src/pages/UmrahBookingDetail.jsx
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { umrahService } from '../services/umrah';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { date, dateTime, money, titleCase } from '../utils/format';
import Swal from 'sweetalert2';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Tag from '../components/ui/Tag';
import './UmrahBookingDetail.css';

export default function UmrahBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await umrahService.getBooking(id);
      setBooking(response.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info'
    };
    return colors[status] || 'secondary';
  };

  const getRoomLabel = (type) => {
    const map = { quad: 'Quad Sharing', triple: 'Triple Sharing', double: 'Double Sharing', single: 'Single', sharing: 'Sharing' };
    return map[type] || type || 'N/A';
  };

  const getPassengerTypeLabel = (type) => {
    const map = { adult: 'Adult', child: 'Child', infant: 'Infant' };
    return map[type] || type || 'N/A';
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Reason Required',
        text: 'Please provide a reason for cancellation.',
        confirmButtonColor: '#0a2463',
        confirmButtonText: 'OK'
      });
      return;
    }

    setCancelling(true);
    try {
      const response = await umrahService.cancelBooking(id, cancelReason);
      setBooking(response.data);
      setShowCancelConfirm(false);
      setCancelReason('');

      Swal.fire({
        icon: 'success',
        title: 'Booking Cancelled',
        text: `Booking ${response.data.bookingReference} has been cancelled successfully.`,
        confirmButtonColor: '#0a2463',
        confirmButtonText: 'OK'
      });

      loadBooking();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text: err instanceof ApiError ? err.message : 'Could not cancel booking. Please try again.',
        confirmButtonColor: '#0a2463',
        confirmButtonText: 'OK'
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Change booking status to "${titleCase(newStatus)}"?`)) return;

    try {
      await umrahService.updateBookingStatus(id, newStatus);
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Booking status changed to ${titleCase(newStatus)}.`,
        confirmButtonColor: '#0a2463',
        confirmButtonText: 'OK'
      });
      loadBooking();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err instanceof ApiError ? err.message : 'Could not update status.',
        confirmButtonColor: '#0a2463',
        confirmButtonText: 'OK'
      });
    }
  };

  if (loading) {
    return (
      <div className="umrah-booking-detail-wrapper">
        <div className="center" style={{ padding: '48px 0' }}>
          <Spinner label="Loading booking details..." />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="umrah-booking-detail-wrapper">
        <Alert kind="error">{error || 'Booking not found.'}</Alert>
        <Link to={isAdmin ? '/admin/umrah/bookings' : '/umrah/bookings'} className="btn btn--ghost" style={{ marginTop: '1rem' }}>
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const isCancelled = booking.status === 'cancelled';
  
  // Check if origin/destination are custom
  const isOriginCustom = booking.package?.origin?.airportCode === 'CUSTOM' || 
    (booking.package?.origin?.airportCode && !['JED', 'RUH', 'DMM', 'MED', 'TIF', 'AHB', 'GIZ', 'HOF', 'TUU', 'EJN', 'ELQ', 'HBT', 'RAE', 'URY', 'YNB', 'AQI', 'NQS', 'DHA', 'ISB', 'LHE', 'KHI', 'PEW', 'MUX', 'SKT', 'UET', 'LYP', 'GWD', 'RYK', 'KDU', 'GIL', 'CJL', 'DSK', 'PAJ', 'DBA', 'SGI', 'MWD', 'ZIA', 'DXB', 'AUH', 'SHJ', 'RKT', 'DOH', 'BAH', 'KWI', 'MCT', 'SLL', 'IST', 'SAW', 'ANK', 'LHR', 'LGW', 'MAN', 'BHX', 'JFK', 'LAX', 'ORD', 'IAH', 'CDG', 'FRA', 'AMS', 'SIN', 'KUL', 'BKK', 'NRT', 'ICN', 'HKG', 'BEY', 'AMM', 'CAI', 'JNB'].includes(booking.package?.origin?.airportCode));
  
  const isDestCustom = booking.package?.destination?.airportCode === 'CUSTOM' || 
    (booking.package?.destination?.airportCode && !['JED', 'RUH', 'DMM', 'MED', 'TIF', 'AHB', 'GIZ', 'HOF', 'TUU', 'EJN', 'ELQ', 'HBT', 'RAE', 'URY', 'YNB', 'AQI', 'NQS', 'DHA', 'ISB', 'LHE', 'KHI', 'PEW', 'MUX', 'SKT', 'UET', 'LYP', 'GWD', 'RYK', 'KDU', 'GIL', 'CJL', 'DSK', 'PAJ', 'DBA', 'SGI', 'MWD', 'ZIA', 'DXB', 'AUH', 'SHJ', 'RKT', 'DOH', 'BAH', 'KWI', 'MCT', 'SLL', 'IST', 'SAW', 'ANK', 'LHR', 'LGW', 'MAN', 'BHX', 'JFK', 'LAX', 'ORD', 'IAH', 'CDG', 'FRA', 'AMS', 'SIN', 'KUL', 'BKK', 'NRT', 'ICN', 'HKG', 'BEY', 'AMM', 'CAI', 'JNB'].includes(booking.package?.destination?.airportCode));

  return (
    <div className="umrah-booking-detail-wrapper">
      <Link to={isAdmin ? '/admin/umrah/bookings' : '/umrah/bookings'} className="eyebrow" style={{ textDecoration: 'none' }}>
        ← Back to {isAdmin ? 'All Bookings' : 'My Bookings'}
      </Link>

      <div className="umrah-booking-detail">
        {/* Header */}
        <div className="detail-header">
          <div className="header-left">
            <h1>Umrah Booking</h1>
            <div className="booking-reference">
              <span className="ref">{booking.bookingReference}</span>
              <span className="date">Booked on {date(booking.createdAt)}</span>
            </div>
          </div>
          <div className="header-right">
            <Tag status={getStatusColor(booking.status)}>
              {titleCase(booking.status)}
            </Tag>
            <Tag status={booking.paymentStatus === 'paid' ? 'success' : 'warning'}>
              {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            </Tag>
          </div>
        </div>

        {/* Package Details */}
        <div className="detail-section package-section">
          <h2>Package Details</h2>
          <div className="package-info">
            <div className="package-name">
              <h3>{booking.package?.packageName || 'N/A'}</h3>
              <div className="package-meta">
                <span className="airline">{booking.package?.airline || 'N/A'}</span>
                <span className="flight">{booking.package?.flightNumber || 'N/A'}</span>
              </div>
            </div>
            <div className="package-route">
              <div className="route-point">
                <span className="code">
                  {isOriginCustom ? '✈️' : (booking.package?.origin?.airportCode || 'N/A')}
                </span>
                <span className="city">
                  {isOriginCustom ? booking.package?.origin?.city || 'Custom' : (booking.package?.origin?.city || 'N/A')}
                </span>
              </div>
              <span className="arrow">→</span>
              <div className="route-point">
                <span className="code">
                  {isDestCustom ? '✈️' : (booking.package?.destination?.airportCode || 'N/A')}
                </span>
                <span className="city">
                  {isDestCustom ? booking.package?.destination?.city || 'Custom' : (booking.package?.destination?.city || 'N/A')}
                </span>
              </div>
            </div>
            <div className="package-dates">
              <div className="date-item">
                <span className="label">Departure</span>
                <span className="value">{date(booking.package?.departureDate)}</span>
              </div>
              <div className="date-item">
                <span className="label">Return</span>
                <span className="value">{date(booking.package?.returnDate)}</span>
              </div>
              <div className="date-item">
                <span className="label">Duration</span>
                <span className="value">{booking.package?.duration || 0} Days</span>
              </div>
            </div>

            {/* ✨ Baggage Information */}
            {(booking.package?.baggageAllowance?.departure || 
              booking.package?.baggageAllowance?.arrival || 
              booking.package?.baggageAllowance?.return) && (
              <div className="package-baggage">
                <span className="baggage-label">Baggage Allowance</span>
                <div className="baggage-items">
                  {booking.package?.baggageAllowance?.departure && (
                    <span className="baggage-item">
                      🛫 Departure: {booking.package.baggageAllowance.departure}
                    </span>
                  )}
                  {booking.package?.baggageAllowance?.arrival && (
                    <span className="baggage-item">
                      🛬 Arrival: {booking.package.baggageAllowance.arrival}
                    </span>
                  )}
                  {booking.package?.baggageAllowance?.return && (
                    <span className="baggage-item return-baggage">
                      🔄 Return: {booking.package.baggageAllowance.return}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Details */}
        <div className="detail-section hotels-section">
          <h2>Hotel Details</h2>
          <div className="hotels-grid">
            <div className="hotel-card">
              <div className="hotel-city">🕋 Makkah</div>
              <div className="hotel-name">{booking.package?.makkahHotel?.name || 'N/A'}</div>
              <div className="hotel-detail">
                <span>{booking.package?.makkahHotel?.distance || ''}</span>
                <span>{booking.package?.makkahHotel?.nights || 0} Nights</span>
              </div>
            </div>
            {booking.package?.makkahReturnHotel?.name && (
              <div className="hotel-card">
                <div className="hotel-city">🕋 Makkah (Return)</div>
                <div className="hotel-name">{booking.package.makkahReturnHotel.name}</div>
                <div className="hotel-detail">
                  <span>{booking.package.makkahReturnHotel.distance || ''}</span>
                  <span>{booking.package.makkahReturnHotel.nights || 0} Nights</span>
                </div>
              </div>
            )}
            <div className="hotel-card">
              <div className="hotel-city">🕌 Madinah</div>
              <div className="hotel-name">{booking.package?.madinahHotel?.name || 'N/A'}</div>
              <div className="hotel-detail">
                <span>{booking.package?.madinahHotel?.distance || ''}</span>
                <span>{booking.package?.madinahHotel?.nights || 0} Nights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Room & Pricing */}
        <div className="detail-section pricing-section">
          <h2>Room & Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-item">
              <span className="label">Room Type</span>
              <span className="value">{getRoomLabel(booking.roomType)}</span>
            </div>
            <div className="pricing-item">
              <span className="label">Base Price (Per Person)</span>
              <span className="value">{money(booking.pricing?.basePrice || 0, booking.pricing?.currency || 'PKR')}</span>
            </div>
            <div className="pricing-item">
              <span className="label">Sharing Price</span>
              <span className="value">{money(booking.pricing?.sharingPrice || 0, booking.pricing?.currency || 'PKR')}</span>
            </div>
            <div className="pricing-item total">
              <span className="label">Total Amount</span>
              <span className="value">{money(booking.pricing?.totalAmount || 0, booking.pricing?.currency || 'PKR')}</span>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="detail-section passengers-section">
          <h2>Passengers ({booking.passengers?.length || 0})</h2>
          <div className="passengers-table-wrapper">
            <table className="passengers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Date of Birth</th>
                  <th>CNIC / B-Form</th>
                  <th>Passport</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers && booking.passengers.length > 0 ? (
                  booking.passengers.map((p, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="passenger-name">
                          {p.title} {p.firstName} {p.lastName}
                        </span>
                      </td>
                      <td>{getPassengerTypeLabel(p.type)}</td>
                      <td>{p.dateOfBirth ? date(p.dateOfBirth) : 'N/A'}</td>
                      <td className="mono">{p.cnic || 'N/A'}</td>
                      <td className="mono">{p.passportNumber || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="center">No passenger details available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ziyarat Details */}
        {booking.ziyaratEnabled && (
          <div className="detail-section ziyarat-section">
            <h2>🕌 Ziyarat Package</h2>
            <div className="ziyarat-info">
              <p style={{ fontWeight: '600', color: 'var(--umrah-gold)' }}>
                + {money(booking.ziyaratPrice || 0, booking.pricing?.currency || 'PKR')}
              </p>
              <p style={{ color: 'var(--umrah-text-secondary)', marginTop: '4px' }}>
                Guided Ziyarat tour included
              </p>
            </div>
          </div>
        )}

        {/* Customer Details */}
        <div className="detail-section customer-section">
          <h2>Contact Details</h2>
          <div className="customer-grid">
            <div className="customer-item">
              <span className="label">Full Name</span>
              <span className="value">{booking.customerDetails?.name || 'N/A'}</span>
            </div>
            <div className="customer-item">
              <span className="label">Email</span>
              <span className="value">{booking.customerDetails?.email || 'N/A'}</span>
            </div>
            <div className="customer-item">
              <span className="label">Phone</span>
              <span className="value">{booking.customerDetails?.phone || 'N/A'}</span>
            </div>
            <div className="customer-item">
              <span className="label">Address</span>
              <span className="value">{booking.customerDetails?.address || 'N/A'}</span>
            </div>
            <div className="customer-item">
              <span className="label">CNIC</span>
              <span className="value mono">{booking.customerDetails?.cnic || 'N/A'}</span>
            </div>
            <div className="customer-item">
              <span className="label">Passport</span>
              <span className="value mono">{booking.customerDetails?.passportNumber || 'N/A'}</span>
            </div>
            {booking.specialRequests && (
              <div className="customer-item full">
                <span className="label">Special Requests</span>
                <span className="value">{booking.specialRequests}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status History (Admin) */}
        {isAdmin && booking.statusHistory && booking.statusHistory.length > 0 && (
          <div className="detail-section history-section">
            <h2>Status History</h2>
            <div className="history-list">
              {booking.statusHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <span className={`status-dot status-dot--${item.status}`}></span>
                  <span className="history-status">{titleCase(item.status)}</span>
                  <span className="history-date">{dateTime(item.date)}</span>
                  {item.note && <span className="history-note">{item.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="detail-actions">
          {/* Admin Status Management */}
          {isAdmin && !isCancelled && (
            <div className="admin-actions">
              <h3>Manage Booking</h3>
              <div className="status-actions">
                <button
                  className="btn btn--success btn--sm"
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={booking.status === 'confirmed'}
                >
                  Confirm Booking
                </button>
                <button
                  className="btn btn--info btn--sm"
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={booking.status === 'completed' || booking.status === 'cancelled'}
                >
                  Mark Completed
                </button>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={booking.status === 'cancelled'}
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          )}

          {/* User Actions */}
          {!isAdmin && canCancel && !isCancelled && !showCancelConfirm && (
            <button
              className="btn btn--danger"
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelling}
            >
              Cancel Booking
            </button>
          )}

          {showCancelConfirm && !isAdmin && (
            <div className="cancel-confirm">
              <h3>Cancel this booking?</h3>
              <p className="muted">This action cannot be undone. Your booking will be cancelled and any payments will be refunded according to our policy.</p>
              <div className="cancel-form">
                <label>
                  <span className="label">Reason for cancellation</span>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please tell us why you're cancelling..."
                    rows="3"
                  />
                </label>
                <div className="cancel-actions">
                  <button
                    className="btn btn--ghost"
                    onClick={() => {
                      setShowCancelConfirm(false);
                      setCancelReason('');
                    }}
                    disabled={cancelling}
                  >
                    Keep Booking
                  </button>
                  <button
                    className="btn btn--danger"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <Alert kind="info">
              This booking has been cancelled.
              {booking.cancellation?.refundAmount > 0 && (
                <span> Refund of {money(booking.cancellation.refundAmount)} has been processed.</span>
              )}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}