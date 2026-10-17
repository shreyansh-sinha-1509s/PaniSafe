import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AlertNotice from '../components/AlertNotice';
import Logo from '../components/Logo';
import { Mail, Key, User, Building } from 'lucide-react';

export default function RegisterPage({ navigate }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    organization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await register(form.fullName, form.email, form.password, form.organization);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <Logo size={40} showText={false} />
          </div>
          <h1 className="page-title" style={{ fontSize: '2.4rem' }}>
            Create Research Account
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px' }}>
            Register to save station bookmarks and track audit notes.
          </p>
        </div>

        {/* Public Access Notice */}
        <div style={{
          background: 'rgba(13, 148, 136, 0.08)',
          border: '1px solid rgba(13, 148, 136, 0.25)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          fontSize: '0.825rem',
          color: '#E2E8F0',
          lineHeight: 1.5
        }}>
          <strong style={{ color: '#14B8A6' }}>Open Data Note: </strong>
          Registration is completely optional. All groundwater screening data and mapping tools are publicly accessible without signing up.
        </div>

        <div className="card rounded-2xl" style={{ padding: '36px' }}>
          {error && (
            <AlertNotice type="danger" title="Registration Error">
              {error}
            </AlertNotice>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="fullName"
                  type="text"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="e.g., Dr. Ananya Deshmukh"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
                <User size={16} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="analyst@university.edu.in"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Mail size={16} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Organization / Affiliation</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="organization"
                  type="text"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="e.g., Water Resources Research Lab"
                  value={form.organization}
                  onChange={handleChange}
                />
                <Building size={16} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password * (Min 8 characters)</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type="password"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <Key size={16} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? <span>Creating Account...</span> : <span>Create Account</span>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.55)' }}>
            Already have an account?{' '}
            <a
              href="#/login"
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              style={{ color: '#14B8A6', fontWeight: 600 }}
            >
              Sign in here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
