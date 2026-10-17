import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AlertNotice from '../components/AlertNotice';
import Logo from '../components/Logo';
import { Key, Mail, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage({ navigate }) {
  const { login, demoLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated) {
    return (
      <div className="page-container">
        <div className="container" style={{ maxWidth: '500px', textAlign: 'center', paddingTop: '40px' }}>
          <div className="card rounded-2xl" style={{ padding: '36px' }}>
            <UserCheck size={44} color="#14B8A6" style={{ margin: '0 auto 16px auto' }} />
            <h2 className="font-body font-semibold text-xl text-white mb-2">Already Authenticated</h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px' }}>
              You are currently signed in to the Pani Safe Environmental Analytics portal.
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ width: '100%' }}>
              <span>Return to Dashboard</span>
              <ArrowRight size={16} />
            </button>
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
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
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
            Sign In to Pani Safe
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px' }}>
            Access saved station bookmarks and analyst review logs.
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
          Authentication is <em>optional</em>. All 18,249 historical records, the interactive map, and the dashboard are 100% publicly accessible without logging in.
        </div>

        <div className="card rounded-2xl" style={{ padding: '36px' }}>
          {error && (
            <AlertNotice type="danger" title="Authentication Error">
              {error}
            </AlertNotice>
          )}

          {/* Quick Demo Login Option */}
          <div className="card-subtle rounded-xl p-5" style={{
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              One-Click Evaluator Access
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', margin: '8px 0 14px 0', lineHeight: 1.5 }}>
              Test platform capabilities using the pre-seeded Demo Analyst account:
              <br />
              <code style={{ fontSize: '0.8rem', color: '#14B8A6', background: 'rgba(13, 148, 136, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                analyst.demo@panisafe.in
              </code>
            </div>
            <button
              onClick={handleDemoSignIn}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              <UserCheck size={14} />
              <span>Sign In as Demo Analyst</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <span style={{ fontSize: '0.725rem', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>or sign in with credentials</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="analyst.demo@panisafe.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              {loading ? <span>Verifying...</span> : <span>Sign In to Account</span>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.55)' }}>
            Don't have an analyst account yet?{' '}
            <a
              href="#/register"
              onClick={(e) => { e.preventDefault(); navigate('/register'); }}
              style={{ color: '#14B8A6', fontWeight: 600 }}
            >
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
