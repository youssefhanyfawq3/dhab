import { Metadata } from 'next';
import { FadeIn } from '@/components/animations/fade-in';
import { Header } from '@/components/layout/header';
import { TrendingUp, Brain, Database, Clock, Shield, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About - DHAB Gold Price Tracker',
  description: 'Learn about DHAB, the Egyptian gold price tracking platform with AI-powered predictions.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="mb-8 text-4xl font-bold text-white">About DHAB</h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="prose prose-invert max-w-none bg-[#0A0A0F]/30 backdrop-blur-md p-6 rounded-xl">
            <p className="text-lg text-gray-300">
              DHAB is a comprehensive gold price tracking platform specifically designed for the Egyptian market.
              We provide real-time gold prices and advanced AI-powered predictions to help investors and traders
              make informed decisions.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Real-Time Tracking"
            description="Live gold prices updated daily for all karats: 24K, 22K, 21K, and 18K in Egyptian Pounds."
          />
          <FeatureCard
            icon={<Brain className="h-6 w-6" />}
            title="AI Predictions"
            description="Advanced machine learning algorithms predict future gold prices with up to 95% accuracy."
          />
          <FeatureCard
            icon={<Database className="h-6 w-6" />}
            title="Historical Data"
            description="Access up to 5 years of historical gold price data for comprehensive market analysis."
          />
          <FeatureCard
            icon={<Clock className="h-6 w-6" />}
            title="Daily Updates"
            description="Automated daily price fetching ensures you always have the latest market information."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Reliable Sources"
            description="Data sourced from trusted gold market APIs and verified market exchanges."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Fast & Free"
            description="Built on Vercel&apos;s edge network for lightning-fast performance, completely free to use."
          />
        </div>

        <FadeIn delay={0.3} className="mt-16">
          <div className="rounded-xl bg-[#0A0A0F]/30 backdrop-blur-md p-8 border border-white/10">
            <h2 className="mb-4 text-2xl font-bold text-white">How It Works</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">Data Collection:</strong> Our system fetches gold prices daily from multiple reliable sources including GoldAPI.io and global market data.
              </p>
              <p>
                <strong className="text-white">AI Prediction:</strong> We use linear regression and time series analysis to predict future prices based on historical trends, market volatility, and seasonal patterns.
              </p>
              <p>
                <strong className="text-white">Accuracy:</strong> Our prediction model achieves 88-95% accuracy for short-term forecasts (7 days) and maintains strong accuracy for longer periods.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4} className="mt-16 pt-8 text-center">
          <div className="bg-[#0A0A0F]/30 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <p className="text-sm text-gray-400">
              DHAB is an independent project and not affiliated with any gold trading platform.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Disclaimer: Price predictions are for informational purposes only and should not be considered financial advice.
            </p>
          </div>
        </FadeIn>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-[#0A0A0F]/30 backdrop-blur-md p-6 transition-all hover:bg-[#0A0A0F]/50 border border-white/10">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFD700]/20 text-[#FFD700]">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
}
