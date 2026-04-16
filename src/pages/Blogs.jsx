import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { getBlogs, createBlog, updateBlog, deleteBlog } from '../api/blogs';
import { getCategories } from '../api/categories';
import RichTextEditor from '../components/RichTextEditor';


const emptyForm = { 
  title: '', author: '', content: '', image: null, imageUrl: '',
  CategoryId: '', metaTitle: '', metaDescription: '', metaKeywords: '', canonicalUrl: '' 
};

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit'
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
  };
  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const load = async () => {
    try {
      const [{ data: blogsData }, { data: catsData }] = await Promise.all([
        getBlogs(),
        getCategories()
      ]);
      setBlogs(blogsData);
      setCategories(catsData);
    } catch { toast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { 
    setForm(emptyForm); 
    setEditing(null); 
    setImagePreview(null);
    setModal('form'); 
  };

  const openEdit = (blog) => {
    setForm({ 
      title: blog.title, 
      author: blog.author, 
      content: blog.content,
      imageUrl: blog.imageUrl || '',
      CategoryId: blog.CategoryId || '',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      metaKeywords: blog.metaKeywords || '',
      canonicalUrl: blog.canonicalUrl || ''
    });
    setEditing(blog.id);
    setImagePreview(blog.imageUrl || null);
    setModal('form');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(f => ({ ...f, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('author', form.author);
    formData.append('content', form.content);
    formData.append('CategoryId', form.CategoryId);
    formData.append('metaTitle', form.metaTitle);
    formData.append('metaDescription', form.metaDescription);
    formData.append('metaKeywords', form.metaKeywords);
    formData.append('canonicalUrl', form.canonicalUrl);

    if (form.image) {
      formData.append('image', form.image);
    }

    try {
      if (editing) {
        await updateBlog(editing, formData);
        toast('Blog updated successfully');
      } else {
        await createBlog(formData);
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
                  <th>Featured</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      {blog.imageUrl ? (
                        <img src={`http://localhost:3000${blog.imageUrl}`} alt={blog.title} className="table-img" />
                      ) : (
                        <div className="table-img-placeholder"><FileText size={14} /></div>
                      )}
                    </td>
                    <td className="td-primary max-w-sm truncate">{blog.title}</td>
                    <td>
                      {blog.category ? (
                        <span className="badge badge-accent">{blog.category.name}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
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
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.CategoryId} onChange={set('CategoryId')} required>
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group form-full">
              <label className="form-label">Featured Image (Optional)</label>
              <div className="image-upload-wrap">
                {imagePreview && (
                  <div className="image-preview">
                    <img 
                      src={imagePreview.startsWith('blob:') ? imagePreview : `http://localhost:3000${imagePreview}`} 
                      alt="Preview" 
                    />
                  </div>
                )}
                <input type="file" onChange={handleImageChange} accept="image/*" className="form-input" />
              </div>
            </div>
            <div className="form-group form-full">
              <label className="form-label">Content *</label>
              <RichTextEditor 
                value={form.content} 
                onChange={(data) => setForm(f => ({ ...f, content: data }))} 
                placeholder="Write your blog content here…" 
              />
            </div>

            <div className="form-section-divider">SEO Settings</div>

            <div className="form-group">
              <label className="form-label">Meta Title</label>
              <input className="form-input" value={form.metaTitle} onChange={set('metaTitle')} placeholder="Defaults to blog title" />
            </div>
            <div className="form-group">
              <label className="form-label">Canonical URL</label>
              <input className="form-input" value={form.canonicalUrl} onChange={set('canonicalUrl')} placeholder="Original post URL if any" />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Meta Keywords</label>
              <input className="form-input" value={form.metaKeywords} onChange={set('metaKeywords')} placeholder="Separated by commas" />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Meta Description</label>
              <textarea 
                className="form-input" 
                rows={3} 
                value={form.metaDescription} 
                onChange={set('metaDescription')} 
                placeholder="Describe your post for search engines..." 
              />
            </div>
          </form>
        </Modal>
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
