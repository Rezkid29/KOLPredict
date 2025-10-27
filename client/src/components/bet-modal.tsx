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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MarketWithKol } from "@shared/schema";
import { ThumbsUp, ThumbsDown, AlertCircle, TrendingUp } from "lucide-react";

interface BetModalProps {
  open: boolean;
  onClose: () => void;
  market: MarketWithKol | null;
  userBalance: number;
  userYesShares?: number;
  userNoShares?: number;
  onConfirm: (marketId: string, position: "YES" | "NO", amount: number, action: "buy" | "sell") => void;
}

export function BetModal({ open, onClose, market, userBalance, userYesShares = 0, userNoShares = 0, onConfirm }: BetModalProps) {
  const [position, setPosition] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState<string>("");
  const [action, setAction] = useState<"buy" | "sell">("buy");

  // Reset amount when switching between buy/sell
  const handleActionChange = (newAction: "buy" | "sell") => {
    setAction(newAction);
    setAmount("");
  };

  if (!market) return null;

  const rawYes = parseFloat((market as any).currentYesPrice ?? market.yesPrice ?? '0.5');
  const rawNo = parseFloat((market as any).currentNoPrice ?? market.noPrice ?? '0.5');
  const yesPrice = Number.isFinite(rawYes) ? rawYes : 0.5;
  const noPrice = Number.isFinite(rawNo) ? rawNo : (1 - yesPrice);
  const currentPrice = position === "YES" ? yesPrice : noPrice;
  const betAmount = parseFloat(amount) || 0;
  const currentShares = position === "YES" ? userYesShares : userNoShares;

  // Platform fee calculation (2-5% based on PLATFORM_FEE_PERCENTAGE env var, default 2%)
  const PLATFORM_FEE_RATE = 0.02; // 2% default
  const platformFee = action === "buy" ? betAmount * PLATFORM_FEE_RATE : 0;
  const amountAfterFee = betAmount - platformFee;

  // Calculate shares using the same AMM formula as the server
  const calculateAMMShares = (
    amount: number,
    pos: "YES" | "NO",
    yesSharePool: number,
    yesCollateralPool: number,
    noSharePool: number,
    noCollateralPool: number
  ): number => {
    if (amount <= 0) return 0;
    
    if (pos === "YES") {
      // Buying YES: add collateral to YES pool, receive shares
      const k = yesSharePool * yesCollateralPool;
      const newYesCollateralPool = yesCollateralPool + amount;
      const newYesSharePool = k / newYesCollateralPool;
      return yesSharePool - newYesSharePool;
    } else {
      // Buying NO: add collateral to NO pool, receive shares
      const k = noSharePool * noCollateralPool;
      const newNoCollateralPool = noCollateralPool + amount;
      const newNoSharePool = k / newNoCollateralPool;
      return noSharePool - newNoSharePool;
    }
  };

  const yesSharePool = parseFloat((market as any).yesSharePool ?? '20000');
  const yesCollateralPool = parseFloat((market as any).yesCollateralPool ?? (yesPrice * 20000).toString());
  const noSharePool = parseFloat((market as any).noSharePool ?? '20000');
  const noCollateralPool = parseFloat((market as any).noCollateralPool ?? (noPrice * 20000).toString());
  
  const estimatedShares = action === "buy" 
    ? calculateAMMShares(amountAfterFee, position, yesSharePool, yesCollateralPool, noSharePool, noCollateralPool)
    : betAmount;
  
  // Potential payout if position wins (each share pays $1.00)
  const potentialPayout = action === "buy" ? estimatedShares * 1.0 : betAmount;
  const potentialProfit = action === "buy" ? potentialPayout - betAmount : 0;

  const handleConfirm = () => {
    if (betAmount <= 0) return;
    if (action === "buy" && betAmount > userBalance) return;
    if (action === "sell" && betAmount > currentShares) return;
    
    // Pass action to onConfirm - it will be sent as "action" parameter to /api/bets
    onConfirm(market.id, position, betAmount, action);
    setAmount("");
    onClose();
  };

  const presetAmounts = [10, 50, 100, 500];

  const yesProbability = (yesPrice * 100).toFixed(1);
  const noProbability = (noPrice * 100).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-bet">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl">Place Bet</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            {market.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Market info */}
          <div className="flex items-start gap-3.5 p-4 rounded-lg bg-muted/50 border border-border/50">
            <Avatar className="h-14 w-14 ring-2 ring-border/50">
              <AvatarImage src={market.kol.avatar} alt={market.kol.name} />
              <AvatarFallback>{market.kol.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-base">{market.kol.name}</p>
                <Badge variant="secondary" className="text-xs">{market.kol.tier}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {market.outcome}
              </p>
            </div>
          </div>

          {/* YES/NO Position Selection */}
          <div className="space-y-3">
            <Label>Choose Your Position</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPosition("YES")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  position === "YES"
                    ? "border-success bg-success/10 ring-2 ring-success/20"
                    : "border-border hover-elevate active-elevate-2"
                }`}
                data-testid="button-position-yes"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">YES</span>
                  <ThumbsUp className={`h-5 w-5 ${position === "YES" ? "text-success" : "text-muted-foreground"}`} />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">${yesPrice.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{yesProbability}% chance</div>
                </div>
              </button>
              
              <button
                onClick={() => setPosition("NO")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  position === "NO"
                    ? "border-destructive bg-destructive/10 ring-2 ring-destructive/20"
                    : "border-border hover-elevate active-elevate-2"
                }`}
                data-testid="button-position-no"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">NO</span>
                  <ThumbsDown className={`h-5 w-5 ${position === "NO" ? "text-destructive" : "text-muted-foreground"}`} />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">${noPrice.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{noProbability}% chance</div>
                </div>
              </button>
            </div>
          </div>

          {/* Buy/Sell Tabs */}
          <Tabs value={action} onValueChange={(v) => handleActionChange(v as "buy" | "sell")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" data-testid="tab-buy">Buy</TabsTrigger>
              <TabsTrigger value="sell" data-testid="tab-sell" disabled={currentShares === 0}>
                Sell {currentShares > 0 && `(${currentShares.toFixed(2)})`}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">{action === "buy" ? "Amount to Spend" : "Shares to Sell"}</Label>
              {action === "sell" && (
                <span className="text-sm text-muted-foreground" data-testid="text-current-shares">
                  You have: <span className="font-semibold text-foreground">{currentShares.toFixed(2)}</span> shares
                </span>
              )}
            </div>
            <div className="relative">
              {action === "buy" && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  $
                </span>
              )}
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={action === "buy" ? "Enter amount" : "Enter shares"}
                className={`text-lg font-semibold ${action === "buy" ? "pl-7" : ""}`}
                data-testid="input-amount"
              />
            </div>
          </div>

          {/* Preset amounts - only for buy */}
          {action === "buy" && (
            <div className="space-y-2">
              <Label>Quick Amount</Label>
              <div className="grid grid-cols-4 gap-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset.toString())}
                    className="font-semibold"
                    data-testid={`button-preset-${preset}`}
                  >
                    ${preset}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Calculation breakdown */}
          <div className="space-y-3 p-4 rounded-lg bg-card border border-card-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Position</span>
              <span className="font-semibold">
                <Badge variant={position === "YES" ? "default" : "destructive"}>
                  {position}
                </Badge>
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Price</span>
              <span className="font-semibold tabular-nums">${currentPrice.toFixed(4)}</span>
            </div>
            {action === "buy" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Shares</span>
                <span className="font-semibold tabular-nums">{estimatedShares.toFixed(2)}</span>
              </div>
            )}
            {action === "buy" && platformFee > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (2%)</span>
                  <span className="font-semibold tabular-nums text-muted-foreground" data-testid="text-platform-fee">
                    ${platformFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount After Fee</span>
                  <span className="font-semibold tabular-nums" data-testid="text-amount-after-fee">
                    ${amountAfterFee.toFixed(2)}
                  </span>
                </div>
              </>
            )}
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="font-medium">{action === "buy" ? "You Pay" : "You Receive"}</span>
              <span className="text-lg font-bold tabular-nums" data-testid="text-total-cost">
                ${betAmount.toFixed(2)}
              </span>
            </div>
            {action === "buy" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">If {position} wins</span>
                <span className="font-semibold text-success tabular-nums" data-testid="text-potential-payout">
                  ${potentialPayout.toFixed(2)} (+${potentialProfit.toFixed(2)})
                </span>
              </div>
            )}
          </div>

          {/* Balance check */}
          {action === "buy" && betAmount > userBalance && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>Insufficient balance. You need ${(betAmount - userBalance).toFixed(2)} more.</p>
            </div>
          )}

          {/* Shares check for selling */}
          {action === "sell" && betAmount > currentShares && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>Insufficient shares. You only have {currentShares.toFixed(2)} {position} shares.</p>
            </div>
          )}

          {/* No shares warning */}
          {action === "sell" && currentShares === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>You don't own any {position} shares in this market. Switch to Buy to purchase shares.</p>
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
              variant={position === "YES" ? "default" : "destructive"}
              className="flex-1 font-semibold"
              onClick={handleConfirm}
              disabled={
                betAmount <= 0 || 
                (action === "buy" && betAmount > userBalance) ||
                (action === "sell" && betAmount > currentShares)
              }
              data-testid="button-confirm-bet"
            >
              {action === "buy" ? "Buy" : "Sell"} {position}
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
