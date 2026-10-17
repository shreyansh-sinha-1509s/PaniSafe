import React from 'react';
import { Compass, Home, Database } from 'lucide-react';

export default function NotFoundPage({ navigate }) {
  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '560px', textAlign: 'center', paddingTop: '60px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(13, 148, 136, 0.1)',
          border: '1px solid rgba(13, 148, 136, 0.25)',
          color: '#14B8A6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <Compass size={32} />
        </div>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>
          404 — Page Not Found
        </h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '12px', lineHeight: 1.6 }}>
          The requested path does not exist in the Pani Safe groundwater intelligence platform.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            <Home size={16} />
            <span>Go to Homepage</span>
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            <Database size={16} />
            <span>Open Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
