import React, { useEffect, useState } from 'react';
import { fetchStationById } from '../services/api';
import AlertNotice from '../components/AlertNotice';
import MetricCard from '../components/MetricCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  MapPin,
  Activity,
  ArrowLeft,
  ShieldAlert,
  FileSpreadsheet,
  Info
} from 'lucide-react';

export default function StationDetailsPage({ stationId, navigate }) {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStation() {
      if (!stationId) return;
      setLoading(true);
      try {
        const res = await fetchStationById(stationId);
        if (res.success) {
          setStation(res.data);
        } else {
          setError('Station not found in database.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStation();
  }, [stationId]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ color: '#0D9488', fontSize: '1.2rem', fontWeight: 600 }}>
            Loading station historical records...
          </div>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="page-container">
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <AlertNotice type="danger" title="Station Not Found">
            {error || 'Unable to load details for this station ID.'}
          </AlertNotice>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ marginTop: '16px' }}>
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  // Chemistry timeline data for recharts
  const chartData = station.records.map(r => ({
    date: r.samplingDate || r.acquisitionTime?.substring(0, 10),
    ph: r.ph,
    tds: r.tds,
    needsReview: r.needsReview
  }));

  const hasSufficientHistory = chartData.length >= 2;

  return (
    <div className="page-container">
      <div className="container">
        {/* Breadcrumb & Navigation */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/explore')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Explorer</span>
          </button>
        </div>

        {/* Station Title Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0D9488', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <MapPin size={15} />
              <span>{station.district} District • CGWB Station Profile</span>
            </div>
            <h1 className="page-title" style={{ marginTop: '4px' }}>{station.station}</h1>
            <p className="page-subtitle">
              Location: {station.village ? `${station.village}, ` : ''}{station.tehsil ? `${station.tehsil}, ` : ''}{station.district}, Maharashtra. Monitored by {station.agency || 'CGWB'}.
            </p>
          </div>

          <div>
            {station.flaggedCount > 0 ? (
              <span className="badge badge-flag-amber" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <span className="badge-dot" style={{ background: '#D97706' }} />
                Review Recommended ({station.flaggedCount} of {station.recordCount} samples flagged)
              </span>
            ) : (
              <span className="badge badge-flag-green" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <span className="badge-dot" style={{ background: '#059669' }} />
                Within Preliminary Screening Thresholds
              </span>
            )}
          </div>
        </div>

        {/* Temporal Disclaimer Banner */}
        <AlertNotice type="disclaimer" title="Historical Baseline Notice">
          The records presented below represent historical periodic sampling by the Central Ground Water Board. <strong>Historical measurements do not represent real-time sensor monitoring or confirm current tap or well conditions today</strong>. Water conditions fluctuate seasonally and require local certified water-testing before consumption.
        </AlertNotice>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <MetricCard
            title="Total Historical Samples"
            value={station.recordCount}
            subtext="Available laboratory analyses"
            icon={FileSpreadsheet}
            accent="#0F382A"
          />
          <MetricCard
            title="Flagged Samples"
            value={station.flaggedCount}
            subtext={`${((station.flaggedCount / (station.recordCount || 1)) * 100).toFixed(0)}% of historical samples`}
            icon={ShieldAlert}
            accent="#D97706"
          />
          <MetricCard
            title="Latest Recorded pH"
            value={station.latestPh !== null ? station.latestPh.toFixed(2) : 'N/A'}
            subtext={station.latestDate ? `Sampled on ${station.latestDate}` : 'Date unrecorded'}
            icon={Activity}
            accent="#0D9488"
          />
          <MetricCard
            title="Latest Recorded TDS"
            value={station.latestTds !== null ? `${Math.round(station.latestTds)} mg/L` : 'N/A'}
            subtext="Preliminary limit: 500 mg/L"
            icon={Activity}
            accent="#4F46E5"
          />
        </div>

        {/* Charts & Trends */}
        <div className="charts-grid-2">
          {/* pH Trend */}
          <div className="chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Historical pH Trend</h3>
                <p className="card-subtitle">Preliminary screening guideline: 6.5 to 8.5</p>
              </div>
            </div>
            <div className="chart-container">
              {hasSufficientHistory ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[5, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F382A', color: '#FFF', borderRadius: '6px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="ph" name="pH Value" stroke="#0D9488" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', textAlign: 'center', padding: '20px' }}>
                  <Info size={28} color="#94A3B8" style={{ marginBottom: '8px' }} />
                  <strong>Single Sample Station</strong>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    This station has only {chartData.length} recorded sampling event. Trend lines require at least two sequential records.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* TDS Trend */}
          <div className="chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Historical TDS Trend (mg/L)</h3>
                <p className="card-subtitle">Preliminary screening threshold: 500 mg/L</p>
              </div>
            </div>
            <div className="chart-container">
              {hasSufficientHistory ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F382A', color: '#FFF', borderRadius: '6px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="tds" name="TDS (mg/L)" stroke="#D97706" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', textAlign: 'center', padding: '20px' }}>
                  <Info size={28} color="#94A3B8" style={{ marginBottom: '8px' }} />
                  <strong>Single Sample Station</strong>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    Temporal trend analysis is withheld to avoid misleading interpolation on single-point data.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Missing Parameters Inventory Card */}
        {station.missingParametersSummary && (
          <div className="card" style={{ marginBottom: '32px' }}>
            <h3 className="card-title" style={{ marginBottom: '12px' }}>
              Data Quality & Missing Parameter Inventory
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4B5E57', marginBottom: '16px' }}>
              Transparency in groundwater monitoring requires distinguishing between a verified safe measurement and an untested parameter. Missing parameters indicate analytical data gaps in historical sampling rounds.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {[
                { name: 'pH Readings', missing: station.missingParametersSummary.missingPh },
                { name: 'TDS Readings', missing: station.missingParametersSummary.missingTds },
                { name: 'Fluoride (F)', missing: station.missingParametersSummary.missingFluoride },
                { name: 'Nitrate (NO₃)', missing: station.missingParametersSummary.missingNitrate },
                { name: 'Chloride (Cl)', missing: station.missingParametersSummary.missingChloride },
                { name: 'Total Hardness', missing: station.missingParametersSummary.missingHardness }
              ].map(item => (
                <div key={item.name} style={{ background: '#F8FAF9', padding: '12px 14px', borderRadius: '6px', border: '1px solid #DDE5E1' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{item.name}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px', color: item.missing > 0 ? '#D97706' : '#059669' }}>
                    {item.missing === 0 ? 'Fully Reported' : `${item.missing} missing in history`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Sampling Log Table */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F382A', marginBottom: '14px' }}>
            Chronological Sampling Log ({station.records.length} records)
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Acquisition Time</th>
                  <th>pH</th>
                  <th>TDS (mg/L)</th>
                  <th>EC (µS/cm)</th>
                  <th>Fluoride (mg/L)</th>
                  <th>Nitrate (mg/L)</th>
                  <th>Screening Status</th>
                  <th>Screening Reason</th>
                </tr>
              </thead>
              <tbody>
                {station.records.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td style={{ fontWeight: 600 }}>{r.acquisitionTime}</td>
                    <td>
                      {r.ph !== null ? (
                        <span style={{ fontWeight: 600, color: r.phFlag ? '#DC2626' : '#141E1B' }}>
                          {r.ph.toFixed(2)}
                        </span>
                      ) : <span style={{ color: '#94A3B8' }}>N/A</span>}
                    </td>
                    <td>
                      {r.tds !== null ? (
                        <span style={{ fontWeight: 600, color: r.tdsFlag ? '#DC2626' : '#141E1B' }}>
                          {Math.round(r.tds)}
                        </span>
                      ) : <span style={{ color: '#94A3B8' }}>{r.isTdsUnverifiedZero ? 'Unverified 0' : 'N/A'}</span>}
                    </td>
                    <td>{r.ec !== null ? r.ec : 'N/A'}</td>
                    <td>{r.fluoride !== null ? r.fluoride : 'N/A'}</td>
                    <td>{r.nitrate !== null ? r.nitrate : 'N/A'}</td>
                    <td>
                      {r.needsReview ? (
                        <span className="badge badge-flag-amber">Review Needed</span>
                      ) : (
                        <span className="badge badge-flag-green">Within Limits</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#4B5E57' }}>
                      {r.screeningReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Field Sampling Recommendation Card */}
        <div className="card" style={{ background: '#F0FDFA', borderColor: '#CCFBF1' }}>
          <h4 style={{ color: '#0F766E', fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
            Recommended Field Actions for Ground Analysts
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#134E48', lineHeight: 1.6 }}>
            For stations with recurring threshold crossings or prolonged data gaps, ground teams should verify coordinate positioning, check local well construction (dug well vs. borewell depth), and collect duplicate samples for accredited NABL laboratory testing including heavy metals and microbiological indicators.
          </p>
        </div>
      </div>
    </div>
  );
}
