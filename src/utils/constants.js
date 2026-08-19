// frontend/src/utils/constants.js

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

// Trip Types
export const TRIP_TYPES = [
  { value: 'one_way', label: 'One Way', icon: '→' },
  { value: 'round_trip', label: 'Round Trip', icon: '↔' },
  { value: 'multi_city', label: 'Multi-City', icon: '⇢' },
];

// Travel Types - 'generic' means valid for all purposes
export const TRAVEL_TYPES = [
  { value: 'generic', label: 'Generic (Valid for All)', description: 'Appears in all purpose filters' },
  { value: 'umrah', label: 'Umrah' },
  { value: 'hajj', label: 'Hajj' },
  { value: 'tour', label: 'Tour' },
  { value: 'work_visa', label: 'Work Visa' },
  { value: 'study_visa', label: 'Study Visa' },
  { value: 'business', label: 'Business' },
  { value: 'family', label: 'Family Visit' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];

// Helper to check if a flight matches a travel type filter
export const flightMatchesTravelType = (flight, filterTravelType) => {
  if (!filterTravelType || filterTravelType === '') return true;
  if (!flight.travelTypes || flight.travelTypes.length === 0) return false;
  // If flight has 'generic', it matches all filters
  if (flight.travelTypes.includes('generic')) return true;
  return flight.travelTypes.includes(filterTravelType);
};