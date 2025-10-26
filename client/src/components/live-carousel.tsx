import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { BetWithMarket } from "@shared/schema";

interface LiveCarouselProps {
  bets: BetWithMarket[];
}

export function LiveCarousel({ bets }: LiveCarouselProps) {
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // If no bets, show a placeholder message
  if (bets.length === 0) {
    return (
      <div className="w-full bg-card/30 border-y border-border/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </div>
            <span className="text-sm font-medium">Waiting for live bets...</span>
          </div>
        </div>
      </div>
    );
  }

  // Duplicate bets array exactly once for seamless infinite loop
  // This ensures the animation can translate -50% and loop perfectly
  const duplicatedBets = [...bets, ...bets];
  
  // If we have very few bets, duplicate more times to fill the screen
  const minItemsForSmooth = 15;
  let displayBets = duplicatedBets;
  if (bets.length < minItemsForSmooth) {
    const repetitionsNeeded = Math.ceil(minItemsForSmooth / bets.length);
    displayBets = Array(repetitionsNeeded).fill(bets).flat();
    // Double it again for the seamless loop
    displayBets = [...displayBets, ...displayBets];
  }
  
  // Calculate animation duration based on number of items (slower for more items)
  const cardWidth = 280; // Width of each card in pixels
  const totalWidth = (displayBets.length / 2) * cardWidth; // Half the track width (one full sequence)
  const animationDuration = Math.max(30, (displayBets.length / 2) * 2); // 2s per item, minimum 30s

  return (
    <div className="live-carousel-wrapper w-full bg-card/30 border-y border-border/50 overflow-hidden relative">
      {/* Live indicator badge */}
      <div className="absolute top-3 left-4 z-10">
        <Badge variant="outline" className="gap-2 border-success/40 text-success bg-background/80 backdrop-blur px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="font-semibold text-xs">Live Bets</span>
        </Badge>
      </div>

      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-card/30 via-card/20 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-card/30 via-card/20 to-transparent z-10 pointer-events-none"></div>

      {/* Scrolling track */}
      <div 
        className="live-carousel-track flex py-4"
        style={{
          width: `${displayBets.length * cardWidth}px`,
          animation: `carousel-scroll ${animationDuration}s linear infinite`,
        }}
      >
        {displayBets.map((bet, index) => (
          <div
            key={`${bet.id}-${index}`}
            className="flex-shrink-0 px-2"
            style={{ width: `${cardWidth}px` }}
            data-testid={index === 0 ? `carousel-bet-${bet.id}` : undefined}
          >
            <div className="h-full bg-card border border-border/50 rounded-lg p-3 hover-elevate transition-all">
              <div className="flex items-start gap-2.5">
                {/* Position indicator */}
                <div className={`flex-shrink-0 p-1.5 rounded-md ${
                  bet.position === "YES" 
                    ? "bg-success/10 text-success ring-1 ring-success/20" 
                    : "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
                }`}>
                  {bet.position === "YES" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Bet info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground/90 line-clamp-1 mb-1">
                    {bet.market.kol.name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-tight">
                    {bet.market.title}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold tabular-nums text-foreground">
                      {parseFloat(bet.amount).toFixed(0)} PTS
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(bet.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
