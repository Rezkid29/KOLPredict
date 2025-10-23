# KOL Market - Prediction Market Betting Platform

## Overview
KOL Market is a modern prediction market betting platform where users can trade on outcomes related to Key Opinion Leader (KOL) performance metrics. The platform focuses on metrics like follower growth, engagement rates, and influence, with real-time pricing powered by bonding curves. The business vision is to tap into the growing influence economy by allowing users to speculate on KOL success, offering a unique blend of financial trading and social media analytics. The project aims to become a leading platform for predicting and profiting from the dynamic world of online influence.

## User Preferences
- **Theme**: Dark mode only (crypto/trading standard)
- **Color Scheme**: Purple primary with green/red for success/danger
- **Data Display**: Clear, bold numbers with tabular formatting
- **Interactions**: Smooth hover effects, minimal animations

## System Architecture

### Core Design Principles
The platform is built with a focus on real-time data, automated market dynamics, and a robust, scalable architecture. Key decisions include WebSocket for live updates, bonding curves for automated market making, and a scheduled task system for data scraping and market resolution.

### Frontend (React + TypeScript)
- **Framework**: React with Vite and TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with Shadcn UI components
- **Real-time**: WebSocket client
- **Pages**: Home (live market feed, betting), Leaderboard (top traders)

### Backend (Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **Storage**: PostgreSQL via Drizzle ORM (with MemStorage fallback for development)
- **Real-time**: WebSocket server for broadcasting market and bet updates
- **Background Tasks**:
    - **Metrics Updater**: Runs every 30 minutes to fetch and store KOL metrics.
    - **Market Resolver**: Runs every 5 minutes to resolve expired markets, calculate outcomes, and settle bets.
    - **Kolscan Scraper**: Runs daily at 2 AM to scrape kolscan.io.
    - **Market Generator**: Runs daily at 3 AM to create diverse prediction markets.
- **Social API Integration**: Twitter client with intelligent mock data fallback.
- **Web Scraping**: Puppeteer-based kolscan.io scraper.
- **Market Generation System**:
    - Uses `server/market-generator-service.ts` to create 9+ diverse market types (e.g., Profit Streak, Rank Flippening, Follower Growth).
    - Prevents duplicate market types for each KOL.
    - Supports both solo KOL and head-to-head markets.
    - Markets automatically resolve based on scraped kolscan.io data.

### Key Features
- **Live Market Feed**: Real-time price updates and KOL metrics.
- **Betting Interface**: Modal for placing bets with dynamic cost and payout calculations.
- **Live Feed**: Displays recent bets in chronological order, updated via WebSocket.
- **Leaderboard**: Ranks traders by profit, win rate, and stats.
- **Bonding Curve Pricing**: Dynamic pricing using `price = 0.01 + (supply / 10000)`.
- **Real-time Updates & Notifications**: WebSocket-driven price updates, bet notifications, and market resolution toasts.
- **Automated Market Resolution**: Scheduled task to evaluate market outcomes, settle bets, and update user balances.
- **Kolscan.io Integration**: Daily scraping of kolscan.io leaderboard to update KOL data and auto-generate markets.

### Design System
- **Colors**: Deep blue-grey background, vibrant purple primary, mint green for success, coral red for destructive, amber for warning.
- **Typography**: Inter for body/numbers, Space Grotesk for headers/KOL names. Tabular numbers for metrics.
- **Spacing**: Defined small, standard, medium, and large increments.

## External Dependencies
- **PostgreSQL**: Primary database for persistent storage, managed via Drizzle ORM.
- **kolscan.io**: External website scraped daily for KOL performance data.
- **Twitter API**: Used for real-time KOL metrics (e.g., follower counts).
- **Puppeteer**: Node.js library for web scraping kolscan.io.