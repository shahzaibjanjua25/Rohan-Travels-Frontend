import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import flightService from '../../services/flights';
import { ApiError } from '../../services/api';
import { FLIGHT_STATUSES } from '../../utils/constants';
import { date, money, time } from '../../utils/format';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Tag from '../../components/ui/Tag';
import Pagination from '../../components/ui/Pagination';
import './AdminFlights.css';

// Pakistan airports data
const PAKISTAN_AIRPORTS = [
  { code: 'ISB', city: 'Islamabad', name: 'Islamabad International Airport' },
  { code: 'LHE', city: 'Lahore', name: 'Allama Iqbal International Airport' },
  { code: 'KHI', city: 'Karachi', name: 'Jinnah International Airport' },
  { code: 'PEW', city: 'Peshawar', name: 'Bacha Khan International Airport' },
  { code: 'MUX', city: 'Multan', name: 'Multan International Airport' },
  { code: 'SKT', city: 'Sialkot', name: 'Sialkot International Airport' },
  { code: 'UET', city: 'Quetta', name: 'Quetta International Airport' },
  { code: 'LYP', city: 'Faisalabad', name: 'Faisalabad International Airport' },
  { code: 'GWD', city: 'Gwadar', name: 'Gwadar International Airport' },
  { code: 'KDU', city: 'Skardu', name: 'Skardu Airport' },
  { code: 'GIL', city: 'Gilgit', name: 'Gilgit Airport' },
  { code: 'CJL', city: 'Chitral', name: 'Chitral Airport' },
  { code: 'DSK', city: 'Dera Ismail Khan', name: 'Dera Ismail Khan Airport' },
  { code: 'RYK', city: 'Rahim Yar Khan', name: 'Shaikh Zayed International Airport' },
  { code: 'TUK', city: 'Turbat', name: 'Turbat International Airport' },
  { code: 'PAJ', city: 'Panjgur', name: 'Panjgur Airport' },
  { code: 'DBA', city: 'Dalbandin', name: 'Dalbandin Airport' },
  { code: 'SGI', city: 'Sargodha', name: 'Sargodha Airport' },
  { code: 'MWD', city: 'Mianwali', name: 'Mianwali Airport' },
  { code: 'ZIA', city: 'Zhob', name: 'Zhob Airport' },
];

export default function AdminFlights() {
  const [flights, setFlights] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => {
    setLoading(true);
    flightService
      .search({ page, limit: 25, includeInactive: true })
      .then((res) => {
        setFlights(res.data);
        setPagination(res.pagination);
        setError('');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load flights.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const changeStatus = async (id, status) => {
    try {
      await flightService.setStatus(id, status);
      setNotice(`Flight status set to ${status}.`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the flight.');
    }
  };

  const remove = async (flight) => {
    if (!confirm(`Are you sure you want to withdraw flight ${flight.flightNumber}?`)) return;
    try {
      const res = await flightService.remove(flight._id);
      setNotice(res.softDeleted ? res.message : `Flight ${flight.flightNumber} deleted.`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the flight.');
    }
  };

  const getAirportCity = (code) => {
    const airport = PAKISTAN_AIRPORTS.find(a => a.code === code);
    return airport ? airport.city : code;
  };

  return (
    <div className="admin-flights">
      <div className="admin-flights-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Flights</h1>
        </div>
        <Link to="/admin/flights/create" className="btn btn--primary">
          + Add Flight
        </Link>
      </div>

      {notice && <Alert kind="success">{notice}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <div className="loading-center">
          <Spinner label="Loading flights" />
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="flights-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flight</th>
                  <th>Route</th>
                  <th>Time</th>
                  <th>Baggage</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight) => (
                  <tr key={flight._id} className={!flight.isActive ? 'inactive' : ''}>
                    <td data-label="Date">
                      <span className="cell-content">
                        {date(flight.departureTime, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td data-label="Flight">
                      <span className="cell-content">
                        <span className="flight-number">{flight.flightNumber}</span>
                        <span className="flight-airline">{flight.airline}</span>
                      </span>
                    </td>
                    <td data-label="Route">
                      <span className="cell-content route-info">
                        <span>
                          <span className="route-code">{flight.origin?.airportCode || 'N/A'}</span>
                          <span className="route-city">{getAirportCity(flight.origin?.airportCode)}</span>
                        </span>
                        <span className="route-arrow">→</span>
                        <span>
                          <span className="route-code">{flight.destination?.airportCode || 'N/A'}</span>
                          <span className="route-city">{getAirportCity(flight.destination?.airportCode)}</span>
                        </span>
                      </span>
                    </td>
                    <td data-label="Time">
                      <span className="cell-content">
                        <span className="time-display">
                          {time(flight.departureTime)} - {time(flight.arrivalTime)}
                        </span>
                      </span>
                    </td>
                    <td data-label="Baggage">
                      <span className="cell-content">
                        {flight.baggageAllowance ? (
                          `${flight.baggageAllowance.cabinKg || 7}kg / ${flight.baggageAllowance.checkedKg || 23}kg`
                        ) : '—'}
                      </span>
                    </td>
                    <td data-label="Price">
                      <span className="cell-content price">
                        {flight.cabins?.economy?.price != null ? money(flight.cabins.economy.price, 'PKR') : '—'}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className="cell-content status-cell">
                        <Tag status={flight.status} />
                        {!flight.isActive && <span className="withdrawn-tag">Withdrawn</span>}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <span className="cell-content actions-cell">
                        <Link 
                          to={`/admin/flights/${flight._id}/edit`} 
                          className="btn btn--primary btn--sm"
                        >
                          Edit
                        </Link>
                        <select
                          className="status-select"
                          value={flight.status}
                          onChange={(e) => changeStatus(flight._id, e.target.value)}
                          aria-label={`Status for ${flight.flightNumber}`}
                        >
                          {FLIGHT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {flight.isActive && (
                          <button 
                            className="btn btn--danger btn--sm" 
                            onClick={() => remove(flight)}
                          >
                            Withdraw
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination pagination={pagination} onChange={setPage} />
    </div>
  );
}