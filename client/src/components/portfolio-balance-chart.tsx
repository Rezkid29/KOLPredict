import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PortfolioTimeframeKey = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

type BalanceHistoryPoint = {
  timestamp: string;
  balance: number;
};

export type BalanceHistoryResponse = {
  range: PortfolioTimeframeKey;
  points: BalanceHistoryPoint[];
  changeValue: number;
  changePercent: number;
};

type PortfolioBalanceChartProps = {
  range: PortfolioTimeframeKey;
  onRangeChange: (range: PortfolioTimeframeKey) => void;
  data?: BalanceHistoryResponse;
  isLoading?: boolean;
  error?: Error | null;
};

const TIMEFRAME_LABELS: Record<PortfolioTimeframeKey, string> = {
  "1D": "1D",
  "1W": "1W",
  "1M": "1M",
  "3M": "3M",
  "1Y": "1Y",
  ALL: "All",
};

const formatBalance = (value: number) =>
  `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} PTS`;

const axisFormatter = (iso: string, range: PortfolioTimeframeKey) => {
  const date = new Date(iso);
  if (range === "1D") {
    return date.toLocaleTimeString("en-US", { hour: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const tooltipFormatter = (iso: string, range: PortfolioTimeframeKey) => {
  const date = new Date(iso);
  if (range === "1D") {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function PortfolioBalanceChart({
  range,
  onRangeChange,
  data,
  isLoading,
  error,
}: PortfolioBalanceChartProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const chartPoints = data?.points ?? [];

  const summary = useMemo(() => {
    if (!data) {
      return {
        current: 0,
        changeValue: 0,
        changePercent: 0,
      };
    }

    const current = chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].balance : 0;
    return {
      current,
      changeValue: data.changeValue,
      changePercent: data.changePercent,
    };
  }, [chartPoints, data]);

  const displayedBalance = hoverValue ?? summary.current;
  const isOverallGain = (data?.changeValue ?? 0) >= 0;
  const strokeColor = isOverallGain ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Portfolio Value</p>
          <p className="text-3xl font-bold tabular-nums">
            {formatBalance(displayedBalance)}
          </p>
          {data && (
            <div
              className={cn(
                "text-sm font-semibold tabular-nums",
                data.changeValue >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {data.changeValue >= 0 ? "+" : ""}
              {formatBalance(Math.abs(data.changeValue))}
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                ({data.changePercent >= 0 ? "+" : ""}
                {Math.abs(data.changePercent).toFixed(2)}%)
              </span>
            </div>
          )}
          {error && (
            <p className="text-xs text-destructive">Failed to load balance history.</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(Object.keys(TIMEFRAME_LABELS) as PortfolioTimeframeKey[]).map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 px-3 text-xs font-semibold transition-colors",
                range === option
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onRangeChange(option)}
              disabled={isLoading && range === option}
            >
              {TIMEFRAME_LABELS[option]}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
            Loading balance history…
          </div>
        ) : chartPoints.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
            No balance history yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartPoints}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              onMouseLeave={() => setHoverValue(null)}
            >
              <defs>
                <linearGradient id="portfolioGradientPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="portfolioGradientNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(value) => axisFormatter(String(value), range)}
                minTickGap={32}
              />
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip
                cursor={{
                  stroke: strokeColor,
                  strokeWidth: 1,
                  strokeOpacity: 0.2,
                }}
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const point = payload[0].payload as BalanceHistoryPoint;
                  setHoverValue(point.balance);
                  return (
                    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
                      <div className="text-xs text-muted-foreground">
                        {tooltipFormatter(point.timestamp, range)}
                      </div>
                      <div className="text-sm font-semibold tabular-nums">
                        {formatBalance(point.balance)}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={strokeColor}
                strokeWidth={2.4}
                fill={isOverallGain ? "url(#portfolioGradientPositive)" : "url(#portfolioGradientNegative)"}
                fillOpacity={1}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
