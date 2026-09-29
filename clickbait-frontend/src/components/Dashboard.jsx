import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Mail, MousePointer, BookOpen, Activity, Briefcase } from 'lucide-react';

export default function Dashboard({ employees = [] }) {
  const totalEmployees = employees.length;
  
  const sentEmployees = employees.filter(e => e.status !== 'Pending');
  const clickedEmployees = employees.filter(e => e.phishOutcome === 'Clicked' || e.phishOutcome === 'Compromised');
  const compromisedEmployees = employees.filter(e => e.phishOutcome === 'Compromised');
  const trainedEmployees = employees.filter(e => e.status === 'Training Attended');

  const totalSent = sentEmployees.length;
  const totalClicked = clickedEmployees.length;
  const totalCompromised = compromisedEmployees.length;
  const totalTrained = trainedEmployees.length;

  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';
  const trainingRate = totalClicked > 0 ? ((totalTrained / totalClicked) * 100).toFixed(1) : '0.0';

  // 1. Data for Conversion Funnel Chart (Sent -> Clicked -> Compromised)
  const funnelData = [
    { name: 'Emails Dispatched', count: totalSent },
    { name: 'Links Clicked', count: totalClicked },
    { name: 'Credentials Submitted', count: totalCompromised }
  ];

  // 2. Data for Department Breakdown (Vulnerable counts)
  const departments = ['HR', 'Tech', 'Sales', 'Marketing', 'Finance', 'IT', 'General'];
  const departmentDataMap = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const vulnerableCount = deptEmployees.filter(e => e.phishOutcome !== null).length;
    return { name: dept, value: vulnerableCount };
  }).filter(item => item.value > 0);

  const departmentData = departmentDataMap.length > 0 ? departmentDataMap : [
    { name: 'All Secure', value: 1 }
  ];

  // Formal office color palette for departments
  const DEPT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#64748b'];

  // 3. Area trend chart data
  const trendData = [
    { time: '09:00', sent: Math.round(totalSent * 0.1), clicked: Math.round(totalClicked * 0.0), compromised: Math.round(totalCompromised * 0.0) },
    { time: '10:00', sent: Math.round(totalSent * 0.3), clicked: Math.round(totalClicked * 0.2), compromised: Math.round(totalCompromised * 0.1) },
    { time: '11:00', sent: Math.round(totalSent * 0.5), clicked: Math.round(totalClicked * 0.4), compromised: Math.round(totalCompromised * 0.3) },
    { time: '12:00', sent: Math.round(totalSent * 0.7), clicked: Math.round(totalClicked * 0.6), compromised: Math.round(totalCompromised * 0.5) },
    { time: '13:00', sent: Math.round(totalSent * 0.8), clicked: Math.round(totalClicked * 0.8), compromised: Math.round(totalCompromised * 0.7) },
    { time: '14:00', sent: totalSent, clicked: totalClicked, compromised: totalCompromised },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label" style={{ color: 'var(--primary-accent)', fontWeight: '600', marginBottom: '4px' }}>{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.color || p.fill || '#fff', fontSize: '12px' }}>
              {`${p.name}: ${p.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 3 Executive KPI cards */}
      <div className="dashboard-grid">
        <div className="kpi-card sent">
          <div className="kpi-header">
            <span className="kpi-title">Simulations Sent</span>
            <Mail className="kpi-icon" size={20} />
          </div>
          <div className="kpi-value">{totalSent}</div>
          <div className="kpi-subtext">
            <span>Out of {totalEmployees} registered employees</span>
          </div>
        </div>

        <div className="kpi-card clicked">
          <div className="kpi-header">
            <span className="kpi-title">Vulnerable Clickers</span>
            <MousePointer className="kpi-icon" size={20} style={{ color: 'var(--danger-accent)' }} />
          </div>
          <div className="kpi-value" style={{ color: totalClicked > 0 ? 'var(--danger-accent)' : 'inherit' }}>
            {totalClicked}
          </div>
          <div className="kpi-subtext">
            <span style={{ color: totalClicked > 0 ? 'var(--danger-accent)' : 'inherit', fontWeight: '500' }}>
              {clickRate}% Click-Through Rate
            </span>
          </div>
        </div>

        <div className="kpi-card training">
          <div className="kpi-header">
            <span className="kpi-title">Training Completed</span>
            <BookOpen className="kpi-icon" size={20} style={{ color: 'var(--success-accent)' }} />
          </div>
          <div className="kpi-value" style={{ color: 'var(--success-accent)' }}>
            {totalTrained}
          </div>
          <div className="kpi-subtext">
            <span style={{ color: 'var(--success-accent)', fontWeight: '500' }}>
              {trainingRate}% Remediation Rate
            </span>
            <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
              (of phished users)
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="charts-grid">
        {/* Funnel */}
        <div className="chart-card">
          <h3 className="chart-title">
            <Activity size={18} /> Phishing Conversion Funnel
          </h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                >
                  {funnelData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Credentials Submitted' ? '#ef4444' : entry.name === 'Links Clicked' ? '#f59e0b' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department donut */}
        <div className="chart-card">
          <h3 className="chart-title">
            <Briefcase size={18} /> Vulnerability by Department
          </h3>
          <div className="chart-wrapper">
            {departmentDataMap.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
                <Briefcase size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <p style={{ fontSize: '13px' }}>No vulnerabilities detected yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <foreignObject x="0" y="0" width="100%" height="30">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '11px' }}>
                      {departmentData.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: DEPT_COLORS[index % DEPT_COLORS.length], borderRadius: '50%' }}></span>
                          <span style={{ color: 'var(--text-secondary)' }}>{entry.name}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </foreignObject>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Trend Area Chart */}
      <div className="chart-card">
        <h3 className="chart-title">
          <Activity size={18} /> Simulation Timeline Trend
        </h3>
        <div className="chart-wrapper" style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sent" name="Dispatched" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
              <Area type="monotone" dataKey="clicked" name="Vulnerable (Clicks)" stroke="#ef4444" fillOpacity={1} fill="url(#colorClicked)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
