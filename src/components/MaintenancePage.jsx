// src/components/MaintenancePage.jsx

export default function MaintenancePage({ message }) {
  return (
    <div className="maintenance-page">
      <div className="maintenance-container">
        <div className="maintenance-icon">🔧</div>
        <h1>We'll Be Back Soon</h1>
        <p>{message || 'We are currently undergoing scheduled maintenance. Please check back later.'}</p>
        <div className="maintenance-spinner">
          <div className="spinner"></div>
        </div>
        <p className="maintenance-update">Estimated downtime: 1-2 hours</p>
        <p className="maintenance-contact">
          For urgent inquiries, please contact us at{' '}
          <a href="mailto:mrohantraveltour@gmail.com">mrohantraveltour@gmail.com</a>
        </p>
      </div>
    </div>
  );
}