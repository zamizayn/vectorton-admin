import { useLocation } from 'react-router-dom';

const pageMeta = {
  '/': { title: 'Dashboard', desc: 'Overview of your content' },
  '/blogs': { title: 'Blog Management', desc: 'Create and manage blog posts' },
  '/newsletters': { title: 'Newsletters', desc: 'Manage and send email campaigns' },
  '/subscribers': { title: 'Subscribers', desc: 'Manage your subscriber list' },
  '/seo': { title: 'SEO Manager', desc: 'Manage per-page SEO metadata' },
};

export default function Header() {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] || { title: 'Admin', desc: '' };

  return (
    <header className="header">
      <div>
        <div className="header-title">{meta.title}</div>
        {meta.desc && <div className="header-subtitle">{meta.desc}</div>}
      </div>
    </header>
  );
}
