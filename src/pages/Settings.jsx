import { useEffect, useState, useCallback } from 'react';
import { Save, Globe, Smartphone, Shield, BarChart2, Mail, Info } from 'lucide-react';
import Toast from '../components/Toast';
import { getSettings, updateSettings } from '../api/settings';

export default function Settings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
  };
  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const load = async () => {
    try {
      const { data } = await getSettings();
      setSettings(data);
    } catch {
      toast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (id, value) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings.map(s => ({ id: s.id, value: s.value })));
      toast('Settings saved successfully');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderGroup = (group, icon, title) => {
    const groupSettings = settings.filter(s => s.group === group);
    if (groupSettings.length === 0) return null;

    return (
      <div className="card" style={{ marginBottom: 32 }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className={`stat-icon ${group === 'TRACKING' ? 'purple' : group === 'BRANDING' ? 'green' : 'blue'}`} style={{ width: 32, height: 32 }}>
              {icon}
            </div>
            <div>
              <h3 className="card-title">{title}</h3>
              <p className="card-subtitle">Global {title.toLowerCase()} configuration</p>
            </div>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexSide: 'column', gap: 20 }}>
          <div className="form-grid">
            {groupSettings.map(s => (
              <div key={s.id} className={`form-group ${s.key.includes('DESCRIPTION') || s.key.includes('IMAGE') ? 'form-full' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>{s.key.replace(/_/g, ' ')}</label>
                  <div className="tooltip-wrap" title={s.description}>
                    <Info size={12} style={{ color: 'var(--text-muted)', cursor: 'help' }} />
                  </div>
                </div>
                {s.key.includes('DESCRIPTION') ? (
                  <textarea 
                    className="form-textarea" 
                    value={s.value || ''} 
                    onChange={(e) => handleChange(s.id, e.target.value)}
                    rows={3}
                  />
                ) : (
                  <input 
                    className="form-input" 
                    value={s.value || ''} 
                    onChange={(e) => handleChange(s.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Site Settings</h1>
          <p className="page-desc">Manage global SEO, branding, and tracking configurations</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <form onSubmit={handleSave}>
          {renderGroup('GENERAL', <Globe size={16} />, 'General Settings')}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12 }}>
             <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>
                <Save size={18} /> {saving ? 'Save Settings' : 'Save Settings'}
             </button>
          </div>
        </form>
      )}

      <Toast toasts={toasts} remove={removeToast} />

      <style>{`
        .tooltip-wrap { display: inline-flex; align-items: center; }
        .btn-lg { padding: 14px 32px; font-size: 15px; border-radius: var(--radius); }
      `}</style>
    </div>
  );
}
