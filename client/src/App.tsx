import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Portfolio from "@/pages/portfolio";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";
import Wallet from "@/pages/wallet";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/profile/:username" component={Profile} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/wallet" component={Wallet} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { userId, setUserId } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setShowAuthModal(true);
    }
  }, [userId]);

  useEffect(() => {
    // Listen for wallet disconnection events
    const handleWalletDisconnected = (event: Event) => {
      const customEvent = event as CustomEvent;
      toast({
        title: "Wallet Disconnected",
        description: customEvent.detail?.message || "Your wallet has been disconnected.",
        variant: "destructive",
      });
    };

    const handleWalletAccountChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      toast({
        title: "Wallet Account Changed",
        description: customEvent.detail?.message || "Your wallet account has changed.",
        variant: "destructive",
      });
    };

    window.addEventListener("wallet-disconnected", handleWalletDisconnected);
    window.addEventListener("wallet-account-changed", handleWalletAccountChanged);

    return () => {
      window.removeEventListener("wallet-disconnected", handleWalletDisconnected);
      window.removeEventListener("wallet-account-changed", handleWalletAccountChanged);
    };
  }, [toast]);

  const handleAuthSuccess = (newUserId: string) => {
    setUserId(newUserId);
    queryClient.invalidateQueries();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
          <AuthModal 
            open={showAuthModal} 
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
