'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Sparkles } from 'lucide-react';
import { PredictionData, PredictionPoint } from '@/types';
import { AnimatedNumber } from '@/components/animations/number-count';
import { formatPrice, cn } from '@/lib/utils';

interface PredictionsSectionProps {
  predictions: PredictionData | null;
  loading?: boolean;
}

export function PredictionsSection({ predictions, loading = false }: PredictionsSectionProps) {
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

  if (loading || !predictions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-xl border border-[#27272A] bg-[#0A0A0F]/30 backdrop-blur-md p-6"
      >
        {/* Header skeleton */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-[#FFD700]/20 animate-pulse" />
              <div className="h-6 w-40 rounded bg-[#27272A] animate-pulse" />
            </div>
            <div className="h-4 w-48 rounded bg-[#27272A] animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="text-right space-y-2">
              <div className="h-3 w-24 rounded bg-[#27272A] animate-pulse" />
              <div className="h-6 w-16 rounded bg-[#27272A] animate-pulse" />
            </div>
            <div className="text-right space-y-2">
              <div className="h-3 w-16 rounded bg-[#27272A] animate-pulse" />
              <div className="h-6 w-20 rounded bg-[#27272A] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Prediction cards skeleton */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          {[...Array(7)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-lg border border-[#27272A] bg-[#0A0A0F] p-3 text-center space-y-3"
            >
              <div className="space-y-1">
                <div className="h-3 w-8 mx-auto rounded bg-[#27272A] animate-pulse" />
                <div className="h-6 w-10 mx-auto rounded bg-[#27272A] animate-pulse" />
                <div className="h-3 w-6 mx-auto rounded bg-[#27272A] animate-pulse" />
              </div>
              <div className="h-5 w-16 mx-auto rounded bg-[#27272A] animate-pulse" />
              <div className="h-1.5 w-full rounded-full bg-[#27272A] animate-pulse" />
              <div className="h-3 w-20 mx-auto rounded bg-[#27272A] animate-pulse" />
            </motion.div>
          ))}
        </div>

        {/* Stats row skeleton */}
        <div className="mt-6 grid gap-4 border-t border-[#27272A] pt-6 sm:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#27272A] animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-[#27272A] animate-pulse" />
                <div className="h-4 w-16 rounded bg-[#27272A] animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFD700] border-t-transparent" />
          <span className="text-sm">Loading predictions...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
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
