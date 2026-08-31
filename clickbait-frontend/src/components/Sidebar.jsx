import React from 'react';
import { Terminal, Users, BookOpen, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, employees = [] }) {
  // Count clickers + compromised for quick badges
  const phishedCount = employees.filter(e => ['Clicked', 'Compromised'].includes(e.status)).length;
  const trainingDoneCount = employees.filter(e => e.status === 'Training Attended').length;

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <Terminal className="sidebar-logo-icon" size={24} />
        <span className="sidebar-title">PHISHGUARD</span>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-menu">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <ShieldAlert size={18} />
          <span>System Monitor</span>
        </button>

        <button 
          onClick={() => setActiveTab('directory')} 
          className={`sidebar-item ${activeTab === 'directory' ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Target Directory</span>
          <span style={{ 
            marginLeft: 'auto', 
            fontSize: '11px', 
            fontFamily: 'Share Tech Mono', 
            background: 'rgba(255,255,255,0.05)', 
            padding: '2px 6px', 
            borderRadius: '4px',
            border: '1px solid var(--border)'
          }}>
            {employees.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('training')} 
          className={`sidebar-item ${activeTab === 'training' ? 'active' : ''}`}
        >
          <BookOpen size={18} />
          <span>Training Portal</span>
          {phishedCount > 0 && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: '11px', 
              fontFamily: 'Share Tech Mono', 
              background: trainingDoneCount === phishedCount ? 'rgba(0, 255, 0, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              color: trainingDoneCount === phishedCount ? '#00ff00' : '#ef4444',
              padding: '2px 6px', 
              borderRadius: '4px',
              border: trainingDoneCount === phishedCount ? '1px solid rgba(0, 255, 0, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {trainingDoneCount}/{phishedCount}
            </span>
          )}
        </button>
      </nav>

      {/* System Telemetry Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="sidebar-status-dot"></span>
          <span>CONSOLE_SECURE_SSL</span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Share Tech Mono', paddingLeft: '8px' }}>
          DEPT_SCOPE: IT/TECH/HR/SALES...
        </div>
      </div>
    </aside>
  );
}
