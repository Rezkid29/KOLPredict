# Requirements Document

## Introduction

This spec addresses critical production deployment issues for Railway platform. The system currently has database constraint violations, WebSocket connection errors, missing UI components, and Puppeteer/Playwright initialization failures that prevent successful deployment and operation on Railway.

## Glossary

- **Railway Platform**: Cloud deployment platform for hosting the application
- **Neon Database**: PostgreSQL database service used by the application
- **WebSocket Server**: Real-time communication server for live updates
- **Puppeteer/Playwright**: Browser automation tools for web scraping
- **AMM System**: Automated Market Maker for prediction market pricing
- **Forum System**: User discussion and voting platform component
- **Alert Dialog Components**: UI components from Radix UI library for user interactions

## Requirements

### Requirement 1: Database Schema Integrity

**User Story:** As a platform operator, I want all database operations to succeed without constraint violations, so that users can interact with the forum and betting features without errors.

#### Acceptance Criteria

1. WHEN a user votes on a forum thread, THE System SHALL validate that vote_type is not null before inserting into forum_thread_votes table
2. WHEN a user votes on a forum comment, THE System SHALL validate that vote_type is not null before inserting into forum_comment_votes table
3. WHEN a bet is placed, THE System SHALL validate numeric fields do not exceed PostgreSQL numeric type limits
4. WHEN numeric calculations are performed, THE System SHALL ensure results fit within decimal(20,9) precision limits
5. THE System SHALL log detailed error information when database constraint violations occur

### Requirement 2: WebSocket Connection Stability

**User Story:** As a user, I want real-time updates to work reliably on Railway, so that I can see live market changes and notifications without connection errors.

#### Acceptance Criteria

1. WHEN the server starts on Railway, THE System SHALL configure WebSocket server with proper keep-alive timeouts
2. WHEN a WebSocket connection is established, THE System SHALL handle connection errors gracefully without crashing
3. WHEN broadcasting messages to clients, THE System SHALL skip disconnected clients without throwing errors
4. WHEN Railway's proxy forwards requests, THE System SHALL correctly identify client IP addresses using trust proxy settings
5. THE System SHALL log WebSocket connection and disconnection events for monitoring

### Requirement 3: UI Component Completeness

**User Story:** As a user, I want all UI components to render correctly, so that I can interact with messages and forum features without encountering undefined component errors.

#### Acceptance Criteria

1. WHEN the Messages page loads, THE System SHALL import all required AlertDialog components from Radix UI
2. WHEN the Forum page loads, THE System SHALL render without ReferenceError exceptions
3. WHEN AlertDialog components are used, THE System SHALL include AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, and AlertDialogAction
4. THE System SHALL verify all UI component imports are complete before deployment
5. THE System SHALL display user-friendly error messages if components fail to load

### Requirement 4: Browser Automation Initialization

**User Story:** As a system administrator, I want Puppeteer and Playwright to initialize successfully on Railway, so that KOL data scraping works in production.

#### Acceptance Criteria

1. WHEN the server starts on Railway, THE System SHALL defer Puppeteer initialization until after the HTTP server is listening
2. WHEN Chromium is not available in the Railway environment, THE System SHALL use Playwright's bundled browser instead
3. WHEN browser initialization fails, THE System SHALL log detailed error information and continue serving API routes
4. WHEN scraping is triggered, THE System SHALL check if browser is initialized before attempting to scrape
5. THE System SHALL provide fallback mechanisms if browser automation is unavailable

### Requirement 5: Railway Environment Configuration

**User Story:** As a DevOps engineer, I want the application to configure itself correctly for Railway's environment, so that deployment succeeds without manual intervention.

#### Acceptance Criteria

1. WHEN deployed to Railway, THE System SHALL bind to 0.0.0.0 instead of localhost
2. WHEN the PORT environment variable is set, THE System SHALL use that port for the HTTP server
3. WHEN Railway's health checks run, THE System SHALL respond to /healthz endpoint within 2 seconds
4. WHEN the server starts, THE System SHALL set keep-alive timeout to 65 seconds to prevent Railway connection timeouts
5. THE System SHALL set headers timeout to 66 seconds to allow proper keep-alive handling

### Requirement 6: Market Resolution Data Integrity

**User Story:** As a platform operator, I want market resolution to use accurate, fresh data, so that bet settlements are fair and based on current KOL metrics.

#### Acceptance Criteria

1. WHEN a market is being resolved, THE System SHALL scrape fresh KOL data on-demand rather than using stale cached data
2. WHEN scraped data is unavailable, THE System SHALL cancel the market and refund all bets
3. WHEN parsing scraped data, THE System SHALL use numeric types instead of string parsing
4. WHEN market resolution fails, THE System SHALL set market status to "cancelled" and log the reason
5. THE System SHALL wrap bet settlement in a database transaction to prevent partial settlements

### Requirement 7: Error Handling and Logging

**User Story:** As a developer, I want comprehensive error logging, so that I can diagnose and fix production issues quickly.

#### Acceptance Criteria

1. WHEN any database error occurs, THE System SHALL log the full error stack trace
2. WHEN WebSocket errors occur, THE System SHALL log client connection details
3. WHEN browser automation fails, THE System SHALL log the specific initialization error
4. WHEN API requests fail, THE System SHALL return structured error responses with error codes
5. THE System SHALL include request IDs in logs for tracing user actions

### Requirement 8: Numeric Field Overflow Prevention

**User Story:** As a user, I want to place bets without encountering numeric overflow errors, so that I can trade on markets reliably.

#### Acceptance Criteria

1. WHEN calculating AMM prices, THE System SHALL validate that results fit within decimal(20,9) precision
2. WHEN updating pool values, THE System SHALL check for numeric overflow before database writes
3. WHEN bet amounts exceed safe limits, THE System SHALL reject the bet with a clear error message
4. WHEN shares are calculated, THE System SHALL round to 2 decimal places to prevent precision errors
5. THE System SHALL validate all numeric inputs are finite and non-NaN before processing
