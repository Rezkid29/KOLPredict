# AMM System Analysis: Current vs. Proposed

## Current Implementation Issues

### Problem Identified
When placing a bet, the relationship between **cost**, **shares**, and **price** is not intuitive:
- **Expected**: Buying 39.99 shares at $0.5108 should cost ≈ 39.99 × 0.5108 = **$20.43**
- **Actual**: System charges **$68.00**

This violates the core Polymarket/Kalshi principle: **Cost ≈ Shares × Price**

## Current AMM Implementation

### Formula Analysis
```typescript
// Current: calculateSharesForBuy when buying YES
k = yesPool * noPool  // Constant product
newNoPool = k / (yesPool + betAmount)
sharesReceived = noPool - newNoPool

// Pool updates
newYesPool = yesPool + betAmount  // Add dollars to YES pool
newNoPool = noPool - sharesReceived  // Remove shares from NO pool
```

### The Issue
The current system treats:
- **betAmount** = dollars user pays (e.g., $68)
- **yesPool/noPool** = dollar liquidity pools
- Adds dollars to one pool, removes shares from the other (mixing units!)

## Proposed Polymarket-Style CPMM

### Core Principles
1. **Price = Probability**: Price(YES) + Price(NO) = $1.00 always
2. **Shares resolve to $1 or $0**: Winning shares pay $1 each
3. **Intuitive cost**: Buying 10 shares at $0.60 costs ≈ $6.00
4. **Pools = Share Inventory**: yesPool and noPool represent available shares

### Correct Formulas

#### Price Calculation
```typescript
Price(YES) = noPool / (yesPool + noPool)
Price(NO) = yesPool / (yesPool + noPool)
// Always sums to 1.0
```

#### Buying YES Shares
When user wants to buy `x` YES shares:

```typescript
k = yesPool * noPool  // Constant product
newYesPool = yesPool - x  // Remove x YES shares from inventory
newNoPool = k / newYesPool  // Maintain constant product
noSharesDeposited = newNoPool - noPool  // NO shares deposited
cost = noSharesDeposited  // In dollars (each share worth ~$1 total)
```

**Key insight**: User deposits NO shares (liquidity) and withdraws YES shares (position)

#### Selling YES Shares  
When user wants to sell `x` YES shares:

```typescript
k = yesPool * noPool
newYesPool = yesPool + x  // Return x YES shares to inventory  
newNoPool = k / newYesPool  // Maintain constant product
noSharesWithdrawn = noPool - newNoPool  // NO shares withdrawn
payout = noSharesWithdrawn  // In dollars
```

## Implementation Strategy

### What Changes
1. **AMM Functions**: Rewrite buy/sell to use share inventory semantics
2. **Pool Updates**: Update pools based on share movements, not dollar amounts
3. **Cost Calculation**: Ensure cost ≈ shares × average_price
4. **User Experience**: Display shows intuitive relationship

### What Stays the Same
1. **Database Schema**: yesPool/noPool columns unchanged (just semantics)
2. **Seed Data**: Still use 10,000 per pool (now means 10k shares)
3. **Settlement**: Already correct (pays $1 per winning share)
4. **Constant Product**: Still using k = yesPool × noPool

## Expected Behavior After Fix

### Example Trade
- **Market**: 50/50 odds (yesPool = 10,000, noPool = 10,000)
- **Current Price**: Price(YES) = 10,000/(10,000+10,000) = 0.50
- **User Action**: Buy 100 YES shares

**Calculation**:
```
k = 10,000 × 10,000 = 100,000,000
newYesPool = 10,000 - 100 = 9,900
newNoPool = 100,000,000 / 9,900 = 10,101.01
noDeposited = 10,101.01 - 10,000 = 101.01
cost = $101.01
average price = 101.01 / 100 = $1.01 per share
```

**Why higher than $0.50?**: Price impact! As you buy YES, price moves from $0.50 toward $0.505.
This is correct CPMM behavior - large trades have price impact.

### For Small Trades
For very small trades relative to pool size, cost ≈ shares × price:
- Buy 1 YES share at $0.50 → costs ≈ $0.50 (tiny slippage)
- Buy 100 YES shares at $0.50 → costs ≈ $51 (1% slippage)
- Buy 1000 YES shares at $0.50 → costs ≈ $526 (5% slippage)

## Migration Notes

### No Database Migration Needed
- yesPool/noPool values stay the same
- Interpretation changes from "dollars" to "shares"
- Since initial pools are 10,000 each, semantics align

### Testing Requirements
1. Verify cost ≈ shares × price for small trades
2. Verify Price(YES) + Price(NO) = 1.0
3. Verify slippage increases with trade size
4. Verify settlement pays $1 per winning share
5. Verify profit = payout - cost is correct
