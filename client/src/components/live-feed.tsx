import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import type { BetWithMarket } from "@shared/schema";

interface LiveFeedProps {
  bets: BetWithMarket[];
}

export function LiveFeed({ bets }: LiveFeedProps) {
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <Card className="overflow-hidden border-border/60">
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Live Feed</h2>
        </div>
        <Badge variant="outline" className="gap-2 border-success/40 text-success px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="font-semibold text-xs">Live</span>
        </Badge>
      </div>
      
      <ScrollArea className="h-[500px]">
        <div className="p-5 space-y-3" data-testid="live-feed-container">
          {bets.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/50 mb-5">
                <Activity className="h-7 w-7 opacity-60" />
              </div>
              <p className="font-medium mb-1">No recent bets yet</p>
              <p className="text-sm">Be the first to place a bet!</p>
            </div>
          ) : (
            bets.map((bet) => (
              <div
                key={bet.id}
                className="flex items-start gap-3.5 p-4 rounded-lg hover-elevate active-elevate-2 border border-border/50 transition-all"
                data-testid={`bet-item-${bet.id}`}
              >
                <div className={`mt-0.5 p-2 rounded-lg ${
                  bet.position === "YES" ? "bg-success/10 text-success ring-1 ring-success/20" : "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
                }`}>
                  {bet.position === "YES" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold line-clamp-2">
                      {bet.market.title}
                    </p>
                    <Badge
                      variant={bet.status === "won" ? "default" : bet.status === "lost" ? "destructive" : "secondary"}
                      className="shrink-0 text-xs"
                    >
                      {bet.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                    <span className="font-medium">{bet.market.kol.name}</span>
                    <span>•</span>
                    <span className="font-semibold">{bet.shares} shares</span>
                    <span>•</span>
                    <span className="font-bold tabular-nums">{parseFloat(bet.amount).toFixed(2)} PTS</span>
                    {bet.profit && (
                      <>
                        <span>•</span>
                        <span className={`font-bold tabular-nums ${parseFloat(bet.profit) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          P&L: {parseFloat(bet.profit) >= 0 ? '+' : ''}{parseFloat(bet.profit).toFixed(2)} PTS
                        </span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {formatTime(bet.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
