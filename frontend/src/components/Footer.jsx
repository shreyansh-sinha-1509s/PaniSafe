import React from 'react';
import Logo from './Logo';
import { Cpu, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function Footer({ navigate }) {
  return (
    <footer className="bg-[#04060A] text-white/75 border-t border-white/12 pt-16 pb-12 relative font-body select-none">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Identity & Purpose */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo size={34} />
            </div>
            <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6 max-w-md">
              Pani Safe is an environmental analytics and decision-support prototype for Maharashtra, India. Developed for the <strong className="text-white font-medium">IBM Z Datathon 2026 (Event Code: SSF2026)</strong>.
            </p>
            <div className="badge badge-teal rounded-md px-3 py-1.5 text-xs inline-flex items-center gap-2">
              <Cpu size={14} className="text-teal-400" />
              <span>Architected for LinuxONE s390x Mainframe Cloud</span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div>
            <h4 className="font-body font-semibold uppercase tracking-wider text-xs text-slate-300 mb-4">
              Platform & Data
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-light text-slate-400">
              <li>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Monitoring Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/explore')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Explore 18,249 Records
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/map')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Maharashtra GIS Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/alerts')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Screening Review Queue
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/methodology')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  BIS IS 10500 Standards
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Project & Legal */}
          <div>
            <h4 className="font-body font-semibold uppercase tracking-wider text-xs text-slate-300 mb-4">
              Project Context
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-light text-slate-400">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About the Datathon Project
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Submit Expert Feedback
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/shreyansh-sinha-1509s/PaniSafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Provenance Notice */}
        <div className="card p-4 mb-8 text-xs text-slate-400 font-normal flex items-start gap-3 border-amber-500/20 bg-amber-950/10">
          <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-200 font-medium">Synthetic Data Provenance Notice:</span> Records displayed on this platform are deterministically generated synthetic data modeled on Maharashtra hydrogeological patterns for the IBM Z Datathon 2026. They are designed for software and algorithmic demonstration and do not reflect verified lab results.
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>
            © 2026 Pani Safe Team • IBM Z Datathon 2026 (SSF2026)
          </div>
          <div className="flex items-center gap-4">
            <span>React + Vite</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>LinuxONE Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
