import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PerformanceChartProps {
  data: Array<{ time: string; yesPrice: number; noPrice: number }>;
  color?: string;
}

export function PerformanceChart({ data, color = "hsl(var(--success))" }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <XAxis 
          dataKey="time" 
          hide 
        />
        <YAxis 
          hide 
          domain={[0, 1]}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const yp = Number(payload[0].payload.yesPrice) || 0;
              const np = Number(payload[0].payload.noPrice) || 0;
              return (
                <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-lg">
                  <div className="text-xs text-muted-foreground mb-1">{payload[0].payload.time}</div>
                  <div className="text-sm font-semibold text-success tabular-nums">
                    YES: ${yp.toFixed(2)} ({(yp * 100).toFixed(0)}%)
                  </div>
                  <div className="text-sm font-semibold text-destructive tabular-nums">
                    NO: ${np.toFixed(2)} ({(np * 100).toFixed(0)}%)
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line 
          type="monotone" 
          dataKey="yesPrice" 
          stroke="hsl(var(--success))"
          strokeWidth={2}
          dot={false}
          animationDuration={300}
        />
        <Line 
          type="monotone" 
          dataKey="noPrice" 
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          dot={false}
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
