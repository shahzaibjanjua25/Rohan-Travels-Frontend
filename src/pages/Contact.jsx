// frontend/src/pages/Contact.jsx
import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone, Clock, Globe, User, Building } from 'lucide-react';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { CONTACTS } from '../config/contacts';
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

      {/* Contact Persons Cards */}
      <div className="contact-grid">
        {/* Owner Card */}
        <div className="contact-card contact-card--owner">
          <div className="contact-card-icon" style={{ background: '#0a2463' }}>
            <User size={32} />
          </div>
          <h3>{CONTACTS.owner.name}</h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7a8f' }}>{CONTACTS.owner.role}</p>
          <p style={{ fontWeight: '600', fontSize: '1.1rem', margin: '4px 0' }}>{CONTACTS.owner.phone}</p>
          <a 
            href={`tel:${CONTACTS.owner.phone.replace(/\s/g, '')}`}
            className="contact-card-action"
            style={{ color: '#0a2463', fontWeight: '600' }}
          >
            Call Now →
          </a>
        </div>

        {/* Partner Card */}
        <div className="contact-card contact-card--partner">
          <div className="contact-card-icon" style={{ background: '#d4af37' }}>
            <Building size={32} />
          </div>
          <h3>{CONTACTS.partner.name}</h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7a8f' }}>{CONTACTS.partner.role}</p>
          <p style={{ fontWeight: '600', fontSize: '1.1rem', margin: '4px 0' }}>{CONTACTS.partner.phone}</p>
          <a 
            href={`tel:${CONTACTS.partner.phone.replace(/\s/g, '')}`}
            className="contact-card-action"
            style={{ color: '#d4af37', fontWeight: '600' }}
          >
            Call Now →
          </a>
        </div>

        {/* WhatsApp Card */}
        <a
          href={CONTACTS.social.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card contact-card--whatsapp"
        >
          <div className="contact-card-icon" style={{ background: '#25D366' }}>
            <FaWhatsapp size={32} />
          </div>
          <h3>WhatsApp</h3>
          <p>Chat with us instantly on WhatsApp</p>
          <span className="contact-card-action">Chat now →</span>
        </a>

        {/* Facebook Card */}
        <a
          href={CONTACTS.social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card contact-card--facebook"
        >
          <div className="contact-card-icon" style={{ background: '#1877F2' }}>
            <Facebook size={32} />
          </div>
          <h3>Facebook</h3>
          <p>Follow us for updates and offers</p>
          <span className="contact-card-action">Follow us →</span>
        </a>

        {/* TikTok Card */}
        <a
          href={CONTACTS.social.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card contact-card--tiktok"
        >
          <div className="contact-card-icon" style={{ background: '#000000' }}>
            <FaTiktok size={32} />
          </div>
          <h3>TikTok</h3>
          <p>Watch our travel content</p>
          <span className="contact-card-action">Follow us →</span>
        </a>

        {/* Email Card */}
        <a
          href={`mailto:${CONTACTS.email}`}
          className="contact-card contact-card--email"
        >
          <div className="contact-card-icon" style={{ background: '#6366f1' }}>
            <Mail size={32} />
          </div>
          <h3>Email</h3>
          <p>{CONTACTS.email}</p>
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