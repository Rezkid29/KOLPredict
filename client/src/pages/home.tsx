import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { MarketCard } from "@/components/market-card";
import { BetModal } from "@/components/bet-modal";
import { LiveFeed } from "@/components/live-feed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, TrendingUp, Sparkles, Activity } from "lucide-react";
import type {
  MarketWithKol,
  BetWithMarket,
  User,
  PositionWithMarket,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Home() {
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<MarketWithKol | null>(
    null,
  );
  const [betType, setBetType] = useState<"buy" | "sell">("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveFeedOpen, setLiveFeedOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();

  // Connect to WebSocket for real-time updates
  const { isConnected } = useWebSocket();

  const { data: markets = [], isLoading: marketsLoading } = useQuery<
    MarketWithKol[]
  >({
    queryKey: ["/api/markets"],
  });

  const { data: bets = [] } = useQuery<BetWithMarket[]>({
    queryKey: ["/api/bets/recent"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: userPositions = [] } = useQuery<PositionWithMarket[]>({
    queryKey: ["/api/positions/user"],
    enabled: !!user,
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

  const handleConfirmBet = async (
    marketId: string,
    position: "YES" | "NO",
    amount: number,
    action: "buy" | "sell",
  ) => {
    try {
      // Send to /api/bets with action parameter (not /api/bets/sell)
      await apiRequest("POST", "/api/bets", {
        marketId,
        position,
        amount,
        action,
      });

      toast({
        title: "Bet Placed!",
        description: `Successfully ${action === "buy" ? "bought" : "sold"} ${position} position for $${amount.toFixed(2)}`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/markets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bets/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positions/user"] });
    } catch (error: any) {
      let errorMessage =
        error?.message || "Failed to place bet. Please try again.";

      // Provide user-friendly messages for common errors
      if (errorMessage.includes("not live")) {
        errorMessage =
          "This market is no longer accepting bets. It may have expired or been resolved.";
      } else if (errorMessage.includes("resolved")) {
        errorMessage =
          "This market has already been resolved and is closed for trading.";
      } else if (errorMessage.includes("insufficient funds")) {
        errorMessage = "Insufficient funds to place this bet.";
      }

      toast({
        title: "Cannot Place Bet",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const categories = [
    {
      value: "performance",
      label: "Performance",
      color: "text-success dark:text-success",
    },
    {
      value: "ranking",
      label: "Ranking",
      color: "text-primary dark:text-primary",
    },
    {
      value: "social",
      label: "Social",
      color: "text-primary dark:text-primary",
    },
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const filteredMarkets = markets.filter((market) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      market.kol.name.toLowerCase().includes(query) ||
      market.kol.handle.toLowerCase().includes(query) ||
      market.title.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategories.length === 0 ||
      (market.marketCategory &&
        selectedCategories.includes(market.marketCategory));

    // Only show live, unresolved markets - check both flags
    // resolved can be true even if isLive is true (during settlement)
    // Also check outcome is still 'pending'
    const isActive = market.isLive && market.resolved !== true && market.outcome === "pending";

    return matchesSearch && matchesCategory && isActive;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        balance={user?.balance ? parseFloat(user.balance) : 1000}
        username={user?.username}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge
              variant="outline"
              className="gap-2 px-4 py-2.5 border-primary/40 text-primary backdrop-blur-sm bg-background/50"
            >
              <Sparkles className="h-4 w-4" />
              Trade KOL Performance Markets
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight">
              <span className="text-white">Bet on</span>{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Influence
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Trade prediction markets on Key Opinion Leader performance. Bet on
              rankings, P&L, win ratios, and real-time influence
              metrics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
              <div className="flex items-center gap-2.5 px-5 py-3 rounded-lg bg-card/80 backdrop-blur-sm border border-card-border shadow-sm hover-elevate transition-all">
                <div className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {filteredMarkets.length} Live Markets
                </span>
              </div>
              <div className="px-5 py-3 rounded-lg bg-card/80 backdrop-blur-sm border border-card-border shadow-sm hover-elevate transition-all">
                <span className="text-sm text-muted-foreground">
                  24h Volume:{" "}
                </span>
                <span className="text-sm font-bold tabular-nums text-white">
                  {filteredMarkets
                    .reduce((sum, m) => sum + parseFloat(m.totalVolume), 0)
                    .toFixed(0)}{" "}
                  PTS
                </span>
              </div>
              <div className="px-5 py-3 rounded-lg bg-card/80 backdrop-blur-sm border border-card-border shadow-sm hover-elevate transition-all">
                <span className="text-sm text-muted-foreground">
                  CA:{" "}
                </span>
                <span className="text-sm font-bold tabular-nums text-white">
                  null
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Markets Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search KOLs or markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border/60 transition-colors"
                  data-testid="input-search"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="gap-2 shrink-0"
                    data-testid="button-filter"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                    {selectedCategories.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                      >
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Market Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.value}
                      checked={selectedCategories.includes(category.value)}
                      onCheckedChange={() => toggleCategory(category.value)}
                      data-testid={`filter-category-${category.value}`}
                    >
                      <span className={category.color}>{category.label}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedCategories.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategories([])}
                        data-testid="button-clear-filters"
                      >
                        Clear filters
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Markets Grid */}
            {marketsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[450px] rounded-lg bg-card/50 border border-card-border/50 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredMarkets.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-6">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No markets found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try a different search term"
                    : "Check back soon for new markets"}
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                data-testid="markets-grid"
              >
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
            <div className="sticky top-24">
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
            className="lg:hidden fixed bottom-6 right-6 z-40 rounded-full w-16 h-16 shadow-xl shadow-primary/20 border-2 border-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all"
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
          <div className="mt-6">
            <LiveFeed bets={bets} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Bet Modal */}
      <BetModal
        open={betModalOpen}
        onClose={() => setBetModalOpen(false)}
        market={selectedMarket}
        userBalance={user?.balance ? parseFloat(user.balance) : 1000}
        userYesShares={
          selectedMarket && user
            ? (() => {
                const position = userPositions.find(
                  (p) =>
                    p.marketId === selectedMarket.id && p.position === "YES",
                );
                return position ? parseFloat(position.shares) : 0;
              })()
            : 0
        }
        userNoShares={
          selectedMarket && user
            ? (() => {
                const position = userPositions.find(
                  (p) =>
                    p.marketId === selectedMarket.id && p.position === "NO",
                );
                return position ? parseFloat(position.shares) : 0;
              })()
            : 0
        }
        onConfirm={handleConfirmBet}
      />
    </div>
  );
}