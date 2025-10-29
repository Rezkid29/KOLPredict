import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/analytics/KpiCard";
import { KpiSparkline } from "@/components/analytics/KpiSparkline";
import { Card } from "@/components/ui/card";
import type { MarketWithKol, PriceHistoryPoint } from "@shared/schema";

export function DailyHighlights() {
  const { data: markets = [], isLoading } = useQuery<MarketWithKol[]>({
    queryKey: ["/api/markets"],
  });

  const realMarkets = useMemo(() => {
    return markets.filter((market) => {
      const kol = market.kol;
      const scraped = kol.scrapedFromKolscan || kol.lastScrapedAt !== null;
      const isActive = market.isLive && market.resolved !== true && market.outcome === "pending";
      return scraped && isActive;
    });
  }, [markets]);

  const topMarkets = useMemo(() => {
    return [...realMarkets]
      .sort((a, b) => parseFloat(b.totalVolume) - parseFloat(a.totalVolume))
      .slice(0, 6);
  }, [realMarkets]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-card/50 border border-card-border/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (topMarkets.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <h2 className="text-2xl font-bold text-white">Top movers</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topMarkets.map((m) => (
          <MarketHighlight key={m.id} market={m} />)
        )}
      </div>
    </div>
  );
}

function MarketHighlight({ market }: { market: MarketWithKol }) {
  const { data: history = [] } = useQuery<PriceHistoryPoint[]>({
    queryKey: ["/api/markets", market.id, "history", 7],
    queryFn: async () => {
      const res = await fetch(`/api/markets/${market.id}/history?days=7`);
      return res.json();
    },
  });

  const labels = history.map((p) => p.time);
  const yesValues = history.map((p) => p.yesPrice);
  const noValues = history.map((p) => p.noPrice);

  const last = yesValues[yesValues.length - 1] ?? 0.5;
  const first = yesValues[0] ?? last;
  const changePct = first ? ((last - first) / first) * 100 : 0;

  return (
    <Card className="p-4 border-border/60">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold truncate" title={market.title}>{market.title}</div>
        <div className={`text-sm font-semibold ${changePct >= 0 ? "text-success" : "text-destructive"}`}>
          {changePct >= 0 ? "+" : ""}{changePct.toFixed(1)}%
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <KpiCard label="Volume" value={`${parseFloat(market.totalVolume).toFixed(0)} PTS`} />
        <KpiCard label="YES" value={(last * 100).toFixed(1) + "%"} tone={changePct >= 0 ? "success" : "destructive"} />
        <KpiCard label="NO" value={((1 - last) * 100).toFixed(1) + "%"} />
      </div>
      <KpiSparkline labels={labels} yesValues={yesValues} noValues={noValues} height={96} />
      <div className="mt-2 text-xs text-muted-foreground truncate">@{market.kol.handle}</div>
    </Card>
  );
}
