// frontend/src/pages/Contact.jsx
import { Link } from 'react-router-dom';
import { Facebook, MessageCircle, Mail, Phone, MapPin, Clock, Globe } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get in Touch</h1>
          <p>We're here to help you with your travel needs</p>
        </div>
      </div>

      <div className="contact-grid">
        {/* WhatsApp Card */}
        <a
          href="https://wa.me/qr/Y5PW7NQXWGTLP1"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card contact-card--whatsapp"
        >
          <div className="contact-card-icon">
            <MessageCircle size={32} />
          </div>
          <h3>WhatsApp</h3>
          <p>Chat with us instantly on WhatsApp</p>
          <span className="contact-card-action">Chat now →</span>
        </a>

        {/* Facebook Card */}
        <a
          href="https://www.facebook.com/share/1GccNRa3SP/"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card contact-card--facebook"
        >
          <div className="contact-card-icon">
            <Facebook size={32} />
          </div>
          <h3>Facebook</h3>
          <p>Follow us for updates and offers</p>
          <span className="contact-card-action">Follow us →</span>
        </a>

        {/* TikTok Card */}
        <a
          href="https://www.tiktok.com/@m_rohan_travels_tours?_r=1&_t=ZN-98xOcwAp770"
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card contact-card--tiktok"
        >
          <div className="contact-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5 2.592 2.592 0 0 1 0-5.18 2.57 2.57 0 0 1 1.64.59V9.73a5.69 5.69 0 0 0 5.11 5.07 5.69 5.69 0 0 0 0-11.38v.4z" />
            </svg>
          </div>
          <h3>TikTok</h3>
          <p>Watch our travel content</p>
          <span className="contact-card-action">Follow us →</span>
        </a>

        {/* Email Card */}
        <a
          href="mailto:support@rohantravels.com"
          className="contact-card contact-card--email"
        >
          <div className="contact-card-icon">
            <Mail size={32} />
          </div>
          <h3>Email</h3>
          <p>support@rohantravels.com</p>
          <span className="contact-card-action">Send email →</span>
        </a>
      </div>

      {/* Info Section */}
      <div className="contact-info">
        <div className="contact-info-item">
          <Clock size={24} />
          <div>
            <h4>Support Hours</h4>
            <p>24/7 Customer Support</p>
          </div>
        </div>
        <div className="contact-info-item">
          <Globe size={24} />
          <div>
            <h4>Available Worldwide</h4>
            <p>We serve travelers across the globe</p>
          </div>
        </div>
        <div className="contact-info-item">
          <Phone size={24} />
          <div>
            <h4>Quick Response</h4>
            <p>We typically respond within minutes</p>
          </div>
        </div>
      </div>

      {/* Back to Home */}
      <div className="contact-back">
        <Link to="/" className="btn btn--ghost">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}