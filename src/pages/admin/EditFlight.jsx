import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { flightService } from '../../services/flights';
import { ApiError } from '../../services/api';
import FlightForm from './FlightForm';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';

export default function EditFlight() {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    flightService
      .get(id)
      .then((res) => {
        setFlight(res.data);
        setError('');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load flight.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="center" style={{ padding: 'var(--s-8) 0' }}>
        <Spinner label="Loading flight..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrap stack">
        <Alert kind="error">{error}</Alert>
        <Link to="/admin/flights" className="btn btn--ghost">
          Back to Flights
        </Link>
      </div>
    );
  }

  return <FlightForm initialData={flight} isEdit={true} />;
}