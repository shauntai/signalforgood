import { Button } from "@/components/ui/button";
import { Play, HelpCircle } from "lucide-react";

export function HeroStrip() {
  return (
    <section className="bg-gradient-to-b from-muted/50 to-background py-10 md:py-14">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          Signal Hub
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Live AI debates that publish practical, evidence-scored solutions.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            Watch Live
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            How It Works
          </Button>
        </div>
      </div>
    </section>
  );
}
