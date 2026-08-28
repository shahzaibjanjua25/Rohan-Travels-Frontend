// frontend/src/pages/admin/AdminUmrahEditPackage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { umrahService } from '../../services/umrah';
import { ApiError } from '../../services/api';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import './AdminUmrahPackageForm.css';

// ============================================
// COMPLETE AIRPORTS LIST (same as Create)
// ============================================
const AIRPORTS = [
  { code: 'ISB', city: 'Islamabad', country: 'Pakistan' },
  { code: 'LHE', city: 'Lahore', country: 'Pakistan' },
  { code: 'KHI', city: 'Karachi', country: 'Pakistan' },
  { code: 'PEW', city: 'Peshawar', country: 'Pakistan' },
  { code: 'MUX', city: 'Multan', country: 'Pakistan' },
  { code: 'SKT', city: 'Sialkot', country: 'Pakistan' },
  { code: 'UET', city: 'Quetta', country: 'Pakistan' },
  { code: 'LYP', city: 'Faisalabad', country: 'Pakistan' },
  { code: 'GWD', city: 'Gwadar', country: 'Pakistan' },
  { code: 'RYK', city: 'Rahim Yar Khan', country: 'Pakistan' },
  { code: 'KDU', city: 'Skardu', country: 'Pakistan' },
  { code: 'GIL', city: 'Gilgit', country: 'Pakistan' },
  { code: 'CJL', city: 'Chitral', country: 'Pakistan' },
  { code: 'DSK', city: 'Dera Ismail Khan', country: 'Pakistan' },
  { code: 'PAJ', city: 'Panjgur', country: 'Pakistan' },
  { code: 'DBA', city: 'Dalbandin', country: 'Pakistan' },
  { code: 'SGI', city: 'Sargodha', country: 'Pakistan' },
  { code: 'MWD', city: 'Mianwali', country: 'Pakistan' },
  { code: 'ZIA', city: 'Zhob', country: 'Pakistan' },
  { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia' },
  { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia' },
  { code: 'DMM', city: 'Dammam', country: 'Saudi Arabia' },
  { code: 'MED', city: 'Madinah', country: 'Saudi Arabia' },
  { code: 'TIF', city: 'Taif', country: 'Saudi Arabia' },
  { code: 'AHB', city: 'Abha', country: 'Saudi Arabia' },
  { code: 'GIZ', city: 'Jazan', country: 'Saudi Arabia' },
  { code: 'HOF', city: 'Hofuf', country: 'Saudi Arabia' },
  { code: 'TUU', city: 'Tabuk', country: 'Saudi Arabia' },
  { code: 'EJN', city: 'Al Ula', country: 'Saudi Arabia' },
  { code: 'ELQ', city: 'Gassim', country: 'Saudi Arabia' },
  { code: 'HBT', city: 'Hail', country: 'Saudi Arabia' },
  { code: 'RAE', city: 'Arar', country: 'Saudi Arabia' },
  { code: 'URY', city: 'Gurayat', country: 'Saudi Arabia' },
  { code: 'YNB', city: 'Yanbu', country: 'Saudi Arabia' },
  { code: 'AQI', city: 'Qaisumah', country: 'Saudi Arabia' },
  { code: 'NQS', city: 'King Khalid Military City', country: 'Saudi Arabia' },
  { code: 'DHA', city: 'Dhahran', country: 'Saudi Arabia' },
  { code: 'DXB', city: 'Dubai', country: 'UAE' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'UAE' },
  { code: 'SHJ', city: 'Sharjah', country: 'UAE' },
  { code: 'RKT', city: 'Ras Al Khaimah', country: 'UAE' },
  { code: 'DOH', city: 'Doha', country: 'Qatar' },
  { code: 'BAH', city: 'Manama', country: 'Bahrain' },
  { code: 'KWI', city: 'Kuwait City', country: 'Kuwait' },
  { code: 'MCT', city: 'Muscat', country: 'Oman' },
  { code: 'SLL', city: 'Salalah', country: 'Oman' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey' },
  { code: 'SAW', city: 'Istanbul', country: 'Turkey' },
  { code: 'ANK', city: 'Ankara', country: 'Turkey' },
  { code: 'LHR', city: 'London', country: 'UK' },
  { code: 'LGW', city: 'London', country: 'UK' },
  { code: 'MAN', city: 'Manchester', country: 'UK' },
  { code: 'BHX', city: 'Birmingham', country: 'UK' },
  { code: 'JFK', city: 'New York', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA' },
  { code: 'ORD', city: 'Chicago', country: 'USA' },
  { code: 'IAH', city: 'Houston', country: 'USA' },
  { code: 'CDG', city: 'Paris', country: 'France' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand' },
  { code: 'NRT', city: 'Tokyo', country: 'Japan' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea' },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong' },
  { code: 'BEY', city: 'Beirut', country: 'Lebanon' },
  { code: 'AMM', city: 'Amman', country: 'Jordan' },
  { code: 'CAI', city: 'Cairo', country: 'Egypt' },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa' },
  { code: 'CUSTOM', city: 'Custom Airport', country: 'Custom' },
];

const ROOM_TYPES = [
  { value: 'single', label: 'Single (1 person)' },
  { value: 'double', label: 'Double (2 persons)' },
  { value: 'triple', label: 'Triple (3 persons)' },
  { value: 'quad', label: 'Quad (4 persons)' },
  { value: 'sharing', label: 'Sharing (5+ persons)' },
];

const SAMPLE_MAKKAH_HOTELS = [
  { name: 'WEDAM SIX', distance: 'Shuttle', nights: 8 },
  { name: 'WHITE LION', distance: '1200 M', nights: 8 },
  { name: 'MASARAT KHALIL / NADA HIJRA', distance: '750 M', nights: 8 },
  { name: 'MASARAT GOLDEN', distance: '600 M', nights: 8 }
];

const SAMPLE_MAKKAH_RETURN_HOTELS = [
  { name: 'WEDAM SIX', distance: 'Shuttle', nights: 2 },
  { name: 'WHITE LION', distance: '1200 M', nights: 2 },
  { name: 'MASARAT KHALIL / NADA HIJRA', distance: '750 M', nights: 2 },
  { name: 'MASARAT GOLDEN', distance: '600 M', nights: 2 }
];

const SAMPLE_MADINAH_HOTELS = [
  { name: 'QADAT AL DIYAFAH / HAMOUDA NEBRAS GOLDEN', distance: 'Shuttle', nights: 6 },
  { name: 'HAMOUDA AL MASI / SIMILAR', distance: '650 M', nights: 6 },
  { name: 'HAMOUDA NEBRAS 1&2 (OLD BURJ HAKEEM) / SIMILAR', distance: '450 M', nights: 6 }
];

export default function AdminUmrahEditPackage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    loadPackage();
  }, [id]);

  const loadPackage = async () => {
    try {
      setLoading(true);
      const response = await umrahService.getPackage(id);
      const pkg = response.data;

      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      // Check if origin/destination are custom
      const isOriginCustom = pkg.origin?.airportCode === 'CUSTOM' || 
        (pkg.origin?.airportCode && !AIRPORTS.find(a => a.code === pkg.origin.airportCode));
      
      const isDestCustom = pkg.destination?.airportCode === 'CUSTOM' || 
        (pkg.destination?.airportCode && !AIRPORTS.find(a => a.code === pkg.destination.airportCode));

      setFormData({
        ...pkg,
        departureDate: formatDate(pkg.departureDate),
        arrivalDate: formatDate(pkg.arrivalDate),
        returnDate: formatDate(pkg.returnDate),
        returnArrivalDate: formatDate(pkg.returnArrivalDate),
        baggageAllowance: {
          departure: pkg.baggageAllowance?.departure || '23 KG',
          arrival: pkg.baggageAllowance?.arrival || '46 KG',
          return: pkg.baggageAllowance?.return || '', // âœ¨ NEW: Return baggage
        },
        makkahHotel: {
          ...pkg.makkahHotel,
          nights: pkg.makkahHotel?.nights || 0
        },
        makkahReturnHotel: pkg.makkahReturnHotel ? {
          ...pkg.makkahReturnHotel,
          nights: pkg.makkahReturnHotel?.nights || 0
        } : { name: '', distance: '', nights: 0 },
        madinahHotel: {
          ...pkg.madinahHotel,
          nights: pkg.madinahHotel?.nights || 0
        },
        sharingPrices: {
          single: pkg.sharingPrices?.single || 0,
          double: pkg.sharingPrices?.double || 0,
          triple: pkg.sharingPrices?.triple || 0,
          quad: pkg.sharingPrices?.quad || 0,
          sharing: pkg.sharingPrices?.sharing || 0,
        },
        ziyaratEnabled: pkg.ziyaratEnabled || false,
        ziyaratPrice: pkg.ziyaratPrice || 0,
        ziyaratDescription: pkg.ziyaratDescription || 'Guided Ziyarat tour of holy sites.',
        // Custom airport fields
        customOriginName: isOriginCustom ? pkg.origin?.airportName || pkg.origin?.city || '' : '',
        customOriginCity: isOriginCustom ? pkg.origin?.city || '' : '',
        customDestinationName: isDestCustom ? pkg.destination?.airportName || pkg.destination?.city || '' : '',
        customDestinationCity: isDestCustom ? pkg.destination?.city || '' : '',
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load package.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleMakkahHotelChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      makkahHotel: { 
        ...prev.makkahHotel, 
        [field]: field === 'nights' ? parseInt(value) || 0 : value 
      }
    }));
  };

  const handleMakkahReturnHotelChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      makkahReturnHotel: { 
        ...prev.makkahReturnHotel, 
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
    if (code === 'CUSTOM') {
      setFormData(prev => ({
        ...prev,
        origin: { airportCode: 'CUSTOM', city: '', country: '' }
      }));
      return;
    }
    const airport = AIRPORTS.find(a => a.code === code);
    setFormData(prev => ({
      ...prev,
      origin: { 
        airportCode: code, 
        city: airport?.city || '', 
        country: airport?.country || '' 
      }
    }));
  };

  const handleDestinationChange = (code) => {
    if (code === 'CUSTOM') {
      setFormData(prev => ({
        ...prev,
        destination: { airportCode: 'CUSTOM', city: '', country: '' }
      }));
      return;
    }
    const airport = AIRPORTS.find(a => a.code === code);
    setFormData(prev => ({
      ...prev,
      destination: { 
        airportCode: code, 
        city: airport?.city || '', 
        country: airport?.country || '' 
      }
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.packageName?.trim()) errors.packageName = 'Package name is required';
    if (!formData.airline?.trim()) errors.airline = 'Airline name is required';
    if (!formData.flightNumber?.trim()) errors.flightNumber = 'Flight number is required';
    
    if (!formData.origin?.airportCode) errors['origin.airportCode'] = 'Origin airport is required';
    if (formData.origin?.airportCode === 'CUSTOM' && !formData.customOriginCity?.trim()) {
      errors['origin.customCity'] = 'Custom origin city is required';
    }
    
    if (!formData.destination?.airportCode) errors['destination.airportCode'] = 'Destination airport is required';
    if (formData.destination?.airportCode === 'CUSTOM' && !formData.customDestinationCity?.trim()) {
      errors['destination.customCity'] = 'Custom destination city is required';
    }
    
    if (!formData.departureDate) errors.departureDate = 'Departure date is required';
    if (!formData.arrivalDate) errors.arrivalDate = 'Arrival date is required';
    if (!formData.returnDate) errors.returnDate = 'Return date is required';
    if (!formData.returnArrivalDate) errors.returnArrivalDate = 'Return arrival date is required';
    if (formData.duration < 1) errors.duration = 'Duration must be at least 1 day';
    if (!formData.makkahHotel?.name) errors['makkahHotel.name'] = 'Makkah hotel is required';
    if (!formData.madinahHotel?.name) errors['madinahHotel.name'] = 'Madinah hotel is required';
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

    setSaving(true);
    setError('');

    try {
      // Build origin with custom fields if needed
      let origin = { ...formData.origin };
      let destination = { ...formData.destination };
      
      if (formData.origin.airportCode === 'CUSTOM') {
        origin = {
          airportCode: 'CUSTOM',
          city: formData.customOriginCity || 'Custom City',
          country: 'Custom',
          airportName: formData.customOriginName || formData.customOriginCity || 'Custom Airport'
        };
      }
      
      if (formData.destination.airportCode === 'CUSTOM') {
        destination = {
          airportCode: 'CUSTOM',
          city: formData.customDestinationCity || 'Custom City',
          country: 'Custom',
          airportName: formData.customDestinationName || formData.customDestinationCity || 'Custom Airport'
        };
      }

      const payload = {
        ...formData,
        origin,
        destination,
        departureDate: new Date(formData.departureDate).toISOString(),
        arrivalDate: new Date(formData.arrivalDate).toISOString(),
        returnDate: new Date(formData.returnDate).toISOString(),
        returnArrivalDate: new Date(formData.returnArrivalDate).toISOString(),
        totalSeats: parseInt(formData.totalSeats) || 0,
        baggageAllowance: {
          departure: formData.baggageAllowance?.departure || '23 KG',
          arrival: formData.baggageAllowance?.arrival || '46 KG',
          return: formData.baggageAllowance?.return || '', // âœ¨ NEW: Return baggage
        },
        makkahHotel: {
          name: formData.makkahHotel.name,
          distance: formData.makkahHotel.distance || '',
          nights: parseInt(formData.makkahHotel.nights) || 0,
          rating: formData.makkahHotel.rating || 0
        },
        makkahReturnHotel: formData.makkahReturnHotel?.name ? {
          name: formData.makkahReturnHotel.name,
          distance: formData.makkahReturnHotel.distance || '',
          nights: parseInt(formData.makkahReturnHotel.nights) || 0,
          rating: formData.makkahReturnHotel.rating || 0
        } : null,
        madinahHotel: {
          name: formData.madinahHotel.name,
          distance: formData.madinahHotel.distance || '',
          nights: parseInt(formData.madinahHotel.nights) || 0,
          rating: formData.madinahHotel.rating || 0
        },
        sharingPrices: {
          single: parseFloat(formData.sharingPrices.single) || 0,
          double: parseFloat(formData.sharingPrices.double) || 0,
          triple: parseFloat(formData.sharingPrices.triple) || 0,
          quad: parseFloat(formData.sharingPrices.quad) || 0,
          sharing: parseFloat(formData.sharingPrices.sharing) || 0,
        },
        ziyaratEnabled: formData.ziyaratEnabled || false,
        ziyaratPrice: parseFloat(formData.ziyaratPrice) || 0,
        ziyaratDescription: formData.ziyaratDescription || '',
      };

      await umrahService.updatePackage(id, payload);
      navigate('/admin/umrah/adminpackages');
    } catch (err) {
      console.error('Error updating package:', err);
      setError(err instanceof ApiError ? err.message : 'Could not update package.');
    } finally {
      setSaving(false);
    }
  };

  const fillSampleHotels = () => {
    const makkahSample = SAMPLE_MAKKAH_HOTELS[Math.floor(Math.random() * SAMPLE_MAKKAH_HOTELS.length)];
    const makkahReturnSample = SAMPLE_MAKKAH_RETURN_HOTELS[Math.floor(Math.random() * SAMPLE_MAKKAH_RETURN_HOTELS.length)];
    const madinahSample = SAMPLE_MADINAH_HOTELS[Math.floor(Math.random() * SAMPLE_MADINAH_HOTELS.length)];
    
    setFormData(prev => ({
      ...prev,
      makkahHotel: { ...prev.makkahHotel, ...makkahSample },
      makkahReturnHotel: { ...prev.makkahReturnHotel, ...makkahReturnSample },
      madinahHotel: { ...prev.madinahHotel, ...madinahSample }
    }));
  };

  if (loading) {
    return (
      <div className="admin-umrah-form-wrapper">
        <div className="center" style={{ padding: '48px 0' }}>
          <Spinner label="Loading package..." />
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="admin-umrah-form-wrapper">
        <Alert kind="error">{error || 'Package not found.'}</Alert>
        <Link to="/admin/umrah/adminpackages" className="btn btn--ghost" style={{ marginTop: '1rem' }}>
          ← Back to Packages
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-umrah-form-wrapper">
      <div className="admin-umrah-form-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Edit Umrah Package</h1>
          <p className="faint">Update the package details</p>
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
                value={formData.packageName || ''}
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
                value={formData.description || ''}
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
              <input
                type="text"
                name="airline"
                value={formData.airline || ''}
                onChange={handleChange}
                placeholder="Enter airline name (e.g., Saudi Arabian Airlines)"
                className={validationErrors.airline ? 'error' : ''}
              />
              {validationErrors.airline && (
                <span className="error-text">{validationErrors.airline}</span>
              )}
            </div>
            <div className="field-group">
              <label>Airline Code (Optional)</label>
              <input
                type="text"
                name="airlineCode"
                value={formData.airlineCode || ''}
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
                value={formData.flightNumber || ''}
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
                value={formData.origin?.airportCode || ''}
                onChange={(e) => handleOriginChange(e.target.value)}
                className={validationErrors['origin.airportCode'] ? 'error' : ''}
              >
                <option value="">Select Origin</option>
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.city}, {a.country}
                  </option>
                ))}
              </select>
              {validationErrors['origin.airportCode'] && (
                <span className="error-text">{validationErrors['origin.airportCode']}</span>
              )}
            </div>
            <div className="field-group">
              <label>Destination *</label>
              <select
                value={formData.destination?.airportCode || ''}
                onChange={(e) => handleDestinationChange(e.target.value)}
                className={validationErrors['destination.airportCode'] ? 'error' : ''}
              >
                <option value="">Select Destination</option>
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.city}, {a.country}
                  </option>
                ))}
              </select>
              {validationErrors['destination.airportCode'] && (
                <span className="error-text">{validationErrors['destination.airportCode']}</span>
              )}
            </div>
          </div>

          {/* Custom Airport Inputs */}
          {formData.origin?.airportCode === 'CUSTOM' && (
            <div className="form-row">
              <div className="field-group">
                <label>Custom Origin Airport Name</label>
                <input
                  type="text"
                  value={formData.customOriginName || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      customOriginName: e.target.value
                    }));
                  }}
                  placeholder="e.g., King Khalid International Airport"
                />
              </div>
              <div className="field-group">
                <label>Custom Origin City *</label>
                <input
                  type="text"
                  value={formData.customOriginCity || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      customOriginCity: e.target.value
                    }));
                  }}
                  placeholder="e.g., Riyadh"
                  className={validationErrors['origin.customCity'] ? 'error' : ''}
                />
                {validationErrors['origin.customCity'] && (
                  <span className="error-text">{validationErrors['origin.customCity']}</span>
                )}
              </div>
            </div>
          )}

          {formData.destination?.airportCode === 'CUSTOM' && (
            <div className="form-row">
              <div className="field-group">
                <label>Custom Destination Airport Name</label>
                <input
                  type="text"
                  value={formData.customDestinationName || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      customDestinationName: e.target.value
                    }));
                  }}
                  placeholder="e.g., Prince Mohammad bin Abdulaziz International Airport"
                />
              </div>
              <div className="field-group">
                <label>Custom Destination City *</label>
                <input
                  type="text"
                  value={formData.customDestinationCity || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      customDestinationCity: e.target.value
                    }));
                  }}
                  placeholder="e.g., Madinah"
                  className={validationErrors['destination.customCity'] ? 'error' : ''}
                />
                {validationErrors['destination.customCity'] && (
                  <span className="error-text">{validationErrors['destination.customCity']}</span>
                )}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="field-group">
              <label>Departure Date *</label>
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate || ''}
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
                value={formData.departureTime || '00:00'}
                onChange={handleChange}
              />
            </div>
            <div className="field-group">
              <label>Arrival Date *</label>
              <input
                type="date"
                name="arrivalDate"
                value={formData.arrivalDate || ''}
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
                value={formData.arrivalTime || '00:00'}
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
                value={formData.returnDate || ''}
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
                value={formData.returnDepartureTime || '00:00'}
                onChange={handleChange}
              />
            </div>
            <div className="field-group">
              <label>Return Arrival Date *</label>
              <input
                type="date"
                name="returnArrivalDate"
                value={formData.returnArrivalDate || ''}
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
                value={formData.returnArrivalTime || '00:00'}
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
                value={formData.duration || 14}
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
              <select name="flightType" value={formData.flightType || 'direct'} onChange={handleChange}>
                <option value="direct">Direct</option>
                <option value="connecting">Connecting</option>
              </select>
            </div>
            <div className="field-group">
              <label>Number of Stops</label>
              <input
                type="number"
                name="stops"
                value={formData.stops || 0}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* Baggage Section with Return Baggage */}
          <div className="form-row">
            <div className="field-group">
              <label>Baggage - Departure</label>
              <input
                type="text"
                name="baggageAllowance.departure"
                value={formData.baggageAllowance?.departure || '23 KG'}
                onChange={handleChange}
                placeholder="e.g., 23 KG"
              />
            </div>
            <div className="field-group">
              <label>Baggage - Arrival</label>
              <input
                type="text"
                name="baggageAllowance.arrival"
                value={formData.baggageAllowance?.arrival || '46 KG'}
                onChange={handleChange}
                placeholder="e.g., 46 KG"
              />
            </div>
            <div className="field-group">
              <label>Return Baggage</label>
              <input
                type="text"
                name="baggageAllowance.return"
                value={formData.baggageAllowance?.return || ''}
                onChange={handleChange}
                placeholder="e.g., 30 KG"
              />
              <span className="field-helper" style={{ fontSize: '11px', color: '#94a3b8' }}>
                Baggage allowance for the return journey
              </span>
            </div>
          </div>
        </div>

        {/* Hotels Section with Makkah Return */}
        <div className="form-section">
          <h3>Hotels</h3>
          <p className="faint" style={{ marginBottom: '1rem', fontSize: '14px' }}>
            Journey: <strong>Makkah</strong> → <strong>Madinah</strong> → <strong>Makkah (Return)</strong>
          </p>
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
                    value={formData.makkahHotel?.name || ''}
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
                    value={formData.makkahHotel?.distance || ''}
                    onChange={(e) => handleMakkahHotelChange('distance', e.target.value)}
                    placeholder="e.g., 1200 M or Shuttle"
                  />
                </div>
                <div className="field-group">
                  <label>Nights *</label>
                  <input
                    type="number"
                    value={formData.makkahHotel?.nights || 0}
                    onChange={(e) => handleMakkahHotelChange('nights', e.target.value)}
                    min="0"
                    placeholder="Number of nights"
                  />
                </div>
              </div>
            </div>

            <div className="field-group half">
              <h4>🕋 Makkah Return Hotel</h4>
              <div className="hotel-fields">
                <div className="field-group">
                  <label>Hotel Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.makkahReturnHotel?.name || ''}
                    onChange={(e) => handleMakkahReturnHotelChange('name', e.target.value)}
                    placeholder="e.g., WEDAM SIX"
                  />
                </div>
                <div className="field-group">
                  <label>Distance from Haram</label>
                  <input
                    type="text"
                    value={formData.makkahReturnHotel?.distance || ''}
                    onChange={(e) => handleMakkahReturnHotelChange('distance', e.target.value)}
                    placeholder="e.g., 1200 M or Shuttle"
                  />
                </div>
                <div className="field-group">
                  <label>Nights</label>
                  <input
                    type="number"
                    value={formData.makkahReturnHotel?.nights || 0}
                    onChange={(e) => handleMakkahReturnHotelChange('nights', e.target.value)}
                    min="0"
                    placeholder="Number of nights"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="field-group half">
              <h4>🕌 Madinah Hotel *</h4>
              <div className="hotel-fields">
                <div className="field-group">
                  <label>Hotel Name</label>
                  <input
                    type="text"
                    value={formData.madinahHotel?.name || ''}
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
                    value={formData.madinahHotel?.distance || ''}
                    onChange={(e) => handleMadinahHotelChange('distance', e.target.value)}
                    placeholder="e.g., 650 M or Shuttle"
                  />
                </div>
                <div className="field-group">
                  <label>Nights *</label>
                  <input
                    type="number"
                    value={formData.madinahHotel?.nights || 0}
                    onChange={(e) => handleMadinahHotelChange('nights', e.target.value)}
                    min="0"
                    placeholder="Number of nights"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing with all room types */}
        <div className="form-section">
          <h3>Pricing</h3>
          <div className="form-row">
            <div className="field-group">
              <label>Per Person Price (Base) *</label>
              <input
                type="number"
                name="perPersonPrice"
                value={formData.perPersonPrice || 0}
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
                value={formData.childWithoutBedPrice || 0}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="field-group">
              <label>Infant</label>
              <input
                type="number"
                name="infantPrice"
                value={formData.infantPrice || 0}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <h4>Sharing Prices (Per Person)</h4>
            {ROOM_TYPES.map((type) => (
              <div className="field-group" key={type.value}>
                <label>{type.label}</label>
                <input
                  type="number"
                  value={formData.sharingPrices?.[type.value] || 0}
                  onChange={(e) => handleSharingChange(type.value, e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Ziyarat Package Section */}
        <div className="form-section">
          <h3>Ziyarat Package</h3>
          <p className="faint" style={{ marginBottom: '1rem', fontSize: '14px' }}>
            Offer a guided Ziyarat tour as an optional add-on for your customers.
          </p>
          
          <div className="form-row">
            <div className="field-group">
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  name="ziyaratEnabled"
                  checked={formData.ziyaratEnabled || false}
                  onChange={handleChange}
                />
                Enable Ziyarat Package
              </label>
            </div>
          </div>

          {formData.ziyaratEnabled && (
            <>
              <div className="form-row">
                <div className="field-group">
                  <label>Ziyarat Price (PKR) *</label>
                  <input
                    type="number"
                    name="ziyaratPrice"
                    value={formData.ziyaratPrice || 0}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="field-group">
                  <label>Ziyarat Description</label>
                  <textarea
                    name="ziyaratDescription"
                    value={formData.ziyaratDescription || ''}
                    onChange={handleChange}
                    placeholder="Describe what's included in the Ziyarat tour..."
                    rows="3"
                  />
                </div>
              </div>
            </>
          )}
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
                value={formData.totalSeats || 0}
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
                  checked={formData.isActive !== false}
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
                  checked={formData.isFeatured || false}
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
                      checked={(formData.includes || []).includes(item)}
                      onChange={(e) => {
                        const newIncludes = e.target.checked
                          ? [...(formData.includes || []), item]
                          : (formData.includes || []).filter(i => i !== item);
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
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving...' : 'Update Package'}
          </button>
        </div>
      </form>
    </div>
  );
}