import React from 'react';
import { AlertTriangle, Info, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AlertNotice({
  type = 'disclaimer',
  title = '',
  children,
  className = '',
  style = {}
}) {
  let accentColor = '#0D9488';
  let Icon = Info;

  if (type === 'warning') {
    accentColor = '#D97706';
    Icon = AlertTriangle;
  } else if (type === 'danger') {
    accentColor = '#DC2626';
    Icon = AlertCircle;
  } else if (type === 'success') {
    accentColor = '#059669';
    Icon = ShieldCheck;
  } else if (type === 'disclaimer') {
    accentColor = '#0D9488';
    Icon = ShieldAlert;
  }

  return (
    <div
      className={`card p-4 sm:p-4.5 flex items-start gap-3.5 mb-6 border-l-[3px] ${className}`}
      style={{
        borderLeftColor: accentColor,
        ...style
      }}
    >
      <div
        className="w-7 h-7 rounded-md bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5"
        style={{ color: accentColor }}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 font-body text-left">
        {title && (
          <div className="font-semibold text-sm sm:text-[0.925rem] text-slate-100 mb-1 leading-snug">
            {title}
          </div>
        )}
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
          {children}
        </div>
      </div>
    </div>
  );
}
