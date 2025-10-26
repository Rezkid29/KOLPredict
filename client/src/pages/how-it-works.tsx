import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Activity, BarChart3, Database, Lock, Shield, TrendingUp, Zap } from "lucide-react";
import type { User } from "@shared/schema";

export default function HowItWorks() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={user?.balance ? parseFloat(user.balance) : 1000} username={user?.username ?? undefined} />

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by Constant Product AMM</span>
          </div>
          <h1 className="text-6xl font-display font-bold mb-6" style={{ color: 'hsl(48 95% 60% / 1)' }}>
            How It Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A real-time prediction market using automated market making with constant product formulas. 
            Every bet adjusts prices dynamically through <span className="text-primary font-semibold">k = yesPool × noPool</span>
          </p>
        </div>

        {/* AMM Core Mechanics */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-4xl font-display font-bold">Automated Market Maker</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-primary/20 bg-gradient-to-br from-card to-card/50">
              <h3 className="text-2xl font-bold mb-4 text-primary">Price Formula</h3>
              <div className="bg-background/80 rounded-lg p-6 font-mono text-sm border border-primary/10 mb-4">
                <div className="text-primary font-semibold mb-3">YES Price Calculation:</div>
                <div className="text-foreground/90 mb-1">
                  Price(YES) = <span style={{ color: 'hsl(69.64deg 70% 60%)' }}>yesPool</span> / (<span style={{ color: 'hsl(69.64deg 70% 60%)' }}>yesPool</span> + <span className="text-chart-4">noPool</span>)
                </div>
                <div className="text-foreground/90 mt-4">
                  Price(NO) = <span className="text-chart-4">noPool</span> / (<span style={{ color: 'hsl(69.64deg 70% 60%)' }}>yesPool</span> + <span className="text-chart-4">noPool</span>)
                </div>
                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-primary/10">
                  Prices always sum to 1.00 — representing 100% probability distribution
                </div>
              </div>
            </Card>

            <Card className="p-8 border-chart-2/20 bg-gradient-to-br from-card to-card/50">
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'hsl(69.64deg 70% 60%)' }}>Constant Product</h3>
              <div className="bg-background/80 rounded-lg p-6 font-mono text-sm border border-chart-2/10 mb-4">
                <div className="font-semibold mb-3" style={{ color: 'hsl(69.64deg 70% 60%)' }}>Invariant Formula:</div>
                <div className="text-2xl font-bold text-center py-4">
                  k = <span style={{ color: 'hsl(69.64deg 70% 60%)' }}>yesPool</span> × <span className="text-chart-4">noPool</span>
                </div>
                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-chart-2/10">
                  After every trade, the product k remains constant. This creates natural slippage and price discovery.
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Trade Mechanics */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-chart-4" />
            </div>
            <h2 className="text-4xl font-display font-bold">Trade Execution</h2>
          </div>

          <Card className="p-8 border-chart-4/20">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-chart-4">Buying Shares</h3>
                <div className="bg-background/60 rounded-lg p-6 font-mono text-sm border border-chart-4/10">
                  <div className="text-muted-foreground mb-2">// When buying YES with amount $X:</div>
                  <div className="text-foreground/90">
                    k = yesPool × noPool
                  </div>
                  <div className="text-foreground/90 mt-2">
                    newYesPool = yesPool + <span className="text-chart-4">amount</span>
                  </div>
                  <div className="text-foreground/90 mt-2">
                    newNoPool = k / newYesPool
                  </div>
                  <div className="font-semibold mt-3" style={{ color: 'hsl(69.64deg 70% 60%)' }}>
                    sharesReceived = noPool - newNoPool
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Your bet amount increases the YES pool, which decreases the NO pool (to maintain k). 
                  The difference in NO pool size is the shares you receive.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-warning">Selling Shares</h3>
                <div className="bg-background/60 rounded-lg p-6 font-mono text-sm border border-warning/10">
                  <div className="text-muted-foreground mb-2">// When selling X YES shares:</div>
                  <div className="text-foreground/90">
                    k = yesPool × noPool
                  </div>
                  <div className="text-foreground/90 mt-2">
                    newYesPool = yesPool - <span className="text-warning">shares</span>
                  </div>
                  <div className="text-foreground/90 mt-2">
                    newNoPool = k / newYesPool
                  </div>
                  <div className="font-semibold mt-3" style={{ color: 'hsl(69.64deg 70% 60%)' }}>
                    payout = newNoPool - noPool
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Returning shares decreases the YES pool, which increases the NO pool. 
                  The NO pool increase is your payout amount.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* System Architecture */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-chart-1" />
            </div>
            <h2 className="text-4xl font-display font-bold">Platform Architecture</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-l-primary hover:bg-card/80 transition-colors">
              <h3 className="text-lg font-bold mb-3 text-primary">Data Pipeline</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Daily kolscan.io scraping with Puppeteer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Real-time KOL metrics updates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Automated market generation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  PostgreSQL with Drizzle ORM
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-l-4 border-l-chart-2 hover:bg-card/80 transition-colors">
              <h3 className="text-lg font-bold mb-3" style={{ color: 'hsl(69.64deg 70% 60%)' }}>Real-Time Engine</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: 'hsl(69.64deg 70% 60%)' }}>•</span>
                  WebSocket price broadcasting
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: 'hsl(69.64deg 70% 60%)' }}>•</span>
                  Instant bet confirmation
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: 'hsl(69.64deg 70% 60%)' }}>•</span>
                  Live market feed updates
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1" style={{ color: 'hsl(69.64deg 70% 60%)' }}>•</span>
                  Sub-100ms latency
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-l-4 border-l-chart-4 hover:bg-card/80 transition-colors">
              <h3 className="text-lg font-bold mb-3 text-chart-4">Settlement</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-chart-4 mt-1">•</span>
                  Auto-resolution every 5 minutes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-chart-4 mt-1">•</span>
                  Fresh data validation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-chart-4 mt-1">•</span>
                  Atomic transaction processing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-chart-4 mt-1">•</span>
                  Instant payout distribution
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Security Features */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-4xl font-display font-bold">Security & Fairness</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <Lock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-4">Trade Protections</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-muted-foreground">Max trade size: 40% of pool depth</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-muted-foreground">Price bounds: 0.01 to 0.99</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-muted-foreground">Atomic PostgreSQL transactions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-muted-foreground">2% platform fee (transparent)</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-chart-4/5 to-chart-4/10 border-chart-4/20">
              <Zap className="h-8 w-8 text-chart-4 mb-4" />
              <h3 className="text-lg font-bold mb-4">Data Integrity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-chart-4 mt-0.5">✓</span>
                  <span className="text-muted-foreground">Real kolscan.io data only</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-chart-4 mt-0.5">✓</span>
                  <span className="text-muted-foreground">Auto-cancel if data is stale (&gt;2hrs)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-chart-4 mt-0.5">✓</span>
                  <span className="text-muted-foreground">Rate limiting on all endpoints</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-chart-4 mt-0.5">✓</span>
                  <span className="text-muted-foreground">Deterministic pricing formulas</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Price Impact Example */}
        <div className="mb-20">
          <Card className="p-10 bg-gradient-to-br from-primary/10 via-chart-2/5 to-chart-4/10 border-primary/20">
            <h2 className="text-3xl font-display font-bold mb-6 text-center">Real Trade Example</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Initial Pools</div>
                <div className="text-2xl font-bold" style={{ color: 'hsl(69.64deg 70% 60%)' }}>10,000 YES</div>
                <div className="text-2xl font-bold text-chart-4">10,000 NO</div>
                <div className="text-sm text-primary mt-2">Price: 0.50</div>
              </div>
              <div className="text-center flex items-center justify-center">
                <div className="text-4xl text-primary">→</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">After $100 YES Buy</div>
                <div className="text-2xl font-bold" style={{ color: 'hsl(69.64deg 70% 60%)' }}>10,100</div>
                <div className="text-2xl font-bold text-chart-4">9,901</div>
                <div className="text-sm text-warning mt-2">New Price: 0.505</div>
              </div>
            </div>
            <div className="bg-background/60 rounded-lg p-6 border border-primary/10">
              <div className="font-mono text-sm space-y-2">
                <div className="text-muted-foreground">k = 10,000 × 10,000 = 100,000,000</div>
                <div className="text-foreground/90">newNoPool = 100,000,000 / 10,100 = 9,901</div>
                <div className="font-semibold" style={{ color: 'hsl(69.64deg 70% 60%)' }}>shares = 10,000 - 9,901 = 99 shares</div>
                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-primary/10">
                  You spent $100 and received 99 shares (avg price $1.01) due to slippage from price impact
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tech Stack */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-chart-3" />
            </div>
            <h2 className="text-4xl font-display font-bold">Technology Stack</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Frontend", items: ["React 18", "Vite", "TanStack Query", "Tailwind CSS"] },
              { title: "Backend", items: ["Express.js", "PostgreSQL", "Drizzle ORM", "WebSocket"] },
              { title: "Blockchain", items: ["Solana", "@solana/web3.js", "Hot Wallet", "Real-time monitoring"] },
              { title: "Automation", items: ["Node-cron", "Puppeteer", "Auto-resolution", "Data validation"] }
            ].map((stack, i) => (
              <Card key={i} className="p-5 hover:border-primary/40 transition-colors">
                <h3 className="font-bold mb-3 text-primary">{stack.title}</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {stack.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}