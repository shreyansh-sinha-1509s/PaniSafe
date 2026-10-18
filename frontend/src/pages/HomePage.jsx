import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import BlurText from '../components/BlurText';
import { fetchSummary } from '../services/api';
import {
  ArrowRight,
  MapPin,
  Database,
  AlertTriangle,
  Layers,
  ShieldAlert,
  Droplets,
  BarChart2,
  CheckCircle2
} from 'lucide-react';

export default function HomePage({ navigate }) {
  const [summaryData, setSummaryData] = useState(null);
  const [_loadingSummary, setLoadingSummary] = useState(true);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const [capabilitiesVideoFailed, setCapabilitiesVideoFailed] = useState(false);

  const heroVideoRef = useRef(null);
  const capabilitiesVideoRef = useRef(null);

  useEffect(() => {
    [heroVideoRef, capabilitiesVideoRef].forEach((ref) => {
      if (ref.current) {
        ref.current.defaultMuted = true;
        ref.current.muted = true;
        const playPromise = ref.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Video playback unassisted or delayed:', err);
          });
        }
      }
    });
  }, [heroVideoFailed, capabilitiesVideoFailed]);

  // Prevent blank/black flash by cleanly restarting loop slightly before true EOF
  const handleSeamlessLoop = (e) => {
    const video = e.target;
    if (video.duration && video.currentTime >= video.duration - 0.08) {
      video.currentTime = 0.01;
      video.play().catch(() => {});
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchSummary()
      .then(res => {
        if (!isMounted) return;
        if (res && res.data && res.data.summary) {
          setSummaryData(res.data.summary);
        }
        setLoadingSummary(false);
      })
      .catch(err => {
        console.error('Error fetching summary on homepage:', err);
        if (isMounted) setLoadingSummary(false);
      });
    return () => { isMounted = false; };
  }, []);

  const totalRecords = summaryData?.totalRecords || 18249;
  const totalStations = summaryData?.totalStations || 1804;
  const totalDistricts = summaryData?.totalDistricts || 36;
  const needsReviewCount = summaryData?.needsReviewCount || 2865;
  const reviewRate = summaryData?.overallReviewRate || 15.7;

  const sharedMotion = {
    initial: { filter: 'blur(6px)', opacity: 0, y: 10 },
    animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  };

  return (
    <div className="bg-[#070B11] text-slate-100 font-body">
      {/* =====================================================================
          SECTION 1: HERO
          ===================================================================== */}
      <section
        className="relative w-full overflow-hidden isolate flex flex-col justify-center select-none bg-[#070B11] pt-28 pb-16 sm:pt-32 sm:pb-20 m-0"
        style={{ minHeight: '100svh' }}
      >
        {/* Full-bleed isolated background video for Hero */}
        {!heroVideoFailed && (
          <video
            ref={heroVideoRef}
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4"
            autoPlay
            muted
            loop
            playsInline
            onTimeUpdate={handleSeamlessLoop}
            onEnded={(e) => {
              e.target.currentTime = 0.01;
              e.target.play().catch(() => {});
            }}
            onError={() => setHeroVideoFailed(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 1,
              filter: 'none',
              zIndex: 0
            }}
            className="pointer-events-none"
          />
        )}

        {/* Subtle neutral-black overlay for text contrast (no color tinting) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Hero Main Content Grid */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          {/* Restrained Provenance Label */}
          <motion.div
            initial={sharedMotion.initial}
            animate={sharedMotion.animate}
            transition={{ ...sharedMotion.transition, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-slate-300 mb-6 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] inline-block shadow-[0_0_8px_#00E5FF]" />
            <span className="font-semibold text-slate-200 tracking-wider uppercase text-[11px]">
              IBM Z DATATHON 2026 • EVENT SSF2026
            </span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400 text-[11px]">
              Maharashtra Hydrogeological Demonstration
            </span>
          </motion.div>

          {/* Hero Headline */}
          <div className="max-w-4xl mx-auto">
            <BlurText
              text="Groundwater Intelligence & Hydrochemical Risk Screening"
              className="text-4xl sm:text-6xl md:text-[4.25rem] font-heading italic text-white tracking-[-1.5px] leading-[1.05]"
            />
          </div>

          {/* Clear Subtext */}
          <motion.p
            initial={sharedMotion.initial}
            animate={sharedMotion.animate}
            transition={{ ...sharedMotion.transition, delay: 0.3 }}
            className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl font-light leading-relaxed text-center"
          >
            Screening <strong className="text-white font-medium">18,249 historical hydrochemical measurements</strong> across{' '}
            <strong className="text-white font-medium">36 Maharashtra districts</strong> against{' '}
            <strong className="text-white font-medium">Bureau of Indian Standards (BIS IS 10500:2012)</strong> benchmarks to pinpoint groundwater sources requiring accredited laboratory verification.
          </motion.p>

          {/* Calls to Action with Clear Hierarchy */}
          <motion.div
            initial={sharedMotion.initial}
            animate={sharedMotion.animate}
            transition={{ ...sharedMotion.transition, delay: 0.5 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 w-full"
          >
            {/* Row 1 Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white hover:bg-slate-100 text-black font-semibold rounded-full px-6 py-3 text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
              >
                <BarChart2 size={16} />
                <span>Launch Decision Dashboard</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => navigate('/map')}
                className="liquid-glass hover:bg-white/10 text-white rounded-full px-5 py-3 text-sm font-medium flex items-center gap-2 border border-white/15 cursor-pointer transition-colors"
              >
                <MapPin size={15} className="text-[#00E5FF]" />
                <span>Explore GIS Map</span>
              </button>

              <button
                onClick={() => navigate('/explore')}
                className="liquid-glass hover:bg-white/10 text-white rounded-full px-5 py-3 text-sm font-medium flex items-center gap-2 border border-white/15 cursor-pointer transition-colors"
              >
                <Database size={15} className="text-slate-400" />
                <span>Inspect 18,249 Records</span>
              </button>
            </div>

            {/* Row 2 Action: Review Queue */}
            <button
              onClick={() => navigate('/alerts')}
              className="liquid-glass hover:bg-amber-500/10 text-[#FCD34D] rounded-full px-5 py-2.5 text-xs sm:text-sm font-medium flex items-center gap-2 border border-amber-500/40 cursor-pointer transition-colors mt-1"
            >
              <AlertTriangle size={15} className="text-amber-400" />
              <span>Review Queue ({needsReviewCount.toLocaleString()})</span>
            </button>
          </motion.div>

          {/* Live Data Summary Cards Aligned to Same Max Width */}
          <motion.div
            initial={sharedMotion.initial}
            animate={sharedMotion.animate}
            transition={{ ...sharedMotion.transition, delay: 0.7 }}
            className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full"
          >
            {/* Metric 1 */}
            <div className="liquid-glass rounded-2xl p-5 text-left border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">SAMPLE RECORDS</span>
                <Database size={15} className="text-[#00E5FF]" />
              </div>
              <div className="text-3xl sm:text-4xl font-heading italic text-white tracking-tight mt-1 mb-1">
                {totalRecords.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 font-light">
                Deterministic sample events
              </div>
            </div>

            {/* Metric 2 */}
            <div className="liquid-glass rounded-2xl p-5 text-left border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">MONITORING STATIONS</span>
                <MapPin size={15} className="text-[#00E5FF]" />
              </div>
              <div className="text-3xl sm:text-4xl font-heading italic text-white tracking-tight mt-1 mb-1">
                {totalStations.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 font-light">
                Disambiguated coordinates
              </div>
            </div>

            {/* Metric 3 */}
            <div className="liquid-glass rounded-2xl p-5 text-left border border-white/10">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">DISTRICTS COVERED</span>
                <Layers size={15} className="text-[#00E5FF]" />
              </div>
              <div className="text-3xl sm:text-4xl font-heading italic text-white tracking-tight mt-1 mb-1">
                {totalDistricts}
              </div>
              <div className="text-xs text-slate-400 font-light">
                All Maharashtra administrative units
              </div>
            </div>

            {/* Metric 4 */}
            <div className="liquid-glass rounded-2xl p-5 text-left border border-amber-500/30">
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FCD34D]">REVIEW PROMPTS</span>
                <AlertTriangle size={15} className="text-amber-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-heading italic text-[#FCD34D] tracking-tight mt-1 mb-1">
                {needsReviewCount.toLocaleString()}
              </div>
              <div className="text-xs text-amber-200/70 font-light">
                {reviewRate}% exceed baseline limits
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: HOW SCREENING WORKS (Methodology & Standards / Platform Capabilities)
          ===================================================================== */}
      <section
        className="relative w-full overflow-hidden isolate flex flex-col justify-center select-none bg-[#070B11] py-20 sm:py-24 m-0"
        style={{ minHeight: '100svh' }}
      >
        {/* Full-bleed isolated background video for capabilities section */}
        {!capabilitiesVideoFailed && (
          <video
            ref={capabilitiesVideoRef}
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4"
            autoPlay
            muted
            loop
            playsInline
            onTimeUpdate={handleSeamlessLoop}
            onEnded={(e) => {
              e.target.currentTime = 0.01;
              e.target.play().catch(() => {});
            }}
            onError={() => setCapabilitiesVideoFailed(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 1,
              filter: 'none',
              zIndex: 0
            }}
            className="pointer-events-none"
          />
        )}

        {/* Subtle neutral-black overlay for text contrast (no color tinting) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Section 2 Main Content Grid */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center md:text-left md:flex items-end justify-between border-b border-white/8 pb-6">
            <div>
              <div className="text-xs font-medium text-teal-400 uppercase tracking-wider mb-1.5">
                Screening Methodology
              </div>
              <h2 className="font-heading italic text-2xl sm:text-3xl text-slate-100">
                Decision-Support Architecture
              </h2>
            </div>
            <p className="mt-2 md:mt-0 text-xs sm:text-sm text-slate-400 max-w-md font-light">
              Designed to assist public health hydrologists and municipal planners in prioritizing water sources for accredited laboratory chemical testing.
            </p>
          </div>

          {/* 3 Pillar Cards Aligned to Same Max Width */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full">
            {/* Card 1 */}
            <div className="card p-5.5 flex flex-col justify-between border border-white/8 hover:border-white/14 transition-colors">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3.5">
                  <Droplets size={18} />
                </div>
                <h3 className="font-body font-semibold text-base text-slate-100 mb-2">
                  Hydrochemical Threshold Screening
                </h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed mb-4">
                  Measures groundwater pH against the strict <strong>BIS IS 10500:2012</strong> acceptable range of <strong>6.5 – 8.5</strong> (no relaxation). Total Dissolved Solids (TDS) are screened against the <strong>500 mg/L</strong> desirable threshold and <strong>2,000 mg/L</strong> permissible limit.
                </p>
              </div>
              <div className="pt-3.5 border-t border-white/6 flex items-center justify-between text-[11px] text-slate-400">
                <span>Standard: BIS IS 10500</span>
                <span className="text-teal-400 font-medium">2 Parameters Screened</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card p-5.5 flex flex-col justify-between border border-white/8 hover:border-white/14 transition-colors">
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3.5">
                  <Database size={18} />
                </div>
                <h3 className="font-body font-semibold text-base text-slate-100 mb-2">
                  Station Disambiguation & Null Integrity
                </h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed mb-4">
                  Identifies stations using composite indexing <code>(District + Tehsil + Station)</code>, preventing duplicate naming collisions across talukas. Preserves missing measurements as true analytical nulls rather than corrupting distributions with synthetic zero values.
                </p>
              </div>
              <div className="pt-3.5 border-t border-white/6 flex items-center justify-between text-[11px] text-slate-400">
                <span>Index: 1,804 Stations</span>
                <span className="text-emerald-400 font-medium">95% Data Quality Index</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card p-5.5 flex flex-col justify-between border border-white/8 hover:border-white/14 transition-colors">
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3.5">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="font-body font-semibold text-base text-slate-100 mb-2">
                  Actionable Field Triage Queue
                </h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed mb-4">
                  Flags records where either parameter exceeds established standards with <strong>Review Recommended</strong>. Classifies severity into dual-flag alerts (both pH and TDS breached) or single-parameter prompts, directly accelerating municipal laboratory follow-up.
                </p>
              </div>
              <div className="pt-3.5 border-t border-white/6 flex items-center justify-between text-[11px] text-slate-400">
                <span>Triage Queue</span>
                <span className="text-amber-400 font-medium">2,865 Flagged Records</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: INTERACTIVE PLATFORM EXPLORATION
          ===================================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="card p-6 md:p-8 border border-white/8 bg-[#0E1520]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-500/10 text-teal-300 text-xs font-medium mb-3">
                <MapPin size={12} />
                <span>Geographic Information System</span>
              </div>
              <h2 className="font-heading italic text-2xl sm:text-3xl text-slate-100 mb-3">
                Maharashtra Spatial GIS Mapping
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed mb-6">
                Explore monitoring stations mapped with modeled geographic coordinates across Western Ghats, Deccan Traps, Marathwada, and Vidarbha. Filter by district, examine regional cluster trends, and click any station pin to access complete longitudinal sampling histories.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/map')}
                  className="bg-teal-600 hover:bg-teal-500 text-white rounded-md px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <span>Open Interactive Map</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => navigate('/alerts')}
                  className="border border-white/12 hover:bg-white/5 text-slate-200 rounded-md px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>View High-Priority Alerts</span>
                </button>
              </div>
            </div>

            {/* Quick District Screening Jump Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => navigate('/explore')}
                className="bg-[#151F2E] p-3.5 rounded-lg border border-white/8 hover:border-white/14 transition-colors cursor-pointer"
              >
                <div className="text-[11px] text-slate-400">Highest Volume District</div>
                <div className="text-base font-semibold text-slate-100 mt-1">Pune District</div>
                <div className="text-[10px] text-teal-400 mt-1">1,248 Samples • 120 Stations</div>
              </div>

              <div
                onClick={() => navigate('/alerts')}
                className="bg-[#151F2E] p-3.5 rounded-lg border border-white/8 hover:border-white/14 transition-colors cursor-pointer"
              >
                <div className="text-[11px] text-slate-400">Elevated TDS Cluster</div>
                <div className="text-base font-semibold text-slate-100 mt-1">Jalgaon District</div>
                <div className="text-[10px] text-amber-400 mt-1">214 Review Prompts</div>
              </div>

              <div
                onClick={() => navigate('/explore')}
                className="bg-[#151F2E] p-3.5 rounded-lg border border-white/8 hover:border-white/14 transition-colors cursor-pointer"
              >
                <div className="text-[11px] text-slate-400">Vidarbha Regional Basin</div>
                <div className="text-base font-semibold text-slate-100 mt-1">Nagpur District</div>
                <div className="text-[10px] text-teal-400 mt-1">682 Samples • 72 Stations</div>
              </div>

              <div
                onClick={() => navigate('/methodology')}
                className="bg-[#151F2E] p-3.5 rounded-lg border border-white/8 hover:border-white/14 transition-colors cursor-pointer"
              >
                <div className="text-[11px] text-slate-400">Threshold Standards</div>
                <div className="text-base font-semibold text-slate-100 mt-1">BIS IS 10500</div>
                <div className="text-[10px] text-emerald-400 mt-1">Full Screening Matrix →</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: DATA LIMITATION & PROVENANCE NOTICE
          ===================================================================== */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="card p-5 md:p-6 border border-amber-500/25 bg-[#0E1520]">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <ShieldAlert size={17} />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-100 mb-1.5">
                Deterministic Demonstration Dataset & Scientific Limitation
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed mb-3">
                The 18,249 records displayed across PaniSafe are a <strong>deterministic synthetic demonstration dataset (Seed 20260427)</strong> created specifically for the IBM Z Datathon 2026 prototype evaluation. Records are modeled on published Maharashtra hydrochemical patterns and BIS IS 10500:2012 thresholds. They do not represent live or certified Central Ground Water Board (CGWB) field lab tests.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <CheckCircle2 size={13} />
                  <span>Decision-support preliminary screening</span>
                </span>
                <span>•</span>
                <span>Not a drinking-water safety or potability certification</span>
                <span>•</span>
                <span>Requires accredited laboratory follow-up for physical potability</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
