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
            Find answers to common questions about KOL Market
          </p>
        </div>

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
