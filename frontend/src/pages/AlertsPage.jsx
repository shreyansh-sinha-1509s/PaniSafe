import React, { useEffect, useState } from 'react';
import { fetchAlerts, fetchDistricts, getExportUrl } from '../services/api';
import MetricCard from '../components/MetricCard';
import AlertNotice from '../components/AlertNotice';
import RecordDrawer from '../components/RecordDrawer';
import {
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Download,
  Eye,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AlertsPage({ navigate }) {
  const [districts, setDistricts] = useState([]);
  const [records, setRecords] = useState([]);
  const [screeningStats, setScreeningStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [filters, setFilters] = useState({
    district: 'all',
    search: '',
    flagType: 'all', // all, ph, tds, both
    sort: 'acquisitionTime',
    order: 'desc'
  });

  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await fetchDistricts();
        if (res.success) setDistricts(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadDistricts();
  }, []);

  useEffect(() => {
    async function loadAlertRecords() {
      setLoading(true);
      try {
        let phFlag = undefined;
        let tdsFlag = undefined;
        if (filters.flagType === 'ph') {
          phFlag = 'true';
        } else if (filters.flagType === 'tds') {
          tdsFlag = 'true';
        } else if (filters.flagType === 'both') {
          phFlag = 'true';
          tdsFlag = 'true';
        }

        const res = await fetchAlerts({
          page: pagination.page,
          limit: pagination.limit,
          district: filters.district !== 'all' ? filters.district : undefined,
          search: filters.search ? filters.search : undefined,
          phFlag,
          tdsFlag,
          sort: filters.sort,
          order: filters.order
        });

        if (res.success) {
          setRecords(res.records);
          setPagination(res.pagination);
          if (res.screeningStats) {
            setScreeningStats(res.screeningStats);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAlertRecords();
  }, [filters, pagination.page, pagination.limit]);

  const handleExportCsv = () => {
    let phFlag = undefined;
    let tdsFlag = undefined;
    if (filters.flagType === 'ph') phFlag = 'true';
    if (filters.flagType === 'tds') tdsFlag = 'true';
    if (filters.flagType === 'both') {
      phFlag = 'true';
      tdsFlag = 'true';
    }

    const url = getExportUrl({
      needsReview: 'true',
      district: filters.district !== 'all' ? filters.district : undefined,
      search: filters.search ? filters.search : undefined,
      phFlag,
      tdsFlag
    });
    window.open(url, '_blank');
  };

  const handleReset = () => {
    setFilters({
      district: 'all',
      search: '',
      flagType: 'all',
      sort: 'acquisitionTime',
      order: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Screening Alerts & Investigation Queue</h1>
            <p className="page-subtitle">
              Prioritization queue of historical records crossing preliminary environmental thresholds. Objective criteria designed to triage stations for field validation.
            </p>
          </div>
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <Download size={16} />
            <span>Export Flagged Records (CSV)</span>
          </button>
        </div>

        {/* Scientific Disclaimer */}
        <AlertNotice type="warning" title="Neutral Screening Terminology Notice">
          Screening flags identify records exceeding preliminary benchmark values: <strong>pH outside 6.5–8.5</strong> or <strong>TDS exceeding 500 mg/L</strong>. In accordance with environmental monitoring standards, these are classified as <em>"Review Recommended"</em> or <em>"Benchmark Exceeded"</em>. They <strong>must not be labeled as 'toxic', 'dangerous', or 'confirmed contaminated'</strong> without physical resampling and complete microbiological and toxicological laboratory testing.
        </AlertNotice>

        {/* Flag Metric Breakdown Cards */}
        <div className="metrics-grid">
          <MetricCard
            title="Total Flagged Records"
            value={screeningStats ? screeningStats.totalFlagged : '...'}
            subtext="Records crossing benchmark"
            icon={ShieldAlert}
            accent="#F59E0B"
          />
          <MetricCard
            title="pH Screening Flags"
            value={screeningStats ? screeningStats.phFlags : '...'}
            subtext="Values < 6.5 or > 8.5"
            icon={Activity}
            accent="#EF4444"
          />
          <MetricCard
            title="TDS Screening Flags"
            value={screeningStats ? screeningStats.tdsFlags : '...'}
            subtext="Values > 500 mg/L"
            icon={Activity}
            accent="#F97316"
          />
          <MetricCard
            title="Both Flags Active"
            value={screeningStats ? screeningStats.bothFlags : '...'}
            subtext="Dual benchmark exceedance"
            icon={AlertTriangle}
            accent="#A855F7"
          />
        </div>

        {/* Threshold Guidelines Reference Card */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h3 className="font-body font-semibold text-lg text-slate-200 mb-3">
            Preliminary Screening Threshold Definitions (BIS IS 10500:2012)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
            <div className="card-subtle p-4 rounded-xl">
              <div style={{ fontWeight: 600, color: '#14B8A6', marginBottom: '6px' }}>pH Scale Range: 6.5 – 8.5 (No relaxation)</div>
              <p style={{ color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.55 }}>
                Derived from standard drinking water guidelines (BIS IS 10500:2012 acceptable limits). Readings outside this interval indicate potential pipe corrosion (&lt;6.5) or excessive mineral encrustation (&gt;8.5). Unrealistic readings (&lt;0 or &gt;14) are excluded as instrument errors.
              </p>
            </div>
            <div className="card-subtle p-4 rounded-xl">
              <div style={{ fontWeight: 600, color: '#14B8A6', marginBottom: '6px' }}>TDS Limit: &gt; 500 mg/L (Permissible to 2,000 mg/L)</div>
              <p style={{ color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.55 }}>
                Total Dissolved Solids reflects dissolved mineral content. While IS 10500 allows up to 2,000 mg/L in the absence of alternate sources, 500 mg/L represents the desirable threshold for palatability and screening triage. Zero TDS values are treated as unverified.
              </p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filter-bar">
          <div className="filter-group" style={{ flex: 1.5 }}>
            <label className="filter-label">Search Station / Village</label>
            <input
              type="text"
              className="filter-control"
              placeholder="Search station or village name..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">District</label>
            <select
              className="filter-control"
              value={filters.district}
              onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
            >
              <option value="all">All Districts</option>
              {districts.map(d => (
                <option key={d.district} value={d.district}>{d.district}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Flag Type</label>
            <select
              className="filter-control"
              value={filters.flagType}
              onChange={(e) => setFilters(prev => ({ ...prev, flagType: e.target.value }))}
            >
              <option value="all">All Exceedances</option>
              <option value="ph">pH Exceedances Only</option>
              <option value="tds">TDS Exceedances Only</option>
              <option value="both">Both pH & TDS Exceeded</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort</label>
            <select
              className="filter-control"
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            >
              <option value="acquisitionTime">Sampling Date</option>
              <option value="tds">TDS Value</option>
              <option value="ph">pH Value</option>
              <option value="district">District</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', paddingTop: '16px' }}>
            <button onClick={handleReset} className="btn btn-secondary">
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Results Count & Limit Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          <div>
            Showing <strong style={{ color: '#F59E0B' }}>{pagination.total.toLocaleString()}</strong> records flagged for screening review
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Rows:</span>
            <select
              value={pagination.limit}
              onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
              className="form-select"
              style={{
                width: 'auto',
                padding: '4px 28px 4px 12px',
                fontSize: '0.8rem',
                minWidth: '70px'
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Station / Location</th>
                <th>District</th>
                <th>Sampling Date</th>
                <th>pH Value</th>
                <th>TDS (mg/L)</th>
                <th>Screening Exceedance Reason</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#14B8A6' }}>
                    Loading prioritized screening review queue...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'rgba(255, 255, 255, 0.45)' }}>
                    No flagged records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                records.map(r => (
                  <tr key={r.recordId}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{r.station}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                        {r.village ? `${r.village}, ` : ''}{r.tehsil || ''}
                      </div>
                    </td>
                    <td>{r.district}</td>
                    <td>{r.samplingDate || r.acquisitionTime?.substring(0, 10)}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: r.phFlag ? '#EF4444' : '#FFFFFF' }}>
                        {r.ph !== null ? r.ph : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: r.tdsFlag ? '#F59E0B' : '#FFFFFF' }}>
                        {r.tds !== null ? r.tds : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '0.825rem', color: '#FCD34D', fontWeight: 500 }}>
                          {r.screeningReason || 'Preliminary benchmark threshold exceeded'}
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {r.phFlag && (
                            <span className="badge badge-red" style={{ fontSize: '0.675rem', padding: '2px 6px' }}>
                              pH Exceedance
                            </span>
                          )}
                          {r.tdsFlag && (
                            <span className="badge badge-amber" style={{ fontSize: '0.675rem', padding: '2px 6px' }}>
                              TDS &gt; 500 mg/L
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="btn btn-glass btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination-bar">
              <div>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total.toLocaleString()} total items)
              </div>
              <div className="pagination-controls">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="pagination-btn"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="pagination-btn"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slide-over Inspection Drawer */}
        <RecordDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onNavigateStation={(stId) => navigate(`/stations/${encodeURIComponent(stId)}`)}
        />
      </div>
    </div>
  );
}
