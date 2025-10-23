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
        localStorage.removeItem("userId");
        localStorage.removeItem("solanaWalletAddress");
        setUserIdState(null);
        window.location.reload();
      };

      const handleAccountChanged = (publicKey: any) => {
        console.log("Wallet account changed to:", publicKey?.toString());
        const storedAddress = localStorage.getItem("solanaWalletAddress");
        const newAddress = publicKey?.toString();
        
        if (storedAddress && storedAddress !== newAddress) {
          console.log("Different wallet detected, logging out");
          localStorage.removeItem("userId");
          localStorage.removeItem("solanaWalletAddress");
          setUserIdState(null);
          window.location.reload();
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
