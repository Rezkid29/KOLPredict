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
    setUserIdState(null);
    window.location.reload();
  };

  return { userId, setUserId, logout };
}

export function getUserId(): string | null {
  return localStorage.getItem("userId");
}
