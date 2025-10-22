import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { MarketCard } from "@/components/market-card";
import { BetModal } from "@/components/bet-modal";
import { LiveFeed } from "@/components/live-feed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Filter, TrendingUp, Sparkles, Activity } from "lucide-react";
import type { MarketWithKol, BetWithMarket } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Home() {
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<MarketWithKol | null>(null);
  const [betType, setBetType] = useState<"buy" | "sell">("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveFeedOpen, setLiveFeedOpen] = useState(false);
  const { toast } = useToast();
  
  // Connect to WebSocket for real-time updates
  const { isConnected } = useWebSocket();

  const { data: markets = [], isLoading: marketsLoading } = useQuery<MarketWithKol[]>({
    queryKey: ["/api/markets"],
  });

  const { data: bets = [] } = useQuery<BetWithMarket[]>({
    queryKey: ["/api/bets/recent"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleBuy = (market: MarketWithKol) => {
    setSelectedMarket(market);
    setBetType("buy");
    setBetModalOpen(true);
  };

  const handleSell = (market: MarketWithKol) => {
    setSelectedMarket(market);
    setBetType("sell");
    setBetModalOpen(true);
  };

  const handleConfirmBet = async (marketId: string, type: "buy" | "sell", amount: number, shares: number) => {
    try {
      await apiRequest("POST", "/api/bets", {
        marketId,
        type,
        amount: amount.toString(),
        shares,
      });

      toast({
        title: "Bet Placed!",
        description: `Successfully placed ${type} order for ${shares} shares`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/markets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bets/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMarkets = markets.filter((market) => {
    const query = searchQuery.toLowerCase();
    return (
      market.kol.name.toLowerCase().includes(query) ||
      market.kol.handle.toLowerCase().includes(query) ||
      market.title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={user?.balance ? parseFloat(user.balance) : 1000} username={user?.username} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:40px_40px]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="outline" className="gap-2 px-4 py-2 border-primary/30 text-primary">
              <Sparkles className="h-4 w-4" />
              Trade KOL Performance Markets
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">
              Bet on <span className="text-primary">Influence</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Trade prediction markets on Key Opinion Leader performance. Bet on follower growth, engagement rates, and real-time influence metrics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-card-border">
                <div className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </div>
                <span className="text-sm font-medium">{markets.length} Live Markets</span>
              </div>
              <div className="px-4 py-2 rounded-lg bg-card border border-card-border">
                <span className="text-sm text-muted-foreground">24h Volume: </span>
                <span className="text-sm font-semibold">
                  {markets.reduce((sum, m) => sum + parseFloat(m.totalVolume), 0).toFixed(0)} PTS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Markets Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search KOLs or markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Button variant="outline" className="gap-2 shrink-0" data-testid="button-filter">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Markets Grid */}
            {marketsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 rounded-lg bg-card border border-card-border animate-pulse" />
                ))}
              </div>
            ) : filteredMarkets.length === 0 ? (
              <div className="text-center py-16">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No markets found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Check back soon for new markets"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="markets-grid">
                {filteredMarkets.map((market) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    onBuy={handleBuy}
                    onSell={handleSell}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Live Feed Column - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <LiveFeed bets={bets} />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Live Feed Button */}
      <Sheet open={liveFeedOpen} onOpenChange={setLiveFeedOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="lg:hidden fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg"
            data-testid="button-mobile-live-feed"
          >
            <Activity className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Live Feed
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <LiveFeed bets={bets} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Bet Modal */}
      <BetModal
        open={betModalOpen}
        onClose={() => setBetModalOpen(false)}
        market={selectedMarket}
        type={betType}
        userBalance={user?.balance ? parseFloat(user.balance) : 1000}
        onConfirm={handleConfirmBet}
      />
    </div>
  );
}
