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
- **Blockchain**: Solana integration with custodial wallet system
    - **Hot Wallet**: Platform-managed wallet for all user deposits/withdrawals
    - **Deposit Monitor**: Runs every 10 seconds, monitors on-chain transactions via WebSocket
    - **Withdrawal Processor**: Runs every 5 seconds, processes pending withdrawals with limits and validation
    - **Network**: Devnet for testing, supports mainnet-beta for production
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
- **Solana Wallet System**: 
    - Custodial hot wallet managing all user deposits and withdrawals
    - Real-time deposit monitoring via Solana WebSocket
    - Automated withdrawal processing with validation and limits
    - Platform fee collection (2-5%) on all bets
    - Transaction history tracking and audit trail

### Design System
- **Colors**: Deep blue-grey background, vibrant purple primary, mint green for success, coral red for destructive, amber for warning.
- **Typography**: Inter for body/numbers, Space Grotesk for headers/KOL names. Tabular numbers for metrics.
- **Spacing**: Defined small, standard, medium, and large increments.

## External Dependencies
- **PostgreSQL**: Primary database for persistent storage, managed via Drizzle ORM.
- **kolscan.io**: External website scraped daily for KOL performance data.
- **Twitter API**: Used for real-time KOL metrics (e.g., follower counts).
- **Puppeteer**: Node.js library for web scraping kolscan.io.
- **Solana**: Blockchain integration for deposits/withdrawals via @solana/web3.js.

## Recent Changes

### October 26, 2025 - Social Features Security Enhancements
Enhanced security and reliability of all social features (messaging, forum, follows) with comprehensive validation and abuse prevention:

**Input Validation (server/validation.ts)**:
- Created comprehensive validation utilities for all social endpoints
- Message validation: 1000 character limit, XSS prevention via sanitization
- Thread title validation: 200 character limit
- Thread content validation: 5000 character limit  
- Comment validation: 2000 character limit
- Category validation: Whitelist-based checking
- `sanitizeInput()` function removes control characters and trims whitespace

**Rate Limiting (server/routes.ts)**:
- Message sending: 10 messages per minute per IP
- Follow/unfollow actions: 20 actions per minute per IP
- Forum posts/comments: 5 posts per minute per IP
- Voting: 30 votes per minute per IP
- All limits configured to balance abuse prevention with legitimate usage

**Security Measures**:
- All social endpoints require authentication via `requireAuth` middleware
- Input sanitization prevents XSS attacks by removing control characters
- Duplicate follow prevention via unique database constraint on (followerId, followingId)
- Proper error handling with consistent error messages for validation failures
- Rate limit headers included in responses for client transparency

**Frontend Improvements**:
- Fixed forum threads query endpoint (malformed URL with query parameters)
- Added null-safe user statistics display in messages page
- Proper loading states and error messages on all social pages
- Error boundaries prevent crashes from validation errors

**Testing (server/tests/social-security.test.ts)**:
- Comprehensive unit tests for all validation functions
- XSS prevention test cases
- Edge case handling (unicode, whitespace, length limits)
- Rate limiting configuration verification

**Architecture Review**:
- Architect review confirmed no blocking security defects
- Validation is comprehensive with proper length constraints
- Rate limits appropriately configured
- Frontend properly guards against null values

### October 24, 2025 - Market System Robustness Improvements
Enhanced prediction market system with data validation, improved settlement logic, and better error handling:

**Data Freshness Validation (server/market-resolver.ts)**:
- Added `validateDataFreshness()` method to auto-cancel markets with stale data
- Kolscan data validation: Markets cancelled if KOL scraped data is older than 2 hours
- Follower cache validation: Follower growth markets cancelled if cache is older than 24 hours
- Automatic refund processing for cancelled markets with stale data
- Prevents settlement on outdated information

**Enhanced Market Refund System (server/db-storage.ts)**:
- Improved `refundMarket()` with row-level locking for concurrency safety
- Added validation for bet amounts and user existence
- Prevents negative balance scenarios with proper error handling
- Tracks refund success and failure counts for monitoring
- Better error messages for debugging

**Fixed Leaderboard Ranking (server/db-storage.ts)**:
- Users with identical `totalProfit` now share the same rank
- Secondary sorting by `totalWins` and `totalBets` for deterministic ordering
- Tiebreakers used only for display order, not rank assignment
- Example: Two users with $100 profit both get rank #1, next user gets rank #3

**Bet Settlement Verification**:
- Confirmed shares-based payout logic is correct: `payout = shares × $1.00`
- Atomic transactions with row-level locking prevent race conditions
- Proper profit calculation: `profit = payout - bet_amount`

**Code Cleanup**:
- Removed deprecated `placeBetTransaction` function from storage interfaces
- Fixed `MemStorage.placeBetWithLocking` to support local development and testing
- Simplified implementation maintains feature parity with PostgreSQL version

### October 23, 2025 - Solana Integration - Backend Complete
Added complete Solana blockchain integration for cryptocurrency deposits and withdrawals:

**Database Schema (shared/schema.ts)**:
- Extended `users` table with `solanaAddress` (user's wallet) and `depositAddress` (hot wallet) fields
- Added `solanaDeposits` table: Track deposits with status (pending/confirmed/failed), confirmations, amounts
- Added `solanaWithdrawals` table: Track withdrawal requests with processing status and signatures
- Added `platformFees` table: Track all platform fees collected from bets

**Core Services (server/)**:
- `solana-wallet.ts`: Hot wallet management, SOL transfers, balance checking
- `solana-deposit-monitor.ts`: WebSocket-based deposit monitoring (runs every 10 seconds)
- `solana-withdrawal-processor.ts`: Queue-based withdrawal processing (runs every 5 seconds)
- `db-storage.ts`: Added 13 new methods for Solana operations (deposits, withdrawals, fees)

**API Endpoints (server/routes.ts)**:
- `GET /api/solana/deposit-address`: Generate unique deposit address per user
- `POST /api/solana/withdraw`: Request withdrawal (validates balance and limits)
- `GET /api/solana/deposits`: View user's deposit history
- `GET /api/solana/withdrawals`: View user's withdrawal history
- `GET /api/solana/balance`: Check hot wallet balance
- `GET /api/solana/platform-fees`: View total platform fees collected

**Configuration**:
- Environment variable `SOLANA_HOT_WALLET_PRIVATE_KEY` for production wallet
- Auto-generates temporary hot wallet for testing if not provided
- Uses devnet by default, supports mainnet-beta for production

**Next Steps**:
- Platform fee collection on bet placement (2-5% configurable)
- Frontend wallet dashboard with deposit/withdrawal UI
- Update betting interface to use SOL amounts instead of points
- Add notification system for deposit confirmations