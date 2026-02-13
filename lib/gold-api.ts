import { GoldAPIResponse, CurrentGoldData, GoldPrices, KaratType } from '@/types';

const GOLDAPI_BASE_URL = 'https://www.goldapi.io/api';
const API_KEY = process.env.GOLDAPI_KEY;

if (!API_KEY) {
  console.warn('Warning: GOLDAPI_KEY environment variable is not set. Using fallback prices.');
}

export async function fetchCurrentGoldPrice(): Promise<CurrentGoldData | null> {
  try {
    // Validate API key exists
    if (!API_KEY) {
      console.warn('GOLDAPI_KEY not configured, using fallback prices');
      return fetchFallbackPrices();
    }

    // Try GoldAPI first
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${GOLDAPI_BASE_URL}/XAU/EGP`, {
        headers: {
          'x-access-token': API_KEY,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: GoldAPIResponse = await response.json();
        // Validate response data
        if (isValidGoldAPIResponse(data)) {
          return transformGoldAPIData(data);
        }
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('GoldAPI request timed out');
      } else {
        console.error('GoldAPI fetch error:', fetchError);
      }
    }

    // Fallback to calculated prices based on global gold price
    return fetchFallbackPrices();
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    return fetchFallbackPrices();
  }
}

export async function fetchHistoricalGoldPrice(date: string): Promise<CurrentGoldData | null> {
  try {
    if (!API_KEY) {
      console.warn('GOLDAPI_KEY not configured');
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // date should be in YYYYMMDD format
      const response = await fetch(`${GOLDAPI_BASE_URL}/XAU/EGP/${date}`, {
        headers: {
          'x-access-token': API_KEY,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        next: { revalidate: 86400 }, // Cache for 24 hours (historical data doesn't change)
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: GoldAPIResponse = await response.json();
        if (isValidGoldAPIResponse(data)) {
          return transformGoldAPIData(data);
        }
      } else {
        console.error(`GoldAPI error for date ${date}: ${response.status} ${response.statusText}`);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`GoldAPI fetch error for date ${date}:`, fetchError);
    }

    return null;
  } catch (error) {
    console.error('Error fetching historical gold prices:', error);
    return null;
  }
}


// Validate GoldAPI response structure
function isValidGoldAPIResponse(data: unknown): data is GoldAPIResponse {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;
  return (
    typeof d.timestamp === 'number' &&
    typeof d.price === 'number' &&
    typeof d.price_gram_24k === 'number' &&
    typeof d.price_gram_22k === 'number' &&
    typeof d.price_gram_21k === 'number' &&
    typeof d.price_gram_18k === 'number'
  );
}

function transformGoldAPIData(data: GoldAPIResponse): CurrentGoldData {
  const prices: GoldPrices = {
    '24k': {
      gram: Math.round(data.price_gram_24k),
      ounce: Math.round(data.price),
    },
    '22k': {
      gram: Math.round(data.price_gram_22k),
      ounce: Math.round(data.price * 0.9167),
    },
    '21k': {
      gram: Math.round(data.price_gram_21k),
      ounce: Math.round(data.price * 0.875),
    },
    '18k': {
      gram: Math.round(data.price_gram_18k),
      ounce: Math.round(data.price * 0.75),
    },
  };

  // Calculate USD/EGP rate from the data
  const usdEgpRate = data.price / (data.price_gram_24k * 31.1035);

  return {
    timestamp: data.timestamp * 1000,
    date: new Date(data.timestamp * 1000).toISOString().split('T')[0],
    prices,
    usdEgpRate: Math.round(usdEgpRate * 100) / 100,
    globalOunceUsd: Math.round(data.price / usdEgpRate),
  };
}

async function fetchFallbackPrices(): Promise<CurrentGoldData> {
  try {
    let globalPriceUsd = 2800; // Default fallback

    // Try to fetch global gold price in USD with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('https://api.gold-api.com/price/XAU', {
        signal: controller.signal,
        next: { revalidate: 3600 },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.price === 'number' && data.price > 0) {
          globalPriceUsd = data.price;
        }
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('Fallback gold price fetch failed, using default');
    }

    // Fetch USD/EGP exchange rate
    const usdEgpRate = await fetchUsdEgpRate();

    // Calculate EGP prices
    const globalPriceEgp = globalPriceUsd * usdEgpRate;
    const pricePerGram24k = globalPriceEgp / 31.1035; // Convert ounce to gram

    // Validate calculated prices
    if (!isFinite(pricePerGram24k) || pricePerGram24k <= 0) {
      console.warn('Invalid calculated prices, using defaults');
      return getDefaultPrices();
    }

    const prices: GoldPrices = {
      '24k': {
        gram: Math.round(pricePerGram24k),
        ounce: Math.round(globalPriceEgp),
      },
      '22k': {
        gram: Math.round(pricePerGram24k * 0.9167),
        ounce: Math.round(globalPriceEgp * 0.9167),
      },
      '21k': {
        gram: Math.round(pricePerGram24k * 0.875),
        ounce: Math.round(globalPriceEgp * 0.875),
      },
      '18k': {
        gram: Math.round(pricePerGram24k * 0.75),
        ounce: Math.round(globalPriceEgp * 0.75),
      },
    };

    return {
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      prices,
      usdEgpRate,
      globalOunceUsd: Math.round(globalPriceUsd),
    };
  } catch (error) {
    console.error('Error in fallback prices:', error);
    return getDefaultPrices();
  }
}

async function fetchUsdEgpRate(): Promise<number> {
  try {
    // Try to get exchange rate from an API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.rates?.EGP && typeof data.rates.EGP === 'number' && data.rates.EGP > 0) {
        return data.rates.EGP;
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Error fetching exchange rate:', error);
    }
  }

  return 50.85; // Default fallback rate
}

function getDefaultPrices(): CurrentGoldData {
  const prices: GoldPrices = {
    '24k': { gram: 7408, ounce: 230400 },
    '22k': { gram: 6829, ounce: 212400 },
    '21k': { gram: 6482, ounce: 201600 },
    '18k': { gram: 5556, ounce: 172800 },
  };

  return {
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
    prices,
    usdEgpRate: 50.85,
    globalOunceUsd: 2800,
  };
}

export function calculatePriceChange(current: number, previous: number): { change: number; changePercent: number } {
  const change = current - previous;
  const changePercent = (change / previous) * 100;

  return {
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
  };
}

export function calculateKaratPrice(price24k: number, karat: KaratType): number {
  const karatValues: Record<KaratType, number> = {
    '24k': 24,
    '22k': 22,
    '21k': 21,
    '18k': 18,
  };

  return Math.round((price24k * karatValues[karat]) / 24);
}
