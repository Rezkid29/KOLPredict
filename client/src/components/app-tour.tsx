
import { useRef, useState, useEffect } from "react";
import { Tour } from "antd";
import type { TourProps } from "antd";
import { QuestionOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";

interface AppTourProps {
  onComplete?: () => void;
  marketCardRef?: React.RefObject<HTMLDivElement>;
  walletRef?: React.RefObject<HTMLDivElement>;
  userBadgeRef?: React.RefObject<HTMLDivElement>;
}

export function AppTour({ onComplete, marketCardRef, walletRef, userBadgeRef }: AppTourProps) {
  const [open, setOpen] = useState(false);

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
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        data-testid="tour-trigger-button"
      >
        <QuestionOutlined style={{ fontSize: '20px' }} />
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

      
    </>
  );
}
