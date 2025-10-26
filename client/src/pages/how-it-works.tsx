import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Cpu, Database, Lock, Shield, TrendingUp, Zap } from "lucide-react";
import type { User } from "@shared/schema";

export default function HowItWorks() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={user?.balance ? parseFloat(user.balance) : 1000} username={user?.username ?? undefined} />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-4" data-testid="text-page-title">
            Technology & Architecture
          </h1>
          <p className="text-lg text-foreground/90 leading-relaxed">
            KOL Predict is a <span className="text-success font-semibold">real-time prediction market platform</span> built on cutting-edge web technologies and <span className="text-success font-semibold">automated market making</span>. We combine social metrics tracking with <span className="text-success font-semibold">bonding curve mechanics</span>, providing <span className="text-success font-semibold">fair and transparent</span> price discovery for KOL performance predictions.
          </p>
        </div>

        {/* Core Innovation */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-success" />
            Core Innovation
          </h2>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <p className="text-foreground/90 mb-6 leading-relaxed">
              Our platform introduces <span className="text-success font-semibold">Automated Bonding Curves</span> - a pricing mechanism that bases <span className="text-success font-semibold">real-time engagement signals</span> with <span className="text-success font-semibold">liquidity-based supply curves</span>. Each prediction market adjusts its price dynamically to both trading pressure and organic social engagement.
            </p>
            
            <div className="bg-background/60 border border-success/20 rounded-lg p-6 font-mono text-sm">
              <div className="text-success font-semibold mb-2">Pricing Formula:</div>
              <div className="text-foreground/80 mb-1">
                Price = <span className="text-success">P₀</span> + (<span className="text-success">S</span> × <span className="text-success">k</span>) × <span className="text-success">C</span>
              </div>
              <div className="text-xs text-muted-foreground mt-4 space-y-1">
                <div>Where <span className="text-success">P₀</span> = base price (0.01)</div>
                <div><span className="text-success">S</span> = supply (total shares sold)</div>
                <div><span className="text-success">k</span> = curve slope (1/10000)</div>
                <div><span className="text-success">C</span> = confidence multiplier</div>
              </div>
            </div>
          </Card>
        </div>

        {/* System Architecture */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-success" />
            System Architecture
          </h2>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-success mb-3">Data Flow:</h3>
                <div className="space-y-3 text-foreground/90">
                  <div className="flex items-start gap-3">
                    <div className="bg-success/10 text-success rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">1</div>
                    <div>
                      <span className="font-semibold">KOL Data Collection</span>
                      <p className="text-sm text-muted-foreground">Daily scraping of kolscan.io leaderboard → Real-time metrics → Pool creation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-success/10 text-success rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">2</div>
                    <div>
                      <span className="font-semibold">Market Generation</span>
                      <p className="text-sm text-muted-foreground">Automated market creation → Diverse prediction types → Dynamic pricing initialization</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-success/10 text-success rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">3</div>
                    <div>
                      <span className="font-semibold">Price Discovery</span>
                      <p className="text-sm text-muted-foreground">User bets → Bonding curve adjustment → Instant price updates → WebSocket broadcast</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-success/10 text-success rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">4</div>
                    <div>
                      <span className="font-semibold">Settlement & Payout</span>
                      <p className="text-sm text-muted-foreground">Market expiry → Fresh data scrape → Outcome validation → Automated bet settlement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-success/10 text-success rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">5</div>
                    <div>
                      <span className="font-semibold">Blockchain Integration</span>
                      <p className="text-sm text-muted-foreground">SOL deposits → Custodial hot wallet → Withdrawals with limits → Platform fee collection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Database className="h-8 w-8 text-success" />
            Technology Stack
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Backend */}
            <Card className="p-6 bg-card/50 backdrop-blur">
              <h3 className="text-xl font-semibold mb-4 text-success">Backend</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Express.js</span> - High-performance HTTP server
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">PostgreSQL</span> - Relational database with ACID guarantees
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Drizzle ORM</span> - Type-safe database operations
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">WebSocket Server</span> - Real-time price streaming
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Puppeteer</span> - Automated web scraping
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Node-cron</span> - Scheduled background tasks
                  </div>
                </li>
              </ul>
            </Card>

            {/* Frontend */}
            <Card className="p-6 bg-card/50 backdrop-blur">
              <h3 className="text-xl font-semibold mb-4 text-success">Frontend</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">React 18</span> - Modern UI framework
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Vite</span> - Lightning-fast build tool
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">TanStack Query</span> - Server state management
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Tailwind CSS</span> - Utility-first styling
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Shadcn UI</span> - Premium component library
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">WebSocket Client</span> - Live data synchronization
                  </div>
                </li>
              </ul>
            </Card>

            {/* Blockchain */}
            <Card className="p-6 bg-card/50 backdrop-blur">
              <h3 className="text-xl font-semibold mb-4 text-success">Blockchain</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Solana</span> - High-speed blockchain network
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">@solana/web3.js</span> - Blockchain integration SDK
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Custodial hot wallet</span> - Managed deposit system
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">WebSocket monitoring</span> - Real-time deposit detection
                  </div>
                </li>
              </ul>
            </Card>

            {/* Data Sources */}
            <Card className="p-6 bg-card/50 backdrop-blur">
              <h3 className="text-xl font-semibold mb-4 text-success">Data Sources</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">kolscan.io</span> - KOL performance leaderboard
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Twitter API v2</span> - Real-time social metrics
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">Daily automated scraping</span> - Fresh KOL data
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <div>
                    <span className="text-success font-semibold">On-demand validation</span> - Market resolution accuracy
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Key Modules */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Zap className="h-8 w-8 text-success" />
            Key Modules
          </h2>
          <div className="grid gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-success mb-3">Bonding Curve Engine</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Algorithmic curve pricing with constant slope to ensure predictable, fair liquidity. Calculates buy/sell quotes with precision decimal handling. Returns VWAP for multi-share trades.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-success mb-3">Market Generator</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Creates 9+ diverse prediction types: Rank Flippening, Profit Streaks, Follower Growth, Win Rate Comparisons. Prevents duplicate market types per KOL. Runs daily at 3 AM UTC.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-success mb-3">KOL Data Scraper</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Puppeteer-based scraping of kolscan.io leaderboard. Parses structured data: ranks, wins/losses, SOL gains, USD performance. Runs daily at 2 AM UTC with fallback error handling.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-success mb-3">Market Resolver</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Automated settlement every 5 minutes. Fetches fresh KOL data, validates outcomes, calculates payouts. Atomic transactions with row-level locking prevent race conditions.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-success mb-3">Deposit Monitor</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Real-time WebSocket connection to Solana network. Monitors hot wallet for incoming deposits every 10 seconds. Auto-credits user balances upon confirmation.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-success mb-3">Withdrawal Processor</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Queue-based withdrawal system running every 5 seconds. Validates balance, enforces limits, processes SOL transfers. Tracks transaction signatures and status.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Security & Fairness */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Shield className="h-8 w-8 text-success" />
            Security & Fairness
          </h2>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="text-success mt-1">✓</div>
                <div>
                  <span className="font-semibold">Deterministic pricing</span> - all quotes calculated server-side with immutable formulas
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-success mt-1">✓</div>
                <div>
                  <span className="font-semibold">Data freshness validation</span> - markets auto-cancel if KOL data is stale ({'>'}2 hours)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-success mt-1">✓</div>
                <div>
                  <span className="font-semibold">Atomic transactions</span> - PostgreSQL row-level locking prevents double-spending
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-success mt-1">✓</div>
                <div>
                  <span className="font-semibold">Real kolscan.io data</span> - no mock or fabricated metrics, all outcomes verifiable
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-success mt-1">✓</div>
                <div>
                  <span className="font-semibold">Rate limiting</span> - prevents abuse across all social and betting endpoints
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-success mt-1">✓</div>
                <div>
                  <span className="font-semibold">Input sanitization</span> - XSS prevention on all user-generated content
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-success mt-1">✓</div>
                <div>
                  <span className="font-semibold">Custodial security</span> - hot wallet with withdrawal limits and validation
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-success mt-1">✓</div>
                <div>
                  <span className="font-semibold">Transparent fee structure</span> - 2-5% platform fees on all bets, publicly tracked
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-time Architecture */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Lock className="h-8 w-8 text-success" />
            Real-time Architecture
          </h2>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <p className="text-foreground/90 mb-6 leading-relaxed">
              KOL Predict uses <span className="text-success font-semibold">WebSocket connections</span> to deliver instant updates without polling. Every bet, market update, and resolution event is broadcast to all connected clients in real-time.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-success mb-3">Live Updates</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li>• Market price changes broadcast instantly</li>
                  <li>• Bet feed updates in chronological order</li>
                  <li>• Market resolution notifications</li>
                  <li>• Balance updates after settlements</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success mb-3">Performance</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li>• Sub-100ms latency for price updates</li>
                  <li>• Concurrent connection support via ws library</li>
                  <li>• Automatic reconnection with exponential backoff</li>
                  <li>• Efficient message broadcasting to all clients</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Platform Philosophy */}
        <div className="mb-12">
          <Card className="p-8 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <h2 className="text-2xl font-display font-bold mb-4 text-success">Platform Philosophy</h2>
            <p className="text-foreground/90 leading-relaxed">
              We believe in <span className="font-semibold">transparent markets</span> and <span className="font-semibold">fair pricing</span>. All formulas are open and deterministic. Our platform commits to building trust through technical excellence and operational transparency. Every bet placed contributes to market liquidity, and all outcomes are backed by real, verifiable data from kolscan.io. The architecture is designed for scale, security, and speed - ensuring that as the platform grows, performance and fairness remain constant.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
