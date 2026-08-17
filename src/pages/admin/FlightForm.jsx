import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { flightService } from '../../services/flights';
import { ApiError } from '../../services/api';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import './FlightForm.css';

// International airports worldwide
const INTERNATIONAL_AIRPORTS = [
    // Major hubs - Americas
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

    // Canada
    { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'Canada' },
    { code: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'Canada' },
    { code: 'YUL', city: 'Montreal', name: 'Montreal-Trudeau International Airport', country: 'Canada' },
    { code: 'YYC', city: 'Calgary', name: 'Calgary International Airport', country: 'Canada' },

    // Mexico & Latin America
    { code: 'MEX', city: 'Mexico City', name: 'Mexico City International Airport', country: 'Mexico' },
    { code: 'GRU', city: 'Sao Paulo', name: 'São Paulo-Guarulhos International Airport', country: 'Brazil' },
    { code: 'GIG', city: 'Rio de Janeiro', name: 'Rio de Janeiro–Galeão International Airport', country: 'Brazil' },
    { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini International Airport', country: 'Argentina' },
    { code: 'BOG', city: 'Bogota', name: 'El Dorado International Airport', country: 'Colombia' },
    { code: 'PTY', city: 'Panama City', name: 'Tocumen International Airport', country: 'Panama' },
    { code: 'SJO', city: 'San Jose', name: 'Juan Santamaría International Airport', country: 'Costa Rica' },
    { code: 'LIM', city: 'Lima', name: 'Jorge Chávez International Airport', country: 'Peru' },

    // Europe
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

    // Middle East
    { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
    { code: 'AUH', city: 'Abu Dhabi', name: 'Abu Dhabi International Airport', country: 'UAE' },
    { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar' },
    { code: 'BAH', city: 'Manama', name: 'Bahrain International Airport', country: 'Bahrain' },
    { code: 'KWI', city: 'Kuwait City', name: 'Kuwait International Airport', country: 'Kuwait' },
    { code: 'MCT', city: 'Muscat', name: 'Muscat International Airport', country: 'Oman' },
    { code: 'RUH', city: 'Riyadh', name: 'King Khalid International Airport', country: 'Saudi Arabia' },
    { code: 'JED', city: 'Jeddah', name: 'King Abdulaziz International Airport', country: 'Saudi Arabia' },
    { code: 'AMM', city: 'Amman', name: 'Queen Alia International Airport', country: 'Jordan' },
    { code: 'BEY', city: 'Beirut', name: 'Beirut-Rafic Hariri International Airport', country: 'Lebanon' },
    { code: 'TLV', city: 'Tel Aviv', name: 'Ben Gurion Airport', country: 'Israel' },

    // South Asia (excluding Pakistan domestic)
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

    // Southeast Asia
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

    // East Asia
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
    { code: 'XIY', city: 'Xi\'an', name: 'Xi\'an Xianyang International Airport', country: 'China' },
    { code: 'CSX', city: 'Changsha', name: 'Changsha Huanghua International Airport', country: 'China' },
    { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },
    { code: 'MFM', city: 'Macau', name: 'Macau International Airport', country: 'Macau' },
    { code: 'TPE', city: 'Taipei', name: 'Taiwan Taoyuan International Airport', country: 'Taiwan' },

    // Oceania
    { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', country: 'Australia' },
    { code: 'MEL', city: 'Melbourne', name: 'Melbourne Tullamarine Airport', country: 'Australia' },
    { code: 'BNE', city: 'Brisbane', name: 'Brisbane Airport', country: 'Australia' },
    { code: 'PER', city: 'Perth', name: 'Perth Airport', country: 'Australia' },
    { code: 'ADL', city: 'Adelaide', name: 'Adelaide Airport', country: 'Australia' },
    { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand' },
    { code: 'WLG', city: 'Wellington', name: 'Wellington International Airport', country: 'New Zealand' },
    { code: 'CHC', city: 'Christchurch', name: 'Christchurch International Airport', country: 'New Zealand' },

    // Africa
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

    // Pakistan International Airports
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

// Domestic airports in Pakistan (non-international)
const DOMESTIC_AIRPORTS = [
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

// All Pakistan airports (for reference)
const ALL_PAKISTAN_AIRPORTS = [...INTERNATIONAL_AIRPORTS.filter(a => a.country === 'Pakistan'), ...DOMESTIC_AIRPORTS];

// ✅ Travel Types - Domestic vs International
const DOMESTIC_TRAVEL_TYPES = [
    { value: 'tour', label: 'Tour' },
    { value: 'family', label: 'Family Visit' },
    { value: 'medical', label: 'Medical' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
];

const INTERNATIONAL_TRAVEL_TYPES = [
    { value: 'tour', label: 'Tour' },
    { value: 'work_visa', label: 'Work Visa' },
    { value: 'study_visa', label: 'Study Visa' },
    { value: 'umrah', label: 'Umrah' },
    { value: 'hajj', label: 'Hajj' },
    { value: 'business', label: 'Business' },
    { value: 'family', label: 'Family Visit' },
    { value: 'medical', label: 'Medical' },
    { value: 'other', label: 'Other' },
];

export default function FlightForm({ initialData = null, isEdit = false }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [flightType, setFlightType] = useState(initialData?.flightType || 'domestic');

    const [formData, setFormData] = useState(() => {
        if (initialData) {
            return {
                flightNumber: initialData.flightNumber || '',
                airline: initialData.airline || '',
                aircraft: initialData.aircraft || '',
                flightType: initialData.flightType || 'domestic',
                origin: {
                    airportCode: initialData.origin?.airportCode || '',
                    airportName: initialData.origin?.airportName || '',
                    city: initialData.origin?.city || '',
                    country: initialData.origin?.country || '',
                    terminal: initialData.origin?.terminal || '',
                },
                destination: {
                    airportCode: initialData.destination?.airportCode || '',
                    airportName: initialData.destination?.airportName || '',
                    city: initialData.destination?.city || '',
                    country: initialData.destination?.country || '',
                    terminal: initialData.destination?.terminal || '',
                },
                departureTime: initialData.departureTime ? new Date(initialData.departureTime).toISOString().slice(0, 16) : '',
                arrivalTime: initialData.arrivalTime ? new Date(initialData.arrivalTime).toISOString().slice(0, 16) : '',
                baggageAllowance: {
                    cabinKg: initialData.baggageAllowance?.cabinKg || 7,
                    checkedKg: initialData.baggageAllowance?.checkedKg || 23,
                },
                price: initialData.price || 0,
                totalSeats: initialData.totalSeats || 0,
                availableSeats: initialData.availableSeats || 0,
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                travelTypes: initialData.travelTypes || [],
            };
        }
        return {
            flightNumber: '',
            airline: '',
            aircraft: '',
            flightType: 'domestic',
            origin: { airportCode: '', airportName: '', city: '', country: '', terminal: '' },
            destination: { airportCode: '', airportName: '', city: '', country: '', terminal: '' },
            departureTime: '',
            arrivalTime: '',
            baggageAllowance: { cabinKg: 7, checkedKg: 23 },
            price: 0,
            totalSeats: 0,
            availableSeats: 0,
            isActive: true,
            travelTypes: [],
        };
    });

    // ✅ Get available travel types based on flight type
    const getAvailableTravelTypes = () => {
        if (flightType === 'international') {
            return INTERNATIONAL_TRAVEL_TYPES;
        } else {
            return DOMESTIC_TRAVEL_TYPES;
        }
    };

    // Get available airports based on flight type
    const getAvailableAirports = () => {
        if (flightType === 'international') {
            return INTERNATIONAL_AIRPORTS;
        } else {
            return ALL_PAKISTAN_AIRPORTS;
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.flightNumber) {
            errors.flightNumber = 'Flight number is required';
        } else if (!/^[A-Z]{2}\d{1,4}$/.test(formData.flightNumber.toUpperCase())) {
            errors.flightNumber = 'Flight number must be 2 letters followed by 1-4 digits (e.g., AA123)';
        }

        if (!formData.airline) {
            errors.airline = 'Airline is required';
        }

        if (!formData.origin.airportCode) {
            errors['origin.airportCode'] = 'Origin airport is required';
        }

        if (!formData.destination.airportCode) {
            errors['destination.airportCode'] = 'Destination airport is required';
        }

        if (formData.origin.airportCode && formData.destination.airportCode) {
            if (formData.origin.airportCode === formData.destination.airportCode) {
                errors['destination.airportCode'] = 'Origin and destination cannot be the same';
            }
        }

        if (!formData.departureTime) {
            errors.departureTime = 'Departure time is required';
        }

        if (!formData.arrivalTime) {
            errors.arrivalTime = 'Arrival time is required';
        }

        if (formData.departureTime && formData.arrivalTime) {
            const departure = new Date(formData.departureTime);
            const arrival = new Date(formData.arrivalTime);
            if (arrival <= departure) {
                errors.arrivalTime = 'Arrival time must be after departure time';
            }
        }

        if (formData.totalSeats < 1) {
            errors.totalSeats = 'Total seats must be at least 1';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (name.includes('.')) {
            const parts = name.split('.');
            if (parts.length === 2) {
                setFormData(prev => ({
                    ...prev,
                    [parts[0]]: {
                        ...prev[parts[0]],
                        [parts[1]]: type === 'checkbox' ? checked : value,
                    },
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    // Handle flight type change
    const handleFlightTypeChange = (e) => {
        const newType = e.target.value;
        setFlightType(newType);
        setFormData(prev => ({
            ...prev,
            flightType: newType,
            // Reset airport selections when switching types
            origin: { ...prev.origin, airportCode: '', airportName: '', city: '', country: '' },
            destination: { ...prev.destination, airportCode: '', airportName: '', city: '', country: '' },
            // ✅ Reset travel types when switching flight type
            travelTypes: [],
        }));
    };

    // Handle airport selection from dropdown
    const handleAirportChange = (field, e) => {
        const selectedCode = e.target.value;
        const airports = getAvailableAirports();
        const airport = airports.find(a => a.code === selectedCode);

        setFormData(prev => ({
            ...prev,
            [field]: {
                airportCode: selectedCode,
                airportName: airport?.name || '',
                city: airport?.city || '',
                country: airport?.country || '',
                terminal: prev[field]?.terminal || '',
            }
        }));
    };

    // Handle travel type toggle
    const handleTravelTypeToggle = (type) => {
        setFormData(prev => {
            const currentTypes = prev.travelTypes || [];
            if (currentTypes.includes(type)) {
                return {
                    ...prev,
                    travelTypes: currentTypes.filter(t => t !== type)
                };
            } else {
                return {
                    ...prev,
                    travelTypes: [...currentTypes, type]
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstErrorField = document.querySelector('.field--error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = {
                flightNumber: formData.flightNumber.toUpperCase().trim(),
                airline: formData.airline.trim(),
                aircraft: formData.aircraft?.trim() || undefined,
                flightType: formData.flightType,
                origin: {
                    airportCode: formData.origin.airportCode.toUpperCase().trim(),
                    airportName: formData.origin.airportName?.trim() || '',
                    city: formData.origin.city.trim(),
                    country: formData.origin.country.trim(),
                    terminal: formData.origin.terminal?.trim() || '',
                },
                destination: {
                    airportCode: formData.destination.airportCode.toUpperCase().trim(),
                    airportName: formData.destination.airportName?.trim() || '',
                    city: formData.destination.city.trim(),
                    country: formData.destination.country.trim(),
                    terminal: formData.destination.terminal?.trim() || '',
                },
                departureTime: new Date(formData.departureTime).toISOString(),
                arrivalTime: new Date(formData.arrivalTime).toISOString(),
                cabins: {
                    economy: {
                        totalSeats: Number(formData.totalSeats) || 0,
                        availableSeats: Number(formData.availableSeats) || 0,
                        price: Number(formData.price) || 0,
                    }
                },
                baggageAllowance: {
                    cabinKg: Number(formData.baggageAllowance.cabinKg) || 7,
                    checkedKg: Number(formData.baggageAllowance.checkedKg) || 23,
                },
                isActive: formData.isActive,
                travelTypes: formData.travelTypes || [],
            };

            console.log('Submitting data:', submitData);

            let response;
            if (isEdit && initialData) {
                response = await flightService.update(initialData._id, submitData);
            } else {
                response = await flightService.create(submitData);
            }

            console.log('Response:', response);
            navigate('/admin/flights');
        } catch (err) {
            console.error('Error saving flight:', err);

            if (err.response) {
                const errorMessage = err.response.data?.message ||
                    err.response.data?.error ||
                    'Failed to save flight';
                setError(errorMessage);

                if (err.response.data?.errors) {
                    const fieldErrors = {};
                    if (Array.isArray(err.response.data.errors)) {
                        err.response.data.errors.forEach(e => {
                            if (e.field) {
                                fieldErrors[e.field] = e.message;
                            }
                        });
                    }
                    setValidationErrors(fieldErrors);
                }
            } else if (err.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError(err.message || 'Failed to save flight');
            }
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flight-form-loading">
                <Spinner label={isEdit ? 'Updating flight...' : 'Creating flight...'} />
            </div>
        );
    }

    const getFieldError = (fieldName) => {
        return validationErrors[fieldName] || '';
    };

    const availableAirports = getAvailableAirports();
    const availableTravelTypes = getAvailableTravelTypes();

    return (
        <div className="flight-form-wrapper">
            <div className="flight-form-header">
                <p className="eyebrow">Administration</p>
                <h1>{isEdit ? 'Edit Flight' : 'Create Flight'}</h1>
                <p className="faint">
                    {isEdit ? 'Update flight details.' : 'Add a new flight to the system.'}
                </p>
            </div>

            {error && <Alert kind="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="flight-form">
                <div className="card">
                    {/* Flight Type */}
                    <section className="form-section">
                        <h3 className="form-section-title">Flight Type</h3>
                        <div className="form-row">
                            <div className="field-group">
                                <label className="field__label">
                                    Flight Type <span className="required">*</span>
                                </label>
                                <select
                                    name="flightType"
                                    value={flightType}
                                    onChange={handleFlightTypeChange}
                                    className="field"
                                    required
                                >
                                    <option value="domestic">Domestic (Within Pakistan)</option>
                                    <option value="international">International</option>
                                </select>
                                <div className="field-helper">
                                    {flightType === 'domestic'
                                        ? 'Showing domestic airports within Pakistan only'
                                        : 'Showing international airports worldwide'}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Basic Information */}
                    <section className="form-section">
                        <h3 className="form-section-title">Flight Information</h3>
                        <div className="form-row form-row--3col">
                            <div className="field-group">
                                <label className="field__label">
                                    Flight Number <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="flightNumber"
                                    value={formData.flightNumber}
                                    onChange={handleChange}
                                    className={`field ${getFieldError('flightNumber') ? 'field--error' : ''}`}
                                    required
                                    placeholder="e.g. PK123"
                                />
                                {getFieldError('flightNumber') && (
                                    <div className="field-helper field-helper--error">{getFieldError('flightNumber')}</div>
                                )}
                            </div>
                            <div className="field-group">
                                <label className="field__label">
                                    Airline <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="airline"
                                    value={formData.airline}
                                    onChange={handleChange}
                                    className={`field ${getFieldError('airline') ? 'field--error' : ''}`}
                                    required
                                    placeholder="e.g. Pakistan International Airlines"
                                />
                                {getFieldError('airline') && (
                                    <div className="field-helper field-helper--error">{getFieldError('airline')}</div>
                                )}
                            </div>
                            <div className="field-group">
                                <label className="field__label">
                                    Aircraft <span className="optional">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    name="aircraft"
                                    value={formData.aircraft}
                                    onChange={handleChange}
                                    className="field"
                                    placeholder="e.g. Boeing 777-300ER"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Route Information */}
                    <section className="form-section">
                        <h3 className="form-section-title">Route Information</h3>

                        <div className="form-row form-row--2col">
                            <div className="field-group">
                                <label className="field__label">
                                    Origin <span className="required">*</span>
                                </label>
                                <select
                                    name="origin"
                                    value={formData.origin.airportCode}
                                    onChange={(e) => handleAirportChange('origin', e)}
                                    className={`field ${getFieldError('origin.airportCode') ? 'field--error' : ''}`}
                                    required
                                >
                                    <option value="">Select Origin Airport</option>
                                    {availableAirports
                                        .sort((a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city))
                                        .map((airport) => (
                                            <option key={airport.code} value={airport.code}>
                                                {airport.city}, {airport.country} ({airport.code})
                                            </option>
                                        ))}
                                </select>
                                {getFieldError('origin.airportCode') && (
                                    <div className="field-helper field-helper--error">{getFieldError('origin.airportCode')}</div>
                                )}
                                {formData.origin.airportName && (
                                    <div className="field-helper">{formData.origin.airportName}</div>
                                )}
                            </div>

                            <div className="field-group">
                                <label className="field__label">
                                    Destination <span className="required">*</span>
                                </label>
                                <select
                                    name="destination"
                                    value={formData.destination.airportCode}
                                    onChange={(e) => handleAirportChange('destination', e)}
                                    className={`field ${getFieldError('destination.airportCode') ? 'field--error' : ''}`}
                                    required
                                >
                                    <option value="">Select Destination Airport</option>
                                    {availableAirports
                                        .sort((a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city))
                                        .map((airport) => (
                                            <option key={airport.code} value={airport.code}>
                                                {airport.city}, {airport.country} ({airport.code})
                                            </option>
                                        ))}
                                </select>
                                {getFieldError('destination.airportCode') && (
                                    <div className="field-helper field-helper--error">{getFieldError('destination.airportCode')}</div>
                                )}
                                {formData.destination.airportName && (
                                    <div className="field-helper">{formData.destination.airportName}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="field-group">
                                <label className="field__label">Terminal <span className="optional">(optional)</span></label>
                                <input
                                    type="text"
                                    name="origin.terminal"
                                    value={formData.origin.terminal || ''}
                                    onChange={handleChange}
                                    className="field"
                                    placeholder="e.g. Terminal 1"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Schedule */}
                    <section className="form-section">
                        <h3 className="form-section-title">Schedule</h3>
                        <div className="form-row form-row--2col">
                            <div className="field-group">
                                <label className="field__label">
                                    Departure Time <span className="required">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="departureTime"
                                    value={formData.departureTime}
                                    onChange={handleChange}
                                    className={`field ${getFieldError('departureTime') ? 'field--error' : ''}`}
                                    required
                                />
                                {getFieldError('departureTime') && (
                                    <div className="field-helper field-helper--error">{getFieldError('departureTime')}</div>
                                )}
                            </div>
                            <div className="field-group">
                                <label className="field__label">
                                    Arrival Time <span className="required">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="arrivalTime"
                                    value={formData.arrivalTime}
                                    onChange={handleChange}
                                    className={`field ${getFieldError('arrivalTime') ? 'field--error' : ''}`}
                                    required
                                />
                                {getFieldError('arrivalTime') && (
                                    <div className="field-helper field-helper--error">{getFieldError('arrivalTime')}</div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Travel Types - Dynamic based on flight type */}
                    <section className="form-section">
                        <h3 className="form-section-title">Travel Types Allowed</h3>
                        <p className="faint" style={{ marginBottom: 'var(--s-3)' }}>
                            {flightType === 'domestic' 
                                ? 'Select which travel types are allowed for this domestic flight'
                                : 'Select which travel types are allowed for this international flight'}
                        </p>
                        <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {availableTravelTypes.map((type) => (
                                <label key={type.value} className="field-checkbox" style={{ marginRight: '1rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={(formData.travelTypes || []).includes(type.value)}
                                        onChange={() => handleTravelTypeToggle(type.value)}
                                    />
                                    <span className="checkbox-label">{type.label}</span>
                                </label>
                            ))}
                        </div>
                        {flightType === 'domestic' && (
                            <div className="field-helper" style={{ marginTop: 'var(--s-2)' }}>
                                Domestic flights only support: Tour, Family Visit, Medical, Business, Other
                            </div>
                        )}
                        {flightType === 'international' && (
                            <div className="field-helper" style={{ marginTop: 'var(--s-2)' }}>
                                International flights support all travel types including Umrah, Hajj, Work Visa, Study Visa
                            </div>
                        )}
                    </section>

                    {/* Pricing & Seats */}
                    <section className="form-section">
                        <h3 className="form-section-title">Pricing & Seats</h3>
                        <div className="form-row form-row--3col">
                            <div className="field-group">
                                <label className="field__label">
                                    Price (PKR) <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="field"
                                    min="0"
                                    step="100"
                                    required
                                />
                            </div>
                            <div className="field-group">
                                <label className="field__label">
                                    Total Seats <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="totalSeats"
                                    value={formData.totalSeats}
                                    onChange={handleChange}
                                    className={`field ${getFieldError('totalSeats') ? 'field--error' : ''}`}
                                    min="1"
                                    required
                                />
                                {getFieldError('totalSeats') && (
                                    <div className="field-helper field-helper--error">{getFieldError('totalSeats')}</div>
                                )}
                            </div>
                            <div className="field-group">
                                <label className="field__label">
                                    Available Seats <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="availableSeats"
                                    value={formData.availableSeats}
                                    onChange={handleChange}
                                    className="field"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Baggage Allowance */}
                    <section className="form-section">
                        <h3 className="form-section-title">Baggage Allowance (kg)</h3>
                        <div className="form-row form-row--2col">
                            <div className="field-group">
                                <label className="field__label">Cabin Baggage</label>
                                <input
                                    type="number"
                                    name="baggageAllowance.cabinKg"
                                    value={formData.baggageAllowance.cabinKg}
                                    onChange={handleChange}
                                    className="field"
                                    min="0"
                                />
                            </div>
                            <div className="field-group">
                                <label className="field__label">Checked Baggage</label>
                                <input
                                    type="number"
                                    name="baggageAllowance.checkedKg"
                                    value={formData.baggageAllowance.checkedKg}
                                    onChange={handleChange}
                                    className="field"
                                    min="0"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Status */}
                    <section className="form-section">
                        <h3 className="form-section-title">Status</h3>
                        <div className="form-row">
                            <div className="field-group">
                                <label className="field-checkbox">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                    <span className="checkbox-label">Active</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="form-actions">
                        <Link to="/admin/flights" className="btn btn--ghost">
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn--primary" disabled={loading}>
                            {loading ? 'Saving...' : isEdit ? 'Update Flight' : 'Create Flight'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}