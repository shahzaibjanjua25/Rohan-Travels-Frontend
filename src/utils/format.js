// src/utils/format.js

/** Presentation helpers. Times are rendered in the viewer's locale. */

const pad = (n) => String(n).padStart(2, '0');

/** 24-hour clock — unambiguous for departure times. */
export const time = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '--:--' : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const date = (value, options) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, options || { day: 'numeric', month: 'short', year: 'numeric' });
};

export const dateTime = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${date(value, { day: 'numeric', month: 'short' })} ${time(value)}`;
};

/** 485 -> "8h 05m" */
export const duration = (minutes) => {
  if (minutes == null) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? `${h}h ${pad(m)}m` : `${m}m`;
};

/** Format currency with PKR */
export const money = (amount, currency = 'PKR') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'PKR 0';
  }

  const num = Number(amount);
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // If currency is PKR, show PKR
  if (currency === 'PKR') {
    return `PKR ${formatted}`;
  }

  // For other currencies, show with symbol
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/** YYYY-MM-DD in local time — matches what a date input expects. */
export const inputDate = (value = new Date()) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const addDays = (days, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
};

/** "2 passengers" without the stray "1 passengers". */
export const plural = (count, singular, pluralForm) =>
  `${count} ${count === 1 ? singular : pluralForm || `${singular}s`}`;

export const titleCase = (value = '') =>
  String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Add formatCurrency as an alias for money (for backwards compatibility)
export const formatCurrency = money;
export const formatDate = date;
export const formatTime = time;