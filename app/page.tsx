'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { PriceCard } from '@/components/ui/price-card';
import { GoldChart } from '@/components/ui/chart';
import { PredictionsSection } from '@/components/sections/predictions';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { CachedBadge } from '@/components/ui/cached-badge';
import { FadeIn, StaggerContainer, StaggerItem, SlideIn, ScaleIn } from '@/components/animations/fade-in';
import { useCachedFetch } from '@/hooks/use-cached-fetch';
import { CurrentGoldData, HistoricalDataPoint, PredictionData, KaratType } from '@/types';
import { Activity, Clock, TrendingUp } from 'lucide-react';
import { CACHE_CONFIG } from '@/lib/cache';
import { LoadCompleteProvider } from '@/contexts/load-complete-context';

// Fetch functions
async function fetchCurrentPrices(): Promise<CurrentGoldData> {
  const response = await fetch('/api/gold/current');
  if (!response.ok) {
    throw new Error('Failed to fetch current prices');
  }
  return response.json();
}

async function fetchHistory(karat: KaratType, timeRange: string): Promise<HistoricalDataPoint[]> {
  const days = parseInt(timeRange.replace('d', '').replace('y', ''), 10) * (timeRange.includes('y') ? 365 : 1);
  const response = await fetch(`/api/history?karat=${karat}&days=${days}`);
  if (!response.ok) {
    throw new Error('Failed to fetch historical data');
  }
  const data = await response.json();
  return data.data;
}

async function fetchPredictions(karat: KaratType): Promise<PredictionData> {
  const response = await fetch(`/api/predict?karat=${karat}&days=7`);
  if (!response.ok) {
    throw new Error('Failed to fetch predictions');
  }
  return response.json();
}

export default function Home() {
  const [selectedKarat, setSelectedKarat] = useState<KaratType>('24k');
  const [timeRange, setTimeRange] = useState('90d');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Cached data fetching
  const {
    data: currentData,
    loading: loadingCurrent,
    error: errorCurrent,
    isCached: isCurrentCached,
    refresh: refreshCurrent
  } = useCachedFetch({
    key: 'gold-current',
    fetchFn: fetchCurrentPrices,
    maxAge: CACHE_CONFIG.PRICES_MAX_AGE,
  });

  const {
    data: historicalData,
    loading: loadingHistory,
    error: errorHistory,
    isCached: isHistoryCached,
    refresh: refreshHistory
  } = useCachedFetch({
    key: `gold-history-${selectedKarat}-${timeRange}`,
    fetchFn: () => fetchHistory(selectedKarat, timeRange),
    maxAge: CACHE_CONFIG.HISTORY_MAX_AGE,
  });

  const {
    data: predictions,
    loading: loadingPredictions,
    error: errorPredictions,
    isCached: isPredictionsCached,
    refresh: refreshPredictions
  } = useCachedFetch({
    key: `predictions-${selectedKarat}`,
    fetchFn: () => fetchPredictions(selectedKarat),
    maxAge: CACHE_CONFIG.PREDICTIONS_MAX_AGE,
  });

  // Track initial load completion and hide loading screen
  useEffect(() => {
    if (!loadingCurrent && !loadingHistory && !loadingPredictions) {
      // Small delay so loading screen exit animation plays before content animates in
      const timer = setTimeout(() => setInitialLoadComplete(true), 300);
      return () => clearTimeout(timer);
    }
  }, [loadingCurrent, loadingHistory, loadingPredictions]);

  // Safety timeout - force hide loading screen after 10 seconds max
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!initialLoadComplete) {
        console.warn('Safety timeout: forcing loading screen to hide after 10 seconds');
        setInitialLoadComplete(true);
      }
    }, 10000);

    return () => clearTimeout(safetyTimeout);
  }, [initialLoadComplete]);

  // Check if any data is cached (for showing warning badge)
  const isAnyCached = isCurrentCached || isHistoryCached || isPredictionsCached;

  // Check if we're in a loading state (for skeletons)
  const isLoading = loadingCurrent || loadingHistory || loadingPredictions;

  const karats: KaratType[] = ['24k', '22k', '21k', '18k'];

  return (
    <LoadCompleteProvider isLoadComplete={initialLoadComplete}>
      {/* Full-screen loading animation with AnimatePresence */}
      <AnimatePresence>
        {!initialLoadComplete && (
          <LoadingScreen
            loadingStates={{
              prices: loadingCurrent,
              history: loadingHistory,
              predictions: loadingPredictions,
            }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-transparent">
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Cached data warning */}
          {isAnyCached && (
            <div className="mb-6 flex justify-center">
              <CachedBadge
                visible={isAnyCached}
                onRefresh={() => {
                  refreshCurrent();
                  refreshHistory();
                  refreshPredictions();
                }}
              />
            </div>
          )}

          {/* Hero Section — animates after loading screen */}
          <FadeIn className="mb-12 text-center" trigger="onLoad" delay={0.1}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={initialLoadComplete ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
                animate={initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400"
              >
                <Clock className="h-4 w-4" />
                <span>Last updated: {new Date(currentData.timestamp).toLocaleString('en-EG')}</span>
              </motion.div>
            )}
          </FadeIn>

          {/* Price Cards — stagger after load */}
          <StaggerContainer className="mb-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" trigger="onLoad">
            {karats.map((karat, index) => (
              <StaggerItem key={karat}>
                <motion.div
                  onClick={() => setSelectedKarat(karat)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PriceCard
                    karat={karat}
                    price={currentData?.prices[karat]}
                    index={index}
                    isPopular={karat === '21k'}
                    loading={loadingCurrent}
                  />
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Selected Karat Indicator — scroll reveal */}
          <FadeIn delay={0} className="mb-8" trigger="onScroll">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-gray-400">Selected:</span>
              <div className="flex items-center gap-2 rounded-full bg-[#0A0A0F]/30 backdrop-blur-md border border-white/10 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-[#FFD700]" />
                <span className="font-medium text-white">{selectedKarat} Gold</span>
                {loadingHistory && (
                  <div className="h-3 w-3 rounded-full border border-[#FFD700]/30 border-t-[#FFD700] animate-spin ml-2" />
                )}
              </div>
            </div>
          </FadeIn>

          {/* Chart Section — slide up on scroll */}
          <SlideIn delay={0.1} direction="up" className="mb-12">
            <GoldChart
              data={historicalData || []}
              predictions={predictions?.predictions || []}
              currentPrice={currentData?.prices[selectedKarat]?.gram}
              karat={selectedKarat}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              loading={loadingHistory}
            />
          </SlideIn>

          {/* Predictions Section — scroll reveal */}
          <FadeIn delay={0} className="mb-12" trigger="onScroll">
            <PredictionsSection
              predictions={predictions}
              loading={loadingPredictions}
            />
          </FadeIn>

          {/* Stats Section — stagger on scroll */}
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" trigger="onScroll" staggerDelay={0.12}>
            <StaggerItem>
              <StatCard
                title="24h Volume"
                value="2.4M"
                suffix="EGP"
                icon={<Activity className="h-5 w-5" />}
                trend="+12%"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Market Cap"
                value="180B"
                suffix="EGP"
                icon={<TrendingUp className="h-5 w-5" />}
                trend="+5.3%"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Active Traders"
                value="45.2K"
                suffix=""
                icon={<Activity className="h-5 w-5" />}
                trend="+8.1%"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Prediction Accuracy"
                value={predictions?.accuracy?.toFixed(1) || '94.5'}
                suffix="%"
                icon={<Activity className="h-5 w-5" />}
                trend="+2.1%"
              />
            </StaggerItem>
          </StaggerContainer>

          {/* Footer — scale in on scroll */}
          <ScaleIn delay={0.1} className="mt-16 pt-8 text-center">
            <div className="bg-[#0A0A0F]/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <p className="text-sm text-gray-400">
                DHAB - Egyptian Gold Price Tracker © {new Date().getFullYear()}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Prices are for informational purposes only. Not financial advice.
              </p>
            </div>
          </ScaleIn>
        </main>
      </div>
    </LoadCompleteProvider>
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
      whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
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
          className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'
            }`}
        >
          {trend}
        </span>
      </div>
    </motion.div>
  );
}
