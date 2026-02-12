'use client';

import { useState, useMemo } from 'react';
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
}: GoldChartProps) {
  const [hoveredData, setHoveredData] = useState<any>(null);

  // Combine historical and prediction data
  const chartData = useMemo(() => {
    const historical = data.map((d) => ({
      date: d.date,
      price: d.price,
      type: 'historical',
    }));

    const predicted = predictions.map((p) => ({
      date: p.date,
      price: p.price,
      type: 'prediction',
    }));

    return [...historical, ...predicted];
  }, [data, predictions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isPrediction = payload[0].payload.type === 'prediction';
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-[#27272A] bg-[#141419] p-3 shadow-xl"
        >
          <p className="mb-2 text-sm text-gray-400">{label}</p>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isPrediction ? 'bg-[#00D4FF]' : 'bg-[#FFD700]'
              )}
            />
            <span className="text-lg font-bold text-white">
              EGP {payload[0].value.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">
              /g ({isPrediction ? 'Predicted' : 'Actual'})
            </span>
          </div>
        </motion.div>
      );
    }
    return null;
  };

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="h-[400px] w-full min-h-[400px] rounded-xl border border-[#27272A] bg-[#141419] p-4"
      >
        {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            onMouseMove={(e: any) => setHoveredData(e?.activePayload || null)}
            onMouseLeave={() => setHoveredData(null)}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="price"
              stroke={karatColors[karat]}
              strokeWidth={2}
              fill="url(#colorPrice)"
              dot={false}
              activeDot={{
                r: 6,
                fill: karatColors[karat],
                stroke: '#0A0A0F',
                strokeWidth: 2,
              }}
            />

            {/* Prediction line */}
            {predictions.length > 0 && (
              <Line
                type="monotone"
                dataKey="price"
                data={chartData.filter((d) => d.type === 'prediction')}
                stroke="#00D4FF"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  r: 4,
                  fill: '#00D4FF',
                  stroke: '#0A0A0F',
                  strokeWidth: 2,
                }}
              />
            )}

            {/* Reference line for today */}
            {predictions.length > 0 && (
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
        )}
        {chartData.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-500">
            Loading chart data...
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
