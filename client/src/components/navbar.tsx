import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Wallet, Trophy, BarChart3, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import logoImage from "@assets/Gemini_Generated_Image_oel790oel790oel7_1761209354461.png";

interface NavbarProps {
  balance?: number;
  username?: string;
}

export function Navbar({ balance = 1000, username }: NavbarProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

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
            <Link href="/wallet">
              <div data-testid="link-wallet">
                <Button 
                  variant={location === "/wallet" ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
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
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop wallet display */}
          <div className="hidden sm:flex items-center gap-3 rounded-lg bg-card border border-card-border px-4 py-2" data-testid="wallet-display">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Balance</span>
              <span className="text-lg font-semibold tabular-nums" data-testid="text-balance">
                {balance.toFixed(2)} PTS
              </span>
            </div>
          </div>

          {/* Mobile wallet display */}
          <div className="sm:hidden flex items-center gap-2 rounded-lg bg-card border border-card-border px-3 py-1.5" data-testid="wallet-display-mobile">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold tabular-nums" data-testid="text-balance-mobile">
              {balance.toFixed(0)}
            </span>
          </div>
          
          {username && (
            <Badge variant="secondary" className="hidden sm:flex px-3 py-2 text-sm" data-testid="badge-username">
              {username}
            </Badge>
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
