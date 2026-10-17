import React from 'react';
import AlertNotice from '../components/AlertNotice';
import {
  Cpu,
  Target,
  Globe,
  Award,
  ArrowRight,
  Zap,
  Server
} from 'lucide-react';

export default function AboutPage({ navigate }) {
  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#14B8A6', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.06em' }}>
            <Award size={16} />
            <span>IBM Z Datathon 2026 Initiative (Event Code: SSF2026)</span>
          </div>
          <h1 className="page-title">About Pani Safe</h1>
          <p className="page-subtitle">
            Pani Safe is an open, transparent environmental screening platform designed to translate hydrogeological screening benchmarks into actionable decision intelligence for Maharashtra, India.
          </p>
        </div>

        {/* Disclaimer */}
        <AlertNotice type="disclaimer" title="Datathon Prototype & Dataset Notice">
          Pani Safe is an independent research prototype created for the <strong>IBM Z Datathon 2026 (Event Code: SSF2026)</strong>. It utilizes a deterministic synthetic benchmark dataset modeled on Maharashtra regional hydrochemistry and BIS IS 10500:2012 screening standards. This prototype is not an official government agency portal and does not provide drinking water safety certifications.
        </AlertNotice>

        {/* Vision & Problem Statement */}
        <div className="card" style={{ marginBottom: '32px', padding: '32px' }}>
          <h2 className="font-body font-semibold text-xl text-slate-100 mb-4 flex items-center gap-3">
            <Target size={22} color="#14B8A6" />
            <span>Project Vision & Environmental Context</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.7, marginBottom: '16px' }}>
            Over 80% of rural domestic drinking water and 65% of agricultural irrigation in Maharashtra depends directly upon groundwater. However, environmental monitoring data often remains locked within dense tabular archives, making it challenging for local stakeholders to identify regional quality trends or notice critical parameter gaps.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.7 }}>
            Our vision with <strong>Pani Safe</strong> is to democratize groundwater quality screening. By applying consistent, transparent screening criteria to thousands of benchmark monitoring stations across all 36 districts of Maharashtra, we provide clear indicators of where further physical testing and targeted laboratory verification are most needed.
          </p>
        </div>

        {/* Target Beneficiaries */}
        <div className="card" style={{ marginBottom: '32px', padding: '32px' }}>
          <h2 className="font-body font-semibold text-xl text-slate-100 mb-4 flex items-center gap-3">
            <Globe size={22} color="#14B8A6" />
            <span>Target Beneficiaries</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="card-subtle rounded-xl p-5">
              <strong style={{ color: '#14B8A6', display: 'block', marginBottom: '8px', fontSize: '0.95rem' }}>District Water Resources Planners</strong>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6 }}>
                Identify tehsils with historically high TDS or abnormal pH to optimize municipal well placement and water treatment budgets.
              </p>
            </div>
            <div className="card-subtle rounded-xl p-5">
              <strong style={{ color: '#14B8A6', display: 'block', marginBottom: '8px', fontSize: '0.95rem' }}>Environmental Researchers & Hydrologists</strong>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6 }}>
                Investigate multi-year parameter shifts across seasonal campaigns and analyze data completeness indices across basins.
              </p>
            </div>
            <div className="card-subtle rounded-xl p-5">
              <strong style={{ color: '#14B8A6', display: 'block', marginBottom: '8px', fontSize: '0.95rem' }}>Community Public Health Leaders</strong>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6 }}>
                Access objective, non-sensationalized data to advocate for targeted laboratory testing in underserved rural communities.
              </p>
            </div>
          </div>
        </div>

        {/* IBM Z & LinuxONE Role */}
        <div className="card rounded-2xl" style={{ marginBottom: '32px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Cpu size={24} color="#14B8A6" />
            <h2 className="font-body font-semibold text-xl text-slate-100">
              Engineered for IBM LinuxONE & s390x Mainframe Architecture
            </h2>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.7, marginBottom: '20px' }}>
            Pani Safe was purposefully engineered for native compatibility with the <strong>IBM LinuxONE Community Cloud</strong> running Ubuntu on the <strong>s390x (Big-Endian 64-bit)</strong> mainframe architecture:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="card-subtle rounded-xl p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14B8A6', fontWeight: 600, marginBottom: '6px' }}>
                <Zap size={16} />
                <span>Pure JavaScript Portability</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5 }}>
                Zero native C/C++ bindings (no gyp compilations). Uses <code>bcryptjs</code> and standard Node.js crypto, guaranteeing 100% execution safety on s390x.
              </p>
            </div>
            <div className="card-subtle rounded-xl p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14B8A6', fontWeight: 600, marginBottom: '6px' }}>
                <Server size={16} />
                <span>Sub-5ms In-Memory Engine</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5 }}>
                Multi-dimensional in-memory indexing parses all 18,249 records on startup, executing queries with enterprise throughput without database overhead.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingTop: '16px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            <span>Explore Dashboard Insights</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
