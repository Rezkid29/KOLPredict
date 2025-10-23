import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Wallet as WalletIcon, Copy, Check, Send, Download, ExternalLink, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  balance: string;
  solanaBalance: string;
  solanaDepositAddress: string | null;
}

interface Deposit {
  id: string;
  userId: string;
  signature: string;
  amount: string;
  status: string;
  confirmations: number;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  userId: string;
  destinationAddress: string;
  amount: string;
  status: string;
  signature: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export default function Wallet() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: !!userId
  });

  const { data: deposits = [], isLoading: depositsLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/wallet/deposits"],
    enabled: !!userId
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/wallet/withdrawals"],
    enabled: !!userId
  });

  const withdrawMutation = useMutation({
    mutationFn: async (params: { destinationAddress: string; amount: number }) => {
      return await apiRequest("/api/wallet/withdraw", "POST", params);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal is being processed. Check the transaction history for updates."
      });
      setWithdrawalAddress("");
      setWithdrawalAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive"
      });
    }
  });

  const handleCopyAddress = () => {
    if (user?.solanaDepositAddress) {
      navigator.clipboard.writeText(user.solanaDepositAddress);
      setCopiedAddress(true);
      toast({
        title: "Address Copied",
        description: "Deposit address copied to clipboard"
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleWithdraw = () => {
    if (!withdrawalAddress || !withdrawalAmount) {
      toast({
        title: "Invalid Input",
        description: "Please enter both address and amount",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const userBalance = parseFloat(user?.solanaBalance || "0");
    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${userBalance.toFixed(9)} SOL available`,
        variant: "destructive"
      });
      return;
    }

    withdrawMutation.mutate({
      destinationAddress: withdrawalAddress,
      amount: amount
    });
  };

  const formatSol = (amount: string) => {
    const num = parseFloat(amount);
    return num.toFixed(9);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      processing: "secondary",
      completed: "default",
      failed: "destructive"
    };
    return (
      <Badge variant={variants[status] || "outline"} data-testid={`badge-status-${status}`}>
        {status}
      </Badge>
    );
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar balance={0} username={undefined} />
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const solanaBalance = parseFloat(user?.solanaBalance || "0");
  const pointsBalance = parseFloat(user?.balance || "0");

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={pointsBalance} username={user?.username || undefined} />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <WalletIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold" data-testid="text-wallet-title">
              Solana Wallet
            </h1>
            <p className="text-muted-foreground">Manage your SOL deposits and withdrawals</p>
          </div>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Balance</CardTitle>
            <CardDescription>Your current Solana balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tabular-nums text-primary" data-testid="text-sol-balance">
              {formatSol(user?.solanaBalance || "0")} SOL
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Points Balance: {pointsBalance.toFixed(2)} PTS
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="deposit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="deposit" data-testid="tab-deposit">
              <Download className="h-4 w-4 mr-2" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" data-testid="tab-withdraw">
              <Send className="h-4 w-4 mr-2" />
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deposit SOL</CardTitle>
                <CardDescription>
                  Send SOL to your deposit address to add funds to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user?.solanaDepositAddress ? (
                  <>
                    <div className="flex flex-col items-center gap-6">
                      <div className="bg-white p-4 rounded-lg">
                        <QRCode 
                          value={user.solanaDepositAddress} 
                          size={200}
                          data-testid="qr-code-deposit"
                        />
                      </div>
                      
                      <div className="w-full space-y-2">
                        <Label htmlFor="deposit-address">Your Deposit Address</Label>
                        <div className="flex gap-2">
                          <Input
                            id="deposit-address"
                            value={user.solanaDepositAddress}
                            readOnly
                            className="font-mono text-sm"
                            data-testid="input-deposit-address"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyAddress}
                            data-testid="button-copy-address"
                          >
                            {copiedAddress ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">Important Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Only send SOL to this address</li>
                        <li>Deposits are monitored every 10 seconds</li>
                        <li>Minimum 15 confirmations required</li>
                        <li>Your balance will update automatically</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">
                      Deposit address not yet generated. Please contact support.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw SOL</CardTitle>
                <CardDescription>
                  Send your SOL to any Solana address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-address">Destination Address</Label>
                  <Input
                    id="withdrawal-address"
                    placeholder="Enter Solana address"
                    value={withdrawalAddress}
                    onChange={(e) => setWithdrawalAddress(e.target.value)}
                    className="font-mono text-sm"
                    data-testid="input-withdrawal-address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawal-amount">Amount (SOL)</Label>
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    step="0.000000001"
                    min="0"
                    placeholder="0.000000000"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    data-testid="input-withdrawal-amount"
                  />
                  <div className="text-sm text-muted-foreground">
                    Available: {formatSol(user?.solanaBalance || "0")} SOL
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                  data-testid="button-withdraw"
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Withdraw
                    </>
                  )}
                </Button>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">Processing Info:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Withdrawals processed every 5 seconds</li>
                    <li>Network fees apply (~0.000005 SOL)</li>
                    <li>Transactions appear in history immediately</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent deposits and withdrawals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Deposits</h3>
                  {depositsLoading ? (
                    <div className="flex justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : deposits.length === 0 ? (
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground">No deposits yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {deposits.map((deposit) => (
                        <div
                          key={deposit.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                          data-testid={`deposit-${deposit.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Download className="h-4 w-4 text-green-500" />
                              <span className="font-semibold">
                                {formatSol(deposit.amount)} SOL
                              </span>
                              {getStatusBadge(deposit.status)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {new Date(deposit.createdAt).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono mt-1">
                              {deposit.signature.slice(0, 20)}...
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            data-testid={`button-view-tx-${deposit.id}`}
                          >
                            <a
                              href={`https://explorer.solana.com/tx/${deposit.signature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Withdrawals</h3>
                  {withdrawalsLoading ? (
                    <div className="flex justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : withdrawals.length === 0 ? (
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground">No withdrawals yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {withdrawals.map((withdrawal) => (
                        <div
                          key={withdrawal.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                          data-testid={`withdrawal-${withdrawal.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4 text-orange-500" />
                              <span className="font-semibold">
                                {formatSol(withdrawal.amount)} SOL
                              </span>
                              {getStatusBadge(withdrawal.status)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              To: {withdrawal.destinationAddress.slice(0, 20)}...
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(withdrawal.createdAt).toLocaleString()}
                            </div>
                            {withdrawal.errorMessage && (
                              <div className="text-xs text-destructive mt-1">
                                Error: {withdrawal.errorMessage}
                              </div>
                            )}
                          </div>
                          {withdrawal.signature && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              data-testid={`button-view-tx-${withdrawal.id}`}
                            >
                              <a
                                href={`https://explorer.solana.com/tx/${withdrawal.signature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
