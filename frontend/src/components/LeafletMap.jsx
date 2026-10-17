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
      // Center of Maharashtra
      const map = L.map(mapContainerRef.current, {
        center: [19.7515, 75.7139],
        zoom: 7,
        minZoom: 6,
        maxZoom: 16,
        scrollWheelZoom: true
      });

      // Free standard OpenStreetMap tiles (no paid API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

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

    // Limit visible markers to top 400 for smooth performance if unfiltered
    const displayStations = stations.slice(0, 500);

    displayStations.forEach(st => {
      if (!st.latitude || !st.longitude || isNaN(st.latitude) || isNaN(st.longitude)) return;

      const isFlagged = st.flaggedCount > 0 || st.needsReviewLatest;
      const markerColor = isFlagged ? '#D97706' : '#0D9488';
      const borderColor = isFlagged ? '#92400E' : '#047857';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: ${markerColor};
            border: 2px solid #FFFFFF;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            transition: transform 0.15s ease;
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 2px; min-width: 180px;">
          <div style="font-size: 11px; font-weight: 700; color: #0D9488; text-transform: uppercase;">
            ${st.district} District
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0F382A; margin: 2px 0 6px 0;">
            ${st.station}
          </div>
          <div style="font-size: 12px; color: #4B5E57; margin-bottom: 8px;">
            ${st.village ? `${st.village} • ` : ''}Samples: <strong>${st.recordCount || 1}</strong>
          </div>
          <div style="
            background: ${isFlagged ? '#FEF3C7' : '#D1FAE5'};
            color: ${isFlagged ? '#92400E' : '#065F46'};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 8px;
          ">
            ${isFlagged ? '● Threshold Exceeded' : '● Within Limits'}
            ${st.latestPh !== null ? `<br>Latest pH: ${st.latestPh}` : ''}
            ${st.latestTds !== null ? `<br>Latest TDS: ${st.latestTds} mg/L` : ''}
          </div>
          <button
            id="view-station-btn-${st.stationId}"
            style="
              width: 100%;
              background: #0F382A;
              color: #FFFFFF;
              border: none;
              padding: 6px 10px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            View Station Profile →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-station-btn-${st.stationId}`);
        if (btn) {
          btn.onclick = () => {
            if (onViewStationProfile) {
              onViewStationProfile(st.stationId);
            }
          };
        }
      });

      markersLayer.addLayer(marker);
    });
  }, [stations, onViewStationProfile]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '10px', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '0.75rem',
        zIndex: 500,
        border: '1px solid #DDE5E1',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <strong style={{ color: '#0F382A', marginBottom: '2px' }}>Screening Classification</strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D97706' }} />
          <span>Screening Threshold Exceeded</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0D9488' }} />
          <span>Within Preliminary Limits</span>
        </div>
        <div style={{ color: '#7E938B', fontSize: '0.7rem', marginTop: '4px', borderTop: '1px solid #EBF0ED', paddingTop: '4px' }}>
          OpenStreetMap • Free Leaflet Tiles
        </div>
      </div>
    </div>
  );
}
