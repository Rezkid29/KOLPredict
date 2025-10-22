import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import type { BetWithMarket } from "@shared/schema";

export default function Portfolio() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: bets = [], isLoading } = useQuery<BetWithMarket[]>({
    queryKey: ["/api/bets/user"],
  });

  const balance = user?.balance ? parseFloat(user.balance) : 1000;
  const totalProfit = user?.totalProfit ? parseFloat(user.totalProfit) : 0;
  const winRate = user?.totalBets ? ((user.totalWins / user.totalBets) * 100) : 0;
  
  const activeBets = bets.filter(b => b.status === "pending");
  const settledBets = bets.filter(b => b.status !== "pending");

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
      <Navbar balance={balance} username={user?.username} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-display font-bold">Portfolio</h1>
          </div>
          <p className="text-muted-foreground">
            Track your betting performance and history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold tabular-nums" data-testid="text-balance">
                  {balance.toFixed(2)} PTS
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${totalProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                {totalProfit >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold tabular-nums ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`} data-testid="text-profit">
                  {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} PTS
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold tabular-nums" data-testid="text-winrate">
                  {winRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Bets</p>
                <p className="text-2xl font-bold tabular-nums" data-testid="text-active-bets">
                  {activeBets.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalInvested.toFixed(0)} PTS invested
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Betting History */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Betting History</h2>
            <p className="text-sm text-muted-foreground">
              {bets.length} total bets
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="animate-pulse">Loading bets...</div>
            </div>
          ) : bets.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No bets yet</p>
              <p className="text-xs mt-1">Place your first bet to get started!</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-3">
                {bets.map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover-elevate transition-all"
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
                          {bet.type === "buy" ? (
                            <TrendingUp className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                          )}
                          <span className={bet.type === "buy" ? "text-success font-medium" : "text-destructive font-medium"}>
                            {bet.type.toUpperCase()}
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
                        {bet.profit && (
                          <div className={parseFloat(bet.profit) >= 0 ? "text-success" : "text-destructive"}>
                            P&L: <span className="font-semibold tabular-nums">
                              {parseFloat(bet.profit) >= 0 ? '+' : ''}{parseFloat(bet.profit).toFixed(2)}
                            </span> PTS
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
    </div>
  );
}
