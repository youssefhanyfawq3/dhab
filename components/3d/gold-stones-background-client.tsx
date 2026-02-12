'use client';

import dynamic from "next/dynamic";

// Client component wrapper for dynamic import
const GoldStonesBackground = dynamic(
  () => import("@/components/3d/gold-stones-background").then(mod => mod.GoldStonesBackground),
  { ssr: false, loading: () => <div className="fixed inset-0 -z-10 bg-[#0A0A0F]" /> }
);

export function GoldStonesBackgroundClient() {
  return <GoldStonesBackground />;
}
