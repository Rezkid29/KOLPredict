# Implementation Plan

- [ ] 1. Fix static asset serving path mismatch
  - Update Vite configuration to output to dist/public directory
  - Update Express static serving to read from dist/public
  - Add existence checks and error logging for missing static files
  - Test build output location matches serving location
  - _Requirements: 9.1, 9.2_

- [ ] 2. Fix health check endpoint timing
  - Move /healthz endpoint before any async initialization
  - Ensure health check returns 200 OK immediately
  - Add server readiness logging
  - Set Railway-compatible keep-alive and headers timeouts
  - _Requirements: 5.3, 5.4, 5.5, 9.3_

- [ ] 3. Implement database validation layer
- [ ] 3.1 Create validation functions for forum votes
  - Write validateVote function to check vote_type is not null
  - Normalize vote_type to 'up' or 'down'
  - Return validation result with error messages
  - _Requirements: 1.1, 1.2_

- [ ] 3.2 Create validation functions for numeric fields
  - Write validateNumericField to check decimal(20,9) precision limits
  - Validate numbers are finite and non-NaN
  - Return formatted string value within precision limits
  - _Requirements: 1.3, 1.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 3.3 Apply validation to forum voting endpoints
  - Add validation to POST /api/forum/threads/:threadId/vote
  - Add validation to POST /api/forum/comments/:commentId/vote
  - Return 400 error with clear message if validation fails
  - Log validation errors for debugging
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 3.4 Apply validation to bet placement endpoints
  - Add numeric validation to POST /api/bets
  - Add numeric validation to POST /api/bets/preview
  - Validate bet amounts before AMM calculations
  - Validate pool updates before database writes
  - _Requirements: 1.3, 1.4, 8.1, 8.2, 8.3_

- [ ] 4. Enhance WebSocket error handling
  - Wrap broadcast function in try-catch blocks
  - Handle individual client send errors without crashing
  - Add error event handlers to WebSocket server
  - Add error event handlers to individual client connections
  - Log WebSocket errors with connection details
  - _Requirements: 2.2, 2.3, 2.5_

- [ ] 5. Fix browser automation initialization
- [ ] 5.1 Defer Puppeteer initialization
  - Move Puppeteer initialization to startBackgroundServices function
  - Add 2-second delay before initializing browser
  - Wrap initialization in try-catch to handle failures gracefully
  - Log browser initialization status
  - _Requirements: 4.1, 4.3, 4.4, 9.6, 9.10_

- [ ] 5.2 Implement lazy browser instance management
  - Create getBrowser function for on-demand initialization
  - Implement browser idle timeout to close after 5 minutes
  - Add memory cleanup when browser closes
  - Use Playwright's bundled browser as fallback
  - _Requirements: 4.2, 4.5, 9.5_

- [ ] 6. Fix UI component imports
  - Add missing AlertDialog imports to messages.tsx
  - Add missing AlertDialog imports to any other pages using dialogs
  - Verify all Radix UI components are properly imported
  - Test dialog functionality in development
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. Improve database migration handling
  - Add DATABASE_URL validation before migrations
  - Add migration timeout (30 seconds)
  - Improve migration error logging with stack traces
  - Add migration status logging
  - Handle migration failures gracefully
  - _Requirements: 5.8, 7.1, 7.7, 9.4_

- [ ] 8. Optimize memory usage for Railway
- [ ] 8.1 Implement deferred background service startup
  - Move all background service initialization to startBackgroundServices
  - Call startBackgroundServices after server is listening
  - Add 1-second delay before starting services
  - Log each service startup
  - _Requirements: 9.5, 9.10_

- [ ] 8.2 Configure database connection pooling
  - Set max connections to 10
  - Set idle timeout to 30 seconds
  - Set connection timeout to 2 seconds
  - Log pool statistics
  - _Requirements: 5.8_

- [ ] 8.3 Add memory monitoring
  - Log memory usage on server startup
  - Log memory usage after background services start
  - Add warning if memory exceeds 400 MB
  - _Requirements: 9.5_

- [ ] 9. Add Railway-specific logging and diagnostics
  - Log server binding address and port
  - Log static asset serving path
  - Log database connection status
  - Log WebSocket server status
  - Add diagnostic endpoint GET /api/diagnostics
  - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.8, 9.7, 9.9_

- [ ] 10. Update build configuration
  - Update vite.config.ts to output to dist/public
  - Verify package.json build script
  - Test build process locally
  - Verify dist/public contains index.html and assets
  - _Requirements: 9.1_

- [ ] 11. Add deployment documentation
  - Create Railway deployment checklist
  - Document environment variables required
  - Document troubleshooting steps for common issues
  - Add Railway CLI commands for debugging
  - _Requirements: 9.8_

- [ ] 12. Implement market resolution improvements
- [ ] 12.1 Add on-demand scraping for market resolution
  - Trigger fresh scrape when resolving markets
  - Use scraped data directly instead of cached data
  - Handle scraping failures by cancelling market
  - _Requirements: 6.1, 6.2_

- [ ] 12.2 Wrap bet settlement in transaction
  - Use database transaction for settleBetsTransactional
  - Add row-level locking for all bets in market
  - Add row-level locking for all affected users
  - Ensure all bets settle or none settle
  - _Requirements: 6.5_

- [ ] 12.3 Implement market cancellation on errors
  - Cancel market if scraping fails
  - Cancel market if data is stale
  - Refund all bets when market is cancelled
  - Log cancellation reason
  - _Requirements: 6.2, 6.4_
