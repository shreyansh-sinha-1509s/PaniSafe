import React from 'react';
import { AlertTriangle, Info, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AlertNotice({
  type = 'disclaimer',
  title = '',
  children,
  style = {}
}) {
  let bg = '#F8FAF9';
  let border = '#DDE5E1';
  let text = '#4B5E57';
  let Icon = Info;
  let iconColor = '#0D9488';

  if (type === 'warning') {
    bg = '#FFFBEB';
    border = '#FDE68A';
    text = '#92400E';
    Icon = AlertTriangle;
    iconColor = '#D97706';
  } else if (type === 'danger') {
    bg = '#FEF2F2';
    border = '#FECACA';
    text = '#991B1B';
    Icon = AlertCircle;
    iconColor = '#DC2626';
  } else if (type === 'success') {
    bg = '#F0FDF4';
    border = '#BBF7D0';
    text = '#166534';
    Icon = ShieldCheck;
    iconColor = '#16A34A';
  }

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '8px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        color: text,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        marginBottom: '20px',
        ...style
      }}
    >
      <Icon size={18} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, marginBottom: '4px' }}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
