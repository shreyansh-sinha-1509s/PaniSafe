import React from 'react';
import AlertNotice from '../components/AlertNotice';
import {
  Cpu,
  Target,
  Globe,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function AboutPage({ navigate }) {
  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0D9488', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
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
        <div className="card" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={20} color="#0D9488" />
            <span>Project Vision & Environmental Context</span>
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#4B5E57', lineHeight: 1.7, marginBottom: '14px' }}>
            Over 80% of rural domestic drinking water and 65% of agricultural irrigation in Maharashtra depends directly upon groundwater. However, groundwater monitoring data often remains locked within dense tabular archives, making it challenging for local stakeholders to identify regional quality trends or notice critical data gaps.
          </p>
          <p style={{ fontSize: '0.925rem', color: '#4B5E57', lineHeight: 1.7 }}>
            Our vision with <strong>Pani Safe</strong> is to democratize groundwater quality screening. By applying consistent, transparent screening criteria to thousands of benchmark monitoring stations, we provide clear indicators of where further physical testing and targeted laboratory verification are most needed.
          </p>
        </div>

        {/* Target Beneficiaries */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={20} color="#0D9488" />
            <span>Target Beneficiaries</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1' }}>
              <strong style={{ color: '#0F382A', display: 'block', marginBottom: '6px' }}>District Water Resources Planners</strong>
              <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                Identify tehsils with historically high TDS or abnormal pH to optimize municipal well placement and water treatment budgets.
              </p>
            </div>
            <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1' }}>
              <strong style={{ color: '#0F382A', display: 'block', marginBottom: '6px' }}>Environmental & Hydrology Researchers</strong>
              <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                Analyze temporal chemistry trends across multi-year intervals and export cleaned subsets for hydrochemical facies modeling.
              </p>
            </div>
            <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1' }}>
              <strong style={{ color: '#0F382A', display: 'block', marginBottom: '6px' }}>Community Water Committees (VWSC)</strong>
              <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                Understand historical water quality baseline in their village and request certified laboratory validation when thresholds are crossed.
              </p>
            </div>
            <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1' }}>
              <strong style={{ color: '#0F382A', display: 'block', marginBottom: '6px' }}>Public Health Officers</strong>
              <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                Correlate regional gastrointestinal complaints with areas of historically elevated mineral concentration and unverified parameters.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack & LinuxONE Architecture */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={20} color="#0D9488" />
            <span>Technology Stack & IBM LinuxONE Compatibility</span>
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#4B5E57', lineHeight: 1.7, marginBottom: '16px' }}>
            Pani Safe was developed with special consideration for <strong>IBM LinuxONE Community Cloud (Ubuntu on s390x architecture)</strong>. Critical infrastructure for public environmental screening requires high throughput, memory safety, and 99.999% uptime capabilities:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1' }}>
              <strong style={{ color: '#0F382A', display: 'block', marginBottom: '4px' }}>Frontend Layer</strong>
              <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                React.js with Vite for high performance; Recharts for responsive statistical visualizations; Leaflet with OpenStreetMap for zero-cost spatial mapping; Vanilla CSS tokens for a refined, responsive UI.
              </p>
            </div>
            <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1' }}>
              <strong style={{ color: '#0F382A', display: 'block', marginBottom: '4px' }}>Backend & Data Engine</strong>
              <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                Node.js & Express REST API; pure-JavaScript CSV streaming and in-memory indexed store designed to run smoothly on s390x Linux without compilation issues; bcryptjs & JWT for secure session management.
              </p>
            </div>
          </div>

          <div style={{ background: '#0F382A', color: '#FFFFFF', padding: '18px 20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5EEAD4', textTransform: 'uppercase', marginBottom: '4px' }}>
              Why IBM LinuxONE for Environmental Monitoring?
            </div>
            <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: 1.6 }}>
              LinuxONE’s s390x mainframe architecture provides industry-leading I/O bandwidth, pervasive memory encryption, and microsecond data aggregation. In statewide environmental screening handling millions of sensor logs, LinuxONE provides the fault tolerance necessary for mission-critical public welfare systems.
            </p>
          </div>
        </div>

        {/* Project Roadmap & Current Capabilities */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} color="#0D9488" />
            <span>Current Capabilities vs. Future Scope</span>
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Current Release (v1.0 - Datathon)</th>
                  <th>Future Release Roadmap</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Data Ingestion</strong></td>
                  <td>18,249 historical CGWB records across 35 districts</td>
                  <td>Automated scheduled synchronization with NWIC APIs</td>
                </tr>
                <tr>
                  <td><strong>Screening Logic</strong></td>
                  <td>pH (6.5–8.5) and TDS (500 mg/L) threshold engine</td>
                  <td>Comprehensive Multi-Parameter Water Quality Index (WQI)</td>
                </tr>
                <tr>
                  <td><strong>Spatial Mapping</strong></td>
                  <td>Interactive Leaflet OSM pins with popup metadata</td>
                  <td>GeoJSON aquifer boundary overlays and watershed polygons</td>
                </tr>
                <tr>
                  <td><strong>Deployment</strong></td>
                  <td>Full s390x LinuxONE ready Node.js package</td>
                  <td>Enterprise Kubernetes / OpenShift microservice deployment</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-lg">
            <span>Explore the Platform Dashboard</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
