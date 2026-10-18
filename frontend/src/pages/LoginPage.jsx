import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AlertNotice from '../components/AlertNotice';
import Logo from '../components/Logo';
import { Key, Mail, ArrowRight, ShieldCheck, ShieldAlert, LogOut, Info } from 'lucide-react';

export default function LoginPage({ navigate }) {
  const { login, logout, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated) {
    return (
      <div className="page-container">
        <div className="container" style={{ maxWidth: '500px', textAlign: 'center', paddingTop: '40px' }}>
          <div className="card rounded-2xl" style={{ padding: '36px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(20, 184, 166, 0.15)',
              color: '#14B8A6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <ShieldCheck size={32} />
            </div>
            <h2 className="font-body font-semibold text-xl text-white mb-2">Authenticated Administrator</h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
              You are currently signed in with administrator privileges.
            </p>
            <div style={{
              display: 'inline-block',
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: '9999px',
              padding: '4px 16px',
              fontSize: '0.85rem',
              color: '#00E5FF',
              fontWeight: 600,
              marginBottom: '24px'
            }}>
              {user?.email || 'admin@panisafe.in'}
            </div>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => navigate('/admin')} className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
                <span>Go to Admin Dashboard</span>
                <ArrowRight size={16} />
              </button>
              <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', gap: '8px' }}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
            Admin Sign In
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px' }}>
            Restricted access for administrative review and inquiry management.
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
          lineHeight: 1.5,
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <Info size={16} className="text-[#14B8A6] shrink-0 mt-0.5" />
          <div>
            <strong style={{ color: '#14B8A6' }}>Open Data Note: </strong>
            Groundwater quality data, CGWB station records, ML anomaly screening, and methodology remain 100% publicly accessible without sign-in.
          </div>
        </div>

        <div className="card rounded-2xl" style={{ padding: '36px' }}>
          {error && (
            <AlertNotice type="danger" title="Authentication Error">
              {error}
            </AlertNotice>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Administrator Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="admin@panisafe.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
                <Mail size={16} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <Key size={16} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', gap: '8px' }}
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <ShieldAlert size={16} />
                  <span>Authenticate Administrator</span>
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.4
          }}>
            <strong style={{ color: '#14B8A6' }}>Evaluator & Judge Access: </strong>
            Datathon judges may authenticate using the designated judge administrator email (<code>judge@panisafe.in</code>). Credentials are verified securely on the backend against environment configuration.
          </div>

          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.45)'
          }}>
            Public registration is disabled. Administrator credentials are authenticated against backend environment secrets.
          </div>
        </div>
      </div>
    </div>
  );
}
