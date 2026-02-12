'use client';

import dynamic from "next/dynamic";
import { Suspense } from 'react';

// Client component wrapper for dynamic import
const GoldStonesBackground = dynamic(
  () => import("@/components/3d/gold-stones-background").then(mod => mod.GoldStonesBackground),
  { 
    ssr: false, 
    loading: () => <div className="fixed inset-0 -z-10 bg-[#0A0A0F]" />
  }
);

function ErrorFallback() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0A0A0F] via-[#141419] to-[#0A0A0F]">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_70%)]" />
      </div>
    </div>
  );
}

export function GoldStonesBackgroundClient() {
  return (
    <Suspense fallback={<div className="fixed inset-0 -z-10 bg-[#0A0A0F]" />}>
      <GoldStonesBackground />
    </Suspense>
  );
}
