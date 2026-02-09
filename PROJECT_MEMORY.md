# DHAB - Project Memory

## Project Overview
Egyptian Gold Price Prediction Platform with advanced AI (LSTM + Attention) and modern Framer Motion animations.

**Website:** Gold prices tracker for Egypt  
**Goal:** Show current gold prices, historical data, and predict future prices using AI  
**Deployment:** Vercel (free tier)  
**Stack:** Next.js 14, TypeScript, Tailwind CSS, TensorFlow.js, Framer Motion

---

## Requirements

### Functional Requirements
- Real-time gold prices for Egyptian market (24K, 22K, 21K, 18K)
- Historical price data (up to 5 years)
- AI-powered price predictions (7, 14, 30 days ahead)
- Modern, minimal UI design
- Mobile responsive
- Auto-update prices daily via cron job

### Non-Functional Requirements
- Fast loading (< 2 seconds)
- Smooth animations throughout
- High prediction accuracy (92-95% for 7-day forecasts)
- Runs entirely on Vercel free tier

---

## Architecture

### Tech Stack
| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Base components |
| Animations | Framer Motion | All animations |
| Charts | Recharts | Data visualization |
| ML | TensorFlow.js | LSTM predictions |
| Database | Vercel KV (Redis) | Time series data |
| Storage | Vercel Blob | Model artifacts |
| Cron | Vercel Cron Jobs | Daily data fetch |
| API | GoldAPI.io | Gold price data |

### Project Structure
```
dhab/
├── app/
│   ├── page.tsx                    # Main dashboard
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── api/
│   │   ├── gold/current/route.ts   # Current prices
│   │   ├── history/route.ts        # Historical data
│   │   ├── predict/route.ts        # AI predictions
│   │   ├── train/route.ts          # Retrain model
│   │   └── cron/fetch-gold/route.ts # Cron job
│   └── (routes)/
├── components/
│   ├── ui/                         # Reusable UI
│   ├── layout/                     # Header, footer
│   ├── sections/                   # Page sections
│   └── animations/                 # Framer Motion
├── lib/
│   ├── gold-api.ts                 # GoldAPI integration
│   ├── db.ts                       # Database helpers
│   └── ml/                         # ML model code
├── hooks/                          # Custom hooks
├── types/                          # TypeScript types
├── public/model/                   # Model artifacts
└── scripts/                        # Training scripts
```

---

## Database Schema (Vercel KV)

```
Keys:
- gold:current              # Latest prices (JSON)
- gold:history:24k          # Sorted set: timestamp -> price
- gold:history:22k
- gold:history:21k
- gold:history:18k
- predictions:latest        # Latest predictions
- predictions:history       # Past predictions
- model:metadata            # Training info, accuracy
```

### Data Format
```json
{
  "gold:current": {
    "timestamp": 1738233600,
    "date": "2025-01-30",
    "prices": {
      "24k": { "gram": 7408, "ounce": 230200 },
      "22k": { "gram": 6829, "ounce": 212400 },
      "21k": { "gram": 6482, "ounce": 201600 },
      "18k": { "gram": 5556, "ounce": 172800 }
    },
    "usd_egp_rate": 50.85,
    "global_ounce_usd": 2800
  }
}
```

---

## ML Model Architecture

### Model Type: LSTM with Attention
- **Framework:** TensorFlow.js
- **Architecture:**
  - Input: 60-day window of prices + features
  - LSTM Layer 1: 128 units, return sequences
  - Dropout: 0.2
  - LSTM Layer 2: 64 units, return sequences
  - Attention Layer: 32 units
  - LSTM Layer 3: 32 units
  - Output: Dense layer with 30 units (30-day prediction)

- **Optimizer:** Adam
- **Loss:** Mean Squared Error
- **Epochs:** 500
- **Features:**
  - Gold price (normalized)
  - USD/EGP exchange rate
  - Price volatility (rolling std)
  - Moving averages (7, 14, 30 day)

### Training Strategy
- Initial: Train locally with 5 years historical data
- Retraining: Weekly via Vercel Cron (Sunday 2 AM)
- Incremental: Add new data without full retrain
- Storage: Model artifacts in Vercel Blob

### Expected Accuracy
- 7-day: 92-95%
- 14-day: 88-92%
- 30-day: 82-88%

---

## API Endpoints

### GET /api/gold/current
Returns current gold prices
```json
{
  "timestamp": 1738233600,
  "prices": {
    "24k": { "gram": 7408, "change": 1.2, "changePercent": 0.16 },
    "22k": { "gram": 6829, "change": 1.1, "changePercent": 0.16 },
    "21k": { "gram": 6482, "change": 1.0, "changePercent": 0.15 },
    "18k": { "gram": 5556, "change": 0.9, "changePercent": 0.16 }
  }
}
```

### GET /api/history?karat=24k&days=90
Returns historical data
```json
{
  "karat": "24k",
  "data": [
    { "date": "2024-11-01", "price": 7100 },
    { "date": "2024-11-02", "price": 7125 }
  ]
}
```

### GET /api/predict?days=7
Returns AI predictions
```json
{
  "model_version": "lstm-v2.1",
  "last_trained": "2025-01-26T02:00:00Z",
  "accuracy": 94.5,
  "predictions": [
    { "date": "2025-01-31", "price": 7420, "confidence": 0.92 }
  ],
  "trend": "upward",
  "volatility": "low"
}
```

### GET /api/cron/fetch-gold
Cron job - runs daily at 6 AM Cairo time

---

## UI Design System

### Colors
- Background: #0A0A0F (Deep black)
- Primary: #FFD700 (Gold)
- Secondary: #C0C0C0 (Silver)
- Accent: #00D4FF (Digital blue)
- Success: #00E676
- Danger: #FF5252
- Text Primary: #FFFFFF
- Text Secondary: #A1A1AA

### Typography
- Headings: Inter (Bold)
- Body: Inter (Regular)
- Numbers: JetBrains Mono

### Spacing
- Base: 4px grid
- Border Radius: 12px (cards), 8px (buttons)
- Shadows: Gold glow for primary elements

### Framer Motion Animations

#### Page Load
- Stagger children: 0.1s delay
- Fade in from opacity 0 to 1
- Slide up from y: 20 to y: 0

#### Price Cards
- Hover: Scale 1.02 + gold glow
- Number counting animation on load
- Sparkline draw animation

#### Charts
- Path drawing animation
- Data points pop-in with stagger
- Crosshair follows cursor with spring physics

#### Prediction Cards
- Reveal: Staggered slide-up
- Confidence: Animated progress bars
- Trend arrows: Pulse animation

#### Scroll Effects
- Sections fade in on scroll
- Parallax effect on hero
- Stats counters animate in view

---

## Key Components

### Hero Section
- Large animated gold price display
- Live ticker with price changes
- Quick stats (24h high/low)

### Price Cards Grid
- 4 cards: 24K, 22K, 21K, 18K
- Current price (animated number)
- Change indicator (arrow + %)
- Mini sparkline chart
- Hover: Expand details

### Main Chart
- Time range: 7D | 30D | 90D | 1Y | 5Y
- Multi-karat overlay
- Predictions overlay (dashed line)
- Interactive tooltips

### AI Predictions Section
- 7-day forecast cards
- Confidence score visualization
- Model accuracy metrics
- Last training timestamp

### Statistics Section
- Price change over periods
- Volatility index
- Best/Worst performing karat
- Animated counters

---

## Vercel Configuration

### Cron Job (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-gold",
      "schedule": "0 4 * * *"
    }
  ]
}
```
Runs at 4 AM UTC = 6 AM Cairo time

### Environment Variables
```
GOLDAPI_KEY=your_api_key
KV_URL=vercel_kv_url
KV_REST_API_TOKEN=token
KV_REST_API_READ_ONLY_TOKEN=token
BLOB_READ_WRITE_TOKEN=vercel_blob_token
```

---

## Cost Breakdown (Free Tier)

| Service | Free Limit | Usage |
|---------|-----------|-------|
| Vercel Hosting | Unlimited | ✅ |
| Serverless Functions | 125k/month | ~3k/month |
| Cron Jobs | 1/day | ✅ |
| KV Storage | 256 MB | ~50 MB |
| Blob Storage | 250 MB | ~20 MB |
| GoldAPI.io | 100 req/month | ~30/month |

**Total: $0/month**

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Initialize Next.js 14 project
- [ ] Configure Tailwind + shadcn/ui
- [ ] Set up Vercel KV
- [ ] Create project structure
- [ ] Set up GoldAPI integration
- [ ] Implement cron job

### Phase 2: Core Features
- [ ] Build API endpoints
- [ ] Create database helpers
- [ ] Implement price display components
- [ ] Add historical data viz
- [ ] Build dashboard layout

### Phase 3: ML Model
- [ ] Implement TensorFlow.js LSTM
- [ ] Data preprocessing pipeline
- [ ] Training script
- [ ] Prediction endpoint
- [ ] Model storage/loading

### Phase 4: Framer Motion UI
- [ ] Page load animations
- [ ] Animated price cards
- [ ] Chart animations
- [ ] Prediction section animations
- [ ] Scroll-triggered effects

### Phase 5: Polish & Deploy
- [ ] Responsive testing
- [ ] Performance optimization
- [ ] Error handling
- [ ] SEO
- [ ] Deploy

---

## Data Sources

### GoldAPI.io
- Free tier: 100 requests/month
- Supports EGP currency
- 24K, 22K, 21K, 18K prices
- Historical data since 1968

### Alternative Sources
- todaygoldprices.net (scraping fallback)
- goldpriceme.com
- egcurrency.com

---

## Important Notes

1. **Model Training**: Must train locally first due to Vercel function timeout limits (60s hobby, 300s pro)

2. **Pre-trained Model**: Save trained model to Vercel Blob, load in production

3. **Incremental Learning**: Add new daily data to model without full retrain

4. **Fallback Strategy**: If GoldAPI fails, use calculated prices based on global ounce price

5. **Accuracy Tracking**: Store predictions, compare with actuals, display accuracy metrics

6. **Rate Limiting**: GoldAPI free tier = 100 req/month, use caching aggressively

7. **CORS**: Configure for client-side TensorFlow.js model loading

8. **Error Handling**: Graceful fallbacks for all external APIs

9. **Performance**: Use React.memo for price cards, lazy load charts

10. **SEO**: Add meta tags, Open Graph, structured data for gold prices

---

## Current Prices Reference (Egypt)

Based on research (Jan 30, 2026):
- **24K**: ~7,408 EGP/gram | ~231,877 EGP/ounce
- **22K**: ~6,829 EGP/gram
- **21K**: ~6,482 EGP/gram (most popular in Egypt)
- **18K**: ~5,556 EGP/gram

---

## Next Steps

1. Initialize project
2. Create memory file (this document)
3. Set up database
4. Build core features
5. Implement ML model
6. Add animations
7. Deploy

---

**Last Updated:** Build Mode Activated  
**Status:** Ready for Implementation
