import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MarketWithKol } from "@shared/schema";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface BetModalProps {
  open: boolean;
  onClose: () => void;
  market: MarketWithKol | null;
  type: "buy" | "sell";
  userBalance: number;
  onConfirm: (marketId: string, type: "buy" | "sell", amount: number, shares: number) => void;
}

export function BetModal({ open, onClose, market, type, userBalance, onConfirm }: BetModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [shares, setShares] = useState<string>("1");

  if (!market) return null;

  const price = parseFloat(market.price);
  const numShares = parseInt(shares) || 0;
  const totalCost = price * numShares;
  const potentialPayout = type === "buy" ? totalCost * 1.8 : totalCost * 0.9;

  const handleConfirm = () => {
    onConfirm(market.id, type, totalCost, numShares);
    setAmount("");
    setShares("1");
    onClose();
  };

  const presetAmounts = [10, 50, 100, 500];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-bet">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "buy" ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            {type === "buy" ? "Buy Shares" : "Sell Shares"}
          </DialogTitle>
          <DialogDescription>
            Place your bet on this KOL market
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Market info */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar className="h-12 w-12">
              <AvatarImage src={market.kol.avatar} alt={market.kol.name} />
              <AvatarFallback>{market.kol.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{market.kol.name}</p>
                <Badge variant="secondary" className="text-xs">{market.kol.tier}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {market.title}
              </p>
            </div>
          </div>

          {/* Shares input */}
          <div className="space-y-2">
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              type="number"
              min="1"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="Enter shares"
              className="text-lg font-semibold"
              data-testid="input-shares"
            />
          </div>

          {/* Preset amounts */}
          <div className="space-y-2">
            <Label>Quick Amount</Label>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => {
                const presetShares = Math.floor(preset / price);
                return (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setShares(presetShares.toString())}
                    className="font-semibold"
                    data-testid={`button-preset-${preset}`}
                  >
                    ${preset}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Calculation breakdown */}
          <div className="space-y-3 p-4 rounded-lg bg-card border border-card-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per share</span>
              <span className="font-semibold tabular-nums">{price.toFixed(4)} PTS</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shares</span>
              <span className="font-semibold tabular-nums">{numShares}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="font-medium">Total Cost</span>
              <span className="text-lg font-bold tabular-nums" data-testid="text-total-cost">
                {totalCost.toFixed(2)} PTS
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Potential Payout</span>
              <span className="font-semibold text-success tabular-nums" data-testid="text-potential-payout">
                {potentialPayout.toFixed(2)} PTS
              </span>
            </div>
          </div>

          {/* Balance check */}
          {totalCost > userBalance && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>Insufficient balance. You need {(totalCost - userBalance).toFixed(2)} more PTS.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel-bet"
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 font-semibold ${
                type === "buy" 
                  ? "bg-success hover:bg-success border-success-border" 
                  : "bg-destructive hover:bg-destructive"
              }`}
              onClick={handleConfirm}
              disabled={numShares <= 0 || totalCost > userBalance}
              data-testid="button-confirm-bet"
            >
              Confirm {type === "buy" ? "Buy" : "Sell"}
            </Button>
          </div>

          {/* Risk warning */}
          <p className="text-xs text-muted-foreground text-center">
            Prediction markets involve risk. Only bet what you can afford to lose.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
