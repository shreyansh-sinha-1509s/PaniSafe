import React from 'react';

export default function Logo({ size = 32, showText = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle container */}
          <rect
            width="40"
            height="40"
            rx="8"
            fill="#0E1520"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
          
          {/* Water Droplet shape */}
          <path
            d="M20 7C20 7 10 19.5 10 25.5C10 31.0228 14.4772 35.5 20 35.5C25.5228 35.5 30 31.0228 30 25.5C30 19.5 20 7 20 7Z"
            fill="url(#dropletGradient)"
          />
          
          {/* Inner core leaf */}
          <path
            d="M20 12C20 12 25 18 25 24C25 26.7614 22.7614 29 20 29C17.2386 29 15 26.7614 15 24C15 21 17.5 16 20 12Z"
            fill="#070B11"
            fillOpacity="0.85"
          />
          
          {/* Center node */}
          <circle cx="20" cy="24" r="2.5" fill="#14B8A6" />

          <defs>
            <linearGradient id="dropletGradient" x1="10" y1="7" x2="30" y2="35.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#14B8A6" />
              <stop offset="1" stopColor="#0D9488" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F8FAFC', letterSpacing: '-0.02em', fontFamily: 'var(--font-body)' }}>
            Pani<span style={{ color: '#14B8A6' }}>Safe</span>
          </span>
          <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>
            Groundwater Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
