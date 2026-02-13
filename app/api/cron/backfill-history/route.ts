import { NextResponse } from 'next/server';
import { fetchHistoricalGoldPrice } from '@/lib/gold-api';
import { addHistoricalPrice } from '@/lib/db';
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

        const { searchParams } = new URL(request.url);
        // Allow specifying start date or just number of days back from today
        const days = parseInt(searchParams.get('days') || '30');
        const offset = parseInt(searchParams.get('offset') || '0'); // Start from X days ago
        const limit = parseInt(searchParams.get('limit') || '5'); // Max requests per run to avoid timeout

        // We will process 'limit' days, starting from 'offset' days ago
        const daysToProcess = Math.min(days, limit);
        const results = [];
        const karats: KaratType[] = ['24k', '22k', '21k', '18k'];

        console.log(`Starting backfill: processing ${daysToProcess} days starting from ${offset} days ago`);

        for (let i = 0; i < daysToProcess; i++) {
            const dayIndex = offset + i;
            const date = new Date();
            date.setDate(date.getDate() - dayIndex);

            // GoldAPI expects format like 20230101 (YYYYMMDD) if searching by date
            // But for /XAU/EGP/{date}, standard is YYYYMMDD
            const dateString = date.toISOString().split('T')[0].replace(/-/g, '');

            console.log(`Fetching data for ${dateString}...`);

            try {
                const data = await fetchHistoricalGoldPrice(dateString);

                if (data) {
                    // Save to Redis
                    for (const karat of karats) {
                        await addHistoricalPrice(karat, data.timestamp, data.prices[karat].gram);
                    }
                    results.push({ date: dateString, status: 'success', price: data.prices['24k'].gram });
                } else {
                    results.push({ date: dateString, status: 'failed', error: 'No data returned' });
                }
            } catch (error) {
                console.error(`Error fetching for ${dateString}:`, error);
                results.push({ date: dateString, status: 'error', error: String(error) });
            }

            // Add a small delay to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });

    } catch (error) {
        console.error('Error in backfill API:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow longer timeout for this route if deployed on Vercel Pro
