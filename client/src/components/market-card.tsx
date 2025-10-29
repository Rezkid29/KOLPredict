import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PerformanceChart } from "./performance-chart";
import { MarketDetailsModal } from "./market-details-modal";
import { CountdownTimer } from "./countdown-timer";
import type { MarketWithKol, PriceHistoryPoint } from "@shared/schema";

interface MarketCardProps {
  market: MarketWithKol;
  onBuy: (market: MarketWithKol) => void;
  onSell: (market: MarketWithKol) => void;
  onAddToParlay?: (market: MarketWithKol, position: "YES" | "NO", price: number) => void;
}

export function MarketCard({ market, onBuy, onSell, onAddToParlay }: MarketCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  // Prefer new CPMM prices, fallback to legacy if needed, then to 0.5
  const rawYes = parseFloat((market as any).currentYesPrice ?? market.yesPrice ?? '0.5');
  const rawNo = parseFloat((market as any).currentNoPrice ?? market.noPrice ?? '0.5');
  const yesPrice = Number.isFinite(rawYes) ? rawYes : 0.5;
  const noPrice = Number.isFinite(rawNo) ? rawNo : (1 - yesPrice);
  const engagement = parseFloat(market.engagement);

  const { data: priceHistory = [] } = useQuery<PriceHistoryPoint[]>({
    queryKey: ["/api/markets", market.id, "history"],
    queryFn: async () => {
      const response = await fetch(`/api/markets/${market.id}/history?days=7`);
      if (!response.ok) throw new Error("Failed to fetch price history");
      return response.json();
    },
  });

  const seededData: PriceHistoryPoint[] =
    priceHistory.length > 0
      ? priceHistory
      : [{ time: new Date().toLocaleTimeString(), yesPrice, noPrice }];

  const getCategoryDisplay = (category?: string | null) => {
    switch (category) {
      case 'performance':
        return { label: 'Performance', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
      case 'ranking':
        return { label: 'Ranking', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
      case 'social':
        return { label: 'Social', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
      default:
        return { label: 'General', color: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' };
    }
  };

  const categoryDisplay = getCategoryDisplay(market.marketCategory);

  return (
    <Card 
      className="overflow-hidden hover-elevate transition-all duration-200 group" 
      data-testid={`card-market-${market.id}`}
    >
      <div className="p-4 space-y-4">
        {/* Header with KOL info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20" data-testid={`img-kol-avatar-${market.kolId}`}>
              <AvatarImage src={market.kol.avatar} alt={market.kol.name} />
              <AvatarFallback>{market.kol.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base truncate" data-testid={`text-kol-name-${market.kolId}`}>
                  {market.kol.name}
                </h3>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {market.kol.tier}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">@{market.kol.handle}</p>
            </div>
          </div>

          {market.isLive ? (
            <Badge variant="outline" className="gap-1.5 border-success text-success shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              LIVE
            </Badge>
          ) : market.resolved ? (
            <Badge variant="outline" className="gap-1.5 border-muted-foreground text-muted-foreground shrink-0">
              CLOSED
            </Badge>
          ) : null}
        </div>

        {/* Market title and timer */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 justify-between">
            <p className="font-medium text-sm leading-relaxed flex-1" data-testid={`text-market-title-${market.id}`}>
              {market.title}
            </p>
            <Badge 
              variant="outline" 
              className={`text-xs shrink-0 ${categoryDisplay.color}`}
              data-testid={`badge-category-${market.id}`}
            >
              {categoryDisplay.label}
            </Badge>
          </div>
          {market.isLive && market.resolvesAt && (
            <CountdownTimer resolvesAt={market.resolvesAt} />
          )}
        </div>

        {/* Market prices - YES/NO */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
            <p className="text-xs text-muted-foreground mb-1">YES</p>
            <p className="text-2xl font-bold tabular-nums text-success" data-testid={`text-yes-price-${market.id}`}>
              ${yesPrice.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{(yesPrice * 100).toFixed(1)}% chance</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-xs text-muted-foreground mb-1">NO</p>
            <p className="text-2xl font-bold tabular-nums text-destructive" data-testid={`text-no-price-${market.id}`}>
              ${noPrice.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{(noPrice * 100).toFixed(1)}% chance</p>
          </div>
        </div>

        {/* Performance chart */}
        <div className="border border-border rounded-lg p-3 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">
              {(() => {
                if (!market.resolvesAt) return "Price Trend";
                const msUntilResolution = new Date(market.resolvesAt).getTime() - Date.now();
                const hoursUntilResolution = msUntilResolution / (1000 * 60 * 60);
                if (hoursUntilResolution <= 1) return "60-Min Price Trend";
                if (hoursUntilResolution <= 24) return "24-Hr Price Trend";
                return "7-Day Price Trend";
              })()}
            </p>
            {priceHistory.length > 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                <TrendingUp className="h-3 w-3" />
                {((priceHistory[priceHistory.length - 1].yesPrice - priceHistory[0].yesPrice) / priceHistory[0].yesPrice * 100).toFixed(1)}%
              </Badge>
            )}
          </div>
          <PerformanceChart data={seededData} color="hsl(var(--primary))" />
        </div>

        {/* KOL metrics */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Followers: </span>
              <span className="font-medium">{(market.kol.followers / 1000).toFixed(1)}K</span>
            </div>
            <div>
              <span className="text-muted-foreground">Eng Rate: </span>
              <span className="font-medium">{parseFloat(market.kol.engagementRate).toFixed(1)}%</span>
            </div>
          </div>

          {market.kol.trending && market.kol.trendingPercent && (
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">+{parseFloat(market.kol.trendingPercent).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBuy(market);
            }}
            className="flex-1 font-semibold"
            disabled={market.resolved === true}
            data-testid="button-buy-yes"
          >
            Buy
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSell(market);
            }}
            className="flex-1 font-semibold"
            disabled={market.resolved === true}
            data-testid="button-sell"
          >
            Sell
          </Button>
          <Button 
            onClick={() => setShowDetails(true)}
            variant="outline"
            className="gap-1.5"
            data-testid={`button-details-${market.id}`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Details</span>
          </Button>
        </div>

        {onAddToParlay && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={market.resolved === true}
              onClick={(e) => {
                e.stopPropagation();
                onAddToParlay(market, "YES", yesPrice);
              }}
            >
              Add YES
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={market.resolved === true}
              onClick={(e) => {
                e.stopPropagation();
                onAddToParlay(market, "NO", noPrice);
              }}
            >
              Add NO
            </Button>
          </div>
        )}
      </div>

      <MarketDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        market={market}
      />
    </Card>
  );
}