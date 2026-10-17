import React, { useState, useEffect, useRef } from 'react';

/**
 * FadingVideo Component
 * Reusable video component for atmospheric background loops:
 * - Seamless native hardware-accelerated looping
 * - Autoplay with muted & playsInline
 * - Smooth fade-in on loadeddata
 * - Respects prefers-reduced-motion (disables video playback and displays static fallback)
 * - Static image fallback if video fails to load or while buffering
 * - Subtle dark overlays for high-contrast text readability
 */
export default function FadingVideo({
  src,
  fallbackSrc,
  className = 'absolute inset-0 h-full w-full object-cover pointer-events-none',
  style = {},
  targetOpacity = 0.48,
  ...props
}) {
  const sources = Array.isArray(src) ? src : [src].filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const videoRef = useRef(null);

  // Sync reduced-motion preference dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Ensure autoplay playback policy compliance
  useEffect(() => {
    if (prefersReducedMotion || hasError) return;
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((_err) => {
          // Autoplay unassisted or prevented
        });
      }
    }
  }, [currentIndex, prefersReducedMotion, hasError]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleError = () => {
    // If there is an alternate fallback source in the array, try that first
    if (currentIndex < sources.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const handleEnded = () => {
    if (sources.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % sources.length);
    }
  };

  const currentSource = sources[currentIndex] || '';
  const showVideo = !prefersReducedMotion && !hasError && Boolean(currentSource);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Static Fallback Image Layer (visible during reduced motion, error, or initial load) */}
      {fallbackSrc && (
        <img
          src={fallbackSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-1000"
          style={{
            opacity: showVideo && isLoaded ? 0 : 0.75,
            filter: 'brightness(0.6) contrast(1.15)'
          }}
        />
      )}

      {/* 2. Seamless Looping Video Layer */}
      {showVideo && (
        <video
          ref={videoRef}
          key={currentSource}
          src={currentSource}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={handleLoadedData}
          onError={handleError}
          onEnded={handleEnded}
          className={className}
          style={{
            ...style,
            opacity: isLoaded ? targetOpacity : 0,
            transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          {...props}
        />
      )}

      {/* 3. Subtle Dark Overlays for Extreme Contrast & Readability */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#06090E]/85 via-[#06090E]/50 to-[#06090E] pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'radial-gradient(ellipse at 50% 45%, rgba(6, 9, 14, 0.15) 0%, rgba(6, 9, 14, 0.75) 75%, #06090E 100%)'
        }}
      />
    </div>
  );
}
