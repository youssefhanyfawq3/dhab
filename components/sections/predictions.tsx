'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Sparkles } from 'lucide-react';
import { PredictionData, PredictionPoint } from '@/types';
import { AnimatedNumber } from '@/components/animations/number-count';
import { formatPrice, cn } from '@/lib/utils';

interface PredictionsSectionProps {
  predictions: PredictionData | null;
}

export function PredictionsSection({ predictions }: PredictionsSectionProps) {
  if (!predictions) {
    return (
      <div className="rounded-xl border border-[#27272A] bg-[#141419] p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFD700] border-t-transparent" />
          <span>Loading predictions...</span>
        </div>
      </div>
    );
  }

  const trendIcons = {
    upward: <TrendingUp className="h-5 w-5 text-green-400" />,
    downward: <TrendingDown className="h-5 w-5 text-red-400" />,
    sideways: <Minus className="h-5 w-5 text-gray-400" />,
  };

  const trendColors = {
    upward: 'text-green-400',
    downward: 'text-red-400',
    sideways: 'text-gray-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="rounded-xl border border-[#27272A] bg-[#0A0A0F]/30 backdrop-blur-md p-6"
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FFD700]" />
            <h3 className="text-lg font-semibold text-white">AI Price Predictions</h3>
          </div>
          <p className="text-sm text-gray-400">
            {predictions.karat} Gold • Next {predictions.predictions.length} days
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Model Accuracy</p>
            <p className="text-lg font-bold text-[#FFD700]">{predictions.accuracy}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Trend</p>
            <div className="flex items-center gap-1">
              {trendIcons[predictions.trend]}
              <span className={cn('text-sm font-medium capitalize', trendColors[predictions.trend])}>
                {predictions.trend}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {predictions.predictions.slice(0, 7).map((prediction, index) => (
          <PredictionCard
            key={prediction.date}
            prediction={prediction}
            index={index}
          />
        ))}
      </div>

      {/* Stats row */}
      <div className="mt-6 grid gap-4 border-t border-[#27272A] pt-6 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFD700]/10">
            <Target className="h-5 w-5 text-[#FFD700]" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Confidence</p>
            <p className="text-sm font-medium text-white">
              {Math.round(
                predictions.predictions.reduce((acc, p) => acc + p.confidence, 0) /
                  predictions.predictions.length *
                  100
              )}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Volatility</p>
            <p className="text-sm font-medium capitalize text-white">
              {predictions.volatility}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Model Version</p>
            <p className="text-sm font-medium text-white">{predictions.modelVersion}</p>
          </div>
        </div>
      </div>

      {/* Last trained info */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Last trained: {new Date(predictions.lastTrained).toLocaleString('en-EG')}
      </div>
    </motion.div>
  );
}

function PredictionCard({ prediction, index }: { prediction: PredictionPoint; index: number }) {
  const date = new Date(prediction.date);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-lg border border-[#27272A] bg-[#0A0A0F] p-3 text-center transition-colors hover:border-[#FFD700]/30"
    >
      <div className="mb-2">
        <p className="text-xs text-gray-500">{dayName}</p>
        <p className="text-lg font-bold text-white">{dayNum}</p>
        <p className="text-xs text-gray-500">{month}</p>
      </div>
      <div className="mb-2">
        <p className="text-sm font-bold text-[#FFD700]">
          <AnimatedNumber value={prediction.price} duration={1} />
        </p>
      </div>
      {/* Confidence bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#27272A]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${prediction.confidence * 100}%` }}
          transition={{ duration: 0.8, delay: index * 0.05 + 0.3 }}
          className={cn(
            'h-full rounded-full',
            prediction.confidence > 0.85 && 'bg-green-500',
            prediction.confidence > 0.7 && prediction.confidence <= 0.85 && 'bg-yellow-500',
            prediction.confidence <= 0.7 && 'bg-orange-500'
          )}
        />
      </div>
      <p className="mt-1 text-[10px] text-gray-500">
        {Math.round(prediction.confidence * 100)}% confident
      </p>
    </motion.div>
  );
}
