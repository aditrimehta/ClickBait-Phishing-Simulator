import React, { useState } from 'react';
import {
  Search,
  Send,
  MousePointer,
  ShieldAlert,
  X
} from 'lucide-react';

const DEMO_TEMPLATES = [
  {
    id: 'password-reset',
    name: 'Password Reset'
  },
  {
    id: 'invoice',
    name: 'Invoice Notification'
  },
  {
    id: 'security-alert',
    name: 'Security Alert'
  }
];

export default function EmployeeDirectory({
  employees = [],
  loading = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const [sendMode, setSendMode] = useState('individual');
  const [sendEmployeeId, setSendEmployeeId] = useState('');
  const [sendDepartment, setSendDepartment] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Get departments from database employees
  const departments = [
    ...new Set(
      employees
        .map((employee) => employee.department)
        .filter(Boolean)
    )
  ].sort();

  // Search and department filter
  const filteredEmployees = employees.filter((emp) => {
    const search = searchQuery.toLowerCase();

    const employeeNumber = String(
      emp.employee_number ?? ''
    );

    const matchesSearch =
  emp.name?.toLowerCase().includes(search) ||
  emp.email?.toLowerCase().includes(search) ||
  emp.employee_number?.includes(search);
  
    const matchesDept =
      selectedDept === 'All' ||
      emp.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const openSendModal = () => {
    setSendMode('individual');
    setSendEmployeeId('');
    setSendDepartment('');
    setSelectedTemplate('');
    setIsSendModalOpen(true);
  };

  const closeSendModal = () => {
    setIsSendModalOpen(false);
  };

  const handleSendSimulation = (e) => {
    e.preventDefault();

    if (!selectedTemplate) return;

    if (
      sendMode === 'individual' &&
      !sendEmployeeId
    ) {
      return;
    }

    if (
      sendMode === 'department' &&
      !sendDepartment
    ) {
      return;
    }

    /*
      Backend connection will be added here.

      Individual:
      {
        type: 'individual',
        employee_number: sendEmployeeId,
        template_id: selectedTemplate
      }

      Department:
      {
        type: 'department',
        department: sendDepartment,
        template_id: selectedTemplate
      }
    */

    console.log('Simulation request:', {
      type: sendMode,
      employee_number:
        sendMode === 'individual'
          ? sendEmployeeId
          : null,
      department:
        sendMode === 'department'
          ? sendDepartment
          : null,
      template_id: selectedTemplate
    });

    closeSendModal();
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Sent':
        return (
          <span className="status-badge sent">
            <Send size={12} />
            SENT
          </span>
        );

      case 'Clicked':
        return (
          <span className="status-badge clicked">
            <MousePointer size={12} />
            CLICKED LINK
          </span>
        );

      case 'Compromised':
        return (
          <span className="status-badge compromised">
            <ShieldAlert size={12} />
            COMPROMISED
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
          <span className="status-badge">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="directory-section">

      {/* Header */}
      <div className="directory-header">

        <h2 style={{ margin: 0 }}>
          EMPLOYEE DIRECTORY
        </h2>

        <div className="directory-actions">

          {/* Search */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-muted)'
              }}
            />

            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="search-input"
              style={{
                paddingLeft: '36px'
              }}
            />
          </div>

          {/* Department filter */}
          <select
            value={selectedDept}
            onChange={(e) =>
              setSelectedDept(e.target.value)
            }
            className="filter-select"
          >
            <option value="All">
              All Departments
            </option>

            {departments.map((dept) => (
              <option
                key={dept}
                value={dept}
              >
                {dept}
              </option>
            ))}
          </select>

          {/* Send Simulation */}
          <button
            onClick={openSendModal}
            className="btn btn-primary"
          >
            <Send size={16} />
            Send Simulation
          </button>

        </div>
      </div>

      {/* Employee table */}
      <div className="table-wrapper">

        <table className="employee-table">

          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--text-muted)'
                  }}
                >
                  LOADING EMPLOYEES...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--text-muted)'
                  }}
                >
                  NO EMPLOYEES FOUND
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>

                  {/* Employee */}
                  <td>
                    <div className="emp-name-cell">

                      <span
                        style={{
                          fontWeight: '500'
                        }}
                      >
                        {emp.name}
                      </span>

                      <span className="emp-email">
                        {emp.email}
                      </span>

                    </div>
                  </td>

                  {/* Short Employee ID */}
                  <td>
                    {emp.employee_number || '—'}
                  </td>

                  {/* Department */}
                  <td>
                    <span className="department-badge">
                      {emp.department}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    {renderStatusBadge(emp.status)}
                  </td>

                </tr>
              ))
            )}

          </tbody>
        </table>

      </div>

      {/* Send Simulation Modal */}
      {isSendModalOpen && (
        <div className="modal-overlay">

          <div className="modal-content">

            <div className="modal-header">

              <h3 className="modal-title">
                SEND SIMULATION
              </h3>

              <button
                onClick={closeSendModal}
                className="modal-close"
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleSendSimulation}>

              {/* Send To */}
              <div className="form-group">

                <label className="form-label">
                  Send To
                </label>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px'
                  }}
                >

                  <button
                    type="button"
                    className={
                      sendMode === 'individual'
                        ? 'btn btn-primary'
                        : 'btn btn-secondary'
                    }
                    onClick={() =>
                      setSendMode('individual')
                    }
                  >
                    Individual
                  </button>

                  <button
                    type="button"
                    className={
                      sendMode === 'department'
                        ? 'btn btn-primary'
                        : 'btn btn-secondary'
                    }
                    onClick={() =>
                      setSendMode('department')
                    }
                  >
                    Entire Department
                  </button>

                </div>
              </div>

              {/* Individual */}
              {sendMode === 'individual' && (
                <div className="form-group">

                  <label className="form-label">
                    Employee ID
                  </label>

                  <input
                    type="text"
                    value={sendEmployeeId}
                    onChange={(e) =>
                      setSendEmployeeId(
                        e.target.value
                      )
                    }
                    className="form-input"
                    placeholder="e.g. 001"
                    required
                  />

                  <small
                    style={{
                      color: 'var(--text-muted)',
                      display: 'block',
                      marginTop: '6px'
                    }}
                  >
                    Enter the employee ID shown in
                    the directory.
                  </small>

                </div>
              )}

              {/* Department */}
              {sendMode === 'department' && (
                <div className="form-group">

                  <label className="form-label">
                    Department
                  </label>

                  <select
                    value={sendDepartment}
                    onChange={(e) =>
                      setSendDepartment(
                        e.target.value
                      )
                    }
                    className="form-select"
                    required
                  >
                    <option value="">
                      Select department
                    </option>

                    {departments.map((dept) => (
                      <option
                        key={dept}
                        value={dept}
                      >
                        {dept}
                      </option>
                    ))}
                  </select>

                </div>
              )}

              {/* Email Template */}
              <div className="form-group">

                <label className="form-label">
                  Email Template
                </label>

                <select
                  value={selectedTemplate}
                  onChange={(e) =>
                    setSelectedTemplate(
                      e.target.value
                    )
                  }
                  className="form-select"
                  required
                >
                  <option value="">
                    Select email template
                  </option>

                  {DEMO_TEMPLATES.map(
                    (template) => (
                      <option
                        key={template.id}
                        value={template.id}
                      >
                        {template.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* Automatic timestamp */}
              <div
                style={{
                  padding: '12px',
                  marginBottom: '16px',
                  background:
                    'var(--bg-darker)',
                  borderRadius: '6px',
                  color:
                    'var(--text-secondary)',
                  fontSize: '13px'
                }}
              >
                The send date and time will be
                recorded automatically when the
                simulation is dispatched.
              </div>

              {/* Footer */}
              <div className="modal-footer">

                <button
                  type="button"
                  onClick={closeSendModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Send size={14} />
                  Send Simulation
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}