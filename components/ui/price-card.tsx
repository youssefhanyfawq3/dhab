'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { GoldPrice, KaratType } from '@/types';
import { AnimatedNumber } from '@/components/animations/number-count';
import { formatPrice, formatPercentage, cn } from '@/lib/utils';

interface PriceCardProps {
  karat: KaratType;
  price: GoldPrice;
  index: number;
  isPopular?: boolean;
}

const karatLabels: Record<KaratType, string> = {
  '24k': 'Pure Gold',
  '22k': 'Standard Gold',
  '21k': 'Popular in Egypt',
  '18k': 'Jewelry Gold',
};

const karatColors: Record<KaratType, string> = {
  '24k': 'from-yellow-400 to-yellow-600',
  '22k': 'from-yellow-300 to-yellow-500',
  '21k': 'from-amber-300 to-amber-500',
  '18k': 'from-orange-300 to-orange-500',
};

export function PriceCard({ karat, price, index, isPopular = false }: PriceCardProps) {
  const isPositive = (price.changePercent || 0) >= 0;
  const isNeutral = (price.changePercent || 0) === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
      }}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-[#141419] p-6 transition-colors',
        isPopular ? 'border-[#FFD700]/50' : 'border-[#27272A]',
        'hover:border-[#FFD700]/30'
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-4 top-4"
        >
          <span className="rounded-full bg-[#FFD700]/20 px-3 py-1 text-xs font-medium text-[#FFD700]">
            Most Popular
          </span>
        </motion.div>
      )}

      {/* Karat badge */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br text-lg font-bold text-black',
            karatColors[karat]
          )}
        >
          {karat.replace('k', '')}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{karat} Gold</h3>
          <p className="text-sm text-gray-400">{karatLabels[karat]}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-gray-400">EGP</span>
          <span className="text-3xl font-bold tabular-nums tracking-tight text-white">
            <AnimatedNumber
              value={price.gram}
              duration={1.5}
              className="font-mono"
            />
          </span>
          <span className="text-sm text-gray-400">/g</span>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          <AnimatedNumber
            value={price.ounce}
            duration={1.5}
            className="font-mono"
            prefix="EGP "
            suffix=" /oz"
          />
        </div>
      </div>

      {/* Change indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + index * 0.1 }}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2',
          isPositive && 'bg-green-500/10 text-green-400',
          !isPositive && !isNeutral && 'bg-red-500/10 text-red-400',
          isNeutral && 'bg-gray-500/10 text-gray-400'
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : !isNeutral ? (
          <TrendingDown className="h-4 w-4" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {price.change ? formatPrice(price.change).replace('EGP', '').trim() : '0'}
        </span>
        <span className="text-sm">
          ({price.changePercent ? formatPercentage(price.changePercent) : '0%'})
        </span>
      </motion.div>

      {/* Decorative gradient */}
      <div
        className={cn(
          'absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl',
          karat === '24k' && 'bg-yellow-500',
          karat === '22k' && 'bg-yellow-400',
          karat === '21k' && 'bg-amber-500',
          karat === '18k' && 'bg-orange-500'
        )}
      />
    </motion.div>
  );
}
