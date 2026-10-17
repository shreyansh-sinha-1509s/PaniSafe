import React from 'react';
import Logo from './Logo';
import { Cpu, AlertCircle } from 'lucide-react';

export default function Footer({ navigate }) {
  return (
    <footer style={{
      background: '#0F382A',
      color: '#E2E8F0',
      borderTop: '1px solid #164E3F',
      paddingTop: '48px',
      paddingBottom: '32px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Col 1: Identity & Purpose */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Logo size={36} />
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: '#CBD5E1',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}>
              Pani Safe is an advanced groundwater quality monitoring and screening intelligence platform for Maharashtra, India. Developed for the <strong>IBM Z Datathon 2026</strong>.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#164E3F',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#5EEAD4'
            }}>
              <Cpu size={14} />
              <span>Engineered for LinuxONE s390x Enterprise Cloud</span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#5EEAD4',
              marginBottom: '16px'
            }}>
              Analytics & Data
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <a href="#/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} style={{ color: '#E2E8F0' }}>
                  Monitoring Dashboard
                </a>
              </li>
              <li>
                <a href="#/explore" onClick={(e) => { e.preventDefault(); navigate('/explore'); }} style={{ color: '#E2E8F0' }}>
                  Explore 18,249 Records
                </a>
              </li>
              <li>
                <a href="#/map" onClick={(e) => { e.preventDefault(); navigate('/map'); }} style={{ color: '#E2E8F0' }}>
                  Maharashtra Interactive Map
                </a>
              </li>
              <li>
                <a href="#/alerts" onClick={(e) => { e.preventDefault(); navigate('/alerts'); }} style={{ color: '#E2E8F0' }}>
                  Screening Alerts Review
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Science & Methodology */}
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#5EEAD4',
              marginBottom: '16px'
            }}>
              Methodology & Ethics
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <a href="#/methodology" onClick={(e) => { e.preventDefault(); navigate('/methodology'); }} style={{ color: '#E2E8F0' }}>
                  Screening vs. Certification
                </a>
              </li>
              <li>
                <a href="#/methodology" onClick={(e) => { e.preventDefault(); navigate('/methodology'); }} style={{ color: '#E2E8F0' }}>
                  Data Cleaning & Null Handling
                </a>
              </li>
              <li>
                <a href="#/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }} style={{ color: '#E2E8F0' }}>
                  About Pani Safe Project
                </a>
              </li>
              <li>
                <a href="#/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }} style={{ color: '#E2E8F0' }}>
                  Submit Technical Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Data Provenance */}
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#5EEAD4',
              marginBottom: '16px'
            }}>
              Dataset Attribution
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '12px' }}>
              Utilizes a deterministic synthetic demonstration dataset modeled on Maharashtra regional hydrogeology and BIS IS 10500:2012 screening standards.
            </p>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Coverage: 18,249 simulated records across 36 districts in Maharashtra.
            </p>
          </div>
        </div>

        {/* Mandatory Scientific Disclaimer Card */}
        <div style={{
          background: '#0B291F',
          border: '1px solid #164E3F',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <AlertCircle size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.825rem', color: '#CBD5E1', lineHeight: 1.5 }}>
            <strong style={{ color: '#FCD34D' }}>Scientific & Decision-Support Notice: </strong>
            Pani Safe is an analytical screening and prioritization tool built for research and exploratory screening. It is not an official drinking-water testing certification. A screening flag indicates that a measurement crosses preliminary benchmark thresholds (e.g. pH &lt; 6.5 / &gt; 8.5 or TDS &gt; 500 mg/L), not a confirmed contamination finding or health hazard. Water must never be deemed definitively safe or unsafe based solely on screening data without fresh certified laboratory verification.
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #164E3F',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#94A3B8',
          gap: '12px'
        }}>
          <div>
            © 2026 Pani Safe Team. Built for IBM Z Datathon 2026 (Event Code: SSF2026).
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Architecture: Node.js + Express + React</span>
            <span>Target: LinuxONE s390x Community Cloud</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
