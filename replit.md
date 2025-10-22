# KOL Market - Prediction Market Betting Platform

## Overview
A modern prediction market betting platform focused on Key Opinion Leader (KOL) performance metrics. Users can trade on outcomes related to KOL follower growth, engagement rates, and influence metrics with real-time pricing powered by bonding curves.

## Current State
**Status**: MVP Complete
**Version**: 1.0.0
**Last Updated**: October 22, 2025

## Recent Changes
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
- **Storage**: In-memory storage (MemStorage)
- **Real-time**: WebSocket server for broadcasting market updates
- **API Endpoints**:
  - `GET /api/user` - Get current user data
  - `GET /api/markets` - Get all markets with KOL data
  - `GET /api/markets/:id` - Get specific market
  - `GET /api/kols` - Get all KOLs
  - `GET /api/bets/recent` - Get recent bets for live feed
  - `POST /api/bets` - Place a new bet
  - `GET /api/leaderboard` - Get trader rankings

### Data Models
- **User**: ID, username, balance, betting stats
- **KOL**: ID, name, handle, avatar, followers, engagement rate, tier
- **Market**: ID, KOL reference, title, price, supply, volume, status
- **Bet**: ID, user reference, market reference, type, amount, shares, status

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

### 6. Real-time Updates
- WebSocket connection for live market data
- Automatic reconnection with exponential backoff
- Price updates every 5 seconds
- Instant bet notification broadcasting

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
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities (queryClient, etc.)
├── server/
│   ├── routes.ts           # API routes and WebSocket
│   ├── storage.ts          # Data storage layer
│   └── vite.ts             # Vite server integration
├── shared/
│   └── schema.ts           # Shared TypeScript types
└── design_guidelines.md    # UI/UX design specifications
```

## User Preferences
- **Theme**: Dark mode only (crypto/trading standard)
- **Color Scheme**: Purple primary with green/red for success/danger
- **Data Display**: Clear, bold numbers with tabular formatting
- **Interactions**: Smooth hover effects, minimal animations

## Future Enhancements (Phase 2)
- Real KolScan API integration
- Crypto wallet integration (MetaMask, WalletConnect)
- Advanced odds calculation using historical data
- Bet history and portfolio tracking
- Social features (comments, sharing, following)
- Market creation by users
- Automated bet settlement based on real KOL metrics
- Mobile-optimized UI
- Database persistence (PostgreSQL)

## Known Limitations (MVP)
- Single default user (no authentication)
- Mock KolScan data (not real API)
- Manual bet settlement (no automation)
- In-memory storage (data resets on restart)
- Simple bonding curve (linear formula)
- No transaction history
- No withdrawal functionality

## Testing
- Manual testing of all user flows
- WebSocket connection resilience
- Responsive design across breakpoints
- Betting validation and balance checks
