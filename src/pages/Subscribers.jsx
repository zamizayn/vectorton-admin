import { useEffect, useState, useCallback } from 'react';
import { Trash2, Users } from 'lucide-react';
import Toast from '../components/Toast';
import { getSubscribers, deleteSubscriber } from '../api/subscribers';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
  };
  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const load = async () => {
    try {
      const { data } = await getSubscribers();
      setSubscribers(data);
    } catch { toast('Failed to load subscribers', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, email) => {
    if (!confirm(`Remove subscriber "${email}"?`)) return;
    try {
      await deleteSubscriber(id);
      toast('Subscriber removed');
      load();
    } catch { toast('Failed to remove subscriber', 'error'); }
  };

  const activeCount = subscribers.filter((s) => s.active !== false).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscribers</h1>
          <p className="page-desc">{subscribers.length} total · {activeCount} active</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : subscribers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No subscribers yet</h3>
            <p>Subscribers will appear here once someone signs up.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Subscribed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub, i) => (
                  <tr key={sub.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td className="td-primary">{sub.email}</td>
                    <td>
                      <span className={`badge badge-${sub.active !== false ? 'success' : 'muted'}`}>
                        {sub.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(sub.id, sub.email)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
