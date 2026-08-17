import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="wrap center" style={{ padding: 'var(--s-8) 0' }}>
      <p className="eyebrow">Gate not found</p>
      <h1 style={{ margin: 'var(--s-3) 0' }}>This page does not exist</h1>
      <p className="muted">The link may be out of date, or the page may have moved.</p>
      <Link className="btn btn--primary" to="/">
        Back to departures
      </Link>
    </div>
  );
}
