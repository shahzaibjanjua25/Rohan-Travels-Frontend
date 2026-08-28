// frontend/src/pages/UmrahBookingForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { umrahService } from '../services/umrah';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { emailService } from '../services/emailService';
import { date, dateTime, money, time } from '../utils/format';
import Swal from 'sweetalert2';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import './UmrahBookingForm.css';

export default function UmrahBookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [roomType, setRoomType] = useState('quad');
  const [passengers, setPassengers] = useState([
    { type: 'adult', title: 'Mr', firstName: '', lastName: '', dateOfBirth: '', cnic: '', passportNumber: '' }
  ]);
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    cnic: '',
    passportNumber: ''
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [ziyaratEnabled, setZiyaratEnabled] = useState(false);

  useEffect(() => {
    loadPackage();
  }, [id]);

  useEffect(() => {
    if (user) {
      setCustomerDetails(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const loadPackage = async () => {
    try {
      setLoading(true);
      const response = await umrahService.getPackage(id);
      setPackageData(response.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load package details.');
    } finally {
      setLoading(false);
    }
  };

  const addPassenger = () => {
    setPassengers(prev => [
      ...prev,
      { type: 'adult', title: 'Mr', firstName: '', lastName: '', dateOfBirth: '', cnic: '', passportNumber: '' }
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length <= 1) return;
    setPassengers(prev => prev.filter((_, i) => i !== index));
  };

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const getSharingPrice = () => {
    if (!packageData) return 0;
    const prices = packageData.sharingPrices || {};
    return prices[roomType] || packageData.perPersonPrice || 0;
  };

  const calculateTotal = () => {
    if (!packageData) return 0;
    const sharingPrice = getSharingPrice();
    const adults = passengers.filter(p => p.type === 'adult').length;
    const children = passengers.filter(p => p.type === 'child').length;
    const infants = passengers.filter(p => p.type === 'infant').length;

    let total = adults * sharingPrice;
    total += children * (packageData.childWithoutBedPrice || 0);
    total += infants * (packageData.infantPrice || 0);
    
    if (ziyaratEnabled && packageData.ziyaratEnabled && packageData.ziyaratPrice > 0) {
      total += packageData.ziyaratPrice;
    }
    
    return total;
  };

  const validateForm = () => {
    // Check customer details
    if (!customerDetails.name.trim()) {
      showErrorPopup('Please enter your full name.');
      return false;
    }
    if (!customerDetails.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      showErrorPopup('Please enter a valid email address.');
      return false;
    }
    if (!customerDetails.phone.trim() || customerDetails.phone.replace(/\D/g, '').length < 10) {
      showErrorPopup('Please enter a valid phone number (at least 10 digits).');
      return false;
    }

    // Check passengers
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName.trim()) {
        showErrorPopup(`Please enter first name for passenger ${i + 1}.`);
        return false;
      }
      if (!p.lastName.trim()) {
        showErrorPopup(`Please enter last name for passenger ${i + 1}.`);
        return false;
      }
      if (!p.dateOfBirth) {
        showErrorPopup(`Please enter date of birth for passenger ${i + 1}.`);
        return false;
      }
      if (!p.cnic.trim()) {
        showErrorPopup(`Please enter CNIC/B-Form number for passenger ${i + 1}.`);
        return false;
      }
    }

    // Check if at least one adult
    const hasAdult = passengers.some(p => p.type === 'adult');
    if (!hasAdult) {
      showErrorPopup('At least one adult passenger is required.');
      return false;
    }

    return true;
  };

  const showErrorPopup = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Missing Information',
      text: message,
      confirmButtonColor: '#0a2463',
      confirmButtonText: 'OK'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        packageId: id,
        roomType,
        passengers: passengers.map(p => ({
          ...p,
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : ''
        })),
        customerDetails,
        specialRequests,
        ziyaratEnabled: ziyaratEnabled || false
      };

      const response = await umrahService.createBooking(payload);

      Swal.fire({
        icon: 'success',
        title: 'Booking Submitted!',
        html: `
          <div style="text-align: left;">
            <p><strong>Booking Reference:</strong> <span style="color: #0a2463; font-weight: 700;">${response.data.bookingReference}</span></p>
            <p style="color: #6b7a8f; font-size: 14px; margin-top: 10px;">
              ✅ Confirmation sent to your email<br>
              📞 Our team will contact you within 24 hours<br>
              💳 Payment will be confirmed after verification
              ${ziyaratEnabled ? '<br>🕌 Ziyarat package included' : ''}
            </p>
          </div>
        `,
        confirmButtonColor: '#0a2463',
        confirmButtonText: 'View My Bookings',
        timer: 5000,
        timerProgressBar: true
      }).then(() => {
        navigate('/umrah/bookings');
      });

    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof ApiError ? err.message : 'Could not create booking. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        confirmButtonColor: '#0a2463',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="umrah-booking-wrapper">
        <div className="center" style={{ padding: '48px 0' }}>
          <Spinner label="Loading package details..." />
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="umrah-booking-wrapper">
        <Alert kind="error">{error || 'Package not found.'}</Alert>
        <Link to="/umrah" className="btn btn--ghost" style={{ marginTop: '1rem' }}>
          ← Back to Umrah Packages
        </Link>
      </div>
    );
  }

  const totalAmount = calculateTotal();
  const sharingPrice = getSharingPrice();
  const adultCount = passengers.filter(p => p.type === 'adult').length;
  const childCount = passengers.filter(p => p.type === 'child').length;
  const infantCount = passengers.filter(p => p.type === 'infant').length;

  // Check if origin/destination are custom
  const isOriginCustom = packageData.origin?.airportCode === 'CUSTOM' || 
    (packageData.origin?.airportCode && !['JED', 'RUH', 'DMM', 'MED', 'TIF', 'AHB', 'GIZ', 'HOF', 'TUU', 'EJN', 'ELQ', 'HBT', 'RAE', 'URY', 'YNB', 'AQI', 'NQS', 'DHA', 'ISB', 'LHE', 'KHI', 'PEW', 'MUX', 'SKT', 'UET', 'LYP', 'GWD', 'RYK', 'KDU', 'GIL', 'CJL', 'DSK', 'PAJ', 'DBA', 'SGI', 'MWD', 'ZIA', 'DXB', 'AUH', 'SHJ', 'RKT', 'DOH', 'BAH', 'KWI', 'MCT', 'SLL', 'IST', 'SAW', 'ANK', 'LHR', 'LGW', 'MAN', 'BHX', 'JFK', 'LAX', 'ORD', 'IAH', 'CDG', 'FRA', 'AMS', 'SIN', 'KUL', 'BKK', 'NRT', 'ICN', 'HKG', 'BEY', 'AMM', 'CAI', 'JNB'].includes(packageData.origin?.airportCode));
  
  const isDestCustom = packageData.destination?.airportCode === 'CUSTOM' || 
    (packageData.destination?.airportCode && !['JED', 'RUH', 'DMM', 'MED', 'TIF', 'AHB', 'GIZ', 'HOF', 'TUU', 'EJN', 'ELQ', 'HBT', 'RAE', 'URY', 'YNB', 'AQI', 'NQS', 'DHA', 'ISB', 'LHE', 'KHI', 'PEW', 'MUX', 'SKT', 'UET', 'LYP', 'GWD', 'RYK', 'KDU', 'GIL', 'CJL', 'DSK', 'PAJ', 'DBA', 'SGI', 'MWD', 'ZIA', 'DXB', 'AUH', 'SHJ', 'RKT', 'DOH', 'BAH', 'KWI', 'MCT', 'SLL', 'IST', 'SAW', 'ANK', 'LHR', 'LGW', 'MAN', 'BHX', 'JFK', 'LAX', 'ORD', 'IAH', 'CDG', 'FRA', 'AMS', 'SIN', 'KUL', 'BKK', 'NRT', 'ICN', 'HKG', 'BEY', 'AMM', 'CAI', 'JNB'].includes(packageData.destination?.airportCode));

  return (
    <div className="umrah-booking-wrapper">
      <Link to="/umrah" className="eyebrow" style={{ textDecoration: 'none' }}>
        ← Back to Umrah Packages
      </Link>

      <div className="umrah-booking-grid">
        {/* Package Summary */}
        <div className="umrah-booking-summary">
          <h2>Package Summary</h2>
          <div className="summary-card">
            <div className="summary-header">
              <h3>{packageData.packageName}</h3>
              <span className="airline-tag">{packageData.airline}</span>
            </div>

            <div className="summary-route">
              <div className="route-point">
                <span className="code">
                  {isOriginCustom ? '✈️' : (packageData.origin?.airportCode || 'N/A')}
                </span>
                <span className="city">
                  {isOriginCustom ? packageData.origin?.city || 'Custom' : (packageData.origin?.city || 'N/A')}
                </span>
              </div>
              <span className="arrow">→</span>
              <div className="route-point">
                <span className="code">
                  {isDestCustom ? '✈️' : (packageData.destination?.airportCode || 'N/A')}
                </span>
                <span className="city">
                  {isDestCustom ? packageData.destination?.city || 'Custom' : (packageData.destination?.city || 'N/A')}
                </span>
              </div>
            </div>

            {/* Flight Details with Date & Time */}
            <div className="flight-details-summary">
              <div className="flight-detail-item">
                <span className="label">Departure</span>
                <span className="value">{packageData.departureDate ? date(packageData.departureDate) : 'N/A'}</span>
                <span className="time-value">{packageData.departureTime ? packageData.departureTime : 'N/A'}</span>
              </div>
              <div className="flight-detail-item">
                <span className="label">Arrival</span>
                <span className="value">{packageData.arrivalDate ? date(packageData.arrivalDate) : 'N/A'}</span>
                <span className="time-value">{packageData.arrivalTime ? packageData.arrivalTime : 'N/A'}</span>
              </div>
              <div className="flight-detail-item">
                <span className="label">Return Departure</span>
                <span className="value">{packageData.returnDate ? date(packageData.returnDate) : 'N/A'}</span>
                <span className="time-value">{packageData.returnDepartureTime ? packageData.returnDepartureTime : 'N/A'}</span>
              </div>
              <div className="flight-detail-item">
                <span className="label">Return Arrival</span>
                <span className="value">{packageData.returnArrivalDate ? date(packageData.returnArrivalDate) : 'N/A'}</span>
                <span className="time-value">{packageData.returnArrivalTime ? packageData.returnArrivalTime : 'N/A'}</span>
              </div>
              <div className="flight-detail-item">
                <span className="label">Duration</span>
                <span className="value">{packageData.duration || 0} Days</span>
              </div>
            </div>

            <div className="summary-dates">
              <div>
                <span className="label">Departure</span>
                <span className="value">{packageData.departureDate ? date(packageData.departureDate) : 'N/A'}</span>
              </div>
              <div>
                <span className="label">Return</span>
                <span className="value">{packageData.returnDate ? date(packageData.returnDate) : 'N/A'}</span>
              </div>
              <div>
                <span className="label">Duration</span>
                <span className="value">{packageData.duration || 0} Days</span>
              </div>
            </div>

            <div className="summary-hotels">
              <div className="hotel-summary">
                <span className="city">🕋 Makkah</span>
                <span className="name">{packageData.makkahHotel?.name || 'N/A'}</span>
                <span className="detail">{packageData.makkahHotel?.distance || ''} • {packageData.makkahHotel?.nights || 0} Nights</span>
              </div>
              {packageData.makkahReturnHotel?.name && (
                <div className="hotel-summary">
                  <span className="city">🕋 Makkah (Return)</span>
                  <span className="name">{packageData.makkahReturnHotel.name}</span>
                  <span className="detail">{packageData.makkahReturnHotel.distance || ''} • {packageData.makkahReturnHotel.nights || 0} Nights</span>
                </div>
              )}
              <div className="hotel-summary">
                <span className="city">🕌 Madinah</span>
                <span className="name">{packageData.madinahHotel?.name || 'N/A'}</span>
                <span className="detail">{packageData.madinahHotel?.distance || ''} • {packageData.madinahHotel?.nights || 0} Nights</span>
              </div>
            </div>

            {/* ✨ Baggage Information in Summary */}
            {(packageData.baggageAllowance?.departure || 
              packageData.baggageAllowance?.arrival || 
              packageData.baggageAllowance?.return) && (
              <div className="summary-baggage">
                <p className="baggage-label">Baggage Allowance</p>
                <div className="baggage-items">
                  {packageData.baggageAllowance?.departure && (
                    <span className="baggage-item">
                      🛫 {packageData.baggageAllowance.departure}
                    </span>
                  )}
                  {packageData.baggageAllowance?.arrival && (
                    <span className="baggage-item">
                      🛬 {packageData.baggageAllowance.arrival}
                    </span>
                  )}
                  {packageData.baggageAllowance?.return && (
                    <span className="baggage-item return-baggage">
                      🔄 {packageData.baggageAllowance.return}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="summary-pricing">
              <div className="price-row">
                <span>Per Person (Base)</span>
                <span className="price">{money(packageData.perPersonPrice)}</span>
              </div>
              {packageData.sharingPrices?.single > 0 && (
                <div className="price-row">
                  <span>Single</span>
                  <span className="price">{money(packageData.sharingPrices.single)}</span>
                </div>
              )}
              {packageData.sharingPrices?.double > 0 && (
                <div className="price-row">
                  <span>Double</span>
                  <span className="price">{money(packageData.sharingPrices.double)}</span>
                </div>
              )}
              {packageData.sharingPrices?.triple > 0 && (
                <div className="price-row">
                  <span>Triple</span>
                  <span className="price">{money(packageData.sharingPrices.triple)}</span>
                </div>
              )}
              {packageData.sharingPrices?.quad > 0 && (
                <div className="price-row">
                  <span>Quad</span>
                  <span className="price">{money(packageData.sharingPrices.quad)}</span>
                </div>
              )}
              {packageData.sharingPrices?.sharing > 0 && (
                <div className="price-row">
                  <span>Sharing</span>
                  <span className="price">{money(packageData.sharingPrices.sharing)}</span>
                </div>
              )}
              {packageData.childWithoutBedPrice > 0 && (
                <div className="price-row">
                  <span>Child Without Bed</span>
                  <span className="price">{money(packageData.childWithoutBedPrice)}</span>
                </div>
              )}
              {packageData.infantPrice > 0 && (
                <div className="price-row">
                  <span>Infant</span>
                  <span className="price">{money(packageData.infantPrice)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="umrah-booking-form">
          <form onSubmit={handleSubmit}>
            <h2>Complete Your Booking</h2>

            {/* Room Type Selection */}
            <div className="form-section">
              <h3>Room Type</h3>
              <div className="room-options">
                {packageData.sharingPrices?.single > 0 && (
                  <label className={`room-option ${roomType === 'single' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="roomType"
                      value="single"
                      checked={roomType === 'single'}
                      onChange={(e) => setRoomType(e.target.value)}
                    />
                    <span className="room-label">Single (1)</span>
                    <span className="room-price">{money(packageData.sharingPrices.single)}</span>
                  </label>
                )}
                {packageData.sharingPrices?.double > 0 && (
                  <label className={`room-option ${roomType === 'double' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="roomType"
                      value="double"
                      checked={roomType === 'double'}
                      onChange={(e) => setRoomType(e.target.value)}
                    />
                    <span className="room-label">Double (2)</span>
                    <span className="room-price">{money(packageData.sharingPrices.double)}</span>
                  </label>
                )}
                {packageData.sharingPrices?.triple > 0 && (
                  <label className={`room-option ${roomType === 'triple' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="roomType"
                      value="triple"
                      checked={roomType === 'triple'}
                      onChange={(e) => setRoomType(e.target.value)}
                    />
                    <span className="room-label">Triple (3)</span>
                    <span className="room-price">{money(packageData.sharingPrices.triple)}</span>
                  </label>
                )}
                {packageData.sharingPrices?.quad > 0 && (
                  <label className={`room-option ${roomType === 'quad' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="roomType"
                      value="quad"
                      checked={roomType === 'quad'}
                      onChange={(e) => setRoomType(e.target.value)}
                    />
                    <span className="room-label">Quad (4)</span>
                    <span className="room-price">{money(packageData.sharingPrices.quad)}</span>
                  </label>
                )}
                {packageData.sharingPrices?.sharing > 0 && (
                  <label className={`room-option ${roomType === 'sharing' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="roomType"
                      value="sharing"
                      checked={roomType === 'sharing'}
                      onChange={(e) => setRoomType(e.target.value)}
                    />
                    <span className="room-label">Sharing (5+)</span>
                    <span className="room-price">{money(packageData.sharingPrices.sharing)}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Ziyarat Package Option */}
            {packageData.ziyaratEnabled && packageData.ziyaratPrice > 0 && (
              <div className="form-section">
                <h3>🕌 Ziyarat Package</h3>
                <div className="ziyarat-option">
                  <label className="ziyarat-checkbox" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={ziyaratEnabled}
                      onChange={(e) => setZiyaratEnabled(e.target.checked)}
                      style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: '#0a2463' }}
                    />
                    <div>
                      <span style={{ fontWeight: '600', display: 'block' }}>
                        Add Ziyarat Tour (+{money(packageData.ziyaratPrice)})
                      </span>
                      <span style={{ fontSize: '14px', color: '#6b7a8f' }}>
                        {packageData.ziyaratDescription || 'Guided tour of holy sites in Makkah and Madinah'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Passengers */}
            <div className="form-section">
              <div className="section-header">
                <h3>Passengers</h3>
                <button type="button" className="btn btn--ghost btn--sm" onClick={addPassenger}>
                  + Add Passenger
                </button>
              </div>

              {passengers.map((p, index) => (
                <div key={index} className="passenger-card">
                  <div className="passenger-header">
                    <span className="passenger-number">Passenger {index + 1}</span>
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => removePassenger(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="passenger-fields">
                    <div className="field-group">
                      <label>Type</label>
                      <select
                        value={p.type}
                        onChange={(e) => updatePassenger(index, 'type', e.target.value)}
                      >
                        <option value="adult">Adult</option>
                        <option value="child">Child (w/o Bed)</option>
                        <option value="infant">Infant</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Title</label>
                      <select
                        value={p.title}
                        onChange={(e) => updatePassenger(index, 'title', e.target.value)}
                      >
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                        <option value="Master">Master</option>
                        <option value="Miss">Miss</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        value={p.firstName}
                        onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        value={p.lastName}
                        onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                        placeholder="Last name"
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        value={p.dateOfBirth}
                        onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>CNIC / B-Form *</label>
                      <input
                        type="text"
                        value={p.cnic}
                        onChange={(e) => updatePassenger(index, 'cnic', e.target.value)}
                        placeholder="CNIC or B-Form number"
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Passport Number</label>
                      <input
                        type="text"
                        value={p.passportNumber}
                        onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                        placeholder="Passport number (optional)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Details */}
            <div className="form-section">
              <h3>Contact Details</h3>
              <div className="customer-fields">
                <div className="field-group full">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={customerDetails.name}
                    onChange={handleCustomerChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={customerDetails.email}
                    onChange={handleCustomerChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerDetails.phone}
                    onChange={handleCustomerChange}
                    placeholder="+92-XXX-XXXXXXX"
                    required
                  />
                </div>
                <div className="field-group full">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={customerDetails.address}
                    onChange={handleCustomerChange}
                    placeholder="Your address (optional)"
                  />
                </div>
                <div className="field-group">
                  <label>CNIC Number</label>
                  <input
                    type="text"
                    name="cnic"
                    value={customerDetails.cnic}
                    onChange={handleCustomerChange}
                    placeholder="CNIC number (optional)"
                  />
                </div>
                <div className="field-group">
                  <label>Passport Number</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={customerDetails.passportNumber}
                    onChange={handleCustomerChange}
                    placeholder="Passport number (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="form-section">
              <h3>Special Requests</h3>
              <div className="field-group full">
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests (meal preferences, wheelchair assistance, room preferences, etc.)"
                  rows="3"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="form-section price-breakdown">
              <h3>Price Breakdown</h3>
              <div className="breakdown-row">
                <span>{adultCount} Adult(s) × {money(sharingPrice)}</span>
                <span>{money(adultCount * sharingPrice)}</span>
              </div>
              {childCount > 0 && (
                <div className="breakdown-row">
                  <span>{childCount} Child(ren) × {money(packageData.childWithoutBedPrice || 0)}</span>
                  <span>{money(childCount * (packageData.childWithoutBedPrice || 0))}</span>
                </div>
              )}
              {infantCount > 0 && (
                <div className="breakdown-row">
                  <span>{infantCount} Infant(s) × {money(packageData.infantPrice || 0)}</span>
                  <span>{money(infantCount * (packageData.infantPrice || 0))}</span>
                </div>
              )}
              {ziyaratEnabled && packageData.ziyaratEnabled && packageData.ziyaratPrice > 0 && (
                <div className="breakdown-row" style={{ color: '#0a2463', fontWeight: '600' }}>
                  <span>🕌 Ziyarat Package</span>
                  <span>{money(packageData.ziyaratPrice)}</span>
                </div>
              )}
              <div className="breakdown-total">
                <span><strong>Total Amount</strong></span>
                <span className="total-price">{money(totalAmount)}</span>
              </div>
              <div className="booking-note">
                <p>📌 Our team will contact you within 24 hours to confirm your booking and arrange payment.</p>
              </div>
            </div>

            {/* Submit */}
            <div className="form-actions">
              <Link to="/umrah" className="btn btn--ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn--gold" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Book Umrah Package'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}