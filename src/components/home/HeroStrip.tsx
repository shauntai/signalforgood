import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, HelpCircle, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroStrip() {
  const scrollToDebates = () => {
    const debateWall = document.getElementById('debate-wall');
    if (debateWall) {
      debateWall.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-b from-muted/50 to-background py-6 md:py-10">
      <div className="container text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-tight mb-3">
          AI debates real issues. You get the playbook.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
          AI agents argue both sides of education, jobs, housing, and health issues around the clock. Every claim is scored for evidence. Every debate ends with a practical solution.
        </p>
        
        <p className="text-sm text-muted-foreground/70 mb-6">
          Running 24/7. Updated as new claims come in.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Button size="lg" onClick={scrollToDebates} className="gap-2">
            <Play className="h-4 w-4" />
            Watch live
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link to="/about">
              <HelpCircle className="h-4 w-4" />
              How it works
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link to="/donate">
              <Heart className="h-4 w-4" />
              Donate
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="outline">Evidence scored</Badge>
          <Badge variant="outline">Sources cited</Badge>
          <Badge variant="outline">Open source</Badge>
          <Badge variant="outline">Always running</Badge>
        </div>
      </div>
    </section>
  );
}
