import { GoldAPIResponse, CurrentGoldData, GoldPrices, KaratType } from '@/types';

const GOLDAPI_BASE_URL = 'https://www.goldapi.io/api';
const API_KEY = process.env.GOLDAPI_KEY || 'goldapi-42848smlfwmmj2-io';

export async function fetchCurrentGoldPrice(): Promise<CurrentGoldData | null> {
  try {
    // Try GoldAPI first
    if (API_KEY) {
      const response = await fetch(`${GOLDAPI_BASE_URL}/XAU/EGP`, {
        headers: {
          'x-access-token': API_KEY,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (response.ok) {
        const data: GoldAPIResponse = await response.json();
        return transformGoldAPIData(data);
      }
    }

    // Fallback to calculated prices based on global gold price
    return fetchFallbackPrices();
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    return fetchFallbackPrices();
  }
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
    // Try to fetch global gold price in USD
    const response = await fetch('https://api.gold-api.com/price/XAU', {
      next: { revalidate: 3600 },
    });

    let globalPriceUsd = 2800; // Default fallback
    
    if (response.ok) {
      const data = await response.json();
      globalPriceUsd = data.price || 2800;
    }

    // Fetch USD/EGP exchange rate
    const usdEgpRate = await fetchUsdEgpRate();
    
    // Calculate EGP prices
    const globalPriceEgp = globalPriceUsd * usdEgpRate;
    const pricePerGram24k = globalPriceEgp / 31.1035; // Convert ounce to gram

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
    // Try to get exchange rate from an API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.rates.EGP || 50.85;
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
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
