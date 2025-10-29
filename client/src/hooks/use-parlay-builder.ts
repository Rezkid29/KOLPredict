import { useEffect, useMemo, useRef, useState } from "react";
import { createParlay, ParlayLegInput, quoteParlay } from "@/lib/parlayApi";

export type ParlayDraftLeg = {
  marketId: string;
  title: string;
  position: "YES" | "NO";
  price: number;
  bundleSafe: boolean;
};

export function useParlayBuilder() {
  const [legs, setLegs] = useState<ParlayDraftLeg[]>([]);
  const [stake, setStake] = useState<number>(10);
  const [quote, setQuote] = useState<{ combinedOdds: string; potentialPayout: string; marginApplied: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceId = useRef<number | null>(null);

  const inputsForQuote: { stake: number; legs: ParlayLegInput[] } | null = useMemo(() => {
    if (legs.length < 2 || legs.length > 3) return null;
    if (!Number.isFinite(stake) || stake <= 0) return null;
    return {
      stake,
      legs: legs.map((l) => ({ marketId: l.marketId, position: l.position })),
    };
  }, [legs, stake]);

  useEffect(() => {
    if (!inputsForQuote) {
      setQuote(null);
      return;
    }
    setLoading(true);
    if (debounceId.current) window.clearTimeout(debounceId.current);
    debounceId.current = window.setTimeout(async () => {
      try {
        const q = await quoteParlay(inputsForQuote.stake, inputsForQuote.legs);
        setQuote({ combinedOdds: q.combinedOdds, potentialPayout: q.potentialPayout, marginApplied: q.marginApplied });
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Failed to quote parlay");
        setQuote(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputsForQuote?.stake, JSON.stringify(inputsForQuote?.legs || [])]);

  function addLeg(newLeg: ParlayDraftLeg) {
    if (!newLeg.bundleSafe) {
      setError("This market is not eligible for parlays");
      return;
    }
    setError(null);
    setLegs((prev) => {
      // Replace existing leg for same market, else append
      const exists = prev.find((l) => l.marketId === newLeg.marketId);
      let next = exists ? prev.map((l) => (l.marketId === newLeg.marketId ? newLeg : l)) : [...prev, newLeg];
      if (next.length > 3) {
        setError("Limit 3 legs per parlay");
        return prev;
      }
      return next;
    });
  }

  function removeLeg(marketId: string) {
    setLegs((prev) => prev.filter((l) => l.marketId !== marketId));
  }

  function clear() {
    setLegs([]);
    setQuote(null);
    setError(null);
    setStake(10);
  }

  async function createTicket() {
    if (legs.length < 2) throw new Error("Add at least 2 legs");
    const payloadLegs: ParlayLegInput[] = legs.map((l) => ({ marketId: l.marketId, position: l.position }));
    const ticket = await createParlay(stake, payloadLegs);
    clear();
    return ticket;
  }

  return {
    legs,
    addLeg,
    removeLeg,
    clear,
    stake,
    setStake,
    quote,
    error,
    loading,
    createTicket,
  } as const;
}
