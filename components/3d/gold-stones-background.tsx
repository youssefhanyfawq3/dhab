'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { GoldStonesScene } from './gold-stones-scene';
import { useScrollBlur } from '@/hooks/use-scroll-blur';

export function GoldStonesBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { blurIntensity } = useScrollBlur();

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoize canvas props for performance
  const canvasProps = useMemo(() => ({
    camera: {
      position: [0, 0, 10] as [number, number, number],
      fov: isMobile ? 60 : 50,
      near: 0.1,
      far: 100,
    },
    gl: {
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance' as const,
      // Add physically correct lighting
      physicallyCorrectLights: true,
      // Improve rendering quality
      outputColorSpace: 'srgb',
    },
    style: {
      background: 'transparent',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
    frameloop: 'always' as const,
    resize: { scroll: false, debounce: { scroll: 50, resize: 0 } },
  }), [isMobile]);

  // Don't render until mounted (hydration fix)
  if (!isMounted) {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(to bottom, #0A0A0F 0%, #141419 50%, #0A0A0F 100%)',
        }}
      />
    );
  }

  if (hasError) {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(to bottom, #0A0A0F 0%, #141419 50%, #0A0A0F 100%)',
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-auto"
      style={{
        background: 'linear-gradient(to bottom, #0A0A0F 0%, #141419 50%, #0A0A0F 100%)',
      }}
    >
      <Suspense fallback={<GoldStonesFallback />}>
        <div className="absolute inset-0" onError={() => setHasError(true)}>
          <Canvas {...canvasProps}>
            <GoldStonesScene isMobile={isMobile} blurIntensity={blurIntensity} />
            {/* Add fog to create depth effect based on scroll */}
            <fog attach="fog" args={['#0A0A0F', 8, 18 + blurIntensity * 20]} />
          </Canvas>
        </div>
      </Suspense>

      {/* Gradient overlay for better text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 15, 0.4) 100%)',
        }}
      />
    </div>
  );
}

// Fallback while 3D scene loads
function GoldStonesFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-[#FFD700]/50 text-sm animate-pulse">
        Loading 3D Scene...
      </div>
    </div>
  );
}
