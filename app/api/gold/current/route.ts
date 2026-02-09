import { NextResponse } from 'next/server';
import { fetchCurrentGoldPrice, calculatePriceChange } from '@/lib/gold-api';
import { getCurrentPrices, setCurrentPrices } from '@/lib/db';
import { CurrentGoldData } from '@/types';

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
        // Calculate changes if we have previous data
        if (data) {
          Object.keys(freshData.prices).forEach((karat) => {
            const k = karat as keyof typeof freshData.prices;
            const current = freshData.prices[k].gram;
            const previous = data!.prices[k]?.gram || current;
            const { change, changePercent } = calculatePriceChange(current, previous);
            
            freshData.prices[k].change = change;
            freshData.prices[k].changePercent = changePercent;
          });
        }
        
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
