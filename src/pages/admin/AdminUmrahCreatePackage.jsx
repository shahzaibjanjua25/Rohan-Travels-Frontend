// frontend/src/pages/admin/AdminUmrahCreatePackage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { umrahService } from '../../services/umrah';
import { ApiError } from '../../services/api';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import './AdminUmrahPackageForm.css';

const AIRLINES = [
  'Saudi Arabian Airlines',
  'Pakistan International Airlines',
  'Fly Jinnah',
  'Riyadh Air',
  'Emirates',
  'Qatar Airways',
  'Etihad Airways',
  'Oman Air',
  'Gulf Air',
  'Kuwait Airways'
];

const AIRPORTS = [
  { code: 'ISB', city: 'Islamabad' },
  { code: 'LHE', city: 'Lahore' },
  { code: 'KHI', city: 'Karachi' },
  { code: 'PEW', city: 'Peshawar' },
  { code: 'MUX', city: 'Multan' },
  { code: 'SKT', city: 'Sialkot' },
  { code: 'UET', city: 'Quetta' },
  { code: 'LYP', city: 'Faisalabad' },
  { code: 'GWD', city: 'Gwadar' },
  { code: 'RYK', city: 'Rahim Yar Khan' },
  { code: 'JED', city: 'Jeddah' },
  { code: 'RUH', city: 'Riyadh' },
  { code: 'MED', city: 'Madinah' },
  { code: 'DMM', city: 'Dammam' },
  { code: 'DXB', city: 'Dubai' },
  { code: 'AUH', city: 'Abu Dhabi' },
  { code: 'DOH', city: 'Doha' },
  { code: 'BAH', city: 'Manama' },
  { code: 'KWI', city: 'Kuwait City' },
  { code: 'MCT', city: 'Muscat' }
];

const SHARING_TYPES = ['quad', 'triple', 'double'];

const SAMPLE_MAKKAH_HOTELS = [
  { name: 'WEDAM SIX', distance: 'Shuttle', nights: 8 },
  { name: 'WHITE LION', distance: '1200 M', nights: 8 },
  { name: 'MASARAT KHALIL / NADA HIJRA', distance: '750 M', nights: 8 },
  { name: 'MASARAT GOLDEN', distance: '600 M', nights: 8 }
];

const SAMPLE_MADINAH_HOTELS = [
  { name: 'QADAT AL DIYAFAH / HAMOUDA NEBRAS GOLDEN', distance: 'Shuttle', nights: 6 },
  { name: 'HAMOUDA AL MASI / SIMILAR', distance: '650 M', nights: 6 },
  { name: 'HAMOUDA NEBRAS 1&2 (OLD BURJ HAKEEM) / SIMILAR', distance: '450 M', nights: 6 }
];

export default function AdminUmrahCreatePackage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    airline: '',
    airlineCode: '',
    flightNumber: '',
    origin: { airportCode: '', city: '' },
    destination: { airportCode: '', city: '' },
    departureDate: '',
    departureTime: '00:00',
    arrivalDate: '',
    arrivalTime: '00:00',
    returnDate: '',
    returnDepartureTime: '00:00',
    returnArrivalDate: '',
    returnArrivalTime: '00:00',
    duration: 14,
    flightType: 'direct',
    stops: 0,
    baggageAllowance: { departure: '23 KG', arrival: '46 KG' },
    makkahHotel: { name: '', distance: '', nights: 8 },
    madinahHotel: { name: '', distance: '', nights: 6 },
    perPersonPrice: 0,
    sharingPrices: { quad: 0, triple: 0, double: 0 },
    childWithoutBedPrice: 0,
    infantPrice: 0,
    totalSeats: 0,
    isActive: true,
    isFeatured: false,
    includes: ['Visa', 'Ticket', 'Accommodation', 'Transport']
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValidationErrors(prev => ({ ...prev, [name]: '' }));

    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: type === 'checkbox' ? checked : value }
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSharingChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      sharingPrices: { ...prev.sharingPrices, [type]: parseFloat(value) || 0 }
    }));
  };

  // ✅ FIX: Properly handle hotel nights with explicit number conversion
  const handleMakkahHotelChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      makkahHotel: { 
        ...prev.makkahHotel, 
        [field]: field === 'nights' ? parseInt(value) || 0 : value 
      }
    }));
  };

  const handleMadinahHotelChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      madinahHotel: { 
        ...prev.madinahHotel, 
        [field]: field === 'nights' ? parseInt(value) || 0 : value 
      }
    }));
  };

  const handleOriginChange = (code) => {
    const airport = AIRPORTS.find(a => a.code === code);
    setFormData(prev => ({
      ...prev,
      origin: { airportCode: code, city: airport?.city || '' }
    }));
  };

  const handleDestinationChange = (code) => {
    const airport = AIRPORTS.find(a => a.code === code);
    setFormData(prev => ({
      ...prev,
      destination: { airportCode: code, city: airport?.city || '' }
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.packageName.trim()) errors.packageName = 'Package name is required';
    if (!formData.airline) errors.airline = 'Airline is required';
    if (!formData.flightNumber.trim()) errors.flightNumber = 'Flight number is required';
    if (!formData.origin.airportCode) errors['origin.airportCode'] = 'Origin airport is required';
    if (!formData.destination.airportCode) errors['destination.airportCode'] = 'Destination airport is required';
    if (!formData.departureDate) errors.departureDate = 'Departure date is required';
    if (!formData.arrivalDate) errors.arrivalDate = 'Arrival date is required';
    if (!formData.returnDate) errors.returnDate = 'Return date is required';
    if (!formData.returnArrivalDate) errors.returnArrivalDate = 'Return arrival date is required';
    if (formData.duration < 1) errors.duration = 'Duration must be at least 1 day';
    if (!formData.makkahHotel.name) errors['makkahHotel.name'] = 'Makkah hotel is required';
    if (!formData.madinahHotel.name) errors['madinahHotel.name'] = 'Madinah hotel is required';
    if (formData.perPersonPrice <= 0) errors.perPersonPrice = 'Per person price must be greater than 0';
    if (formData.totalSeats < 0) errors.totalSeats = 'Total seats cannot be negative';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ FIX: Ensure nights are properly included as numbers in the payload
      const payload = {
        ...formData,
        departureDate: new Date(formData.departureDate).toISOString(),
        arrivalDate: new Date(formData.arrivalDate).toISOString(),
        returnDate: new Date(formData.returnDate).toISOString(),
        returnArrivalDate: new Date(formData.returnArrivalDate).toISOString(),
        totalSeats: parseInt(formData.totalSeats) || 0,
        makkahHotel: {
          name: formData.makkahHotel.name,
          distance: formData.makkahHotel.distance || '',
          nights: parseInt(formData.makkahHotel.nights) || 0,
          rating: 0
        },
        madinahHotel: {
          name: formData.madinahHotel.name,
          distance: formData.madinahHotel.distance || '',
          nights: parseInt(formData.madinahHotel.nights) || 0,
          rating: 0
        }
      };

      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

      const response = await umrahService.createPackage(payload);
      console.log('✅ Package created:', response);
      
      navigate('/admin/umrah/adminpackages');
    } catch (err) {
      console.error('Error creating package:', err);
      setError(err instanceof ApiError ? err.message : 'Could not create package.');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleHotels = () => {
    const makkahSample = SAMPLE_MAKKAH_HOTELS[Math.floor(Math.random() * SAMPLE_MAKKAH_HOTELS.length)];
    const madinahSample = SAMPLE_MADINAH_HOTELS[Math.floor(Math.random() * SAMPLE_MADINAH_HOTELS.length)];
    
    setFormData(prev => ({
      ...prev,
      makkahHotel: { ...prev.makkahHotel, ...makkahSample },
      madinahHotel: { ...prev.madinahHotel, ...madinahSample }
    }));
  };

  if (loading) {
    return (
      <div className="admin-umrah-form-wrapper">
        <div className="center" style={{ padding: '48px 0' }}>
          <Spinner label="Creating package..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-umrah-form-wrapper">
      <div className="admin-umrah-form-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Create Umrah Package</h1>
          <p className="faint">Add a new Umrah package with flight and hotel details</p>
        </div>
        <Link to="/admin/umrah/adminpackages" className="btn btn--ghost">
          ← Back to Packages
        </Link>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="admin-umrah-form">
        {/* Package Name */}
        <div className="form-section">
          <h3>Package Information</h3>
          <div className="form-row">
            <div className="field-group full">
              <label>Package Name *</label>
              <input
                type="text"
                name="packageName"
                value={formData.packageName}
                onChange={handleChange}
                placeholder="e.g., 14 Days Umrah Package - Premium"
                className={validationErrors.packageName ? 'error' : ''}
              />
              {validationErrors.packageName && (
                <span className="error-text">{validationErrors.packageName}</span>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="field-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Package description..."
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="form-section">
          <h3>Flight Details</h3>
          <div className="form-row">
            <div className="field-group">
              <label>Airline *</label>
              <select
                name="airline"
                value={formData.airline}
                onChange={handleChange}
                className={validationErrors.airline ? 'error' : ''}
              >
                <option value="">Select Airline</option>
                {AIRLINES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {validationErrors.airline && (
                <span className="error-text">{validationErrors.airline}</span>
              )}
            </div>
            <div className="field-group">
              <label>Airline Code</label>
              <input
                type="text"
                name="airlineCode"
                value={formData.airlineCode}
                onChange={handleChange}
                placeholder="e.g., SV"
                maxLength="3"
              />
            </div>
            <div className="field-group">
              <label>Flight Number *</label>
              <input
                type="text"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleChange}
                placeholder="e.g., SV723"
                className={validationErrors.flightNumber ? 'error' : ''}
              />
              {validationErrors.flightNumber && (
                <span className="error-text">{validationErrors.flightNumber}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label>Origin *</label>
              <select
                value={formData.origin.airportCode}
                onChange={(e) => handleOriginChange(e.target.value)}
                className={validationErrors['origin.airportCode'] ? 'error' : ''}
              >
                <option value="">Select Origin</option>
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.code} - {a.city}</option>
                ))}
              </select>
              {validationErrors['origin.airportCode'] && (
                <span className="error-text">{validationErrors['origin.airportCode']}</span>
              )}
            </div>
            <div className="field-group">
              <label>Destination *</label>
              <select
                value={formData.destination.airportCode}
                onChange={(e) => handleDestinationChange(e.target.value)}
                className={validationErrors['destination.airportCode'] ? 'error' : ''}
              >
                <option value="">Select Destination</option>
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.code} - {a.city}</option>
                ))}
              </select>
              {validationErrors['destination.airportCode'] && (
                <span className="error-text">{validationErrors['destination.airportCode']}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label>Departure Date *</label>
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleChange}
                className={validationErrors.departureDate ? 'error' : ''}
              />
              {validationErrors.departureDate && (
                <span className="error-text">{validationErrors.departureDate}</span>
              )}
            </div>
            <div className="field-group">
              <label>Departure Time</label>
              <input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
              />
            </div>
            <div className="field-group">
              <label>Arrival Date *</label>
              <input
                type="date"
                name="arrivalDate"
                value={formData.arrivalDate}
                onChange={handleChange}
                className={validationErrors.arrivalDate ? 'error' : ''}
              />
              {validationErrors.arrivalDate && (
                <span className="error-text">{validationErrors.arrivalDate}</span>
              )}
            </div>
            <div className="field-group">
              <label>Arrival Time</label>
              <input
                type="time"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label>Return Departure Date *</label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                className={validationErrors.returnDate ? 'error' : ''}
              />
              {validationErrors.returnDate && (
                <span className="error-text">{validationErrors.returnDate}</span>
              )}
            </div>
            <div className="field-group">
              <label>Return Departure Time</label>
              <input
                type="time"
                name="returnDepartureTime"
                value={formData.returnDepartureTime}
                onChange={handleChange}
              />
            </div>
            <div className="field-group">
              <label>Return Arrival Date *</label>
              <input
                type="date"
                name="returnArrivalDate"
                value={formData.returnArrivalDate}
                onChange={handleChange}
                className={validationErrors.returnArrivalDate ? 'error' : ''}
              />
              {validationErrors.returnArrivalDate && (
                <span className="error-text">{validationErrors.returnArrivalDate}</span>
              )}
            </div>
            <div className="field-group">
              <label>Return Arrival Time</label>
              <input
                type="time"
                name="returnArrivalTime"
                value={formData.returnArrivalTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label>Duration (Days) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                className={validationErrors.duration ? 'error' : ''}
              />
              {validationErrors.duration && (
                <span className="error-text">{validationErrors.duration}</span>
              )}
            </div>
            <div className="field-group">
              <label>Flight Type</label>
              <select name="flightType" value={formData.flightType} onChange={handleChange}>
                <option value="direct">Direct</option>
                <option value="connecting">Connecting</option>
              </select>
            </div>
            <div className="field-group">
              <label>Number of Stops</label>
              <input
                type="number"
                name="stops"
                value={formData.stops}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label>Baggage - Departure</label>
              <input
                type="text"
                name="baggageAllowance.departure"
                value={formData.baggageAllowance.departure}
                onChange={handleChange}
                placeholder="e.g., 23 KG"
              />
            </div>
            <div className="field-group">
              <label>Baggage - Arrival</label>
              <input
                type="text"
                name="baggageAllowance.arrival"
                value={formData.baggageAllowance.arrival}
                onChange={handleChange}
                placeholder="e.g., 46 KG"
              />
            </div>
          </div>
        </div>

        {/* ✅ FIXED: Hotels Section with proper nights handling */}
        <div className="form-section">
          <h3>Hotels</h3>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={fillSampleHotels}
            style={{ marginBottom: '1rem' }}
          >
            Fill Sample Hotels
          </button>

          <div className="form-row">
            <div className="field-group half">
              <h4>🕋 Makkah Hotel *</h4>
              <div className="hotel-fields">
                <div className="field-group">
                  <label>Hotel Name</label>
                  <input
                    type="text"
                    value={formData.makkahHotel.name}
                    onChange={(e) => handleMakkahHotelChange('name', e.target.value)}
                    className={validationErrors['makkahHotel.name'] ? 'error' : ''}
                    placeholder="e.g., WEDAM SIX"
                  />
                  {validationErrors['makkahHotel.name'] && (
                    <span className="error-text">{validationErrors['makkahHotel.name']}</span>
                  )}
                </div>
                <div className="field-group">
                  <label>Distance from Haram</label>
                  <input
                    type="text"
                    value={formData.makkahHotel.distance}
                    onChange={(e) => handleMakkahHotelChange('distance', e.target.value)}
                    placeholder="e.g., 1200 M or Shuttle"
                  />
                </div>
                <div className="field-group">
                  <label>Nights *</label>
                  <input
                    type="number"
                    value={formData.makkahHotel.nights}
                    onChange={(e) => handleMakkahHotelChange('nights', e.target.value)}
                    min="0"
                    placeholder="Number of nights"
                  />
                </div>
              </div>
            </div>

            <div className="field-group half">
              <h4>🕌 Madinah Hotel *</h4>
              <div className="hotel-fields">
                <div className="field-group">
                  <label>Hotel Name</label>
                  <input
                    type="text"
                    value={formData.madinahHotel.name}
                    onChange={(e) => handleMadinahHotelChange('name', e.target.value)}
                    className={validationErrors['madinahHotel.name'] ? 'error' : ''}
                    placeholder="e.g., QADAT AL DIYAFAH"
                  />
                  {validationErrors['madinahHotel.name'] && (
                    <span className="error-text">{validationErrors['madinahHotel.name']}</span>
                  )}
                </div>
                <div className="field-group">
                  <label>Distance from Haram</label>
                  <input
                    type="text"
                    value={formData.madinahHotel.distance}
                    onChange={(e) => handleMadinahHotelChange('distance', e.target.value)}
                    placeholder="e.g., 650 M or Shuttle"
                  />
                </div>
                <div className="field-group">
                  <label>Nights *</label>
                  <input
                    type="number"
                    value={formData.madinahHotel.nights}
                    onChange={(e) => handleMadinahHotelChange('nights', e.target.value)}
                    min="0"
                    placeholder="Number of nights"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h3>Pricing</h3>
          <div className="form-row">
            <div className="field-group">
              <label>Per Person Price (Base) *</label>
              <input
                type="number"
                name="perPersonPrice"
                value={formData.perPersonPrice}
                onChange={handleChange}
                min="0"
                className={validationErrors.perPersonPrice ? 'error' : ''}
              />
              {validationErrors.perPersonPrice && (
                <span className="error-text">{validationErrors.perPersonPrice}</span>
              )}
            </div>
            <div className="field-group">
              <label>Child Without Bed</label>
              <input
                type="number"
                name="childWithoutBedPrice"
                value={formData.childWithoutBedPrice}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="field-group">
              <label>Infant</label>
              <input
                type="number"
                name="infantPrice"
                value={formData.infantPrice}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <h4>Sharing Prices (Optional)</h4>
            {SHARING_TYPES.map((type) => (
              <div className="field-group" key={type}>
                <label>{type.charAt(0).toUpperCase() + type.slice(1)} Sharing</label>
                <input
                  type="number"
                  value={formData.sharingPrices[type] || 0}
                  onChange={(e) => handleSharingChange(type, e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Seats & Status */}
        <div className="form-section">
          <h3>Seats & Status</h3>
          <div className="form-row">
            <div className="field-group">
              <label>Total Seats</label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                min="0"
                className={validationErrors.totalSeats ? 'error' : ''}
              />
              {validationErrors.totalSeats && (
                <span className="error-text">{validationErrors.totalSeats}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active (Visible to customers)
              </label>
            </div>
            <div className="field-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                Featured (Highlight on homepage)
              </label>
            </div>
          </div>
        </div>

        {/* Includes */}
        <div className="form-section">
          <h3>What's Included</h3>
          <div className="form-row">
            <div className="field-group full">
              <div className="includes-grid">
                {['Visa', 'Ticket', 'Accommodation', 'Transport', 'Meals', 'Guide', 'Insurance', 'Ziyarat'].map((item) => (
                  <label key={item} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.includes.includes(item)}
                      onChange={(e) => {
                        const newIncludes = e.target.checked
                          ? [...formData.includes, item]
                          : formData.includes.filter(i => i !== item);
                        setFormData(prev => ({ ...prev, includes: newIncludes }));
                      }}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <Link to="/admin/umrah/adminpackages" className="btn btn--ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>
  );
}