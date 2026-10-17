import React from 'react';
import { X, ExternalLink, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RecordDrawer({ record, onClose, onNavigateStation }) {
  if (!record) return null;

  const renderParamValue = (val, unit = '', normalRange = '') => {
    if (val === null || val === undefined) {
      return (
        <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.825rem' }}>
          Not reported (N/A)
        </span>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <strong style={{ fontSize: '1rem', color: '#0F382A' }}>{val}</strong>
        {unit && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{unit}</span>}
        {normalRange && <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>({normalRange})</span>}
      </div>
    );
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div
        className="drawer-content"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideIn 0.25s ease-out' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #DDE5E1',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Historical Record Details
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F382A', marginTop: '2px' }}>
              {record.station}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
              <MapPin size={14} />
              <span>{record.village ? `${record.village}, ` : ''}{record.district}, Maharashtra</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F3',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Screening Status Banner */}
        <div style={{
          background: record.needsReview ? '#FEF3C7' : '#D1FAE5',
          border: `1px solid ${record.needsReview ? '#FCD34D' : '#6EE7B7'}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: record.needsReview ? '#92400E' : '#065F46' }}>
            {record.needsReview ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{record.needsReview ? 'Selected Screening Threshold Exceeded' : 'Within Preliminary Thresholds'}</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: record.needsReview ? '#78350F' : '#047857', marginTop: '4px', lineHeight: 1.4 }}>
            {record.screeningReason || 'Parameters fall within standard screening limits.'}
          </p>
        </div>

        {/* Metadata Section */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4B5E57', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Location & Sampling Metadata
          </h4>
          <div style={{
            background: '#F8FAF9',
            border: '1px solid #DDE5E1',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '0.85rem'
          }}>
            <div>
              <span style={{ color: '#7E938B', display: 'block', fontSize: '0.75rem' }}>Sampling Date</span>
              <strong>{record.acquisitionTime || 'Not recorded'}</strong>
            </div>
            <div>
              <span style={{ color: '#7E938B', display: 'block', fontSize: '0.75rem' }}>Agency</span>
              <strong>{record.agency || 'CGWB (Simulated Demo)'}</strong>
            </div>
            <div>
              <span style={{ color: '#7E938B', display: 'block', fontSize: '0.75rem' }}>District / Taluka</span>
              <strong>{record.district} / {record.tehsil || 'N/A'}</strong>
            </div>
            <div>
              <span style={{ color: '#7E938B', display: 'block', fontSize: '0.75rem' }}>Coordinates</span>
              <strong>
                {record.latitude !== null && record.longitude !== null
                  ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`
                  : 'Coordinates missing'}
              </strong>
            </div>
          </div>
        </div>

        {/* Primary Screening Parameters */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4B5E57', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Primary Screening Chemistry (BIS IS 10500:2012)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{
              background: record.phFlag ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${record.phFlag ? '#FECACA' : '#BBF7D0'}`,
              borderRadius: '8px',
              padding: '12px 14px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5E57' }}>pH (Potential of Hydrogen)</span>
              <div style={{ marginTop: '4px' }}>
                {renderParamValue(record.ph, '', 'Acceptable: 6.5 - 8.5')}
              </div>
              <span style={{
                display: 'inline-block',
                marginTop: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: record.phFlag ? '#DC2626' : '#16A34A'
              }}>
                {record.phFlag ? '● Flagged: Outside acceptable range (6.5 - 8.5)' : '● Within acceptable range'}
              </span>
            </div>

            <div style={{
              background: record.tdsFlag ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${record.tdsFlag ? '#FECACA' : '#BBF7D0'}`,
              borderRadius: '8px',
              padding: '12px 14px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5E57' }}>Total Dissolved Solids</span>
              <div style={{ marginTop: '4px' }}>
                {renderParamValue(record.tds, 'mg/L', 'Desirable: 500 | Permissible: 2000')}
              </div>
              <span style={{
                display: 'inline-block',
                marginTop: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: record.tdsFlag ? (record.tds > 2000 ? '#DC2626' : '#D97706') : '#16A34A'
              }}>
                {record.tdsFlag
                  ? (record.tds > 2000 ? '● Flagged: Exceeds permissible limit (>2,000 mg/L)' : '● Flagged: Exceeds desirable threshold (>500 mg/L)')
                  : '● Within desirable threshold (<= 500 mg/L)'}
              </span>
            </div>
          </div>
        </div>

        {/* Other Chemical Parameters */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4B5E57', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Other Available Laboratory Parameters
          </h4>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #DDE5E1',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ fontSize: '0.825rem' }}>
              <tbody>
                <tr>
                  <td style={{ color: '#4B5E57', width: '50%' }}>Electrical Conductivity (EC)</td>
                  <td>{renderParamValue(record.ec, 'µS/cm')}</td>
                </tr>
                <tr>
                  <td style={{ color: '#4B5E57' }}>Chloride (Cl)</td>
                  <td>{renderParamValue(record.chloride, 'mg/L')}</td>
                </tr>
                <tr>
                  <td style={{ color: '#4B5E57' }}>Fluoride (F)</td>
                  <td>{renderParamValue(record.fluoride, 'mg/L')}</td>
                </tr>
                <tr>
                  <td style={{ color: '#4B5E57' }}>Nitrate (NO₃)</td>
                  <td>{renderParamValue(record.nitrate, 'mg/L')}</td>
                </tr>
                <tr>
                  <td style={{ color: '#4B5E57' }}>Sulphate (SO₄)</td>
                  <td>{renderParamValue(record.sulphate, 'mg/L')}</td>
                </tr>
                <tr>
                  <td style={{ color: '#4B5E57' }}>Total Hardness</td>
                  <td>{renderParamValue(record.hardness, 'mg/L')}</td>
                </tr>
                <tr>
                  <td style={{ color: '#4B5E57' }}>Calcium (Ca)</td>
                  <td>{renderParamValue(record.calcium, 'mg/L')}</td>
                </tr>
                <tr>
                  <td style={{ color: '#4B5E57' }}>Magnesium (Mg)</td>
                  <td>{renderParamValue(record.magnesium, 'mg/L')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #DDE5E1' }}>
          <button
            onClick={() => {
              if (onNavigateStation) onNavigateStation(record.stationId);
              onClose();
            }}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <span>View Complete Station Sampling Profile</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
