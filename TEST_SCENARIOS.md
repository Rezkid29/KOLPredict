# Comprehensive Test Scenarios

This document outlines all test scenarios for the KOL Predict platform, covering authentication flows, betting operations, AMM calculations, wallet operations, and edge cases.

## Table of Contents
1. [Authentication Test Scenarios](#authentication-test-scenarios)
2. [Betting Flow Test Scenarios](#betting-flow-test-scenarios)
3. [AMM Boundary Conditions](#amm-boundary-conditions)
4. [Wallet Operations](#wallet-operations)
5. [WebSocket & Real-time Updates](#websocket--real-time-updates)
6. [Concurrent Operations](#concurrent-operations)
7. [Error Handling & Edge Cases](#error-handling--edge-cases)

---

## Authentication Test Scenarios

### 1.1 Solana Wallet Authentication - Success Flow
**Test ID**: AUTH-SOL-001  
**Description**: Complete successful Solana wallet authentication

**Prerequisites**:
- Phantom wallet installed
- User has a Solana wallet with funds

**Steps**:
1. Click "Sign In" button
2. Select "Wallet" tab
3. Click "Connect Solana Wallet"
4. Approve connection in Phantom popup
5. Sign authentication message
6. Verify successful authentication

**Expected Results**:
- Nonce is generated and stored
- Wallet connection successful
- Message signature valid
- User created/retrieved from database
- Success toast displayed
- User redirected to main page with username displayed

**Error Codes to Validate**: None (success case)

---

### 1.2 Solana Wallet Authentication - Missing Wallet Extension
**Test ID**: AUTH-SOL-002  
**Description**: Attempt authentication without Solana wallet installed

**Steps**:
1. Uninstall/disable Phantom wallet
2. Click "Sign In" button
3. Select "Wallet" tab
4. Observe wallet detection warning

**Expected Results**:
- Alert displayed: "No Solana wallet detected"
- "Connect Solana Wallet" button disabled
- Link to install Phantom displayed

**Error Codes**: `WALLET_NOT_FOUND`

---

### 1.3 Solana Wallet Authentication - User Cancels Connection
**Test ID**: AUTH-SOL-003  
**Description**: User cancels wallet connection

**Steps**:
1. Click "Connect Solana Wallet"
2. Click "Cancel" in Phantom popup

**Expected Results**:
- Toast: "Connection cancelled"
- No user created
- Modal remains open
- No nonce consumed

**Error Codes**: `USER_CANCELLED` (code 4001)

---

### 1.4 Solana Wallet Authentication - Invalid Signature
**Test ID**: AUTH-SOL-004  
**Description**: Submit invalid or tampered signature

**Test Cases**:
a. **Malformed Base58 Signature**
   - Submit signature with invalid base58 characters
   - Expected: `INVALID_BASE58_SIGNATURE`

b. **Wrong Length Signature**
   - Submit signature with incorrect byte length (not 64 bytes)
   - Expected: `INVALID_SIGNATURE_LENGTH`

c. **Valid Format, Wrong Signature**
   - Submit valid base58 64-byte signature that doesn't match
   - Expected: `SIGNATURE_VERIFICATION_FAILED`

**Manual Test**:
```bash
curl -X POST http://localhost:5000/api/auth/solana/verify \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "ValidSolanaAddress",
    "signature": "InvalidSignature!!!",
    "message": "Sign this message...",
    "nonce": "valid-nonce"
  }'
```

**Expected Response**: 401 with appropriate error code

---

### 1.5 Solana Wallet Authentication - Invalid Public Key
**Test ID**: AUTH-SOL-005  
**Description**: Submit invalid public key formats

**Test Cases**:
a. **Invalid Base58**
   - Submit public key with invalid characters
   - Expected: `INVALID_BASE58_PUBLIC_KEY`

b. **Wrong Length**
   - Submit public key that's not 32 bytes
   - Expected: `INVALID_PUBLIC_KEY_LENGTH`

c. **Whitespace**
   - Submit public key with leading/trailing spaces
   - Expected: `INVALID_PUBLIC_KEY_FORMAT`

---

### 1.6 Solana Wallet Authentication - Expired Nonce
**Test ID**: AUTH-SOL-006  
**Description**: Attempt to use expired nonce

**Steps**:
1. Request nonce
2. Wait 6 minutes (nonce expires after 5 minutes)
3. Attempt to verify with expired nonce

**Expected Results**:
- Error: "Nonce has expired"
- Error code: `NONCE_EXPIRED`
- Nonce deleted from storage

---

### 1.7 Solana Wallet Authentication - Nonce Reuse Prevention
**Test ID**: AUTH-SOL-007  
**Description**: Attempt to reuse same nonce twice

**Steps**:
1. Request nonce
2. Complete successful authentication
3. Attempt to authenticate again with same nonce

**Expected Results**:
- First attempt: Success
- Second attempt: Error "Invalid or expired nonce"
- Error code: `INVALID_NONCE`

---

### 1.8 Solana Wallet Authentication - Message Tampering
**Test ID**: AUTH-SOL-008  
**Description**: Tamper with authentication message

**Test Cases**:
a. **Modified Public Key in Message**
   - Sign message with public key A
   - Submit with public key B in message
   - Expected: `PUBLIC_KEY_MISMATCH`

b. **Modified Nonce in Message**
   - Sign message with nonce A
   - Submit with nonce B
   - Expected: `NONCE_MISMATCH`

c. **Missing Nonce**
   - Message doesn't contain nonce
   - Expected: `NONCE_MISMATCH`

d. **Completely Different Message**
   - Sign different message than expected format
   - Expected: `SIGNATURE_VERIFICATION_FAILED`

---

### 1.9 Solana Wallet Authentication - Rate Limiting
**Test ID**: AUTH-SOL-009  
**Description**: Verify rate limiting on auth endpoints

**Steps**:
1. Make 6 consecutive nonce requests within 1 minute
2. Observe rate limit response on 6th request

**Expected Results**:
- First 5 requests: Success (200)
- 6th request: Error 429
- Message: "Too many authentication attempts"
- Retry-After: 60 seconds

---

### 1.10 Solana Wallet Authentication - Concurrent Nonce Requests
**Test ID**: AUTH-SOL-010  
**Description**: Multiple concurrent nonce requests

**Steps**:
1. Make 3 simultaneous nonce requests
2. Verify all nonces are unique
3. Verify all can be used for authentication

**Expected Results**:
- All 3 nonces generated successfully
- All nonces are unique
- All nonces are valid for 5 minutes
- Each can only be used once

---

### 1.11 Guest Authentication
**Test ID**: AUTH-GUEST-001  
**Description**: Guest sign-in flow

**Steps**:
1. Click "Sign In"
2. Select "Quick" tab
3. Click "Continue as Guest"

**Expected Results**:
- Guest account created with unique username
- Username format: `Guest_<timestamp>`
- Starting balance: 1000 PTS
- isGuest flag: true
- Success toast displayed

---

### 1.12 Username Authentication - Register
**Test ID**: AUTH-USER-001  
**Description**: Register new username account

**Test Cases**:
a. **Valid Username**
   - Enter username ≥ 3 characters
   - Expected: Success, 1000 PTS starting balance

b. **Short Username**
   - Enter username < 3 characters
   - Expected: Error "Username must be at least 3 characters"

c. **Duplicate Username**
   - Register username that already exists
   - Expected: Error "Username already exists"

d. **Empty Username**
   - Submit empty username
   - Expected: Error "Please enter a username"

---

### 1.13 Username Authentication - Login
**Test ID**: AUTH-USER-002  
**Description**: Login with existing username

**Test Cases**:
a. **Existing User**
   - Enter valid existing username
   - Expected: Success, logged in

b. **Non-existent User**
   - Enter username that doesn't exist
   - Expected: Error "User not found. Please register first."

---

### 1.14 Timeout Handling
**Test ID**: AUTH-SOL-011  
**Description**: Wallet operation timeouts

**Test Cases**:
a. **Nonce Request Timeout**
   - Simulate slow network
   - Expected: Timeout after 10 seconds with retry

b. **Wallet Connect Timeout**
   - Don't respond to wallet popup for 30 seconds
   - Expected: Error "Wallet connection timeout"

c. **Signature Request Timeout**
   - Don't sign message for 30 seconds
   - Expected: Error "Signature timeout"

---

## Betting Flow Test Scenarios

### 2.1 Place Bet - Success Flow
**Test ID**: BET-001  
**Description**: Successfully place a bet on a market

**Prerequisites**:
- User authenticated
- User has sufficient balance (≥ bet amount)
- Market exists and is active

**Steps**:
1. Select active market
2. Choose position (YES or NO)
3. Enter valid amount (0.01 - balance)
4. Click "Place Bet"

**Expected Results**:
- Bet created in database
- User balance decreased
- Market pools updated
- Prices recalculated
- Position created/updated
- Success toast displayed
- WebSocket broadcast sent

---

### 2.2 Place Bet - Insufficient Balance
**Test ID**: BET-002  
**Description**: Attempt bet with insufficient balance

**Steps**:
1. User with balance < bet amount
2. Attempt to place bet for amount > balance

**Expected Results**:
- Error: "Insufficient balance"
- No bet created
- No balance changes
- Error toast displayed

---

### 2.3 Place Bet - Market Resolved
**Test ID**: BET-003  
**Description**: Attempt bet on resolved market

**Steps**:
1. Select market with resolved=true
2. Attempt to place bet

**Expected Results**:
- Error: "Market is already resolved"
- No bet created
- 400 status code

---

### 2.4 Place Bet - Market Not Live
**Test ID**: BET-004  
**Description**: Attempt bet on inactive market

**Steps**:
1. Select market with isLive=false
2. Attempt to place bet

**Expected Results**:
- Error: "Market is not currently active"
- No bet created

---

### 2.5 Place Bet - Invalid Amount
**Test ID**: BET-005  
**Description**: Submit invalid bet amounts

**Test Cases**:
a. **Negative Amount**
   - Submit amount = -10
   - Expected: Error "Amount must be at least 0.01"

b. **Zero Amount**
   - Submit amount = 0
   - Expected: Error "Amount must be at least 0.01"

c. **Below Minimum (< 0.01)**
   - Submit amount = 0.001
   - Expected: Error "Amount must be at least 0.01"

d. **Non-numeric**
   - Submit amount = "abc"
   - Expected: Error "Amount must be a valid number"

e. **Infinity**
   - Submit amount = Infinity
   - Expected: Error "Amount must be a finite number"

f. **NaN**
   - Submit amount = NaN
   - Expected: Error "Amount must be a valid number"

---

### 2.6 Place Bet - Invalid Position
**Test ID**: BET-006  
**Description**: Submit invalid position values

**Test Cases**:
a. **Wrong Case**
   - Submit position = "yes" (lowercase)
   - Expected: Error "Position must be exactly 'YES' or 'NO'"

b. **Invalid Value**
   - Submit position = "MAYBE"
   - Expected: Error "Position must be exactly 'YES' or 'NO'"

c. **Empty**
   - Submit position = ""
   - Expected: Error "Valid position is required"

---

### 2.7 Sell Position - Success
**Test ID**: BET-007  
**Description**: Successfully sell existing position

**Prerequisites**:
- User has shares in market
- shares > 0

**Steps**:
1. Select market with existing position
2. Choose "Sell"
3. Enter amount of shares to sell
4. Confirm sale

**Expected Results**:
- Shares decreased
- User balance increased
- Market pools updated
- Position updated/deleted if shares=0

---

### 2.8 Sell Position - Insufficient Shares
**Test ID**: BET-008  
**Description**: Attempt to sell more shares than owned

**Steps**:
1. User owns 10 shares
2. Attempt to sell 15 shares

**Expected Results**:
- Error: "Insufficient shares to sell"
- No changes made

---

## AMM Boundary Conditions

### 3.1 Pool Depletion - Near Zero Pool
**Test ID**: AMM-001  
**Description**: Handle AMM calculations when pool approaches zero

**Test Cases**:
a. **Buy drains NO pool to near-zero**
   - Market state: YES=100, NO=5
   - Buy YES=95 (would make NO < 1)
   - Expected: Error or adjusted amount to keep min pool size

b. **Verify minimum pool maintained**
   - Ensure pools never go below minimum threshold

---

### 3.2 Division by Zero Prevention
**Test ID**: AMM-002  
**Description**: Prevent division by zero in AMM calculations

**Test Cases**:
a. **Zero Total Pool**
   - yesPool=0, noPool=0
   - Expected: Error before calculation

b. **Zero K Constant**
   - k = yesPool * noPool = 0
   - Expected: Error or default initialization

---

### 3.3 Negative Result Prevention
**Test ID**: AMM-003  
**Description**: Ensure AMM never produces negative values

**Test Cases**:
a. **Shares Calculation**
   - Verify calculateSharesForBuy never returns negative
   - Test with extreme pool ratios

b. **Payout Calculation**
   - Verify calculatePayoutForSell never returns negative
   - Test with large sell amounts

---

### 3.4 Price Impact Validation
**Test ID**: AMM-004  
**Description**: Validate price impact calculations

**Test Cases**:
a. **Large Buy Orders**
   - Buy amount = 50% of pool
   - Verify significant price impact (>10%)

b. **Small Buy Orders**
   - Buy amount = 0.1% of pool
   - Verify minimal price impact (<0.5%)

c. **Price Impact Limits**
   - Verify price can't move beyond [0.01, 0.99] range

---

### 3.5 Slippage Protection
**Test ID**: AMM-005  
**Description**: Verify slippage tolerance enforcement

**Test Cases**:
a. **Within Tolerance**
   - Set 5% slippage
   - Price moves 3%
   - Expected: Bet succeeds

b. **Exceeds Tolerance**
   - Set 5% slippage
   - Price moves 7%
   - Expected: Bet rejected with error

c. **No Tolerance Set**
   - slippageTolerance=undefined
   - Expected: Bet proceeds without slippage check

---

### 3.6 Concurrent Bets on Same Market
**Test ID**: AMM-006  
**Description**: Multiple simultaneous bets on same market

**Steps**:
1. Start Transaction A: Buy YES=10 on Market1
2. Start Transaction B: Buy NO=15 on Market1 (before A commits)
3. Commit both transactions

**Expected Results**:
- Row-level locking prevents race conditions
- One transaction completes first
- Second transaction uses updated prices
- Final pool state is consistent
- Both bets recorded correctly

---

### 3.7 Extreme Pool Ratios
**Test ID**: AMM-007  
**Description**: Handle extreme YES/NO pool ratios

**Test Cases**:
a. **Heavily Skewed (95:5 ratio)**
   - Market: YES=950, NO=50
   - Verify prices calculated correctly
   - Verify small trades still work

b. **Maximum Skew (99:1 ratio)**
   - Market: YES=990, NO=10
   - Verify system handles extreme confidence

---

## Wallet Operations

### 4.1 Solana Deposit - Success
**Test ID**: WALLET-001  
**Description**: Successful SOL deposit

**Prerequisites**:
- User has deposit address
- SOL sent to address

**Steps**:
1. User sends SOL to deposit address
2. Wait for transaction confirmation
3. Monitor deposit detection

**Expected Results**:
- Deposit detected via monitor
- Status: pending → confirmed
- User solanaBalance updated
- Transaction recorded
- WebSocket notification sent

---

### 4.2 Solana Deposit - Confirmation Tracking
**Test ID**: WALLET-002  
**Description**: Track deposit confirmations

**Test Cases**:
a. **0 confirmations**: Status=pending
b. **1-9 confirmations**: Status=pending
c. **10+ confirmations**: Status=confirmed, balance updated

---

### 4.3 Solana Withdrawal - Success
**Test ID**: WALLET-003  
**Description**: Successful SOL withdrawal

**Prerequisites**:
- User has sufficient solanaBalance
- Valid destination address

**Steps**:
1. Request withdrawal to valid address
2. Enter amount ≤ balance
3. Confirm withdrawal

**Expected Results**:
- Withdrawal created (status=pending)
- Balance reserved
- Transaction sent to blockchain
- Status updated to confirmed
- Balance deducted

---

### 4.4 Solana Withdrawal - Insufficient Balance
**Test ID**: WALLET-004  
**Description**: Attempt withdrawal with insufficient balance

**Steps**:
1. Balance = 0.5 SOL
2. Request withdrawal of 1.0 SOL

**Expected Results**:
- Error: "Insufficient Solana balance"
- No withdrawal created

---

### 4.5 Solana Withdrawal - Invalid Address
**Test ID**: WALLET-005  
**Description**: Submit invalid withdrawal address

**Test Cases**:
a. **Malformed Address**
   - Invalid base58
   - Expected: Error "Invalid Solana address"

b. **Wrong Length**
   - Not 32 bytes
   - Expected: Error "Invalid address length"

---

## WebSocket & Real-time Updates

### 5.1 WebSocket Connection
**Test ID**: WS-001  
**Description**: Establish WebSocket connection

**Steps**:
1. Load application
2. Verify WebSocket connection established

**Expected Results**:
- Connection to /ws endpoint successful
- Ready to receive broadcasts

---

### 5.2 WebSocket Reconnection
**Test ID**: WS-002  
**Description**: Auto-reconnect after disconnect

**Steps**:
1. Establish connection
2. Simulate network failure
3. Restore network

**Expected Results**:
- Connection detected as lost
- Auto-reconnect attempt
- Connection re-established
- No data loss for queued updates

---

### 5.3 Real-time Bet Updates
**Test ID**: WS-003  
**Description**: Receive real-time bet notifications

**Steps**:
1. User A places bet on Market 1
2. User B viewing Market 1

**Expected Results**:
- User B receives BET_PLACED event
- Market prices update in real-time
- No page refresh needed

---

### 5.4 Real-time Market Resolution
**Test ID**: WS-004  
**Description**: Receive market resolution updates

**Steps**:
1. Admin resolves market
2. Users viewing market

**Expected Results**:
- All users receive MARKET_RESOLVED event
- UI updates to show resolution
- Winning positions highlighted

---

### 5.5 WebSocket Error Handling
**Test ID**: WS-005  
**Description**: Handle WebSocket errors gracefully

**Test Cases**:
a. **Malformed Message**
   - Server sends invalid JSON
   - Expected: Log error, don't crash

b. **Connection Failure**
   - Server unavailable
   - Expected: Show disconnected state, attempt reconnect

c. **Parse Error**
   - Receive unparseable data
   - Expected: Ignore message, continue operating

---

## Concurrent Operations

### 6.1 Concurrent User Creation
**Test ID**: CONCURRENT-001  
**Description**: Multiple users register same username simultaneously

**Steps**:
1. Start registration for "user1" from client A
2. Start registration for "user1" from client B (before A completes)

**Expected Results**:
- First request succeeds
- Second request fails with "Username already exists"
- Only one user created

---

### 6.2 Concurrent Bets with Balance Check
**Test ID**: CONCURRENT-002  
**Description**: Prevent double-spend of user balance

**Setup**:
- User balance = 100 PTS

**Steps**:
1. Place bet A for 100 PTS (don't commit)
2. Place bet B for 100 PTS (before A commits)

**Expected Results**:
- First bet succeeds
- Second bet fails with "Insufficient balance"
- Balance = 0 after first bet

---

### 6.3 Concurrent Market Resolution
**Test ID**: CONCURRENT-003  
**Description**: Prevent double resolution of market

**Steps**:
1. Start resolution of Market 1 to YES
2. Start resolution of Market 1 to NO (before first completes)

**Expected Results**:
- First resolution succeeds
- Second fails with "Market is already resolved"

---

## Error Handling & Edge Cases

### 7.1 Database Connection Failure
**Test ID**: ERROR-001  
**Description**: Handle database unavailability

**Expected Behavior**:
- Error caught and logged
- User-friendly error message
- No crash
- Retry logic for transient failures

---

### 7.2 Request Body Too Large
**Test ID**: ERROR-002  
**Description**: Reject oversized requests

**Steps**:
1. Send request with body > 1MB

**Expected Results**:
- 413 Payload Too Large
- Request rejected before processing

---

### 7.3 Malformed JSON
**Test ID**: ERROR-003  
**Description**: Handle invalid JSON payloads

**Steps**:
1. Send malformed JSON to API endpoint

**Expected Results**:
- 400 Bad Request
- Error: "Invalid JSON"

---

### 7.4 Database Constraint Violations
**Test ID**: ERROR-004  
**Description**: Handle unique constraint violations gracefully

**Test Cases**:
a. **Duplicate Wallet Address**
   - Attempt to create user with existing wallet
   - Expected: User-friendly error, not SQL error

b. **Duplicate Username**
   - Already tested in AUTH-USER-001

---

### 7.5 Transaction Rollback
**Test ID**: ERROR-005  
**Description**: Verify proper transaction rollback on errors

**Scenario**:
- Bet placement fails mid-transaction

**Expected Results**:
- All changes rolled back
- User balance unchanged
- Market pools unchanged
- No partial state

---

### 7.6 Network Timeout
**Test ID**: ERROR-006  
**Description**: Handle network timeouts

**Test Cases**:
a. **Frontend → Backend timeout**
   - Slow API response
   - Expected: Timeout after 15s, retry with backoff

b. **Backend → Database timeout**
   - Slow query
   - Expected: Query timeout, return 500

---

### 7.7 Session Persistence
**Test ID**: SESSION-001  
**Description**: Persist authentication across page refresh

**Steps**:
1. Authenticate successfully
2. Refresh page

**Expected Results**:
- User still authenticated
- userId restored from localStorage
- No re-authentication needed

---

### 7.8 Wallet Disconnection
**Test ID**: SESSION-002  
**Description**: Handle wallet disconnection

**Steps**:
1. Authenticate with Solana wallet
2. Disconnect wallet from extension

**Expected Results**:
- Disconnection detected
- User logged out
- Clear message displayed
- Redirect to auth screen

---

## Test Execution Checklist

### Phase 1: Authentication (Tasks 6-7, 19)
- [ ] All Solana auth success/failure cases
- [ ] Input validation for all auth methods
- [ ] Rate limiting verification
- [ ] Nonce management and expiration
- [ ] Message tampering prevention
- [ ] Guest and username auth flows

### Phase 2: Betting Operations (Tasks 8, 20)
- [ ] Place bet success and error cases
- [ ] Sell position scenarios
- [ ] Input validation for all bet parameters
- [ ] Market state validation

### Phase 3: AMM & Concurrency (Tasks 9, 21)
- [ ] Pool depletion handling
- [ ] Division by zero prevention
- [ ] Slippage protection
- [ ] Concurrent bet placement
- [ ] Row-level locking verification

### Phase 4: Wallet & WebSocket (Tasks 12, 14, 22)
- [ ] Deposit detection and confirmation
- [ ] Withdrawal processing
- [ ] WebSocket connection and reconnection
- [ ] Real-time update delivery
- [ ] Error handling in broadcasts

### Phase 5: Integration & Edge Cases (Task 23)
- [ ] End-to-end user journey
- [ ] Session persistence
- [ ] Wallet disconnection handling
- [ ] All error paths tested
- [ ] Performance under load

---

## Success Criteria

✅ All test scenarios pass  
✅ No unhandled errors in console  
✅ All edge cases handled gracefully  
✅ User-friendly error messages for all failures  
✅ Data integrity maintained under concurrent load  
✅ Security validations prevent all attack vectors  
✅ WebSocket updates delivered reliably  
✅ Transaction rollbacks work correctly  
✅ Rate limiting prevents abuse  
✅ Authentication is secure and robust  
