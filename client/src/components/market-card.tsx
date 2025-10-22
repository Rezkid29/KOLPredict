import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MarketWithKol } from "@shared/schema";

interface MarketCardProps {
  market: MarketWithKol;
  onBuy: (market: MarketWithKol) => void;
  onSell: (market: MarketWithKol) => void;
}

export function MarketCard({ market, onBuy, onSell }: MarketCardProps) {
  const price = parseFloat(market.price);
  const engagement = parseFloat(market.engagement);

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
          
          {market.isLive && (
            <Badge variant="outline" className="gap-1.5 border-success text-success shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              LIVE
            </Badge>
          )}
        </div>

        {/* Market title */}
        <div>
          <p className="font-medium text-sm leading-relaxed" data-testid={`text-market-title-${market.id}`}>
            {market.title}
          </p>
        </div>

        {/* Market stats */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            <p className="text-lg font-semibold tabular-nums" data-testid={`text-price-${market.id}`}>
              {price.toFixed(4)} PTS
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Supply</p>
            <p className="text-lg font-semibold tabular-nums" data-testid={`text-supply-${market.id}`}>
              {market.supply} / 5000
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Engagement</p>
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-lg font-semibold tabular-nums">
                {engagement.toFixed(1)}%
              </p>
            </div>
          </div>
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
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onBuy(market)}
            className="flex-1 bg-success hover:bg-success border-success-border font-semibold"
            data-testid={`button-buy-${market.id}`}
          >
            Buy
          </Button>
          <Button 
            onClick={() => onSell(market)}
            variant="destructive"
            className="flex-1 font-semibold"
            data-testid={`button-sell-${market.id}`}
          >
            Sell
          </Button>
        </div>
      </div>
    </Card>
  );
}
