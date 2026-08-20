// frontend/src/pages/About.jsx
import { Link } from 'react-router-dom';
import { CONTACTS } from '../config/contacts';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      {/* ... existing content ... */}

      {/* CTA Section */}
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
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#6b7a8f' }}>Business Owner</p>
              <a href={`tel:${CONTACTS.owner.phone.replace(/\s/g, '')}`} style={{ fontWeight: '600', color: '#0a2463', textDecoration: 'none' }}>
                {CONTACTS.owner.name}: {CONTACTS.owner.phone}
              </a>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#6b7a8f' }}>Business Partner</p>
              <a href={`tel:${CONTACTS.partner.phone.replace(/\s/g, '')}`} style={{ fontWeight: '600', color: '#0a2463', textDecoration: 'none' }}>
                {CONTACTS.partner.name}: {CONTACTS.partner.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}