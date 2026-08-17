import { useEffect, useState } from 'react';
import { userService } from '../../services/misc';
import { ApiError } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { date } from '../../utils/format';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Tag from '../../components/ui/Tag';
import Pagination from '../../components/ui/Pagination';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => {
    setLoading(true);
    userService
      .list({ page, limit: 25, search: search || undefined })
      .then((res) => {
        setUsers(res.data);
        setPagination(res.pagination);
        setError('');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load people.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const act = async (fn, successMessage) => {
    setError('');
    try {
      await fn();
      setNotice(successMessage);
      load();
    } catch (err) {
      // The backend refuses self-demotion and removing the last admin. Those
      // messages are written for the person reading them, so show them as-is.
      setError(err instanceof ApiError ? err.message : 'That change could not be applied.');
    }
  };

  return (
    <div className="wrap stack">
      <div>
        <p className="eyebrow">Administration</p>
        <h1>People</h1>
      </div>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load();
        }}
      >
        <input
          className="field__input"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '320px' }}
          aria-label="Search people"
        />
        <button className="btn btn--ghost btn--sm" type="submit">
          Search
        </button>
      </form>

      {notice && <Alert kind="success">{notice}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <div className="center" style={{ padding: 'var(--s-8) 0' }}>
          <Spinner label="Loading people" />
        </div>
      ) : (
        <div className="card card--flush">
          <div className="table__scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u._id === me?._id;
                  return (
                    <tr key={u._id} style={{ opacity: u.isActive ? 1 : 0.55 }}>
                      <td>
                        {u.name}
                        {isSelf && <span className="faint"> (you)</span>}
                      </td>
                      <td className="mono">{u.email}</td>
                      <td>
                        <Tag status={u.role === 'admin' ? 'confirmed' : 'completed'}>{u.role}</Tag>
                        {!u.isActive && (
                          <span className="faint" style={{ display: 'block', fontSize: 'var(--step--1)' }}>
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="mono nowrap">{date(u.createdAt)}</td>
                      <td>
                        {isSelf ? (
                          <span className="faint" style={{ fontSize: 'var(--step--1)' }}>
                            You cannot change your own access
                          </span>
                        ) : (
                          <div className="row" style={{ gap: 'var(--s-2)' }}>
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() =>
                                act(
                                  () => userService.update(u._id, { role: u.role === 'admin' ? 'user' : 'admin' }),
                                  `${u.name} is now ${u.role === 'admin' ? 'a customer' : 'an administrator'}.`
                                )
                              }
                            >
                              {u.role === 'admin' ? 'Make customer' : 'Make admin'}
                            </button>
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() =>
                                act(
                                  () => userService.update(u._id, { isActive: !u.isActive }),
                                  `${u.name} ${u.isActive ? 'deactivated' : 'reactivated'}.`
                                )
                              }
                            >
                              {u.isActive ? 'Deactivate' : 'Reactivate'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination pagination={pagination} onChange={setPage} />
    </div>
  );
}
