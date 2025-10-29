import { dbStorage as storage } from './db-storage';
import { addDays } from 'date-fns';
import type { InsertMarket } from '@shared/schema';

async function generateWinLossRatioMarkets() {
  console.log('🎯 Generating Win/Loss Ratio Head-to-Head Markets...\n');

  const scrapedKolsData = await storage.getLatestScrapedKols(20);
  console.log(`📊 Found ${scrapedKolsData.length} scraped KOLs\n`);

  const validKOLs = scrapedKolsData.filter(k => {
    const wins = k.wins;
    const losses = k.losses;
    return wins !== null && losses !== null && losses > 0;
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
    
    const winsA = kolA.wins!;
    const lossesA = kolA.losses!;
    const winsB = kolB.wins!;
    const lossesB = kolB.losses!;
    
    const ratioA = (winsA / lossesA).toFixed(2);
    const ratioB = (winsB / lossesB).toFixed(2);

    const kolAHandle = kolA.xHandle ?? undefined;
    const kolARecord = kolAHandle ? await storage.getKolByHandle(kolAHandle) : undefined;
    if (!kolARecord) {
      console.error(`❌ Could not find KOL handle ${kolA.xHandle} in database`);
      continue;
    }

    const market: InsertMarket = {
      kolId: kolARecord.id,
      title: `Will ${kolA.username} have a higher win/loss ratio than ${kolB.username} on tomorrow's leaderboard?`,
      description: `Win/Loss ratio comparison: ${kolA.username} has ${ratioA} (${winsA}/${lossesA}) vs ${kolB.username} with ${ratioB} (${winsB}/${lossesB})`,
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
      currentRankA: String(kolA.rank ?? ''),
      currentRankB: String(kolB.rank ?? ''),
      currentUsd: null,
      currentSolA: null,
      currentSolB: null,
      currentUsdA: null,
      currentUsdB: null,
      currentWinsLossesA: `${winsA}/${lossesA}`,
      currentWinsLossesB: `${winsB}/${lossesB}`,
      threshold: null,
      timeframeDays: null,
    });

    usedKOLs.add(kolA.username);
    usedKOLs.add(kolB.username);

    console.log(`\n✅ MARKET ${i + 1} CREATED`);
    console.log(`   Title: ${createdMarket.title}`);
    console.log(`   ${kolA.username}: ${ratioA} ratio (${winsA}/${lossesA})`);
    console.log(`   ${kolB.username}: ${ratioB} ratio (${winsB}/${lossesB})`);
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
