import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BetModal } from "@/components/bet-modal";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import type { BetWithMarket, User, PositionWithMarket, MarketWithKol } from "@shared/schema";
import logoImage from "/favicon.png";

export default function Portfolio() {
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<MarketWithKol | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: bets = [], isLoading } = useQuery<BetWithMarket[]>({
    queryKey: ["/api/bets/user"],
  });

  const { data: userPositions = [] } = useQuery<PositionWithMarket[]>({
    queryKey: ["/api/positions/user"],
  });

  const placeBetMutation = useMutation({
    mutationFn: async ({
      marketId,
      position,
      amount,
      action,
    }: {
      marketId: string;
      position: "YES" | "NO";
      amount: number;
      action: "buy" | "sell";
    }) => {
      const endpoint = action === "buy" ? "/api/bets" : "/api/bets/sell";
      const body =
        action === "buy"
          ? {
              userId: user?.id,
              marketId,
              position,
              amount,
            }
          : {
              userId: user?.id,
              marketId,
              position,
              shares: amount,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to place bet");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bets/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positions/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/markets"] });
      toast({
        title: "Success",
        description: "Bet placed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConfirmBet = (
    marketId: string,
    position: "YES" | "NO",
    amount: number,
    action: "buy" | "sell"
  ) => {
    placeBetMutation.mutate({ marketId, position, amount, action });
  };

  const handleBetClick = (market: MarketWithKol) => {
    setSelectedMarket(market);
    setBetModalOpen(true);
  };

  const balance = user?.balance ? parseFloat(user.balance) : 1000;
  const totalProfit = user?.totalProfit ? parseFloat(user.totalProfit) : 0;
  const winRate = user?.totalBets ? ((user.totalWins / user.totalBets) * 100) : 0;
  
  const activeBets = bets.filter(b => b.status === "pending" || b.status === "open");
  const settledBets = bets.filter(b => b.status === "settled" || b.status === "won" || b.status === "lost");

  const totalInvested = activeBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "won":
        return <CheckCircle2 className="h-4 w-4" />;
      case "lost":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1.5" data-testid="badge-pending">{getStatusIcon(status)} Pending</Badge>;
      case "won":
        return <Badge className="gap-1.5 bg-success/20 text-success border-success/30" data-testid="badge-won">{getStatusIcon(status)} Won</Badge>;
      case "lost":
        return <Badge className="gap-1.5 bg-destructive/20 text-destructive border-destructive/30" data-testid="badge-lost">{getStatusIcon(status)} Lost</Badge>;
      default:
        return <Badge variant="secondary" data-testid="badge-default">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={balance} username={user?.username ?? undefined} />

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <img src={logoImage} alt="KOL Predict Logo" className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Portfolio</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track your betting performance and history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <Card className="p-6 hover-elevate transition-all border-border/60">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Current Balance</p>
                <p className="text-2xl font-bold tabular-nums" data-testid="text-balance">
                  {balance.toFixed(2)} PTS
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover-elevate transition-all border-border/60">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-xl ring-1 ${totalProfit >= 0 ? 'bg-success/10 ring-success/20' : 'bg-destructive/10 ring-destructive/20'}`}>
                {totalProfit >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Total P&L</p>
                <p className={`text-2xl font-bold tabular-nums ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`} data-testid="text-profit">
                  {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} PTS
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-elevate transition-all border-border/60">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-accent/10 ring-1 ring-accent/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Win Rate</p>
                <p className="text-2xl font-bold tabular-nums" data-testid="text-winrate">
                  {winRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-elevate transition-all border-border/60">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-warning/10 ring-1 ring-warning/20">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Active Bets</p>
                <p className="text-2xl font-bold tabular-nums" data-testid="text-active-bets">
                  {activeBets.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalInvested.toFixed(0)} PTS invested
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Betting History */}
        <Card className="overflow-hidden border-border/60">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold mb-1">Betting History</h2>
            <p className="text-sm text-muted-foreground">
              {bets.length} total {bets.length === 1 ? 'bet' : 'bets'}
            </p>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-muted-foreground">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-4 animate-pulse">
                <BarChart3 className="h-6 w-6" />
              </div>
              <p className="text-sm">Loading bets...</p>
            </div>
          ) : bets.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-6">
                <BarChart3 className="h-8 w-8" />
              </div>
              <p className="font-medium mb-1">No bets yet</p>
              <p className="text-sm">Place your first bet to get started!</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="p-5 space-y-3">
                {bets.map((bet) => (
                  <div
                    key={bet.id}
                    onClick={() => handleBetClick(bet.market)}
                    className="flex items-start gap-4 p-5 rounded-lg border border-border/60 hover-elevate transition-all cursor-pointer"
                    data-testid={`bet-history-${bet.id}`}
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-border" data-testid={`avatar-${bet.id}`}>
                      <AvatarImage src={bet.market.kol.avatar} alt={bet.market.kol.name} />
                      <AvatarFallback>{bet.market.kol.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm" data-testid={`text-kol-${bet.id}`}>
                              {bet.market.kol.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {bet.market.kol.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {bet.market.title}
                          </p>
                        </div>
                        {getStatusBadge(bet.status)}
                      </div>

                      <div className="flex items-center gap-4 flex-wrap text-sm">
                        <div className="flex items-center gap-1.5">
                          {bet.position === "YES" ? (
                            <TrendingUp className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                          )}
                          <span className={bet.position === "YES" ? "text-success font-medium" : "text-destructive font-medium"}>
                            {bet.position}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-medium text-foreground">{bet.shares}</span> shares
                        </div>
                        <div className="text-muted-foreground">
                          @ <span className="font-medium text-foreground tabular-nums">{parseFloat(bet.price).toFixed(4)}</span> PTS
                        </div>
                        <div className="text-muted-foreground">
                          Total: <span className="font-medium text-foreground tabular-nums">{parseFloat(bet.amount).toFixed(2)}</span> PTS
                        </div>
                        {(bet.profit !== null && bet.profit !== undefined && parseFloat(bet.profit) !== 0) && (
                          <div className={parseFloat(bet.profit) >= 0 ? "text-success font-bold" : "text-destructive font-bold"}>
                            P&L: <span className="font-semibold tabular-nums">
                              {parseFloat(bet.profit) >= 0 ? '+' : ''}{parseFloat(bet.profit).toFixed(2)}
                            </span> PTS
                          </div>
                        )}
                        {(bet.profit !== null && bet.profit !== undefined && parseFloat(bet.profit) === 0 && bet.status === 'settled') && (
                          <div className="text-muted-foreground font-bold">
                            P&L: <span className="font-semibold tabular-nums">0.00</span> PTS
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formatTime(bet.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>

      {/* Bet Modal */}
      <BetModal
        open={betModalOpen}
        onClose={() => setBetModalOpen(false)}
        market={selectedMarket}
        userBalance={balance}
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
