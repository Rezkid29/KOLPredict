import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BetModal } from "@/components/bet-modal";
import { EditBioModal } from "@/components/edit-bio-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient as globalQueryClient } from "@/lib/queryClient";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  UserMinus,
  Users,
  Trophy,
  Activity,
  Edit
} from "lucide-react";
import type { BetWithMarket, User, PositionWithMarket, MarketWithKol, UserProfile, Activity as ActivityType, Achievement, UserAchievement } from "@shared/schema";
import logoImage from "/favicon.png";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<MarketWithKol | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Determine if viewing own profile
  const isOwnProfile = username === "me" || username === currentUser?.username;
  const targetUsername = username === "me" ? currentUser?.username : username;

  // Get profile data
  const { data: profileData, isLoading: profileLoading } = useQuery<{
    user: User;
    profile: UserProfile;
    isFollowing: boolean;
  }>({
    queryKey: username === "me" ? ["/api/users/me/profile"] : ["/api/users", targetUsername, "profile"],
    queryFn: async () => {
      // Use dedicated "me" endpoint for own profile
      if (username === "me") {
        const res = await fetch(`/api/users/me/profile`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      }
      
      // Use username endpoint for other profiles
      if (!targetUsername) throw new Error("No username provided");
      const res = await fetch(`/api/users/${targetUsername}/profile`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: username === "me" || !!targetUsername,
  });

  const { data: bets = [] } = useQuery<BetWithMarket[]>({
    queryKey: ["/api/bets/user", profileData?.user.id],
    queryFn: async () => {
      if (!profileData?.user.id) return [];
      const res = await fetch(`/api/bets/user?userId=${profileData.user.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch bets");
      return res.json();
    },
    enabled: !!profileData?.user.id,
  });

  const { data: userPositions = [] } = useQuery<PositionWithMarket[]>({
    queryKey: ["/api/positions/user"],
    enabled: isOwnProfile,
  });

  // Fetch activities
  const { data: activities = [] } = useQuery<ActivityType[]>({
    queryKey: ["/api/activities", profileData?.user.id],
    enabled: !!profileData?.user.id,
  });

  // Fetch user achievements
  const { data: userAchievements = [] } = useQuery<(UserAchievement & { achievement: Achievement })[]>({
    queryKey: ["/api/users", profileData?.user.id, "achievements"],
    enabled: !!profileData?.user.id,
  });

  // Fetch all achievements to show locked ones
  const { data: allAchievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Authentication required");
      if (!profileData?.user.id) throw new Error("Invalid user");
      const res = await fetch(`/api/users/${profileData.user.id}/follow`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to follow user");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both possible query key formats
      if (username === "me") {
        queryClient.invalidateQueries({ queryKey: ["/api/users/me/profile"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/users", targetUsername, "profile"] });
      }
      toast({
        title: "Success",
        description: `You are now following ${targetUsername}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Authentication required");
      if (!profileData?.user.id) throw new Error("Invalid user");
      const res = await fetch(`/api/users/${profileData.user.id}/unfollow`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to unfollow user");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both possible query key formats
      if (username === "me") {
        queryClient.invalidateQueries({ queryKey: ["/api/users/me/profile"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/users", targetUsername, "profile"] });
      }
      toast({
        title: "Success",
        description: `You unfollowed ${targetUsername}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user",
        variant: "destructive",
      });
    },
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
      if (!currentUser) throw new Error("Authentication required");
      
      const endpoint = action === "buy" ? "/api/bets" : "/api/bets/sell";
      const body =
        action === "buy"
          ? {
              marketId,
              position,
              amount,
            }
          : {
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
      queryClient.invalidateQueries({ queryKey: ["/api/bets/user", profileData?.user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/positions/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/markets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities", profileData?.user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", targetUsername, "profile"] });
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

  if (profileLoading || !profileData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar balance={currentUser?.balance ? parseFloat(currentUser.balance) : 1000} username={currentUser?.username ?? undefined} />
        <div className="container mx-auto px-4 py-10">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-32 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const balance = currentUser?.balance ? parseFloat(currentUser.balance) : 1000;
  const totalProfit = profileData.profile.profitLoss ? parseFloat(profileData.profile.profitLoss) : 0;
  const winRate = profileData.profile.winRate ? parseFloat(profileData.profile.winRate) : 0;
  const roi = profileData.profile.roi ? parseFloat(profileData.profile.roi) : 0;
  
  const activeBets = bets.filter(b => b.status === "pending" || b.status === "open");
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
      <Navbar balance={balance} username={currentUser?.username ?? undefined} />

      <div className="container mx-auto px-4 py-10">
        {/* Profile Header */}
        <Card className="mb-10 p-8 border-border/60">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-border" data-testid="avatar-profile">
                <AvatarImage src={profileData.profile.avatarUrl ?? undefined} alt={targetUsername ?? "User"} />
                <AvatarFallback className="text-2xl">{targetUsername?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-display font-bold" data-testid="text-username">
                    {targetUsername}
                  </h1>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBioModalOpen(true)}
                      className="gap-2"
                      data-testid="button-edit-bio"
                    >
                      <Edit className="h-3 w-3" />
                      Edit Bio
                    </Button>
                  )}
                </div>
                {profileData.profile.bio ? (
                  <p className="text-muted-foreground mb-4 max-w-lg" data-testid="text-bio">
                    {profileData.profile.bio}
                  </p>
                ) : isOwnProfile ? (
                  <p className="text-muted-foreground mb-4 max-w-lg italic" data-testid="text-bio-empty">
                    No bio yet. Click "Edit Bio" to add one.
                  </p>
                ) : null}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-followers">
                      <strong>{profileData.profile.followersCount || 0}</strong> followers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span data-testid="text-following">
                      <strong>{profileData.profile.followingCount || 0}</strong> following
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!isOwnProfile && (
              <div>
                {!currentUser ? (
                  <Button disabled className="gap-2" data-testid="button-follow-disabled">
                    <UserPlus className="h-4 w-4" />
                    Login to Follow
                  </Button>
                ) : profileData.isFollowing ? (
                  <Button
                    variant="outline"
                    onClick={() => unfollowMutation.mutate()}
                    disabled={unfollowMutation.isPending}
                    className="gap-2"
                    data-testid="button-unfollow"
                  >
                    <UserMinus className="h-4 w-4" />
                    {unfollowMutation.isPending ? "Unfollowing..." : "Unfollow"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className="gap-2"
                    data-testid="button-follow"
                  >
                    <UserPlus className="h-4 w-4" />
                    {followMutation.isPending ? "Following..." : "Follow"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <Card className="p-6 hover-elevate transition-all border-border/60">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Total Bets</p>
                <p className="text-2xl font-bold tabular-nums" data-testid="text-total-bets">
                  {profileData.profile.totalBets || 0}
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
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">ROI</p>
                <p className={`text-2xl font-bold tabular-nums ${roi >= 0 ? 'text-success' : 'text-destructive'}`} data-testid="text-roi">
                  {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="activity" className="gap-2" data-testid="tab-activity">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="portfolio" className="gap-2" data-testid="tab-portfolio">
                <Wallet className="h-4 w-4" />
                Portfolio
              </TabsTrigger>
            )}
            <TabsTrigger value="following" className="gap-2" data-testid="tab-following">
              <Users className="h-4 w-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2" data-testid="tab-achievements">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="overflow-hidden border-border/60">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-xl font-semibold mb-1">Recent Activity</h2>
                <p className="text-sm text-muted-foreground">
                  {bets.length} total bets • Latest activity and performance
                </p>
              </div>

              {bets.length === 0 && activities.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No Activity Yet</p>
                  <p className="text-sm">Activity feed will show all bets and market updates</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="p-5 space-y-3">
                    {/* Show ALL bets, not just 10 */}
                    {bets.map((bet) => (
                      <div
                        key={bet.id}
                        onClick={() => handleBetClick(bet.market)}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border/60 hover-elevate transition-all cursor-pointer"
                        data-testid={`activity-bet-${bet.id}`}
                      >
                        <div className={`p-2 rounded-lg ${
                          bet.position === "YES" ? "bg-success/10" : "bg-destructive/10"
                        }`}>
                          {bet.position === "YES" ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {bet.position} bet on {bet.market.kol.name}
                            </p>
                            {getStatusBadge(bet.status)}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {bet.market.title}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-medium">{bet.shares} shares</span>
                            <span>•</span>
                            <span className="font-medium">{parseFloat(bet.amount).toFixed(2)} PTS</span>
                            {(bet.profit !== null && bet.profit !== undefined && parseFloat(bet.profit) !== 0) && (
                              <>
                                <span>•</span>
                                <span className={`font-bold ${parseFloat(bet.profit) >= 0 ? 'text-success' : 'text-destructive'}`}>
                                  {parseFloat(bet.profit) >= 0 ? '+' : ''}{parseFloat(bet.profit).toFixed(2)} PTS
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTime(bet.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Show other activities */}
                    {activities.map((activity) => {
                      const data = JSON.parse(activity.data);
                      let icon = <Activity className="h-4 w-4" />;
                      let title = "";
                      let description = "";

                      if (activity.type === "new_bet") {
                        icon = <Target className="h-4 w-4 text-primary" />;
                        title = `Placed a ${data.action} order`;
                        description = `${data.position} position on "${data.marketTitle}" for ${data.amount} PTS`;
                      } else if (activity.type === "bet_won") {
                        icon = <CheckCircle2 className="h-4 w-4 text-success" />;
                        title = "Won a bet";
                        description = `Profit: +${data.profit} PTS`;
                      } else if (activity.type === "bet_lost") {
                        icon = <XCircle className="h-4 w-4 text-destructive" />;
                        title = "Lost a bet";
                        description = `Loss: ${data.profit} PTS`;
                      }

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border/60 hover-elevate transition-all"
                          data-testid={`activity-${activity.id}`}
                        >
                          <div className="p-2 rounded-lg bg-muted">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1">{title}</p>
                            <p className="text-sm text-muted-foreground">{description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </TabsContent>

          {/* Portfolio Tab (only for own profile) */}
          {isOwnProfile && (
            <TabsContent value="portfolio">
              {/* Portfolio Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <Card className="p-6 hover-elevate transition-all border-border/60">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Current Balance</p>
                      <p className="text-2xl font-bold tabular-nums" data-testid="text-portfolio-balance">
                        {balance.toFixed(2)} PTS
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
                      <p className="text-2xl font-bold tabular-nums" data-testid="text-portfolio-active-bets">
                        {activeBets.length}
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
                      <p className="text-sm text-muted-foreground font-medium mb-1">Total Invested</p>
                      <p className="text-2xl font-bold tabular-nums" data-testid="text-portfolio-invested">
                        {totalInvested.toFixed(2)} PTS
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

                {bets.length === 0 ? (
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
                            <AvatarImage src={bet.market.kol.avatar ?? undefined} alt={bet.market.kol.name} />
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
                              {bet.profit !== null && bet.profit !== undefined && parseFloat(bet.profit) !== 0 && (
                                <div className={parseFloat(bet.profit) >= 0 ? "text-success font-bold" : "text-destructive font-bold"}>
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
            </TabsContent>
          )}

          {/* Following Tab */}
          <TabsContent value="following">
            <Card className="overflow-hidden border-border/60">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-xl font-semibold mb-1">Following</h2>
                <p className="text-sm text-muted-foreground">
                  Users and KOLs you follow
                </p>
              </div>

              <div className="p-16 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">Coming Soon</p>
                <p className="text-sm">View all users and KOLs you're following</p>
              </div>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card className="overflow-hidden border-border/60">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-xl font-semibold mb-1">Achievements</h2>
                <p className="text-sm text-muted-foreground">
                  {userAchievements.length} of {allAchievements.length} unlocked
                </p>
              </div>

              {allAchievements.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No Achievements Available</p>
                  <p className="text-sm">Achievements will be added soon</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allAchievements.map((achievement) => {
                      const isEarned = userAchievements.some(ua => ua.achievementId === achievement.id);
                      const earnedData = userAchievements.find(ua => ua.achievementId === achievement.id);

                      return (
                        <div
                          key={achievement.id}
                          className={`p-5 rounded-lg border transition-all ${
                            isEarned 
                              ? "border-primary/40 bg-primary/5 hover-elevate" 
                              : "border-border/60 opacity-60"
                          }`}
                          data-testid={`achievement-${achievement.id}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`text-4xl ${!isEarned && "grayscale opacity-50"}`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-base mb-1">
                                  {achievement.name}
                                </h3>
                                {isEarned && (
                                  <Badge className="bg-primary/20 text-primary border-primary/30">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Earned
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {achievement.description}
                              </p>
                              {earnedData && (
                                <p className="text-xs text-muted-foreground">
                                  Earned {formatTime(earnedData.earnedAt)}
                                </p>
                              )}
                              {!isEarned && (
                                <Badge variant="outline" className="text-xs mt-2">
                                  Locked
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bet Modal */}
      {isOwnProfile && (
        <BetModal
          open={betModalOpen}
          onClose={() => setBetModalOpen(false)}
          market={selectedMarket}
          userBalance={balance}
          userYesShares={
            selectedMarket && currentUser
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
            selectedMarket && currentUser
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
      )}

      {/* Edit Bio Modal */}
      {isOwnProfile && currentUser && (
        <EditBioModal
          open={bioModalOpen}
          onClose={() => setBioModalOpen(false)}
          userId={currentUser.id}
          currentBio={profileData?.profile.bio || null}
        />
      )}
    </div>
  );
}
