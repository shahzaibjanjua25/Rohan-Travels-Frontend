import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { flightService } from '../services/flights';
import { settingsService } from '../services/settings';
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
  Coffee,
  Heart,
  Building,
  MapPin,
  CheckCircle,
  Umbrella,
  Compass,
  Gift,
} from 'lucide-react';
import './Home.css';
import backgroundImage from '../assests/dubai bakcground.png';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Maintenance mode state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  // Tour packages data with Unsplash images and travel type mapping
  const tourPackages = [
    {
      id: 1,
      title: 'Umrah Packages',
      description: 'Spiritual journey to the holy cities of Makkah and Madinah with premium services and comfortable accommodations.',
      duration: '7-14 Days',
      image: 'https://zamzam.com/blog/wp-content/uploads/2021/05/history-of-Umrah.jpg',
      features: ['5-Star Hotels', '24/7 Support', 'Visa Assistance', 'Ziyarat Tours', 'Group Discounts'],
      icon: <Umbrella size={32} />,
      color: '#10b981',
      badge: '⭐ Best Seller',
      travelType: 'umrah'
    },
    {
      id: 2,
      title: 'Hajj Packages',
      description: 'Complete Hajj packages with expert guidance, comfortable accommodations, and full support throughout your pilgrimage.',
      duration: '15-21 Days',
      image: 'https://th.bing.com/th/id/R.7380d077e3e948a5c7ec3d8bafb1e2f1?rik=9HP1aSaPaRf%2fFA&pid=ImgRaw&r=0',
      features: ['VIP Services', 'Expert Guides', 'Medical Support', 'Group Iftar', 'Transportation'],
      icon: <Compass size={32} />,
      color: '#f59e0b',
      badge: '👑 Premium',
      travelType: 'hajj'
    },
    {
      id: 3,
      title: 'Family Visit Packages',
      description: 'Create unforgettable memories with your loved ones with our tailored family vacation packages to top destinations.',
      duration: '5-12 Days',
      image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80',
      features: ['Family Activities', 'Child Care', 'Special Meals', 'Photo Sessions', 'Flexible Plans'],
      icon: <Users size={32} />,
      color: '#6366f1',
      badge: '👨‍👩‍👧‍👦 Family Favorite',
      travelType: 'family'
    }
  ];

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

  // Handle tour package click - navigate to flights with travel type filter
  const handleTourPackageClick = (travelType) => {
    console.log(`📌 Navigating to flights with travelType: ${travelType}`);
    navigate(`/flights?travelType=${travelType}`);
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
        price: getPriceFromFlight(flight),
        color: getAirlineColor(flight.airline),
        baggageAllowance: flight.baggageAllowance
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

  const getPriceFromFlight = (flight) => {
    if (flight.cabins) {
      if (flight.cabins.economy && flight.cabins.economy.price) {
        return `PKR ${flight.cabins.economy.price}`;
      }
      if (Array.isArray(flight.cabins) && flight.cabins.length > 0) {
        const cheapest = Math.min(...flight.cabins.map(cabin => cabin.price || 0));
        if (cheapest > 0) {
          return `PKR ${cheapest}`;
        }
      }
      if (typeof flight.cabins === 'object') {
        const prices = Object.values(flight.cabins)
          .filter(cabin => cabin && cabin.price)
          .map(cabin => cabin.price);
        if (prices.length > 0) {
          const cheapest = Math.min(...prices);
          return `PKR ${cheapest}`;
        }
      }
    }
    return `PKR ${Math.floor(Math.random() * 30000) + 20000}`;
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
        price: 'PKR 25,000',
        color: '#8B0000',
        status: 'scheduled'
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
        price: 'PKR 65,000',
        color: '#D71921',
        status: 'boarding'
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
        price: 'PKR 45,000',
        color: '#8A1538',
        status: 'departed'
      },
    ];
  };

  // Check maintenance mode
  const checkMaintenance = async () => {
    try {
      const res = await settingsService.get();
      setMaintenanceMode(res.data.maintenanceMode || false);
      setMaintenanceMessage(res.data.maintenanceMessage || '');
    } catch (err) {
      console.error('Failed to check maintenance status:', err);
    }
  };

  useEffect(() => {
    fetchRandomFlights();
    checkMaintenance();
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

  // If maintenance mode is enabled, show maintenance page
  if (maintenanceMode) {
    return (
      <div className="maintenance-page">
        <div className="maintenance-container">
          <div className="maintenance-icon">🔧</div>
          <h1>We'll Be Back Soon</h1>
          <p>{maintenanceMessage || 'We are currently undergoing scheduled maintenance. Please check back later.'}</p>
          <div className="maintenance-spinner">
            <div className="spinner"></div>
          </div>
          <p className="maintenance-update">Estimated downtime: 1-2 hours</p>
          <p className="maintenance-contact">
            For urgent inquiries, please contact us at <a href="mailto:support@rohantravels.com">support@rohantravels.com</a>
          </p>
        </div>
      </div>
    );
  }

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
            <h2> Special Tour Packages</h2>
            <p>Explore our curated travel experiences for every journey</p>
          </div>
          <div className="tour-packages-grid">
            {tourPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="tour-package-card"
                onClick={() => handleTourPackageClick(pkg.travelType)}
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
                        handleTourPackageClick(pkg.travelType);
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
                              <span>{flight.flightNumber}</span>
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
                            <span className="featured-flight-label">Cabin Classes</span>
                            <span className="featured-flight-value">
                              {flight.cabins && typeof flight.cabins === 'object'
                                ? Object.keys(flight.cabins).filter(key => flight.cabins[key] && flight.cabins[key].availableSeats > 0).join(', ').toUpperCase()
                                : 'Economy'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="featured-flight-footer">
                        <div className="featured-flight-price">
                          <span className="price-label">Starting from</span>
                          <span className="price-value">{flight.price}</span>
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