'use client';

import { motion } from 'framer-motion';

interface LoadingScreenProps {
  loadingStates: {
    prices: boolean;
    history: boolean;
    predictions: boolean;
  };
}

export function LoadingScreen({ loadingStates }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0F]"
    >
      {/* Subtle radial glow behind logo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(255,215,0,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo with pulse */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-3"
        >
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-lg shadow-[#FFD700]/20">
            <span className="text-3xl font-bold text-[#0A0A0F]">D</span>
          </div>
          <span className="text-4xl font-bold text-white tracking-tight">
            DHAB
          </span>
        </motion.div>

        {/* Spinner */}
        <div className="h-6 w-6 rounded-full border-2 border-[#FFD700]/20 border-t-[#FFD700] animate-spin" />
      </div>
    </motion.div>
  );
}
