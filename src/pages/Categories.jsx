import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';

const emptyForm = { name: '' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'form'
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
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch { toast('Failed to load categories', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal('form'); };
  const openEdit = (cat) => {
    setForm({ name: cat.name });
    setEditing(cat.id);
    setModal('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing, form);
        toast('Category updated successfully');
      } else {
        await createCategory(form);
        toast('Category created successfully');
      }
      setModal(null);
      load();
    } catch (err) { 
      const msg = err.response?.data?.error || 'Failed to save category';
      toast(msg, 'error'); 
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteCategory(id);
      toast('Category deleted');
      load();
    } catch { toast('Failed to delete category', 'error'); }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-desc">{categories.length} total categories</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <Tag size={48} />
            <h3>No categories yet</h3>
            <p>Click "New Category" to create your first one.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="td-primary">{cat.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>{cat.id}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(cat)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(cat.id, cat.name)} title="Delete">
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

      {modal === 'form' && (
        <Modal
          title={editing ? 'Edit Category' : 'Create Category'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="form-group">
            <label className="form-label">Category Name *</label>
            <input 
              className="form-input" 
              value={form.name} 
              onChange={set('name')} 
              required 
              placeholder="e.g. Technology, Health, Lifestyle" 
              autoFocus
            />
          </form>
        </Modal>
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
