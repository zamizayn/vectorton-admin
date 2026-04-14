import { useEffect, useState, useCallback } from 'react';
import { Plus, Send, Trash2, Mail } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getNewsletters, createNewsletter, sendNewsletter, deleteNewsletter } from '../api/newsletters';

const emptyForm = { subject: '', content: '' };

export default function Newsletters() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(null);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
  };
  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const load = async () => {
    try {
      const { data } = await getNewsletters();
      setNewsletters(data);
    } catch { toast('Failed to load newsletters', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createNewsletter(form);
      toast('Newsletter created');
      setModal(false);
      setForm(emptyForm);
      load();
    } catch { toast('Failed to create newsletter', 'error'); }
    finally { setSaving(false); }
  };

  const handleSend = async (id, subject) => {
    if (!confirm(`Send "${subject}" to all active subscribers?`)) return;
    setSending(id);
    try {
      const { data } = await sendNewsletter(id);
      toast(data.message);
      load();
    } catch { toast('Failed to send newsletter', 'error'); }
    finally { setSending(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this newsletter?')) return;
    try {
      await deleteNewsletter(id);
      toast('Newsletter deleted');
      load();
    } catch { toast('Failed to delete', 'error'); }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Newsletters</h1>
          <p className="page-desc">{newsletters.length} campaigns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> New Newsletter
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : newsletters.length === 0 ? (
          <div className="empty-state">
            <Mail size={48} />
            <h3>No newsletters yet</h3>
            <p>Create your first email campaign.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Sent At</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {newsletters.map((nl) => (
                  <tr key={nl.id}>
                    <td className="td-primary max-w-sm truncate">{nl.subject}</td>
                    <td>
                      <span className={`badge badge-${nl.status === 'sent' ? 'success' : 'warning'}`}>
                        {nl.status}
                      </span>
                    </td>
                    <td>{nl.sentAt ? new Date(nl.sentAt).toLocaleString() : '—'}</td>
                    <td>{new Date(nl.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="td-actions">
                        {nl.status === 'draft' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSend(nl.id, nl.subject)}
                            disabled={sending === nl.id}
                          >
                            <Send size={13} />
                            {sending === nl.id ? 'Sending…' : 'Send'}
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(nl.id)}>
                          <Trash2 size={14} />
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

      {modal && (
        <Modal
          title="Create Newsletter"
          onClose={() => setModal(false)}
          size="modal-lg"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Creating…' : 'Create Newsletter'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input className="form-input" value={form.subject} onChange={set('subject')} required placeholder="Email subject line" />
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="form-textarea" value={form.content} onChange={set('content')} required placeholder="Email body content…" style={{ minHeight: 200 }} />
            </div>
          </form>
        </Modal>
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
