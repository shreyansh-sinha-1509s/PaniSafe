import React, { useEffect, useState, useMemo } from 'react';
import {
  fetchSummary,
  fetchDistricts,
  fetchRecords,
  fetchTrends,
  getExportUrl
} from '../services/api';
import MetricCard from '../components/MetricCard';
import AlertNotice from '../components/AlertNotice';
import RecordDrawer from '../components/RecordDrawer';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import {
  Database,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Filter,
  Eye,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export default function DashboardPage({ navigate }) {
  const [summaryData, setSummaryData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [histograms, setHistograms] = useState({ ph: [], tds: [] });
  
  // Table records & pagination
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    district: 'all',
    search: '',
    phFlag: 'all',
    tdsFlag: 'all',
    needsReview: 'all',
    startYear: '',
    endYear: ''
  });

  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial load: summary, districts, trends
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [sumRes, distRes, trendRes] = await Promise.all([
          fetchSummary(),
          fetchDistricts(),
          fetchTrends()
        ]);

        if (sumRes.success) {
          setSummaryData(sumRes.data.summary);
          setHistograms(sumRes.data.histograms);
        }
        if (distRes.success) {
          setDistricts(distRes.data);
        }
        if (trendRes.success) {
          setTrends(trendRes.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Load records when filters or page changes
  useEffect(() => {
    async function loadTableRecords() {
      setRecordsLoading(true);
      try {
        const res = await fetchRecords({
          page: pagination.page,
          limit: pagination.limit,
          district: filters.district !== 'all' ? filters.district : undefined,
          search: filters.search ? filters.search : undefined,
          phFlag: filters.phFlag !== 'all' ? filters.phFlag : undefined,
          tdsFlag: filters.tdsFlag !== 'all' ? filters.tdsFlag : undefined,
          needsReview: filters.needsReview !== 'all' ? filters.needsReview : undefined,
          startYear: filters.startYear ? filters.startYear : undefined,
          endYear: filters.endYear ? filters.endYear : undefined
        });

        if (res.success) {
          setRecords(res.records);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Failed to load table records:', err);
      } finally {
        setRecordsLoading(false);
      }
    }

    loadTableRecords();
  }, [filters, pagination.page]);

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      district: 'all',
      search: '',
      phFlag: 'all',
      tdsFlag: 'all',
      needsReview: 'all',
      startYear: '',
      endYear: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExportCsv = () => {
    const exportUrl = getExportUrl({
      district: filters.district !== 'all' ? filters.district : undefined,
      search: filters.search ? filters.search : undefined,
      phFlag: filters.phFlag !== 'all' ? filters.phFlag : undefined,
      tdsFlag: filters.tdsFlag !== 'all' ? filters.tdsFlag : undefined,
      needsReview: filters.needsReview !== 'all' ? filters.needsReview : undefined,
      startYear: filters.startYear ? filters.startYear : undefined,
      endYear: filters.endYear ? filters.endYear : undefined
    });
    window.open(exportUrl, '_blank');
  };

  // Top 10 districts by flagged count for chart
  const districtChartData = useMemo(() => {
    if (!districts || districts.length === 0) return [];
    return [...districts]
      .sort((a, b) => b.flaggedCount - a.flaggedCount)
      .slice(0, 10)
      .map(d => ({
        name: d.district,
        flagged: d.flaggedCount,
        clean: d.recordCount - d.flaggedCount,
        flagRate: d.flagRate
      }));
  }, [districts]);

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Groundwater Quality Screening Dashboard</h1>
            <p className="page-subtitle">
              Interactive analytics and preliminary risk screening synthesized from Central Ground Water Board (CGWB) historical records across Maharashtra.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleExportCsv} className="btn btn-secondary" title="Export filtered records to CSV">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button onClick={() => navigate('/explore')} className="btn btn-primary">
              <Database size={16} />
              <span>Explore All Records</span>
            </button>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <AlertNotice type="disclaimer" title="Decision-Support Screening Notice">
          Screening flags indicate measurements exceeding preliminary thresholds (pH &lt; 6.5 or &gt; 8.5; TDS &gt; 500 mg/L). Flagged records are prioritized for field investigation and <strong>do not constitute confirmed health hazards or drinking-water compliance certifications</strong>.
        </AlertNotice>

        {/* KPI Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard
            title="Total Historical Records"
            value={summaryData ? summaryData.totalRecords : '...'}
            subtext="Cleaned historical samples"
            icon={Database}
            accent="#0F382A"
          />
          <MetricCard
            title="Unique Monitoring Stations"
            value={summaryData ? summaryData.totalStations : '...'}
            subtext="Individually disambiguated"
            icon={MapPin}
            accent="#0D9488"
          />
          <MetricCard
            title="District Coverage"
            value={summaryData ? `${summaryData.totalDistricts} Districts` : '...'}
            subtext="Statewide Maharashtra"
            icon={Layers}
            accent="#166534"
          />
          <MetricCard
            title="Flagged for Review"
            value={summaryData ? summaryData.needsReviewCount : '...'}
            subtext={summaryData ? `${summaryData.overallReviewRate}% of total records` : ''}
            icon={ShieldAlert}
            accent="#D97706"
          />
          <MetricCard
            title="Valid pH Coverage"
            value={summaryData ? summaryData.validPhCount : '...'}
            subtext={summaryData ? `${summaryData.missingPhCount} null values excluded` : ''}
            icon={Activity}
            accent="#0284C7"
          />
          <MetricCard
            title="Usable TDS Coverage"
            value={summaryData ? summaryData.validTdsCount : '...'}
            subtext={summaryData ? `${summaryData.missingTdsCount} unverified 0/nulls` : ''}
            icon={FileSpreadsheet}
            accent="#4F46E5"
          />
          <MetricCard
            title="Data Quality Completeness"
            value={summaryData ? `${summaryData.dataQualityIndex}%` : '...'}
            subtext="Valid parameter completeness"
            icon={CheckCircle2}
            accent="#059669"
          />
        </div>

        {/* Charts Section */}
        <div className="charts-grid-2">
          {/* Chart 1: pH Distribution */}
          <div className="chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">pH Distribution (Preliminary Scale)</h3>
                <p className="card-subtitle">Normal drinking screening range: 6.5 to 8.5</p>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histograms.ph} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name, item) => [`${val.toLocaleString()} samples`, item.payload.label]}
                    contentStyle={{ backgroundColor: '#0F382A', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {histograms.ph.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.flag ? '#D97706' : '#0D9488'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: TDS Distribution */}
          <div className="chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Total Dissolved Solids (TDS) Distribution</h3>
                <p className="card-subtitle">Values &gt; 500 mg/L marked for screening review</p>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histograms.tds} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name, item) => [`${val.toLocaleString()} samples`, item.payload.label]}
                    contentStyle={{ backgroundColor: '#0F382A', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {histograms.tds.map((entry, index) => (
                      <Cell key={`tds-cell-${index}`} fill={entry.flag ? '#DC2626' : '#14B8A6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Top Districts by Flags */}
          <div className="chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Top 10 Districts by Screening Need</h3>
                <p className="card-subtitle">Samples flagged for pH or TDS review vs. within threshold</p>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F382A', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="flagged" name="Review Needed" stackId="a" fill="#D97706" />
                  <Bar dataKey="clean" name="Within Threshold" stackId="a" fill="#0D9488" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Historical Sampling Records Over Time */}
          <div className="chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Historical Sampling Records Over Time</h3>
                <p className="card-subtitle">Annual sampling volume and screening review rates</p>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F382A', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="recordCount" name="Total Records" stroke="#0D9488" fillOpacity={1} fill="url(#colorRec)" />
                  <Area type="monotone" dataKey="flaggedCount" name="Flagged Records" stroke="#D97706" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">District Filter</label>
            <select
              className="filter-control"
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
            >
              <option value="all">All Districts ({districts.length})</option>
              {districts.map(d => (
                <option key={d.district} value={d.district}>
                  {d.district} ({d.recordCount})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Search Station / Village</label>
            <input
              type="text"
              className="filter-control"
              placeholder="e.g., Khed, Well, Pune..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Review Status</label>
            <select
              className="filter-control"
              value={filters.needsReview}
              onChange={(e) => handleFilterChange('needsReview', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="true">Flagged for Review Only</option>
              <option value="false">Within Screening Limits</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">pH Screening Flag</label>
            <select
              className="filter-control"
              value={filters.phFlag}
              onChange={(e) => handleFilterChange('phFlag', e.target.value)}
            >
              <option value="all">Any pH</option>
              <option value="true">pH Flagged (&lt;6.5 or &gt;8.5)</option>
              <option value="false">pH Normal (6.5 - 8.5)</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">TDS Screening Flag</label>
            <select
              className="filter-control"
              value={filters.tdsFlag}
              onChange={(e) => handleFilterChange('tdsFlag', e.target.value)}
            >
              <option value="all">Any TDS</option>
              <option value="true">TDS Flagged (&gt;500 mg/L)</option>
              <option value="false">TDS Normal (≤500 mg/L)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', paddingTop: '16px' }}>
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              title="Reset all filters"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Recent Screening Review Table */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F382A' }}>
              Screening Records Table ({pagination.total.toLocaleString()} matching records)
            </h3>
            <span style={{ fontSize: '0.825rem', color: '#64748B' }}>
              Showing {records.length} of {pagination.total} records
            </span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Station Name</th>
                  <th>District</th>
                  <th>Sampling Date</th>
                  <th>pH</th>
                  <th>TDS (mg/L)</th>
                  <th>Screening Status</th>
                  <th>Screening Reason</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recordsLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                      Loading records from backend engine...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="table-empty">
                      No records match the selected screening criteria. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  records.map(rec => (
                    <tr key={rec.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedRecord(rec)}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F382A' }}>{rec.station}</div>
                        <div style={{ fontSize: '0.75rem', color: '#7E938B' }}>{rec.village || rec.tehsil || 'CGWB'}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{rec.district}</span>
                      </td>
                      <td style={{ color: '#4B5E57', whiteSpace: 'nowrap' }}>
                        {rec.samplingDate || rec.acquisitionTime?.substring(0, 10)}
                      </td>
                      <td>
                        {rec.ph !== null ? (
                          <span style={{
                            fontWeight: 600,
                            color: rec.phFlag ? '#DC2626' : '#141E1B'
                          }}>
                            {rec.ph.toFixed(2)}
                            {rec.phFlag && <span title="pH outside 6.5 - 8.5" style={{ marginLeft: '4px', color: '#DC2626' }}>*</span>}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        {rec.tds !== null ? (
                          <span style={{
                            fontWeight: 600,
                            color: rec.tdsFlag ? '#DC2626' : '#141E1B'
                          }}>
                            {Math.round(rec.tds)}
                            {rec.tdsFlag && <span title="TDS exceeds 500 mg/L" style={{ marginLeft: '4px', color: '#DC2626' }}>*</span>}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                            {rec.isTdsUnverifiedZero ? 'Unverified 0' : 'N/A'}
                          </span>
                        )}
                      </td>
                      <td>
                        {rec.needsReview ? (
                          <span className="badge badge-flag-amber">
                            <span className="badge-dot" style={{ background: '#D97706' }} />
                            Review Needed
                          </span>
                        ) : (
                          <span className="badge badge-flag-green">
                            <span className="badge-dot" style={{ background: '#059669' }} />
                            Within Limits
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: '280px', fontSize: '0.8rem', color: '#4B5E57' }}>
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
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination">
            <div>
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong>
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1 || recordsLoading}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages || recordsLoading}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Record Detail Slide-Over Drawer */}
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
