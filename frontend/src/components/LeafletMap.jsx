import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LeafletMap({
  stations = [],
  selectedStationId = null,
  onSelectStation,
  onViewStationProfile,
  height = '560px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center coordinates of Maharashtra state
      const map = L.map(mapContainerRef.current, {
        center: [19.7515, 75.7139],
        zoom: 7,
        minZoom: 6,
        maxZoom: 16,
        scrollWheelZoom: true
      });

      // Esri World Dark Gray Canvas tiles (Keyless, high-contrast, clean dark cartography)
      const baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
      }).addTo(map);

      // Reference overlay for labels and district borders
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 16,
        opacity: 0.85
      }).addTo(map);

      // Error fallback if tiles cannot load
      baseLayer.on('tileerror', () => {
        console.warn('Map tile failed to load. Verifying network connection.');
      });

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Limit visible markers to top 500 for smooth 60fps interaction
    const displayStations = stations.slice(0, 500);

    displayStations.forEach(st => {
      if (!st.latitude || !st.longitude || isNaN(st.latitude) || isNaN(st.longitude)) return;

      const isFlagged = st.flaggedCount > 0 || st.needsReviewLatest;
      const markerColor = isFlagged ? '#D97706' : '#0D9488';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: ${markerColor};
            border: 2px solid #FFFFFF;
            box-shadow: 0 1px 4px rgba(0,0,0,0.6);
            cursor: pointer;
          "></div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: customIcon });

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(st);
      });

      const popupHtml = `
        <div style="font-family: var(--font-body), sans-serif; padding: 4px; min-width: 210px; color: #F8FAFC;">
          <div style="font-size: 11px; font-weight: 600; color: #14B8A6; text-transform: uppercase; letter-spacing: 0.06em;">
            ${st.district} District
          </div>
          <div style="font-family: var(--font-body), sans-serif; font-weight: 600; font-size: 17px; color: #FFFFFF; margin: 3px 0 6px 0; letter-spacing: -0.3px; line-height: 1.2;">
            ${st.station}
          </div>
          <div style="font-size: 12px; color: rgba(255,255,255,0.75); margin-bottom: 10px;">
            ${st.village ? `${st.village} • ` : ''}Sample Records: <strong>${st.recordCount || 1}</strong>
          </div>
          <div style="
            background: ${isFlagged ? 'rgba(217, 119, 6, 0.15)' : 'rgba(13, 148, 136, 0.15)'};
            border: 1px solid ${isFlagged ? 'rgba(217, 119, 6, 0.35)' : 'rgba(13, 148, 136, 0.35)'};
            color: ${isFlagged ? '#FCD34D' : '#14B8A6'};
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            margin-bottom: 12px;
            text-align: center;
          ">
            ${isFlagged ? '● Screening Benchmark Exceeded' : '● Within Baseline Screening Limits'}
            ${st.latestPh !== null ? `<br>Latest pH: ${st.latestPh}` : ''}
            ${st.latestTds !== null ? `<br>Latest TDS: ${st.latestTds} mg/L` : ''}
          </div>
          <button
            id="view-station-btn-${st.stationId}"
            style="
              width: 100%;
              background: #0D9488;
              color: #FFFFFF;
              border: none;
              padding: 8px 14px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            "
          >
            Inspect Station History →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Attach button handler when popup opens
      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`view-station-btn-${st.stationId}`);
          if (btn && onViewStationProfile) {
            btn.onclick = () => onViewStationProfile(st.stationId);
          }
        }, 50);
      });

      markersLayer.addLayer(marker);
    });

    // Center on selected station if provided
    if (selectedStationId) {
      const target = stations.find(s => s.stationId === selectedStationId);
      if (target && target.latitude && target.longitude) {
        map.setView([target.latitude, target.longitude], 11, { animate: true });
      }
    }
  }, [stations, selectedStationId, onSelectStation, onViewStationProfile]);

  return (
    <div style={{
      position: 'relative',
      height,
      width: '100%',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.16)',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8)'
    }}>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', background: '#0E141F' }} />

      {/* Map Legend Overlay */}
      <div className="card p-3.5" style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 500,
        fontSize: '0.75rem',
        color: '#E2E8F0',
        maxWidth: '280px',
        borderRadius: '10px'
      }}>
        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#F8FAFC', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Screening Legend
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0D9488' }} />
            <span>Within Screening Limits</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#D97706' }} />
            <span>Review Recommended (&gt;500 mg/L TDS or pH &lt;6.5 / &gt;8.5)</span>
          </div>
        </div>
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.45)', lineHeight: 1.3 }}>
          * Station coordinates are deterministically modeled demonstration coordinates across Maharashtra districts.
        </div>
      </div>
    </div>
  );
}
