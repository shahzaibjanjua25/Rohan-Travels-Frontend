/**
 * Labelled input with inline error text.
 *
 * The error is tied to the input with aria-describedby and aria-invalid so it
 * is announced by a screen reader, not just shown in red — colour alone is
 * not an accessible way to report a problem.
 */
export default function Field({
  id,
  label,
  error,
  hint,
  as = 'input',
  mono = false,
  children,
  ...props
}) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ');
  const Tag = as;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <Tag
        id={id}
        className={as === 'select' ? 'field__select' : `field__input${mono ? ' field__input--mono' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      >
        {children}
      </Tag>
      {hint && !error && (
        <span className="field__hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field__error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
