import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData, getLatestPredictions, setLatestPredictions } from '@/lib/db';
import { KaratType, PredictionData, PredictionPoint } from '@/types';

// Simple prediction algorithm using linear regression and moving average
function generatePredictions(historicalData: { date: string; price: number }[], days: number): PredictionPoint[] {
  if (historicalData.length < 30) {
    // Not enough data, return simple trend-based predictions
    const lastPrice = historicalData[historicalData.length - 1]?.price || 7400;
    const predictions: PredictionPoint[] = [];
    
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      // Add small random variation
      const variation = (Math.random() - 0.48) * 50; // Slightly upward bias
      const confidence = Math.max(0.5, 0.95 - (i * 0.02)); // Confidence decreases with time
      
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        timestamp: futureDate.getTime(),
        price: Math.round(lastPrice + variation),
        confidence: Math.round(confidence * 100) / 100,
        lowerBound: Math.round(lastPrice + variation - (50 * (1 - confidence))),
        upperBound: Math.round(lastPrice + variation + (50 * (1 - confidence))),
      });
    }
    
    return predictions;
  }
  
  // Calculate linear regression
  const prices = historicalData.map(d => d.price);
  const n = prices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = prices.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * prices[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate moving average trend
  const recentPrices = prices.slice(-30);
  const ma7 = recentPrices.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const ma30 = recentPrices.reduce((a, b) => a + b, 0) / 30;
  const trend = ma7 > ma30 ? 'upward' : ma7 < ma30 ? 'downward' : 'sideways';
  
  // Generate predictions
  const predictions: PredictionPoint[] = [];
  const lastIndex = n - 1;
  const lastPrice = prices[lastIndex];
  
  for (let i = 1; i <= days; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    
    // Linear regression prediction
    const lrPrediction = slope * (lastIndex + i) + intercept;
    
    // Add seasonal adjustment (simple sine wave for market cycles)
    const seasonalFactor = Math.sin((lastIndex + i) / 30) * 50;
    
    // Combine predictions with weights
    const predictedPrice = Math.round(lrPrediction + seasonalFactor);
    
    // Calculate confidence (decreases with time)
    const confidence = Math.max(0.5, 0.92 - (i * 0.015));
    
    // Calculate bounds based on historical volatility
    const recentVolatility = calculateVolatility(prices.slice(-30));
    const margin = recentVolatility * (1 + i * 0.1);
    
    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      timestamp: futureDate.getTime(),
      price: predictedPrice,
      confidence: Math.round(confidence * 100) / 100,
      lowerBound: Math.round(predictedPrice - margin),
      upperBound: Math.round(predictedPrice + margin),
    });
  }
  
  return predictions;
}

function calculateVolatility(prices: number[]): number {
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squaredDiffs = prices.map(x => Math.pow(x - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
  return Math.sqrt(variance);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const karatParam = searchParams.get('karat') || '24k';
    const daysParam = searchParams.get('days') || '7';
    
    // Validate karat
    const validKarats: KaratType[] = ['24k', '22k', '21k', '18k'];
    if (!validKarats.includes(karatParam as KaratType)) {
      return NextResponse.json(
        { error: 'Invalid karat. Must be one of: 24k, 22k, 21k, 18k' },
        { status: 400 }
      );
    }
    
    const karat = karatParam as KaratType;
    const days = Math.min(parseInt(daysParam, 10), 30); // Max 30 days
    
    if (isNaN(days) || days < 1) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be at least 1' },
        { status: 400 }
      );
    }
    
    // Check if we have cached predictions
    let predictions = await getLatestPredictions(karat);
    
    // Generate new predictions if none exist or if they're old (older than 1 day)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    if (!predictions || new Date(predictions.lastTrained).getTime() < oneDayAgo) {
      // Get historical data for prediction
      const historicalData = await getHistoricalData(karat, 90);
      
      // Generate predictions for 7, 14, and 30 days
      const predictions7 = generatePredictions(historicalData, 7);
      const predictions14 = generatePredictions(historicalData, 14);
      const predictions30 = generatePredictions(historicalData, 30);
      
      // Determine trend
      const lastWeekAvg = historicalData.slice(-7).reduce((a, b) => a + b.price, 0) / 7;
      const prevWeekAvg = historicalData.slice(-14, -7).reduce((a, b) => a + b.price, 0) / 7;
      
      let trend: 'upward' | 'downward' | 'sideways' = 'sideways';
      if (lastWeekAvg > prevWeekAvg * 1.02) trend = 'upward';
      else if (lastWeekAvg < prevWeekAvg * 0.98) trend = 'downward';
      
      // Calculate volatility
      const prices = historicalData.map(d => d.price);
      const volatility = calculateVolatility(prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const volatilityPercent = (volatility / avgPrice) * 100;
      
      let volatilityLabel: 'low' | 'medium' | 'high' = 'low';
      if (volatilityPercent > 3) volatilityLabel = 'medium';
      if (volatilityPercent > 5) volatilityLabel = 'high';
      
      predictions = {
        modelVersion: 'v1.0-linear-regression',
        lastTrained: new Date().toISOString(),
        accuracy: 88.5, // Placeholder accuracy
        predictions: days <= 7 ? predictions7 : days <= 14 ? predictions14 : predictions30,
        trend,
        volatility: volatilityLabel,
        karat,
      };
      
      // Cache predictions
      await setLatestPredictions(karat, predictions);
    } else {
      // Filter predictions based on requested days
      predictions.predictions = predictions.predictions.slice(0, days);
    }
    
    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error in predict API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Revalidate every hour
export const revalidate = 3600;
