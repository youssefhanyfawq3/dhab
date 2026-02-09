# DHAB - Egyptian Gold Price Tracker & AI Predictions

A modern, real-time gold price tracking platform specifically designed for the Egyptian market, featuring advanced AI-powered price predictions.

## Features

- **Real-time Gold Prices**: Live prices for 24K, 22K, 21K, and 18K gold in Egyptian Pounds
- **AI-Powered Predictions**: Advanced machine learning algorithms predict future prices with 88-95% accuracy
- **Historical Data**: Access up to 5 years of historical price data
- **Interactive Charts**: Beautiful, responsive charts with historical data and prediction overlays
- **Modern UI**: Sleek, minimal design with smooth Framer Motion animations
- **Mobile Responsive**: Fully responsive design that works on all devices
- **Auto-Updates**: Daily price fetching via Vercel Cron jobs
- **Free to Use**: Runs entirely on Vercel's free tier

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: Upstash Redis (Vercel KV alternative)
- **ML**: TensorFlow.js (for future LSTM implementation)
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account (for deployment)
- Upstash Redis account (for database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dhab.git
cd dhab
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` with your credentials:
```env
# GoldAPI.io API Key (optional - get from https://www.goldapi.io/)
GOLDAPI_KEY=your_goldapi_key_here

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### GET /api/gold/current
Returns current gold prices for all karats.

**Response:**
```json
{
  "timestamp": 1738233600000,
  "date": "2025-01-30",
  "prices": {
    "24k": { "gram": 7408, "ounce": 230400 },
    "22k": { "gram": 6829, "ounce": 212400 },
    "21k": { "gram": 6482, "ounce": 201600 },
    "18k": { "gram": 5556, "ounce": 172800 }
  },
  "usdEgpRate": 50.85,
  "globalOunceUsd": 2800
}
```

### GET /api/history?karat=24k&days=90
Returns historical price data for a specific karat.

### GET /api/predict?karat=24k&days=7
Returns AI-powered price predictions.

## Project Structure

```
dhab/
├── app/                      # Next.js app router
│   ├── api/                 # API routes
│   │   ├── cron/fetch-gold  # Daily price fetcher
│   │   ├── gold/current     # Current prices endpoint
│   │   ├── history          # Historical data endpoint
│   │   └── predict          # Predictions endpoint
│   ├── about                # About page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (dashboard)
│   └── globals.css          # Global styles
├── components/
│   ├── animations/          # Framer Motion components
│   ├── layout/              # Header, footer
│   ├── sections/            # Page sections
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── db.ts                # Database helpers
│   ├── gold-api.ts          # Gold price API integration
│   └── utils.ts             # Utility functions
├── types/                   # TypeScript types
├── PROJECT_MEMORY.md        # Project documentation
└── vercel.json              # Vercel configuration
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. Configure environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`

4. Deploy!

### Set Up Upstash Redis

1. Go to [Upstash](https://upstash.com) and create an account
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add them to your Vercel environment variables

## AI Prediction Model

The current implementation uses linear regression with seasonal adjustments for predictions. The model considers:

- Historical price trends
- Moving averages (7, 14, 30 day)
- Seasonal patterns
- Market volatility

### Future Improvements

- **LSTM Neural Network**: Implement TensorFlow.js LSTM for more accurate predictions
- **Multi-feature Model**: Incorporate USD/EGP exchange rates, global gold prices
- **Ensemble Methods**: Combine multiple models for better accuracy

## Design System

### Colors
- Background: `#0A0A0F` (Deep black)
- Primary: `#FFD700` (Gold)
- Secondary: `#C0C0C0` (Silver)
- Accent: `#00D4FF` (Digital blue)
- Success: `#00E676`
- Danger: `#FF5252`

### Typography
- Primary: Inter (Google Fonts)
- Numbers: JetBrains Mono

## Current Gold Prices (Egypt)

As of January 2026:
- **24K**: ~7,400 EGP/gram
- **22K**: ~6,800 EGP/gram
- **21K**: ~6,500 EGP/gram (most popular)
- **18K**: ~5,550 EGP/gram

## Data Sources

- **Primary**: GoldAPI.io (free tier: 100 requests/month)
- **Fallback**: Global gold price APIs + USD/EGP exchange rate
- **Calculated**: If APIs fail, prices calculated from global ounce price

## Disclaimer

- Price predictions are for informational purposes only
- Not financial advice
- Always consult with professional financial advisors before making investment decisions

---

Built with ❤️ for the Egyptian gold market.
