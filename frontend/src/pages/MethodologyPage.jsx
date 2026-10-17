import React from 'react';
import AlertNotice from '../components/AlertNotice';
import {
  FileText,
  Scale,
  Microscope,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#14B8A6', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.06em' }}>
            <FileText size={16} />
            <span>Scientific Transparency & Standards</span>
          </div>
          <h1 className="page-title">Methodology & Screening Standards</h1>
          <p className="page-subtitle">
            A comprehensive explanation of data ingestion pipelines, deterministic synthetic reproducibility, null-preservation rules, screening thresholds, and the scientific distinction between decision triage and certified laboratory testing.
          </p>
        </div>

        {/* Primary Disclaimer Alert */}
        <AlertNotice type="disclaimer" title="Important Scientific Notice">
          Pani Safe is an analytical screening and research prototype developed for the <strong>IBM Z Datathon 2026 (Event Code: SSF2026)</strong>. It provides decision-support triage based on hydrochemical parameters. It is <strong>not</strong> an official drinking water certification system and must not be used as the sole basis for declaring water potable or non-potable.
        </AlertNotice>

        {/* 1. Dataset Origin & Ingestion */}
        <div className="card" style={{ marginBottom: '32px', padding: '32px' }}>
          <h2 className="font-body font-semibold text-xl text-slate-100 mb-4 flex items-center gap-3">
            <Database size={22} color="#14B8A6" />
            <span>1. Dataset Provenance & Scope (Option B)</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.7, marginBottom: '20px' }}>
            The primary dataset is an auditable, deterministic synthetic demonstration dataset modeled on Maharashtra regional hydrogeological characteristics and Bureau of Indian Standards (BIS IS 10500:2012) drinking water benchmarks. Generated with a reproducible fixed seed (<code>20260427</code>) using the Mulberry32 32-bit PRNG for the <strong>IBM Z Datathon 2026</strong>, it enables consistent statewide decision-support evaluation without representing live physical wellhead certifications.
          </p>
          <div className="card-subtle p-5 rounded-xl" style={{ fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 600, color: '#14B8A6', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.775rem' }}>
              Dataset Key Figures (Recalculated from Seed 20260427):
            </div>
            <ul style={{ paddingLeft: '20px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Total Analyzed Records: <strong style={{ color: '#FFFFFF' }}>18,249 sample events</strong></li>
              <li>Disambiguated Monitoring Stations: <strong style={{ color: '#FFFFFF' }}>1,804 observation wells</strong></li>
              <li>Statewide Geographic Scope: <strong style={{ color: '#FFFFFF' }}>36 administrative districts across Maharashtra</strong></li>
              <li>Records Exceeding Screening Benchmarks: <strong style={{ color: '#F59E0B' }}>2,865 records (15.7%)</strong></li>
              <li>pH Benchmark Exceedances (&lt;6.5 or &gt;8.5): <strong style={{ color: '#FFFFFF' }}>1,122 records (6.4% of valid pH)</strong></li>
              <li>TDS Desirable Exceedances (&gt;500 mg/L): <strong style={{ color: '#FFFFFF' }}>2,223 records (13.0% of usable TDS)</strong></li>
              <li>Parameter Measurement Completeness (Quality Index): <strong style={{ color: '#10B981' }}>95.0%</strong></li>
              <li>Data Provenance Tag: <strong style={{ color: '#14B8A6' }}>SYNTHETIC_DEMO (Deterministic Seed 20260427)</strong></li>
            </ul>
          </div>
        </div>

        {/* 2. Data Cleaning & Integrity Principles */}
        <div className="card" style={{ marginBottom: '32px', padding: '32px' }}>
          <h2 className="font-body font-semibold text-xl text-slate-100 mb-4 flex items-center gap-3">
            <ShieldCheck size={22} color="#14B8A6" />
            <span>2. Data Cleaning & Integrity Rules</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.7, marginBottom: '20px' }}>
            Groundwater chemistry data requires strict scientific integrity rules to prevent biased or erroneous decision-making:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-subtle p-4 rounded-xl">
              <strong style={{ color: '#14B8A6', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                Rule 1: Strict Preservation of Missing Values (Null Preservation)
              </strong>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6 }}>
                In government monitoring archives, analytes are often omitted when a particular laboratory run did not test for that substance. Many pipelines convert blank cells or NaN into zero. In water science, converting missing Fluoride to 0 mg/L falsely implies absolute safety; converting missing TDS to 0 mg/L corrupts ion balance ratios. In Pani Safe, missing measurements remain <code>null</code> and are explicitly labeled as <em>Not Reported (N/A)</em>.
              </p>
            </div>

            <div className="card-subtle p-4 rounded-xl">
              <strong style={{ color: '#14B8A6', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                Rule 2: Treatment of 0.0 mg/L TDS as Unverified / Sensor Default
              </strong>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6 }}>
                Natural groundwater circulating through Maharashtra's basaltic aquifers continuously dissolves minerals. Pure distilled water (0.0 mg/L TDS) does not exist in nature. Any record with TDS = 0 is classified as an <em>Unverified / Sensor Default</em> and excluded from distribution statistics and averages.
              </p>
            </div>

            <div className="card-subtle p-4 rounded-xl">
              <strong style={{ color: '#14B8A6', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                Rule 3: Exclusion of Out-of-Scale pH Readings
              </strong>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6 }}>
                The physical pH scale runs from 0.0 to 14.0. Historical entries with pH &lt; 0 or pH &gt; 14 are flagged as instrument miscalibrations and excluded from distribution metrics.
              </p>
            </div>

            <div className="card-subtle p-4 rounded-xl">
              <strong style={{ color: '#14B8A6', fontSize: '0.95rem', display: 'block', marginBottom: '6px' }}>
                Rule 4: Station Disambiguation via Composite Identifiers
              </strong>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6 }}>
                Multiple talukas across different districts contain identical village names (e.g. "Khed", "Bori", "Wadgaon"). Stations are indexed using compound unique keys (<code>District + Station Name + Latitude + Longitude</code>) to prevent disparate wells from being improperly conflated.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Standards Alignment */}
        <div className="card" style={{ marginBottom: '32px', padding: '32px' }}>
          <h2 className="font-body font-semibold text-xl text-slate-100 mb-4 flex items-center gap-3">
            <Scale size={22} color="#14B8A6" />
            <span>3. Screening Thresholds & Standards Alignment (BIS IS 10500:2012)</span>
          </h2>

          <div className="table-container" style={{ marginBottom: '20px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Acceptable Limit</th>
                  <th>Permissible Limit (No Alternate)</th>
                  <th>Screening Rule Applied</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: '#FFFFFF' }}>pH Value</strong></td>
                  <td>6.5 – 8.5</td>
                  <td>6.5 – 8.5 (No relaxation)</td>
                  <td>Flagged if &lt; 6.5 (corrosion risk) or &gt; 8.5 (encrustation risk)</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#FFFFFF' }}>Total Dissolved Solids (TDS)</strong></td>
                  <td>500 mg/L</td>
                  <td>2,000 mg/L</td>
                  <td>Flagged as "Review Recommended" above 500 mg/L desirable threshold</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
            <strong>Double-Counting Prevention:</strong> When a single sample exceeds both pH and TDS thresholds, it is flagged under both parameter categories but counted exactly once toward the overall <code>needsReviewCount</code>.
          </p>
        </div>

        {/* 4. Screening vs. Certification */}
        <div className="card" style={{ marginBottom: '32px', padding: '32px' }}>
          <h2 className="font-body font-semibold text-xl text-slate-100 mb-4 flex items-center gap-3">
            <Microscope size={22} color="#14B8A6" />
            <span>4. Screening vs. Laboratory Certification</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card-subtle rounded-xl p-5" style={{ border: '1px solid rgba(13, 148, 136, 0.25)', background: 'rgba(13, 148, 136, 0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14B8A6', fontWeight: 600, marginBottom: '10px' }}>
                <CheckCircle2 size={18} />
                <span>What Pani Safe DOES:</span>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Triage and prioritize monitoring stations for field validation.</li>
                <li>Identify unmonitored parameters and historical sampling gaps.</li>
                <li>Provide reproducible, transparent data exploration tools for researchers.</li>
                <li>Support resource allocation for district testing laboratories.</li>
              </ul>
            </div>

            <div className="card-subtle rounded-xl p-5" style={{ border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: 600, marginBottom: '10px' }}>
                <AlertTriangle size={18} />
                <span>What Pani Safe DOES NOT DO:</span>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Does NOT certify drinking water as safe or potable.</li>
                <li>Does NOT declare water toxic without accredited lab testing.</li>
                <li>Does NOT simulate fake real-time sensor streams.</li>
                <li>Does NOT test for microbiological pathogens (E. coli, coliform) or trace heavy metals without physical samples.</li>
              </ul>
            </div>
          </div>

          <div className="card-subtle rounded-xl p-4" style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
            <strong style={{ color: '#FFFFFF' }}>Required Field Verification Protocol:</strong> Any observation well highlighted in this screening portal requires deployment of trained sampling personnel following ISO/BIS chain-of-custody protocols, with subsequent multi-parameter analysis conducted in an accredited <strong>NABL (National Accreditation Board for Testing and Calibration Laboratories)</strong> facility.
          </div>
        </div>
      </div>
    </div>
  );
}
