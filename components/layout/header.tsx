'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-[#27272A] bg-[#0A0A0F]/60 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500]">
            <TrendingUp className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">DHAB</h1>
            <p className="text-xs text-gray-400">Gold Price Tracker</p>
          </div>
        </motion.div>

        {/* Status indicators */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 rounded-full bg-[#141419] px-3 py-1.5 border border-[#27272A]"
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-gray-300">Live</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden sm:flex items-center gap-2 rounded-full bg-[#141419] px-3 py-1.5 border border-[#27272A]"
          >
            <Sparkles className="h-3 w-3 text-[#FFD700]" />
            <span className="text-xs text-gray-300">AI Predictions</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
