import React, { useState } from 'react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, ShieldAlert, Database, MapPin, BarChart3, HelpCircle, FileText, Mail, LogIn } from 'lucide-react';

export default function Navbar({ currentPath, navigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, demoLogin, isAuthenticated } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Explore Data', path: '/explore' },
    { name: 'Map View', path: '/map' },
    { name: 'Screening Alerts', path: '/alerts' },
    { name: 'Methodology', path: '/methodology' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #DDE5E1',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(15, 56, 42, 0.04)'
    }}>
      {/* Top Banner Notice */}
      <div style={{
        background: '#0F382A',
        color: '#E2E8F0',
        padding: '5px 24px',
        fontSize: '0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 500
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#2DD4BF'
          }} />
          <span>IBM Z Datathon 2026 Prototype — CGWB Maharashtra Groundwater Screening Engine</span>
        </div>
        <div style={{ display: 'none', mdDisplay: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94A3B8' }}>LinuxONE s390x Compatible</span>
          <span style={{ color: '#2DD4BF', fontWeight: 600 }}>Decision-Support Prototype</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px'
      }}>
        <div style={{ cursor: 'pointer' }} onClick={() => handleNav('/')}>
          <Logo />
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                style={{
                  background: isActive ? '#F0FDFA' : 'transparent',
                  color: isActive ? '#0F766E' : '#334155',
                  border: isActive ? '1px solid #CCFBF1' : '1px solid transparent',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#0F382A';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#334155';
                }}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F1F5F3',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#0F382A'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#0D9488',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user.fullName ? user.fullName[0] : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontWeight: 600 }}>{user.fullName?.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.7rem', color: '#0D9488' }}>
                    {user.isDemoAccount ? 'Demo Analyst' : 'Researcher'}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 8px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={async () => {
                  await demoLogin();
                  handleNav('/dashboard');
                }}
                className="btn btn-secondary btn-sm"
                title="Quick demo access with pre-configured analyst profile"
              >
                Demo Sign In
              </button>
              <button
                onClick={() => handleNav('/login')}
                className="btn btn-primary btn-sm"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#0F382A',
              cursor: 'pointer',
              padding: '6px'
            }}
            className="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #DDE5E1',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '6px',
                background: currentPath === link.path ? '#F0FDFA' : 'transparent',
                color: currentPath === link.path ? '#0F766E' : '#141E1B',
                border: 'none',
                fontWeight: currentPath === link.path ? 600 : 500,
                fontSize: '0.95rem'
              }}
            >
              {link.name}
            </button>
          ))}
        </div>
      )}

      {/* Media query styling inline fallback */}
      <style>{`
        @media (max-width: 992px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
