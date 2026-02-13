'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { HistoricalDataPoint, KaratType, TIME_RANGES } from '@/types';
import { cn } from '@/lib/utils';

interface GoldChartProps {
  data: HistoricalDataPoint[];
  predictions?: { date: string; price: number }[];
  karat: KaratType;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  loading?: boolean;
}

const karatColors: Record<KaratType, string> = {
  '24k': '#FFD700',
  '22k': '#FFE135',
  '21k': '#FFC107',
  '18k': '#FF9800',
};

export function GoldChart({
  data,
  predictions = [],
  karat,
  timeRange,
  onTimeRangeChange,
  loading = false,
}: GoldChartProps) {
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Fix hydration issues - only render chart after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Combine historical and prediction data properly
  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string; historical?: number; prediction?: number }>();

    // Process historical data
    data.forEach((d) => {
      dataMap.set(d.date, {
        date: d.date,
        historical: d.price,
      });
    });

    // Process predictions
    predictions.forEach((p) => {
      const existing = dataMap.get(p.date) || { date: p.date };
      dataMap.set(p.date, {
        ...existing,
        prediction: p.price,
      });
    });

    // Convert map to array and sort by date
    return Array.from(dataMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data, predictions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-[#27272A] bg-[#141419] p-3 shadow-xl space-y-2"
        >
          <p className="mb-2 text-sm text-gray-400">{label}</p>

          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  entry.name === 'prediction' ? 'bg-[#00D4FF]' : 'bg-[#FFD700]'
                )}
              />
              <span className="text-lg font-bold text-white">
                EGP {entry.value.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">
                /g ({entry.name === 'prediction' ? 'Predicted' : 'Actual'})
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  // Only show chart if we have valid dimensions
  const hasValidDimensions = dimensions.width > 0 && dimensions.height > 0;

  return (
    <div className="w-full">
      {/* Time range selector */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Price History & Predictions
          </h3>
          <p className="text-sm text-gray-400">
            Historical data with AI-powered forecasts
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-[#141419] p-1 border border-[#27272A]">
          {TIME_RANGES.map((range) => (
            <motion.button
              key={range.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTimeRangeChange(range.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                timeRange === range.value
                  ? 'bg-[#FFD700] text-black'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {range.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-xl border border-[#27272A] bg-[#141419] p-4"
        style={{ height: '400px' }}
      >
        {loading ? (
          // Loading skeleton
          <div className="flex h-full flex-col items-center justify-center space-y-6">
            {/* Chart title skeleton */}
            <div className="w-full flex justify-between px-4">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-[#27272A] animate-pulse" />
                <div className="h-3 w-48 rounded bg-[#27272A] animate-pulse" />
              </div>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 w-12 rounded bg-[#27272A] animate-pulse" />
                ))}
              </div>
            </div>

            {/* Chart area skeleton */}
            <div className="flex-1 w-full flex items-end justify-between px-4 pb-8 space-x-2">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-full rounded-t bg-gradient-to-t from-[#27272A] to-[#FFD700]/20"
                  initial={{ height: 0 }}
                  animate={{
                    height: `${20 + Math.random() * 60}%`,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>

            {/* Loading text */}
            <div className="flex items-center gap-2 text-gray-500">
              <div className="h-4 w-4 rounded-full border-2 border-[#27272A] border-t-[#FFD700] animate-spin" />
              <span className="text-sm">Loading chart data...</span>
            </div>
          </div>
        ) : chartData.length > 0 && mounted && hasValidDimensions ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              onMouseMove={(e: any) => setHoveredData(e?.activePayload || null)}
              onMouseLeave={() => setHoveredData(null)}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <defs>
                <linearGradient id={`colorPrice-${karat}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={karatColors[karat]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={karatColors[karat]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272A"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#27272A' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#27272A' }}
                tickFormatter={(value) => `EGP ${value.toLocaleString()}`}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Historical data line */}
              <Area
                type="monotone"
                dataKey="historical"
                stroke={karatColors[karat]}
                strokeWidth={2}
                fill={`url(#colorPrice-${karat})`}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: karatColors[karat],
                  stroke: '#0A0A0F',
                  strokeWidth: 2,
                }}
                connectNulls // Connect points if there are gaps (optional, but good for single missing days)
              />

              {/* Prediction line */}
              {predictions.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="prediction"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{
                    r: 4,
                    fill: '#00D4FF',
                    stroke: '#0A0A0F',
                    strokeWidth: 2,
                  }}
                  connectNulls
                />
              )}

              {/* Reference line for today */}
              {predictions.length > 0 && data.length > 0 && (
                <ReferenceLine
                  x={data[data.length - 1]?.date}
                  stroke="#6B7280"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Today',
                    fill: '#6B7280',
                    fontSize: 12,
                    position: 'insideTopLeft',
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            {chartData.length === 0 ? 'No data available' : 'Loading chart...'}
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: karatColors[karat] }}
          />
          <span className="text-sm text-gray-400">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#00D4FF]" />
          <span className="text-sm text-gray-400">AI Prediction</span>
        </div>
      </div>
    </div>
  );
}
