import React from 'react';
import AlertNotice from '../components/AlertNotice';
import {
  FileText,
  Scale,
  Microscope,
  Database,
  Layers,
  ShieldCheck
} from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0D9488', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            <FileText size={16} />
            <span>Scientific Transparency & Ethics</span>
          </div>
          <h1 className="page-title">Methodology & Screening Standards</h1>
          <p className="page-subtitle">
            A comprehensive explanation of data ingestion pipelines, null-preservation rules, screening thresholds, and the scientific distinction between decision screening and physical laboratory testing.
          </p>
        </div>

        {/* Primary Disclaimer Alert */}
        <AlertNotice type="disclaimer" title="Important Scientific Notice">
          Pani Safe is an analytical screening and research prototype developed for the <strong>IBM Z Datathon 2026</strong>. It provides decision-support triage based on historical chemical records. It is <strong>not</strong> an official drinking water certification system and must not be used as the sole basis for declaring water potable or non-potable.
        </AlertNotice>

        {/* 1. Dataset Origin & Ingestion */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="#0D9488" />
            <span>1. Dataset Provenance & Scope</span>
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#4B5E57', lineHeight: 1.7, marginBottom: '12px' }}>
            The primary dataset is a deterministic synthetic demonstration dataset modeled on Maharashtra regional hydrogeological characteristics and Bureau of Indian Standards (BIS IS 10500:2012) drinking water benchmarks. Generated with a reproducible fixed seed (<code>20260427</code>) for the <strong>IBM Z Datathon 2026 (Event Code: SSF2026)</strong>, it enables consistent statewide decision-support evaluation without representing live physical wellhead certifications.
          </p>
          <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1', fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 600, color: '#0F382A', marginBottom: '8px' }}>Dataset Key Figures (Recalculated from Source Files):</div>
            <ul style={{ paddingLeft: '20px', color: '#4B5E57', lineHeight: 1.6 }}>
              <li>Total Analyzed Records: <strong>18,249 sample events</strong></li>
              <li>Disambiguated Monitoring Stations: <strong>1,804 observation stations</strong></li>
              <li>Statewide Geographic Scope: <strong>36 administrative districts across Maharashtra</strong></li>
              <li>Records Exceeding Screening Benchmarks: <strong>2,865 records (15.7%)</strong></li>
              <li>Parameter Measurement Completeness (Quality Index): <strong>95.0%</strong></li>
              <li>Data Provenance: <strong>Synthetic Benchmark (Deterministic Seed 20260427)</strong></li>
            </ul>
          </div>
        </div>

        {/* 2. Data Cleaning & Integrity Principles */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="#0D9488" />
            <span>2. Data Cleaning & Integrity Rules</span>
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#4B5E57', lineHeight: 1.7, marginBottom: '16px' }}>
            To prevent statistical distortions common in environmental data analysis, our data ingestion engine enforces strict rules:
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderLeft: '3px solid #0D9488', paddingLeft: '14px' }}>
              <strong style={{ color: '#0F382A', display: 'block', fontSize: '0.95rem' }}>Preservation of Missing Values as Null</strong>
              <p style={{ fontSize: '0.875rem', color: '#4B5E57', marginTop: '4px', lineHeight: 1.5 }}>
                Missing parameters are never coerced to zero. Coercing a missing fluoride reading to 0 mg/L would falsely imply safe water, whereas converting missing TDS to 0 mg/L corrupts mineral calculations. Missing values remain strictly <code>null</code> and are explicitly reported in data quality metrics.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid #0D9488', paddingLeft: '14px' }}>
              <strong style={{ color: '#0F382A', display: 'block', fontSize: '0.95rem' }}>Treatment of Zero TDS Readings as Unverified</strong>
              <p style={{ fontSize: '0.875rem', color: '#4B5E57', marginTop: '4px', lineHeight: 1.5 }}>
                Pure natural groundwater in basaltic aquifers always contains dissolved ions; a natural groundwater reading of exactly 0 mg/L TDS is physically implausible. Records with TDS = 0 in raw files are marked as unverified/missing laboratory inputs and excluded from distribution statistics.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid #0D9488', paddingLeft: '14px' }}>
              <strong style={{ color: '#0F382A', display: 'block', fontSize: '0.95rem' }}>Exclusion of Out-of-Scale pH Values</strong>
              <p style={{ fontSize: '0.875rem', color: '#4B5E57', marginTop: '4px', lineHeight: 1.5 }}>
                Any pH measurement falling outside the fundamental 0.0 to 14.0 scale is treated as a sensor calibration anomaly or typographical error and excluded from pH summary calculations.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid #0D9488', paddingLeft: '14px' }}>
              <strong style={{ color: '#0F382A', display: 'block', fontSize: '0.95rem' }}>Station Identity Disambiguation</strong>
              <p style={{ fontSize: '0.875rem', color: '#4B5E57', marginTop: '4px', lineHeight: 1.5 }}>
                Common station names (e.g. "Khed Dug Well" or "Market Yard") occur in multiple distinct districts. Stations are uniquely keyed by a composite compound key: <code>District + Station Name + Latitude + Longitude</code> to guarantee that independent wells are not merged.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Screening Thresholds & Indian Standards Context */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scale size={20} color="#0D9488" />
            <span>3. Screening Thresholds & Standards Context</span>
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#4B5E57', lineHeight: 1.7, marginBottom: '16px' }}>
            Pani Safe references benchmark limits aligned with the <strong>Bureau of Indian Standards (BIS IS 10500:2012 - Drinking Water Specification)</strong> for initial risk screening:
          </p>

          <div className="table-container" style={{ marginBottom: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>IS 10500 Acceptable Limit</th>
                  <th>IS 10500 Permissible Limit</th>
                  <th>Pani Safe Screening Rule</th>
                  <th>Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>pH Value</strong></td>
                  <td>6.5 – 8.5</td>
                  <td>No relaxation</td>
                  <td><span className="badge badge-flag-amber">&lt; 6.5 or &gt; 8.5</span></td>
                  <td>Corrosion risk (&lt;6.5) or encrustation/caustic taste (&gt;8.5)</td>
                </tr>
                <tr>
                  <td><strong>TDS (mg/L)</strong></td>
                  <td>500 mg/L</td>
                  <td>2,000 mg/L (no alternate source)</td>
                  <td><span className="badge badge-flag-amber">&gt; 500 mg/L</span></td>
                  <td>Desirable baseline for palatability and gastrointestinal tolerance</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
            <em>Note:</em> Under IS 10500:2012, TDS between 500 and 2,000 mg/L may be legally acceptable when no alternative water source is available. In Pani Safe, 500 mg/L serves as a conservative <em>screening threshold</em> to identify elevated mineral concentrations for priority review.
          </p>
        </div>

        {/* 4. Screening vs. Prediction vs. Laboratory Confirmation */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Microscope size={20} color="#0D9488" />
            <span>4. Screening vs. Prediction vs. Confirmation</span>
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#4B5E57', lineHeight: 1.7, marginBottom: '16px' }}>
            Scientific clarity is essential in environmental informatics. We maintain clear boundaries between three distinct stages:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1' }}>
              <div style={{ fontWeight: 700, color: '#0D9488', marginBottom: '6px' }}>1. Screening (Pani Safe)</div>
              <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                Algorithmic rule-based classification of existing chemical records. Flags historical anomalies to direct physical inspection resources efficiently.
              </p>
            </div>

            <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1' }}>
              <div style={{ fontWeight: 700, color: '#4F46E5', marginBottom: '6px' }}>2. Statistical Modeling</div>
              <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                Predictive interpolations or machine learning models. <em>Pani Safe does not invent predictive AI models or unverified sensor streams</em> without ground-truth calibration.
              </p>
            </div>

            <div style={{ background: '#F8FAF9', padding: '16px', borderRadius: '8px', border: '1px solid #DDE5E1' }}>
              <div style={{ fontWeight: 700, color: '#059669', marginBottom: '6px' }}>3. Laboratory Confirmation</div>
              <p style={{ fontSize: '0.85rem', color: '#4B5E57', lineHeight: 1.5 }}>
                Standard physical sampling, chain-of-custody protocols, and analysis by accredited NABL laboratories for drinking-water certification.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Limitations & Future Expansion */}
        <div className="card">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} color="#0D9488" />
            <span>5. Limitations & Future Technical Scope</span>
          </h2>
          <ul style={{ paddingLeft: '20px', color: '#4B5E57', fontSize: '0.925rem', lineHeight: 1.7, marginBottom: '16px' }}>
            <li><strong>Sampling Frequency:</strong> Historical CGWB data is sampled seasonally (1 to 2 rounds per year), capturing seasonal shifts rather than day-to-day fluctuations.</li>
            <li><strong>Parameter Completeness:</strong> Secondary parameters such as Fluoride, Nitrate, and Arsenic are missing in a subset of historical wells due to legacy analytical scopes.</li>
            <li><strong>Well Depth Heterogeneity:</strong> Shallow dug wells (&lt;15m) reflect unconfined aquifer interactions, whereas deep borewells (&gt;60m) tap semi-confined basalt joints.</li>
          </ul>
          <div style={{ background: '#F0FDFA', padding: '14px 18px', borderRadius: '8px', border: '1px solid #CCFBF1', fontSize: '0.875rem', color: '#0F766E' }}>
            <strong>Future Roadmap: </strong>
            Integration of automated multi-parameter index algorithms (Water Quality Index - WQI), ingestion of JJM (Jal Jeevan Mission) village water supply test reports, and LinuxONE-accelerated spatial anomaly detection.
          </div>
        </div>
      </div>
    </div>
  );
}
