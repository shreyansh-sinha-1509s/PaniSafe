import React, { useEffect, useState } from 'react';
import { fetchSummary, fetchDistricts } from '../services/api';
import MetricCard from '../components/MetricCard';
import AlertNotice from '../components/AlertNotice';
import {
  ArrowRight,
  Database,
  ShieldAlert,
  MapPin,
  FileCheck,
  Search,
  Activity,
  Layers,
  ChevronRight,
  Droplets,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function HomePage({ navigate }) {
  const [summaryData, setSummaryData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, distRes] = await Promise.all([
          fetchSummary(),
          fetchDistricts()
        ]);
        if (sumRes.success) setSummaryData(sumRes.data.summary);
        if (distRes.success) setDistricts(distRes.data.slice(0, 6));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F3 100%)',
        borderBottom: '1px solid #DDE5E1',
        paddingTop: '64px',
        paddingBottom: '64px'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#E6F4F1',
                color: '#0F766E',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '20px',
                border: '1px solid #CCFBF1'
              }}>
                <Droplets size={14} />
                <span>IBM Z Datathon 2026 • Groundwater Screening Platform</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 800,
                color: '#0F382A',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '20px'
              }}>
                Understand Groundwater. <br />
                <span style={{ color: '#0D9488' }}>Identify Risks.</span> <br />
                Support Better Decisions.
              </h1>

              <p style={{
                fontSize: '1.1rem',
                color: '#4B5E57',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '540px'
              }}>
                Pani Safe is an analytical decision-support platform for Maharashtra, India. By screening historical Central Ground Water Board (CGWB) records against preliminary water-quality benchmarks, we help researchers, planners, and district analysts pinpoint data gaps and locate stations requiring further laboratory investigation.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary btn-lg"
                  style={{ gap: '10px' }}
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/methodology')}
                  className="btn btn-secondary btn-lg"
                >
                  <span>Understand Our Methodology</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.85rem', color: '#64748B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={15} color="#0D9488" />
                  <span>Real CGWB Data Pipeline</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={15} color="#0D9488" />
                  <span>Transparent Null-Preservation</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div style={{
              background: '#0F382A',
              borderRadius: '16px',
              padding: '32px',
              color: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(15, 56, 42, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background ambient pattern */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5EEAD4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Real Dataset Metrics
                </span>
                <span style={{ background: '#164E3F', color: '#CCFBF1', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px' }}>
                  CGWB Maharashtra
                </span>
              </div>

              {/* Live Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#134635', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#A7F3D0' }}>Total Sample Records</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                    {loading ? '...' : summaryData ? summaryData.totalRecords.toLocaleString() : '18,249'}
                  </div>
                </div>
                <div style={{ background: '#134635', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#A7F3D0' }}>Monitoring Stations</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                    {loading ? '...' : summaryData ? summaryData.totalStations.toLocaleString() : '1,804'}
                  </div>
                </div>
                <div style={{ background: '#134635', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#A7F3D0' }}>Districts Monitored</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                    {loading ? '...' : summaryData ? summaryData.totalDistricts : '36'}
                  </div>
                </div>
                <div style={{ background: '#134635', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#FDE68A' }}>Review Recommended</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FCD34D', marginTop: '4px' }}>
                    {loading ? '...' : summaryData ? `${summaryData.overallReviewRate}%` : '15.5%'}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#0B291F',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.8rem',
                color: '#CBD5E1',
                lineHeight: 1.5,
                border: '1px solid #164E3F'
              }}>
                <strong style={{ color: '#5EEAD4' }}>Active Screening Rules: </strong>
                pH &lt; 6.5 or &gt; 8.5; TDS &gt; 500 mg/L. Unverified 0 TDS readings and invalid pH values &lt;0 / &gt;14 excluded from metric calculations.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Notice Banner */}
      <section style={{ padding: '24px 0', background: '#F8FAF9' }}>
        <div className="container">
          <AlertNotice type="disclaimer" title="Historical Screening & Decision-Support Notice">
            Pani Safe is designed to support environmental screening and exploration using historical groundwater records. A screening flag indicates that a sample exceeded selected preliminary thresholds, <strong>not</strong> a confirmed health emergency or drinking-water certification. Further physical sampling and certified laboratory validation are always required.
          </AlertNotice>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section style={{ padding: '64px 0', background: '#FFFFFF', borderBottom: '1px solid #DDE5E1' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Platform Architecture
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0F382A', marginTop: '6px' }}>
              Built for Environmental Intelligence
            </h2>
            <p style={{ color: '#4B5E57', marginTop: '10px', fontSize: '1rem', lineHeight: 1.6 }}>
              Rigorous data processing designed to extract actionable insights from large historical datasets without misleading simplifications.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#F0FDFA', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0F382A', marginBottom: '8px' }}>
                Groundwater Data Exploration
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#4B5E57', lineHeight: 1.6 }}>
                Search and filter 18,249 historical chemistry measurements across stations, blocks, and tehsils with instant pagination and multi-column sorting.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldAlert size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0F382A', marginBottom: '8px' }}>
                Objective Screening Alerts
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#4B5E57', lineHeight: 1.6 }}>
                Clear screening logic for pH (outside 6.5–8.5) and TDS (&gt; 500 mg/L) without sensationalized labels or false precision.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <MapPin size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0F382A', marginBottom: '8px' }}>
                District-Level Insights
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#4B5E57', lineHeight: 1.6 }}>
                Interactive GIS mapping and district summaries revealing spatial patterns across all 35+ administrative districts of Maharashtra.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <FileCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0F382A', marginBottom: '8px' }}>
                Data Quality Transparency
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#4B5E57', lineHeight: 1.6 }}>
                Missing parameters are preserved as null rather than converted to zero. Data gaps are surfaced explicitly as areas needing monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section style={{ padding: '64px 0', background: '#F8FAF9' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Decision Support Flow
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0F382A', marginTop: '6px' }}>
              From Historical Raw Records to Targeted Action
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {[
              { step: '01', title: 'Data Ingestion', desc: 'Raw CGWB groundwater chemistry records imported and parsed.' },
              { step: '02', title: 'Data Validation', desc: 'Preserves nulls, excludes pH outside 0-14, verifies coordinates.' },
              { step: '03', title: 'Screening Engine', desc: 'Applies threshold checks for pH and TDS without double-counting.' },
              { step: '04', title: 'Visualization', desc: 'Maps, trends, histograms, and sortable tables for exploratory analysis.' },
              { step: '05', title: 'Investigation', desc: 'Identifies high-priority stations for targeted ground sampling.' }
            ].map((p, idx) => (
              <div
                key={p.step}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DDE5E1',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D9488', marginBottom: '8px' }}>
                  {p.step}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F382A', marginBottom: '6px' }}>
                  {p.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section style={{
        background: '#0F382A',
        color: '#FFFFFF',
        padding: '56px 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Ready to explore Maharashtra groundwater data?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Access all 18,249 historical records, filter by district and station, inspect chemical breakdowns, and export datasets directly.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-teal btn-lg"
            >
              <span>Launch Monitoring Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/map')}
              className="btn btn-secondary btn-lg"
              style={{ background: '#164E3F', color: '#FFFFFF', borderColor: '#1F6A55' }}
            >
              <span>View Interactive Map</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
