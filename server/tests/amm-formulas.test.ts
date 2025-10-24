import { describe, it, expect } from 'vitest';

describe('AMM Formula Verification', () => {
  // Helper functions matching the new implementation
  const calculatePrices = (yesPool: number, noPool: number) => {
    const total = yesPool + noPool;
    return {
      yesPrice: noPool / total,  // YES price = NO pool ratio
      noPrice: yesPool / total,   // NO price = YES pool ratio
    };
  };

  const calculateSharesForBuy = (
    amt: number,
    pos: 'YES' | 'NO',
    yesP: number,
    noP: number
  ): number => {
    const k = yesP * noP;
    if (pos === 'YES') {
      const newNoPool = noP + amt;
      const newYesPool = k / newNoPool;
      return yesP - newYesPool;
    } else {
      const newYesPool = yesP + amt;
      const newNoPool = k / newYesPool;
      return noP - newNoPool;
    }
  };

  const calculatePayoutForSell = (
    shares: number,
    pos: 'YES' | 'NO',
    yesP: number,
    noP: number
  ): number => {
    const k = yesP * noP;
    if (pos === 'YES') {
      const newYesPool = yesP + shares;
      const newNoPool = k / newYesPool;
      return noP - newNoPool;
    } else {
      const newNoPool = noP + shares;
      const newYesPool = k / newNoPool;
      return yesP - newYesPool;
    }
  };

  it('should ensure prices sum to 1.0 at 50/50 odds', () => {
    const prices = calculatePrices(10000, 10000);
    expect(prices.yesPrice + prices.noPrice).toBeCloseTo(1.0, 10);
    expect(prices.yesPrice).toBeCloseTo(0.5, 10);
    expect(prices.noPrice).toBeCloseTo(0.5, 10);
  });

  it('should ensure prices sum to 1.0 at skewed odds', () => {
    const prices = calculatePrices(15000, 5000);
    expect(prices.yesPrice + prices.noPrice).toBeCloseTo(1.0, 10);
    expect(prices.yesPrice).toBeCloseTo(0.25, 10);  // YES is less likely
    expect(prices.noPrice).toBeCloseTo(0.75, 10);   // NO is more likely
  });

  it('should have cost ≈ shares × price for small trades at 50/50', () => {
    const yesPool = 10000;
    const noPool = 10000;
    const prices = calculatePrices(yesPool, noPool);
    
    // Small trade: spend $10 to buy YES
    const cost = 10;
    const shares = calculateSharesForBuy(cost, 'YES', yesPool, noPool);
    const averagePrice = cost / shares;
    
    // At 50/50 odds, spending $10 should get ≈ 20 shares (price ≈ $0.50)
    expect(shares).toBeCloseTo(19.98, 1);  // Slightly less due to price impact
    expect(averagePrice).toBeCloseTo(prices.yesPrice, 2);  // Should be close to current price
  });

  it('should have cost ≈ shares × price for small trades at 60/40', () => {
    const yesPool = 8000;  // Less YES inventory
    const noPool = 12000;  // More NO inventory
    const prices = calculatePrices(yesPool, noPool);
    
    // YES price should be 12000/20000 = 0.60
    expect(prices.yesPrice).toBeCloseTo(0.60, 10);
    
    // Small trade: spend $10 to buy YES
    const cost = 10;
    const shares = calculateSharesForBuy(cost, 'YES', yesPool, noPool);
    const averagePrice = cost / shares;
    
    // At 60% odds, spending $10 should get ≈ 16.67 shares (price ≈ $0.60)
    expect(shares).toBeCloseTo(16.53, 1);  // Slightly less due to price impact
    expect(averagePrice).toBeCloseTo(prices.yesPrice, 2);
  });

  it('should maintain constant product k = yesPool × noPool', () => {
    const yesPool = 10000;
    const noPool = 10000;
    const k = yesPool * noPool;
    
    // Buy $100 worth of YES
    const cost = 100;
    const shares = calculateSharesForBuy(cost, 'YES', yesPool, noPool);
    const newYesPool = yesPool - shares;
    const newNoPool = noPool + cost;
    
    // k should remain constant (within rounding error)
    expect(newYesPool * newNoPool).toBeCloseTo(k, 1);
  });

  it('should demonstrate sell is inverse of buy', () => {
    const yesPool = 10000;
    const noPool = 10000;
    
    // Buy $50 worth of YES
    const buyAmount = 50;
    const sharesBought = calculateSharesForBuy(buyAmount, 'YES', yesPool, noPool);
    const poolAfterBuy = {
      yes: yesPool - sharesBought,
      no: noPool + buyAmount,
    };
    
    // Now sell those same shares
    const sellPayout = calculatePayoutForSell(sharesBought, 'YES', poolAfterBuy.yes, poolAfterBuy.no);
    const poolAfterSell = {
      yes: poolAfterBuy.yes + sharesBought,
      no: poolAfterBuy.no - sellPayout,
    };
    
    // Pools should return to original state
    expect(poolAfterSell.yes).toBeCloseTo(yesPool, 5);
    expect(poolAfterSell.no).toBeCloseTo(noPool, 5);
    
    // Sell payout should equal buy cost (at same price)
    expect(sellPayout).toBeCloseTo(buyAmount, 5);
  });

  it('should show realistic example: buying 100 shares at $0.50 costs ≈ $50', () => {
    const yesPool = 10000;
    const noPool = 10000;
    const prices = calculatePrices(yesPool, noPool);
    
    // We want approximately 100 shares
    // At price $0.50, should cost ≈ $50
    // Let's spend $50 and see how many shares we get
    const cost = 50;
    const shares = calculateSharesForBuy(cost, 'YES', yesPool, noPool);
    
    // Should get close to 100 shares (slightly less due to slippage)
    expect(shares).toBeCloseTo(99.5, 0);
    
    const avgPrice = cost / shares;
    // Average price should be close to $0.50 but slightly higher due to slippage
    expect(avgPrice).toBeCloseTo(0.5025, 3);
  });

  it('should prevent extreme price moves', () => {
    const yesPool = 10000;
    const noPool = 10000;
    
    // Try to buy with very large amount
    const hugeCost = 8000;  // 40% of total pool
    const shares = calculateSharesForBuy(hugeCost, 'YES', yesPool, noPool);
    
    const newYesPool = yesPool - shares;
    const newNoPool = noPool + hugeCost;
    const newPrices = calculatePrices(newYesPool, newNoPool);
    
    // Price should move significantly but not to extremes
    expect(newPrices.yesPrice).toBeGreaterThan(0.6);  // Moved up from 0.5
    expect(newPrices.yesPrice).toBeLessThan(0.85);    // But not too extreme
  });
});
