import React, { useEffect, useState } from 'react';
import { fetchDistricts, fetchStations } from '../services/api';
import LeafletMap from '../components/LeafletMap';
import AlertNotice from '../components/AlertNotice';
import MetricCard from '../components/MetricCard';
import {
  MapPin,
  Filter,
  Layers,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Search
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
            <h1 className="page-title">Maharashtra Groundwater Geographic Overview</h1>
            <p className="page-subtitle">
              Spatial exploration of Central Ground Water Board monitoring stations. Stations are plotted using verified coordinates and colored by preliminary screening status.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <AlertNotice type="disclaimer" title="Spatial & Coordinate Validation Note">
          Station markers reflect historical Central Ground Water Board coordinate registries. Markers indicate whether past chemistry records crossed preliminary screening thresholds. <strong>Historical spatial distribution does not depict live water contamination plumes or municipal water supply networks.</strong>
        </AlertNotice>

        {/* Filters */}
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
              <option value="flagged">Threshold Exceeded Only</option>
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

        {/* Stats summary bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #DDE5E1', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={22} color="#0D9488" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Plotted Stations</div>
              <strong style={{ fontSize: '1.2rem', color: '#0F382A' }}>{filteredStations.length.toLocaleString()}</strong>
            </div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #DDE5E1', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={22} color="#D97706" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Threshold Exceeded</div>
              <strong style={{ fontSize: '1.2rem', color: '#D97706' }}>{flaggedCount.toLocaleString()}</strong>
            </div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #DDE5E1', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={22} color="#059669" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Within Screening Limits</div>
              <strong style={{ fontSize: '1.2rem', color: '#059669' }}>{cleanCount.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Interactive Map Component */}
        <div style={{ marginBottom: '32px' }}>
          {loading ? (
            <div style={{
              height: '560px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F1F5F3',
              borderRadius: '10px',
              border: '1px solid #DDE5E1',
              color: '#4B5E57'
            }}>
              Loading Maharashtra spatial markers...
            </div>
          ) : (
            <LeafletMap
              stations={filteredStations}
              height="580px"
              onViewStationProfile={(stId) => navigate(`/stations/${stId}`)}
            />
          )}
        </div>

        {/* Map Context Guide */}
        <div className="card" style={{ background: '#FFFFFF' }}>
          <h3 className="card-title" style={{ marginBottom: '10px' }}>
            Understanding the Spatial Distribution of Groundwater Records
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#4B5E57', lineHeight: 1.6, marginBottom: '12px' }}>
            In Maharashtra, groundwater characteristics correlate strongly with hydrogeological formations. The majority of the state lies upon Cretaceous-Eocene Deccan Volcanic Basalt ('Deccan Traps'), where groundwater occurs predominantly in weathered zones, fractured joints, and vesicular units. 
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', fontSize: '0.85rem', color: '#334155' }}>
            <div style={{ background: '#F8FAF9', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong style={{ color: '#0F382A', display: 'block', marginBottom: '4px' }}>Salinity & TDS Variations</strong>
              Elevated TDS is frequently observed in inland semi-arid basins (e.g. parts of Purna and Tapi river valleys) and coastal aquifers experiencing marine water influence.
            </div>
            <div style={{ background: '#F8FAF9', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <strong style={{ color: '#0F382A', display: 'block', marginBottom: '4px' }}>pH Alkaline Tendencies</strong>
              Basalt weathering releases alkaline earth metals, typically yielding neutral to mildly alkaline groundwater (pH 7.2 to 8.4) across most dug wells.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
