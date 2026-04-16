import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Tag, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard',   to: '/',            icon: LayoutDashboard, exact: true },
  { label: 'Blogs',       to: '/blogs',        icon: FileText },
  { label: 'Categories',  to: '/categories',   icon: Tag },
  { label: 'Site Settings', to: '/settings',   icon: SettingsIcon },
];

export default function Sidebar() {
  const { username, logout } = useAuth();
  const initials = username ? username.slice(0, 2).toUpperCase() : 'AD';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">VECTETRON</div>
        <div className="sidebar-subtitle">Admin Panel</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {navItems.map(({ label, to, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{username || 'Admin'}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
