// frontend/src/pages/Contact.jsx
import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone, Clock, Globe } from 'lucide-react';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
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
            <FaWhatsapp size={32} />
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
            <FaTiktok size={32} />
          </div>
          <h3>TikTok</h3>
          <p>Watch our travel content</p>
          <span className="contact-card-action">Follow us →</span>
        </a>

        {/* Email Card */}
        <a
          href="mailto:mrohantraveltour@gmail.com"
          className="contact-card contact-card--email"
        >
          <div className="contact-card-icon">
            <Mail size={32} />
          </div>
          <h3>Email</h3>
          <p>mrohantraveltour@gmail.com</p>
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