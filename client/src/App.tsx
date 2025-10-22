import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Portfolio from "@/pages/portfolio";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { userId, setUserId } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!userId) {
      setShowAuthModal(true);
    }
  }, [userId]);

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
