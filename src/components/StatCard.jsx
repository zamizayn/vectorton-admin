export default function StatCard({ label, value, change, icon: Icon, color = 'purple' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '–'}</div>
        {change && <div className="stat-change">{change}</div>}
      </div>
    </div>
  );
}
