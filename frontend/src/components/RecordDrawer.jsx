import React from 'react';
import { X, ExternalLink, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RecordDrawer({ record, onClose, onNavigateStation }) {
  if (!record) return null;

  const renderParamValue = (val, unit = '', normalRange = '', isTds = false, _isPh = false) => {
    if (val === null || val === undefined) {
      return (
        <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic', fontSize: '0.825rem' }}>
          Not reported (N/A)
        </span>
      );
    }
    if (isTds && val === 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ fontSize: '0.95rem', color: '#F59E0B' }}>0 mg/L</strong>
          <span style={{ fontSize: '0.7rem', color: '#FCD34D' }}>(Unverified Sensor Default)</span>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <strong style={{ fontSize: '1.05rem', color: '#FFFFFF', fontFamily: 'var(--font-body)' }}>{val}</strong>
        {unit && <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)' }}>{unit}</span>}
        {normalRange && <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.4)' }}>({normalRange})</span>}
      </div>
    );
  };

  return (
    <div className="drawer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider font-body">
                Sample Inspection Record
              </span>
              <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded font-body">
                Synthetic Demo
              </span>
            </div>
            <h3 id="drawer-title" className="font-semibold text-xl sm:text-2xl text-slate-100 my-1 font-body">
              {record.station}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-body">
              <MapPin size={13} className="text-teal-400" />
              <span>{record.village ? `${record.village}, ` : ''}{record.district}, Maharashtra</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] rounded-md w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
            aria-label="Close record inspection drawer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Screening Status Banner */}
        <div className="card p-3.5 mb-6 flex items-start gap-3 border-l-[3px]" style={{
          borderLeftColor: record.needsReview ? '#D97706' : '#059669',
          background: '#0E1520'
        }}>
          {record.needsReview ? (
            <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div>
            <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>
              {record.needsReview ? 'Review Recommended (Benchmark Exceeded)' : 'Within Standard Screening Limits'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '3px', lineHeight: 1.5 }}>
              {record.screeningReason || (record.needsReview
                ? 'One or more measured hydrochemical values cross preliminary BIS IS 10500:2012 screening limits.'
                : 'Reported chemical values satisfy standard drinking water screening benchmarks.')}
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '14px',
          marginBottom: '20px',
          fontSize: '0.825rem'
        }}>
          <div>
            <span style={{ color: 'rgba(255, 255, 255, 0.45)', display: 'block' }}>Sample Event ID</span>
            <strong style={{ color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>{record.recordId}</strong>
          </div>
          <div>
            <span style={{ color: 'rgba(255, 255, 255, 0.45)', display: 'block' }}>Sampling Date</span>
            <strong style={{ color: '#F8FAFC' }}>{record.samplingDate || record.acquisitionTime?.substring(0, 10) || 'Historical'}</strong>
          </div>
          <div>
            <span style={{ color: 'rgba(255, 255, 255, 0.45)', display: 'block' }}>Coordinates</span>
            <span style={{ color: '#14B8A6', fontFamily: 'var(--font-mono)' }}>
              {record.latitude?.toFixed(4)}, {record.longitude?.toFixed(4)}
            </span>
          </div>
          <div>
            <span style={{ color: 'rgba(255, 255, 255, 0.45)', display: 'block' }}>Source Agency</span>
            <span style={{ color: '#CBD5E1' }}>{record.agency || 'CGWB (Simulated Demo)'}</span>
          </div>
        </div>

        {/* Chemical Parameters Grid */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#14B8A6',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '12px'
          }}>
            Chemical Parameters vs. IS 10500:2012
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {/* pH */}
            <div style={{
              background: record.phFlag ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${record.phFlag ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '10px',
              padding: '14px'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>
                pH (Potential of Hydrogen)
              </span>
              <div style={{ marginTop: '4px' }}>
                {renderParamValue(record.ph, '', '6.5 - 8.5', false, true)}
              </div>
              {record.phFlag && (
                <span style={{ fontSize: '0.7rem', color: '#FCD34D', display: 'block', marginTop: '4px' }}>
                  ● Outside 6.5 - 8.5 range
                </span>
              )}
            </div>

            {/* TDS */}
            <div style={{
              background: record.tdsFlag ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${record.tdsFlag ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '10px',
              padding: '14px'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>
                Total Dissolved Solids (TDS)
              </span>
              <div style={{ marginTop: '4px' }}>
                {renderParamValue(record.tds, 'mg/L', 'Desirable < 500', true, false)}
              </div>
              {record.tdsFlag && (
                <span style={{ fontSize: '0.7rem', color: '#FCD34D', display: 'block', marginTop: '4px' }}>
                  ● Exceeds 500 mg/L limit
                </span>
              )}
            </div>

            {/* Electrical Conductivity */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>Electrical Cond. (EC)</span>
              <div style={{ marginTop: '4px' }}>{renderParamValue(record.ec, 'µS/cm')}</div>
            </div>

            {/* Total Hardness */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>Total Hardness</span>
              <div style={{ marginTop: '4px' }}>{renderParamValue(record.hardness, 'mg/L', '< 200 mg/L')}</div>
            </div>

            {/* Calcium */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>Calcium (Ca²⁺)</span>
              <div style={{ marginTop: '4px' }}>{renderParamValue(record.calcium, 'mg/L', '< 75 mg/L')}</div>
            </div>

            {/* Magnesium */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>Magnesium (Mg²⁺)</span>
              <div style={{ marginTop: '4px' }}>{renderParamValue(record.magnesium, 'mg/L', '< 30 mg/L')}</div>
            </div>

            {/* Chloride */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>Chloride (Cl⁻)</span>
              <div style={{ marginTop: '4px' }}>{renderParamValue(record.chloride, 'mg/L', '< 250 mg/L')}</div>
            </div>

            {/* Sulphate */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>Sulphate (SO₄²⁻)</span>
              <div style={{ marginTop: '4px' }}>{renderParamValue(record.sulphate, 'mg/L', '< 200 mg/L')}</div>
            </div>

            {/* Nitrate */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>Nitrate (NO₃⁻)</span>
              <div style={{ marginTop: '4px' }}>{renderParamValue(record.nitrate, 'mg/L', '< 45 mg/L')}</div>
            </div>

            {/* Fluoride */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.55)', display: 'block' }}>Fluoride (F⁻)</span>
              <div style={{ marginTop: '4px' }}>{renderParamValue(record.fluoride, 'mg/L', '< 1.0 mg/L')}</div>
            </div>
          </div>
        </div>

        {/* Action Button: View Station Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {onNavigateStation && (
            <button
              onClick={() => {
                onClose();
                onNavigateStation(record.stationId || `${record.district}_${record.station}`);
              }}
              className="btn btn-cyan"
              style={{ width: '100%', gap: '8px' }}
            >
              <ExternalLink size={16} />
              <span>View Full Station Sampling History</span>
            </button>
          )}

          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
            lineHeight: 1.5,
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px'
          }}>
            Decision-support screening notice: Exceedances require qualified field sample collection and NABL accredited laboratory validation before drinking water safety assessments.
          </div>
        </div>
      </div>
    </div>
  );
}
