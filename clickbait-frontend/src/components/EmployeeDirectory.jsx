import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Send, MousePointer, ShieldAlert, RefreshCw, X, Users, Layers, Zap } from 'lucide-react';

const DEPARTMENTS = ['HR', 'Tech', 'Sales', 'Marketing', 'Finance', 'IT', 'General'];

export default function EmployeeDirectory({ 
  employees = [], 
  onAddEmployee, 
  onEditEmployee, 
  onDeleteEmployee, 
  onUpdateStatus,
  onSendDepartmentEmails
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  
  // Department Bulk Dispatch Switch State
  const [isDeptDispatchEnabled, setIsDeptDispatchEnabled] = useState(false);
  const [deptDispatchTarget, setDeptDispatchTarget] = useState('IT');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('General');
  const [formError, setFormError] = useState('');

  // Filtered Employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    
    return matchesSearch && matchesDept;
  });

  // Calculate pending targets for department bulk dispatch
  const deptPendingTargets = employees.filter(e => 
    (deptDispatchTarget === 'All' || e.department === deptDispatchTarget) && e.status === 'Pending'
  );

  // Open Modal for Add
  const handleOpenAdd = () => {
    setModalMode('add');
    setCurrentEmployeeId(null);
    setFormName('');
    setFormEmail('');
    setFormDept('General');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (emp) => {
    setModalMode('edit');
    setCurrentEmployeeId(emp.id);
    setFormName(emp.name);
    setFormEmail(emp.email);
    setFormDept(emp.department);
    setFormError('');
    setIsModalOpen(true);
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (modalMode === 'add') {
      onAddEmployee({
        name: formName,
        email: formEmail,
        department: formDept
      });
    } else {
      onEditEmployee(currentEmployeeId, {
        name: formName,
        email: formEmail,
        department: formDept
      });
    }
    setIsModalOpen(false);
  };

  // Helper status badge renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Sent':
        return (
          <span className="status-badge sent">
            <Send size={12} /> SENT
          </span>
        );
      case 'Clicked':
        return (
          <span className="status-badge clicked">
            <MousePointer size={12} /> CLICKED LINK
          </span>
        );
      case 'Compromised':
        return (
          <span className="status-badge compromised">
            <ShieldAlert size={12} /> COMPROMISED
          </span>
        );
      case 'Training Sent':
        return (
          <span className="status-badge training-sent">
            TRAINING INVITED
          </span>
        );
      case 'Training Attended':
        return (
          <span className="status-badge training-attended">
            TRAINING COMPLETED
          </span>
        );
      default:
        return (
          <span className="status-badge pending">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="directory-section">
      
      {/* Header Bar */}
      <div className="directory-header">
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Target Employee Directory
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage target profiles, filter scope, and execute department-wide dispatches
          </div>
        </div>
        
        <div className="directory-actions">
          {/* Department Dispatch Toggle Switch control */}
          <div className="toggle-switch-container">
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Department Bulk Dispatch
            </span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={isDeptDispatchEnabled}
                onChange={(e) => setIsDeptDispatchEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Add Employee Button */}
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add Target
          </button>
        </div>
      </div>

      {/* Expandable Department Dispatch Control Panel (Active when toggle switch is ON) */}
      {isDeptDispatchEnabled && (
        <div className="dept-dispatch-panel">
          <div className="dept-dispatch-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--primary-accent)' }} />
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Department Email Campaign Controls</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Dispatch phishing simulation emails to all members within a designated department at once.
                </div>
              </div>
            </div>
            <span className="badge badge-accent">
              {deptPendingTargets.length} Targets Ready
            </span>
          </div>

          <div className="dept-dispatch-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Select Department:
              </label>
              <select 
                value={deptDispatchTarget}
                onChange={(e) => setDeptDispatchTarget(e.target.value)}
                className="filter-select"
                style={{ minWidth: '160px' }}
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <button 
                disabled={deptPendingTargets.length === 0}
                onClick={() => {
                  if (onSendDepartmentEmails) {
                    onSendDepartmentEmails(deptDispatchTarget);
                  }
                }}
                className="btn btn-accent"
                style={{
                  opacity: deptPendingTargets.length === 0 ? 0.5 : 1,
                  cursor: deptPendingTargets.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <Zap size={14} /> Send Simulation Emails to All {deptDispatchTarget === 'All' ? 'Department' : deptDispatchTarget} Members ({deptPendingTargets.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Filter Scope:</span>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipient Table */}
      <div className="table-wrapper">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Recipient Details</th>
              <th>Department</th>
              <th>Simulated Status</th>
              <th>Simulation Controls</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No target records found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  {/* Name and Email */}
                  <td>
                    <div className="emp-name-cell">
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{emp.name}</span>
                      <span className="emp-email">{emp.email}</span>
                    </div>
                  </td>
                  
                  {/* Department */}
                  <td>
                    <span className="department-badge">{emp.department}</span>
                  </td>
                  
                  {/* Status Badge */}
                  <td>
                    {renderStatusBadge(emp.status)}
                  </td>
                  
                  {/* Simulation dispatch */}
                  <td>
                    <div className="sim-actions">
                      {emp.status === 'Pending' ? (
                        <button 
                          onClick={() => onUpdateStatus(emp.id, 'Sent')}
                          className="sim-btn sent"
                          title="Dispatch phishing email to employee"
                        >
                          <Send size={12} style={{ marginRight: '4px', display: 'inline' }} /> Send Phishing Email
                        </button>
                      ) : (
                        <button 
                          onClick={() => onUpdateStatus(emp.id, 'Pending')}
                          className="sim-btn"
                          style={{ borderColor: 'var(--border)' }}
                          title="Reset status back to Pending"
                        >
                          <RefreshCw size={11} style={{ marginRight: '4px', display: 'inline' }} /> Reset
                        </button>
                      )}
                      
                      {['Clicked', 'Compromised'].includes(emp.status) && (
                        <span style={{ fontSize: '11px', color: 'var(--danger-accent)', alignSelf: 'center', fontWeight: '500' }}>
                          ⚠️ Vulnerable Target
                        </span>
                      )}
                      
                      {emp.status === 'Training Sent' && (
                        <span style={{ fontSize: '11px', color: 'var(--text-accent)', alignSelf: 'center', fontWeight: '500' }}>
                          📬 Invite Dispatched
                        </span>
                      )}

                      {emp.status === 'Training Attended' && (
                        <span style={{ fontSize: '11px', color: 'var(--success-accent)', alignSelf: 'center', fontWeight: '500' }}>
                          ✅ Training Attended
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Edit/Delete Table Actions */}
                  <td>
                    <div className="cell-actions">
                      <button 
                        onClick={() => handleOpenEdit(emp)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        title="Edit details"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => onDeleteEmployee(emp.id)}
                        className="btn btn-danger-outline btn-sm"
                        style={{ padding: '6px 10px' }}
                        title="Delete employee"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === 'add' ? 'Add New Simulation Target' : 'Edit Target Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {formError && (
                <div style={{ color: 'var(--danger-accent)', fontSize: '13px', marginBottom: '16px' }}>
                  {formError}
                </div>
              )}
              
              {/* Name field */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              {/* Email field */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="form-input"
                  placeholder="e.g. j.doe@company.com"
                  required
                />
              </div>

              {/* Department field */}
              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="form-select"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Footer buttons */}
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Save Target' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
