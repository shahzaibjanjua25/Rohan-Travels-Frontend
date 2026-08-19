// frontend/src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { flightService } from '../services/flights';
import bahrainImage from '../assests/bahrain.jpg';
import omanImage from '../assests/oman.jpg';
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
} from 'lucide-react';
import './Home.css';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tour packages data with destination airport codes (3-letter IATA codes)
  // Tour packages data with destination airport codes (3-letter IATA codes)
  const tourPackages = [
    {
      id: 1,
      title: 'Dubai Tickets',
      description: 'Experience the ultimate luxury in Dubai with private tours, 5-star hotels, and exclusive access to top attractions.',
      duration: '5-7 Days',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      features: ['Burj Khalifa', 'Desert Safari', 'Private Yacht', 'Shopping Tours', 'Fine Dining'],
      icon: <Building size={32} />,
      color: '#8b5cf6',
      badge: '🌟 Top Rated',
      destinationAirport: 'DXB',
      destinationCity: 'Dubai',
      destinationCountry: 'UAE',
    },
    {
      id: 2,
      title: 'Turkey Cultural Tickets',
      description: 'Explore the rich history and culture of Turkey with guided tours to Istanbul, Cappadocia, and the Mediterranean coast.',
      duration: '8-12 Days',
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
      features: ['Guided Tours', 'Hot Air Balloon', 'Historical Sites', 'Turkish Cuisine', 'Shopping'],
      icon: <MapPin size={32} />,
      color: '#ef4444',
      badge: '🌍 Top Rated',
      destinationAirport: 'IST',
      destinationCity: 'Istanbul',
      destinationCountry: 'Turkey',
    },
    {
      id: 3,
      title: 'Saudi Arabia - Umrah',
      description: 'Spiritual journey to the holy cities of Makkah and Madinah with premium services and comfortable accommodations.',
      duration: '7-14 Days',
      image: 'https://zamzam.com/blog/wp-content/uploads/2021/05/history-of-Umrah.jpg',
      features: ['5-Star Hotels', '24/7 Support', 'Visa Assistance', 'Ziyarat Tours', 'Group Discounts'],
      icon: <Umbrella size={32} />,
      color: '#10b981',
      badge: '⭐ Best Seller',
      destinationAirport: 'JED',
      destinationCity: 'Jeddah',
      destinationCountry: 'Saudi Arabia',
    },
    {
      id: 4,
      title: 'Bahrain Getaway',
      description: 'Discover the charm of Bahrain with its rich culture, modern attractions, and beautiful waterfront experiences.',
      duration: '4-7 Days',
      image: bahrainImage, // ✅ Fixed Bahrain image
      features: ['Waterfront Views', 'Cultural Tours', 'Shopping', 'Fine Dining', 'Relaxation'],
      icon: <Compass size={32} />,
      color: '#f59e0b',
      badge: '✨ Hidden Gem',
      destinationAirport: 'BAH',
      destinationCity: 'Manama',
      destinationCountry: 'Bahrain',
    },
    {
      id: 5,
      title: 'Oman Adventure',
      description: 'Explore the stunning landscapes of Oman from the mountains to the coast with guided tours and cultural experiences.',
      duration: '6-10 Days',
      image: omanImage, // ✅ Fixed Oman image
      features: ['Mountain Tours', 'Coastal Adventures', 'Cultural Sites', 'Local Cuisine', 'Shopping'],
      icon: <Package size={32} />,
      color: '#6366f1',
      badge: '🏔️ Adventure',
      destinationAirport: 'MCT',
      destinationCity: 'Muscat',
      destinationCountry: 'Oman',
    },
    {
      id: 6,
      title: 'USA - New York',
      description: 'Experience the energy of New York City with guided tours, iconic landmarks, and world-class entertainment.',
      duration: '7-10 Days',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
      features: ['Statue of Liberty', 'Times Square', 'Broadway Shows', 'Museums', 'Shopping'],
      icon: <Globe size={32} />,
      color: '#3b82f6',
      badge: '🗽 Iconic',
      destinationAirport: 'JFK',
      destinationCity: 'New York',
      destinationCountry: 'USA',
    },
  ];
  // ✅ Handle tour package click - navigate to flights with destination airport code
  const handleTourPackageClick = (destinationAirport, destinationCity, destinationCountry) => {
    console.log(`📍 Navigating to flights for: ${destinationCity}, ${destinationCountry} (${destinationAirport})`);
    // Use the airport code for the API
    navigate(`/flights?destination=${destinationAirport}`);
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Helper function to get airline logo/color
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
    };
    return colors[airline] || '#667eea';
  };

  // Fetch random flights from API
  const fetchRandomFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: 1,
        limit: 100,
      };

      const response = await flightService.search(params);

      let flights = [];
      if (response.data && Array.isArray(response.data)) {
        flights = response.data;
      } else if (response.data && response.data.data) {
        flights = response.data.data;
      } else {
        flights = [];
      }

      if (flights.length === 0) {
        setFeaturedFlights([]);
        setLoading(false);
        return;
      }

      const shuffledFlights = shuffleArray(flights);
      const selectedFlights = shuffledFlights.slice(0, Math.min(3, shuffledFlights.length));

      const featured = selectedFlights.map(flight => ({
        id: flight._id,
        airline: flight.airline || 'Unknown Airline',
        flightNumber: flight.flightNumber || 'N/A',
        aircraft: flight.aircraft || 'Unknown',
        origin: flight.origin?.city || 'Unknown',
        originCode: flight.origin?.airportCode || flight.origin?.code || 'N/A',
        destination: flight.destination?.city || 'Unknown',
        destinationCode: flight.destination?.airportCode || flight.destination?.code || 'N/A',
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        status: flight.status || 'scheduled',
        cabins: flight.cabins || [],
        color: getAirlineColor(flight.airline),
        baggageAllowance: flight.baggageAllowance,
        tripType: flight.tripType || 'one_way',
        travelTypes: flight.travelTypes || [],
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

  const getFallbackFlights = () => {
    return [
      {
        id: '1',
        airline: 'Pak Qatar',
        flightNumber: 'PK232',
        aircraft: 'Boeing 737',
        origin: 'Karachi',
        originCode: 'KHI',
        destination: 'Dubai',
        destinationCode: 'DXB',
        color: '#8B0000',
        status: 'scheduled',
        tripType: 'one_way',
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
      },
    ];
  };

  useEffect(() => {
    fetchRandomFlights();
  }, []);

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

  // Helper to get trip type display
  const getTripTypeDisplay = (tripType) => {
    const map = {
      'one_way': 'One Way',
      'round_trip': 'Round Trip',
      'multi_city': 'Multi-City',
    };
    return map[tripType] || 'One Way';
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-background">
          <div className="home-hero-overlay"></div>
        </div>
        <div className="container">
          <div className="home-hero-content">
            <div className="home-hero-badge">
              <Sparkles size={16} />
              <span>✈️ Premium Travel Partner</span>
            </div>
            <h1 className="home-hero-title">
              Explore the World with
              <span className="gradient-text"> Rohan Travels</span>
            </h1>
            <p className="home-hero-subtitle">
              Your trusted partner for seamless flight bookings, exclusive deals,
              and unforgettable travel experiences across the globe.
            </p>
            <div className="home-hero-actions">
              {isAuthenticated ? (
                <Link to="/flights" className="btn btn--primary btn--lg">
                  <Search size={20} />
                  Search Flights
                  <ChevronRight size={20} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn--primary btn--lg">
                    Get Started
                    <ChevronRight size={20} />
                  </Link>
                  <Link to="/flights" className="btn btn--outline btn--lg">
                    Browse Flights
                  </Link>
                </>
              )}
            </div>
            <div className="home-hero-stats">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Airlines Partnered</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Happy Travelers</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Countries Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Packages Section */}
      <section className="home-tour-packages">
        <div className="container">
          <div className="section-header">
            <h2>Special Tour Packages</h2>
            <p>Explore our curated travel experiences for every destination</p>
          </div>
          <div className="tour-packages-grid">
            {tourPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="tour-package-card"
                onClick={() => handleTourPackageClick(pkg.destinationAirport, pkg.destinationCity, pkg.destinationCountry)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="tour-package-image"
                  style={{ backgroundImage: `url(${pkg.image})` }}
                >
                  <div className="tour-package-badge">{pkg.badge}</div>
                  <div className="tour-package-overlay">
                    <div className="tour-package-price">{pkg.price}</div>
                  </div>
                </div>
                <div className="tour-package-content">
                  <div className="tour-package-header">
                    <div className="tour-package-icon" style={{ backgroundColor: pkg.color }}>
                      {pkg.icon}
                    </div>
                    <h3>{pkg.title}</h3>
                  </div>
                  <p className="tour-package-description">{pkg.description}</p>
                  <div className="tour-package-features">
                    {pkg.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="tour-package-feature">
                        <CheckCircle size={14} />
                        {feature}
                      </span>
                    ))}
                    {pkg.features.length > 3 && (
                      <span className="tour-package-feature more">+{pkg.features.length - 3} more</span>
                    )}
                  </div>
                  <div className="tour-package-footer">
                    <div className="tour-package-duration">
                      <Clock size={16} />
                      <span>{pkg.duration}</span>
                    </div>
                    <button
                      className="tour-package-btn"
                      style={{ backgroundColor: pkg.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTourPackageClick(pkg.destinationAirport, pkg.destinationCity, pkg.destinationCountry);
                      }}
                    >
                      View Flights
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="tour-packages-cta">
            <Link to="/flights" className="btn btn--outline-primary">
              View All Flights
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Rohan Travels?</h2>
            <p>We make your travel experience seamless and enjoyable</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Plane size={32} />
              </div>
              <h3>Best Flight Deals</h3>
              <p>
                Get access to exclusive discounts and the best prices
                on flights from top airlines worldwide.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={32} />
              </div>
              <h3>24/7 Support</h3>
              <p>
                Our dedicated team is available around the clock to assist
                you with bookings and travel queries.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Secure Booking</h3>
              <p>
                Your payments and personal information are protected with
                enterprise-grade security.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Group Discounts</h3>
              <p>
                Special rates for group bookings, corporate travel,
                and family vacations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Flights Section */}
      <section className="home-featured-flights">
        <div className="container">
          <div className="section-header">
            <h2>✈️ Featured Flights</h2>
            <p>Discover amazing deals on these popular routes</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <Loader size={48} className="spinner" />
              <p>Loading featured flights...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={fetchRandomFlights} className="btn btn--primary">
                Retry
              </button>
            </div>
          ) : featuredFlights.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Plane size={48} />
              </div>
              <h3>No Flights Available</h3>
              <p>We're currently updating our flight inventory. Please check back later.</p>
              <Link to="/flights" className="btn btn--primary">
                Browse All Flights
              </Link>
            </div>
          ) : (
            <>
              <div className="featured-flights-grid">
                {featuredFlights.map((flight) => {
                  const statusInfo = getStatusBadge(flight.status);
                  const flightLink = isAuthenticated
                    ? `/flights/${flight.id}/book`
                    : `/flights/${flight.id}`;
                  const buttonText = isAuthenticated ? 'Book Now' : 'View Details';

                  return (
                    <div key={flight.id} className="featured-flight-card">
                      <div className="featured-flight-header" style={{ backgroundColor: flight.color }}>
                        <div className="featured-flight-airline">
                          <Plane size={20} color="white" />
                          <span>{flight.airline}</span>
                        </div>
                        <span className="featured-flight-status" style={{ backgroundColor: statusInfo.color }}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="featured-flight-body">
                        <div className="featured-flight-route">
                          <div className="featured-flight-origin">
                            <div className="featured-flight-code">{flight.originCode}</div>
                            <div className="featured-flight-city">{flight.origin}</div>
                          </div>
                          <div className="featured-flight-arrow">
                            <div className="flight-path">
                              <div className="flight-line"></div>
                              <div className="flight-plane-icon">
                                <Plane size={16} />
                              </div>
                            </div>
                            <div className="flight-duration">
                              <Clock size={12} />
                              <span>{getTripTypeDisplay(flight.tripType)}</span>
                            </div>
                          </div>
                          <div className="featured-flight-destination">
                            <div className="featured-flight-code">{flight.destinationCode}</div>
                            <div className="featured-flight-city">{flight.destination}</div>
                          </div>
                        </div>

                        <div className="featured-flight-details">
                          <div className="featured-flight-info">
                            <span className="featured-flight-label">Aircraft</span>
                            <span className="featured-flight-value">{flight.aircraft}</span>
                          </div>
                          <div className="featured-flight-info">
                            <span className="featured-flight-label">Trip Type</span>
                            <span className="featured-flight-value">{getTripTypeDisplay(flight.tripType)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="featured-flight-footer">
                        <div className="featured-flight-price">
                          <span className="price-label">Starting from</span>
                          <span className="price-value">{flight.price || 'Contact'}</span>
                        </div>
                        <Link
                          to={flightLink}
                          className="featured-flight-book"
                        >
                          <span className="book-text">{buttonText}</span>
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="featured-flights-cta">
                <Link to="/flights" className="btn btn--outline-primary">
                  View All Flights
                  <ChevronRight size={18} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="home-how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Book your dream trip in just 3 simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Search size={32} />
              </div>
              <h3>Search Flights</h3>
              <p>
                Enter your destination, dates, and preferences to find
                the perfect flight.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Calendar size={32} />
              </div>
              <h3>Select & Book</h3>
              <p>
                Choose from available flights and complete your booking
                with ease.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Plane size={32} />
              </div>
              <h3>Travel & Explore</h3>
              <p>
                Get your e-ticket, pack your bags, and embark on your
                journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="home-trust">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <Shield size={24} />
              <span>Secure Payments</span>
            </div>
            <div className="trust-item">
              <Award size={24} />
              <span>Trusted Service</span>
            </div>
            <div className="trust-item">
              <Globe size={24} />
              <span>Global Coverage</span>
            </div>
            <div className="trust-item">
              <Headphones size={24} />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}