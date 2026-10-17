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
  RotateCcw,
  Download,
  Eye,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
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

  const [_loading, setLoading] = useState(true);
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
  }, [filters, pagination.page, pagination.limit]);

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
              Interactive analytics and decision-support screening based on a deterministic synthetic benchmark dataset modeled on Maharashtra regional hydrogeology and BIS IS 10500:2012 standards.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExportCsv} className="btn btn-secondary" title="Export filtered records to CSV">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button onClick={() => navigate('/explore')} className="btn btn-primary">
              <Database size={16} />
              <span>Explore All 18,249 Records</span>
            </button>
          </div>
        </div>

        {error && (
          <AlertNotice type="danger" title="Engine Communication Error">
            {error}. Verify that the Pani Safe backend service is active.
          </AlertNotice>
        )}

        {/* Disclaimer Notice */}
        <AlertNotice type="disclaimer" title="Decision-Support Screening Notice">
          Screening flags indicate measurements exceeding preliminary thresholds (pH &lt; 6.5 or &gt; 8.5; TDS &gt; 500 mg/L per BIS IS 10500:2012). Flagged records indicate stations prioritized for field laboratory verification and <strong>do not constitute confirmed health hazards or drinking-water compliance certifications</strong>.
        </AlertNotice>

        {/* KPI Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard
            title="Total Benchmark Records"
            value={summaryData ? summaryData.totalRecords : '...'}
            subtext="Synthetic benchmark samples"
            icon={Database}
            accent="#0D9488"
          />
          <MetricCard
            title="Unique Monitoring Stations"
            value={summaryData ? summaryData.totalStations : '...'}
            subtext="Individually disambiguated"
            icon={MapPin}
            accent="#14B8A6"
          />
          <MetricCard
            title="District Coverage"
            value={summaryData ? `${summaryData.totalDistricts} Districts` : '...'}
            subtext="Statewide Maharashtra"
            icon={Layers}
            accent="#64748B"
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
            subtext={summaryData ? `${summaryData.missingPhCount} null values preserved` : ''}
            icon={Activity}
            accent="#0D9488"
          />
          <MetricCard
            title="Usable TDS Coverage"
            value={summaryData ? summaryData.validTdsCount : '...'}
            subtext={summaryData ? `${summaryData.missingTdsCount} unverified 0/nulls` : ''}
            icon={FileSpreadsheet}
            accent="#14B8A6"
          />
          <MetricCard
            title="Data Quality Completeness"
            value={summaryData ? `${summaryData.dataQualityIndex}%` : '...'}
            subtext="Average parameter completeness"
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }} />
                  <Tooltip
                    formatter={(val, name, item) => [`${val.toLocaleString()} samples`, item.payload.label]}
                    contentStyle={{ backgroundColor: '#0E1520', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#F8FAFC' }}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }} />
                  <Tooltip
                    formatter={(val, name, item) => [`${val.toLocaleString()} samples`, item.payload.label]}
                    contentStyle={{ backgroundColor: '#0E1520', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#F8FAFC' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {histograms.tds.map((entry, index) => (
                      <Cell key={`tds-cell-${index}`} fill={entry.flag ? '#D97706' : '#0D9488'} />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0E1520', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: 'rgba(255,255,255,0.75)' }} />
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
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0E1520', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#F8FAFC' }}
                  />
                  <Area type="monotone" dataKey="recordCount" name="Total Records" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRec)" />
                  <Area type="monotone" dataKey="flaggedCount" name="Flagged Records" stroke="#D97706" strokeWidth={2} fillOpacity={0} />
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
              <option value="true">Exceeds 6.5–8.5</option>
              <option value="false">Within 6.5–8.5</option>
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
              <option value="true">&gt; 500 mg/L Flagged</option>
              <option value="false">≤ 500 mg/L Desirable</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '9px 12px' }}
              title="Reset all filters"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filtered Records Table Preview */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 className="font-semibold text-lg text-slate-100">
                Matching Groundwater Sample Records
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Showing {records.length} of {pagination.total.toLocaleString()} filtered records
              </p>
            </div>
            <button onClick={() => navigate('/explore')} className="btn btn-secondary btn-sm">
              <span>View in Full Data Explorer →</span>
            </button>
          </div>

          <div className="table-container">
            {recordsLoading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#0D9488' }}>
                Loading records from data engine...
              </div>
            ) : records.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                No records match the selected filter criteria. Try broadening your search.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Station Name</th>
                    <th>District</th>
                    <th>Sampling Date</th>
                    <th>pH</th>
                    <th>TDS (mg/L)</th>
                    <th>Screening Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.recordId}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{r.station}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)' }}>{r.village || 'Station Site'}</div>
                      </td>
                      <td>{r.district}</td>
                      <td>{r.samplingDate || r.acquisitionTime?.substring(0, 10) || 'Historical'}</td>
                      <td>
                        {r.ph !== null ? (
                          <span style={{ fontWeight: 600, color: r.phFlag ? '#F59E0B' : '#FFFFFF' }}>
                            {r.ph}
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        {r.tds !== null ? (
                          r.tds === 0 ? (
                            <span style={{ color: '#F59E0B', fontSize: '0.75rem' }}>0 (Unverified)</span>
                          ) : (
                            <span style={{ fontWeight: 600, color: r.tdsFlag ? '#F59E0B' : '#FFFFFF' }}>
                              {r.tds}
                            </span>
                          )
                        ) : (
                          <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        {r.needsReview ? (
                          <span className="badge badge-amber">
                            ● Review Recommended
                          </span>
                        ) : (
                          <span className="badge badge-green">
                            ● Within Limits
                          </span>
                        )}
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
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pagination-bar">
                <div>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total.toLocaleString()} total items)
                </div>
                <div className="pagination-controls">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    className="pagination-btn"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    className="pagination-btn"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
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
