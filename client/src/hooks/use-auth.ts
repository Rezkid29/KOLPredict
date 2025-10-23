import { useState, useEffect } from "react";

export function useAuth() {
  const [userId, setUserIdState] = useState<string | null>(() => 
    localStorage.getItem("userId")
  );

  useEffect(() => {
    // Sync with localStorage changes
    const handleStorageChange = () => {
      setUserIdState(localStorage.getItem("userId"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // Handle Solana wallet disconnection
    if (typeof window !== 'undefined' && window.solana?.on) {
      const handleDisconnect = () => {
        console.log("Wallet disconnected");
        
        // Show user notification
        const event = new CustomEvent("wallet-disconnected", {
          detail: { message: "Your Solana wallet has been disconnected. Please reconnect to continue." }
        });
        window.dispatchEvent(event);
        
        // Delay to allow toast to be visible before reload
        setTimeout(() => {
          localStorage.removeItem("userId");
          localStorage.removeItem("solanaWalletAddress");
          setUserIdState(null);
          window.location.reload();
        }, 2000);
      };

      const handleAccountChanged = (publicKey: any) => {
        console.log("Wallet account changed to:", publicKey?.toString());
        const storedAddress = localStorage.getItem("solanaWalletAddress");
        const newAddress = publicKey?.toString();
        
        if (storedAddress && storedAddress !== newAddress) {
          console.log("Different wallet detected, logging out");
          
          // Show user notification
          const event = new CustomEvent("wallet-account-changed", {
            detail: { message: "Your wallet account has changed. You have been logged out." }
          });
          window.dispatchEvent(event);
          
          // Delay to allow toast to be visible before reload
          setTimeout(() => {
            localStorage.removeItem("userId");
            localStorage.removeItem("solanaWalletAddress");
            setUserIdState(null);
            window.location.reload();
          }, 2000);
        }
      };

      window.solana.on("disconnect", handleDisconnect);
      window.solana.on("accountChanged", handleAccountChanged);

      return () => {
        if (window.solana?.off) {
          window.solana.off("disconnect", handleDisconnect);
          window.solana.off("accountChanged", handleAccountChanged);
        }
      };
    }
  }, []);

  const setUserId = (newUserId: string | null) => {
    if (newUserId) {
      localStorage.setItem("userId", newUserId);
    } else {
      localStorage.removeItem("userId");
    }
    setUserIdState(newUserId);
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("solanaWalletAddress");
    setUserIdState(null);
    window.location.reload();
  };

  return { userId, setUserId, logout };
}

export function getUserId(): string | null {
  return localStorage.getItem("userId");
}
