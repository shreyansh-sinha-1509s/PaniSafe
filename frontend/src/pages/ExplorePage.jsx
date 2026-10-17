import React, { useEffect, useState } from 'react';
import { fetchDistricts, fetchRecords, getExportUrl } from '../services/api';
import RecordDrawer from '../components/RecordDrawer';
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
              Comprehensive search across 18,249 historical Central Ground Water Board records. Transparent laboratory chemistry without fabricated values.
            </p>
          </div>
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <Download size={16} />
            <span>Download Filtered CSV</span>
          </button>
        </div>

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
              <Search size={16} color="#7E938B" style={{ position: 'absolute', left: '10px', top: '11px' }} />
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
              <option value="true">Flagged for Review</option>
              <option value="false">Within Thresholds</option>
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
          marginBottom: '12px',
          fontSize: '0.85rem',
          color: '#4B5E57'
        }}>
          <div>
            Found <strong>{pagination.total.toLocaleString()}</strong> records matching query
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Rows per page:</span>
            <select
              value={pagination.limit}
              onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
              style={{
                border: '1px solid #DDE5E1',
                borderRadius: '4px',
                padding: '3px 8px',
                background: '#FFFFFF',
                fontSize: '0.825rem'
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Explore Data Table */}
        <div className="table-container">
          <table>
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
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Loading matching groundwater records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="10" className="table-empty">
                    No groundwater records found matching the given parameters. Try adjusting your search query.
                  </td>
                </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id} onClick={() => setSelectedRecord(rec)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F382A' }}>{rec.station}</div>
                      <div style={{ fontSize: '0.75rem', color: '#7E938B' }}>{rec.village || rec.block || 'CGWB'}</div>
                    </td>
                    <td>{rec.district}</td>
                    <td style={{ color: '#4B5E57', whiteSpace: 'nowrap' }}>
                      {rec.samplingDate || rec.acquisitionTime?.substring(0, 10)}
                    </td>
                    <td>
                      {rec.ph !== null ? (
                        <span style={{ fontWeight: 600, color: rec.phFlag ? '#DC2626' : '#141E1B' }}>
                          {rec.ph.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      {rec.tds !== null ? (
                        <span style={{ fontWeight: 600, color: rec.tdsFlag ? '#DC2626' : '#141E1B' }}>
                          {Math.round(rec.tds)}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          {rec.isTdsUnverifiedZero ? 'Unverified 0' : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td>
                      {rec.ec !== null ? (
                        <span>{rec.ec}</span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      {rec.fluoride !== null ? (
                        <span>{rec.fluoride}</span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      {rec.nitrate !== null ? (
                        <span>{rec.nitrate}</span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      {rec.needsReview ? (
                        <span className="badge badge-flag-amber">Review Needed</span>
                      ) : (
                        <span className="badge badge-flag-green">Within Limits</span>
                      )}
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
