import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import type { User, Faq } from "@shared/schema";

export default function Help() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
  });

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));
  const categorizedFaqs = (category: string) => 
    faqs.filter(faq => faq.category === category).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <Navbar balance={user?.balance ? parseFloat(user.balance) : 1000} username={user?.username ?? undefined} />

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 ring-4 ring-primary/10 mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-3" data-testid="text-page-title">
            Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about KOLPredict
          </p>
        </div>

        {/* Odds & Pricing Overview */}
        <Card className="p-6 mb-10 bg-muted/30 border border-border/60">
          <h2 className="text-xl font-semibold mb-3">Odds & Pricing Overview</h2>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Initial odds are data-driven. Markets start with prices derived from signals, not a fixed 50/50.
              YES/NO prices are exposed as <span className="font-medium">currentYesPrice</span> and <span className="font-medium">currentNoPrice</span>.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Head-to-head markets tilt odds by signals (rank, SOL gain, USD gain, win rate, win/loss ratio).</li>
              <li>Solo markets tilt by proximity to target (e.g., progress to SOL threshold, top-10 maintain, rank steps to improve).</li>
              <li>Follower growth starts neutral (50/50) unless additional signals are present.</li>
              <li>Charts seed the first point from current prices when history is empty and tooltips show $ and %.</li>
              <li>Cards and modals display the same odds (NO is derived as 1 − YES when needed).</li>
            </ul>
            <p>
              Prices then evolve via the AMM (constant product). Each bet updates pools and moves the price.
            </p>
          </div>
        </Card>

        {/* Market Types Cheat Sheet */}
        <Card className="p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4">Market Types Cheat Sheet</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
              <div className="font-semibold mb-2">Head‑to‑Head</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Rank Flippening: better rank → higher YES probability</li>
                <li>SOL Gain Flippening: higher SOL gain → higher YES probability</li>
                <li>USD Gain Flippening: higher USD gain → higher YES probability</li>
                <li>Win Rate/Win‑Loss Ratio Flippening: better metric → higher YES probability</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
              <div className="font-semibold mb-2">Solo</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>SOL Gain Threshold: closer to target → higher YES probability</li>
                <li>Top‑Rank Maintain: deeper inside top‑N → higher YES probability</li>
                <li>Rank Improvement: fewer steps required → higher YES probability</li>
                <li>Win‑Loss Ratio Maintain: margin above threshold → higher YES probability</li>
                <li>Follower Growth: neutral baseline (50/50)</li>
              </ul>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-8">
            <div className="animate-pulse text-center text-muted-foreground">Loading FAQs...</div>
          </Card>
        ) : faqs.length === 0 ? (
          <Card className="p-16">
            <div className="text-center text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No FAQs available</p>
              <p className="text-sm">FAQs will be added soon</p>
            </div>
          </Card>
        ) : (
          <Card>
            <Tabs defaultValue={categories[0] || "all"} className="p-6">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat} 
                    className="capitalize"
                    data-testid={`tab-${cat}`}
                  >
                    {cat.replace(/_/g, " ")}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat} value={cat}>
                  <Accordion type="single" collapsible className="space-y-2">
                    {categorizedFaqs(cat).map((faq, index) => (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className="border border-border/60 rounded-lg px-6 data-[state=open]:bg-muted/30"
                        data-testid={`faq-${faq.id}`}
                      >
                        <AccordionTrigger className="hover:no-underline py-5">
                          <div className="flex items-start gap-4 text-left">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="font-semibold">{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-12 pr-4 pb-5 text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        )}

        <Card className="mt-10 p-8 bg-muted/30">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <p className="text-sm text-muted-foreground">
              Join our community forum or reach out to us directly for personalized assistance.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
