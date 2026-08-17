export default function Alert({ kind = 'info', children, ...props }) {
  return (
    <div
      className={`alert alert--${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
      {...props}
    >
      <span>{children}</span>
    </div>
  );
}
