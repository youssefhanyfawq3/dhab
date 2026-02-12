'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Database, RefreshCw } from 'lucide-react';

interface CachedBadgeProps {
  visible: boolean;
  onRefresh?: () => void;
}

export function CachedBadge({ visible, onRefresh }: CachedBadgeProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 px-3 py-1.5"
        >
          <Database className="h-3.5 w-3.5 text-[#FFD700]" />
          <span className="text-xs font-medium text-[#FFD700]">
            Showing cached data
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="ml-1 p-0.5 rounded-full hover:bg-[#FFD700]/20 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-3 w-3 text-[#FFD700]" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
