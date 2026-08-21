// frontend/src/pages/Home.jsx
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { flightService } from '../services/flights';
import { umrahService } from '../services/umrah';
import bahrainImage from '../assests/bahrain.jpg';
import omanImage from '../assests/oman.jpg';
import heroVideo from '../assests/hero-vid.mp4';
import saudiphoto from '../assests/saudia.jpg';
import qatarImage from '../assests/qatar.jpg';
import umrahBgImage from '../assests/umrah-bg.jpg'; 
import { CONTACTS } from '../config/contacts';

// Import Umrah images
import umrahImage1 from '../assests/umrah.jpg';
import umrahImage2 from '../assests/umrah2.jpg';
import umrahImage3 from '../assests/umrah3.jpg';

import {
  Plane,
  Search,
  Calendar,
  Users,
  Shield,
  Globe,
  ChevronRight,
  Star,
  Clock,
  Award,
  Headphones,
  Sparkles,
  Loader,
  Package,
  Umbrella,
  Compass,
  MapPin,
  CheckCircle,
  Gift,
  Building,
  Phone,
  Mail,
  ArrowRight,
  Facebook,
  Instagram,
  Twitter,
  ChevronDown,
  Ticket,
} from 'lucide-react';
import { FaFacebook, FaWhatsapp, FaTiktok } from 'react-icons/fa';
import './Home.css';

// ============================================
// AIRPORT DATA
// ============================================
const DOMESTIC_AIRPORTS = [
  { code: 'ISB', city: 'Islamabad', name: 'Islamabad International Airport' },
  { code: 'LHE', city: 'Lahore', name: 'Allama Iqbal International Airport' },
  { code: 'KHI', city: 'Karachi', name: 'Jinnah International Airport' },
  { code: 'PEW', city: 'Peshawar', name: 'Bacha Khan International Airport' },
  { code: 'MUX', city: 'Multan', name: 'Multan International Airport' },
  { code: 'SKT', city: 'Sialkot', name: 'Sialkot International Airport' },
  { code: 'UET', city: 'Quetta', name: 'Quetta International Airport' },
  { code: 'LYP', city: 'Faisalabad', name: 'Faisalabad International Airport' },
  { code: 'GWD', city: 'Gwadar', name: 'Gwadar International Airport' },
  { code: 'KDU', city: 'Skardu', name: 'Skardu Airport' },
  { code: 'GIL', city: 'Gilgit', name: 'Gilgit Airport' },
  { code: 'CJL', city: 'Chitral', name: 'Chitral Airport' },
  { code: 'DSK', city: 'Dera Ismail Khan', name: 'Dera Ismail Khan Airport' },
  { code: 'RYK', city: 'Rahim Yar Khan', name: 'Shaikh Zayed International Airport' },
  { code: 'TUK', city: 'Turbat', name: 'Turbat International Airport' },
  { code: 'PAJ', city: 'Panjgur', name: 'Panjgur Airport' },
  { code: 'DBA', city: 'Dalbandin', name: 'Dalbandin Airport' },
  { code: 'SGI', city: 'Sargodha', name: 'Sargodha Airport' },
  { code: 'MWD', city: 'Mianwali', name: 'Mianwali Airport' },
  { code: 'ZIA', city: 'Zhob', name: 'Zhob Airport' },
];

const INTERNATIONAL_AIRPORTS = [
  // UAE
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Abu Dhabi International Airport', country: 'UAE' },
  { code: 'SHJ', city: 'Sharjah', name: 'Sharjah International Airport', country: 'UAE' },

  // Saudi Arabia
  { code: 'JED', city: 'Jeddah', name: 'King Abdulaziz International Airport', country: 'Saudi Arabia' },
  { code: 'RUH', city: 'Riyadh', name: 'King Khalid International Airport', country: 'Saudi Arabia' },
  { code: 'MED', city: 'Madinah', name: 'Prince Mohammad bin Abdulaziz International Airport', country: 'Saudi Arabia' },
  { code: 'DMM', city: 'Dammam', name: 'King Fahd International Airport', country: 'Saudi Arabia' },

  // Qatar
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar' },

  // Oman
  { code: 'MCT', city: 'Muscat', name: 'Muscat International Airport', country: 'Oman' },
  { code: 'SLL', city: 'Salalah', name: 'Salalah International Airport', country: 'Oman' },

  // Bahrain
  { code: 'BAH', city: 'Manama', name: 'Bahrain International Airport', country: 'Bahrain' },

  // Kuwait
  { code: 'KWI', city: 'Kuwait City', name: 'Kuwait International Airport', country: 'Kuwait' },

  // Turkey
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
  { code: 'SAW', city: 'Istanbul', name: 'Sabiha Gökçen International Airport', country: 'Turkey' },

  // UK
  { code: 'LHR', city: 'London', name: 'London Heathrow Airport', country: 'UK' },
  { code: 'LGW', city: 'London', name: 'London Gatwick Airport', country: 'UK' },
  { code: 'MAN', city: 'Manchester', name: 'Manchester Airport', country: 'UK' },

  // USA
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'USA' },

  // Europe
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Airport Schiphol', country: 'Netherlands' },

  // Asia
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'Japan' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },

  // Middle East
  { code: 'BEY', city: 'Beirut', name: 'Beirut-Rafic Hariri International Airport', country: 'Lebanon' },
  { code: 'AMM', city: 'Amman', name: 'Queen Alia International Airport', country: 'Jordan' },
];

// Country to airport codes mapping
const COUNTRY_AIRPORT_MAP = {
  'UAE': ['DXB', 'AUH', 'SHJ'],
  'Saudi Arabia': ['JED', 'RUH', 'MED', 'DMM'],
  'Oman': ['MCT', 'SLL'],
  'Bahrain': ['BAH'],
  'Qatar': ['DOH'],
  'Kuwait': ['KWI'],
  'Turkey': ['IST', 'SAW'],
  'UK': ['LHR', 'LGW', 'MAN'],
  'USA': ['JFK', 'LAX'],
  'France': ['CDG'],
  'Germany': ['FRA'],
  'Netherlands': ['AMS'],
  'Singapore': ['SIN'],
  'Malaysia': ['KUL'],
  'Thailand': ['BKK'],
  'Japan': ['NRT'],
  'South Korea': ['ICN'],
  'Hong Kong': ['HKG'],
  'Lebanon': ['BEY'],
  'Jordan': ['AMM'],
  'Pakistan': ['ISB', 'LHE', 'KHI', 'PEW', 'MUX', 'SKT', 'UET', 'LYP', 'GWD', 'KDU', 'GIL', 'CJL', 'DSK', 'RYK', 'TUK', 'PAJ', 'DBA', 'SGI', 'MWD', 'ZIA'],
};

// ============================================
// FLIGHT CATEGORIES (TICKET TYPES)
// ✨ UPDATED: Removed Umrah, added Qatar
// ============================================
const FLIGHT_CATEGORIES = [
  {
    id: 1,
    title: 'Dubai Tickets',
    description: 'Daily direct flights to Dubai, Abu Dhabi & Sharjah.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    color: '#8b5cf6',
    filterType: 'country',
    filterValue: 'UAE',
  },
  {
    id: 2,
    title: 'Oman Tickets',
    description: 'Direct flights to Muscat & Salalah from major Pakistani cities.',
    image: omanImage,
    color: '#d4af37',
    filterType: 'country',
    filterValue: 'Oman',
  },
  {
    id: 3,
    title: 'Bahrain Tickets',
    description: 'Convenient flights to Manama, the pearl of the Gulf.',
    image: bahrainImage,
    color: '#e74c3c',
    filterType: 'country',
    filterValue: 'Bahrain',
  },
  {
    id: 4,
    title: 'Qatar Tickets',
    description: 'Direct flights to Doha, the jewel of the Arabian Gulf.',
    image: qatarImage,
    color: '#8a1538',
    filterType: 'country',
    filterValue: 'Qatar',
  },
  {
    id: 5,
    title: 'Saudi Arabia Tickets',
    description: 'Flights to Riyadh, Jeddah, Dammam & Madinah.',
    image: saudiphoto,
    color: '#2ecc71',
    filterType: 'country',
    filterValue: 'Saudi Arabia',
  },
  {
    id: 6,
    title: 'USA & Europe Tickets',
    description: 'Long-haul flights to London, New York, Paris & more.',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    color: '#3498db',
    filterType: 'country',
    filterValue: 'global',
  },
];

// Airport Select Component
function AirportSelect({ id, label, placeholder, value, onChange, airports = [], className = '' }) {
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
      airport.code?.toLowerCase().includes(search) ||
      airport.city?.toLowerCase().includes(search) ||
      airport.name?.toLowerCase().includes(search) ||
      airport.country?.toLowerCase().includes(search)
    );
  });

  const handleSelect = (airport) => {
    onChange(airport.code);
    setSearchTerm('');
    setIsOpen(false);
  };

  const displayValue = value || searchTerm;

  return (
    <div className="airport-select-wrapper" ref={wrapperRef}>
      <div className="airport-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <input
          id={id}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
        <ChevronDown className={`airport-select-arrow ${isOpen ? 'open' : ''}`} size={16} />
      </div>
      {isOpen && (
        <div className="airport-select-dropdown">
          {filteredAirports.length === 0 ? (
            <div className="airport-select-item no-results">
              {searchTerm ? 'No airports found' : 'Start typing to search...'}
            </div>
          ) : (
            filteredAirports.map((airport) => (
              <button
                key={airport.code}
                type="button"
                className="airport-select-item"
                onClick={() => handleSelect(airport)}
              >
                <span className="airport-code">{airport.code}</span>
                <span className="airport-name">
                  {airport.city}, {airport.country || 'Pakistan'}
                  <span className="airport-full-name"> · {airport.name}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Umrah packages state - only 3 featured packages
  const [umrahPackages, setUmrahPackages] = useState([]);
  const [umrahLoading, setUmrahLoading] = useState(false);
  const [umrahError, setUmrahError] = useState(null);
  
  const [tripType, setTripType] = useState('round_trip');
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
  });

  // Business Contact Info
  const BUSINESS_INFO = {
    phone: '+92 348 7839237',
    email: 'mrohantraveltour@gmail.com',
    address: 'Old Rasul Road, Usmania Mohallah Usmani Mohalla, Mandi Bahauddin, Pakistan',
    facebook: 'https://www.facebook.com/share/1GccNRa3SP/',
    tiktok: 'https://www.tiktok.com/@m_rohan_travels_tours?_r=1&_t=ZN-98xOcwAp770',
    whatsapp: 'https://wa.me/qr/Y5PW7NQXWGTLP1',
  };

  // Array of Umrah images to cycle through
  const umrahImages = [umrahImage1, umrahImage2, umrahImage3];

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getAirlineColor = (airline) => {
    const colors = {
      'Pak Qatar': '#8B0000',
      'Emirates': '#D71921',
      'Singapore Airlines': '#1A2B5C',
      'Qatar Airways': '#8A1538',
      'British Airways': '#2C5F7E',
      'Air France': '#002157',
      'Lufthansa': '#002855',
      'Turkish Airlines': '#E30A17',
      'Etihad': '#5C1A2D',
      'American Airlines': '#0078D2',
      'Delta': '#003366',
      'United': '#002244',
      'Air Sial': '#1a3a6a',
      'Salam Air': '#d4af37',
      'Fly Dubai': '#d71921',
    };
    return colors[airline] || '#667eea';
  };

  const fetchRandomFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: 1, limit: 100 };
      const response = await flightService.search(params);

      let flights = [];
      if (response.data && Array.isArray(response.data)) {
        flights = response.data;
      } else if (response.data && response.data.data) {
        flights = response.data.data;
      }

      if (flights.length === 0) {
        setFeaturedFlights([]);
        setLoading(false);
        return;
      }

      const shuffledFlights = shuffleArray(flights);
      const selectedFlights = shuffledFlights.slice(0, Math.min(6, shuffledFlights.length));

      const featured = selectedFlights.map(flight => ({
        id: flight._id,
        airline: flight.airline || 'Unknown Airline',
        flightNumber: flight.flightNumber || 'N/A',
        aircraft: flight.aircraft || 'Unknown',
        origin: flight.origin?.city || 'Unknown',
        originCode: flight.origin?.airportCode || 'N/A',
        destination: flight.destination?.city || 'Unknown',
        destinationCode: flight.destination?.airportCode || 'N/A',
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        status: flight.status || 'scheduled',
        cabins: flight.cabins || [],
        color: getAirlineColor(flight.airline),
        baggageAllowance: flight.baggageAllowance,
        tripType: flight.tripType || 'one_way',
        travelTypes: flight.travelTypes || [],
        price: flight.cabins?.economy?.price || 'Contact',
      }));

      setFeaturedFlights(featured);
    } catch (err) {
      console.error('Error fetching flights for homepage:', err);
      setError('Failed to load featured flights. Please try again later.');
      setFeaturedFlights(getFallbackFlights());
    } finally {
      setLoading(false);
    }
  };

  // Fetch ONLY 3 featured Umrah packages
  const fetchUmrahPackages = async () => {
    setUmrahLoading(true);
    setUmrahError(null);
    try {
      const response = await umrahService.getPackages({ 
        isFeatured: true,
        limit: 3,  // Only fetch 3
        isActive: true
      });
      // Get only the first 3 (or all if less than 3)
      const packages = response.data || [];
      setUmrahPackages(packages.slice(0, 3));
    } catch (err) {
      console.error('Error fetching Umrah packages:', err);
      setUmrahError('Failed to load Umrah packages');
      setUmrahPackages([]);
    } finally {
      setUmrahLoading(false);
    }
  };

  const getFallbackFlights = () => [
    {
      id: '1',
      airline: 'Pak Qatar',
      flightNumber: 'PK232',
      aircraft: 'Boeing 737',
      origin: 'Islamabad',
      originCode: 'ISB',
      destination: 'Muscat',
      destinationCode: 'MCT',
      color: '#8B0000',
      status: 'scheduled',
      tripType: 'one_way',
      price: 30000,
    },
    {
      id: '2',
      airline: 'Emirates',
      flightNumber: 'EK508',
      aircraft: 'Airbus A380',
      origin: 'Dubai',
      originCode: 'DXB',
      destination: 'London',
      destinationCode: 'LHR',
      color: '#D71921',
      status: 'boarding',
      tripType: 'round_trip',
      price: 85000,
    },
    {
      id: '3',
      airline: 'Qatar Airways',
      flightNumber: 'QR601',
      aircraft: 'Boeing 787',
      origin: 'Doha',
      originCode: 'DOH',
      destination: 'Singapore',
      destinationCode: 'SIN',
      color: '#8A1538',
      status: 'departed',
      tripType: 'one_way',
      price: 120000,
    },
    {
      id: '4',
      airline: 'Air Sial',
      flightNumber: 'PF734',
      aircraft: 'Airbus A320',
      origin: 'Sialkot',
      originCode: 'SKT',
      destination: 'Muscat',
      destinationCode: 'MCT',
      color: '#1a3a6a',
      status: 'scheduled',
      tripType: 'one_way',
      price: 71000,
    },
    {
      id: '5',
      airline: 'Salam Air',
      flightNumber: 'OV522',
      aircraft: 'Airbus A320neo',
      origin: 'Lahore',
      originCode: 'LHE',
      destination: 'Muscat',
      destinationCode: 'MCT',
      color: '#d4af37',
      status: 'scheduled',
      tripType: 'one_way',
      price: 66000,
    },
    {
      id: '6',
      airline: 'Fly Dubai',
      flightNumber: 'FZ334',
      aircraft: 'Boeing 737-800',
      origin: 'Karachi',
      originCode: 'KHI',
      destination: 'Dubai',
      destinationCode: 'DXB',
      color: '#d71921',
      status: 'scheduled',
      tripType: 'one_way',
      price: 55000,
    },
  ];

  useEffect(() => {
    fetchRandomFlights();
    fetchUmrahPackages();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.origin) params.append('origin', searchParams.origin.toUpperCase());
    if (searchParams.destination) params.append('destination', searchParams.destination.toUpperCase());
    if (searchParams.departureDate) params.append('departureDate', searchParams.departureDate);
    if (searchParams.returnDate) params.append('returnDate', searchParams.returnDate);
    params.append('tripType', tripType);
    params.append('passengers', searchParams.passengers);
    navigate(`/flights?${params.toString()}`);
  };

  const handleCategoryClick = (category) => {
    const params = new URLSearchParams();

    if (category.filterType === 'travelType') {
      if (category.filterValue) params.append('travelType', category.filterValue);
    } else if (category.filterType === 'country') {
      if (category.filterValue === 'global') {
        params.append('flightType', 'international');
      } else {
        params.append('country', category.filterValue);
      }
    }

    navigate(`/flights?${params.toString()}`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'scheduled': { label: 'Scheduled', color: '#3b82f6' },
      'boarding': { label: 'Boarding', color: '#f59e0b' },
      'departed': { label: 'Departed', color: '#10b981' },
      'delayed': { label: 'Delayed', color: '#ef4444' },
      'cancelled': { label: 'Cancelled', color: '#6b7280' },
    };
    return statusMap[status] || statusMap.scheduled;
  };

  const getTripTypeDisplay = (tripType) => {
    const map = {
      'one_way': 'One Way',
      'round_trip': 'Round Trip',
      'multi_city': 'Multi-City',
    };
    return map[tripType] || 'One Way';
  };

  const doubledFlights = featuredFlights.length > 0 ? [...featuredFlights, ...featuredFlights] : [];

  // All airports for dropdowns
  const allAirports = [...DOMESTIC_AIRPORTS, ...INTERNATIONAL_AIRPORTS];

  return (
    <div className="home">
      {/* ============================================================
          HERO SECTION - With Video Background
          ============================================================ */}
      <section className="hero-section">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-gradient"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles className="sparkle" />
            <span>Pakistan's Premier Travel Portal</span>
          </div>

          <h1 className="hero-title">
            Explore the World with{' '}
            <span className="highlight">Rohan Travels</span>
          </h1>

          <p className="hero-subtitle">
            Your trusted partner for seamless flight bookings, exclusive deals,
            and unforgettable travel experiences across the globe.
          </p>

          <div className="hero-divider">
            <span className="hero-divider-line"></span>
            <span className="hero-divider-dot"></span>
            <span className="hero-divider-text">Make your journey special with us</span>
            <span className="hero-divider-dot"></span>
            <span className="hero-divider-line"></span>
          </div>

          <div className="hero-search-wrapper">
            <div className="hero-search-glow"></div>
            <div className="hero-search-form">
              {/* Search Tabs - Trip Type */}
              <div className="search-tabs">
                <button
                  className={`search-tab ${tripType === 'round_trip' ? 'active' : ''}`}
                  onClick={() => setTripType('round_trip')}
                >
                  Round Trip
                </button>
                <button
                  className={`search-tab ${tripType === 'one_way' ? 'active' : ''}`}
                  onClick={() => setTripType('one_way')}
                >
                  One Way
                </button>
                <button
                  className={`search-tab ${tripType === 'multi_city' ? 'active' : ''}`}
                  onClick={() => setTripType('multi_city')}
                >
                  Multi-City
                </button>
              </div>

              <form onSubmit={handleSearchSubmit}>
                <div className="search-grid">
                  {/* Origin & Destination */}
                  <div className="search-field-group">
                    <label className="label">From (Origin)</label>
                    <div className="origin-destination-row">
                      <div className="field-wrapper">
                        <Plane className="icon" />
                        <AirportSelect
                          id="origin"
                          placeholder="Search departure airport..."
                          value={searchParams.origin}
                          onChange={(value) => setSearchParams({ ...searchParams, origin: value })}
                          airports={allAirports}
                        />
                      </div>
                      <button
                        type="button"
                        className="swap-btn"
                        onClick={() => {
                          setSearchParams({
                            ...searchParams,
                            origin: searchParams.destination,
                            destination: searchParams.origin,
                          });
                        }}
                        aria-label="Swap cities"
                      >
                        <ArrowRight />
                      </button>
                      <div className="field-wrapper">
                        <MapPin className="icon" />
                        <AirportSelect
                          id="destination"
                          placeholder="Search arrival airport..."
                          value={searchParams.destination}
                          onChange={(value) => setSearchParams({ ...searchParams, destination: value })}
                          airports={allAirports}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="search-field-group">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Departure</label>
                        <div className="date-input-wrapper">
                          <Calendar className="icon" />
                          <input
                            type="date"
                            className="search-date-input"
                            min={new Date().toISOString().split('T')[0]}
                            value={searchParams.departureDate}
                            onChange={(e) => setSearchParams({ ...searchParams, departureDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label">Return</label>
                        <div className="date-input-wrapper">
                          <Calendar className="icon" />
                          <input
                            type="date"
                            className="search-date-input"
                            min={new Date().toISOString().split('T')[0]}
                            value={searchParams.returnDate}
                            onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                            disabled={tripType === 'one_way' || tripType === 'multi_city'}
                            style={tripType === 'one_way' || tripType === 'multi_city' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="search-field-group" style={{ justifyContent: 'flex-end' }}>
                    <button type="submit" className="search-submit-btn">
                      <Search size={18} />
                      Explore Flights
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </form>

              {/* Popular Routes */}
              <div className="popular-routes">
                <span className="popular-routes-label">Popular:</span>
                <button
                  type="button"
                  className="popular-route-btn"
                  onClick={() => setSearchParams({ ...searchParams, origin: 'LHE', destination: 'JED' })}
                >
                  LHE ✈️ JED
                </button>
                <button
                  type="button"
                  className="popular-route-btn"
                  onClick={() => setSearchParams({ ...searchParams, origin: 'KHI', destination: 'DXB' })}
                >
                  KHI ✈️ DXB
                </button>
                <button
                  type="button"
                  className="popular-route-btn"
                  onClick={() => setSearchParams({ ...searchParams, origin: 'ISB', destination: 'RUH' })}
                >
                  ISB ✈️ RUH
                </button>
                <button
                  type="button"
                  className="popular-route-btn"
                  onClick={() => setSearchParams({ ...searchParams, origin: 'PEW', destination: 'SHJ' })}
                >
                  PEW ✈️ SHJ
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED UMRAH PACKAGES SECTION - WITH BACKGROUND IMAGE
          ============================================================ */}
      <section className="section umrah-home-section" style={{
        backgroundImage: `url(${umrahBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
      }}>
        {/* Dark overlay for readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(3, 13, 34, 0.75)',
          zIndex: 0,
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header">
            <span className="eyebrow" style={{ color: '#ffa10b' }}>🕋 Spiritual Journeys</span>
            <h2 style={{ color: '#ffffff' }}>Featured Umrah Packages</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)' }}>Complete packages with flights, hotels, and transport for your spiritual journey.</p>
          </div>

          {umrahLoading ? (
            <div className="umrah-home-loading" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
              <div className="spinner" aria-hidden="true"></div>
              <p style={{ color: '#ffffff' }}>Loading packages...</p>
            </div>
          ) : umrahError ? (
            <div className="umrah-home-error" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
              <p style={{ color: '#ffffff' }}>{umrahError}</p>
              <button className="btn btn--ghost" onClick={fetchUmrahPackages} style={{ color: '#ffa10b', borderColor: '#ffa10b' }}>Retry</button>
            </div>
          ) : umrahPackages.length === 0 ? (
            <div className="umrah-home-empty" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
              <p className="faint" style={{ color: 'rgba(255,255,255,0.7)' }}>No featured Umrah packages available at the moment.</p>
              <Link to="/umrah" className="btn btn--ghost" style={{ color: '#ffa10b', borderColor: '#ffa10b' }}>Browse all packages</Link>
            </div>
          ) : (
            <div className="umrah-home-grid">
              {umrahPackages.map((pkg, index) => {
                // Get the lowest price from all room types
                const prices = [
                  pkg.sharingPrices?.single,
                  pkg.sharingPrices?.double,
                  pkg.sharingPrices?.triple,
                  pkg.sharingPrices?.quad,
                  pkg.sharingPrices?.sharing,
                  pkg.perPersonPrice,
                ].filter(p => p && p > 0);
                const price = prices.length ? Math.min(...prices) : pkg.perPersonPrice || 0;
                
                // Cycle through images
                const imageIndex = index % 3;
                const packageImage = umrahImages[imageIndex];
                
                return (
                  <Link 
                    key={pkg._id} 
                    to={`/umrah/packages/${pkg._id}/book`} 
                    className="umrah-home-card"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div className="umrah-home-card-image">
                      <img
                        src={packageImage}
                        alt={pkg.packageName}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1580589351520-187b703aa0e7?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <span className="umrah-home-card-badge" style={{ background: 'linear-gradient(135deg, #ffa10b 0%, #e08e09 100%)' }}>Featured</span>
                    </div>
                    <div className="umrah-home-card-body" style={{ color: '#ffffff' }}>
                      <h3 style={{ color: '#ffffff' }}>{pkg.packageName}</h3>
                      <div className="umrah-home-card-meta" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        <span>{pkg.airline}</span>
                        <span>{pkg.flightNumber}</span>
                      </div>
                      <div className="umrah-home-card-route" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        <span>{pkg.origin?.airportCode || 'N/A'}</span>
                        <span className="arrow" style={{ color: '#ffa10b' }}>→</span>
                        <span>{pkg.destination?.airportCode || 'N/A'}</span>
                      </div>
                      <div className="umrah-home-card-hotels" style={{ borderTopColor: 'rgba(255,255,255,0.1)', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="hotel-item">
                          <span className="hotel-city" style={{ color: 'rgba(255,255,255,0.5)' }}>🕋 Makkah</span>
                          <span className="hotel-name" style={{ color: '#ffffff' }}>{pkg.makkahHotel?.name?.substring(0, 20) || 'N/A'}</span>
                          <span className="hotel-nights" style={{ color: '#ffa10b' }}>{pkg.makkahHotel?.nights || 0} nights</span>
                        </div>
                        {pkg.makkahReturnHotel?.name && (
                          <div className="hotel-item">
                            <span className="hotel-city" style={{ color: 'rgba(255,255,255,0.5)' }}>🕋 Makkah (Return)</span>
                            <span className="hotel-name" style={{ color: '#ffffff' }}>{pkg.makkahReturnHotel.name?.substring(0, 20) || 'N/A'}</span>
                            <span className="hotel-nights" style={{ color: '#ffa10b' }}>{pkg.makkahReturnHotel.nights || 0} nights</span>
                          </div>
                        )}
                        <div className="hotel-item">
                          <span className="hotel-city" style={{ color: 'rgba(255,255,255,0.5)' }}>🕌 Madinah</span>
                          <span className="hotel-name" style={{ color: '#ffffff' }}>{pkg.madinahHotel?.name?.substring(0, 20) || 'N/A'}</span>
                          <span className="hotel-nights" style={{ color: '#ffa10b' }}>{pkg.madinahHotel?.nights || 0} nights</span>
                        </div>
                      </div>
                      <div className="umrah-home-card-footer">
                        <div className="price">
                          <span className="from" style={{ color: 'rgba(255,255,255,0.5)' }}>From</span>
                          <span className="amount" style={{ color: '#ffa10b' }}>PKR {price.toLocaleString()}</span>
                          <span className="per" style={{ color: 'rgba(255,255,255,0.4)' }}>/ person</span>
                        </div>
                        <span className="view-btn" style={{ background: 'rgba(255,161,11,0.15)', color: '#ffa10b' }}>View Details →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="umrah-home-view-all">
            <Link to="/umrah" className="btn btn--gold" style={{
              background: 'linear-gradient(135deg, #ffa10b 0%, #e08e09 100%)',
              color: '#0f172a',
              boxShadow: '0 4px 20px rgba(255,161,11,0.3)',
            }}>
              View All Umrah Packages
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          FLIGHT CATEGORIES SECTION - UPDATED (Umrah removed, Qatar added)
          ============================================================ */}
      <section className="section categories-section">
        <div className="categories-bg"></div>
        <div className="categories-overlay"></div>
        <div className="section-header" style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow">Flight Categories</span>
          <h2>Book by Destination</h2>
          <p>Find flights to your favorite destinations. Click on any category to see available flights.</p>
        </div>

        <div className="categories-grid" style={{ position: 'relative', zIndex: 2 }}>
          {FLIGHT_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className={`category-card ${category.id === 1 ? 'featured' : ''}`}
              onClick={() => handleCategoryClick(category)}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-card-image">
                <img
                  src={category.image}
                  alt={category.title}
                  className="category-card-bg-image"
                />
              </div>
              <div className="category-card-body">
                <h3>{category.title}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-card-footer">
                  <span className="category-cta">
                    View Flights <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          FEATURES SECTION
          ============================================================ */}
      <section className="section features-section">
        <div className="section-header">
          <span className="eyebrow">Platform Capabilities</span>
          <h2>Everything to Run Your Agency</h2>
          <p>Simplify your booking operations, manage cash flow, and track visa files inside a single workspace.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-number">1</span>
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
            </div>
            <h3>Agency Wallet</h3>
            <p>Instant top-ups and balance distribution across your agent network.</p>
          </div>

          <div className="feature-card">
            <span className="feature-number">2</span>
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>
            </div>
            <h3>Global Inventory</h3>
            <p>Real-time rates on flights, hotels, and transport with zero markup.</p>
          </div>

          <div className="feature-card">
            <span className="feature-number">3</span>
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
            </div>
            <h3>Visa Tracking</h3>
            <p>Submit visa requests online and monitor case status live.</p>
          </div>

          <div className="feature-card">
            <span className="feature-number">4</span>
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <h3>Sub-Agent Control</h3>
            <p>Manage branch accounts, staff permissions, and commission splits.</p>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED FLIGHTS / DEALS SECTION
          ============================================================ */}
      <section className="section deals-section-wrapper">
        <div className="section-header">
          <span className="eyebrow">✈️ Featured Flights</span>
          <h2>Check Our Deals</h2>
          <p>Fresh travel offers, packages, and limited-time promotions from Rohan Travels.</p>
        </div>

        {loading ? (
          <div className="deals-loading">
            <Loader size={48} className="spinner" />
            <p>Loading featured flights...</p>
          </div>
        ) : error ? (
          <div className="deals-error">
            <p>{error}</p>
            <button onClick={fetchRandomFlights} className="btn-gold">Retry</button>
          </div>
        ) : featuredFlights.length === 0 ? (
          <div className="deals-empty">
            <Plane size={48} />
            <h3>No Flights Available</h3>
            <p>We're currently updating our flight inventory.</p>
            <Link to="/flights" className="btn-gold">Browse All Flights</Link>
          </div>
        ) : (
          <div className="deals-section">
            <div className="marquee-container">
              <div className="marquee-track">
                {doubledFlights.map((flight, index) => {
                  const statusInfo = getStatusBadge(flight.status);
                  return (
                    <div key={`${flight.id}-${index}`} className="deal-card">
                      <div className="deal-card-image" style={{ background: flight.color || '#667eea' }}>
                        <div style={{
                          padding: '16px 20px',
                          color: 'white',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative',
                          zIndex: 1
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Plane size={18} color="white" />
                              <span style={{ fontWeight: 700, fontSize: '13px' }}>{flight.airline}</span>
                            </div>
                            <span style={{
                              padding: '2px 12px',
                              borderRadius: '9999px',
                              background: statusInfo.color,
                              color: 'white',
                              fontSize: '9px',
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div style={{ textAlign: 'center', padding: '4px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                              <div>
                                <div style={{ fontSize: '22px', fontWeight: 800 }}>{flight.originCode}</div>
                                <div style={{ fontSize: '11px', opacity: 0.85 }}>{flight.origin}</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', fontWeight: 600, opacity: 0.8 }}>{getTripTypeDisplay(flight.tripType)}</div>
                                <Clock size={14} style={{ margin: '2px auto', opacity: 0.7 }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '22px', fontWeight: 800 }}>{flight.destinationCode}</div>
                                <div style={{ fontSize: '11px', opacity: 0.85 }}>{flight.destination}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="deal-card-body">
                        <div className="airline-row">
                          <span className="airline-name">{flight.airline}</span>
                        </div>
                        <div className="flight-info">{flight.flightNumber} · {flight.aircraft || 'Unknown'}</div>
                      </div>

                      <div className="deal-card-footer">
                        <div>
                          <div className="price-label">Starting from</div>
                          <div className="price">{typeof flight.price === 'number' ? `PKR ${flight.price.toLocaleString()}` : flight.price}</div>
                        </div>
                        <Link to={isAuthenticated ? `/flights/${flight.id}/book` : `/flights/${flight.id}`} className="view-link">
                          {isAuthenticated ? 'Book Now' : 'View'}
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link to="/flights" className="btn-gold" style={{ display: 'inline-flex' }}>
                View All Flights <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================
          CONTACT / LOCATION SECTION
          ============================================================ */}
      <section className="contact-location-section">
        <div className="contact-location-inner">
          <div className="contact-info-column">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
              <span className="eyebrow">Get in Touch</span>
              <h2>Visit Our Office</h2>
              <p>We're here to help you with all your travel needs.</p>
            </div>

            <div className="contact-details">
              <div className="contact-detail-item">
                <div className="contact-detail-icon"><MapPin size={20} /></div>
                <div>
                  <h4>Address</h4>
                  <p>{BUSINESS_INFO.address}</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon"><Phone size={20} /></div>
                <div>
                  <h4>Phone</h4>
                  <p><a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, '')}`}>{BUSINESS_INFO.phone}</a></p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon"><Mail size={20} /></div>
                <div>
                  <h4>Email</h4>
                  <p><a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a></p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-detail-icon"><Clock size={20} /></div>
                <div>
                  <h4>Business Hours</h4>
                  <p>Mon - Sat: 9:00 AM - 9:00 PM</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>Sunday: Closed</p>
                </div>
              </div>
            </div>

            <div className="social-links">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href={BUSINESS_INFO.facebook} target="_blank" rel="noopener noreferrer" className="social-icon facebook" aria-label="Facebook">
                  <FaFacebook size={24} />
                </a>
                <a href={BUSINESS_INFO.tiktok} target="_blank" rel="noopener noreferrer" className="social-icon tiktok" aria-label="TikTok">
                  <FaTiktok size={24} />
                </a>
                <a href={BUSINESS_INFO.whatsapp} target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" aria-label="WhatsApp">
                  <FaWhatsapp size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="map-column">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3055.278336623904!2d73.4961549!3d32.5880143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f7d1fff85b91b%3A0x3c5580dd33145c7e!2sM%20ROHAN%20TRAVEL%20%26%20TOURS!5e1!3m2!1sen!2s!4v1787200004245!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="M ROHAN TRAVEL & TOURS Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
          ============================================================ */}
      <section className="cta-section">
        <div className="cta-bg"></div>
        <div className="cta-content">
          <div className="cta-text">
            <div className="badge">
              <Sparkles size={14} />
              <span>Join Our Network</span>
            </div>
            <h2>
              Partner With Us.<br />
              Grow Your <span className="highlight">Travel Business.</span>
            </h2>
            <p>
              Get access to exclusive B2B fares, real-time availability, visa solutions,
              and dedicated support — all in one powerful portal.
            </p>
          </div>
          <div className="cta-actions">
            {isAuthenticated ? (
              <Link to="/flights" className="btn-gold-lg">
                Search Flights <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-gold-lg">
                  Join Portal <ArrowRight size={18} />
                </Link>
                <Link to="/flights" className="btn-outline-white">
                  Browse Flights
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}