# Wyckoff + VPA Trading Dashboard

**Last Updated:** 2026-01-28

A beautiful, modern trading dashboard for the pure VPA + Wyckoff trading system with multi-timeframe analysis and confidence scoring.

![Dashboard Preview](docs/dashboard-preview.png)

## Features

- 📊 **Live Dashboard** - Real-time market analysis
- 🎯 **Confidence Scoring** - Instant probability assessment (0-100%)
- 📈 **Trade History** - All trades with entry/exit/reasoning
- ⚙️ **GUI Settings** - No config files - enter API keys in browser
- 🔒 **Local Storage** - Keys stored in your browser only
- 📱 **Responsive** - Works on desktop and mobile
- 🔗 **Telegram Integration** - Trade alerts on your phone
- 📊 **Multi-Timeframe** - D1 → H4 → H1 alignment checks

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **CSS** - Custom dark theme
- **Local Storage** - Secure client-side config
- **OANDA API** - Forex data
- **Cloudflare Pages** - Free hosting

## Quick Start

### 1. Install

```bash
cd trading-dashboard
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 3. Configure

Click **⚙️ Settings** in the header and enter:

- **OANDA API Key** - From oanda.com/account/security
- **Account ID** - Your OANDA account number
- **Telegram Bot Token** - From @BotFather
- **Telegram Chat ID** - From @userinfobot

Keys are stored **locally in your browser** - never sent to any server.

## Dashboard Sections

### Header
- Account balance
- Win rate percentage
- Total P&L
- ⚙️ Settings link

### Confidence Score
```
┌─────────────────────────────────────────────────┐
│  CONFIDENCE SCORE                               │
│  ████████░░ 85%                                │
│  🔥 HIGH PROBABILITY                           │
└─────────────────────────────────────────────────┘
```

### Signal Display
- Direction (BUY/SELL)
- Entry, Stop Loss, Take Profit
- Confidence bar with rating
- Wyckoff phase
- Entry trigger event

### Trade History
- All trades with timestamps
- Win/loss tracking
- P&L per trade
- Reasoning for each trade

## Multi-Timeframe Analysis

```
D1 (Higher) → H4 (Medium) → H1 (Lower)
    │              │             │
    │  Direction   │  Context    │  Entry
    │              │             │
    └──────────────┴─────────────┘
                   │
              TRADE ONLY WHEN
            ALL TIMEFRAMES ALIGN
```

## Confidence Breakdown

| Factor | Weight | Description |
|--------|--------|-------------|
| HT Phase Strength | 30% | How clear is the Wyckoff phase? |
| MT Confirmation | 20% | Does medium TF confirm? |
| LT Entry Quality | 25% | Is the entry trigger clean? |
| Volume Health | 15% | Is volume confirming? |
| TF Alignment | 10% | Are all TFs aligned? |

## Deploy to Cloudflare Pages (Free!)

### 1. Push to GitHub

```bash
cd trading-dashboard
chmod +x setup-github.sh
./setup-github.sh
```

Or manually:
1. Create repo at https://github.com/new
2. `git add . && git commit -m "Initial commit"`
3. `git push origin main`

### 2. Connect Cloudflare

1. Go to https://pages.cloudflare.com
2. Click "Connect to Git"
3. Select your `trading-dashboard` repo
4. Settings:
   - **Framework**: Next.js
   - **Build command**: `npm run build`
   - **Build output**: `.next`

### 3. Add Environment Variables

In Cloudflare dashboard → Settings → Environment variables:

```
OANDA_API_KEY=your-api-key
OANDA_ACCOUNT_ID=your-account-id
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 4. Done! 🎉

Your dashboard is live at:
```
https://trading-dashboard.pages.dev
```

## Telegram Alerts (Semi-Auto Mode)

1. Create a bot with @BotFather
2. Get your Chat ID from @userinfobot
3. Enter credentials in Settings page
4. You'll receive signals like:

```
╔══════════════════════════════════════════╗
║          🔥 NEW TRADE SIGNAL             ║
╚══════════════════════════════════════════╝

🟢 BUY ⬆️ | EUR/USD

┌─────────────────────────────────────────────────┐
│  CONFIDENCE SCORE                               │
│  ████████░░ 85%                                │
│  🔥 HIGH PROBABILITY                           │
└─────────────────────────────────────────────────┘
```

Reply with `/approve TRADE-0001` to execute!

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Cloudflare Pages                                   │
│  ├── Dashboard (Next.js)                           │
│  └── Settings (API keys in localStorage)           │
└────────────────────┬────────────────────────────────�↓
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────┐
│  Your Browser                                       │
│  └── Local Storage (encrypted keys)                 │
└────────────────────┬────────────────────────────────�↓
                     │ API calls
                     ▼
┌─────────────────────────────────────────────────────┐
│  OANDA API                                          │
│  └── Real-time forex data                           │
└─────────────────────────────────────────────────────┘
```

## Philosophy

This dashboard is designed for **pure VPA + Wyckoff trading**:

- **No lagging indicators** - Moving averages, RSI, MACD are NOT used
- **Price action** - OHLC patterns only
- **Volume analysis** - Volume spread, climaxes, absorption
- **Wyckoff phases** - Accumulation, Markup, Distribution, Markdown
- **Wyckoff events** - Springs, Tests, Upthrusts, Climaxes

## File Structure

```
trading-dashboard/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx        # Main dashboard page
├── public/              # Static assets
├── package.json
└── README.md
```

## Screenshots

### Main Dashboard
```
┌─────────────────────────────────────────┐
│  Wyckoff + VPA Trading System           │
├─────────────────────────────────────────┤
│  Account: $10,250  │  Win Rate: 67%   │
├─────────────────────────────────────────┤
│  Current Signal                          │
│  ↑ BUY  •  85%  •  1.0875            │
│  Stop: 1.0830  •  Target: 1.0975      │
│  Phase: Accumulation                   │
└─────────────────────────────────────────┘
```

### Trade History
```
Recent Trades:
EUR/USD  ↑ BUY   +$700  Spring detected
GBP/USD  ↓ SELL  +$400  Upthrust in distribution
USD/JPY  ↑ BUY   -$160  Stopped out
```

## Safety First

⚠️ **Always use paper trading first!**

1. ✅ Test with virtual money
2. ✅ Document all trades
3. ✅ Refine strategy over weeks/months
4. ✅ Only go live with small capital
5. ✅ Never risk money you can't afford to lose

## License

MIT License
