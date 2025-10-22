import { Link, useLocation } from "wouter";
import { Wallet, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  balance?: number;
  username?: string;
}

export function Navbar({ balance = 1000, username }: NavbarProps) {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-colors cursor-pointer" data-testid="link-home">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-display font-bold">KOL Market</span>
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
                  <TrendingUp className="h-4 w-4" />
                  Markets
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-card border border-card-border px-4 py-2" data-testid="wallet-display">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Balance</span>
              <span className="text-lg font-semibold tabular-nums" data-testid="text-balance">
                {balance.toFixed(2)} PTS
              </span>
            </div>
          </div>
          
          {username && (
            <Badge variant="secondary" className="hidden sm:flex px-3 py-2 text-sm" data-testid="badge-username">
              {username}
            </Badge>
          )}
        </div>
      </div>
    </nav>
  );
}
