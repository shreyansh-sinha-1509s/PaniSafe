import React from 'react';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage({ navigate }) {
  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '560px', textAlign: 'center', paddingTop: '60px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#F0FDFA',
          color: '#0D9488',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <Compass size={36} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F382A', letterSpacing: '-0.03em' }}>
          404 — Page Not Found
        </h1>
        <p style={{ fontSize: '1rem', color: '#4B5E57', marginTop: '10px', lineHeight: 1.6 }}>
          The requested path does not exist in the Pani Safe groundwater intelligence platform.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '28px' }}>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            <Home size={16} />
            <span>Go to Homepage</span>
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            <span>Open Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
