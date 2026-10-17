import React, { useEffect, useState } from 'react';
import { fetchDistricts, fetchRecords, getExportUrl } from '../services/api';
import RecordDrawer from '../components/RecordDrawer';
import AlertNotice from '../components/AlertNotice';
import {
  Search,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function ExplorePage({ navigate }) {
  const [districts, setDistricts] = useState([]);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [filters, setFilters] = useState({
    district: 'all',
    search: '',
    phFlag: 'all',
    tdsFlag: 'all',
    needsReview: 'all',
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
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchRecords({
          page: pagination.page,
          limit: pagination.limit,
          district: filters.district !== 'all' ? filters.district : undefined,
          search: filters.search ? filters.search : undefined,
          phFlag: filters.phFlag !== 'all' ? filters.phFlag : undefined,
          tdsFlag: filters.tdsFlag !== 'all' ? filters.tdsFlag : undefined,
          needsReview: filters.needsReview !== 'all' ? filters.needsReview : undefined,
          sort: filters.sort,
          order: filters.order
        });
        if (res.success) {
          setRecords(res.records);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters, pagination.page, pagination.limit]);

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      district: 'all',
      search: '',
      phFlag: 'all',
      tdsFlag: 'all',
      needsReview: 'all',
      sort: 'acquisitionTime',
      order: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExportCsv = () => {
    const url = getExportUrl({
      district: filters.district !== 'all' ? filters.district : undefined,
      search: filters.search ? filters.search : undefined,
      phFlag: filters.phFlag !== 'all' ? filters.phFlag : undefined,
      tdsFlag: filters.tdsFlag !== 'all' ? filters.tdsFlag : undefined,
      needsReview: filters.needsReview !== 'all' ? filters.needsReview : undefined
    });
    window.open(url, '_blank');
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Explore Groundwater Records</h1>
            <p className="page-subtitle">
              Comprehensive search across 18,249 historical sample events. Deterministic synthetic demonstration dataset modeled on Maharashtra regional hydrogeology.
            </p>
          </div>
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <Download size={16} />
            <span>Download Filtered CSV</span>
          </button>
        </div>

        {/* Disclaimer Notice */}
        <AlertNotice type="disclaimer" title="Deterministic Synthetic Dataset (Seed 20260427)">
          Records are generated using a deterministic fixed seed for reproducible evaluation across Maharashtra's 36 administrative districts. Screening flags indicate preliminary benchmark exceedance per BIS IS 10500:2012, not verified laboratory findings.
        </AlertNotice>

        {/* Filter Controls Bar */}
        <div className="filter-bar">
          <div className="filter-group" style={{ flex: 2 }}>
            <label className="filter-label">Search Station / Village / Block</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="filter-control"
                style={{ width: '100%', paddingLeft: '34px' }}
                placeholder="Search by station, village, block, tehsil..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Search size={16} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">District Filter</label>
            <select
              className="filter-control"
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
            >
              <option value="all">All Districts ({districts.length})</option>
              {districts.map(d => (
                <option key={d.district} value={d.district}>{d.district}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Screening Status</label>
            <select
              className="filter-control"
              value={filters.needsReview}
              onChange={(e) => handleFilterChange('needsReview', e.target.value)}
            >
              <option value="all">All Records</option>
              <option value="true">Review Recommended Only</option>
              <option value="false">Within Screening Limits</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              className="filter-control"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="acquisitionTime">Sampling Date</option>
              <option value="ph">pH Value</option>
              <option value="tds">TDS Value</option>
              <option value="district">District</option>
              <option value="station">Station Name</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Order</label>
            <select
              className="filter-control"
              value={filters.order}
              onChange={(e) => handleFilterChange('order', e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', paddingTop: '16px' }}>
            <button onClick={handleReset} className="btn btn-secondary" title="Reset filters">
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Results summary bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          <div>
            Found <strong style={{ color: '#14B8A6' }}>{pagination.total.toLocaleString()}</strong> records matching query
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Rows per page:</span>
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

        {/* Explore Data Table */}
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Station / Location</th>
                <th>District</th>
                <th>Sampling Date</th>
                <th>pH</th>
                <th>TDS (mg/L)</th>
                <th>EC (µS/cm)</th>
                <th>Fluoride (mg/L)</th>
                <th>Nitrate (mg/L)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '48px', color: '#14B8A6' }}>
                    Loading matching groundwater records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '48px', color: 'rgba(255, 255, 255, 0.45)' }}>
                    No records match your selected filters. Try broadening your search.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.recordId}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{r.station}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                        {r.village || 'Station Site'}
                      </div>
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
                    <td>{r.ec !== null ? r.ec : <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>}</td>
                    <td>{r.fluoride !== null ? r.fluoride : <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>}</td>
                    <td>{r.nitrate !== null ? r.nitrate : <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>}</td>
                    <td>
                      {r.needsReview ? (
                        <span className="badge badge-amber">
                          ● Review Needed
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
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Bar */}
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
