export const CABIN_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded', 'partially_refunded'];
export const FLIGHT_STATUSES = ['scheduled', 'delayed', 'boarding', 'departed', 'arrived', 'cancelled'];

/** Minimum accepted by the backend password policy. */
export const MIN_PASSWORD_LENGTH = 10;

export const MAX_PASSENGERS = 9;
