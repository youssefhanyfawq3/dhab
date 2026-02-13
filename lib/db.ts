import { Redis } from '@upstash/redis';
import { CurrentGoldData, HistoricalDataPoint, KaratType, PredictionData, ModelMetadata } from '@/types';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isRedisConfigured = redisUrl && redisToken &&
  redisUrl !== 'https://localhost' &&
  !redisUrl.includes('localhost');

if (!isRedisConfigured) {
  console.warn('Warning: Redis environment variables are not set. Using mock data.');
}

const redis = isRedisConfigured ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

// Helper function to add timeout to Redis operations
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000, fallback: T): Promise<T> {
  if (!promise) return fallback;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Redis operation timeout')), timeoutMs);
    });
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.warn('Redis operation failed or timed out:', error);
    return fallback;
  }
}

// Key prefixes
const KEYS = {
  CURRENT: 'gold:current',
  HISTORY: (karat: KaratType) => `gold:history:${karat}`,
  PREDICTIONS_LATEST: (karat: KaratType) => `predictions:latest:${karat}`,
  PREDICTIONS_HISTORY: (karat: KaratType) => `predictions:history:${karat}`,
  MODEL_METADATA: 'model:metadata',
};

// Validate CurrentGoldData structure
function isValidCurrentGoldData(data: unknown): data is CurrentGoldData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.timestamp === 'number' &&
    typeof d.date === 'string' &&
    typeof d.prices === 'object' &&
    d.prices !== null &&
    typeof d.usdEgpRate === 'number' &&
    typeof d.globalOunceUsd === 'number'
  );
}

// Current Prices
export async function getCurrentPrices(): Promise<CurrentGoldData | null> {
  if (!redis) return null;

  try {
    const data = await withTimeout(redis.get<CurrentGoldData>(KEYS.CURRENT), 3000, null);
    if (data && isValidCurrentGoldData(data)) {
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error getting current prices:', error);
    return null;
  }
}

export async function setCurrentPrices(data: CurrentGoldData): Promise<void> {
  if (!redis) return;

  try {
    if (!isValidCurrentGoldData(data)) {
      console.error('Invalid data structure for current prices');
      return;
    }
    await withTimeout(redis.set(KEYS.CURRENT, data), 3000, undefined);
  } catch (error) {
    console.error('Error setting current prices:', error);
  }
}

// Validate historical data
function isValidHistoricalDataPoint(data: unknown): data is { timestamp: number; price: number } {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.timestamp === 'number' &&
    typeof d.price === 'number' &&
    d.timestamp > 0 &&
    d.price > 0
  );
}

// Historical Data
export async function addHistoricalPrice(karat: KaratType, timestamp: number, price: number): Promise<void> {
  if (!redis) return;

  try {
    // Validate inputs
    if (!timestamp || timestamp <= 0 || !price || price <= 0) {
      console.error('Invalid historical price data');
      return;
    }
    await withTimeout(
      redis.zadd(KEYS.HISTORY(karat), { score: timestamp, member: JSON.stringify({ timestamp, price }) }),
      3000,
      undefined
    );
  } catch (error) {
    console.error('Error adding historical price:', error);
  }
}

export async function getHistoricalData(karat: KaratType, days: number = 90): Promise<HistoricalDataPoint[]> {
  if (!redis) {
    console.log('Redis not configured, returning empty data');
    return [];
  }

  try {
    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;

    // Use zrange with byScore option for Upstash Redis
    const data = await withTimeout(
      redis.zrange(KEYS.HISTORY(karat), startTime, endTime, { byScore: true }),
      3000,
      []
    );

    if (!data || data.length === 0) {
      return [];
    }

    return (data as string[]).map((item) => {
      try {
        // Handle case where item might already be an object
        const parsed = typeof item === 'string' ? JSON.parse(item) : item;
        return {
          timestamp: parsed.timestamp,
          price: parsed.price,
          date: new Date(parsed.timestamp).toISOString().split('T')[0],
        };
      } catch (e) {
        console.error('Failed to parse item:', item, e);
        return null;
      }
    }).filter((item): item is HistoricalDataPoint => item !== null);
  } catch (error) {
    console.error('Error getting historical data:', error);
    return [];
  }
}

export async function getLastHistoricalPrice(karat: KaratType): Promise<HistoricalDataPoint | null> {
  if (!redis) return null;

  try {
    // Get the very last item from the sorted set
    const data = await withTimeout(
      redis.zrange(KEYS.HISTORY(karat), -1, -1),
      3000,
      []
    );

    if (!data || data.length === 0) {
      return null;
    }

    const item = data[0];
    try {
      const parsed = typeof item === 'string' ? JSON.parse(item) : item;
      return {
        timestamp: parsed.timestamp,
        price: parsed.price,
        date: new Date(parsed.timestamp).toISOString().split('T')[0],
      };
    } catch (e) {
      console.error('Failed to parse last historical item:', item, e);
      return null;
    }
  } catch (error) {
    console.error('Error getting last historical price:', error);
    return null;
  }
}

// Validate PredictionData structure
function isValidPredictionData(data: unknown): data is PredictionData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.modelVersion === 'string' &&
    typeof d.lastTrained === 'string' &&
    typeof d.accuracy === 'number' &&
    Array.isArray(d.predictions) &&
    typeof d.trend === 'string' &&
    typeof d.volatility === 'string' &&
    typeof d.karat === 'string'
  );
}

// Predictions
export async function getLatestPredictions(karat: KaratType): Promise<PredictionData | null> {
  if (!redis) return null;

  try {
    const data = await withTimeout(
      redis.get<PredictionData>(KEYS.PREDICTIONS_LATEST(karat)),
      3000,
      null
    );
    if (data && isValidPredictionData(data)) {
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error getting predictions:', error);
    return null;
  }
}

export async function setLatestPredictions(karat: KaratType, data: PredictionData): Promise<void> {
  if (!redis) return;

  try {
    if (!isValidPredictionData(data)) {
      console.error('Invalid prediction data structure');
      return;
    }
    await withTimeout(redis.set(KEYS.PREDICTIONS_LATEST(karat), data), 3000, undefined);
    // Also add to history
    await withTimeout(redis.lpush(KEYS.PREDICTIONS_HISTORY(karat), JSON.stringify(data)), 3000, undefined);
    // Keep only last 100 predictions
    await withTimeout(redis.ltrim(KEYS.PREDICTIONS_HISTORY(karat), 0, 99), 3000, undefined);
  } catch (error) {
    console.error('Error setting predictions:', error);
  }
}

// Model Metadata
export async function getModelMetadata(): Promise<ModelMetadata | null> {
  if (!redis) return null;

  try {
    const data = await withTimeout(redis.get<ModelMetadata>(KEYS.MODEL_METADATA), 3000, null);
    return data;
  } catch (error) {
    console.error('Error getting model metadata:', error);
    return null;
  }
}

export async function setModelMetadata(data: ModelMetadata): Promise<void> {
  if (!redis) return;

  try {
    await withTimeout(redis.set(KEYS.MODEL_METADATA, data), 3000, undefined);
  } catch (error) {
    console.error('Error setting model metadata:', error);
  }
}

export { redis, isRedisConfigured };
