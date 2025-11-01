# Design Document: PvP Markets with Token-Gating

## Overview

This design document outlines the architecture for implementing Player vs Player (PvP) markets with token-gating on the KOL prediction platform. The system enables users who hold a specific SPL token or NFT to create custom prediction markets where two participants stake equal amounts of SOL, with the winner receiving 90% of the total pot (10% platform fee).

### Key Features

- Token-gated market creation (SPL token or NFT verification)
- Peer-to-peer market matching system
- Automated market resolution
- Real-time notifications via WebSocket
- Comprehensive market history and statistics

### Design Principles

1. **Security First**: All wallet interactions must be cryptographically verified
2. **Fair Play**: Prevent self-matching and ensure equal stakes
3. **Transparency**: Clear fee structure and outcome determination
4. **User Experience**: Simple creation flow with real-time updates
5. **Scalability**: Efficient database queries and caching strategies

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  • Wallet Connection (Solana Wallet Adapter)                │
│  • PvP Market Creation UI                                    │
│  • Market Browser & Matching UI                              │
│  • Market History Dashboard                                  │
│  • Real-time Updates (WebSocket Client)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Express)                     │
├─────────────────────────────────────────────────────────────┤
│  • Authentication Middleware                                 │
│  • Token-Gating Middleware                                   │
│  • PvP Market Routes                                         │
│  • WebSocket Server                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  • Token Verification Service                                │
│  • PvP Market Service                                        │
│  • Market Resolution Service                                 │
│  • Notification Service                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer (PostgreSQL)                 │
├─────────────────────────────────────────────────────────────┤
│  • pvp_markets table                                         │
│  • pvp_participants table                                    │
│  • users table (existing)                                    │
│  • transactions table (existing)                             │
│  • notifications table (existing)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
├─────────────────────────────────────────────────────────────┤
│  • Solana RPC Node (Token Verification)                      │
│  • Data Sources (Market Resolution)                          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React, TypeScript, Solana Wallet Adapter, WebSocket Client
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Solana Web3.js, @solana/spl-token
- **Authentication**: Session-based with Solana signature verification
- **Real-time**: WebSocket (ws library)

## Components and Interfaces

### 1. Frontend Components

#### WalletConnectionProvider
Wraps the application to provide Solana wallet connectivity.

```typescript
interface WalletConnectionProviderProps {
  children: React.ReactNode;
  network: 'devnet' | 'testnet' | 'mainnet-beta';
}

// Provides access to:
// - publicKey: PublicKey | null
// - connected: boolean
// - signMessage: (message: Uint8Array) => Promise<Uint8Array>
```

#### PvPMarketCreationModal
Modal component for creating new PvP markets.

```typescript
interface PvPMarketCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (market: PvPMarket) => void;
}

interface PvPMarketCreationForm {
  question: string;           // Max 200 characters
  outcomeA: string;           // e.g., "Yes"
  outcomeB: string;           // e.g., "No"
  stakeAmount: number;        // 0.1 - 10 SOL
  resolutionDate: Date;       // 1 hour - 30 days
  resolutionCriteria: string; // How to determine winner
}
```

#### PvPMarketBrowser
Component for browsing and filtering available PvP markets.

```typescript
interface PvPMarketBrowserProps {
  onMarketSelect: (market: PvPMarket) => void;
}

interface PvPMarketFilters {
  minStake?: number;
  maxStake?: number;
  sortBy: 'createdAt' | 'stakeAmount' | 'resolutionDate';
  sortOrder: 'asc' | 'desc';
}
```

#### PvPMarketCard
Displays individual PvP market information.

```typescript
interface PvPMarketCardProps {
  market: PvPMarket;
  onMatch: (marketId: string) => void;
  onCancel?: (marketId: string) => void;
  currentUserId: string;
}
```

#### PvPMarketHistory
Dashboard showing user's PvP market participation history.

```typescript
interface PvPMarketHistoryProps {
  userId: string;
}

interface PvPMarketStats {
  totalMarkets: number;
  totalWins: number;
  totalLosses: number;
  totalStaked: number;
  totalWinnings: number;
  winRate: number;
}
```

### 2. Backend Services

#### TokenVerificationService
Verifies user ownership of required tokens.

```typescript
class TokenVerificationService {
  constructor(
    private connection: Connection,
    private requiredTokenMint: PublicKey,
    private minimumBalance: number
  ) {}

  /**
   * Check if a wallet holds the required token
   */
  async verifyTokenOwnership(
    walletAddress: string
  ): Promise<TokenVerificationResult>;

  /**
   * Check if a wallet holds a specific NFT from a collection
   */
  async verifyNFTOwnership(
    walletAddress: string,
    collectionAddress: string
  ): Promise<NFTVerificationResult>;

  /**
   * Get token balance for a wallet
   */
  async getTokenBalance(
    walletAddress: string,
    tokenMint: string
  ): Promise<number>;
}

interface TokenVerificationResult {
  hasAccess: boolean;
  balance?: number;
  error?: string;
}

interface NFTVerificationResult {
  hasAccess: boolean;
  nfts?: Array<{ mint: string; name: string }>;
  error?: string;
}
```

#### PvPMarketService
Core business logic for PvP markets.

```typescript
class PvPMarketService {
  constructor(
    private storage: DatabaseStorage,
    private tokenVerification: TokenVerificationService,
    private notificationService: NotificationService
  ) {}

  /**
   * Create a new PvP market
   */
  async createMarket(
    userId: string,
    params: CreatePvPMarketParams
  ): Promise<PvPMarket>;

  /**
   * Match an existing PvP market
   */
  async matchMarket(
    userId: string,
    marketId: string
  ): Promise<PvPMarket>;

  /**
   * Cancel an unmatched market
   */
  async cancelMarket(
    userId: string,
    marketId: string
  ): Promise<void>;

  /**
   * Get available markets for matching
   */
  async getAvailableMarkets(
    filters: PvPMarketFilters
  ): Promise<PvPMarket[]>;

  /**
   * Get user's market history
   */
  async getUserMarketHistory(
    userId: string,
    filters?: HistoryFilters
  ): Promise<PvPMarketHistory>;

  /**
   * Get user's PvP statistics
   */
  async getUserStats(userId: string): Promise<PvPMarketStats>;
}

interface CreatePvPMarketParams {
  question: string;
  outcomeA: string;
  outcomeB: string;
  stakeAmount: number;
  resolutionDate: Date;
  resolutionCriteria: string;
}
```

#### PvPMarketResolver
Handles automatic market resolution.

```typescript
class PvPMarketResolver {
  constructor(
    private storage: DatabaseStorage,
    private notificationService: NotificationService
  ) {}

  /**
   * Resolve a PvP market and distribute winnings
   */
  async resolveMarket(
    marketId: string,
    winningOutcome: 'A' | 'B'
  ): Promise<ResolutionResult>;

  /**
   * Check for markets ready to resolve
   */
  async checkPendingResolutions(): Promise<void>;

  /**
   * Calculate payout amounts
   */
  calculatePayout(stakeAmount: number): PayoutCalculation;
}

interface ResolutionResult {
  marketId: string;
  winnerId: string;
  loserId: string;
  payoutAmount: number;
  platformFee: number;
}

interface PayoutCalculation {
  totalPot: number;
  platformFee: number;
  winnerPayout: number;
}
```

### 3. Middleware

#### TokenGatingMiddleware
Express middleware to verify token ownership.

```typescript
interface TokenGatingMiddlewareOptions {
  tokenMint: string;
  minimumBalance: number;
  checkType: 'spl-token' | 'nft';
  collectionAddress?: string;
}

function createTokenGatingMiddleware(
  options: TokenGatingMiddlewareOptions
): RequestHandler;

// Usage:
// app.post('/api/pvp/markets', 
//   requireAuth, 
//   tokenGatingMiddleware, 
//   createPvPMarketHandler
// );
```

### 4. API Routes

#### PvP Market Routes

```typescript
// Create a new PvP market (token-gated)
POST /api/pvp/markets
Headers: { Cookie: session }
Body: CreatePvPMarketParams
Response: PvPMarket

// Get available markets for matching
GET /api/pvp/markets/available
Query: { minStake?, maxStake?, sortBy?, sortOrder? }
Response: PvPMarket[]

// Get specific market details
GET /api/pvp/markets/:marketId
Response: PvPMarketWithParticipants

// Match a market
POST /api/pvp/markets/:marketId/match
Headers: { Cookie: session }
Response: PvPMarket

// Cancel own market
POST /api/pvp/markets/:marketId/cancel
Headers: { Cookie: session }
Response: { success: boolean }

// Get user's market history
GET /api/pvp/markets/history
Headers: { Cookie: session }
Query: { status?, limit?, offset? }
Response: PvPMarketHistory

// Get user's PvP statistics
GET /api/pvp/stats
Headers: { Cookie: session }
Response: PvPMarketStats

// Check token-gating eligibility
GET /api/pvp/eligibility
Headers: { Cookie: session }
Response: { eligible: boolean, reason?: string }
```

## Data Models

### Database Schema

#### pvp_markets Table

```sql
CREATE TABLE pvp_markets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id VARCHAR NOT NULL REFERENCES users(id),
  question TEXT NOT NULL,
  outcome_a TEXT NOT NULL,
  outcome_b TEXT NOT NULL,
  stake_amount DECIMAL(18, 9) NOT NULL,
  resolution_date TIMESTAMP NOT NULL,
  resolution_criteria TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, matched, active, resolved, cancelled
  winning_outcome TEXT, -- 'A' or 'B'
  winner_id VARCHAR REFERENCES users(id),
  platform_fee DECIMAL(18, 9),
  payout_amount DECIMAL(18, 9),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  matched_at TIMESTAMP,
  resolved_at TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'matched', 'active', 'resolved', 'cancelled')),
  CONSTRAINT valid_stake CHECK (stake_amount >= 0.1 AND stake_amount <= 10),
  CONSTRAINT valid_outcome CHECK (winning_outcome IN ('A', 'B') OR winning_outcome IS NULL)
);

CREATE INDEX idx_pvp_markets_status ON pvp_markets(status);
CREATE INDEX idx_pvp_markets_creator ON pvp_markets(creator_id);
CREATE INDEX idx_pvp_markets_resolution_date ON pvp_markets(resolution_date);
```

#### pvp_participants Table

```sql
CREATE TABLE pvp_participants (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id VARCHAR NOT NULL REFERENCES pvp_markets(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  assigned_outcome TEXT NOT NULL, -- 'A' or 'B'
  role TEXT NOT NULL, -- 'creator' or 'matcher'
  stake_amount DECIMAL(18, 9) NOT NULL,
  is_winner BOOLEAN,
  payout_amount DECIMAL(18, 9),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_assigned_outcome CHECK (assigned_outcome IN ('A', 'B')),
  CONSTRAINT valid_role CHECK (role IN ('creator', 'matcher')),
  UNIQUE(market_id, user_id)
);

CREATE INDEX idx_pvp_participants_market ON pvp_participants(market_id);
CREATE INDEX idx_pvp_participants_user ON pvp_participants(user_id);
```

#### pvp_token_config Table (Configuration)

```sql
CREATE TABLE pvp_token_config (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  token_type TEXT NOT NULL, -- 'spl-token' or 'nft'
  token_mint TEXT NOT NULL,
  minimum_balance DECIMAL(18, 9) NOT NULL DEFAULT 1,
  collection_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_token_type CHECK (token_type IN ('spl-token', 'nft'))
);
```

### TypeScript Types

```typescript
interface PvPMarket {
  id: string;
  creatorId: string;
  question: string;
  outcomeA: string;
  outcomeB: string;
  stakeAmount: string; // Decimal as string
  resolutionDate: Date;
  resolutionCriteria: string;
  status: 'pending' | 'matched' | 'active' | 'resolved' | 'cancelled';
  winningOutcome?: 'A' | 'B';
  winnerId?: string;
  platformFee?: string;
  payoutAmount?: string;
  createdAt: Date;
  matchedAt?: Date;
  resolvedAt?: Date;
}

interface PvPParticipant {
  id: string;
  marketId: string;
  userId: string;
  assignedOutcome: 'A' | 'B';
  role: 'creator' | 'matcher';
  stakeAmount: string;
  isWinner?: boolean;
  payoutAmount?: string;
  joinedAt: Date;
}

interface PvPMarketWithParticipants extends PvPMarket {
  creator: {
    id: string;
    username: string | null;
    avatarUrl?: string | null;
  };
  matcher?: {
    id: string;
    username: string | null;
    avatarUrl?: string | null;
  };
  participants: PvPParticipant[];
}

interface PvPMarketHistory {
  markets: PvPMarketWithParticipants[];
  stats: PvPMarketStats;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface PvPTokenConfig {
  id: string;
  tokenType: 'spl-token' | 'nft';
  tokenMint: string;
  minimumBalance: string;
  collectionAddress?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Error Types

```typescript
class TokenGatingError extends Error {
  constructor(
    message: string,
    public code: 'NO_TOKEN' | 'INSUFFICIENT_BALANCE' | 'VERIFICATION_FAILED'
  ) {
    super(message);
    this.name = 'TokenGatingError';
  }
}

class PvPMarketError extends Error {
  constructor(
    message: string,
    public code: 
      | 'INSUFFICIENT_BALANCE'
      | 'SELF_MATCH_ATTEMPT'
      | 'MARKET_NOT_FOUND'
      | 'MARKET_ALREADY_MATCHED'
      | 'MARKET_ALREADY_RESOLVED'
      | 'UNAUTHORIZED'
      | 'INVALID_PARAMETERS'
  ) {
    super(message);
    this.name = 'PvPMarketError';
  }
}
```

### Error Responses

```typescript
interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
}

// Example error responses:
// 403: { message: "Token ownership required", code: "NO_TOKEN" }
// 400: { message: "Cannot match your own market", code: "SELF_MATCH_ATTEMPT" }
// 404: { message: "Market not found", code: "MARKET_NOT_FOUND" }
```

## Testing Strategy

### Unit Tests

1. **TokenVerificationService**
   - Test SPL token balance checking
   - Test NFT ownership verification
   - Test error handling for invalid addresses
   - Test caching mechanisms

2. **PvPMarketService**
   - Test market creation with valid parameters
   - Test market creation with invalid parameters
   - Test market matching logic
   - Test self-match prevention
   - Test cancellation logic
   - Test balance deduction and refunds

3. **PvPMarketResolver**
   - Test payout calculations (90/10 split)
   - Test market resolution logic
   - Test notification triggering
   - Test transaction recording

### Integration Tests

1. **End-to-End Market Flow**
   - User A creates market
   - User B matches market
   - Market resolves automatically
   - Winnings distributed correctly
   - Notifications sent to both users

2. **Token-Gating Flow**
   - User without token attempts creation (should fail)
   - User with token creates market (should succeed)
   - Token balance verification accuracy

3. **WebSocket Updates**
   - Market creation broadcasts to all clients
   - Market matching updates relevant clients
   - Resolution updates both participants

### Security Tests

1. **Authentication**
   - Verify session validation
   - Test signature verification
   - Test nonce expiration

2. **Authorization**
   - Test token-gating enforcement
   - Test market ownership verification
   - Test self-match prevention

3. **Input Validation**
   - Test SQL injection prevention
   - Test XSS prevention in market questions
   - Test stake amount bounds
   - Test date validation

## Performance Considerations

### Database Optimization

1. **Indexes**
   - Index on `pvp_markets.status` for filtering
   - Index on `pvp_markets.creator_id` for user queries
   - Index on `pvp_participants.user_id` for history queries
   - Composite index on `(status, resolution_date)` for resolver queries

2. **Query Optimization**
   - Use pagination for market lists
   - Implement cursor-based pagination for large datasets
   - Cache frequently accessed market data
   - Use database views for complex statistics

### Caching Strategy

1. **Token Verification Cache**
   - Cache token ownership results for 5 minutes
   - Invalidate on wallet disconnection
   - Use in-memory cache (Redis optional)

2. **Market Data Cache**
   - Cache available markets list for 30 seconds
   - Invalidate on market creation/matching
   - Use WebSocket for real-time updates

3. **User Statistics Cache**
   - Cache user stats for 1 minute
   - Invalidate on market resolution
   - Compute incrementally when possible

### Rate Limiting

```typescript
// Market creation: 5 per hour per user
const marketCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many markets created. Please try again later."
});

// Market matching: 20 per hour per user
const marketMatchingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many match attempts. Please try again later."
});

// Token verification: 10 per minute per IP
const tokenVerificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many verification requests. Please slow down."
});
```

## Security Considerations

### Wallet Security

1. **Signature Verification**
   - Always verify signatures server-side
   - Use nonces to prevent replay attacks
   - Expire nonces after 5 minutes
   - Include timestamp in signed messages

2. **Session Management**
   - Use secure, httpOnly cookies
   - Implement session expiration (24 hours)
   - Regenerate session on authentication
   - Clear session on logout

### Token-Gating Security

1. **RPC Node Security**
   - Use authenticated RPC endpoints
   - Implement fallback RPC nodes
   - Rate limit RPC calls
   - Cache verification results

2. **Token Verification**
   - Verify token mint address matches configuration
   - Check token account ownership
   - Validate token balance is sufficient
   - Handle edge cases (frozen accounts, closed accounts)

### Financial Security

1. **Balance Management**
   - Use database transactions for all balance changes
   - Implement double-entry accounting
   - Log all financial transactions
   - Prevent negative balances

2. **Payout Security**
   - Verify market resolution before payout
   - Use atomic transactions for payouts
   - Log all payout transactions
   - Implement payout reconciliation

### Input Validation

1. **Market Creation**
   - Sanitize question text (prevent XSS)
   - Validate stake amount bounds
   - Validate resolution date range
   - Limit question length (200 chars)

2. **Market Matching**
   - Verify market exists and is pending
   - Verify user has sufficient balance
   - Prevent self-matching
   - Check for race conditions

## Deployment Considerations

### Environment Variables

```bash
# Token-Gating Configuration
PVP_TOKEN_MINT=<token_mint_address>
PVP_MINIMUM_BALANCE=1
PVP_TOKEN_TYPE=spl-token # or 'nft'
PVP_COLLECTION_ADDRESS=<collection_address> # for NFTs

# Solana RPC Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_RPC_FALLBACK=https://solana-api.projectserum.com

# Platform Fee Configuration
PVP_PLATFORM_FEE_PERCENTAGE=10

# Rate Limiting
PVP_MARKET_CREATION_LIMIT=5
PVP_MARKET_MATCHING_LIMIT=20

# Feature Flags
PVP_MARKETS_ENABLED=true
PVP_TOKEN_GATING_ENABLED=true
```

### Database Migrations

1. Create `pvp_markets` table
2. Create `pvp_participants` table
3. Create `pvp_token_config` table
4. Add indexes
5. Seed initial token configuration

### Monitoring

1. **Metrics to Track**
   - PvP market creation rate
   - Market matching rate
   - Average time to match
   - Resolution success rate
   - Token verification success rate
   - Platform fee revenue

2. **Alerts**
   - Failed token verifications (> 10% failure rate)
   - Failed market resolutions
   - RPC node failures
   - Database connection issues
   - High error rates on PvP endpoints

### Rollout Strategy

1. **Phase 1: Internal Testing**
   - Deploy to staging environment
   - Test with internal users
   - Verify token-gating works correctly
   - Test market resolution

2. **Phase 2: Beta Release**
   - Enable for token holders only
   - Monitor closely for issues
   - Gather user feedback
   - Iterate on UX

3. **Phase 3: Full Release**
   - Announce to all users
   - Monitor performance metrics
   - Scale infrastructure as needed
   - Implement additional features based on feedback

## Future Enhancements

### Phase 2 Features

1. **Multi-Outcome Markets**
   - Support more than 2 outcomes
   - Proportional payouts for ties

2. **Market Templates**
   - Pre-defined market types
   - Quick creation flow

3. **Social Features**
   - Market sharing
   - Challenge specific users
   - Leaderboards for PvP performance

4. **Advanced Token-Gating**
   - Multiple token requirements (AND/OR logic)
   - Tiered access based on token holdings
   - Dynamic token requirements

### Phase 3 Features

1. **Tournament Mode**
   - Bracket-style competitions
   - Entry fees and prize pools
   - Automated bracket management

2. **Market Escrow**
   - On-chain escrow for stakes
   - Trustless resolution
   - Smart contract integration

3. **Advanced Analytics**
   - Market performance tracking
   - User skill ratings (ELO system)
   - Predictive analytics

4. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Mobile wallet integration
