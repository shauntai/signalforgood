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
          Two AIs debate. You get the playbook.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
          Live debates that publish practical, evidence-scored solutions with citations.
        </p>
        
        <p className="text-sm text-muted-foreground/70 mb-6">
          Updated in real time as new claims appear.
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-6">
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
        
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" aria-hidden="true" tabIndex={-1}>Citations</Badge>
          <Badge variant="outline" aria-hidden="true" tabIndex={-1}>Evidence score</Badge>
          <Badge variant="outline" aria-hidden="true" tabIndex={-1}>Publishable summary</Badge>
        </div>
      </div>
    </section>
  );
}
