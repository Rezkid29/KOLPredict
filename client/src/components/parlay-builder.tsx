import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2 } from "lucide-react";

export type ParlayLegView = {
  marketId: string;
  title: string;
  position: "YES" | "NO";
  price: number;
};

interface Props {
  legs: ParlayLegView[];
  onRemove: (marketId: string) => void;
  stake: number;
  setStake: (n: number) => void;
  quoting: boolean;
  quote?: { combinedOdds: string; potentialPayout: string; marginApplied: string } | null;
  error?: string | null;
  onCreate: () => void;
  disabled?: boolean;
}

export default function ParlayBuilder({ legs, onRemove, stake, setStake, quoting, quote, error, onCreate, disabled }: Props) {
  const canCreate = legs.length >= 2 && legs.length <= 3 && !quoting && !error && !disabled;
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Parlay Builder</h3>
        <Badge variant="secondary">{legs.length} / 3 legs</Badge>
      </div>

      <div className="space-y-2">
        {legs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add 2–3 legs from market cards.</p>
        ) : (
          legs.map((leg) => (
            <div key={`${leg.marketId}-${leg.position}`} className="flex items-center justify-between rounded-md border p-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{leg.title}</p>
                <p className="text-xs text-muted-foreground">{leg.position} @ {leg.price.toFixed(2)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onRemove(leg.marketId)} aria-label="Remove leg">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <label className="text-sm font-medium">Stake</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            step={1}
            value={Number.isFinite(stake) ? stake : 0}
            onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
          />
          <Button variant="outline" onClick={() => setStake(10)}>10</Button>
          <Button variant="outline" onClick={() => setStake(25)}>25</Button>
          <Button variant="outline" onClick={() => setStake(50)}>50</Button>
        </div>
      </div>

      <div className="rounded-md border p-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Combined Odds</span>
          <span className="font-semibold tabular-nums">{quote ? Number(quote.combinedOdds).toFixed(2) + 'x' : '-'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Potential Payout</span>
          <span className="font-semibold tabular-nums">{quote ? `$${Number(quote.potentialPayout).toFixed(2)}` : '-'}</span>
        </div>
        {quote && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Margin</span>
            <span className="text-xs">{(Number(quote.marginApplied) * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      <Button className="w-full" disabled={!canCreate} onClick={onCreate}>
        {quoting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Quoting...
          </>
        ) : (
          <>Create Parlay</>
        )}
      </Button>
    </Card>
  );
}
