/**
 * An empty screen is an invitation to act, so this always offers a next step
 * rather than just reporting that there is nothing here.
 */
export default function EmptyState({ title, description, action }) {
  return (
    <div className="card center" style={{ padding: 'var(--s-8) var(--s-5)' }}>
      <h3 style={{ marginBottom: 'var(--s-2)' }}>{title}</h3>
      {description && <p className="muted" style={{ maxWidth: '46ch', margin: '0 auto var(--s-5)' }}>{description}</p>}
      {action}
    </div>
  );
}
