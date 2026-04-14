import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search as SearchIcon, Globe, RefreshCw } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getSeoRecords, createSeoRecord, updateSeoRecord, deleteSeoRecord } from '../api/seo';

const emptyForm = {
  page: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalUrl: '',
  robots: 'index, follow',
};

export default function SEO() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
  };
  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getSeoRecords();
      setRecords(data);
    } catch { toast('Failed to load SEO records', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (rec) => {
    setForm({
      page: rec.page || '',
      metaTitle: rec.metaTitle || '',
      metaDescription: rec.metaDescription || '',
      metaKeywords: rec.metaKeywords || '',
      ogTitle: rec.ogTitle || '',
      ogDescription: rec.ogDescription || '',
      ogImage: rec.ogImage || '',
      canonicalUrl: rec.canonicalUrl || '',
      robots: rec.robots || 'index, follow',
    });
    setEditing(rec.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateSeoRecord(editing, form);
        toast('SEO record updated');
      } else {
        await createSeoRecord(form);
        toast('SEO record created');
      }
      setModal(false);
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, page) => {
    if (!confirm(`Delete SEO record for "${page}"?`)) return;
    try {
      await deleteSeoRecord(id);
      toast('SEO record deleted');
      load();
    } catch { toast('Failed to delete', 'error'); }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">SEO Manager</h1>
          <p className="page-desc">{records.length} pages configured</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Page
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'var(--accent-soft)',
        border: '1px solid var(--accent)30',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 18px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 14,
        color: 'var(--accent)',
      }}>
        <Globe size={18} />
        <span>
          SEO metadata is automatically injected into each page&rsquo;s <code style={{ fontFamily: 'monospace', background: 'var(--accent-glow)', padding: '1px 6px', borderRadius: 4 }}>&lt;head&gt;</code> based on the page identifier you set below.
        </span>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <SearchIcon size={48} />
            <h3>No SEO records yet</h3>
            <p>Add a page to start managing its meta tags.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Meta Title</th>
                  <th>Description</th>
                  <th>Robots</th>
                  <th>OG Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: 4 }}>
                        {rec.page}
                      </span>
                    </td>
                    <td className="td-primary max-w-xs truncate">{rec.metaTitle || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td className="max-w-sm truncate" style={{ fontSize: 13 }}>{rec.metaDescription || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      {rec.robots ? (
                        <span className="badge badge-muted">{rec.robots}</span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>{rec.ogImage ? '✓ Set' : <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(rec)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(rec.id, rec.page)} title="Delete">
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
          title={editing ? 'Edit SEO Record' : 'Add SEO Record'}
          onClose={() => setModal(false)}
          size="modal-lg"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit}>
            {/* Basic SEO */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Basic SEO</p>
            <div className="form-grid" style={{ marginBottom: 20 }}>
              <div className="form-group form-full">
                <label className="form-label">Page Identifier *</label>
                <input className="form-input" value={form.page} onChange={set('page')} required placeholder="e.g. home, blog-list, /about" />
              </div>
              <div className="form-group">
                <label className="form-label">Meta Title</label>
                <input className="form-input" value={form.metaTitle} onChange={set('metaTitle')} placeholder="Page title for SEO" maxLength={60} />
              </div>
              <div className="form-group">
                <label className="form-label">Meta Keywords</label>
                <input className="form-input" value={form.metaKeywords} onChange={set('metaKeywords')} placeholder="comma, separated, keywords" />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Meta Description</label>
                <textarea className="form-textarea" value={form.metaDescription} onChange={set('metaDescription')} placeholder="Page description (150-160 chars)" style={{ minHeight: 80 }} maxLength={160} />
              </div>
            </div>

            <hr className="section-divider" />

            {/* Open Graph */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Open Graph (Social Media)</p>
            <div className="form-grid" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label">OG Title</label>
                <input className="form-input" value={form.ogTitle} onChange={set('ogTitle')} placeholder="Social share title" />
              </div>
              <div className="form-group">
                <label className="form-label">OG Image URL</label>
                <input className="form-input" value={form.ogImage} onChange={set('ogImage')} placeholder="https://…/og-image.jpg" />
              </div>
              <div className="form-group form-full">
                <label className="form-label">OG Description</label>
                <textarea className="form-textarea" value={form.ogDescription} onChange={set('ogDescription')} placeholder="Social share description" style={{ minHeight: 72 }} />
              </div>
            </div>

            <hr className="section-divider" />

            {/* Technical */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Technical SEO</p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Canonical URL</label>
                <input className="form-input" value={form.canonicalUrl} onChange={set('canonicalUrl')} placeholder="https://yourdomain.com/page" />
              </div>
              <div className="form-group">
                <label className="form-label">Robots Directive</label>
                <select className="form-select" value={form.robots} onChange={set('robots')}>
                  <option value="index, follow">index, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
