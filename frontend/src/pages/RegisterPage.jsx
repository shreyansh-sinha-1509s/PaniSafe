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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F382A' }}>
            Create Research Account
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '4px' }}>
            Register to save station bookmarks and track audit notes.
          </p>
        </div>

        {/* Public Access Notice */}
        <div style={{
          background: '#F0FDFA',
          border: '1px solid #CCFBF1',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '0.825rem',
          color: '#0F766E',
          lineHeight: 1.4
        }}>
          <strong>Open Data Platform: </strong>
          Registration is completely optional. Public groundwater exploration and CSV downloads do not require an account.
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {error && (
            <AlertNotice type="danger" title="Registration Error">
              {error}
            </AlertNotice>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: '#DC2626' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="e.g., Meera Joshi"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
                <User size={16} color="#7E938B" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address <span style={{ color: '#DC2626' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="e.g., meera.joshi@research.org"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Mail size={16} color="#7E938B" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Organization / Institution</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="organization"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="e.g., Savitribai Phule Pune University"
                  value={form.organization}
                  onChange={handleChange}
                />
                <Building size={16} color="#7E938B" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password (Min 8 characters) <span style={{ color: '#DC2626' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
                <Key size={16} color="#7E938B" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? <span>Creating Account...</span> : <span>Register Practitioner Account</span>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748B' }}>
            Already have an account?{' '}
            <a
              href="#/login"
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              style={{ color: '#0D9488', fontWeight: 600 }}
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
