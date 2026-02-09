import { Redis } from '@upstash/redis';
import { CurrentGoldData, HistoricalDataPoint, KaratType, PredictionData, ModelMetadata } from '@/types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Key prefixes
const KEYS = {
  CURRENT: 'gold:current',
  HISTORY: (karat: KaratType) => `gold:history:${karat}`,
  PREDICTIONS_LATEST: (karat: KaratType) => `predictions:latest:${karat}`,
  PREDICTIONS_HISTORY: (karat: KaratType) => `predictions:history:${karat}`,
  MODEL_METADATA: 'model:metadata',
};

// Current Prices
export async function getCurrentPrices(): Promise<CurrentGoldData | null> {
  try {
    const data = await redis.get<CurrentGoldData>(KEYS.CURRENT);
    return data;
  } catch (error) {
    console.error('Error getting current prices:', error);
    return null;
  }
}

export async function setCurrentPrices(data: CurrentGoldData): Promise<void> {
  try {
    await redis.set(KEYS.CURRENT, data);
  } catch (error) {
    console.error('Error setting current prices:', error);
  }
}

// Historical Data
export async function addHistoricalPrice(karat: KaratType, timestamp: number, price: number): Promise<void> {
  try {
    await redis.zadd(KEYS.HISTORY(karat), { score: timestamp, member: JSON.stringify({ timestamp, price }) });
  } catch (error) {
    console.error('Error adding historical price:', error);
  }
}

export async function getHistoricalData(karat: KaratType, days: number = 90): Promise<HistoricalDataPoint[]> {
  try {
    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;
    
    // Use zrange with byScore option for Upstash Redis
    const data = await redis.zrange(KEYS.HISTORY(karat), startTime, endTime, {
      byScore: true,
    });
    
    if (!data || data.length === 0) {
      // Return mock data if no data exists
      return generateMockHistoricalData(days, karat);
    }
    
    return (data as string[]).map((item) => {
      const parsed = JSON.parse(item);
      return {
        timestamp: parsed.timestamp,
        price: parsed.price,
        date: new Date(parsed.timestamp).toISOString().split('T')[0],
      };
    });
  } catch (error) {
    console.error('Error getting historical data:', error);
    return generateMockHistoricalData(days, karat);
  }
}

// Predictions
export async function getLatestPredictions(karat: KaratType): Promise<PredictionData | null> {
  try {
    const data = await redis.get<PredictionData>(KEYS.PREDICTIONS_LATEST(karat));
    return data;
  } catch (error) {
    console.error('Error getting predictions:', error);
    return null;
  }
}

export async function setLatestPredictions(karat: KaratType, data: PredictionData): Promise<void> {
  try {
    await redis.set(KEYS.PREDICTIONS_LATEST(karat), data);
    // Also add to history
    await redis.lpush(KEYS.PREDICTIONS_HISTORY(karat), JSON.stringify(data));
    // Keep only last 100 predictions
    await redis.ltrim(KEYS.PREDICTIONS_HISTORY(karat), 0, 99);
  } catch (error) {
    console.error('Error setting predictions:', error);
  }
}

// Model Metadata
export async function getModelMetadata(): Promise<ModelMetadata | null> {
  try {
    const data = await redis.get<ModelMetadata>(KEYS.MODEL_METADATA);
    return data;
  } catch (error) {
    console.error('Error getting model metadata:', error);
    return null;
  }
}

export async function setModelMetadata(data: ModelMetadata): Promise<void> {
  try {
    await redis.set(KEYS.MODEL_METADATA, data);
  } catch (error) {
    console.error('Error setting model metadata:', error);
  }
}

// Generate mock historical data for development
function generateMockHistoricalData(days: number, karat: KaratType): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  const basePrices: Record<KaratType, number> = {
    '24k': 7400,
    '22k': 6800,
    '21k': 6500,
    '18k': 5550,
  };
  
  const basePrice = basePrices[karat];
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const date = new Date(timestamp).toISOString().split('T')[0];
    
    // Add some randomness and trend
    const trend = Math.sin(i / 10) * 200;
    const noise = (Math.random() - 0.5) * 100;
    const price = Math.round(basePrice + trend + noise);
    
    data.push({
      date,
      timestamp,
      price,
    });
  }
  
  return data;
}

export { redis };
