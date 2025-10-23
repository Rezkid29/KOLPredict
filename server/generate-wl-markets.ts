import { dbStorage as storage } from './db-storage';
import { addDays } from 'date-fns';
import type { InsertMarket } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function generateWinLossRatioMarkets() {
  console.log('🎯 Generating Win/Loss Ratio Head-to-Head Markets...\n');

  const scrapedKolsData = await storage.getLatestScrapedKols(20);
  console.log(`📊 Found ${scrapedKolsData.length} scraped KOLs\n`);

  const validKOLs = scrapedKolsData.filter(k => {
    if (!k.winsLosses) return false;
    const [winsStr, lossesStr] = k.winsLosses.split('/');
    const wins = parseInt(winsStr);
    const losses = parseInt(lossesStr);
    return !isNaN(wins) && !isNaN(losses) && losses > 0;
  });

  console.log(`✅ ${validKOLs.length} KOLs have valid win/loss data\n`);

  if (validKOLs.length < 8) {
    console.error('❌ Need at least 8 KOLs with valid win/loss data to create 4 unique markets');
    return;
  }

  const usedKOLs = new Set<string>();
  const createdMarkets: any[] = [];

  for (let i = 0; i < 4 && validKOLs.length >= 2; i++) {
    const availableKOLs = validKOLs.filter(k => !usedKOLs.has(k.username));
    
    if (availableKOLs.length < 2) {
      console.error(`⚠️ Not enough available KOLs for market ${i + 1}`);
      break;
    }

    const [kolA, kolB] = availableKOLs.slice(0, 2);
    
    const winsLossesA = kolA.winsLosses;
    const winsLossesB = kolB.winsLosses;
    
    const [winsAStr, lossesAStr] = winsLossesA!.split('/');
    const [winsBStr, lossesBStr] = winsLossesB!.split('/');
    const winsA = parseInt(winsAStr);
    const lossesA = parseInt(lossesAStr);
    const winsB = parseInt(winsBStr);
    const lossesB = parseInt(lossesBStr);
    
    const ratioA = (winsA / lossesA).toFixed(2);
    const ratioB = (winsB / lossesB).toFixed(2);

    const kolARecord = await storage.getKolByUsername(kolA.username);
    if (!kolARecord) {
      console.error(`❌ Could not find KOL ${kolA.username} in database`);
      continue;
    }

    const market: InsertMarket = {
      kolId: kolARecord.id,
      title: `Will ${kolA.username} have a higher win/loss ratio than ${kolB.username} on tomorrow's leaderboard?`,
      description: `Win/Loss ratio comparison: ${kolA.username} has ${ratioA} (${winsLossesA}) vs ${kolB.username} with ${ratioB} (${winsLossesB})`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'winloss_ratio_flippening',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    const createdMarket = await storage.createMarket(market);

    await storage.createMarketMetadata({
      marketId: createdMarket.id,
      marketType: 'winloss_ratio_flippening',
      kolA: kolA.username,
      kolB: kolB.username,
      xHandle: null,
      currentFollowers: null,
      currentRankA: kolA.rank || null,
      currentRankB: kolB.rank || null,
      currentUsd: null,
      currentSolA: null,
      currentSolB: null,
      currentUsdA: null,
      currentUsdB: null,
      currentWinsLossesA: winsLossesA || null,
      currentWinsLossesB: winsLossesB || null,
      threshold: null,
      timeframeDays: null,
    });

    usedKOLs.add(kolA.username);
    usedKOLs.add(kolB.username);

    console.log(`\n✅ MARKET ${i + 1} CREATED`);
    console.log(`   Title: ${createdMarket.title}`);
    console.log(`   ${kolA.username}: ${ratioA} ratio (${winsLossesA})`);
    console.log(`   ${kolB.username}: ${ratioB} ratio (${winsLossesB})`);
    console.log(`   Market ID: ${createdMarket.id}`);

    createdMarkets.push({
      id: createdMarket.id,
      title: createdMarket.title,
      kolA: kolA.username,
      kolB: kolB.username,
      ratioA,
      ratioB,
    });
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ Successfully created ${createdMarkets.length} win/loss ratio markets`);
  console.log(`${'='.repeat(70)}\n`);

  return createdMarkets;
}

generateWinLossRatioMarkets()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
