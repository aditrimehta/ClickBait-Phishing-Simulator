import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Mail, MousePointer, ShieldAlert, BookOpen, Activity, Briefcase } from 'lucide-react';

export default function Dashboard({ employees = [] }) {
  const totalEmployees = employees.length;
  
  // Status definitions:
  // - status: 'Pending', 'Sent', 'Clicked', 'Compromised', 'Training Sent', 'Training Attended'
  // - phishOutcome: 'Clicked' or 'Compromised' or null
  
  const sentEmployees = employees.filter(e => e.status !== 'Pending');
  const clickedEmployees = employees.filter(e => e.phishOutcome === 'Clicked' || e.phishOutcome === 'Compromised');
  const compromisedEmployees = employees.filter(e => e.phishOutcome === 'Compromised');
  const trainedEmployees = employees.filter(e => e.status === 'Training Attended');

  const totalSent = sentEmployees.length;
  const totalClicked = clickedEmployees.length;
  const totalCompromised = compromisedEmployees.length;
  const totalTrained = trainedEmployees.length;

  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';
  const compromiseRate = totalSent > 0 ? ((totalCompromised / totalSent) * 100).toFixed(1) : '0.0';
  const trainingRate = totalClicked > 0 ? ((totalTrained / totalClicked) * 100).toFixed(1) : '0.0';

  // 1. Data for Conversion Funnel Chart (Sent -> Clicked -> Compromised)
  const funnelData = [
    { name: 'Emails Sent', count: totalSent },
    { name: 'Link Clicked', count: totalClicked },
    { name: 'Creds Entered', count: totalCompromised }
  ];

  // 2. Data for Department Breakdown (Vulnerable counts)
  const departments = ['HR', 'Tech', 'Sales', 'Marketing', 'Finance', 'IT', 'General'];
  const departmentDataMap = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const vulnerableCount = deptEmployees.filter(e => e.phishOutcome !== null).length;
    return { name: dept, value: vulnerableCount };
  }).filter(item => item.value > 0);

  const departmentData = departmentDataMap.length > 0 ? departmentDataMap : [
    { name: 'Secure', value: 1 }
  ];

  const DEPT_COLORS = ['#00ff00', '#00cc00', '#009900', '#006600', '#eab308', '#ef4444', '#3b82f6'];

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
          <p className="label" style={{ color: '#00ff00', fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
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
      
      {/* 3 KPI cards */}
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
            <span className="kpi-title">Fell for Phishing (Clicks)</span>
            <MousePointer className="kpi-icon" size={20} style={{ color: '#ef4444' }} />
          </div>
          <div className="kpi-value" style={{ color: totalClicked > 0 ? '#ef4444' : 'inherit' }}>
            {totalClicked}
          </div>
          <div className="kpi-subtext">
            <span style={{ color: totalClicked > 0 ? '#ef4444' : 'inherit' }}>
              {clickRate}% Link-Click Rate
            </span>
          </div>
        </div>

        <div className="kpi-card training">
          <div className="kpi-header">
            <span className="kpi-title">Attended Training</span>
            <BookOpen className="kpi-icon" size={20} style={{ color: '#00ff00' }} />
          </div>
          <div className="kpi-value neon">
            {totalTrained}
          </div>
          <div className="kpi-subtext">
            <span style={{ color: '#00ff00' }}>
              {trainingRate}% Training Rate
            </span>
            <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
              (out of clickers)
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#a1a1aa" 
                  fontSize={12} 
                  tickLine={false} 
                  fontFamily="Share Tech Mono"
                />
                <YAxis 
                  stroke="#a1a1aa" 
                  fontSize={12} 
                  tickLine={false} 
                  allowDecimals={false}
                  fontFamily="Share Tech Mono"
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                >
                  {funnelData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Creds Entered' ? '#ef4444' : entry.name === 'Link Clicked' ? '#ff3b3b' : '#00ff00'} 
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
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#71717a' }}>
                <Briefcase size={32} style={{ marginBottom: '10px', color: '#1f1f23' }} />
                <p style={{ fontSize: '13px', fontFamily: 'Share Tech Mono' }}>NO RECORDS REGISTERED YET</p>
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
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px', fontFamily: 'Share Tech Mono' }}>
                      {departmentData.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: DEPT_COLORS[index % DEPT_COLORS.length], borderRadius: '50%' }}></span>
                          <span style={{ color: '#a1a1aa' }}>{entry.name}: {entry.value}</span>
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
          <Activity size={18} /> Phishing Timeline Trend
        </h3>
        <div className="chart-wrapper" style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff00" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#00ff00" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
              <XAxis dataKey="time" stroke="#a1a1aa" fontSize={11} tickLine={false} fontFamily="Share Tech Mono" />
              <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} allowDecimals={false} fontFamily="Share Tech Mono" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sent" name="Sent" stroke="#00ff00" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
              <Area type="monotone" dataKey="clicked" name="Clicked/Creds" stroke="#ef4444" fillOpacity={1} fill="url(#colorClicked)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
