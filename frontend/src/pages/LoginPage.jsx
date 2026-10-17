import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AlertNotice from '../components/AlertNotice';
import Logo from '../components/Logo';
import { LogIn, Key, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

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
          <div className="card">
            <UserCheck size={48} color="#0D9488" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '1.4rem', color: '#0F382A', marginBottom: '8px' }}>Already Authenticated</h2>
            <p style={{ fontSize: '0.9rem', color: '#4B5E57', marginBottom: '24px' }}>
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F382A' }}>
            Sign In to Pani Safe
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '4px' }}>
            Access saved station bookmarks and analyst review logs.
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
          <strong>Open Data Note: </strong>
          Authentication is <em>optional</em>. All 18,249 historical records, the interactive map, and the dashboard are 100% publicly accessible without logging in.
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {error && (
            <AlertNotice type="danger" title="Authentication Error">
              {error}
            </AlertNotice>
          )}

          {/* Quick Demo Login Option */}
          <div style={{
            background: '#F8FAF9',
            border: '1px dashed #0D9488',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              One-Click Evaluator Access
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4B5E57', margin: '6px 0 12px 0' }}>
              Test platform capabilities using the pre-seeded Demo Analyst account:
              <br />
              <code style={{ fontSize: '0.75rem', color: '#0F382A' }}>analyst.demo@panisafe.in</code>
            </div>
            <button
              onClick={handleDemoSignIn}
              disabled={loading}
              className="btn btn-teal btn-sm"
              style={{ width: '100%' }}
            >
              <UserCheck size={14} />
              <span>Sign In as Demo Analyst</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: '#DDE5E1' }} />
            <span style={{ fontSize: '0.75rem', color: '#7E938B', textTransform: 'uppercase' }}>or sign in with credentials</span>
            <div style={{ flex: 1, height: '1px', background: '#DDE5E1' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="analyst.demo@panisafe.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="#7E938B" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              {loading ? <span>Verifying...</span> : <span>Sign In to Account</span>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748B' }}>
            Don't have an analyst account yet?{' '}
            <a
              href="#/register"
              onClick={(e) => { e.preventDefault(); navigate('/register'); }}
              style={{ color: '#0D9488', fontWeight: 600 }}
            >
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
