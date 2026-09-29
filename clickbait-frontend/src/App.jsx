import React, { useEffect, useState, useCallback, useRef } from 'react';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmployeeDirectory from './components/EmployeeDirectory';
import TrainingPortal from './components/TrainingPortal';
import AuthPage from './components/AuthPage';

import { getEmployees } from './api/employeeApi';

import './App.css';

const DEMO_LOGS = [
  {
    time: '09:12:04',
    text: 'System initialized.'
  },
  {
    time: '09:30:15',
    text: 'Demo security activity loaded.'
  }
];

// How often to re-fetch employees to pick up link clicks that happen
// outside the app (someone opening the email later and clicking).
const POLL_INTERVAL_MS = 5000;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError, setEmployeeError] = useState('');

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('phishguard_user');

    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('phishguard_user');
      return null;
    }
  });

  const [logs] = useState(DEMO_LOGS);

  // Ref so the polling interval always calls the latest version of
  // refreshEmployees without needing to reset the interval on every render.
  const refreshEmployeesRef = useRef();

  const refreshEmployees = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingEmployees(true);
    setEmployeeError('');

    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Employee loading error:', error);
      // Don't blow away existing data or show an error banner for a
      // background poll failure — only surface it on the initial load.
      if (!silent) {
        setEmployeeError('Unable to load employees from the database.');
        setEmployees([]);
      }
    } finally {
      if (!silent) setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    refreshEmployeesRef.current = refreshEmployees;
  }, [refreshEmployees]);

  // Initial load
  useEffect(() => {
    if (!user) return;
    refreshEmployees();
  }, [user, refreshEmployees]);

  // Poll in the background so clicked-link status shows up without
  // needing a manual refresh.
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshEmployeesRef.current?.({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user]);

  const handleAuthenticated = (admin) => {
    setUser(admin);

    localStorage.setItem(
      'phishguard_user',
      JSON.stringify(admin)
    );
  };

  const handleLogout = () => {
    setUser(null);
    setEmployees([]);

    localStorage.removeItem('phishguard_user');
  };

  // Login page
  if (!user) {
    return (
      <AuthPage
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  return (
    <div className="app-container">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        employees={employees}
      />

      <div className="main-workspace">

        {/* Header */}
        <header className="workspace-header">

          <div>
            <h1 className="workspace-title">

              {activeTab === 'dashboard' &&
                'SECURITY DASHBOARD'}

              {activeTab === 'directory' &&
                'EMPLOYEE DIRECTORY'}

              {activeTab === 'training' &&
                'CYBER TRAINING PORTAL'}

            </h1>

            <div className="workspace-subtitle">

              {activeTab === 'dashboard' &&
                'Security awareness metrics and activity overview'}

              {activeTab === 'directory' &&
                'Employee information and phishing simulation controls'}

              {activeTab === 'training' &&
                'Training invitations and completion status'}

            </div>
          </div>

          {/* Logged-in admin */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >

            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}
            >
              {user.email}
            </span>

            <button
              onClick={handleLogout}
              className="btn btn-danger-outline btn-sm"
            >
              Logout
            </button>

          </div>

        </header>

        {/* Database error */}
        {employeeError && (
          <div
            style={{
              margin: '16px 0',
              padding: '12px 16px',
              borderRadius: '6px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca'
            }}
          >
            {employeeError}
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <Dashboard
            employees={employees}
          />
        )}

        {/* Employee Directory */}
        {activeTab === 'directory' && (
          <EmployeeDirectory
            employees={employees}
            loading={loadingEmployees}
            onSimulationSent={() => refreshEmployees({ silent: true })}
          />
        )}

        {/* Training */}
        {activeTab === 'training' && (
          <TrainingPortal
            employees={employees}
            logs={logs}
          />
        )}

      </div>
    </div>
  );
}

export default App;