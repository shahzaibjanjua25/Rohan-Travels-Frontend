export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, hasPrevPage, hasNextPage, total } = pagination;

  return (
    <nav className="row row--between" aria-label="Pagination" style={{ marginTop: 'var(--s-5)' }}>
      <span className="muted" style={{ fontSize: 'var(--step--1)' }}>
        Page <span className="mono">{page}</span> of <span className="mono">{totalPages}</span>
        <span className="faint"> · {total} total</span>
      </span>
      <span className="row">
        <button className="btn btn--ghost btn--sm" onClick={() => onChange(page - 1)} disabled={!hasPrevPage}>
          Previous
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => onChange(page + 1)} disabled={!hasNextPage}>
          Next
        </button>
      </span>
    </nav>
  );
}
