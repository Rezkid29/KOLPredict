import { apiRequest } from "@/lib/queryClient";

export type ParlayLegInput = { marketId: string; position: "YES" | "NO" };

export type ParlayQuote = {
  combinedOdds: string;
  potentialPayout: string;
  marginApplied: string;
  legs: Array<{ marketId: string; position: "YES" | "NO"; entryPrice: string }>;
};

export type ParlayLeg = {
  id: string;
  ticketId: string;
  marketId: string;
  position: "YES" | "NO";
  entryPrice: string;
  settlementPrice: string | null;
  status: "pending" | "won" | "lost" | "voided";
  resolvedAt: string | null;
};

export type ParlayTicket = {
  id: string;
  userId: string;
  stake: string;
  combinedOdds: string;
  potentialPayout: string;
  marginApplied: string;
  status: "pending" | "won" | "lost" | "cancelled" | "voided";
  createdAt: string;
  settledAt: string | null;
  legs: ParlayLeg[];
};

export async function quoteParlay(stake: number, legs: ParlayLegInput[]): Promise<ParlayQuote> {
  const res = await apiRequest("POST", "/api/parlays/quote", { stake, legs });
  return res.json();
}

export async function createParlay(stake: number, legs: ParlayLegInput[]): Promise<ParlayTicket> {
  const res = await apiRequest("POST", "/api/parlays", { stake, legs });
  return res.json();
}

export async function listParlays(status?: string): Promise<ParlayTicket[]> {
  const url = status ? `/api/parlays?status=${encodeURIComponent(status)}` : "/api/parlays";
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function getParlay(id: string): Promise<ParlayTicket> {
  const res = await apiRequest("GET", `/api/parlays/${id}`);
  return res.json();
}

export async function cancelParlay(id: string): Promise<{ message: string }> {
  const res = await apiRequest("POST", `/api/parlays/${id}/cancel`);
  return res.json();
}
