// frontend/src/data/airports.js
//
// Airport reference data, lifted out of FlightForm.jsx.
//
// It lived inline in the form, which made that file ~700 lines before any
// actual form logic. Adding the multi-city segment builder on top would have
// buried the logic entirely. It is also needed by more than one screen now.

export const INTERNATIONAL_AIRPORTS = [
  // --- Americas ---
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'USA' },
  { code: 'ORD', city: 'Chicago', name: "O'Hare International Airport", country: 'USA' },
  { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International Airport', country: 'USA' },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International Airport', country: 'USA' },
  { code: 'DEN', city: 'Denver', name: 'Denver International Airport', country: 'USA' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'USA' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International Airport', country: 'USA' },
  { code: 'MIA', city: 'Miami', name: 'Miami International Airport', country: 'USA' },
  { code: 'BOS', city: 'Boston', name: 'Boston Logan International Airport', country: 'USA' },
  { code: 'EWR', city: 'Newark', name: 'Newark Liberty International Airport', country: 'USA' },
  { code: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor International Airport', country: 'USA' },
  { code: 'IAH', city: 'Houston', name: 'George Bush Intercontinental Airport', country: 'USA' },
  { code: 'MCO', city: 'Orlando', name: 'Orlando International Airport', country: 'USA' },
  { code: 'LAS', city: 'Las Vegas', name: 'Harry Reid International Airport', country: 'USA' },
  { code: 'MSP', city: 'Minneapolis', name: 'Minneapolis-Saint Paul International Airport', country: 'USA' },
  { code: 'DTW', city: 'Detroit', name: 'Detroit Metropolitan Airport', country: 'USA' },
  { code: 'PHL', city: 'Philadelphia', name: 'Philadelphia International Airport', country: 'USA' },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'Canada' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'Canada' },
  { code: 'YUL', city: 'Montreal', name: 'Montreal-Trudeau International Airport', country: 'Canada' },
  { code: 'YYC', city: 'Calgary', name: 'Calgary International Airport', country: 'Canada' },
  { code: 'MEX', city: 'Mexico City', name: 'Mexico City International Airport', country: 'Mexico' },
  { code: 'GRU', city: 'Sao Paulo', name: 'São Paulo-Guarulhos International Airport', country: 'Brazil' },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Rio de Janeiro–Galeão International Airport', country: 'Brazil' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini International Airport', country: 'Argentina' },
  { code: 'BOG', city: 'Bogota', name: 'El Dorado International Airport', country: 'Colombia' },
  { code: 'PTY', city: 'Panama City', name: 'Tocumen International Airport', country: 'Panama' },
  { code: 'SJO', city: 'San Jose', name: 'Juan Santamaría International Airport', country: 'Costa Rica' },
  { code: 'LIM', city: 'Lima', name: 'Jorge Chávez International Airport', country: 'Peru' },

  // --- Europe ---
  { code: 'LHR', city: 'London', name: 'London Heathrow Airport', country: 'UK' },
  { code: 'LGW', city: 'London', name: 'London Gatwick Airport', country: 'UK' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
  { code: 'ORY', city: 'Paris', name: 'Paris Orly Airport', country: 'France' },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Airport Schiphol', country: 'Netherlands' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  { code: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany' },
  { code: 'BER', city: 'Berlin', name: 'Berlin Brandenburg Airport', country: 'Germany' },
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas Airport', country: 'Spain' },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona–El Prat Airport', country: 'Spain' },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci–Fiumicino Airport', country: 'Italy' },
  { code: 'MXP', city: 'Milan', name: 'Milan Malpensa Airport', country: 'Italy' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
  { code: 'GVA', city: 'Geneva', name: 'Geneva Airport', country: 'Switzerland' },
  { code: 'VIE', city: 'Vienna', name: 'Vienna International Airport', country: 'Austria' },
  { code: 'BRU', city: 'Brussels', name: 'Brussels Airport', country: 'Belgium' },
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Airport', country: 'Denmark' },
  { code: 'OSL', city: 'Oslo', name: 'Oslo Gardermoen Airport', country: 'Norway' },
  { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda Airport', country: 'Sweden' },
  { code: 'HEL', city: 'Helsinki', name: 'Helsinki-Vantaa Airport', country: 'Finland' },
  { code: 'DUB', city: 'Dublin', name: 'Dublin Airport', country: 'Ireland' },
  { code: 'LIS', city: 'Lisbon', name: 'Lisbon Portela Airport', country: 'Portugal' },
  { code: 'ATH', city: 'Athens', name: 'Athens International Airport', country: 'Greece' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
  { code: 'SAW', city: 'Istanbul', name: 'Sabiha Gökçen International Airport', country: 'Turkey' },
  { code: 'WAW', city: 'Warsaw', name: 'Warsaw Chopin Airport', country: 'Poland' },
  { code: 'PRG', city: 'Prague', name: 'Václav Havel Airport Prague', country: 'Czech Republic' },
  { code: 'BUD', city: 'Budapest', name: 'Budapest Ferenc Liszt International Airport', country: 'Hungary' },

  // --- Middle East / Gulf (COMPLETE LIST) ---
  // UAE
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Abu Dhabi International Airport', country: 'UAE' },
  { code: 'SHJ', city: 'Sharjah', name: 'Sharjah International Airport', country: 'UAE' },
  { code: 'RKT', city: 'Ras Al Khaimah', name: 'Ras Al Khaimah International Airport', country: 'UAE' },

  // Saudi Arabia (ALL airports)
  { code: 'JED', city: 'Jeddah', name: 'King Abdulaziz International Airport', country: 'Saudi Arabia' },
  { code: 'RUH', city: 'Riyadh', name: 'King Khalid International Airport', country: 'Saudi Arabia' },
  { code: 'DMM', city: 'Dammam', name: 'King Fahd International Airport', country: 'Saudi Arabia' },
  { code: 'MED', city: 'Madinah', name: 'Prince Mohammad bin Abdulaziz International Airport', country: 'Saudi Arabia' },
  { code: 'TIF', city: 'Taif', name: 'Taif International Airport', country: 'Saudi Arabia' },
  { code: 'AHB', city: 'Abha', name: 'Abha International Airport', country: 'Saudi Arabia' },
  { code: 'GIZ', city: 'Jazan', name: 'Jazan International Airport', country: 'Saudi Arabia' },
  { code: 'HOF', city: 'Hofuf', name: 'Al-Ahsa International Airport', country: 'Saudi Arabia' },
  { code: 'TUU', city: 'Tabuk', name: 'Tabuk Regional Airport', country: 'Saudi Arabia' },
  { code: 'EJN', city: 'Al Ula', name: 'Al Ula International Airport', country: 'Saudi Arabia' },
  { code: 'ELQ', city: 'Gassim', name: 'Gassim Regional Airport', country: 'Saudi Arabia' },
  { code: 'HBT', city: 'Hail', name: 'Hail Regional Airport', country: 'Saudi Arabia' },
  { code: 'RAE', city: 'Arar', name: 'Arar Domestic Airport', country: 'Saudi Arabia' },
  { code: 'URY', city: 'Gurayat', name: 'Gurayat Domestic Airport', country: 'Saudi Arabia' },
  { code: 'YNB', city: 'Yanbu', name: 'Yanbu International Airport', country: 'Saudi Arabia' },
  { code: 'AQI', city: 'Qaisumah', name: 'Qaisumah Domestic Airport', country: 'Saudi Arabia' },
  { code: 'NQS', city: 'King Khalid Military City', name: 'King Khalid Military City Airport', country: 'Saudi Arabia' },
  { code: 'DHA', city: 'Dhahran', name: 'King Abdulaziz Air Base', country: 'Saudi Arabia' },

  // Qatar
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar' },

  // Oman
  { code: 'MCT', city: 'Muscat', name: 'Muscat International Airport', country: 'Oman' },
  { code: 'SLL', city: 'Salalah', name: 'Salalah International Airport', country: 'Oman' },

  // Bahrain
  { code: 'BAH', city: 'Manama', name: 'Bahrain International Airport', country: 'Bahrain' },

  // Kuwait
  { code: 'KWI', city: 'Kuwait City', name: 'Kuwait International Airport', country: 'Kuwait' },

  // Other Middle East
  { code: 'BEY', city: 'Beirut', name: 'Beirut-Rafic Hariri International Airport', country: 'Lebanon' },
  { code: 'AMM', city: 'Amman', name: 'Queen Alia International Airport', country: 'Jordan' },

  // --- South Asia ---
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport', country: 'India' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' },
  { code: 'BLR', city: 'Bangalore', name: 'Kempegowda International Airport', country: 'India' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'India' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra Bose International Airport', country: 'India' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'India' },
  { code: 'KTM', city: 'Kathmandu', name: 'Tribhuvan International Airport', country: 'Nepal' },
  { code: 'CMB', city: 'Colombo', name: 'Bandaranaike International Airport', country: 'Sri Lanka' },
  { code: 'DAC', city: 'Dhaka', name: 'Hazrat Shahjalal International Airport', country: 'Bangladesh' },
  { code: 'MLE', city: 'Male', name: 'Velana International Airport', country: 'Maldives' },

  // --- Southeast Asia ---
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'DMK', city: 'Bangkok', name: 'Don Mueang International Airport', country: 'Thailand' },
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta International Airport', country: 'Indonesia' },
  { code: 'DPS', city: 'Denpasar', name: 'Ngurah Rai International Airport', country: 'Indonesia' },
  { code: 'MNL', city: 'Manila', name: 'Ninoy Aquino International Airport', country: 'Philippines' },
  { code: 'HAN', city: 'Hanoi', name: 'Noi Bai International Airport', country: 'Vietnam' },
  { code: 'SGN', city: 'Ho Chi Minh City', name: 'Tan Son Nhat International Airport', country: 'Vietnam' },
  { code: 'PNH', city: 'Phnom Penh', name: 'Phnom Penh International Airport', country: 'Cambodia' },
  { code: 'VTE', city: 'Vientiane', name: 'Wattay International Airport', country: 'Laos' },
  { code: 'RGN', city: 'Yangon', name: 'Yangon International Airport', country: 'Myanmar' },

  // --- East Asia ---
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'Japan' },
  { code: 'HND', city: 'Tokyo', name: 'Tokyo Haneda Airport', country: 'Japan' },
  { code: 'KIX', city: 'Osaka', name: 'Kansai International Airport', country: 'Japan' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
  { code: 'GMP', city: 'Seoul', name: 'Gimpo International Airport', country: 'South Korea' },
  { code: 'PVG', city: 'Shanghai', name: 'Shanghai Pudong International Airport', country: 'China' },
  { code: 'SHA', city: 'Shanghai', name: 'Shanghai Hongqiao International Airport', country: 'China' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International Airport', country: 'China' },
  { code: 'PKX', city: 'Beijing', name: 'Beijing Daxing International Airport', country: 'China' },
  { code: 'CAN', city: 'Guangzhou', name: 'Guangzhou Baiyun International Airport', country: 'China' },
  { code: 'SZX', city: 'Shenzhen', name: 'Shenzhen Baoan International Airport', country: 'China' },
  { code: 'CTU', city: 'Chengdu', name: 'Chengdu Shuangliu International Airport', country: 'China' },
  { code: 'HGH', city: 'Hangzhou', name: 'Hangzhou Xiaoshan International Airport', country: 'China' },
  { code: 'XIY', city: "Xi'an", name: "Xi'an Xianyang International Airport", country: 'China' },
  { code: 'CSX', city: 'Changsha', name: 'Changsha Huanghua International Airport', country: 'China' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },
  { code: 'MFM', city: 'Macau', name: 'Macau International Airport', country: 'Macau' },
  { code: 'TPE', city: 'Taipei', name: 'Taiwan Taoyuan International Airport', country: 'Taiwan' },

  // --- Oceania ---
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', country: 'Australia' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Tullamarine Airport', country: 'Australia' },
  { code: 'BNE', city: 'Brisbane', name: 'Brisbane Airport', country: 'Australia' },
  { code: 'PER', city: 'Perth', name: 'Perth Airport', country: 'Australia' },
  { code: 'ADL', city: 'Adelaide', name: 'Adelaide Airport', country: 'Australia' },
  { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand' },
  { code: 'WLG', city: 'Wellington', name: 'Wellington International Airport', country: 'New Zealand' },
  { code: 'CHC', city: 'Christchurch', name: 'Christchurch International Airport', country: 'New Zealand' },

  // --- Africa ---
  { code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo International Airport', country: 'South Africa' },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International Airport', country: 'South Africa' },
  { code: 'DUR', city: 'Durban', name: 'King Shaka International Airport', country: 'South Africa' },
  { code: 'NBO', city: 'Nairobi', name: 'Jomo Kenyatta International Airport', country: 'Kenya' },
  { code: 'CAI', city: 'Cairo', name: 'Cairo International Airport', country: 'Egypt' },
  { code: 'CMN', city: 'Casablanca', name: 'Mohammed V International Airport', country: 'Morocco' },
  { code: 'TUN', city: 'Tunis', name: 'Tunis-Carthage International Airport', country: 'Tunisia' },
  { code: 'DSS', city: 'Dakar', name: 'Blaise Diagne International Airport', country: 'Senegal' },
  { code: 'ACC', city: 'Accra', name: 'Kotoka International Airport', country: 'Ghana' },
  { code: 'LOS', city: 'Lagos', name: 'Murtala Muhammed International Airport', country: 'Nigeria' },
  { code: 'ADD', city: 'Addis Ababa', name: 'Addis Ababa Bole International Airport', country: 'Ethiopia' },
  { code: 'MRU', city: 'Mauritius', name: 'Sir Seewoosagur Ramgoolam International Airport', country: 'Mauritius' },
  { code: 'SEZ', city: 'Mahe', name: 'Seychelles International Airport', country: 'Seychelles' },

  // --- Pakistan (international gateways) ---
  { code: 'ISB', city: 'Islamabad', name: 'Islamabad International Airport', country: 'Pakistan' },
  { code: 'LHE', city: 'Lahore', name: 'Allama Iqbal International Airport', country: 'Pakistan' },
  { code: 'KHI', city: 'Karachi', name: 'Jinnah International Airport', country: 'Pakistan' },
  { code: 'PEW', city: 'Peshawar', name: 'Bacha Khan International Airport', country: 'Pakistan' },
  { code: 'MUX', city: 'Multan', name: 'Multan International Airport', country: 'Pakistan' },
  { code: 'SKT', city: 'Sialkot', name: 'Sialkot International Airport', country: 'Pakistan' },
  { code: 'UET', city: 'Quetta', name: 'Quetta International Airport', country: 'Pakistan' },
  { code: 'LYP', city: 'Faisalabad', name: 'Faisalabad International Airport', country: 'Pakistan' },
  { code: 'GWD', city: 'Gwadar', name: 'Gwadar International Airport', country: 'Pakistan' },
  { code: 'RYK', city: 'Rahim Yar Khan', name: 'Shaikh Zayed International Airport', country: 'Pakistan' },
  { code: 'TUK', city: 'Turbat', name: 'Turbat International Airport', country: 'Pakistan' },
];

/** Pakistani airports with no international service. */
export const DOMESTIC_ONLY_AIRPORTS = [
  { code: 'KDU', city: 'Skardu', name: 'Skardu Airport', country: 'Pakistan' },
  { code: 'GIL', city: 'Gilgit', name: 'Gilgit Airport', country: 'Pakistan' },
  { code: 'CJL', city: 'Chitral', name: 'Chitral Airport', country: 'Pakistan' },
  { code: 'DSK', city: 'Dera Ismail Khan', name: 'Dera Ismail Khan Airport', country: 'Pakistan' },
  { code: 'PAJ', city: 'Panjgur', name: 'Panjgur Airport', country: 'Pakistan' },
  { code: 'DBA', city: 'Dalbandin', name: 'Dalbandin Airport', country: 'Pakistan' },
  { code: 'SGI', city: 'Sargodha', name: 'Sargodha Airport', country: 'Pakistan' },
  { code: 'MWD', city: 'Mianwali', name: 'Mianwali Airport', country: 'Pakistan' },
  { code: 'ZIA', city: 'Zhob', name: 'Zhob Airport', country: 'Pakistan' },
];

/** Everything inside Pakistan — the list a domestic itinerary can draw from. */
export const ALL_PAKISTAN_AIRPORTS = [
  ...INTERNATIONAL_AIRPORTS.filter((a) => a.country === 'Pakistan'),
  ...DOMESTIC_ONLY_AIRPORTS,
];

/**
 * The selectable list for a given flight type.
 *
 * A domestic itinerary must not be able to pick Jeddah, and an international
 * one should still offer the Pakistani gateways it departs from.
 */
export const airportsFor = (flightType) =>
  (flightType === 'international' ? INTERNATIONAL_AIRPORTS : ALL_PAKISTAN_AIRPORTS)
    .slice()
    .sort((a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city));

export const findAirport = (code, flightType) =>
  airportsFor(flightType).find((a) => a.code === code) ||
  [...INTERNATIONAL_AIRPORTS, ...DOMESTIC_ONLY_AIRPORTS].find((a) => a.code === code) ||
  null;

export default {
  INTERNATIONAL_AIRPORTS,
  DOMESTIC_ONLY_AIRPORTS,
  ALL_PAKISTAN_AIRPORTS,
  airportsFor,
  findAirport,
};