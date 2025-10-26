
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/auth-modal";
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Lock,
  Sparkles,
  Activity,
  Trophy,
  ArrowRight
} from "lucide-react";
import logoImage from "@assets/Gemini_Generated_Image_oel790oel790oel7_1761209354461.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleAuthSuccess = (userId: string) => {
    // Store userId in localStorage to sync with useAuth hook
    localStorage.setItem("userId", userId);
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));
    setAuthModalOpen(false);
    // Small delay to ensure state updates propagate
    setTimeout(() => {
      setLocation("/markets");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="KOL Predict Logo" className="h-6 w-6" />
            <span className="text-xl font-display font-bold text-foreground">KOL Predict</span>
          </div>
          <Button onClick={() => setAuthModalOpen(true)} className="gap-2 auth-button-animated">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge
              variant="outline"
              className="gap-2 px-4 py-2.5 border-primary/40 text-primary backdrop-blur-sm bg-background/50"
            >
              <Sparkles className="h-4 w-4" />
              Powered by Constant Product AMM
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-tight">
              <span className="text-white">Bet on</span>{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Influence
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Trade prediction markets on Key Opinion Leader performance. Bet on rankings, P&L, win ratios, and real-time influence metrics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
              <Button 
                size="lg" 
                onClick={() => setAuthModalOpen(true)}
                className="gap-2 text-lg px-8 py-6 auth-button-animated"
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Start Trading
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="gap-2 text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20" id="how-it-works">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A real-time prediction market using automated market making with constant product formulas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover-elevate transition-all">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Live Markets</h3>
            <p className="text-muted-foreground">
              Trade on real-time KOL performance metrics including follower counts, rankings, and P&L ratios from kolscan.io.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20 hover-elevate transition-all">
            <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-chart-2" />
            </div>
            <h3 className="text-xl font-bold mb-3">Dynamic Pricing</h3>
            <p className="text-muted-foreground">
              Prices adjust automatically based on market activity using constant product AMM (k = yesPool × noPool).
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-success/5 to-success/10 border-success/20 hover-elevate transition-all">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Settlement</h3>
            <p className="text-muted-foreground">
              Markets resolve automatically when conditions are met, with instant payouts to winning positions.
            </p>
          </Card>
        </div>

        {/* Security & Trust */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Secure & Transparent</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Built for Trust
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50 border-border">
              <Lock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-3">Trade Protections</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Max trade size: 40% of pool depth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Price bounds: 0.01 to 0.99</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Atomic database transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>2% transparent platform fee</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-card/50 border-border">
              <Activity className="h-8 w-8 text-chart-2 mb-4" />
              <h3 className="text-lg font-bold mb-3">Data Integrity</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-chart-2 mt-0.5">✓</span>
                  <span>Real kolscan.io data only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-chart-2 mt-0.5">✓</span>
                  <span>Auto-cancel if data is stale (&gt;2hrs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-chart-2 mt-0.5">✓</span>
                  <span>Rate limiting on all endpoints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-chart-2 mt-0.5">✓</span>
                  <span>Deterministic pricing formulas</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <div className="text-3xl md:text-4xl font-bold">1000+</div>
              </div>
              <div className="text-sm text-muted-foreground">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-chart-2" />
                <div className="text-3xl md:text-4xl font-bold">50+</div>
              </div>
              <div className="text-sm text-muted-foreground">Live Markets</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-success" />
                <div className="text-3xl md:text-4xl font-bold">100K+</div>
              </div>
              <div className="text-sm text-muted-foreground">Points Traded</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <div className="text-3xl md:text-4xl font-bold">24/7</div>
              </div>
              <div className="text-sm text-muted-foreground">Market Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Ready to Start Trading?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of traders betting on KOL influence. Get 1000 PTS to start.
          </p>
          <Button 
            size="lg" 
            onClick={() => setAuthModalOpen(true)}
            className="gap-2 text-lg px-8 py-6 auth-button-animated"
          >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="KOL Predict Logo" className="h-5 w-5" />
              <span className="text-sm text-muted-foreground">© 2025 KOL Predict. All rights reserved.</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Trade responsibly. Market outcomes are not guaranteed.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
