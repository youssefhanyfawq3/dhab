import { NextResponse } from 'next/server';
import { fetchCurrentGoldPrice, calculatePriceChange } from '@/lib/gold-api';
import { getCurrentPrices, setCurrentPrices, getLastHistoricalPrice } from '@/lib/db';
import { CurrentGoldData, KARAT_TYPES } from '@/types';

export async function GET() {
  try {
    // Try to get cached data first
    let data = await getCurrentPrices();

    // If no cached data or data is older than 1 hour, fetch fresh data
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    if (!data || data.timestamp < oneHourAgo) {
      // Fetch from API
      const freshData = await fetchCurrentGoldPrice();

      if (freshData) {
        // Calculate changes if we have previous data (yesterday's close)
        const changes: Record<string, { change: number; changePercent: number }> = {};

        await Promise.all(KARAT_TYPES.map(async (karat) => {
          const k = karat;
          const current = freshData.prices[k].gram;

          // Get last historical price for this karat
          const lastHistory = await getLastHistoricalPrice(k);
          const previous = lastHistory?.price || current;

          changes[k] = calculatePriceChange(current, previous);
        }));

        // Apply changes
        KARAT_TYPES.forEach((karat) => {
          const k = karat;
          if (changes[k]) {
            freshData.prices[k].change = changes[k].change;
            freshData.prices[k].changePercent = changes[k].changePercent;
          }
        });

        // Save to database
        await setCurrentPrices(freshData);
        data = freshData;
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to fetch gold prices' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in gold current API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Revalidate every hour
export const revalidate = 3600;
