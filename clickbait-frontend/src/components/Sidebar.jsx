import React from 'react';
import { Shield, Users, GraduationCap, Server } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, employees = [] }) {
  // Count clickers + compromised for quick badges
  const phishedCount = employees.filter(e => ['Clicked', 'Compromised'].includes(e.status)).length;
  const trainingDoneCount = employees.filter(e => e.status === 'Training Attended').length;

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <Shield className="sidebar-logo-icon" size={24} />
        <span className="sidebar-title">PhishGuard</span>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-menu">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <Server size={18} />
          <span>Security Monitor</span>
        </button>

        <button 
          onClick={() => setActiveTab('directory')} 
          className={`sidebar-item ${activeTab === 'directory' ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Target Directory</span>
          <span className="sidebar-badge">
            {employees.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('training')} 
          className={`sidebar-item ${activeTab === 'training' ? 'active' : ''}`}
        >
          <GraduationCap size={18} />
          <span>Training Portal</span>
          {phishedCount > 0 && (
            <span 
              className="sidebar-badge"
              style={{ 
                background: trainingDoneCount === phishedCount ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                color: trainingDoneCount === phishedCount ? 'var(--success-accent)' : 'var(--danger-accent)'
              }}
            >
              {trainingDoneCount}/{phishedCount}
            </span>
          )}
        </button>
      </nav>

      {/* System Telemetry Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="sidebar-status-dot"></span>
          <span>SYSTEM ACTIVE & PROTECTED</span>
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '4px' }}>
          Scope: IT / HR / Sales / Tech
        </div>
      </div>
    </aside>
  );
}
