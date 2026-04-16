import { useEffect, useState } from 'react';
import { FileText, Mail, Users, Search } from 'lucide-react';
import StatCard from '../components/StatCard';
import { getBlogs } from '../api/blogs';
import { getNewsletters } from '../api/newsletters';
import { getSubscribers } from '../api/subscribers';
import { getSeoRecords } from '../api/seo';

export default function Dashboard() {
  const [stats, setStats] = useState({ blogs: null, newsletters: null, subscribers: null, seo: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBlogs(), getNewsletters(), getSubscribers(), getSeoRecords()])
      .then(([b, n, s, se]) => {
        setStats({
          blogs: b.data.length,
          newsletters: n.data.length,
          subscribers: s.data.length,
          seo: se.data.length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statConfig = [
    // { label: 'Total Blogs',       key: 'blogs',       icon: FileText, color: 'purple', change: 'Published blog posts' },
    // { label: 'Newsletters',       key: 'newsletters',  icon: Mail,     color: 'blue',   change: 'Email campaigns' },
    // { label: 'Subscribers',       key: 'subscribers',  icon: Users,    color: 'green',  change: 'Active email subscribers' },
    // { label: 'SEO Pages',         key: 'seo',          icon: Search,   color: 'orange', change: 'Pages with SEO config' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back 👋</h1>
          <p className="page-desc">Here's what's happening with your site today.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <div className="stats-grid">
          {statConfig.map(({ label, key, icon, color, change }) => (
            <StatCard
              key={key}
              label={label}
              value={stats[key]}
              icon={icon}
              color={color}
              change={change}
            />
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Quick Guide</div>
            <div className="card-subtitle">How to use each section</div>
          </div>
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { icon: '✍️', title: 'Blogs', desc: 'Create, edit, and delete blog posts. Auto-generates URL slugs.' },
            { icon: '📧', title: 'Newsletters', desc: 'Draft email campaigns and broadcast to all active subscribers.' },
            { icon: '👥', title: 'Subscribers', desc: 'View and manage your email subscriber list.' },
            { icon: '🔍', title: 'SEO Manager', desc: 'Set meta title, description, OG tags, and robots per page.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
