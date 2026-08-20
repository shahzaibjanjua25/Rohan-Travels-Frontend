// frontend/src/pages/About.jsx
import { Link } from 'react-router-dom';
import { 
  Plane, 
  Users, 
  Award, 
  Globe, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Shield,
  CheckCircle,
  Star,
  ArrowRight,
} from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Rohan Travels &amp; Tours</h1>
          <p>
            Your trusted partner for seamless flight bookings and unforgettable
            travel experiences across the globe.
          </p>
        </div>
      </section>

      {/* ============================================================
          OUR STORY
          ============================================================ */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-story-grid">
            <div className="about-story-text">
              <div className="about-eyebrow">Our Story</div>
              <h2>Making Travel Simple &amp; Accessible</h2>
              <p>
                Rohan Travels &amp; Tours was founded with a simple mission:
                to make travel booking easy, transparent, and affordable for everyone.
                With years of experience in the travel industry, we've built
                strong relationships with airlines and partners worldwide to
                bring you the best fares and services.
              </p>
              <p>
                Whether you're planning a spiritual journey for Umrah, a business trip,
                or a family vacation, we're here to help you every step of the way.
                Our team of dedicated travel experts works around the clock to
                ensure your journey is smooth and memorable.
              </p>
              <div className="about-stats">
                <div className="about-stat">
                  <span className="about-stat-number">10+</span>
                  <span className="about-stat-label">Years of Experience</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-number">5K+</span>
                  <span className="about-stat-label">Happy Travelers</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-number">50+</span>
                  <span className="about-stat-label">Destinations</span>
                </div>
              </div>
            </div>
            <div className="about-story-image">
              <img 
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80" 
                alt="Travel and adventure" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          WHY US
          ============================================================ */}
      <section className="about-section about-section--alt">
        <div className="about-container">
          <div className="about-header">
            <div className="about-eyebrow">Why Choose Us</div>
            <h2>Travel with Confidence</h2>
            <p>
              We combine technology with human expertise to deliver the best
              travel experience possible.
            </p>
          </div>

          <div className="about-features-grid">
            <div className="about-feature-card">
              <div className="about-feature-icon">💰</div>
              <h3>Best Price Guarantee</h3>
              <p>
                We constantly monitor fares to ensure you get the most competitive
                rates for your flights and packages.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">🕐</div>
              <h3>24/7 Support</h3>
              <p>
                Our dedicated team is available around the clock to assist you
                with any queries or changes to your travel plans.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">🔒</div>
              <h3>Secure Bookings</h3>
              <p>
                Your payments and personal information are protected with
                industry-standard security measures.
              </p>
            </div>

            <div className="about-feature-card">
              <div className="about-feature-icon">🌍</div>
              <h3>Global Network</h3>
              <p>
                Access to hundreds of airlines and thousands of routes worldwide
                through our extensive partner network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SERVICES
          ============================================================ */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-header">
            <div className="about-eyebrow">Our Services</div>
            <h2>What We Offer</h2>
            <p>
              From flight bookings to complete travel packages, we've got you covered.
            </p>
          </div>

          <div className="about-services-grid">
            <div className="about-service-card">
              <div className="about-service-icon">
                <Plane size={28} />
              </div>
              <h3>Flight Bookings</h3>
              <p>
                Domestic and international flights at the best available prices.
                One-way, round trip, and multi-city itineraries.
              </p>
            </div>

            <div className="about-service-card">
              <div className="about-service-icon">
                <Globe size={28} />
              </div>
              <h3>Umrah &amp; Hajj Packages</h3>
              <p>
                Complete spiritual journey packages with premium accommodations,
                transfers, and visa assistance.
              </p>
            </div>

            <div className="about-service-card">
              <div className="about-service-icon">
                <Users size={28} />
              </div>
              <h3>Group Travel</h3>
              <p>
                Special rates and customized itineraries for families, corporate
                groups, and tour operators.
              </p>
            </div>

            <div className="about-service-card">
              <div className="about-service-icon">
                <Shield size={28} />
              </div>
              <h3>Visa Assistance</h3>
              <p>
                Guidance and support for visa applications to help you travel
                without any documentation hassles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
          ============================================================ */}
      <section className="about-section about-section--dark">
        <div className="about-container">
          <div className="about-header">
            <div className="about-eyebrow">Testimonials</div>
            <h2>What Our Travelers Say</h2>
            <p>Real stories from real people who traveled with us.</p>
          </div>

          <div className="about-testimonials-grid">
            <div className="about-testimonial-card">
              <div className="about-testimonial-stars">
                {'⭐'.repeat(5)}
              </div>
              <p>
                "Rohan Travels made our Umrah journey truly memorable. From the
                flights to the hotel accommodations, everything was perfectly
                arranged. Highly recommended!"
              </p>
              <div className="about-testimonial-author">
                <strong>Muhammad Ahmad</strong>
                <span>Umrah Package, 2026</span>
              </div>
            </div>

            <div className="about-testimonial-card">
              <div className="about-testimonial-stars">
                {'⭐'.repeat(5)}
              </div>
              <p>
                "The best travel agency I've ever dealt with. They found me a
                flight at a much better price than I could find anywhere else.
                The team is professional and responsive."
              </p>
              <div className="about-testimonial-author">
                <strong>Fatima Hassan</strong>
                <span>Business Travel, 2026</span>
              </div>
            </div>

            <div className="about-testimonial-card">
              <div className="about-testimonial-stars">
                {'⭐'.repeat(5)}
              </div>
              <p>
                "I booked a family vacation through Rohan Travels and it was
                flawless. They handled everything from flights to hotel transfers.
                Will definitely use them again."
              </p>
              <div className="about-testimonial-author">
                <strong>Usman Khan</strong>
                <span>Family Trip, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
          ============================================================ */}
      <section className="about-cta">
        <div className="about-cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>
            Let us help you plan your next adventure. Whether it's a business trip,
            a family vacation, or a spiritual journey, we're here to make it happen.
          </p>
          <div className="about-cta-buttons">
            <Link to="/flights" className="btn btn--gold about-btn">
              Explore Flights <ArrowRight size={18} />
            </Link>
            <Link to="/contact" className="btn btn--outline about-btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}