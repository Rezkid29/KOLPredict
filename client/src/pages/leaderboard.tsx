import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Target } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-700" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">1st</Badge>;
    if (rank === 2) return <Badge className="bg-slate-400/20 text-slate-400 border-slate-400/30">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-700/20 text-amber-700 border-amber-700/30">3rd</Badge>;
    return <Badge variant="secondary">#{rank}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={user?.balance ? parseFloat(user.balance) : 1000} username={user?.username} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-display font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">
            Top performing traders ranked by total profit
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Traders</p>
                <p className="text-2xl font-bold">{leaderboard.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bets</p>
                <p className="text-2xl font-bold">
                  {leaderboard.reduce((sum, entry) => sum + entry.totalBets, 0)}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <Trophy className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Profit</p>
                <p className="text-2xl font-bold">
                  {leaderboard.length > 0 ? `${parseFloat(leaderboard[0].totalProfit).toFixed(0)} PTS` : "0 PTS"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="leaderboard-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Rank</th>
                  <th className="text-left p-4 font-semibold">Trader</th>
                  <th className="text-right p-4 font-semibold">Total Profit</th>
                  <th className="text-right p-4 font-semibold hidden md:table-cell">Bets</th>
                  <th className="text-right p-4 font-semibold hidden md:table-cell">Wins</th>
                  <th className="text-right p-4 font-semibold hidden sm:table-cell">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={6} className="p-4">
                        <div className="h-12 bg-muted/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No traders yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Be the first to place a bet!</p>
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => {
                    const profit = parseFloat(entry.totalProfit);
                    const isPositive = profit >= 0;

                    return (
                      <tr
                        key={entry.userId}
                        className="border-b border-border/50 hover-elevate transition-colors"
                        data-testid={`row-leaderboard-${entry.rank}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(entry.rank)}
                            {getRankBadge(entry.rank)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {entry.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium" data-testid={`text-username-${entry.rank}`}>
                              {entry.username}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
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
                        <td className="p-4 text-right hidden md:table-cell">
                          <span className="font-medium tabular-nums">{entry.totalBets}</span>
                        </td>
                        <td className="p-4 text-right hidden md:table-cell">
                          <span className="font-medium tabular-nums">{entry.totalWins}</span>
                        </td>
                        <td className="p-4 text-right hidden sm:table-cell">
                          <Badge
                            variant={entry.winRate >= 50 ? "default" : "secondary"}
                            className="tabular-nums"
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
