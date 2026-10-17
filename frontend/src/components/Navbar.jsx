import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { fetchHealth } from '../services/api';
import { Menu, X, LogOut, LogIn, Cpu, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentPath, navigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, demoLogin, isAuthenticated } = useAuth();
  const [telemetry, setTelemetry] = useState({
    arch: null,
    nodeVersion: null,
    isS390x: false,
    checked: false
  });

  useEffect(() => {
    let isMounted = true;
    fetchHealth()
      .then(res => {
        if (!isMounted) return;
        const arch = res?.system?.architecture || 'x64';
        const nodeVersion = res?.system?.nodeVersion || 'v24';
        setTelemetry({
          arch,
          nodeVersion,
          isS390x: arch.toLowerCase().includes('s390x'),
          checked: true
        });
      })
      .catch(() => {
        if (isMounted) {
          setTelemetry({ arch: 'x64', nodeVersion: 'v24', isS390x: false, checked: true });
        }
      });
    return () => { isMounted = false; };
  }, []);

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
    <header className="sticky top-0 z-[100] bg-[#070B11]/95 backdrop-blur-md border-b border-white/8 select-none">
      {/* Top Banner Notice */}
      <div className="bg-[#05080E] border-b border-white/6 text-slate-300 px-4 sm:px-6 py-1.5 text-[11px] font-body flex justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
          <span className="text-slate-200 font-medium">IBM Z Datathon 2026 (SSF2026)</span>
          <span className="text-white/20">•</span>
          <span className="text-slate-400">Deterministic Synthetic Dataset (Seed 20260427)</span>
          <span className="text-white/20">•</span>
          <span className="text-amber-400 font-medium">Decision-Support Screening</span>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          {telemetry.isS390x ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Cpu size={12} />
              <span>LinuxONE s390x Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <Cpu size={12} className="text-teal-400" />
              <span>{telemetry.nodeVersion || 'Node.js'} • {telemetry.arch || 'x64'} (s390x Ready)</span>
            </div>
          )}
          <span className="text-slate-300 font-medium">18,249 Records • 36 Districts</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand / Logo */}
        <div
          onClick={() => handleNav('/')}
          className="cursor-pointer hover:opacity-90 transition-opacity"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNav('/')}
        >
          <Logo />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-full p-1 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`px-3.5 py-1.5 text-xs font-medium font-body rounded-full transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* User / Demo Auth Buttons */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="border border-white/15 bg-white/[0.04] rounded-full px-3.5 py-1 text-xs text-slate-200 flex items-center gap-2 font-body backdrop-blur-md">
                <ShieldCheck size={14} className="text-[#00E5FF]" />
                <span className="font-medium text-white">{user?.fullName || 'Analyst'}</span>
                {user?.isDemoAccount && (
                  <span className="bg-[#00E5FF]/15 text-[#00E5FF] text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Demo
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] rounded-full w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => demoLogin().then(() => handleNav('/dashboard'))}
                className="border border-white/15 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 rounded-full px-4 py-1.5 text-xs font-medium font-body transition-colors cursor-pointer backdrop-blur-md"
                title="Quick 1-click login as Demo Analyst"
              >
                Demo Access
              </button>
              <button
                onClick={() => handleNav('/login')}
                className="bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40 rounded-full px-4 py-1.5 text-xs font-medium font-body flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden border border-white/10 bg-white/[0.04] rounded-md w-8 h-8 flex items-center justify-center text-slate-200 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0E1520] border-t border-white/8 px-5 py-3 flex flex-col gap-1 shadow-xl">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-body transition-colors ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-300 font-medium'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
