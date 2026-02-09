export type KaratType = '24k' | '22k' | '21k' | '18k';

export interface GoldPrice {
  gram: number;
  ounce: number;
  change?: number;
  changePercent?: number;
}

export interface GoldPrices {
  [key: string]: GoldPrice;
  '24k': GoldPrice;
  '22k': GoldPrice;
  '21k': GoldPrice;
  '18k': GoldPrice;
}

export interface CurrentGoldData {
  timestamp: number;
  date: string;
  prices: GoldPrices;
  usdEgpRate: number;
  globalOunceUsd: number;
}

export interface HistoricalDataPoint {
  date: string;
  timestamp: number;
  price: number;
}

export interface HistoricalData {
  karat: KaratType;
  data: HistoricalDataPoint[];
}

export interface PredictionPoint {
  date: string;
  timestamp: number;
  price: number;
  confidence: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface PredictionData {
  modelVersion: string;
  lastTrained: string;
  accuracy: number;
  predictions: PredictionPoint[];
  trend: 'upward' | 'downward' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  karat: KaratType;
}

export interface ModelMetadata {
  version: string;
  lastTrained: string;
  trainingDataPoints: number;
  accuracy: number;
  mae: number;
  epochs: number;
}

export interface GoldAPIResponse {
  timestamp: number;
  metal: string;
  currency: string;
  price: number;
  price_gram_24k: number;
  price_gram_22k: number;
  price_gram_21k: number;
  price_gram_18k: number;
  price_gram_16k: number;
  price_gram_14k: number;
  price_gram_10k: number;
  exchange: string;
  symbol: string;
}

export interface TimeRange {
  label: string;
  days: number;
  value: string;
}

export const TIME_RANGES: TimeRange[] = [
  { label: '7D', days: 7, value: '7d' },
  { label: '30D', days: 30, value: '30d' },
  { label: '90D', days: 90, value: '90d' },
  { label: '1Y', days: 365, value: '1y' },
  { label: '5Y', days: 1825, value: '5y' },
];

export const KARAT_TYPES: KaratType[] = ['24k', '22k', '21k', '18k'];

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}
