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
      className="card p-4.5 flex flex-col justify-between transition-colors border border-white/8 hover:border-white/14"
      title={tooltip}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div
            className="w-7 h-7 rounded-md bg-white/[0.04] flex items-center justify-center shrink-0"
            style={{ color: accent }}
          >
            <Icon size={15} />
          </div>
        )}
      </div>

      <div className="font-body font-semibold text-2xl sm:text-[1.75rem] text-slate-100 tracking-tight leading-snug my-0.5">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {subtext && (
        <div className="font-body text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: accent }}
          />
          <span className="truncate">{subtext}</span>
        </div>
      )}
    </div>
  );
}
