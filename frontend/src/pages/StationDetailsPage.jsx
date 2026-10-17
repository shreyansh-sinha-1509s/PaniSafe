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
          <div style={{ color: '#14B8A6', fontSize: '1.2rem', fontWeight: 600 }}>
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
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/explore')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Data Explorer</span>
          </button>
        </div>

        {/* Station Title Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14B8A6', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <MapPin size={15} />
              <span>{station.district} District • Station Timeline Profile</span>
            </div>
            <h1 className="page-title" style={{ marginTop: '6px' }}>{station.station}</h1>
            <p className="page-subtitle">
              Location: {station.village ? `${station.village}, ` : ''}{station.tehsil ? `${station.tehsil}, ` : ''}{station.district}, Maharashtra. Synthetic benchmark station model.
            </p>
          </div>

          <div>
            {station.flaggedCount > 0 ? (
              <span className="badge badge-amber" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Review Recommended ({station.flaggedCount} of {station.recordCount} samples exceed benchmark)
              </span>
            ) : (
              <span className="badge badge-green" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Within Preliminary Screening Thresholds
              </span>
            )}
          </div>
        </div>

        {/* Temporal Disclaimer Banner */}
        <AlertNotice type="disclaimer" title="Historical Baseline Screening Notice">
          The records presented below represent historical periodic sampling. <strong>Historical measurements do not represent live real-time sensor monitoring or verify current drinking water conditions today</strong>. Water conditions fluctuate seasonally and require local certified water testing before consumption.
        </AlertNotice>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <MetricCard
            title="Total Historical Samples"
            value={station.recordCount}
            subtext="Available laboratory analyses"
            icon={FileSpreadsheet}
            accent="#0D9488"
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
            subtext="Desirable limit: 500 mg/L"
            icon={Activity}
            accent="#0D9488"
          />
        </div>

        {/* Charts & Trends */}
        <div className="charts-grid-2">
          {/* pH Trend */}
          <div className="chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Historical pH Trend</h3>
                <p className="card-subtitle">Screening guideline: 6.5 to 8.5 (No relaxation under IS 10500)</p>
              </div>
            </div>
            <div className="chart-container">
              {hasSufficientHistory ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                    <YAxis domain={[5, 10]} tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0E1520', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#FFF' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }} />
                    <Line type="monotone" dataKey="ph" name="pH Value" stroke="#0D9488" strokeWidth={2} dot={{ r: 4, fill: '#0D9488' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '20px' }}>
                  <Info size={28} color="#14B8A6" style={{ marginBottom: '8px' }} />
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
                <p className="card-subtitle">Desirable threshold: 500 mg/L (Permissible to 2,000 mg/L)</p>
              </div>
            </div>
            <div className="chart-container">
              {hasSufficientHistory ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0E1520', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#FFF' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }} />
                    <Line type="monotone" dataKey="tds" name="TDS (mg/L)" stroke="#D97706" strokeWidth={2} dot={{ r: 4, fill: '#D97706' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '20px' }}>
                  <Info size={28} color="#14B8A6" style={{ marginBottom: '8px' }} />
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
          <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
            <h3 className="font-body font-semibold text-lg text-slate-200 mb-2">
              Data Quality & Missing Parameter Inventory
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '20px', lineHeight: 1.6 }}>
              Transparency in groundwater monitoring requires distinguishing between a verified measurement and an untested parameter. Missing parameters indicate analytical data gaps in historical sampling campaigns.
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
                <div key={item.name} className="card-subtle rounded-xl p-4">
                  <div style={{ fontSize: '0.775rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.name}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px', color: item.missing > 0 ? '#F59E0B' : '#10B981' }}>
                    {item.missing === 0 ? 'Fully Reported' : `${item.missing} missing in records`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chronological Sampling Records Table */}
        <div style={{ marginBottom: '40px' }}>
          <h3 className="font-body font-semibold text-lg text-slate-200 mb-3">
            Complete Chronological Sampling History
          </h3>

          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sample ID</th>
                  <th>Sampling Date</th>
                  <th>pH</th>
                  <th>TDS (mg/L)</th>
                  <th>EC (µS/cm)</th>
                  <th>Hardness</th>
                  <th>Fluoride</th>
                  <th>Nitrate</th>
                  <th>Screening Status</th>
                </tr>
              </thead>
              <tbody>
                {station.records.map(r => (
                  <tr key={r.recordId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#14B8A6' }}>{r.recordId}</td>
                    <td>{r.samplingDate || r.acquisitionTime?.substring(0, 10)}</td>
                    <td>
                      {r.ph !== null ? (
                        <span style={{ fontWeight: 600, color: r.phFlag ? '#F59E0B' : '#FFFFFF' }}>{r.ph}</span>
                      ) : (
                        <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      {r.tds !== null ? (
                        r.tds === 0 ? (
                          <span style={{ color: '#F59E0B', fontSize: '0.75rem' }}>0 (Unverified)</span>
                        ) : (
                          <span style={{ fontWeight: 600, color: r.tdsFlag ? '#F59E0B' : '#FFFFFF' }}>{r.tds}</span>
                        )
                      ) : (
                        <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic' }}>N/A</span>
                      )}
                    </td>
                    <td>{r.ec || <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic' }}>N/A</span>}</td>
                    <td>{r.hardness || <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic' }}>N/A</span>}</td>
                    <td>{r.fluoride || <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic' }}>N/A</span>}</td>
                    <td>{r.nitrate || <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic' }}>N/A</span>}</td>
                    <td>
                      {r.needsReview ? (
                        <span className="badge badge-amber">● Review Recommended</span>
                      ) : (
                        <span className="badge badge-green">● Within Limits</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
