import { useMutation, useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cancelParlay, ParlayTicket } from "@/lib/parlayApi";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function ParlaysPage() {
  const { data: tickets = [] } = useQuery<ParlayTicket[]>({
    queryKey: ["/api/parlays"],
  });
  const { toast } = useToast();

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => cancelParlay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parlays"] });
      toast({ title: "Parlay canceled" });
    },
    onError: (e: any) => {
      toast({ title: "Failed to cancel", description: e?.message || "Try again", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl font-bold">My Parlays</h1>
        {tickets.length === 0 ? (
          <p className="text-muted-foreground">No parlays yet. Build one from Markets.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <Card key={t.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{new Date(t.createdAt).toLocaleString()}</Badge>
                    <Badge variant="secondary">{t.legs.length} legs</Badge>
                  </div>
                  <Badge variant={t.status === "won" ? "default" : t.status === "lost" ? "destructive" : "outline"}>
                    {String(t.status).toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stake</span>
                      <span className="font-semibold">${Number(t.stake).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Odds</span>
                      <span className="font-semibold">{Number(t.combinedOdds).toFixed(2)}x</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Potential</span>
                      <span className="font-semibold">${Number(t.potentialPayout).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 rounded border p-3 space-y-2">
                    {t.legs.map((l) => (
                      <div key={l.id} className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">{l.position}</span>
                          <span className="text-muted-foreground"> @ {Number(l.entryPrice).toFixed(2)}</span>
                        </div>
                        <Badge variant={l.status === "won" ? "default" : l.status === "lost" ? "destructive" : "outline"}>
                          {String(l.status).toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-end gap-2">
                  {t.status === "pending" && (
                    <Button variant="outline" onClick={() => cancelMutation.mutate(t.id)} disabled={cancelMutation.isPending}>Cancel</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
