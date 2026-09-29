import React, { useState, useEffect } from 'react';
import {
  Search,
  Send,
  MousePointer,
  ShieldAlert,
  X
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function EmployeeDirectory({
  employees = [],
  loading = false,
  onSimulationSent
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const [sendMode, setSendMode] = useState('individual');
  const [sendEmployeeId, setSendEmployeeId] = useState('');
  const [sendDepartment, setSendDepartment] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Email templates, fetched from the backend
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState(null);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);

  useEffect(() => {
    if (!isSendModalOpen) return;

    setTemplatesLoading(true);
    setTemplatesError(null);

    fetch(`${API_BASE}/templates`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load templates');
        return res.json();
      })
      .then((data) => setTemplates(data))
      .catch((err) => setTemplatesError(err.message))
      .finally(() => setTemplatesLoading(false));
  }, [isSendModalOpen]);

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
    setSendError(null);
    setSendSuccess(null);
  };

  const handleSendSimulation = async (e) => {
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

    setSending(true);
    setSendError(null);
    setSendSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/send-simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send simulation');
      }

      setSendSuccess(data.message);

      // pull the just-sent employee's status into the parent's
      // employees list right away, instead of waiting for the next poll
      onSimulationSent?.();

      // brief pause so the user sees the confirmation before the modal closes
      setTimeout(() => {
        closeSendModal();
      }, 1200);

    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
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
                  disabled={templatesLoading}
                >
                  <option value="">
                    {templatesLoading
                      ? 'Loading templates...'
                      : 'Select email template'}
                  </option>

                  {templates.map(
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

                {templatesError && (
                  <small
                    style={{
                      color: 'var(--status-danger, #e5484d)',
                      display: 'block',
                      marginTop: '6px'
                    }}
                  >
                    Couldn't load templates: {templatesError}
                  </small>
                )}

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

              {/* Send status */}
              {sendError && (
                <div
                  style={{
                    padding: '10px 12px',
                    marginBottom: '12px',
                    background: 'rgba(229, 72, 77, 0.1)',
                    border: '1px solid var(--status-danger, #e5484d)',
                    borderRadius: '6px',
                    color: 'var(--status-danger, #e5484d)',
                    fontSize: '13px'
                  }}
                >
                  {sendError}
                </div>
              )}

              {sendSuccess && (
                <div
                  style={{
                    padding: '10px 12px',
                    marginBottom: '12px',
                    background: 'rgba(46, 125, 50, 0.1)',
                    border: '1px solid #2e7d32',
                    borderRadius: '6px',
                    color: '#2e7d32',
                    fontSize: '13px'
                  }}
                >
                  {sendSuccess}
                </div>
              )}

              {/* Footer */}
              <div className="modal-footer">

                <button
                  type="button"
                  onClick={closeSendModal}
                  className="btn btn-secondary"
                  disabled={sending}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || templatesLoading}
                >
                  <Send size={14} />
                  {sending ? 'Sending...' : 'Send Simulation'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}