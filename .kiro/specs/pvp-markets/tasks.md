# Implementation Plan: PvP Markets with Token-Gating

## Task List

- [ ] 1. Set up database schema and migrations
  - Create migration file for `pvp_markets` table with all required columns and constraints
  - Create migration file for `pvp_participants` table with foreign key relationships
  - Create migration file for `pvp_token_config` table for token-gating configuration
  - Add necessary indexes for query optimization (status, creator_id, user_id, resolution_date)
  - Run migrations and verify schema creation
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1_

- [ ] 2. Extend database schema types in shared/schema.ts
  - Define `pvpMarkets` table schema using Drizzle ORM
  - Define `pvpParticipants` table schema with relationships
  - Define `pvpTokenConfig` table schema
  - Create insert schemas with Zod validation
  - Export TypeScript types for PvPMarket, PvPParticipant, PvPTokenConfig
  - Create composite types (PvPMarketWithParticipants, PvPMarketHistory, PvPMarketStats)
  - _Requirements: 3.1, 3.2, 3.3, 8.3, 8.4_

- [ ] 3. Implement token verification service
  - [ ] 3.1 Create server/token-verification-service.ts
    - Implement TokenVerificationService class with Solana connection
    - Add method to verify SPL token ownership using getTokenAccountsByOwner
    - Add method to verify NFT ownership (check for token with supply of 1)
    - Add method to get token balance for a specific mint
    - Implement in-memory caching for verification results (5-minute TTL)
    - Add comprehensive error handling for RPC failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 3.2 Write unit tests for token verification
    - Test SPL token verification with valid token holder
    - Test SPL token verification with insufficient balance
    - Test NFT verification with valid NFT holder
    - Test error handling for invalid wallet addresses
    - Test caching behavior
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Create token-gating middleware
  - Create server/token-gating-middleware.ts
  - Implement createTokenGatingMiddleware factory function
  - Load token configuration from environment variables or database
  - Call TokenVerificationService to check user's wallet
  - Return 403 Forbidden if user doesn't have required token
  - Add detailed error messages for different failure scenarios
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2, 9.3_

- [ ] 5. Extend database storage layer for PvP markets
  - [ ] 5.1 Add PvP market CRUD operations to server/db-storage.ts
    - Add createPvPMarket method with transaction support
    - Add getPvPMarket method with participant joins
    - Add getAvailablePvPMarkets method with filtering and sorting
    - Add matchPvPMarket method with atomic balance updates
    - Add cancelPvPMarket method with refund logic
    - Add resolvePvPMarket method with payout distribution
    - _Requirements: 3.7, 3.8, 4.1, 4.2, 5.4, 5.5, 6.7, 6.8, 7.3, 7.4_
  - [ ] 5.2 Add PvP participant operations
    - Add createPvPParticipant method
    - Add getPvPParticipantsByMarket method
    - Add getPvPParticipantsByUser method
    - Add updatePvPParticipant method for resolution
    - _Requirements: 5.5, 5.6, 8.1, 8.2_
  - [ ] 5.3 Add PvP statistics and history queries
    - Add getUserPvPHistory method with pagination
    - Add getUserPvPStats method (total wins, losses, winnings, win rate)
    - Add getPvPMarketsByStatus method for resolver
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 6. Implement PvP market service layer
  - [ ] 6.1 Create server/pvp-market-service.ts
    - Implement PvPMarketService class
    - Add createMarket method with validation and balance deduction
    - Add matchMarket method with self-match prevention
    - Add cancelMarket method with authorization check
    - Add getAvailableMarkets method with filters
    - Add getUserMarketHistory method
    - Add getUserStats method
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 6.2 Write unit tests for PvP market service
    - Test market creation with valid parameters
    - Test market creation with insufficient balance
    - Test market matching by different user
    - Test self-match prevention
    - Test market cancellation by creator
    - Test unauthorized cancellation attempt
    - _Requirements: 3.1, 3.7, 5.1, 5.3, 7.1, 7.5_

- [ ] 7. Implement PvP market resolver
  - [ ] 7.1 Create server/pvp-market-resolver.ts
    - Implement PvPMarketResolver class
    - Add resolveMarket method with payout calculation (90/10 split)
    - Add checkPendingResolutions method to find markets ready to resolve
    - Add calculatePayout helper method
    - Integrate with notification service for winner/loser notifications
    - Add transaction logging for all payouts
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 10.2, 10.3_
  - [ ]* 7.2 Write unit tests for market resolver
    - Test payout calculation (0.2 SOL stake = 0.38 SOL payout, 0.02 SOL fee)
    - Test market resolution with outcome A winning
    - Test market resolution with outcome B winning
    - Test notification triggering
    - _Requirements: 6.4, 6.5, 6.6, 6.7_

- [ ] 8. Add PvP market API routes
  - [ ] 8.1 Add routes to server/routes.ts
    - Add POST /api/pvp/markets (create market, token-gated)
    - Add GET /api/pvp/markets/available (list available markets)
    - Add GET /api/pvp/markets/:marketId (get market details)
    - Add POST /api/pvp/markets/:marketId/match (match market)
    - Add POST /api/pvp/markets/:marketId/cancel (cancel market)
    - Add GET /api/pvp/markets/history (user's market history)
    - Add GET /api/pvp/stats (user's PvP statistics)
    - Add GET /api/pvp/eligibility (check token-gating eligibility)
    - _Requirements: 3.1, 3.2, 3.6, 4.1, 4.5, 5.1, 5.2, 7.1, 8.1, 8.5_
  - [ ] 8.2 Add input validation for all routes
    - Validate market creation parameters (question length, stake bounds, date range)
    - Validate market ID format
    - Validate filter parameters
    - Add rate limiting for market creation (5 per hour)
    - Add rate limiting for market matching (20 per hour)
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 4.3, 4.4, 9.4, 9.5_
  - [ ] 8.3 Add WebSocket broadcast for real-time updates
    - Broadcast market creation to all connected clients
    - Broadcast market matching to relevant clients
    - Broadcast market resolution to participants
    - _Requirements: 10.1, 10.2, 10.5_
  - [ ]* 8.4 Write integration tests for API routes
    - Test complete market creation flow with token-gating
    - Test market matching flow
    - Test market cancellation flow
    - Test unauthorized access attempts
    - Test rate limiting enforcement
    - _Requirements: 2.1, 3.1, 5.1, 7.1_

- [ ] 9. Create frontend wallet integration
  - [ ] 9.1 Set up Solana Wallet Adapter in client/src/App.tsx
    - Install @solana/wallet-adapter-react and related packages
    - Wrap app with ConnectionProvider and WalletProvider
    - Configure supported wallets (Phantom, Solflare)
    - Set network to mainnet-beta (or devnet for testing)
    - _Requirements: 1.1, 1.2_
  - [ ] 9.2 Create wallet authentication hook
    - Create client/src/hooks/use-wallet-auth.ts
    - Implement wallet connection logic
    - Implement message signing for authentication
    - Handle authentication errors
    - Store authentication state
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ] 10. Build PvP market creation UI
  - [ ] 10.1 Create PvP market creation modal component
    - Create client/src/components/pvp-market-creation-modal.tsx
    - Build form with question, outcomes, stake amount, resolution date inputs
    - Add validation for all inputs (question length, stake bounds, date range)
    - Implement form submission with API call
    - Show loading state during creation
    - Display success/error messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ] 10.2 Add token-gating check before showing modal
    - Call /api/pvp/eligibility endpoint
    - Show "Token Required" message if user doesn't have token
    - Display token requirements and where to acquire token
    - Only show creation button if user is eligible
    - _Requirements: 2.1, 2.5_

- [ ] 11. Build PvP market browser UI
  - [ ] 11.1 Create market browser component
    - Create client/src/components/pvp-market-browser.tsx
    - Fetch available markets from API
    - Display markets in grid or list view
    - Show market question, stake amount, creator, time remaining
    - Implement real-time updates via WebSocket
    - _Requirements: 4.1, 4.2_
  - [ ] 11.2 Add filtering and sorting controls
    - Add stake amount range filter
    - Add sort by creation date, stake amount, resolution date
    - Add sort order toggle (ascending/descending)
    - Update URL query parameters for shareable filters
    - _Requirements: 4.3, 4.4_
  - [ ] 11.3 Create market card component
    - Create client/src/components/pvp-market-card.tsx
    - Display market details in card format
    - Show "Match Market" button for available markets
    - Show "Cancel Market" button for own pending markets
    - Disable match button if insufficient balance
    - _Requirements: 4.2, 5.1, 7.1_

- [ ] 12. Build market matching UI
  - [ ] 12.1 Create market details modal
    - Create client/src/components/pvp-market-details-modal.tsx
    - Show full market information
    - Display both outcome options
    - Show resolution criteria
    - Display creator information
    - _Requirements: 4.5, 5.1_
  - [ ] 12.2 Implement match confirmation flow
    - Show confirmation dialog with stake amount
    - Display potential payout (90% of total pot)
    - Check user balance before allowing match
    - Call match API endpoint
    - Show success message and redirect to market history
    - _Requirements: 5.2, 5.4, 5.5, 5.6_

- [ ] 13. Build PvP market history UI
  - [ ] 13.1 Create market history page
    - Create client/src/pages/pvp-history.tsx
    - Fetch user's market history from API
    - Display markets in chronological order
    - Show market status (active, won, lost, cancelled)
    - Implement pagination for large histories
    - _Requirements: 8.1, 8.2, 8.5_
  - [ ] 13.2 Create statistics dashboard
    - Display total markets participated in
    - Show total wins and losses
    - Calculate and display win rate percentage
    - Show total amount staked
    - Show total winnings
    - Display charts for performance over time
    - _Requirements: 8.3, 8.4_
  - [ ] 13.3 Add filtering for history
    - Filter by status (active, won, lost, cancelled)
    - Filter by date range
    - Search by market question
    - _Requirements: 8.5_

- [ ] 14. Implement notification system for PvP markets
  - [ ] 14.1 Extend notification service
    - Add PvP-specific notification types to server/db-storage.ts
    - Create notification for market matched
    - Create notification for market resolved (winner)
    - Create notification for market resolved (loser)
    - Include payout amount in winner notification
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [ ] 14.2 Add WebSocket notification delivery
    - Send real-time notifications to online users
    - Queue notifications for offline users
    - Mark notifications as read when viewed
    - _Requirements: 10.5_

- [ ] 15. Add scheduled market resolution
  - [ ] 15.1 Integrate with existing scheduler
    - Add PvP market resolution job to server/scheduler.ts
    - Run every 5 minutes to check for markets ready to resolve
    - Call PvPMarketResolver.checkPendingResolutions
    - Log resolution results
    - _Requirements: 6.1, 6.2_
  - [ ] 15.2 Add manual resolution endpoint for admin
    - Create POST /api/admin/pvp/markets/:marketId/resolve
    - Require admin authentication
    - Allow manual outcome selection
    - Log manual resolutions separately
    - _Requirements: 6.1, 6.3_

- [ ] 16. Add environment configuration
  - Add PVP_TOKEN_MINT to .env
  - Add PVP_MINIMUM_BALANCE to .env
  - Add PVP_TOKEN_TYPE to .env (spl-token or nft)
  - Add PVP_COLLECTION_ADDRESS to .env (for NFT gating)
  - Add PVP_PLATFORM_FEE_PERCENTAGE to .env
  - Add PVP_MARKETS_ENABLED feature flag to .env
  - Document all environment variables in README
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 17. Add navigation and routing
  - Add "PvP Markets" link to main navigation
  - Create route for /pvp/markets (browser)
  - Create route for /pvp/history (user history)
  - Add conditional rendering based on token ownership
  - Show "Get Access Token" CTA if user doesn't have token
  - _Requirements: 2.5, 3.1, 4.1, 8.1_

- [ ] 18. Add error handling and user feedback
  - Display user-friendly error messages for all failure scenarios
  - Show loading states during API calls
  - Add toast notifications for success/error events
  - Handle WebSocket disconnection gracefully
  - Add retry logic for failed API calls
  - _Requirements: 2.5, 3.6, 5.2, 7.2_

- [ ] 19. Add analytics and monitoring
  - Track PvP market creation events
  - Track market matching events
  - Track market resolution events
  - Monitor token verification success rate
  - Log platform fee revenue from PvP markets
  - Add dashboard for admin to view PvP metrics
  - _Requirements: 6.7, 9.4_

- [ ]* 20. End-to-end testing
  - Test complete user journey: connect wallet → verify token → create market → match market → resolve market
  - Test token-gating enforcement
  - Test self-match prevention
  - Test balance management (deductions and payouts)
  - Test WebSocket real-time updates
  - Test notification delivery
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.7, 5.1, 5.5, 6.1, 6.7, 10.1, 10.2, 10.5_

## Implementation Notes

### Execution Order
Tasks should be executed in the order listed, as later tasks depend on earlier ones. The database schema (tasks 1-2) must be completed before any service layer work. The service layer (tasks 3-7) must be completed before API routes (task 8). Frontend work (tasks 9-13) can begin once API routes are functional.

### Testing Strategy
Optional test tasks (marked with *) focus on core functionality validation. While optional, they are recommended for production deployments to ensure system reliability.

### Token-Gating Implementation
The token-gating system is designed to be flexible. Initially implement SPL token verification, then extend to NFT verification if needed. The middleware should gracefully handle RPC failures and provide clear error messages to users.

### Financial Transactions
All balance changes must use database transactions to ensure atomicity. The payout calculation (90/10 split) should be implemented as a pure function with comprehensive unit tests to prevent calculation errors.

### Real-Time Updates
WebSocket broadcasts should be non-blocking and handle client disconnections gracefully. Consider implementing a message queue for high-traffic scenarios.

### Security Considerations
- Always verify token ownership server-side (never trust client)
- Use rate limiting on all PvP endpoints
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Implement CSRF protection for state-changing operations

### Performance Optimization
- Cache token verification results for 5 minutes
- Use database indexes for all query filters
- Implement pagination for large result sets
- Consider read replicas for high-traffic deployments

### Deployment Checklist
1. Run database migrations
2. Configure environment variables
3. Seed initial token configuration
4. Test token verification with real wallets
5. Enable feature flag (PVP_MARKETS_ENABLED=true)
6. Monitor error rates and performance metrics
7. Set up alerts for critical failures
