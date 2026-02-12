import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting store
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Cache headers - prevent caching of sensitive data
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  
  return response;
}

export function validateKarat(karat: string): boolean {
  const validKarats = ['24k', '22k', '21k', '18k'];
  return validKarats.includes(karat);
}

export function validateDays(days: number, min = 1, max = 1825): boolean {
  return !isNaN(days) && days >= min && days <= max;
}

export function sanitizeError(error: unknown): string {
  // Prevent leaking sensitive information in error messages
  if (error instanceof Error) {
    // Only return generic error messages in production
    return process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : error.message;
  }
  return 'An unexpected error occurred';
}
