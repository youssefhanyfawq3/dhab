import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/db';
import { KaratType, TIME_RANGES } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const karatParam = searchParams.get('karat') || '24k';
    const daysParam = searchParams.get('days') || '90';

    // Validate karat
    const validKarats: KaratType[] = ['24k', '22k', '21k', '18k'];
    if (!validKarats.includes(karatParam as KaratType)) {
      return NextResponse.json(
        { error: 'Invalid karat. Must be one of: 24k, 22k, 21k, 18k' },
        { status: 400 }
      );
    }

    const karat = karatParam as KaratType;
    const days = parseInt(daysParam, 10);

    if (isNaN(days) || days < 1 || days > 1825) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be between 1 and 1825' },
        { status: 400 }
      );
    }

    const data = await getHistoricalData(karat, days);

    return NextResponse.json({
      karat,
      days,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Error in history API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Force dynamic rendering as we use searchParams
export const dynamic = 'force-dynamic';
export const revalidate = 300;
