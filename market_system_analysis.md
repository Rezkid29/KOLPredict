
# Market System Analysis

## Overview

This document provides an extensive analysis of the market system architecture, detailing the role of every program, service, and component involved in market creation, management, and resolution.

---

## System Architecture

### Core Components

1. **Market Generator Service** (`server/market-generator-service.ts`)
2. **Market Resolver** (`server/market-resolver.ts`)
3. **KolScan Scraper Service** (`server/kolscan-scraper-service.ts`)
4. **KOL Scraper Service** (`server/kol-scraper-service.ts`)
5. **Scheduler** (`server/scheduler.ts`)
6. **Metrics Updater** (`server/metrics-updater.ts`)
7. **Database Storage** (`server/db-storage.ts`)
8. **X API Client** (`server/x-api-client.ts`)
9. **Social Media API Client** (`server/social-api-client.ts`)

---

## 1. Market Generator Service (`market-generator-service.ts`)

### Primary Role
Generates diverse prediction markets based on KOL (Key Opinion Leader) performance data from kolscan.io.

### Key Responsibilities

#### A. Market Type Generation
Generates 12 different market types:

1. **Rank Flippening Markets**
   - Compares two KOLs' leaderboard rankings
   - Example: "Will KOL A rank higher than KOL B on tomorrow's leaderboard?"
   - Uses: Current rank data from scraped KOLs

2. **Profit Streak Markets**
   - Tracks KOL's profitability continuation
   - Example: "Will KOL X have positive USD gain tomorrow?"
   - Uses: USD gain data from kolscan

3. **Follower Growth Markets** (Requires X API)
   - Predicts X/Twitter follower growth
   - Example: "Will KOL X gain 500+ followers by tomorrow?"
   - Uses: Real-time follower counts from X API
   - **Rate Limited**: Preserves API calls for high-value markets

4. **SOL Gain Flippening Markets**
   - Compares SOL gains between two KOLs
   - Example: "Will KOL A have higher SOL gains than KOL B?"
   - Uses: SOL gain metrics from kolscan

5. **USD Gain Flippening Markets**
   - Compares USD gains between two KOLs
   - Example: "Will KOL A have higher USD gains than KOL B?"
   - Uses: USD gain metrics from kolscan

6. **Win Rate Flippening Markets**
   - Compares win rates between two KOLs
   - Example: "Will KOL A have better win rate than KOL B?"
   - Uses: Wins/Losses data from kolscan

7. **Win/Loss Ratio Flippening Markets**
   - Compares win/loss ratios (wins ÷ losses)
   - Example: "Will KOL A have higher W/L ratio than KOL B?"
   - Uses: Calculated ratios from wins/losses data

8. **Top Rank Maintain Markets**
   - Predicts if KOL maintains elite ranking
   - Example: "Will KOL X stay in top 10 tomorrow?"
   - Uses: Current rank for top 10 KOLs only

9. **Streak Continuation Markets**
   - Predicts win rate improvement
   - Example: "Will KOL X improve their win rate by tomorrow?"
   - Uses: Historical and current wins/losses

10. **Rank Improvement Markets**
    - Predicts specific rank advancement
    - Example: "Will KOL X reach rank #5 or better?"
    - Uses: Current rank and calculated target improvements

11. **SOL Gain Threshold Markets**
    - Predicts reaching specific SOL gain milestone
    - Example: "Will KOL X gain +100 SOL or more by tomorrow?"
    - Uses: Current SOL gain and threshold logic
    - **Limited**: Max 30% of total markets to maintain diversity

12. **Win/Loss Ratio Maintain Markets**
    - Predicts maintaining minimum W/L ratio
    - Example: "Will KOL X maintain W/L ratio above 2.0?"
    - Uses: Current ratio and suitable thresholds

#### B. Market Generation Algorithm

**Phase 1: Head-to-Head Guarantee**
- Generates minimum 2 head-to-head markets first
- Ensures competitive comparison markets exist
- Types: Rank/SOL/USD/WinRate/WinLoss Ratio Flippening

**Phase 2: Mixed Strategy**
- Fills remaining slots with mixed solo/head-to-head markets
- Each KOL appears in EXACTLY ONE market per generation cycle
- Prevents duplicate KOL usage within same generation

**Diversity Controls:**
- Max 30% SOL gain threshold markets (prevents saturation)
- Max 33% of any single market type
- Tracks market type distribution for variety
- Shuffles generators to ensure randomness

#### C. KOL Resolution & Database Integration

**KOL ID Resolution:**
```typescript
private async resolveKolId(scrapedKol: ScrapedKol): Promise<string | null>
```
- Checks if KOL exists in database by handle
- Creates new KOL record if missing
- Links scraped data to persistent KOL records
- Handles:
  - Name normalization
  - Avatar generation (dicebear API)
  - Default follower counts
  - kolscan-specific metrics storage

**Metadata Recording:**
- Stores baseline metrics at market creation time
- Enables accurate resolution by comparing against initial state
- Tracks:
  - Current ranks, wins/losses, SOL/USD gains
  - Follower counts (for X API markets)
  - Thresholds and timeframes

#### D. Fisher-Yates Shuffling
- Implements unbiased random sampling
- Ensures fair KOL selection without patterns
- Prevents clustering of similar market types

#### E. Market Metadata Structure
```typescript
interface GeneratedMarket {
  market: InsertMarket;
  metadata: {
    marketType: string;
    kolA?: string;
    kolB?: string;
    xHandle?: string;
    currentFollowers?: number;
    currentRankA?: string;
    currentRankB?: string;
    currentSolA?: string;
    currentSolB?: string;
    currentUsdA?: string;
    currentUsdB?: string;
    currentWinsLossesA?: string;
    currentWinsLossesB?: string;
    threshold?: number;
    timeframeDays?: number;
  };
}
```

### Integration Points
- **Input**: Scraped KOL data from `kolscan-scraper-service.ts`
- **Output**: Market records + metadata in database
- **Dependencies**: 
  - `dbStorage` for KOL/market creation
  - `xApiClient` for follower verification (optional)

---

## 2. Market Resolver (`market-resolver.ts`)

### Primary Role
Automatically resolves expired markets by fetching current KOL data and determining YES/NO outcomes.

### Key Responsibilities

#### A. Resolution Triggers
- **Automatic**: Runs every 5 minutes via interval
- **Manual**: Admin can trigger via `/api/admin/resolve-markets` endpoint
- **Force Resolution**: Can resolve ALL markets regardless of expiry

#### B. Market Outcome Determination

**For Each Market Type:**

1. **Rank Flippening**
   ```typescript
   Outcome: YES if rankA < rankB
   Data Source: Latest scraped KOLs
   Logic: Numerical rank comparison
   ```

2. **Profit Streak**
   ```typescript
   Outcome: YES if USD gain contains '+' and '$'
   Data Source: Latest scraped USD gain
   Logic: String pattern matching
   ```

3. **Follower Growth**
   ```typescript
   Outcome: YES if (current - initial) >= threshold
   Data Source: X API or cached follower count
   Logic: Growth calculation vs threshold
   Fallback: Uses cached data if API unavailable
   ```

4. **SOL Gain Flippening**
   ```typescript
   Outcome: YES if parsedSolGainA > parsedSolGainB
   Data Source: Latest scraped SOL gains
   Logic: Numerical comparison after parsing
   ```

5. **USD Gain Flippening**
   ```typescript
   Outcome: YES if parsedUsdGainA > parsedUsdGainB
   Data Source: Latest scraped USD gains
   Logic: Numerical comparison after parsing
   ```

6. **Win Rate Flippening**
   ```typescript
   Outcome: YES if winRateA > winRateB
   Data Source: Latest wins/losses
   Logic: (wins / total) comparison
   ```

7. **Win/Loss Ratio Flippening**
   ```typescript
   Outcome: YES if (winsA/lossesA) > (winsB/lossesB)
   Data Source: Latest wins/losses
   Logic: Ratio comparison
   ```

8. **Top Rank Maintain**
   ```typescript
   Outcome: YES if currentRank <= threshold (5 or 10)
   Data Source: Latest scraped rank
   Logic: Simple threshold check
   ```

9. **Streak Continuation**
   ```typescript
   Outcome: YES if currentWinRate > previousWinRate
   Data Source: Metadata + latest wins/losses
   Logic: Improvement detection
   ```

10. **Rank Improvement**
    ```typescript
    Outcome: YES if currentRank <= targetRank
    Data Source: Latest scraped rank
    Logic: Target achievement check
    ```

11. **SOL Gain Threshold**
    ```typescript
    Outcome: YES if parsedSolGain >= threshold
    Data Source: Latest scraped SOL gain
    Logic: Threshold comparison
    ```

12. **Win/Loss Ratio Maintain**
    ```typescript
    Outcome: YES if currentRatio >= threshold
    Data Source: Latest wins/losses
    Logic: Ratio maintenance check
    ```

#### C. Bet Settlement Process

**For Each Bet in Resolved Market:**
1. Check if shares > 0 and position matches outcome
2. Calculate profit:
   - **Win**: `betAmount × 1.5` profit
   - **Loss**: `-betAmount` profit
3. Update bet status to "won" or "lost"
4. Calculate payout (betAmount + profit for winners)
5. Update user balance with payout
6. Update user statistics:
   - Increment `totalWins` if won
   - Update `totalProfit`

#### D. Error Handling & Resilience

**Consecutive Failure Tracking:**
- Monitors consecutive resolution failures
- After 5 failures, stops auto-resolution
- Prevents runaway error loops
- Logs alerts for manual intervention

**Data Validation:**
- Validates market data before resolution
- Checks for missing/invalid fields
- Handles missing KOL data gracefully
- Provides detailed error messages

**Fallback Mechanisms:**
- Uses cached follower data if X API fails
- Continues with other markets if one fails
- Logs warnings for unresolvable markets

#### E. Resolution Reasoning

Generates human-readable resolution explanations:
```typescript
Example: "Meechie is now ranked #3 vs Coasty at rank #5. 
Previously: Meechie was #5, Coasty was #3"
```

### Integration Points
- **Input**: Expired markets from database
- **Data Sources**: 
  - Latest scraped KOLs (`getLatestScrapedKols`)
  - Market metadata (`getMarketMetadata`)
  - X API follower counts (`xApiClient`)
- **Output**: 
  - Resolved markets
  - Settled bets
  - Updated user balances/stats
- **Broadcasting**: WebSocket notifications to connected clients

---

## 3. KolScan Scraper Service (`kolscan-scraper-service.ts`)

### Primary Role
Orchestrates the complete scraping → storage → market generation pipeline.

### Key Responsibilities

#### A. Full Import & Generate Pipeline
```typescript
async runFullImportAndGenerate(): Promise<{
  scraped: number;
  imported: number;
  marketsCreated: number;
}>
```

**Step 1: Scraping**
- Initializes `KOLScraperService`
- Launches headless browser
- Scrapes kolscan.io leaderboard
- Extracts structured KOL data

**Step 2: Storage**
- Converts scraped data to database schema
- Bulk inserts into `scraped_kols` table
- Maintains historical scraping record
- Timestamps each scrape session

**Step 3: KOL Record Creation/Update**
- For each scraped KOL:
  - Check if KOL exists by handle
  - Create new record if missing
  - Update existing record with latest metrics
  - Link to scraped data

**Step 4: Market Generation**
- Converts KOL database records to scraped format
- Calls `MarketGeneratorService.generateMarkets()`
- Creates markets for ALL available KOLs
- Returns market creation results

#### B. Storage Interface Integration

**Database Operations:**
- `createScrapedKols()`: Bulk insert scraped data
- `getKolByHandle()`: Check KOL existence
- `createKol()`: Create new KOL record
- `updateKol()`: Update existing KOL metrics
- `getAllKols()`: Fetch all KOLs for market generation

#### C. Error Handling

**Scraper Failures:**
- Logs detailed error messages
- Returns failure status with error details
- Prevents cascade failures in scheduler

**Database Failures:**
- Transaction rollback on errors
- Detailed logging for debugging
- Graceful degradation

### Integration Points
- **Uses**: `KOLScraperService` for web scraping
- **Uses**: `MarketGeneratorService` for market creation
- **Uses**: `dbStorage` for data persistence
- **Called By**: `Scheduler` (daily automated runs)
- **Called By**: Admin endpoints (manual triggers)

---

## 4. KOL Scraper Service (`kol-scraper-service.ts`)

### Primary Role
Low-level web scraping of kolscan.io using Puppeteer.

### Key Responsibilities

#### A. Browser Automation

**Initialization:**
```typescript
async init(): Promise<void>
```
- Launches headless Chrome browser
- Configures anti-detection settings:
  - Removes webdriver flag
  - Sets realistic user agent
  - Disables automation indicators
- Prepares page for navigation

**Browser Configuration:**
- Single-process mode for Replit compatibility
- Disabled GPU/sandbox for headless operation
- Window size: 1920x1080 for proper rendering

#### B. Leaderboard Scraping

**Navigation & Loading:**
1. Navigate to https://kolscan.io/leaderboard
2. Wait for network idle (dynamic content load)
3. Additional 5-second wait for JavaScript rendering
4. Scroll to bottom to trigger lazy loading
5. Scroll back to top for stability

**Data Extraction:**
```typescript
async scrapeLeaderboard(): Promise<KOLData[]>
```
- Extracts `innerText` from entire page body
- Parses text line-by-line
- Identifies structured data patterns

#### C. Text Parsing Algorithm

**Pattern Recognition:**
1. **Username Detection**
   - Length: 2-50 characters
   - No special symbols (+, $, /, Sol)
   - Not pure numbers
   - Not "Leaderboard" text

2. **X Handle Detection**
   - Regex: `/^[A-Za-z0-9_]{1,15}$/`
   - Follows username line
   - Alphanumeric + underscore only

3. **Wins/Losses Extraction**
   - Pattern: `number / number`
   - Example: "15 / 3"
   - Captures both values

4. **SOL Gain Extraction**
   - Contains: "+", "Sol"
   - Example: "+123.45 Sol"
   - May include commas for thousands

5. **USD Gain Extraction**
   - Contains: "$", "(", ")"
   - Example: "$12,345 (+15%)"
   - Captures full formatted string

**Rank Assignment:**
- Counter-based sequential ranking
- Special "🏆 1" for first place
- Numbers for all other positions

#### D. Data Validation

**Username Validation:**
```typescript
private isValidUsername(text: string): boolean
```
- Ensures reasonable length
- Excludes special characters
- Prevents false positives

**X Handle Validation:**
```typescript
private isValidXHandle(text: string): boolean
```
- Strict Twitter handle format
- Prevents malformed data

#### E. Schema Conversion
```typescript
toInsertSchema(data: KOLData[]): InsertScrapedKol[]
```
- Converts scraped data to database schema
- Handles null values appropriately
- Prepares for bulk insertion

#### F. Resource Management
```typescript
async close(): Promise<void>
```
- Properly closes browser instance
- Prevents memory leaks
- Essential for scheduled runs

### Technical Constraints
- **Memory**: Single-process mode for Replit
- **Sandboxing**: Disabled for containerless environment
- **Anti-Detection**: Minimal fingerprinting
- **Rate Limiting**: None (public website)

### Integration Points
- **Called By**: `KolscanScraperService`
- **Output**: Array of `KOLData` objects
- **Dependencies**: Puppeteer, Chromium

---

## 5. Scheduler (`scheduler.ts`)

### Primary Role
Orchestrates automated daily tasks: scraping, market generation, and cleanup.

### Key Responsibilities

#### A. Task Scheduling

**Scraping Schedule:**
- **Default**: `0 2 * * *` (2 AM daily)
- **Configurable**: Can update via `updateConfig()`
- **Task**: Calls `kolscanService.runFullImportAndGenerate()`

**Market Generation Schedule:**
- **Default**: `0 3 * * *` (3 AM daily)
- **Configurable**: Independent from scraping
- **Task**: Generates markets for ALL available KOLs

**Dependencies:**
- Uses `node-cron` for schedule management
- Runs in server process (not separate worker)

#### B. Scraping Task

```typescript
async performScraping(): Promise<{
  success: boolean;
  scraped: number;
  saved: number;
  error?: string;
}>
```

**Process:**
1. Logs start with visual separators
2. Calls `kolscanService.runFullImportAndGenerate()`
3. Captures results (scraped, imported, markets created)
4. Logs completion status
5. Returns structured result

**Error Handling:**
- Catches exceptions
- Logs detailed error messages
- Returns failure status with error

#### C. Market Generation Task

```typescript
async performMarketGeneration(): Promise<{
  success: boolean;
  created: number;
  error?: string;
}>
```

**Process:**
1. Fetches ALL KOLs from database
2. Filters for KOLs with scraped kolscan data
3. Converts to scraped KOL format
4. Generates markets for ALL KOLs (not fixed count)
5. Returns creation count

**Validation:**
- Checks if scraped KOLs exist
- Warns if no data available
- Suggests running scraper first

#### D. Schedule Management

**Start/Stop Controls:**
```typescript
startScrapingSchedule(): void
stopScrapingSchedule(): void
startMarketGenerationSchedule(): void
stopMarketGenerationSchedule(): void
startAllSchedules(): void
stopAllSchedules(): void
```

**Configuration:**
```typescript
interface SchedulerConfig {
  scrapingEnabled: boolean;
  scrapingSchedule: string; // cron expression
  marketGenerationEnabled: boolean;
  marketGenerationSchedule: string;
  marketGenerationCount: number; // (deprecated - now uses ALL)
}
```

**Dynamic Updates:**
- Can update schedules without restart
- Automatically restarts affected tasks
- Validates cron expressions

#### E. Status Reporting

```typescript
getStatus(): {
  scraping: { enabled, schedule, running };
  marketGeneration: { enabled, schedule, count, running };
  metricsUpdater: { running };
  marketResolver: { running };
}
```

### Integration Points
- **Initialized By**: `server/index.ts` on startup
- **Calls**: `KolscanScraperService`, `MarketGeneratorService`
- **Dependencies**: `node-cron` for scheduling
- **Admin Access**: Via `/api/admin/scheduler/*` endpoints

---

## 6. Metrics Updater (`metrics-updater.ts`)

### Primary Role
Periodically updates KOL social media metrics (followers, engagement).

### Key Responsibilities

#### A. Automatic Updates

**Interval**: Every 30 minutes (default)

**Process Per KOL:**
1. Fetch latest metrics from social media APIs
2. Compare with current database values
3. Record metrics history snapshot
4. Update KOL record if values changed

#### B. Metrics Collection

**Data Sources:**
- Twitter API (if configured)
- Mock data generator (fallback)

**Metrics Tracked:**
- Follower count
- Engagement rate
- Trending status
- Trending percentage

#### C. Historical Tracking

**Always Records:**
```typescript
await storage.createKolMetricsHistory({
  kolId,
  followers,
  engagementRate,
  trending,
  trendingPercent,
})
```
- Creates snapshot every update cycle
- Enables time-series analysis
- Tracks trends even without changes

**Conditional Updates:**
```typescript
if (hasChanged) {
  await storage.updateKol(kolId, { ... })
}
```
- Only updates KOL record if metrics changed
- Reduces database writes
- Preserves history

#### D. Error Handling

**Consecutive Failures:**
- Tracks failures across update cycles
- After 5 consecutive failures, stops auto-update
- Prevents runaway errors
- Logs alerts for manual intervention

**Per-KOL Failures:**
- Continues with other KOLs if one fails
- Logs individual errors
- Doesn't cascade failures

#### E. Data Validation

**Metric Validation:**
- Checks for NaN, Infinite values
- Validates reasonable ranges:
  - Followers: 0 to 1 billion
  - Engagement: 0 to 100%
- Warns on suspicious values
- Throws errors on invalid data

### Integration Points
- **Started By**: `server/index.ts`
- **Uses**: `socialMediaClient` for metrics
- **Uses**: `dbStorage` for persistence
- **Runs**: Background interval (30 min)

---

## 7. Database Storage (`db-storage.ts`)

### Primary Role
Centralized data access layer with transaction support and type safety.

### Key Responsibilities

#### A. Market Operations

**Market CRUD:**
```typescript
createMarket(insertMarket: InsertMarket): Promise<Market>
getMarket(id: string): Promise<Market | undefined>
getAllMarkets(): Promise<Market[]>
getMarketWithKol(id: string): Promise<MarketWithKol | undefined>
getAllMarketsWithKols(): Promise<MarketWithKol[]>
updateMarket(id, updates): Promise<void>
updateMarketPools(id, yesPool, noPool, yesPrice, noPrice): Promise<void>
updateMarketVolume(id, volume): Promise<void>
resolveMarket(id, resolvedValue): Promise<void>
```

**Market Metadata:**
```typescript
createMarketMetadata(metadata: InsertMarketMetadata): Promise<MarketMetadata>
getMarketMetadata(marketId: string): Promise<MarketMetadata | undefined>
getAllMarketMetadata(): Promise<MarketMetadata[]>
```

#### B. Betting Operations

**Legacy Bet Placement (Deprecated):**
```typescript
placeBetTransaction(params): Promise<Bet>
```
- Single transaction for all bet operations
- Updates: bet, position, user balance, user stats, market pools
- **Issue**: Race conditions on concurrent bets

**NEW: Atomic Bet Placement:**
```typescript
placeBetWithLocking(params: {
  userId: string;
  marketId: string;
  position: "YES" | "NO";
  amount: number;
  action: "buy" | "sell";
  slippageTolerance?: number;
}): Promise<{ bet: Bet; priceImpact: number; error?: string }>
```

**Transaction Steps:**
1. **Row-Level Locking**: Lock market and user records
2. **Validation**: Check market live, user balance, pool values
3. **AMM Calculations**: 
   - Calculate shares/payout using Constant Product formula
   - Validate price impact vs slippage tolerance
   - Apply 2% platform fee on buys
4. **Updates**: Bet, position, user balance/stats, market pools
5. **Commit**: Atomic transaction success/rollback

**Safety Features:**
- Min price: 0.01, Max price: 0.99 (prevents extremes)
- Max trade: 40% of pool size (prevents manipulation)
- Slippage protection: Default 5% max price impact
- Platform fee: 2% deducted from bet amount
- NaN/Infinite checks at every calculation
- Pool depletion prevention

#### C. KOL Operations

```typescript
createKol(insertKol: InsertKol): Promise<Kol>
getKol(id: string): Promise<Kol | undefined>
getKolByHandle(handle: string): Promise<Kol | undefined>
getAllKols(): Promise<Kol[]>
updateKol(id, updates): Promise<Kol>
```

**Metrics History:**
```typescript
createKolMetricsHistory(insertHistory): Promise<KolMetricsHistory>
getKolMetricsHistory(kolId, days): Promise<KolMetricsHistory[]>
```

#### D. Scraped KOL Operations

```typescript
createScrapedKols(kols: InsertScrapedKol[]): Promise<ScrapedKol[]>
getLatestScrapedKols(limit): Promise<ScrapedKol[]>
getScrapedKolsByDate(date): Promise<ScrapedKol[]>
```

**Latest Scrape Query:**
- Uses subquery to find max `scrapedAt` timestamp
- Returns only KOLs from most recent scrape
- Avoids timestamp precision issues
- Ordered by rank

#### E. User Operations

```typescript
getUser(id): Promise<User | undefined>
getUserByUsername(username): Promise<User | undefined>
getUserByWalletAddress(walletAddress): Promise<User | undefined>
getUserByTwitterId(twitterId): Promise<User | undefined>
createUser(insertUser): Promise<User>
updateUserBalance(id, balance): Promise<void>
updateUserStats(id, totalBets, totalWins, totalProfit): Promise<void>
updateUserSolanaBalance(id, solanaBalance): Promise<void>
updateUserDepositAddress(id, address): Promise<void>
```

#### F. Position Management

```typescript
getUserPosition(userId, marketId, position): Promise<Position | undefined>
getUserPositions(userId): Promise<Position[]>
getUserPositionsWithMarkets(userId): Promise<PositionWithMarket[]>
getMarketPositions(marketId): Promise<Position[]>
updateUserPosition(userId, marketId, position, shares, action): Promise<void>
```

#### G. Follower Cache

```typescript
getFollowerCache(xHandle): Promise<FollowerCacheEntry | undefined>
upsertFollowerCache(cache): Promise<FollowerCacheEntry>
getAllFollowerCache(): Promise<FollowerCacheEntry[]>
```
- Caches X/Twitter follower counts
- Reduces API calls
- Provides fallback for resolution

#### H. Solana Operations

**Deposits:**
```typescript
createDeposit(insertDeposit): Promise<SolanaDeposit>
getPendingDeposits(): Promise<SolanaDeposit[]>
getUserDeposits(userId, limit): Promise<SolanaDeposit[]>
updateDepositStatus(id, status, confirmations): Promise<void>
```

**Withdrawals:**
```typescript
createWithdrawal(insertWithdrawal): Promise<SolanaWithdrawal>
getPendingWithdrawals(): Promise<SolanaWithdrawal[]>
getUserWithdrawals(userId, limit): Promise<SolanaWithdrawal[]>
updateWithdrawalStatus(id, status, signature?, error?): Promise<void>
```

#### I. Platform Fees

```typescript
createPlatformFee(insertFee): Promise<PlatformFee>
getTotalPlatformFees(): Promise<string>
getUserPlatformFees(userId): Promise<PlatformFee[]>
```
- Tracks 2% fee on buy orders
- Aggregates total revenue
- Links fees to specific bets

#### J. Leaderboard

```typescript
getLeaderboard(): Promise<LeaderboardEntry[]>
```
- Calculates win rate per user
- Ranks by total profit
- Filters users with >0 bets

### Technology
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon serverless)
- **Connection Pooling**: @neondatabase/serverless
- **WebSocket Support**: Custom ws implementation

---

## 8. X API Client (`x-api-client.ts`)

### Primary Role
Interfaces with X/Twitter API to fetch real-time follower counts.

### Key Responsibilities

#### A. Follower Count Fetching

```typescript
async getFollowerCount(handle: string): Promise<number | null>
```

**Process:**
1. Check if API is configured
2. Verify rate limit availability
3. Check cache for recent data
4. Fetch from X API if needed
5. Update cache
6. Decrement rate limit counter
7. Return follower count

#### B. Rate Limiting

**Configuration:**
- Total lookups: 15 per window
- Window: 15 minutes
- Resets: Automatically after window

**Tracking:**
```typescript
private rateLimitRemaining: number = 15;
private rateLimitResetTime: number = Date.now() + 15 * 60 * 1000;
```

**Status Check:**
```typescript
getRateLimitStatus(): {
  remaining: number;
  resetTime: Date;
  isConfigured: boolean;
}
```

#### C. Caching Strategy

**Cache First:**
1. Check `followerCache` table
2. If cached within 6 hours, use cached value
3. Otherwise, fetch fresh data

**Cache Update:**
- Upserts on every successful fetch
- Stores: xHandle, followers, cachedAt
- Prevents duplicate API calls

#### D. Error Handling

**API Failures:**
- Returns `null` on error
- Logs warnings
- Falls back to cached data
- Doesn't throw exceptions

**Rate Limit Exceeded:**
- Returns `null`
- Logs warning
- Client handles gracefully

### Integration Points
- **Used By**: `MarketGeneratorService` (follower growth markets)
- **Used By**: `MarketResolver` (follower market resolution)
- **Uses**: `dbStorage` for caching
- **Optional**: Works without API credentials

---

## 9. Social Media API Client (`social-api-client.ts`)

### Primary Role
Fetches KOL social media metrics with Twitter API integration and mock fallback.

### Key Responsibilities

#### A. Twitter API Integration

**Endpoint:** Twitter v2 API
```typescript
async fetchTwitterMetrics(handle: string): Promise<SocialMediaMetrics | null>
```

**Fetched Data:**
- Follower count (`followers_count`)
- Tweet count (`tweet_count`)
- Engagement rate (calculated/mocked)

**Configuration:**
- Requires `TWITTER_BEARER_TOKEN` environment variable
- Optional: Works with mock data if not configured

#### B. Mock Data Generation

```typescript
private generateEnhancedMockMetrics(kol: Kol): SocialMediaMetrics
```

**Simulation:**
- Follower change: -500 to +2000
- Engagement change: -0.2% to +0.4%
- Trending detection: Engagement >4.0% or follower growth >500
- Trending percentage: Based on growth rate

**Realism:**
- Preserves existing data
- Gradual changes only
- Reasonable bounds
- Consistent with KOL tier

#### C. Unified Interface

```typescript
async fetchKolMetrics(kol: Kol): Promise<SocialMediaMetrics>
```

**Priority:**
1. Try Twitter API if configured
2. Fall back to mock data
3. Never fails (always returns data)

**Return Type:**
```typescript
interface SocialMediaMetrics {
  followers: number;
  engagementRate: number;
  trending: boolean;
  trendingPercent: number | null;
}
```

### Integration Points
- **Used By**: `MetricsUpdater`
- **Used By**: `MarketResolver` (legacy standard markets)
- **Environment**: Requires `TWITTER_BEARER_TOKEN` for real data

---

## Data Flow Diagrams

### Market Generation Flow
```
KOLScraperService (Puppeteer)
    ↓ (scrapes kolscan.io)
KolscanScraperService
    ↓ (stores scraped data)
Database (scraped_kols table)
    ↓ (creates/updates KOL records)
Database (kols table)
    ↓ (fetches all KOLs)
MarketGeneratorService
    ↓ (generates 12 market types)
Database (markets + market_metadata tables)
    ↓ (broadcasts to clients)
WebSocket (live updates)
```

### Market Resolution Flow
```
Scheduler (every 5 minutes)
    ↓
MarketResolver.resolveExpiredMarkets()
    ↓ (fetches expired markets)
Database (markets with resolvesAt <= now)
    ↓ (for each market)
MarketResolver.resolveMarket()
    ↓ (fetches latest KOL data)
Database (scraped_kols latest + market_metadata)
    ↓ (determines outcome)
MarketResolver.determineOutcome()
    ↓ (settles bets)
MarketResolver.settleBets()
    ↓ (updates all related records)
Database (markets, bets, positions, users)
    ↓ (broadcasts resolution)
WebSocket (market resolved event)
```

### Bet Placement Flow (NEW)
```
User → POST /api/bets
    ↓
dbStorage.placeBetWithLocking()
    ↓ (BEGIN TRANSACTION + LOCKS)
Database (SELECT ... FOR UPDATE on markets, users)
    ↓ (validates state)
AMM Calculations (shares, price impact, fees)
    ↓ (slippage check)
Slippage Validation (price impact vs tolerance)
    ↓ (creates records)
Database (INSERT bet, UPDATE position, user, market)
    ↓ (COMMIT)
Transaction Success
    ↓ (broadcasts trade)
WebSocket (new trade event)
```

### Metrics Update Flow
```
MetricsUpdater (every 30 minutes)
    ↓ (for each KOL)
SocialMediaClient.fetchKolMetrics()
    ↓ (tries Twitter API)
Twitter API v2
    ↓ (if fails/not configured)
Mock Data Generator
    ↓ (creates metrics history)
Database (kol_metrics_history table)
    ↓ (if changed)
Database (UPDATE kols table)
```

---

## Scheduling & Automation

### Daily Schedule (Default)

**2:00 AM** - Scraping Task
- Scrape kolscan.io leaderboard
- Store scraped KOL data
- Create/update KOL records
- Generate markets for ALL KOLs

**3:00 AM** - Market Generation (Backup)
- Fallback if 2 AM generation fails
- Uses existing KOL data
- Generates additional markets if needed

**Every 5 Minutes** - Market Resolution
- Check for expired markets
- Fetch latest KOL data
- Determine outcomes
- Settle bets
- Update user balances

**Every 30 Minutes** - Metrics Update
- Fetch social media metrics
- Update KOL records
- Record metrics history
- Track trending status

---

## Error Recovery & Resilience

### Consecutive Failure Protection

**MetricsUpdater:**
- Max 5 consecutive failures
- Auto-stops on threshold
- Requires manual restart
- Prevents runaway errors

**MarketResolver:**
- Max 5 consecutive failures
- Auto-stops on threshold
- Alerts for manual intervention
- Protects against cascade failures

### Transaction Rollbacks

**placeBetWithLocking:**
- All-or-nothing transactions
- Automatic rollback on ANY error
- Preserves database consistency
- Detailed error messages

### Graceful Degradation

**X API Unavailable:**
- Falls back to cached follower data
- Warns but doesn't fail
- Continues with other markets

**Twitter API Unconfigured:**
- Uses mock data for metrics
- Logs informational messages
- Full functionality maintained

### Data Validation

**At Every Step:**
- NaN/Infinite checks
- Range validation
- Null/undefined guards
- Type safety (TypeScript)

---

## Configuration & Environment

### Required Variables
```bash
DATABASE_URL=postgresql://...  # Neon PostgreSQL connection
PORT=5000                       # Server port
```

### Optional Variables
```bash
# Twitter/X API (for real follower data)
TWITTER_BEARER_TOKEN=...

# X API v1.1 (alternative)
X_API_KEY=...
X_API_SECRET=...
X_ACCESS_TOKEN=...
X_ACCESS_TOKEN_SECRET=...

# Solana (for crypto deposits/withdrawals)
SOLANA_HOT_WALLET_PRIVATE_KEY=...
SOLANA_RPC_URL=...

# Platform Settings
PLATFORM_FEE_PERCENTAGE=0.02    # Default 2%
```

---

## Performance Optimizations

### Database Queries
- **Row-level locking**: Prevents race conditions
- **Bulk inserts**: Scraped KOL data (20 at once)
- **Indexed queries**: User lookups by wallet/username
- **Connection pooling**: Neon serverless pool

### Caching
- **Follower cache**: 6-hour TTL, reduces API calls
- **Metrics cache**: Only updates on change
- **Market metadata**: Cached at creation time

### Rate Limiting
- **X API**: 15 lookups per 15 minutes
- **Automatic reset**: Window-based tracking
- **Priority system**: Reserves lookups for high-value markets

### Memory Management
- **Browser cleanup**: Closes Puppeteer after scraping
- **Single-process mode**: Optimized for Replit
- **WebSocket cleanup**: Proper disconnect handling

---

## Testing & Validation

### Market Generation Tests
- Diversity validation (no duplicate KOLs)
- Type distribution checks
- Metadata completeness
- KOL resolution accuracy

### Market Resolution Tests
- Outcome determination logic
- Bet settlement calculations
- User balance updates
- Error handling coverage

### AMM Tests
- Price impact calculations
- Slippage tolerance enforcement
- Pool depletion prevention
- Fee deduction accuracy
- Concurrent bet handling

### Data Integrity
- Transaction atomicity
- Foreign key constraints
- Type safety (Drizzle + TypeScript)
- Input validation

---

## Admin Tools & Endpoints

### Manual Triggers
```
POST /api/admin/scrape-and-generate  # Force scraping + market generation
POST /api/admin/resolve-markets      # Force resolution of expired markets
POST /api/admin/reset-markets        # Resolve ALL markets + generate new
GET  /api/admin/scheduler/status     # View scheduler configuration
POST /api/admin/scheduler/config     # Update scheduler settings
```

### Monitoring
- Console logs with visual separators
- Success/failure counts
- Error stack traces
- WebSocket event broadcasting

---

## Future Enhancements

### Planned Features
1. **Advanced AMM**: Dynamic fees based on volatility
2. **Market Maker Incentives**: Liquidity provision rewards
3. **Historical Analytics**: Market performance tracking
4. **Multi-Exchange Support**: Beyond kolscan.io
5. **Real-time Scraping**: WebSocket from kolscan (if available)
6. **Machine Learning**: Outcome prediction models
7. **Social Sentiment**: Twitter sentiment analysis
8. **Automated Market Making**: Bot trading support

### Technical Debt
1. Remove deprecated `placeBetTransaction`
2. Migrate all routes to new atomic betting
3. Add comprehensive integration tests
4. Implement circuit breakers for external APIs
5. Add Prometheus metrics export
6. Implement distributed locking for multi-instance deploys

---

## Summary

This market system is a **fully automated, self-healing prediction market platform** that:

1. **Scrapes** real KOL performance data daily
2. **Generates** diverse markets covering 12 different prediction types
3. **Resolves** markets automatically based on live data
4. **Settles** bets with atomic transactions and slippage protection
5. **Updates** KOL metrics every 30 minutes
6. **Caches** API data to minimize external dependencies
7. **Handles** errors gracefully with fallback mechanisms
8. **Scales** via connection pooling and efficient queries
9. **Broadcasts** real-time updates via WebSockets
10. **Protects** users with price bounds and trade limits

Every component has a specific role, and the entire system operates autonomously with minimal manual intervention.
