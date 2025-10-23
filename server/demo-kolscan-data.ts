import { dbStorage } from "./db-storage";
import type { InsertScrapedKol } from "@shared/schema";

// This simulates real data from kolscan.io leaderboard
// Format matches exactly what the scraper would collect
export async function seedRealisticKolscanData() {
  const mockKolscanData: InsertScrapedKol[] = [
    {
      rank: "1",
      username: "Ansem",
      xHandle: "@blknoiz06",
      winsLosses: "234/108",
      solGain: "1250.50",
      usdGain: "2847500.00",
    },
    {
      rank: "2",
      username: "Crypto Rover",
      xHandle: "@rovercrc",
      winsLosses: "193/74",
      solGain: "845.30",
      usdGain: "1923800.00",
    },
    {
      rank: "3",
      username: "Altcoin Daily",
      xHandle: "@altcoindaily",
      winsLosses: "196/102",
      solGain: "723.80",
      usdGain: "1654200.00",
    },
    {
      rank: "4",
      username: "Crypto Cobain",
      xHandle: "@cryptocobain",
      winsLosses: "156/67",
      solGain: "628.40",
      usdGain: "1432900.00",
    },
    {
      rank: "5",
      username: "Lark Davis",
      xHandle: "@thecryptolark",
      winsLosses: "164/81",
      solGain: "564.20",
      usdGain: "1287600.00",
    },
    {
      rank: "6",
      username: "Byzantine General",
      xHandle: "@generalbitcoin",
      winsLosses: "131/58",
      solGain: "507.10",
      usdGain: "1156300.00",
    },
    {
      rank: "7",
      username: "Elliotrades",
      xHandle: "@elliotrades",
      winsLosses: "177/99",
      solGain: "457.80",
      usdGain: "1043700.00",
    },
    {
      rank: "8",
      username: "Miles Deutscher",
      xHandle: "@milesdeutscher",
      winsLosses: "144/57",
      solGain: "433.20",
      usdGain: "987400.00",
    },
    {
      rank: "9",
      username: "Crypto Banter",
      xHandle: "@cryptobanter",
      winsLosses: "158/76",
      solGain: "384.50",
      usdGain: "876200.00",
    },
    {
      rank: "10",
      username: "Crypto Kaleo",
      xHandle: "@cryptokaleo",
      winsLosses: "136/62",
      solGain: "327.30",
      usdGain: "745800.00",
    },
  ];

  console.log("\n" + "=".repeat(70));
  console.log("SEEDING REALISTIC KOLSCAN DATA");
  console.log("=".repeat(70));
  console.log(`Simulating scrape of top ${mockKolscanData.length} KOLs from kolscan.io...`);

  const saved = await dbStorage.createScrapedKols(mockKolscanData);

  for (const kol of saved) {
    console.log(`✅ Saved: #${kol.rank} ${kol.username} (${kol.xHandle}) - $${kol.usdGain} USD gain`);
  }

  console.log("=".repeat(70));
  console.log(`✅ SEEDING COMPLETE: ${saved.length}/${mockKolscanData.length} KOLs saved`);
  console.log("=".repeat(70) + "\n");

  return { success: true, saved: saved.length, total: mockKolscanData.length };
}
