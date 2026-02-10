import { NextResponse } from 'next/server';
import { fetchCurrentGoldPrice, calculatePriceChange } from '@/lib/gold-api';
import { getCurrentPrices, setCurrentPrices, addHistoricalPrice } from '@/lib/db';
import { KaratType } from '@/types';

export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch current prices
    const freshData = await fetchCurrentGoldPrice();

    if (!freshData) {
      return NextResponse.json(
        { error: 'Failed to fetch gold prices' },
        { status: 500 }
      );
    }

    // Get previous data to calculate changes
    const previousData = await getCurrentPrices();

    if (previousData) {
      Object.keys(freshData.prices).forEach((karat) => {
        const k = karat as KaratType;
        const current = freshData.prices[k].gram;
        const previous = previousData.prices[k]?.gram || current;
        const { change, changePercent } = calculatePriceChange(current, previous);

        freshData.prices[k].change = change;
        freshData.prices[k].changePercent = changePercent;
      });
    }

    // Save current prices
    await setCurrentPrices(freshData);

    // Add to historical data for each karat
    const karats: KaratType[] = ['24k', '22k', '21k', '18k'];
    for (const karat of karats) {
      await addHistoricalPrice(karat, freshData.timestamp, freshData.prices[karat].gram);
    }

    return NextResponse.json({
      success: true,
      message: 'Gold prices updated successfully',
      timestamp: freshData.timestamp,
      date: freshData.date,
      prices: freshData.prices,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
