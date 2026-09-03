import React, { useState } from 'react';
import { Terminal, Lock, Mail, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!form.email.trim() || !form.email.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (!form.password || form.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (mode === 'signup') {
      if (!form.name.trim()) return 'Full name is required';
      if (form.password !== form.confirmPassword) return 'Passwords do not match';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    // Simulate an auth request — swap this for your real API/auth call
    setTimeout(() => {
      setLoading(false);
      onAuthenticated({
        name: mode === 'signup' ? form.name : form.email.split('@')[0],
        email: form.email
      });
    }, 700);
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'signup' : 'login'));
    setError('');
    setForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="auth-page">
      <div className="auth-grid-overlay" />

      <div className="auth-card">
        {/* Brand header */}
        <div className="auth-brand">
          <Terminal size={26} className="auth-brand-icon" />
          <span className="auth-brand-text">PHISHGUARD</span>
        </div>
        <div className="auth-sub-brand">ADMIN CONSOLE ACCESS</div>

        <div className="auth-divider" />

        <h2 className="auth-title">
          {mode === 'login' ? '[ AUTHENTICATE ]' : '[ REGISTER ADMIN ]'}
        </h2>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Enter credentials to access the security console'
            : 'Create a new administrator account'}
        </p>

        {error && (
          <div className="auth-error-box">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={15} className="auth-input-icon" />
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="e.g. Alice Vance"
                  className="auth-input"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={15} className="auth-input-icon" />
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="admin@securecorp.net"
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={15} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                className="auth-input with-toggle"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="auth-eye-toggle"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="••••••••"
                  className="auth-input"
                />
              </div>
            </div>
          )}

          

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              'AUTHENTICATING...'
            ) : (
              <>
                <ShieldCheck size={16} />
                {mode === 'login' ? 'ENTER CONSOLE' : 'CREATE ACCOUNT'}
              </>
            )}
          </button>
        </form>

        <div className="auth-switch-row">
          {mode === 'login' ? (
            <>No admin account? <button type="button" className="auth-link" onClick={toggleMode}>Register one</button></>
          ) : (
            <>Already registered? <button type="button" className="auth-link" onClick={toggleMode}>Sign in</button></>
          )}
        </div>
      </div>

      <div className="auth-footer-status">
        <span className="sidebar-status-dot" />
        CONSOLE_SECURE_SSL
      </div>
    </div>
  );
}