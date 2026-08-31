import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmployeeDirectory from './components/EmployeeDirectory';
import TrainingPortal from './components/TrainingPortal';
import { RefreshCw } from 'lucide-react';
import './App.css';

// Initial employees representing different stages of the awareness campaign
const DEFAULT_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'Alice Vance',
    email: 'alice.vance@securecorp.net',
    department: 'IT',
    status: 'Training Attended', // Completed training
    phishOutcome: 'Compromised' // Fell for credentials harvesting
  },
  {
    id: 'emp-2',
    name: 'Bob Miller',
    email: 'bob.miller@securecorp.net',
    department: 'HR',
    status: 'Training Sent', // Invited to training, currently attending
    phishOutcome: 'Clicked' // Clicked phishing link
  },
  {
    id: 'emp-3',
    name: 'Charlie Smith',
    email: 'charlie.smith@securecorp.net',
    department: 'Sales',
    status: 'Clicked', // Awaiting training invite
    phishOutcome: 'Clicked' // Clicked phishing link
  },
  {
    id: 'emp-4',
    name: 'Diana Prince',
    email: 'diana.prince@securecorp.net',
    department: 'Tech',
    status: 'Pending', // Fresh target
    phishOutcome: null
  }
];

const INITIAL_LOGS = [
  { time: '09:12:04', text: 'System initialized. 4 targets monitored.' },
  { time: '09:30:15', text: 'Alice Vance (IT) submitted credentials to sus-domain.' },
  { time: '09:35:44', text: 'Bob Miller (HR) clicked on simulation link.' },
  { time: '10:02:11', text: 'Charlie Smith (Sales) clicked on simulation link.' },
  { time: '10:15:00', text: 'Sent training invitation to Bob Miller (HR).' },
  { time: '10:45:22', text: 'Alice Vance (IT) completed security awareness training.' }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('phishguard_employees');
    return saved ? JSON.parse(saved) : DEFAULT_EMPLOYEES;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('phishguard_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('phishguard_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('phishguard_logs', JSON.stringify(logs));
  }, [logs]);

  // Helper to add logs with timestamps
  const addLog = (text) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0]; // HH:MM:SS
    setLogs(prev => [{ time: timestamp, text }, ...prev].slice(0, 50)); // Limit to last 50 logs
  };

  // 1. Add employee handler
  const handleAddEmployee = (newEmp) => {
    const employee = {
      id: `emp-${Date.now()}`,
      name: newEmp.name,
      email: newEmp.email,
      department: newEmp.department,
      status: 'Pending',
      phishOutcome: null
    };
    setEmployees(prev => [...prev, employee]);
    addLog(`Target registered: ${newEmp.name} [Dept: ${newEmp.department}]`);
  };

  // 2. Edit employee handler
  const handleEditEmployee = (id, updatedEmp) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id 
        ? { ...emp, name: updatedEmp.name, email: updatedEmp.email, department: updatedEmp.department }
        : emp
    ));
    addLog(`Modified target profile: ${updatedEmp.name}`);
  };

  // 3. Delete employee handler
  const handleDeleteEmployee = (id) => {
    const emp = employees.find(e => e.id === id);
    if (emp && window.confirm(`Remove ${emp.name} from monitoring scope?`)) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      addLog(`De-registered target: ${emp.name}`);
    }
  };

  // 4. Trigger simulation update (automated phishing & training attendance)
  const handleUpdateStatus = (id, newStatus) => {
    // 4.1 Reset to Pending
    if (newStatus === 'Pending') {
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, status: 'Pending', phishOutcome: null } : emp
      ));
      const target = employees.find(e => e.id === id);
      addLog(`Reset test status for ${target?.name}`);
      return;
    }

    // 4.2 Start automated phishing simulation when set to 'Sent'
    if (newStatus === 'Sent') {
      // First update status to Sent
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, status: 'Sent', phishOutcome: null } : emp
      ));
      
      const target = employees.find(e => e.id === id);
      addLog(`Phishing email dispatched to ${target?.name} (${target?.email})`);

      // Run simulation timer (1.5 seconds delay)
      setTimeout(() => {
        setEmployees(currentEmployees => {
          const currentTarget = currentEmployees.find(e => e.id === id);
          // If state was reset during delay, cancel transition
          if (!currentTarget || currentTarget.status !== 'Sent') return currentEmployees;

          // Susceptibility rates based on departments
          // Returns: 'Ignored', 'Clicked', 'Compromised'
          const roll = Math.random() * 100;
          let outcome = 'Ignored';
          
          const dept = currentTarget.department;
          if (dept === 'IT') {
            if (roll < 10) outcome = 'Compromised';
            else if (roll < 25) outcome = 'Clicked';
          } else if (dept === 'Tech') {
            if (roll < 15) outcome = 'Compromised';
            else if (roll < 35) outcome = 'Clicked';
          } else if (['Sales', 'Marketing'].includes(dept)) {
            if (roll < 45) outcome = 'Compromised';
            else if (roll < 75) outcome = 'Clicked';
          } else if (['HR', 'Finance'].includes(dept)) {
            if (roll < 30) outcome = 'Compromised';
            else if (roll < 60) outcome = 'Clicked';
          } else { // General
            if (roll < 20) outcome = 'Compromised';
            else if (roll < 45) outcome = 'Clicked';
          }

          let finalStatus = 'Sent';
          let phishOutcome = null;

          if (outcome === 'Clicked') {
            finalStatus = 'Clicked';
            phishOutcome = 'Clicked';
            addLog(`⚠️ Link opened: ${currentTarget.name} (${currentTarget.department}) fell for the phishing link!`);
          } else if (outcome === 'Compromised') {
            finalStatus = 'Compromised';
            phishOutcome = 'Compromised';
            addLog(`🚨 CREDENTIALS HARVESTED: ${currentTarget.name} (${currentTarget.department}) submitted sensitive passwords!`);
          } else {
            addLog(`✅ Secure response: ${currentTarget.name} (${currentTarget.department}) ignored / reported simulation email.`);
          }

          return currentEmployees.map(e => 
            e.id === id ? { ...e, status: finalStatus, phishOutcome } : e
          );
        });
      }, 1500);
    }
  };

  // 5. Send training email invite (individual)
  const handleSendTrainingInvite = (id) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, status: 'Training Sent' } : emp
    ));
    
    const target = employees.find(e => e.id === id);
    addLog(`📬 Dispatched training invite to clicker: ${target?.name}`);

    // Simulate completion after 2 seconds
    setTimeout(() => {
      setEmployees(currentEmployees => {
        const currentTarget = currentEmployees.find(e => e.id === id);
        if (!currentTarget || currentTarget.status !== 'Training Sent') return currentEmployees;
        
        addLog(`🎓 Training completed: ${currentTarget.name} finished awareness module.`);
        return currentEmployees.map(e => 
          e.id === id ? { ...e, status: 'Training Attended' } : e
        );
      });
    }, 2000);
  };

  // 6. Automate training email invites (all pending clickers)
  const handleSendAllTrainingInvites = () => {
    const clickers = employees.filter(e => ['Clicked', 'Compromised'].includes(e.status));
    
    if (clickers.length === 0) return;
    
    addLog(`⚡ Bulk Action: Dispatching training invitations to all (${clickers.length}) vulnerable targets...`);
    
    // Update all clickers to 'Training Sent'
    setEmployees(prev => prev.map(emp => 
      ['Clicked', 'Compromised'].includes(emp.status) 
        ? { ...emp, status: 'Training Sent' } 
        : emp
    ));

    // Simulate attendance for all of them after 2 seconds
    setTimeout(() => {
      setEmployees(currentEmployees => {
        const affectedTargets = currentEmployees.filter(e => e.status === 'Training Sent');
        affectedTargets.forEach(t => {
          addLog(`🎓 Training completed: ${t.name} finished awareness module.`);
        });
        
        return currentEmployees.map(e => 
          e.status === 'Training Sent' ? { ...e, status: 'Training Attended' } : e
        );
      });
    }, 2000);
  };

  // 7. Global Reset
  const handleResetAll = () => {
    if (window.confirm('Reset all recipient metrics and simulation history back to Pending?')) {
      setEmployees(prev => prev.map(emp => ({ ...emp, status: 'Pending', phishOutcome: null })));
      setLogs([{ time: new Date().toTimeString().split(' ')[0], text: 'System metrics database cleared.' }]);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        employees={employees} 
      />

      {/* Main Workspace Frame */}
      <div className="main-workspace">
        
        {/* Active Page Header */}
        <header className="workspace-header">
          <div>
            <h1 className="workspace-title">
              {activeTab === 'dashboard' && 'SYSTEM SECURITY MONITOR'}
              {activeTab === 'directory' && 'TARGET REGISTER SCOPE'}
              {activeTab === 'training' && 'CYBER TRAINING PORTAL'}
            </h1>
            <div className="workspace-subtitle">
              {activeTab === 'dashboard' && 'Real-time telemetry and convertibility metrics'}
              {activeTab === 'directory' && 'Employee monitoring parameters and individual phishing simulation controls'}
              {activeTab === 'training' && 'Awaiting training invites, dispatches, and training completions'}
            </div>
          </div>
          
          <div>
            <button onClick={handleResetAll} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
              <RefreshCw size={12} style={{ marginRight: '4px', display: 'inline' }} /> Clear Simulation State
            </button>
          </div>
        </header>

        {/* Tab Switching Panel */}
        {activeTab === 'dashboard' && (
          <Dashboard employees={employees} />
        )}

        {activeTab === 'directory' && (
          <EmployeeDirectory 
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'training' && (
          <TrainingPortal 
            employees={employees}
            onSendTrainingInvite={handleSendTrainingInvite}
            onSendAllTrainingInvites={handleSendAllTrainingInvites}
            logs={logs}
          />
        )}

      </div>
    </div>
  );
}

export default App;
