// frontend/src/pages/admin/AdminUmrahPackages.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { umrahService } from '../../services/umrah';
import { ApiError } from '../../services/api';
import { date, money } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import './AdminUmrahPackages.css';

export default function AdminUmrahPackages() {
  const [packages, setPackages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadPackages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await umrahService.getPackages({ limit: 100 });
      setPackages(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await umrahService.updatePackageStatus(id, { isActive: !currentStatus });
      setNotice(`Package ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
      loadPackages();
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update status.');
    }
  };

  const handleDelete = async (pkg) => {
    if (!confirm(`Are you sure you want to delete "${pkg.packageName}"?`)) return;
    try {
      const res = await umrahService.deletePackage(pkg._id);
      if (res.softDeleted) {
        setNotice(res.message);
      } else {
        setNotice(`Package "${pkg.packageName}" deleted.`);
      }
      loadPackages();
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete package.');
    }
  };

  if (loading) {
    return (
      <div className="admin-umrah-wrapper">
        <div className="center" style={{ padding: '48px 0' }}>
          <Spinner label="Loading packages..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-umrah-wrapper">
      <div className="admin-umrah-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Umrah Packages</h1>
          <p className="faint">Manage all Umrah packages</p>
        </div>
        <Link to="/admin/umrah/packages/create" className="btn btn--primary">
          + Create Package
        </Link>
      </div>

      {notice && <Alert kind="success">{notice}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      {packages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🕋</div>
          <h3>No Umrah packages</h3>
          <p className="faint">Create your first Umrah package to get started.</p>
          <Link to="/admin/umrah/packages/create" className="btn btn--primary">
            Create Package
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-umrah-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Flight</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Hotels</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg._id} className={!pkg.isActive ? 'inactive' : ''}>
                  <td>
                    <div className="package-name">
                      <span className="name">{pkg.packageName}</span>
                      <span className="duration">{pkg.duration} days</span>
                    </div>
                  </td>
                  <td>
                    <div className="flight-info">
                      <span className="airline">{pkg.airline}</span>
                      <span className="flight-number">{pkg.flightNumber}</span>
                    </div>
                  </td>
                  <td>
                    <span className="route">
                      {pkg.origin?.airportCode || 'N/A'} → {pkg.destination?.airportCode || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="departure-date">{date(pkg.departureDate)}</span>
                  </td>
                  <td>
                    <div className="hotels-info">
                      <span>M: {pkg.makkahHotel?.name?.substring(0, 15) || 'N/A'}</span>
                      <span>Md: {pkg.madinahHotel?.name?.substring(0, 15) || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="price">{money(pkg.perPersonPrice)}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${pkg.isActive ? 'active' : 'inactive'}`}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {pkg.isFeatured && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </td>
                  <td>
                    <div className="action-group">
                      <Link 
                        to={`/admin/umrah/packages/${pkg._id}/edit`} 
                        className="btn btn--primary btn--sm"
                      >
                        Edit
                      </Link>
                      <button
                        className={`btn btn--${pkg.isActive ? 'warning' : 'success'} btn--sm`}
                        onClick={() => toggleStatus(pkg._id, pkg.isActive)}
                      >
                        {pkg.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => handleDelete(pkg)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}