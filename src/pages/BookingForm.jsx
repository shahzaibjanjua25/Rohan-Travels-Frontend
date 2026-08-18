import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { flightService } from '../services/flights';
import { bookingService } from '../services/bookings';
import { ApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { emailService } from '../services/emailService';
import Swal from 'sweetalert2';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { date, time, money } from '../utils/format';
import './BookingForm.css';

export default function BookingForm() {
  const { id } = useParams(); // This is the FLIGHT ID
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [flight, setFlight] = useState(null);
  const [passengerCounts, setPassengerCounts] = useState({
    adults: 1,
    infants: 0,
  });
  const [passengers, setPassengers] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cnic: '',
    passportNumber: '',
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [cabinClass, setCabinClass] = useState('economy');

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getCsrfToken = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('rt_csrf='))
      ?.split('=')[1];
    return token;
  };

  // Generate passenger forms based on adult/infant count
  const generatePassengerForms = (adults, infants) => {
    const total = adults + infants;
    const newPassengers = [];

    for (let i = 0; i < total; i++) {
      const isInfant = i >= adults;
      newPassengers.push({
        type: isInfant ? 'infant' : 'adult',
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        cnic: '',
        passportNumber: '',
        address: '',
        nationality: '',
      });
    }
    return newPassengers;
  };

  // ============================================================
  // LIFECYCLE
  // ============================================================

  useEffect(() => {
    loadFlight();
  }, [id]);

  // Initialize passengers when component mounts or counts change
  useEffect(() => {
    if (flight) {
      const newPassengers = generatePassengerForms(passengerCounts.adults, passengerCounts.infants);
      setPassengers(newPassengers);
    }
  }, [passengerCounts.adults, passengerCounts.infants, flight]);

  const loadFlight = async () => {
    try {
      console.log('📌 Loading flight with ID:', id);
      const response = await flightService.get(id);
      console.log('✅ Flight data loaded:', response.data);
      setFlight(response.data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading flight:', err);
      Swal.fire({
        icon: 'error',
        title: 'Unable to Load Flight',
        text: err instanceof ApiError ? err.message : 'Could not load flight details. Please try again.',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'Go Back',
      }).then(() => {
        navigate('/flights');
      });
      setLoading(false);
    }
  };

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleCountChange = (type, value) => {
    const newCount = parseInt(value) || 0;

    if (newCount > 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Maximum Passengers Exceeded',
        text: 'You can book a maximum of 10 passengers per booking.',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (type === 'adults' && newCount < 0) {
      return;
    }

    const newCounts = { ...passengerCounts, [type]: newCount };
    setPassengerCounts(newCounts);
    setError('');
  };

  const updatePassenger = (index, field, value) => {
    setPassengers(prev =>
      prev.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      )
    );
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    if (!flight) return 0;
    const adultPrice = flight.cabins?.economy?.price || 0;
    const infantPrice = adultPrice * 0.1;
    const subtotal = (passengerCounts.adults * adultPrice) +
      (passengerCounts.infants * infantPrice);
    return subtotal;
  };

  // ============================================================
  // POPUP FUNCTIONS
  // ============================================================

  const showErrorPopup = (message, details = null) => {
    let htmlContent = `<div style="text-align: left; max-height: 300px; overflow-y: auto;">`;

    if (details && typeof details === 'object') {
      htmlContent += `<p><strong>${message}</strong></p>`;
      htmlContent += `<ul style="list-style-type: none; padding-left: 0;">`;
      Object.entries(details).forEach(([field, error]) => {
        htmlContent += `<li style="padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="color: #dc3545;">✕</span> 
          <strong>${field}:</strong> ${error}
        </li>`;
      });
      htmlContent += `</ul>`;
    } else {
      htmlContent += `<p>${message}</p>`;
    }

    htmlContent += `</div>`;

    Swal.fire({
      icon: 'error',
      title: '⚠️ Validation Error',
      html: htmlContent,
      confirmButtonColor: '#6366f1',
      confirmButtonText: 'OK, I\'ll fix it',
      timer: 5000,
      timerProgressBar: true,
    });
  };

  const showSuccessPopup = (bookingReference) => {
    Swal.fire({
      icon: 'success',
      title: '🎉 Booking Confirmed!',
      html: `
        <div style="text-align: left;">
          <p><strong>Booking Reference:</strong> <span style="color: #6366f1; font-weight: 700;">${bookingReference}</span></p>
          <p style="color: #6b7a8f; font-size: 14px; margin-top: 10px;">
            ✅ Confirmation sent to your email<br>
            📱 Our team will contact you via WhatsApp<br>
            💳 Payment will be confirmed within 24 hours
          </p>
        </div>
      `,
      confirmButtonColor: '#6366f1',
      confirmButtonText: 'View My Bookings',
      timer: 5000,
      timerProgressBar: true,
    }).then(() => {
      navigate('/bookings');
    });
  };

  const showLoadingPopup = () => {
    Swal.fire({
      title: 'Processing Your Booking',
      text: 'Please wait while we confirm your seats...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const closeLoadingPopup = () => {
    Swal.close();
  };

  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================

  const validatePassengerDetails = () => {
    // CHECK: At least one adult is required
    if (passengerCounts.adults < 1) {
      showErrorPopup('At least one adult passenger is required for this booking.');
      return false;
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const passengerNumber = i + 1;

      if (!p.firstName || p.firstName.trim() === '') {
        showErrorPopup(`Passenger ${passengerNumber} first name is required. Please fill it in.`);
        return false;
      }

      if (!/^[a-zA-Z\s]+$/.test(p.firstName)) {
        showErrorPopup(`Passenger ${passengerNumber} first name should only contain letters.`);
        return false;
      }

      if (!p.lastName || p.lastName.trim() === '') {
        showErrorPopup(`Passenger ${passengerNumber} last name is required. Please fill it in.`);
        return false;
      }

      if (!/^[a-zA-Z\s]+$/.test(p.lastName)) {
        showErrorPopup(`Passenger ${passengerNumber} last name should only contain letters.`);
        return false;
      }

      if (p.type === 'infant' && !p.dateOfBirth) {
        showErrorPopup(`Please provide date of birth for Infant ${passengerNumber}.`);
        return false;
      }

      if (p.type === 'infant' && p.dateOfBirth) {
        const dob = new Date(p.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (age > 2 || (age === 2 && monthDiff > 0)) {
          showErrorPopup(`Infant ${passengerNumber} must be under 2 years old. Please check the date of birth.`);
          return false;
        }
      }

      // Validate CNIC/B-Form for each passenger
      if (p.type === 'adult' && (!p.cnic || p.cnic.trim() === '')) {
        showErrorPopup(`Please enter CNIC number for Passenger ${passengerNumber}.`);
        return false;
      }

      if (p.type === 'infant' && (!p.cnic || p.cnic.trim() === '')) {
        showErrorPopup(`Please enter B-Form number for Infant ${passengerNumber}.`);
        return false;
      }
    }
    return true;
  };

  const validateCustomerDetails = () => {
    if (!customerDetails.name || customerDetails.name.trim() === '') {
      showErrorPopup('Please enter your full name.');
      return false;
    }

    if (!customerDetails.email || customerDetails.email.trim() === '') {
      showErrorPopup('Please enter your email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) {
      showErrorPopup('Please enter a valid email address. (e.g., name@example.com)');
      return false;
    }

    if (!customerDetails.phone || customerDetails.phone.trim() === '') {
      showErrorPopup('Please enter your phone number.');
      return false;
    }

    const phoneDigits = customerDetails.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      showErrorPopup('Please enter a valid phone number with at least 10 digits.');
      return false;
    }

    return true;
  };

  // ============================================================
  // MAIN SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('\n🚀 === SUBMITTING BOOKING ===');

    setSubmitting(true);
    setError('');

    if (!flight || !flight._id) {
      showErrorPopup('Flight information is missing. Please go back and try again.');
      setSubmitting(false);
      return;
    }

    const availableSeats = flight.cabins?.economy?.availableSeats || 0;
    const totalPassengers = passengerCounts.adults + passengerCounts.infants;

    // CHECK: At least one adult is required
    if (passengerCounts.adults < 1) {
      showErrorPopup('At least one adult passenger is required for this booking. Please add an adult.');
      setSubmitting(false);
      return;
    }

    if (totalPassengers > availableSeats) {
      showErrorPopup(
        `Not enough seats available! You need ${totalPassengers} seats but only ${availableSeats} are available.`,
        { 'Available Seats': availableSeats, 'Required Seats': totalPassengers }
      );
      setSubmitting(false);
      return;
    }

    if (!validatePassengerDetails()) {
      setSubmitting(false);
      return;
    }

    if (!validateCustomerDetails()) {
      setSubmitting(false);
      return;
    }

    console.log('✅ All validations passed');

    showLoadingPopup();

    try {
      // Build passenger array with ALL details including individual CNIC, Passport, Address
      const passengerArray = passengers.map(p => {
        const passenger = {
          title: p.title || '',
          firstName: p.firstName.trim(),
          lastName: p.lastName.trim(),
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
          type: p.type || 'adult',
          cnic: p.cnic?.trim() || '',      // Individual CNIC
          passportNumber: p.passportNumber?.trim() || '',
          address: p.address?.trim() || '', // Individual Address
          nationality: p.nationality?.trim() || '',
        };

        // Remove empty fields
        Object.keys(passenger).forEach(key => {
          if (passenger[key] === '' || passenger[key] === null || passenger[key] === undefined) {
            delete passenger[key];
          }
        });

        return passenger;
      });

      // Build booking data with passenger details
      const bookingData = {
        flightId: flight._id,
        cabinClass: cabinClass || 'economy',
        passengers: passengerArray,
        contactEmail: customerDetails.email.trim(),
        contactPhone: customerDetails.phone.trim(),
        customerName: customerDetails.name.trim(),
        customerAddress: customerDetails.address.trim(),
        customerCnic: customerDetails.cnic.trim(),
        customerPassport: customerDetails.passportNumber.trim(),
        specialRequests: specialRequests.trim(),
      };

      console.log('📦 Full booking data being sent:', JSON.stringify(bookingData, null, 2));

      const response = await bookingService.create(bookingData);

      console.log('✅ Booking successful!');
      console.log('📋 Response:', response.data);

      // ============================================================
      // 🚀 SEND EMAIL NOTIFICATIONS (NO TEST OTP)
      // ============================================================
      // ============================================================
      // 🚀 SEND EMAIL NOTIFICATIONS
      // ============================================================
      try {
        console.log('📧 Sending email notifications...');
        console.log('📧 Booking data for email:', response.data);

        // Send confirmation to customer (Account 2 - Booking)
        const customerEmailResult = await emailService.sendBookingConfirmation(response.data);
        if (customerEmailResult.success) {
          console.log('✅ Customer confirmation email sent (Account 2)');
        } else {
          console.warn('⚠️ Customer email failed:', customerEmailResult.error);
        }

        // Send notification to admin (Account 2 - Booking)
        const adminEmailResult = await emailService.sendAdminNotification(response.data);
        if (adminEmailResult.success) {
          console.log('✅ Admin notification email sent (Account 2)');
        } else {
          console.warn('⚠️ Admin email failed:', adminEmailResult.error);
        }

      } catch (emailError) {
        // Don't fail the booking if email fails
        console.error('❌ Email sending error:', emailError);
        console.warn('⚠️ Booking was successful but email notifications failed.');
      }

      closeLoadingPopup();
      setSuccess(`Booking created successfully! Reference: ${response.data.bookingReference}`);
      showSuccessPopup(response.data.bookingReference);

    } catch (err) {
      console.error('❌ Booking error:', err);

      closeLoadingPopup();

      if (err.response) {
        const errorData = err.response.data;
        console.error('📋 Server error:', JSON.stringify(errorData, null, 2));

        let errorMessage = 'We couldn\'t complete your booking. Please check the details below:\n\n';

        if (errorData.details) {
          const errorDetails = {};
          errorData.details.forEach(detail => {
            errorDetails[detail.field] = detail.message;
            errorMessage += `• ${detail.field}: ${detail.message}\n`;
          });
          showErrorPopup(errorMessage, errorDetails);
        } else if (errorData.message) {
          showErrorPopup(errorData.message);
        } else {
          showErrorPopup('Something went wrong. Please try again later.');
        }
        setError(errorData.message || 'Failed to create booking.');
      } else if (err.request) {
        console.error('❌ No response received');
        showErrorPopup('No response from server. Please check your internet connection and try again.');
      } else {
        console.error('❌ Request error:', err.message);
        showErrorPopup(err.message || 'Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="booking-form-loading">
        <Spinner label="Loading flight details..." />
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div className="booking-form-wrapper">
        <Alert kind="error">{error}</Alert>
        <Link to="/flights" className="btn btn--primary">Back to Flights</Link>
      </div>
    );
  }

  const total = calculateTotal();
  const totalPassengers = passengerCounts.adults + passengerCounts.infants;

  return (
    <div className="booking-form-wrapper">
      <div className="booking-hero">
        <img
          src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80"
          alt="Book your flight"
          className="booking-hero-image"
        />
        <div className="booking-hero-overlay">
          <h2>Secure Your Seat ✈️</h2>
          <p>Fill in the details below to complete your booking</p>
        </div>
        <div className="booking-hero-badge">
          ✨ Best Price Guarantee
        </div>
      </div>

      <div className="booking-form-header">
        <h1>Book Your Flight</h1>
        <p className="faint">Complete the form below to book your flight</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              Swal.fire({
                icon: 'info',
                title: 'Help',
                text: 'Fill in all required fields to complete your booking.',
                confirmButtonColor: '#6366f1',
                confirmButtonText: 'OK',
              });
            }}
            className="btn"
            style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            🔍 Help
          </button>
        </div>
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <div className="booking-form-grid">
        <div className="booking-flight-card">
          <h3 className="card-title">Flight Details</h3>
          <div className="flight-summary">
            <div className="flight-route">
              <div className="flight-airline">
                <span className="airline-name" style={{ color: '#0a1f14' }}>{flight.airline}</span>
                <span className="flight-number">{flight.flightNumber}</span>
              </div>
              <div className="route-display">
                <div className="origin">
                  <span className="city">{flight.origin?.city || 'N/A'}</span>
                  <span className="code">{flight.origin?.airportCode || 'N/A'}</span>
                </div>
                <div className="route-arrow">→</div>
                <div className="destination">
                  <span className="city">{flight.destination?.city || 'N/A'}</span>
                  <span className="code">{flight.destination?.airportCode || 'N/A'}</span>
                </div>
              </div>
              <div className="flight-times">
                <span className="time">{flight.departureTime ? date(flight.departureTime) : 'N/A'}</span>
                <span className="time-separator">•</span>
                <span className="time">{flight.departureTime ? time(flight.departureTime) : 'N/A'}</span>
                <span className="time-separator">→</span>
                <span className="time">{flight.arrivalTime ? time(flight.arrivalTime) : 'N/A'}</span>
              </div>
              <div className="flight-price">
                <span className="price-label">Adult price:</span>
                <span className="price-value">{money(flight.cabins?.economy?.price || 0, 'PKR')}</span>
                <span className="price-label" style={{ fontSize: 'var(--step--1)', display: 'block' }}>
                  Infant price: {money((flight.cabins?.economy?.price || 0) * 0.1)} (10% of adult)
                </span>
                <span className="price-label" style={{ fontSize: 'var(--step--1)', display: 'block', marginTop: '5px', color: '#10b981' }}>
                  ✅ {flight.cabins?.economy?.availableSeats || 0} seats available
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h3 className="form-section-title">Passenger Count</h3>
            <div className="form-row">
              <div className="field-group">
                <label className="field__label">
                  Adults <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={passengerCounts.adults}
                  onChange={(e) => handleCountChange('adults', e.target.value)}
                  className="field"
                  min="0"
                  max="10"
                  required
                />
                <span className="field-helper">At least 1 adult required (max 10)</span>
              </div>
              <div className="field-group">
                <label className="field__label">Infants</label>
                <input
                  type="number"
                  value={passengerCounts.infants}
                  onChange={(e) => handleCountChange('infants', e.target.value)}
                  className="field"
                  min="0"
                  max="5"
                />
                <span className="field-helper">Under 2 years old (max 5)</span>
              </div>
            </div>
            <div className="passenger-summary">
              <span>Total passengers: {totalPassengers}</span>
              <span style={{ marginLeft: '1rem', color: '#10b981' }}>
                Available seats: {flight.cabins?.economy?.availableSeats || 0}
              </span>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Passenger Details</h3>
            <p className="faint" style={{ marginBottom: 'var(--s-4)' }}>
              Please provide details for each passenger
            </p>

            {passengers.map((passenger, index) => (
              <div key={index} className="passenger-section">
                <h4 className="passenger-title">
                  <span>
                    Passenger {index + 1}
                    <span className="passenger-type">
                      ({passenger.type === 'infant' ? 'Infant 👶' : 'Adult 👤'})
                    </span>
                  </span>
                </h4>

                {/* Basic Info */}
                <div className="form-row">
                  <div className="field-group">
                    <label className="field__label">Title</label>
                    <select
                      value={passenger.title}
                      onChange={(e) => updatePassenger(index, 'title', e.target.value)}
                      className="field"
                    >
                      <option value="">Select</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                      <option value="Master">Master</option>
                      <option value="Miss">Miss</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field__label">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                      className="field"
                      required
                      placeholder="First name (letters only)"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field__label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                      className="field"
                      required
                      placeholder="Last name (letters only)"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="form-row">
                  <div className="field-group">
                    <label className="field__label">
                      Date of Birth {passenger.type === 'infant' && <span className="required">*</span>}
                    </label>
                    <input
                      type="date"
                      value={passenger.dateOfBirth}
                      onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                      className="field"
                      required={passenger.type === 'infant'}
                    />
                    {passenger.type === 'infant' && (
                      <span className="field-helper">Required for infants (under 2 years)</span>
                    )}
                  </div>
                  <div className="field-group">
                    <label className="field__label">Nationality</label>
                    <input
                      type="text"
                      value={passenger.nationality}
                      onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                      className="field"
                      placeholder="e.g. Pakistani"
                    />
                  </div>
                </div>

                {/* Individual Passenger Identification */}
                <div className="form-row">
                  <div className="field-group">
                    <label className="field__label">
                      {passenger.type === 'infant' ? 'B-Form Number' : 'CNIC Number'} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={passenger.cnic}
                      onChange={(e) => updatePassenger(index, 'cnic', e.target.value)}
                      className="field"
                      required
                      placeholder={passenger.type === 'infant' ? 'Enter B-Form number' : 'Enter CNIC number'}
                    />
                    <span className="field-helper">
                      {passenger.type === 'infant' ? 'B-Form number for infant' : 'CNIC number for adult'}
                    </span>
                  </div>
                  <div className="field-group">
                    <label className="field__label">Passport Number</label>
                    <input
                      type="text"
                      value={passenger.passportNumber}
                      onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                      className="field"
                      placeholder="Enter passport number"
                    />
                  </div>
                </div>

                {/* Individual Address */}
                <div className="form-row">
                  <div className="field-group">
                    <label className="field__label">Address</label>
                    <input
                      type="text"
                      value={passenger.address}
                      onChange={(e) => updatePassenger(index, 'address', e.target.value)}
                      className="field"
                      placeholder="Enter address for this passenger"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Contact Details</h3>
            <p className="faint" style={{ marginBottom: 'var(--s-4)' }}>
              We'll send booking confirmation to this email and phone
            </p>
            <div className="form-row">
              <div className="field-group">
                <label className="field__label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleCustomerChange}
                  className="field"
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="field-group">
                <label className="field__label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerDetails.email}
                  onChange={handleCustomerChange}
                  className="field"
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label className="field__label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleCustomerChange}
                  className="field"
                  required
                  placeholder="+92-XXX-XXXXXXX"
                />
                <span className="field-helper">At least 10 digits</span>
              </div>
              <div className="field-group">
                <label className="field__label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={customerDetails.address}
                  onChange={handleCustomerChange}
                  className="field"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label className="field__label">CNIC Number</label>
                <input
                  type="text"
                  name="cnic"
                  value={customerDetails.cnic}
                  onChange={handleCustomerChange}
                  className="field"
                  placeholder="XXXXX-XXXXXXX-X"
                />
              </div>
              <div className="field-group">
                <label className="field__label">Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={customerDetails.passportNumber}
                  onChange={handleCustomerChange}
                  className="field"
                  placeholder="Enter passport number"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Special Requests</h3>
            <div className="field-group">
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="field"
                rows="3"
                placeholder="Any special requests (meal preferences, wheelchair assistance, etc.)"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Price Summary</h3>
            <div className="price-breakdown">
              <div className="price-row">
                <span>{passengerCounts.adults} Adult × {money(flight.cabins?.economy?.price || 0, 'PKR')}</span>
                <span>{money((passengerCounts.adults || 0) * (flight.cabins?.economy?.price || 0))}</span>
              </div>
              {passengerCounts.infants > 0 && (
                <div className="price-row">
                  <span>{passengerCounts.infants} Infant × {money((flight.cabins?.economy?.price || 0) * 0.1)}</span>
                  <span>{money((passengerCounts.infants || 0) * (flight.cabins?.economy?.price || 0) * 0.1)}</span>
                </div>
              )}
              <div className="price-row total">
                <span><strong>Total Amount</strong></span>
                <span><strong>{money(total)}</strong></span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/flights" className="btn btn--ghost">
              Cancel
            </Link>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Booking...' : '✈️ Book Flight'}
            </button>
          </div>
        </form>
      </div>

      <div className="booking-info">
        <p className="faint">
          <strong>✈️ Booking Policy:</strong> After booking, our team will contact you via WhatsApp
          to confirm payment. Your booking will remain pending until payment is confirmed.
          <br />
          <span style={{ fontSize: '0.85rem', display: 'block', marginTop: '5px' }}>
            📧 Confirmation will be sent to your email • 📱 WhatsApp confirmation within 24 hours
          </span>
        </p>
      </div>
    </div>
  );
}