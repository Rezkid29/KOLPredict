import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Wallet, Trophy, BarChart3, Menu, X, LogOut, MessageCircle, MessageSquare, HelpCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import logoImage from "@assets/Gemini_Generated_Image_oel790oel790oel7_1761209354461.png";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NavbarProps {
  balance?: number;
  username?: string;
}

export function Navbar({ balance = 1000, username }: NavbarProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const result = await apiRequest("GET", "/api/notifications");
      return result.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest(`/api/notifications/${notificationId}/read`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-colors cursor-pointer" data-testid="link-home">
              <img src={logoImage} alt="KOL Predict Logo" className="h-6 w-6" />
              <span className="text-xl font-display font-bold text-foreground">KOL Predict</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            <Link href="/">
              <div data-testid="link-markets">
                <Button 
                  variant={location === "/" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Markets
                </Button>
              </div>
            </Link>
            <Link href="/portfolio">
              <div data-testid="link-portfolio">
                <Button 
                  variant={location === "/portfolio" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Portfolio
                </Button>
              </div>
            </Link>
            <Link href="/leaderboard">
              <div data-testid="link-leaderboard">
                <Button 
                  variant={location === "/leaderboard" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Button>
              </div>
            </Link>
            <Link href="/forum">
              <div data-testid="link-forum">
                <Button 
                  variant={location === "/forum" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Forum
                </Button>
              </div>
            </Link>
            <Link href="/messages">
              <div data-testid="link-messages">
                <Button 
                  variant={location === "/messages" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </Button>
              </div>
            </Link>
            <Link href="/help">
              <div data-testid="link-help">
                <Button 
                  variant={location === "/help" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Help
                </Button>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    data-testid="badge-unread-count"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b border-border">
                <p className="font-semibold">Notifications</p>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                )}
              </div>
              <ScrollArea className="max-h-96">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.slice(0, 10).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-3 cursor-pointer ${!notification.isRead ? "bg-primary/5" : ""}`}
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 ml-2" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop wallet display */}
          <Link href="/wallet">
            <div className="hidden sm:flex items-center gap-3 rounded-lg bg-card border border-card-border px-4 py-2 hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid="wallet-display">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Balance</span>
                <span className="text-lg font-semibold tabular-nums" data-testid="text-balance">
                  {balance.toFixed(2)} PTS
                </span>
              </div>
            </div>
          </Link>

          {/* Mobile wallet display */}
          <Link href="/wallet">
            <div className="sm:hidden flex items-center gap-2 rounded-lg bg-card border border-card-border px-3 py-1.5 hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid="wallet-display-mobile">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold tabular-nums" data-testid="text-balance-mobile">
                {balance.toFixed(0)}
              </span>
            </div>
          </Link>
          
          {username && (
            <Link href={`/profile/${username}`}>
              <Badge variant="secondary" className="hidden sm:flex px-3 py-2 text-sm hover-elevate active-elevate-2 transition-all cursor-pointer" data-testid="badge-username">
                {username}
              </Badge>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img src={logoImage} alt="KOL Predict Logo" className="h-5 w-5" />
                  KOL Predict
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {username && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
                    <p className="font-semibold">{username}</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-card border border-card-border">
                  <p className="text-xs text-muted-foreground mb-1">Balance</p>
                  <p className="text-xl font-bold tabular-nums">{balance.toFixed(2)} PTS</p>
                </div>
                <nav className="space-y-2">
                  <Link href="/">
                    <Button 
                      variant={location === "/" ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-link-markets"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Markets
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button 
                      variant={location === "/portfolio" ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-link-portfolio"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Portfolio
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button 
                      variant={location === "/leaderboard" ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-link-leaderboard"
                    >
                      <Trophy className="h-4 w-4" />
                      Leaderboard
                    </Button>
                  </Link>
                  <Link href="/forum">
                    <Button 
                      variant={location === "/forum" ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-link-forum"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Forum
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button 
                      variant={location === "/messages" ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-link-messages"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                  <Link href="/wallet">
                    <Button 
                      variant={location === "/wallet" ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-link-wallet"
                    >
                      <Wallet className="h-4 w-4" />
                      Wallet
                    </Button>
                  </Link>
                  <Link href="/help">
                    <Button 
                      variant={location === "/help" ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-link-help"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Help
                    </Button>
                  </Link>
                </nav>
                <div className="pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={logout}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
