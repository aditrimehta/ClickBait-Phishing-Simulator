import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Send, MousePointer, ShieldAlert, RefreshCw, X, BookOpen } from 'lucide-react';

const DEPARTMENTS = ['HR', 'Tech', 'Sales', 'Marketing', 'Finance', 'IT', 'General'];

export default function EmployeeDirectory({ 
  employees = [], 
  onAddEmployee, 
  onEditEmployee, 
  onDeleteEmployee, 
  onUpdateStatus 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('General');
  const [formError, setFormError] = useState('');

  // 1. Filtered Employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    
    return matchesSearch && matchesDept;
  });

  // 2. Open Modal for Add
  const handleOpenAdd = () => {
    setModalMode('add');
    setCurrentEmployeeId(null);
    setFormName('');
    setFormEmail('');
    setFormDept('General');
    setFormError('');
    setIsModalOpen(true);
  };

  // 3. Open Modal for Edit
  const handleOpenEdit = (emp) => {
    setModalMode('edit');
    setCurrentEmployeeId(emp.id);
    setFormName(emp.name);
    setFormEmail(emp.email);
    setFormDept(emp.department);
    setFormError('');
    setIsModalOpen(true);
  };

  // 4. Form Submit Handler
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
          <span className="status-badge" style={{ background: '#18181b', border: '1px solid #2e2e33', color: '#71717a' }}>
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="directory-section">
      {/* Search and Filters Header */}
      <div className="directory-header">
        <h2 style={{ fontFamily: 'Share Tech Mono', color: '#00ff00', margin: 0, textShadow: '0 0 8px rgba(0,255,0,0.2)' }}>
          RECIPIENT LOGS
        </h2>
        
        <div className="directory-actions">
          {/* Search bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: '#71717a' }} />
            <input 
              type="text" 
              placeholder="Search by name/email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Department filter */}
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

          {/* Add Employee Button */}
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add Target
          </button>
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
              <th>Test Actions</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#71717a', fontFamily: 'Share Tech Mono' }}>
                  NO RECORD FOUND
                </td>
              </tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  {/* Name and Email */}
                  <td>
                    <div className="emp-name-cell">
                      <span style={{ fontWeight: '500' }}>{emp.name}</span>
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
                          title="Send phishing simulation email"
                        >
                          <Send size={11} style={{ marginRight: '4px', display: 'inline' }} /> Send Phishing Email
                        </button>
                      ) : (
                        <button 
                          onClick={() => onUpdateStatus(emp.id, 'Pending')}
                          className="sim-btn"
                          style={{ borderColor: 'rgba(113, 113, 122, 0.3)' }}
                          title="Reset status back to Pending"
                        >
                          <RefreshCw size={11} style={{ marginRight: '4px', display: 'inline' }} /> Reset
                        </button>
                      )}
                      
                      {['Clicked', 'Compromised'].includes(emp.status) && (
                        <span style={{ fontSize: '11px', color: '#ef4444', fontFamily: 'Share Tech Mono', alignSelf: 'center' }}>
                          ⚠️ Vulnerable!
                        </span>
                      )}
                      
                      {emp.status === 'Training Sent' && (
                        <span style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'Share Tech Mono', alignSelf: 'center' }}>
                          📬 Invite Dispatched
                        </span>
                      )}

                      {emp.status === 'Training Attended' && (
                        <span style={{ fontSize: '11px', color: '#00ff00', fontFamily: 'Share Tech Mono', alignSelf: 'center' }}>
                          ✅ Attended Training
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
                        style={{ padding: '6px' }}
                        title="Edit details"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => onDeleteEmployee(emp.id)}
                        className="btn btn-danger-outline btn-sm"
                        style={{ padding: '6px' }}
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
                {modalMode === 'add' ? 'INITIALIZE NEW TARGET' : 'EDIT TARGET PROFILE'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {formError && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', fontFamily: 'Share Tech Mono' }}>
                  [ERROR]: {formError}
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
                  placeholder="e.g. John Doe"
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
                  {modalMode === 'add' ? 'Register' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
