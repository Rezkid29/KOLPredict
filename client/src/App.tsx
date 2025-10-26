import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";
import Wallet from "@/pages/wallet";
import Messages from "@/pages/messages";
import Forum from "@/pages/forum";
import Help from "@/pages/help";
import HowItWorks from "@/pages/how-it-works";
import NotFound from "@/pages/not-found";

function Router() {
  const { userId } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to landing if not authenticated and trying to access protected routes
  useEffect(() => {
    const protectedRoutes = ['/markets', '/profile', '/leaderboard', '/wallet', '/messages', '/forum', '/help', '/how-it-works'];
    const isProtectedRoute = protectedRoutes.some(route => location.startsWith(route)) || location === '/';
    
    if (!userId && isProtectedRoute && location !== '/') {
      setLocation('/');
    }
  }, [userId, location, setLocation]);

  // Show landing page if not authenticated
  if (!userId) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Show authenticated routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/markets" component={Home} />
      <Route path="/profile/:username" component={Profile} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/messages" component={Messages} />
      <Route path="/forum" component={Forum} />
      <Route path="/help" component={Help} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { userId, setUserId } = useAuth();
  const { toast } = useToast();

  // Remove the auth modal auto-popup since landing page handles auth

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
