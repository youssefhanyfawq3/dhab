'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { PriceCard } from '@/components/ui/price-card';
import { GoldChart } from '@/components/ui/chart';
import { PredictionsSection } from '@/components/sections/predictions';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { CurrentGoldData, HistoricalDataPoint, PredictionData, KaratType } from '@/types';
import { Activity, Clock, TrendingUp } from 'lucide-react';

export default function Home() {
  const [currentData, setCurrentData] = useState<CurrentGoldData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [selectedKarat, setSelectedKarat] = useState<KaratType>('24k');
  const [timeRange, setTimeRange] = useState('90d');
  const [loading, setLoading] = useState(true);

  // Fetch current prices
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const response = await fetch('/api/gold/current');
        if (response.ok) {
          const data = await response.json();
          setCurrentData(data);
        }
      } catch (error) {
        console.error('Error fetching current prices:', error);
      }
    };

    fetchCurrent();
  }, []);

  // Fetch historical data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const days = parseInt(timeRange.replace('d', '').replace('y', ''), 10) * (timeRange.includes('y') ? 365 : 1);
        const response = await fetch(`/api/history?karat=${selectedKarat}&days=${days}`);
        if (response.ok) {
          const data = await response.json();
          setHistoricalData(data.data);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistory();
  }, [selectedKarat, timeRange]);

  // Fetch predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch(`/api/predict?karat=${selectedKarat}&days=7`);
        if (response.ok) {
          const data = await response.json();
          setPredictions(data);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [selectedKarat]);

  const karats: KaratType[] = ['24k', '22k', '21k', '18k'];

  return (
    <div className="min-h-screen bg-transparent">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <FadeIn className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0A0A0F]/30 backdrop-blur-md border border-[#FFD700]/30 px-4 py-2"
          >
            <Activity className="h-4 w-4 text-[#FFD700]" />
            <span className="text-sm font-medium text-[#FFD700]">Live Market Data</span>
          </motion.div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Egyptian Gold Prices
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            Real-time gold prices with AI-powered predictions. Track 24K, 22K, 21K, and 18K gold rates in Egyptian Pounds.
          </p>

          {currentData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400"
            >
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date(currentData.timestamp).toLocaleString('en-EG')}</span>
            </motion.div>
          )}
        </FadeIn>

        {/* Price Cards */}
        <StaggerContainer className="mb-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {karats.map((karat, index) => (
            <StaggerItem key={karat}>
              <motion.div
                onClick={() => setSelectedKarat(karat)}
                className="cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentData ? (
                  <PriceCard
                    karat={karat}
                    price={currentData.prices[karat]}
                    index={index}
                    isPopular={karat === '21k'}
                  />
                ) : (
                  <div className="h-48 animate-pulse rounded-xl border border-[#27272A] bg-[#141419]" />
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Selected Karat Indicator */}
        <FadeIn delay={0.} className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-gray-400">Selected:</span>
            <div className="flex items-center gap-2 rounded-full bg-[#0A0A0F]/30 backdrop-blur-md border border-white/10 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-[#FFD700]" />
              <span className="font-medium text-white">{selectedKarat} Gold</span>
            </div>
          </div>
        </FadeIn>

        {/* Chart Section */}
        <FadeIn delay={0.9} className="mb-12">
          <GoldChart
            data={historicalData}
            predictions={predictions?.predictions || []}
            karat={selectedKarat}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </FadeIn>

        {/* Predictions Section */}
        <FadeIn delay={0.6} className="mb-12">
          <PredictionsSection predictions={predictions} />
        </FadeIn>

        {/* Stats Section */}
        <FadeIn delay={0.7}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="24h Volume"
              value="2.4M"
              suffix="EGP"
              icon={<Activity className="h-5 w-5" />}
              trend="+12%"
            />
            <StatCard
              title="Market Cap"
              value="180B"
              suffix="EGP"
              icon={<TrendingUp className="h-5 w-5" />}
              trend="+5.3%"
            />
            <StatCard
              title="Active Traders"
              value="45.2K"
              suffix=""
              icon={<Activity className="h-5 w-5" />}
              trend="+8.1%"
            />
            <StatCard
              title="Prediction Accuracy"
              value="94.5"
              suffix="%"
              icon={<Activity className="h-5 w-5" />}
              trend="+2.1%"
            />
          </div>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={0.8} className="mt-16 pt-8 text-center">
          <div className="bg-[#0A0A0F]/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">
              DHAB - Egyptian Gold Price Tracker © {new Date().getFullYear()}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Prices are for informational purposes only. Not financial advice.
            </p>
          </div>
        </FadeIn>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix,
  icon,
  trend,
}: {
  title: string;
  value: string;
  suffix: string;
  icon: React.ReactNode;
  trend: string;
}) {
  const isPositive = trend.startsWith('+');

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl bg-[#0A0A0F]/30 backdrop-blur-md p-4 transition-all hover:bg-[#0A0A0F]/50 border border-white/10"
    >
      <div className="mb-3 flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-white">{value}</span>
          {suffix && <span className="ml-1 text-sm text-gray-500">{suffix}</span>}
        </div>
        <span
          className={`text-sm font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {trend}
        </span>
      </div>
    </motion.div>
  );
}
