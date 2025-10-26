import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Target } from "lucide-react";
import type { LeaderboardEntry, User } from "@shared/schema";

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-primary" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-success" />;
    if (rank === 3) return <Award className="h-6 w-6 text-destructive" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-primary/20 text-primary border-primary/30">1st</Badge>;
    if (rank === 2) return <Badge className="bg-success/20 text-success border-success/30">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-destructive/20 text-destructive border-destructive/30">3rd</Badge>;
    return <Badge variant="secondary">#{rank}</Badge>;
  };

  const getTierBadge = (rank: number) => {
    if (rank <= 3) {
      return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 font-semibold">Legendary</Badge>;
    }
    if (rank <= 5) {
      return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30 font-semibold">Elite</Badge>;
    }
    if (rank <= 10) {
      return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 font-semibold">Rising</Badge>;
    }
    if (rank <= 15) {
      return <Badge className="bg-green-500/20 text-green-500 border-green-500/30 font-semibold">Growing</Badge>;
    }
    if (rank <= 20) {
      return <Badge className="bg-slate-500/20 text-slate-500 border-slate-500/30 font-semibold">Rookie</Badge>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={user?.balance ? parseFloat(user.balance) : 1000} username={user?.username ?? undefined} />

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Top performing traders ranked by total profit
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <Card className="p-6 hover-elevate transition-all border-border/60">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Total Traders</p>
                <p className="text-2xl font-bold">{leaderboard.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover-elevate transition-all border-border/60">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-success/10 ring-1 ring-success/20">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Total Bets</p>
                <p className="text-2xl font-bold">
                  {leaderboard.reduce((sum, entry) => sum + entry.totalBets, 0)}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover-elevate transition-all border-border/60">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-warning/10 ring-1 ring-warning/20">
                <Trophy className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Top Profit</p>
                <p className="text-2xl font-bold tabular-nums">
                  {leaderboard.length > 0 ? `${parseFloat(leaderboard[0].totalProfit).toFixed(0)} PTS` : "0 PTS"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card className="overflow-hidden border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="leaderboard-table">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-5 font-semibold text-sm">Rank</th>
                  <th className="text-left p-5 font-semibold text-sm">Trader</th>
                  <th className="text-right p-5 font-semibold text-sm">Total Profit</th>
                  <th className="text-right p-5 font-semibold text-sm hidden md:table-cell">Bets</th>
                  <th className="text-right p-5 font-semibold text-sm hidden md:table-cell">Wins</th>
                  <th className="text-right p-5 font-semibold text-sm hidden sm:table-cell">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td colSpan={6} className="p-5">
                        <div className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-6">
                        <Trophy className="h-8 w-8 text-muted-foreground/60" />
                      </div>
                      <p className="font-medium mb-1">No traders yet</p>
                      <p className="text-sm text-muted-foreground">Be the first to place a bet!</p>
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => {
                    const profit = parseFloat(entry.totalProfit);
                    const isPositive = profit >= 0;

                    return (
                      <tr
                        key={entry.userId}
                        className="border-b border-border/30 hover-elevate transition-all group"
                        data-testid={`row-leaderboard-${entry.rank}`}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-2.5">
                            {getRankIcon(entry.rank)}
                            {getRankBadge(entry.rank)}
                          </div>
                        </td>
                        <td className="p-5">
                          <Link href={`/profile/${entry.username ?? ""}`}>
                            <div className="flex items-center gap-3 cursor-pointer hover-elevate active-elevate-2 rounded-lg -m-2 p-2 transition-all">
                              <Avatar className="h-11 w-11 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all">
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                                  {entry.username?.[0]?.toUpperCase() ?? "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold" data-testid={`text-username-${entry.rank}`}>
                                  {entry.username ?? "Unknown"}
                                </span>
                                {getTierBadge(entry.rank)}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="p-5 text-right">
                          <span
                            className={`text-lg font-bold tabular-nums ${
                              isPositive ? "text-success" : "text-destructive"
                            }`}
                            data-testid={`text-profit-${entry.rank}`}
                          >
                            {isPositive ? "+" : ""}
                            {profit.toFixed(2)} PTS
                          </span>
                        </td>
                        <td className="p-5 text-right hidden md:table-cell">
                          <span className="font-semibold tabular-nums text-muted-foreground">{entry.totalBets}</span>
                        </td>
                        <td className="p-5 text-right hidden md:table-cell">
                          <span className="font-semibold tabular-nums text-muted-foreground">{entry.totalWins}</span>
                        </td>
                        <td className="p-5 text-right hidden sm:table-cell">
                          <Badge
                            variant={entry.winRate >= 50 ? "default" : "secondary"}
                            className="tabular-nums font-semibold"
                          >
                            {entry.winRate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
