export default function Spinner({ label = 'Loading' }) {
  return (
    <span className="row" style={{ gap: '0.5rem', color: 'var(--text-muted)' }}>
      <span className="spinner" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
