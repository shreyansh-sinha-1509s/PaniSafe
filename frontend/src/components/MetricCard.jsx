import React from 'react';

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  accent = '#0D9488',
  tooltip = ''
}) {
  return (
    <div
      className="metric-card"
      style={{ '--card-accent': accent }}
      title={tooltip}
    >
      <div className="metric-header">
        <span className="metric-label">{title}</span>
        {Icon && (
          <div className="metric-icon-wrap" style={{ color: accent, background: `${accent}15` }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-value">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {subtext && (
        <div className="metric-footer">
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
