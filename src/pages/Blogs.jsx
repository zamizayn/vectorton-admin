import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getBlogs, createBlog, updateBlog, deleteBlog } from '../api/blogs';

const emptyForm = { title: '', author: '', excerpt: '', content: '' };

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit'
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
      const { data } = await getBlogs();
      setBlogs(data);
    } catch { toast('Failed to load blogs', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal('form'); };
  const openEdit = (blog) => {
    setForm({ title: blog.title, author: blog.author, excerpt: blog.excerpt || '', content: blog.content });
    setEditing(blog.id);
    setModal('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateBlog(editing, form);
        toast('Blog updated successfully');
      } else {
        await createBlog(form);
        toast('Blog created successfully');
      }
      setModal(null);
      load();
    } catch { toast('Failed to save blog', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteBlog(id);
      toast('Blog deleted');
      load();
    } catch { toast('Failed to delete blog', 'error'); }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Blog Posts</h1>
          <p className="page-desc">{blogs.length} total posts</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Blog
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : blogs.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No blog posts yet</h3>
            <p>Click "New Blog" to create your first post.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td className="td-primary max-w-sm truncate">{blog.title}</td>
                    <td style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: 12 }}>{blog.slug}</td>
                    <td>{blog.author}</td>
                    <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(blog)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(blog.id, blog.title)} title="Delete">
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
          title={editing ? 'Edit Blog Post' : 'Create Blog Post'}
          onClose={() => setModal(null)}
          size="modal-lg"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={set('title')} required placeholder="Blog post title" />
            </div>
            <div className="form-group">
              <label className="form-label">Author *</label>
              <input className="form-input" value={form.author} onChange={set('author')} required placeholder="Author name" />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Excerpt</label>
              <input className="form-input" value={form.excerpt} onChange={set('excerpt')} placeholder="Short summary (optional)" />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Content *</label>
              <textarea className="form-textarea" value={form.content} onChange={set('content')} required placeholder="Write your blog content here…" style={{ minHeight: 200 }} />
            </div>
          </form>
        </Modal>
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
