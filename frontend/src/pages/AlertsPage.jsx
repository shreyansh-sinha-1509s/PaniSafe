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
  Filter,
  Eye,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2
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
            <h1 className="page-title">Screening Alerts & Investigation Review</h1>
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
          Screening flags identify records exceeding preliminary benchmark values: <strong>pH outside 6.5–8.5</strong> or <strong>TDS exceeding 500 mg/L</strong>. In accordance with environmental monitoring standards, these are classified as <em>"Review Recommended"</em> or <em>"Selected Threshold Exceeded"</em>. They <strong>must not be labeled as 'toxic', 'dangerous', or 'confirmed contaminated'</strong> without physical resanpling and complete microbiological and toxicological laboratory testing.
        </AlertNotice>

        {/* Flag Metric Breakdown Cards */}
        <div className="metrics-grid">
          <MetricCard
            title="Total Flagged Records"
            value={screeningStats ? screeningStats.totalFlagged : '...'}
            subtext="Records requiring review"
            icon={ShieldAlert}
            accent="#D97706"
          />
          <MetricCard
            title="pH Screening Flags"
            value={screeningStats ? screeningStats.phFlags : '...'}
            subtext="Values < 6.5 or > 8.5"
            icon={Activity}
            accent="#DC2626"
          />
          <MetricCard
            title="TDS Screening Flags"
            value={screeningStats ? screeningStats.tdsFlags : '...'}
            subtext="Values > 500 mg/L"
            icon={Activity}
            accent="#EA580C"
          />
          <MetricCard
            title="Both Flags Active"
            value={screeningStats ? screeningStats.bothFlags : '...'}
            subtext="Dual threshold exceedance"
            icon={AlertTriangle}
            accent="#9333EA"
          />
        </div>

        {/* Threshold Guidelines Reference Card */}
        <div className="card" style={{ marginBottom: '24px', background: '#F8FAF9' }}>
          <h3 className="card-title" style={{ marginBottom: '8px' }}>
            Preliminary Screening Threshold Definitions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '6px', border: '1px solid #DDE5E1' }}>
              <div style={{ fontWeight: 700, color: '#0F382A', marginBottom: '4px' }}>pH Scale Range: 6.5 – 8.5</div>
              <p style={{ color: '#4B5E57', lineHeight: 1.5 }}>
                Derived from standard drinking water guidelines (BIS IS 10500:2012 acceptable limits). Readings outside this interval indicate potential pipe corrosion (&lt;6.5) or excessive incrustation/mineral hardness (&gt;8.5). Unrealistic readings (&lt;0 or &gt;14) are excluded as instrument errors.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '6px', border: '1px solid #DDE5E1' }}>
              <div style={{ fontWeight: 700, color: '#0F382A', marginBottom: '4px' }}>TDS Limit: &gt; 500 mg/L</div>
              <p style={{ color: '#4B5E57', lineHeight: 1.5 }}>
                Total Dissolved Solids reflects dissolved mineral content. While IS 10500 allows up to 2,000 mg/L in the absence of alternate sources, 500 mg/L represents the desirable threshold for palatability and screening triage. Zero TDS values are treated as unverified.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
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
              <option value="all">All Flagged Records</option>
              <option value="ph">pH Flag Only</option>
              <option value="tds">TDS Flag Only</option>
              <option value="both">Both pH & TDS Flagged</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', paddingTop: '16px' }}>
            <button onClick={handleReset} className="btn btn-secondary">
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Alert Records Table */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F382A' }}>
              Records Flagged for Investigation ({pagination.total.toLocaleString()} records)
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Station / Location</th>
                  <th>District</th>
                  <th>Sampling Date</th>
                  <th>pH Reading</th>
                  <th>TDS Reading</th>
                  <th>Flag Classification</th>
                  <th>Screening Reason</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                      Loading review queue...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="table-empty">
                      No records match the selected review criteria.
                    </td>
                  </tr>
                ) : (
                  records.map(rec => (
                    <tr key={rec.id} onClick={() => setSelectedRecord(rec)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F382A' }}>{rec.station}</div>
                        <div style={{ fontSize: '0.75rem', color: '#7E938B' }}>{rec.village || rec.tehsil}</div>
                      </td>
                      <td>{rec.district}</td>
                      <td style={{ color: '#4B5E57', whiteSpace: 'nowrap' }}>
                        {rec.samplingDate || rec.acquisitionTime?.substring(0, 10)}
                      </td>
                      <td>
                        {rec.ph !== null ? (
                          <span style={{ fontWeight: 600, color: rec.phFlag ? '#DC2626' : '#141E1B' }}>
                            {rec.ph.toFixed(2)}
                            {rec.phFlag && ' (Flag)'}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td>
                        {rec.tds !== null ? (
                          <span style={{ fontWeight: 600, color: rec.tdsFlag ? '#DC2626' : '#141E1B' }}>
                            {Math.round(rec.tds)} mg/L
                            {rec.tdsFlag && ' (Flag)'}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td>
                        {rec.phFlag && rec.tdsFlag ? (
                          <span className="badge badge-flag-red">Dual Flag (pH + TDS)</span>
                        ) : rec.phFlag ? (
                          <span className="badge badge-flag-amber">pH Out of Range</span>
                        ) : (
                          <span className="badge badge-flag-amber">TDS &gt; 500 mg/L</span>
                        )}
                      </td>
                      <td style={{ maxWidth: '300px', fontSize: '0.8rem', color: '#4B5E57' }}>
                        {rec.screeningReason}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(rec);
                          }}
                          className="btn btn-secondary btn-sm"
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
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div>
              Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Record Details Slide Drawer */}
        {selectedRecord && (
          <RecordDrawer
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onNavigateStation={(stId) => navigate(`/stations/${stId}`)}
          />
        )}
      </div>
    </div>
  );
}
