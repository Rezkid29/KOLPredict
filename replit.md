# KOL Market - Prediction Market Betting Platform

## Overview
A modern prediction market betting platform focused on Key Opinion Leader (KOL) performance metrics. Users can trade on outcomes related to KOL follower growth, engagement rates, and influence metrics with real-time pricing powered by bonding curves.

## Current State
**Status**: MVP Complete with Kolscan Integration
**Version**: 1.1.0
**Last Updated**: October 23, 2025

## Recent Changes
- **October 23, 2025**: Kolscan.io scraping integration
  - **Web Scraping**: Integrated Puppeteer-based scraper for kolscan.io leaderboard data
  - **Chromium Configuration**: Configured system Chromium for Replit environment with fallback to environment variable
  - **Browser Management**: Implemented browser instance reuse and proper lifecycle management
  - **Daily Automation**: Added scheduled scraping (2 AM daily) and market generation (3 AM daily)
  - **Admin Endpoints**: Added `/api/admin/scrape-kols` for manual scraping trigger
  - **Data Import**: Automated KOL creation/update from scraped leaderboard data (rank, Twitter handle, wins/losses, SOL gains)
  - **Market Generation**: Auto-generate prediction markets for newly discovered KOLs
  - **API Simplification**: Removed Instagram and YouTube API support, keeping Twitter-only integration

- **October 22, 2025**: Enhanced platform with real data integration and automation
  - **Real-time Notifications**: Added toast notifications for bet placements and market resolutions via WebSocket
  - **Social Media API Integration**: Created API client supporting Twitter with intelligent fallback to enhanced mock data
  - **Automatic KOL Metrics Updates**: Implemented scheduled updater that runs every 30 minutes, fetches real data when configured, and stores metrics history
  - **Automated Bet Settlement**: Built complete market resolution system that runs every 5 minutes, resolves expired markets, calculates outcomes, settles bets, and updates user balances
  - **Extended Storage Layer**: Added `updateKol`, `updateMarket`, and `getMarketBets` methods to both in-memory and database storage implementations
  - **Admin Endpoints**: Added manual trigger endpoints for metrics updates and market resolution

- **October 22, 2025**: Initial MVP implementation
  - Created complete schema for Users, KOLs, Markets, and Bets
  - Implemented dark-themed UI with purple/green/red color scheme
  - Built all frontend components (Market cards, Bet modal, Live feed, Leaderboard)
  - Added WebSocket support for real-time market updates
  - Implemented bonding curve pricing mechanism
  - Created mock KolScan data with 6 KOLs and markets

## Project Architecture

### Frontend (React + TypeScript)
- **Framework**: React with Vite, TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with Shadcn UI components
- **Real-time**: WebSocket client for live updates
- **Pages**:
  - `/` - Home page with live market feed and betting interface
  - `/leaderboard` - Top traders ranked by profit

### Backend (Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **Storage**: PostgreSQL via Drizzle ORM (with MemStorage fallback)
- **Real-time**: WebSocket server for broadcasting market updates, bet notifications, and market resolutions
- **Background Tasks**: 
  - Metrics updater (30-minute intervals)
  - Market resolver (5-minute intervals)
  - Kolscan scraper (daily at 2 AM)
  - Market generator (daily at 3 AM)
- **Social API Integration**: Twitter client with mock data fallback
- **Web Scraping**: Puppeteer-based kolscan.io scraper with Chromium
- **API Endpoints**:
  - `GET /api/user` - Get current user data
  - `GET /api/markets` - Get all markets with KOL data
  - `GET /api/markets/:id` - Get specific market
  - `GET /api/markets/:id/history` - Get market price history
  - `GET /api/kols` - Get all KOLs
  - `GET /api/kols/:id/metrics` - Get KOL metrics history
  - `GET /api/bets/recent` - Get recent bets for live feed
  - `POST /api/bets` - Place a new bet
  - `GET /api/leaderboard` - Get trader rankings
  - `POST /api/admin/update-metrics` - Manually trigger KOL metrics update
  - `POST /api/admin/resolve-markets` - Manually trigger market resolution
  - `POST /api/admin/scrape-kols` - Manually trigger kolscan scraping and market generation
  - `GET /api/admin/api-status` - Check social API integration status

### Data Models
- **User**: ID, username, balance, betting stats
- **KOL**: ID, name, handle, avatar, followers, engagement rate, tier, kolscan metadata (rank, wins, losses, SOL gain, USD gain)
- **Market**: ID, KOL reference, title, price, supply, volume, status
- **Bet**: ID, user reference, market reference, type, amount, shares, status
- **ScrapedKOL**: Temporary storage for kolscan data import

## Key Features

### 1. Live Market Feed
- Grid of market cards showing KOL prediction markets
- Real-time price updates via WebSocket
- Buy/Sell buttons for quick trading
- KOL metrics display (followers, engagement rate, trending status)

### 2. Betting Interface
- Modal dialog for placing bets
- Preset amount buttons for quick betting
- Real-time cost calculation
- Potential payout display
- Balance validation

### 3. Live Feed
- Recent bets displayed in chronological order
- Color-coded by bet type (green for buy, red for sell)
- Status badges (pending, won, lost)
- Auto-updates via WebSocket

### 4. Leaderboard
- Top traders ranked by total profit
- Win rate and bet statistics
- Medal icons for top 3 positions
- Responsive table layout

### 5. Bonding Curve Pricing
- Dynamic pricing based on supply
- Formula: `price = 0.01 + (supply / 10000)`
- Automatic price adjustments on trades

### 6. Real-time Updates & Notifications
- WebSocket connection for live market data
- Automatic reconnection with exponential backoff
- Price updates every 5 seconds
- Instant bet notification broadcasting
- Toast notifications for:
  - Successful bet placements
  - Market resolutions (YES/NO outcomes)
  - Bet settlements (won/lost)
- Smart notification filtering (suppress self-bet notifications)

### 7. Social Media Data Integration
- Twitter API client for real-time metrics
- Environment variable configuration for API credentials
- Intelligent fallback to enhanced mock data when API not configured
- Periodic metrics updates (every 30 minutes)
- Historical metrics tracking

### 8. Automated Market Resolution
- Scheduled market resolution every 5 minutes
- Evaluates market outcomes based on current KOL metrics
- Automatic bet settlement (win/loss calculation)
- User balance and statistics updates
- WebSocket broadcast of resolution events
- Manual resolution trigger via admin endpoint

### 9. Kolscan.io Integration
- Automated daily scraping of kolscan.io leaderboard
- Extracts KOL performance data (rank, Twitter handle, wins/losses, SOL/USD gains)
- Creates or updates KOL records in database
- Auto-generates prediction markets for new KOLs
- Browser instance reuse for efficient scraping
- Configurable Chromium path via `CHROMIUM_EXECUTABLE_PATH` environment variable
- Manual scraping trigger via admin endpoint
- Scheduled runs: Scraping at 2 AM, market generation at 3 AM

## Design System

### Colors
- **Background**: Deep blue-grey (220 20% 10%)
- **Primary**: Vibrant purple (270 80% 60%)
- **Success**: Mint green (150 70% 55%)
- **Destructive**: Coral red (0 75% 55%)
- **Warning**: Amber (45 90% 55%)

### Typography
- **Primary**: Inter for body text and numbers
- **Display**: Space Grotesk for headers and KOL names
- **Tabular numbers** for prices and metrics

### Spacing
- Small: 0.5rem (2)
- Standard: 1rem (4)
- Medium: 1.5rem (6)
- Large: 2rem (8)

## Technical Decisions

### Why In-Memory Storage?
For the MVP, in-memory storage provides:
- Fast development iteration
- No database setup complexity
- Easy reset for testing
- Perfect for prototyping

### Why WebSockets?
Real-time updates are critical for betting platforms:
- Instant price updates improve user experience
- Live bet notifications create engagement
- Simulates real market dynamics

### Why Bonding Curve?
Bonding curves provide:
- Automated market making
- Fair price discovery
- Liquidity without central authority
- Predictable price dynamics

## Development Workflow

### Running the Application
```bash
npm run dev
```
This starts both the Express backend and Vite frontend on the same port.

### Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks (including WebSocket)
│   │   └── lib/            # Utilities (queryClient, etc.)
├── server/
│   ├── routes.ts                    # API routes and WebSocket
│   ├── storage.ts                   # In-memory storage implementation
│   ├── db-storage.ts                # PostgreSQL storage implementation
│   ├── social-api-client.ts         # Social media API integration (Twitter only)
│   ├── metrics-updater.ts           # Automated KOL metrics updater
│   ├── market-resolver.ts           # Automated market resolution system
│   ├── kol-scraper.ts               # Puppeteer-based kolscan.io scraper
│   ├── kolscan-scraper-service.ts   # Kolscan import and market generation service
│   ├── scheduler.ts                 # Cron-based task scheduler
│   ├── seed.ts                      # Database seeding with mock data
│   └── vite.ts                      # Vite server integration
├── shared/
│   └── schema.ts           # Shared TypeScript types and Drizzle schemas
└── design_guidelines.md    # UI/UX design specifications
```

## User Preferences
- **Theme**: Dark mode only (crypto/trading standard)
- **Color Scheme**: Purple primary with green/red for success/danger
- **Data Display**: Clear, bold numbers with tabular formatting
- **Interactions**: Smooth hover effects, minimal animations

## Future Enhancements (Phase 2)
- ✅ ~~Real social media API integration~~ (COMPLETED - Twitter support)
- ✅ ~~Automated bet settlement based on real KOL metrics~~ (COMPLETED)
- ✅ ~~Database persistence (PostgreSQL)~~ (COMPLETED - via Drizzle ORM)
- ✅ ~~Kolscan.io data scraping~~ (COMPLETED - Daily automated scraping)
- Authentication and authorization for admin endpoints
- Crypto wallet integration (MetaMask, WalletConnect)
- Advanced odds calculation using historical data
- Enhanced bet history and portfolio tracking
- Social features (comments, sharing, following)
- Market creation by users
- Baseline snapshot storage for follower-gain markets (improved accuracy)
- Extended toast notifications with outcome context
- Mobile-optimized UI
- Multi-platform KOL scraping (expand beyond kolscan.io)

## Known Limitations
- Single default user (no authentication)
- Social APIs require manual configuration via environment variables (Twitter only, Instagram/YouTube removed)
- No authentication on admin endpoints (should be added before production)
- Simple bonding curve (linear formula)
- No withdrawal functionality
- Resolution heuristics may need baseline snapshots for follower-gain markets
- Chromium path hard-coded for Replit (can be overridden via `CHROMIUM_EXECUTABLE_PATH` env var)
- Scraper limited to kolscan.io leaderboard (top 20 KOLs by default)

## Testing
- Manual testing of all user flows
- WebSocket connection resilience
- Responsive design across breakpoints
- Betting validation and balance checks
