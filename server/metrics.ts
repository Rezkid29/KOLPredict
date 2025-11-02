import type { Request, Response } from "express";

// Lightweight wrapper around prom-client with graceful fallback
let promClient: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  promClient = require("prom-client");
} catch (_e) {
  promClient = null;
}

// Minimal in-memory fallback registry if prom-client isn't available
type Counter = { inc: (labels?: Record<string, string>, value?: number) => void };
const noopCounter: Counter = { inc: () => void 0 };

class FallbackRegistry {
  private counters = new Map<string, number>();
  counter(_config: any): Counter {
    return {
      inc: (_labels?: Record<string, string>, value: number = 1) => {
        const key = _config.name as string;
        const prev = this.counters.get(key) || 0;
        this.counters.set(key, prev + value);
      },
    };
  }
  async metrics(): Promise<string> {
    // Expose a very simple text format
    return Array.from(this.counters.entries())
      .map(([k, v]) => `# TYPE ${k} counter\n${k} ${v}`)
      .join("\n") + "\n";
  }
}

const registry = promClient ? new promClient.Registry() : new FallbackRegistry();
if (promClient) {
  promClient.collectDefaultMetrics({ register: registry });
}

function counter(config: { name: string; help: string; labelNames?: string[] }): Counter {
  if (promClient) {
    return new promClient.Counter({ ...config, registers: [registry] });
  }
  return (registry as any).counter(config);
}

export const metrics = {
  // Resolution run counters
  resolutionResolvedTotal: counter({ name: "market_resolutions_total", help: "Number of markets resolved successfully" }),
  resolutionFailedTotal: counter({ name: "market_resolution_failures_total", help: "Number of market resolution failures" }),
  preScrapeRunsTotal: counter({ name: "pre_scrape_runs_total", help: "Number of pre-scrape runs before resolution" }),
  preScrapeFallbacksTotal: counter({ name: "pre_scrape_fallbacks_total", help: "Number of per-market fallback refreshes during resolution" }),
  safetyNetResolvedTotal: counter({ name: "safety_net_resolved_total", help: "Number of overdue markets resolved by safety net" }),
  safetyNetCancelledTotal: counter({ name: "safety_net_cancelled_total", help: "Number of overdue markets cancelled by safety net" }),

  async metricsText(): Promise<string> {
    if (promClient) {
      return await registry.metrics();
    }
    return await (registry as any).metrics();
  },
};

export async function metricsHandler(_req: Request, res: Response) {
  try {
    const output = await metrics.metricsText();
    res.setHeader("Content-Type", "text/plain; version=0.0.4");
    res.send(output);
  } catch (e: any) {
    res.status(500).send(`metrics error: ${e?.message || "unknown"}`);
  }
}
