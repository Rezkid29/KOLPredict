
import { useRef, useState, useEffect } from "react";
import { Tour } from "antd";
import type { TourProps } from "antd";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface AppTourProps {
  onComplete?: () => void;
}

export function AppTour({ onComplete }: AppTourProps) {
  const [open, setOpen] = useState(false);
  const marketCardRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const userBadgeRef = useRef<HTMLDivElement>(null);

  // Auto-start tour for first-time users
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour) {
      // Delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("hasSeenTour", "true");
    onComplete?.();
  };

  const steps: TourProps["steps"] = [
    {
      title: "Welcome to KOL Predict! 🎯",
      description: "Let's take a quick tour to help you get started with trading KOL performance markets.",
      target: null,
      placement: "center",
    },
    {
      title: "Live Market Cards 📊",
      description: "Each card shows a live prediction market. You can see the KOL's name, market question, current YES/NO prices, performance metrics, and trading buttons. Click 'Buy' to purchase YES shares or 'Sell' to purchase NO shares.",
      target: () => marketCardRef.current,
      placement: "bottom",
    },
    {
      title: "Your Wallet Balance 💰",
      description: "This shows your current points balance. You start with 1000 PTS. Use these points to trade on markets and grow your portfolio!",
      target: () => walletRef.current,
      placement: "bottom",
    },
    {
      title: "Your Profile Badge 👤",
      description: "Click here to view your profile, track your trading history, see your positions, and check your performance on the leaderboard.",
      target: () => userBadgeRef.current,
      placement: "bottomLeft",
    },
    {
      title: "You're All Set! 🚀",
      description: "Start exploring markets, place your bets, and climb the leaderboard. Good luck!",
      target: null,
      placement: "center",
    },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 fixed bottom-6 right-6 z-50 shadow-lg"
        onClick={() => setOpen(true)}
        data-testid="tour-trigger-button"
      >
        <HelpCircle className="h-4 w-4" />
        Start Tour
      </Button>

      <Tour
        open={open}
        onClose={handleClose}
        steps={steps}
        indicatorsRender={(current, total) => (
          <span className="text-sm">
            {current + 1} / {total}
          </span>
        )}
      />

      {/* Hidden refs for tour targeting */}
      <div ref={marketCardRef} className="tour-target-market-card" />
      <div ref={walletRef} className="tour-target-wallet" />
      <div ref={userBadgeRef} className="tour-target-badge" />
    </>
  );
}
