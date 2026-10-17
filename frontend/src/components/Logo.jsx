import React from 'react';

export default function Logo({ size = 32, showText = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer Rounded Container */}
        <rect width="40" height="40" rx="10" fill="#0F382A" />
        
        {/* Water Droplet outline */}
        <path
          d="M20 7C20 7 10 19.5 10 25.5C10 31.0228 14.4772 35.5 20 35.5C25.5228 35.5 30 31.0228 30 25.5C30 19.5 20 7 20 7Z"
          fill="#14B8A6"
        />
        
        {/* Leaf inner curve */}
        <path
          d="M20 12C20 12 25 18 25 24C25 26.7614 22.7614 29 20 29C17.2386 29 15 26.7614 15 24C15 21 17.5 16 20 12Z"
          fill="#0F382A"
          fillOpacity="0.85"
        />
        
        {/* Small Leaf Sprout / Water Glimmer */}
        <circle cx="20" cy="24" r="2.5" fill="#5EEAD4" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F382A', letterSpacing: '-0.02em' }}>
            Pani<span style={{ color: '#0D9488' }}>Safe</span>
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#7E938B', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '3px' }}>
            Groundwater Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
