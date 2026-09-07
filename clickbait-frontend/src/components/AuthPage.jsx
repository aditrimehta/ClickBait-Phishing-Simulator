
import React, { useState } from 'react';
import {
  Terminal,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

export default function AuthPage({ onAuthenticated }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    if (error) setError('');
  };

  const validate = () => {
    if (!form.email.trim() || !form.email.includes('@')) {
      return 'Please enter a valid email address';
    }

    if (!form.password) {
      return 'Password is required';
    }

    return '';
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const validationError = validate();

  if (validationError) {
    setError(validationError);
    return;
  }

  setLoading(true);
  setError('');

  try {
    const response = await fetch(
      'http://127.0.0.1:8000/admin/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    // Login successful
    onAuthenticated(data.admin);

  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-grid-overlay" />

      <div className="auth-card">

        {/* Brand header */}
        <div className="auth-brand">
          <Terminal size={26} className="auth-brand-icon" />
          <span className="auth-brand-text">
            PHISHGUARD
          </span>
        </div>

        <div className="auth-sub-brand">
          ADMIN CONSOLE ACCESS
        </div>

        <div className="auth-divider" />

        <h2 className="auth-title">
          [ AUTHENTICATE ]
        </h2>

        <p className="auth-subtitle">
          Enter credentials to access the security console
        </p>

        {error && (
          <div className="auth-error-box">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>

            <div className="auth-input-wrapper">
              <Mail
                size={15}
                className="auth-input-icon"
              />

              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="admin@securecorp.net"
                className="auth-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Password
            </label>

            <div className="auth-input-wrapper">
              <Lock
                size={15}
                className="auth-input-icon"
              />

              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                className="auth-input with-toggle"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(s => !s)
                }
                className="auth-eye-toggle"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={15} />
                ) : (
                  <Eye size={15} />
                )}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              'AUTHENTICATING...'
            ) : (
              <>
                <ShieldCheck size={16} />
                ENTER CONSOLE
              </>
            )}
          </button>

        </form>
      </div>

      <div className="auth-footer-status">
        <span className="sidebar-status-dot" />
        CONSOLE_SECURE_SSL
      </div>
    </div>
  );
}
