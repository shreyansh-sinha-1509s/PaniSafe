import React, { useEffect, useState } from 'react';
import { fetchDistricts, fetchStations } from '../services/api';
import LeafletMap from '../components/LeafletMap';
import AlertNotice from '../components/AlertNotice';
import {
  MapPin,
  RotateCcw,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export default function MapPage({ navigate }) {
  const [districts, setDistricts] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  const [filters, setFilters] = useState({
    district: 'all',
    screeningStatus: 'all',
    search: ''
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
    async function loadMapStations() {
      setLoading(true);
      try {
        const res = await fetchStations({
          district: filters.district !== 'all' ? filters.district : undefined,
          screeningStatus: filters.screeningStatus !== 'all' ? filters.screeningStatus : undefined,
          onlyValidCoords: true
        });
        if (res.success) {
          setStations(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMapStations();
  }, [filters.district, filters.screeningStatus]);

  // Client-side text search filter on loaded stations
  const filteredStations = stations.filter(s => {
    if (!filters.search) return true;
    const q = filters.search.toLowerCase();
    return (
      s.station.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q) ||
      (s.village && s.village.toLowerCase().includes(q))
    );
  });

  const flaggedCount = filteredStations.filter(s => s.flaggedCount > 0 || s.needsReviewLatest).length;
  const cleanCount = filteredStations.length - flaggedCount;

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Maharashtra Geographic Overview</h1>
            <p className="page-subtitle">
              Spatial exploration of simulated monitoring stations across Maharashtra. Station coordinates are modeled around district centroids for prototype evaluation and colored by preliminary screening status.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <AlertNotice type="disclaimer" title="Spatial & Coordinate Simulation Note">
          Station markers reflect simulated coordinates modeled around Maharashtra district centroids for prototype evaluation. Markers indicate whether synthetic benchmark records crossed preliminary screening benchmarks. <strong>Simulated coordinates do not identify physical private wellheads, live water contamination plumes, or municipal water supply networks.</strong>
        </AlertNotice>

        {/* Filters Bar */}
        <div className="filter-bar">
          <div className="filter-group" style={{ flex: 1.5 }}>
            <label className="filter-label">Search Station / Village</label>
            <input
              type="text"
              className="filter-control"
              placeholder="Filter stations on map..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Filter by District</label>
            <select
              className="filter-control"
              value={filters.district}
              onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
            >
              <option value="all">All Maharashtra Districts ({districts.length})</option>
              {districts.map(d => (
                <option key={d.district} value={d.district}>
                  {d.district} ({d.stationCount} stations)
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Screening Classification</label>
            <select
              className="filter-control"
              value={filters.screeningStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, screeningStatus: e.target.value }))}
            >
              <option value="all">All Stations ({stations.length})</option>
              <option value="flagged">Benchmark Exceeded Only</option>
              <option value="clean">Within Screening Limits</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', paddingTop: '16px' }}>
            <button
              onClick={() => setFilters({ district: 'all', screeningStatus: 'all', search: '' })}
              className="btn btn-secondary"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div className="card p-4 flex items-center gap-3.5">
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(13, 148, 136, 0.1)', border: '1px solid rgba(13, 148, 136, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14B8A6' }}>
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Plotted Stations</div>
              <strong className="font-body font-semibold text-2xl text-slate-100 tabular-nums block mt-0.5">{filteredStations.length.toLocaleString()}</strong>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3.5 border-l-2 border-l-amber-500">
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Review Recommended</div>
              <strong className="font-body font-semibold text-2xl text-amber-400 tabular-nums block mt-0.5">{flaggedCount.toLocaleString()}</strong>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3.5 border-l-2 border-l-emerald-500">
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Within Screening Limits</div>
              <strong className="font-body font-semibold text-2xl text-emerald-400 tabular-nums block mt-0.5">{cleanCount.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Interactive Map Component */}
        <div style={{ marginBottom: '32px' }}>
          {loading ? (
            <div style={{
              height: '580px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#070B11',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#14B8A6'
            }}>
              Loading Maharashtra spatial markers...
            </div>
          ) : (
            <LeafletMap
              stations={filteredStations}
              height="580px"
              selectedStationId={selectedStation ? selectedStation.stationId : null}
              onSelectStation={setSelectedStation}
              onViewStationProfile={(stId) => navigate(`/stations/${stId}`)}
            />
          )}
        </div>

        {/* Map Context Guide */}
        <div className="card p-6">
          <h3 className="font-body font-semibold text-lg text-slate-200 mb-2">
            Understanding the Spatial Distribution of Groundwater Records
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.65, marginBottom: '20px' }}>
            In Maharashtra, groundwater characteristics correlate strongly with hydrogeological formations. The majority of the state lies upon Cretaceous-Eocene Deccan Volcanic Basalt ('Deccan Traps'), where groundwater occurs predominantly in weathered zones, fractured joints, and vesicular units. 
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <strong style={{ color: '#14B8A6', display: 'block', marginBottom: '6px' }}>Salinity & TDS Variations</strong>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.55 }}>
                Elevated TDS is frequently observed in inland semi-arid basins (e.g., parts of Purna and Tapi river valleys) and coastal aquifers experiencing marine water influence.
              </p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <strong style={{ color: '#14B8A6', display: 'block', marginBottom: '6px' }}>pH Alkaline Tendencies</strong>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.55 }}>
                Basalt weathering releases alkaline earth metals, typically yielding neutral to mildly alkaline groundwater (pH 7.2 to 8.4) across most dug wells.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
