
# Price Impact & Slippage Protection - Code Backup

**Purpose**: This file contains the original price impact and slippage protection code that was temporarily removed while the platform operates on a points-only system. These protections should be **reinstated when real cryptocurrency (Solana) trading is enabled**.

---

## Why This Code Was Removed

With the current point system and small pool sizes ($200 total per market), the price impact protection was triggering on nearly all trades, making the platform unusable. Users couldn't place even small bets without hitting slippage limits.

**The protections will be critical again when:**
- Real money (SOL/USDC) is involved
- Pool sizes increase significantly (e.g., $20,000+ per market)
- Multiple users are trading simultaneously
- Front-running and market manipulation become concerns

---

## Original Code Locations & Restoration Instructions

### 1. **File: `server/db-storage.ts`**

#### Location: Inside `placeBetWithLocking` function, after pool calculations

**Lines to restore around line 690-710:**

```typescript
// Calculate price impact and validate slippage for both buys and sells
const currentPrice = params.position === "YES" ? parseFloat(market.yesPrice) : parseFloat(market.noPrice);
const newPrice = params.position === "YES" ? yesPrice : noPrice;
const priceImpact = Math.abs(newPrice - currentPrice) / currentPrice;

// HARD CAP: Enforce maximum price impact regardless of user's slippage tolerance
// This prevents manipulation and ensures market stability
if (priceImpact > MAX_PRICE_IMPACT) {
  const priceImpactPct = (priceImpact * 100).toFixed(2);
  const maxImpactPct = (MAX_PRICE_IMPACT * 100).toFixed(2);
  
  throw new ValidationError(
    `Trade rejected: Price impact ${priceImpactPct}% exceeds platform maximum of ${maxImpactPct}%. ` +
    `Please split this into smaller trades to maintain market stability.`
  );
}

// Check slippage protection for both buy and sell trades
if (priceImpact > slippageTolerance) {
  const priceImpactPct = (priceImpact * 100).toFixed(2);
  const slippagePct = (slippageTolerance * 100).toFixed(2);
  const currentPriceStr = currentPrice.toFixed(4);
  const newPriceStr = newPrice.toFixed(4);
  
  throw new ValidationError(
    `Price impact too high: ${priceImpactPct}% (limit: ${slippagePct}%). ` +
    `This trade would move the price from ${currentPriceStr} to ${newPriceStr}. ` +
    `Try: 1) Reduce your trade size, 2) Split into multiple smaller trades, or 3) Increase slippage tolerance in settings.`
  );
}
```

**Constants at top of file (around line 470-480):**

```typescript
const MAX_PRICE_IMPACT = 0.25; // Hard cap: 25% maximum price movement per trade
const DEFAULT_SLIPPAGE_TOLERANCE = 0.10; // Default 10% slippage tolerance
```

---

### 2. **File: `server/routes.ts`**

#### Location: In `/api/bets/preview` endpoint (around line 650-750)

**Code to restore:**

```typescript
// HARD CAP: Enforce maximum price impact regardless of user's slippage tolerance
// This prevents manipulation and ensures market stability
if (priceImpact > MAX_PRICE_IMPACT) {
  const priceImpactPct = (priceImpact * 100).toFixed(2);
  const maxImpactPct = (MAX_PRICE_IMPACT * 100).toFixed(2);
  
  throw new ValidationError(
    `Trade rejected: Price impact ${priceImpactPct}% exceeds platform maximum of ${maxImpactPct}%. ` +
    `Please split this into smaller trades to maintain market stability.`
  );
}

// Check slippage protection for both buy and sell trades
if (priceImpact > effectiveSlippageTolerance) {
  warnings.push({
    severity: "warning",
    message: `Price impact ${(priceImpact * 100).toFixed(2)}% exceeds slippage tolerance of ${(effectiveSlippageTolerance * 100).toFixed(2)}%. Increase slippage tolerance or reduce trade size.`
  });
}
```

**Constants to restore (around line 130-135):**

```typescript
const MAX_PRICE_IMPACT = 0.25; // Hard cap from db-storage.ts
const DEFAULT_SLIPPAGE_TOLERANCE = 0.10; // 10% default from db-storage.ts
```

---

## Platform Fee Code (Keep This - Already Active)

**Note**: The 2% platform fee code should **remain active** even in points mode, as it's working correctly:

```typescript
const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "0.02");

if (params.action === "buy") {
  platformFee = params.amount * PLATFORM_FEE_PERCENTAGE;
  netBetAmount = params.amount - platformFee;
  // ... use netBetAmount for calculations
}
```

This code is in `db-storage.ts` around lines 590-595 and should **NOT** be removed.

---

## Testing Requirements After Restoration

When reinstating this code, verify:

1. **Small trades** (<1% of pool) succeed with minimal warnings
2. **Medium trades** (1-5% of pool) show info warnings but succeed
3. **Large trades** (5-10% of pool) show slippage warnings
4. **Very large trades** (>25% price impact) are **rejected** regardless of slippage tolerance
5. **Trade size limits** (40% of pool maximum) still enforce
6. **Slippage tolerance** parameter works in both preview and execution

---

## Environment Variables

When real money trading is enabled, consider adjusting:

```bash
# In .env file
PLATFORM_FEE_PERCENTAGE=0.02  # 2% fee (currently active)
MAX_TRADE_SIZE_PERCENT=0.40   # 40% of pool max
MAX_PRICE_IMPACT=0.25         # 25% hard cap
DEFAULT_SLIPPAGE=0.10         # 10% default tolerance
```

---

## Related Test Files

These test files verify the slippage protection works correctly:
- `server/tests/amm.test.ts` - Lines 200-350 (AMM-008 tests)
- `server/tests/comprehensive-test-suite.test.ts` - AMM-005 tests

Run these tests after restoration:
```bash
npm test amm.test.ts
```

---

## Summary

**Remove this code NOW** for points-only system (small pools):
- ✅ Price impact hard cap (25%)
- ✅ Slippage tolerance validation
- ✅ Related warning messages

**Keep this code ACTIVE**:
- ✅ Platform fee (2%)
- ✅ Trade size limits (40% of pool)
- ✅ Price bounds (0.01 - 0.99)
- ✅ Pool depletion checks

**Restore all removed code when**:
- Solana integration is complete
- Pool sizes increase to $10,000+
- Real money is at risk
- Multiple simultaneous traders exist

---

**Date Created**: January 2025  
**Reason**: Temporary removal for points-only operation  
**Status**: To be restored with Solana hot wallet integration
