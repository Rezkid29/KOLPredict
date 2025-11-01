# Requirements Document

## Introduction

This document outlines the requirements for implementing Player vs Player (PvP) markets in the KOL prediction platform. PvP markets allow two users to create custom prediction markets where they each stake Solana tokens, with the winner taking the combined pot minus a platform fee. Access to creating PvP markets is token-gated, requiring users to hold a specific SPL token or NFT.

## Glossary

- **PvP Market**: A prediction market created by one user and matched by another user, where both stake equal amounts of SOL
- **Market Creator**: The user who initiates and funds a PvP market
- **Market Matcher**: The user who accepts and matches the stake of a PvP market
- **Stake Amount**: The amount of SOL each participant contributes to the market
- **Platform Fee**: The percentage of the total pot retained by the platform (10% of total pot)
- **Payout**: The amount distributed to the winner after platform fee deduction
- **Token Gate**: Access control mechanism requiring ownership of a specific SPL token or NFT
- **SPL Token**: Solana Program Library token standard for fungible tokens
- **NFT**: Non-fungible token with supply of 1
- **Wallet Adapter**: Library enabling Solana wallet connections (Phantom, Solflare, etc.)
- **Message Signing**: Cryptographic proof of wallet ownership without transaction cost
- **Token Account**: Solana account holding SPL tokens for a specific wallet
- **Mint Address**: Unique identifier for a specific token type on Solana
- **Market Status**: Current state of a PvP market (pending, matched, active, resolved, cancelled)

## Requirements

### Requirement 1

**User Story:** As a token holder, I want to connect my Solana wallet and prove ownership, so that I can access token-gated features

#### Acceptance Criteria

1. WHEN a user clicks the wallet connect button, THE Platform SHALL display available Solana wallet options (Phantom, Solflare)
2. WHEN a wallet connection is established, THE Platform SHALL request the user to sign a verification message
3. WHEN the user signs the verification message, THE Platform SHALL verify the signature against the public key
4. IF signature verification succeeds, THEN THE Platform SHALL create an authenticated session with a JWT token
5. WHEN authentication is complete, THE Platform SHALL store the session token securely in the client

### Requirement 2

**User Story:** As a platform administrator, I want to verify token ownership for users, so that only authorized users can create PvP markets

#### Acceptance Criteria

1. WHEN a user attempts to access PvP market creation, THE Platform SHALL check the user's wallet for the required token
2. THE Platform SHALL query the user's token accounts using the Solana RPC connection
3. THE Platform SHALL verify the token mint address matches the configured required token
4. THE Platform SHALL verify the token balance meets the minimum required amount (at least 1 token)
5. IF the user does not hold the required token, THEN THE Platform SHALL return a 403 Forbidden response with an appropriate error message

### Requirement 3

**User Story:** As a token holder, I want to create a PvP market with custom parameters, so that I can challenge other users to predictions

#### Acceptance Criteria

1. WHEN a verified token holder accesses PvP market creation, THE Platform SHALL display a market creation form
2. THE Platform SHALL allow the user to specify the market question with a maximum length of 200 characters
3. THE Platform SHALL allow the user to define two outcome options (e.g., "Yes" and "No")
4. THE Platform SHALL allow the user to set a stake amount between 0.1 SOL and 10 SOL
5. THE Platform SHALL allow the user to set a resolution date between 1 hour and 30 days in the future
6. WHEN the user submits the market creation form, THE Platform SHALL validate all input parameters
7. WHEN validation passes, THE Platform SHALL deduct the stake amount from the user's platform balance
8. WHEN the stake is deducted, THE Platform SHALL create a new PvP market record with status "pending"

### Requirement 4

**User Story:** As a user, I want to browse available PvP markets, so that I can find markets to match

#### Acceptance Criteria

1. THE Platform SHALL display a list of all pending PvP markets
2. THE Platform SHALL show the market question, stake amount, creator username, and time remaining for each market
3. THE Platform SHALL allow users to filter markets by stake amount range
4. THE Platform SHALL allow users to sort markets by creation date or stake amount
5. WHEN a user clicks on a market, THE Platform SHALL display full market details including both outcome options

### Requirement 5

**User Story:** As a user, I want to match an existing PvP market, so that I can participate in the prediction

#### Acceptance Criteria

1. WHEN a user views a pending PvP market, THE Platform SHALL display a "Match Market" button
2. WHEN the user clicks "Match Market", THE Platform SHALL verify the user has sufficient balance
3. THE Platform SHALL prevent the market creator from matching their own market
4. WHEN the user confirms the match, THE Platform SHALL deduct the stake amount from their balance
5. WHEN the stake is deducted, THE Platform SHALL update the market status to "matched"
6. WHEN the market is matched, THE Platform SHALL randomly assign each participant to one of the two outcomes

### Requirement 6

**User Story:** As a market participant, I want the market to resolve automatically, so that I receive my winnings fairly

#### Acceptance Criteria

1. WHEN the resolution date is reached, THE Platform SHALL fetch the actual outcome data
2. THE Platform SHALL determine which outcome occurred based on the market's resolution criteria
3. THE Platform SHALL identify the winning participant based on their assigned outcome
4. THE Platform SHALL calculate the total pot as (stake amount × 2)
5. THE Platform SHALL calculate the platform fee as (total pot × 0.10)
6. THE Platform SHALL calculate the winner payout as (total pot - platform fee)
7. WHEN calculations are complete, THE Platform SHALL credit the winner's balance with the payout amount
8. WHEN the payout is credited, THE Platform SHALL update the market status to "resolved"

### Requirement 7

**User Story:** As a market creator, I want to cancel my unmatched market, so that I can recover my stake if no one matches it

#### Acceptance Criteria

1. WHILE a PvP market has status "pending", THE Platform SHALL display a "Cancel Market" button to the creator
2. WHEN the creator clicks "Cancel Market", THE Platform SHALL prompt for confirmation
3. WHEN the creator confirms cancellation, THE Platform SHALL refund the full stake amount to the creator's balance
4. WHEN the refund is complete, THE Platform SHALL update the market status to "cancelled"
5. THE Platform SHALL prevent cancellation if the market status is not "pending"

### Requirement 8

**User Story:** As a user, I want to see my PvP market history, so that I can track my performance

#### Acceptance Criteria

1. THE Platform SHALL display a list of all PvP markets the user has participated in
2. THE Platform SHALL show the market question, stake amount, outcome, and result (win/loss) for each market
3. THE Platform SHALL calculate and display total PvP winnings and losses
4. THE Platform SHALL calculate and display the user's PvP win rate percentage
5. THE Platform SHALL allow users to filter their history by status (active, won, lost, cancelled)

### Requirement 9

**User Story:** As a platform administrator, I want to configure token-gating parameters, so that I can control access to PvP markets

#### Acceptance Criteria

1. THE Platform SHALL store the required token mint address in environment configuration
2. THE Platform SHALL store the minimum required token balance in environment configuration
3. THE Platform SHALL allow configuration of whether to check for SPL tokens or NFTs
4. THE Platform SHALL allow configuration of the platform fee percentage
5. THE Platform SHALL allow configuration of minimum and maximum stake amounts

### Requirement 10

**User Story:** As a user, I want to receive notifications about my PvP markets, so that I stay informed of important events

#### Acceptance Criteria

1. WHEN a user's PvP market is matched, THE Platform SHALL send a notification to the creator
2. WHEN a PvP market is resolved, THE Platform SHALL send notifications to both participants
3. WHEN a user wins a PvP market, THE Platform SHALL include the payout amount in the notification
4. THE Platform SHALL display notifications in the user's notification center
5. THE Platform SHALL send real-time notifications via WebSocket if the user is online
