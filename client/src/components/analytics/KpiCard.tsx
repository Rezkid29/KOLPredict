import { Card } from "@/components/ui/card";

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "destructive";
};

export function KpiCard({ label, value, hint, tone = "default" }: KpiCardProps) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
      ? "text-warning"
      : tone === "destructive"
      ? "text-destructive"
      : "text-primary";

  return (
    <Card className="p-4 border-border/60">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${toneClass}`}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
    </Card>
  );
}
