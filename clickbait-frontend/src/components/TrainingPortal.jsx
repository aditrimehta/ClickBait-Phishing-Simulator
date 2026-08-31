import React from 'react';
import { Mail, BookOpen, Send, CheckCircle, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

export default function TrainingPortal({ 
  employees = [], 
  onSendTrainingInvite, 
  onSendAllTrainingInvites,
  logs = []
}) {
  const phishedTargets = employees.filter(e => 
    ['Clicked', 'Compromised', 'Training Sent', 'Training Attended'].includes(e.status)
  );

  const invitesSentTargets = employees.filter(e => 
    ['Training Sent', 'Training Attended'].includes(e.status)
  );

  const completedTargets = employees.filter(e => e.status === 'Training Attended');

  const totalPhished = phishedTargets.length;
  const totalInvites = invitesSentTargets.length;
  const totalCompleted = completedTargets.length;

  const completionRate = totalPhished > 0 ? Math.round((totalCompleted / totalPhished) * 100) : 0;

  const pendingInvitesCount = employees.filter(e => 
    ['Clicked', 'Compromised'].includes(e.status)
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* KPI Cards */}
      <div className="dashboard-grid">
        <div className="kpi-card clicked">
          <div className="kpi-header">
            <span className="kpi-title">Vulnerable Targets</span>
            <ShieldAlert className="kpi-icon" size={20} style={{ color: 'var(--danger-accent)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--danger-accent)' }}>{totalPhished}</div>
          <div className="kpi-subtext">
            <span>Fell for the phishing simulation link</span>
          </div>
        </div>

        <div className="kpi-card compromised">
          <div className="kpi-header">
            <span className="kpi-title">Training Invites Dispatched</span>
            <Mail className="kpi-icon" size={20} style={{ color: 'var(--primary-accent)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--text-accent)' }}>{totalInvites}</div>
          <div className="kpi-subtext">
            <span>{pendingInvitesCount} targets awaiting invitations</span>
          </div>
        </div>

        <div className="kpi-card training">
          <div className="kpi-header">
            <span className="kpi-title">Remediation Completed</span>
            <BookOpen className="kpi-icon" size={20} style={{ color: 'var(--success-accent)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--success-accent)' }}>{totalCompleted}</div>
          <div className="kpi-subtext">
            <span style={{ color: 'var(--success-accent)', fontWeight: '500' }}>{completionRate}% Attendance Rate</span>
          </div>
        </div>
      </div>

      {/* Progress & Automation Bar */}
      <div className="training-progress-container">
        <div className="training-progress-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Security Awareness Progress</span>
            <span style={{ color: 'var(--success-accent)' }}>{totalCompleted} of {totalPhished} Attended</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
        
        <div>
          <button 
            disabled={pendingInvitesCount === 0}
            onClick={onSendAllTrainingInvites} 
            className="btn btn-accent"
            style={{ 
              opacity: pendingInvitesCount === 0 ? 0.5 : 1,
              cursor: pendingInvitesCount === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Sparkles size={16} /> Automate Remediation Invitations ({pendingInvitesCount})
          </button>
        </div>
      </div>

      {/* Main layout splits: Telemetry Console Logs & Target Table */}
      <div className="charts-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Table of Clickers */}
        <div className="directory-section" style={{ border: '1px solid var(--border)' }}>
          <h3 className="chart-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', margin: 0, marginBottom: '16px' }}>
            <BookOpen size={16} style={{ marginRight: '6px', color: 'var(--primary-accent)' }} /> Training Roster
          </h3>

          <div className="table-wrapper">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Recipient Details</th>
                  <th>Department</th>
                  <th>Simulation Result</th>
                  <th>Training Stage</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {phishedTargets.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No employees have tripped phishing sensors yet.
                    </td>
                  </tr>
                ) : (
                  phishedTargets.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="emp-name-cell">
                          <span style={{ fontWeight: '600' }}>{emp.name}</span>
                          <span className="emp-email">{emp.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="department-badge">{emp.department}</span>
                      </td>
                      <td>
                        <span className="status-badge clicked" style={{ 
                          backgroundColor: emp.status === 'Compromised' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          borderColor: emp.status === 'Compromised' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)',
                          color: emp.status === 'Compromised' ? 'var(--danger-accent)' : 'var(--warning-accent)'
                        }}>
                          {emp.status === 'Compromised' ? 'Submitted Creds' : 'Clicked Link'}
                        </span>
                      </td>
                      <td>
                        {emp.status === 'Clicked' || emp.status === 'Compromised' ? (
                          <span className="status-badge pending">
                            Awaiting Dispatch
                          </span>
                        ) : emp.status === 'Training Sent' ? (
                          <span className="status-badge training-sent">
                            Invite Dispatched
                          </span>
                        ) : (
                          <span className="status-badge training-attended">
                            <CheckCircle size={10} style={{ display: 'inline', marginRight: '4px' }} /> Completed
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="cell-actions">
                          {(emp.status === 'Clicked' || emp.status === 'Compromised') && (
                            <button 
                              onClick={() => onSendTrainingInvite(emp.id)}
                              className="btn btn-primary btn-sm"
                            >
                              <Send size={11} /> Send Invite
                            </button>
                          )}
                          
                          {emp.status === 'Training Sent' && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              In Progress...
                            </span>
                          )}

                          {emp.status === 'Training Attended' && (
                            <span style={{ fontSize: '12px', color: 'var(--success-accent)', fontWeight: '500' }}>
                              Completed ✅
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Activity Logs */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="chart-title">
            <Terminal size={16} /> Campaign Activity Log
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Real-time event stream
          </div>
          <div className="console-log-box" style={{ flexGrow: 1, minHeight: '240px' }}>
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No recent activity logged</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="console-line">
                  <span className="console-timestamp">[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
