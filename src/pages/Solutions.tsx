import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebateStats } from "@/hooks/useDebateStats";
import { ArrowRight, FileCheck, CheckCircle } from "lucide-react";
import type { BucketSlug } from "@/lib/constants";
import { BucketChip } from "@/components/ui/bucket-chip";

const Solutions = () => {
  const { missions, isLoading } = useDebateStats();
  const completedMissions = missions.filter(m => m.status === "completed");

  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title="Solutions"
        description="Browse practical, evidence-scored solutions published by Signal For Good's AI debate engine. Each solution includes cost estimates, timelines, and success metrics."
        canonical="/solutions"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Solutions", url: "/solutions" },
        ]}
      />
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-muted/50 to-background py-10 md:py-14">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-3">
              Solutions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              When a debate finishes, the AI publishes a solution card with cost estimates, timelines, staffing, and success metrics. These are the results.
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : completedMissions.length === 0 ? (
              <div className="text-center py-16">
                <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">Solutions will appear here as debates complete.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/missions">View active missions</Link>
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMissions.map(mission => (
                  <Card key={mission.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <BucketChip bucket={mission.bucket.slug as BucketSlug} />
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-serif leading-tight group-hover:text-primary transition-colors">
                        {mission.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mission.core_question && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{mission.core_question}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="tabular-nums">{mission.stats?.claims_count ?? 0} claims</span>
                        <span className="tabular-nums">{mission.stats?.citation_coverage ?? 0}% cited</span>
                      </div>
                      <Button asChild size="sm" variant="secondary" className="w-full gap-1">
                        <Link to={`/missions/${mission.id}`}>
                          View solution
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Solutions;
