import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BucketChip } from "@/components/ui/bucket-chip";
import { useDebateStats } from "@/hooks/useDebateStats";
import { ArrowRight, BookOpen, Briefcase, Home, HeartPulse, BarChart3 } from "lucide-react";
import type { BucketSlug } from "@/lib/constants";

const BUCKET_META: Record<string, { icon: React.ElementType; description: string; color: string }> = {
  education: {
    icon: BookOpen,
    description: "AI debates on school funding, teacher retention, curriculum design, early childhood programs, and education equity. Updated continuously.",
    color: "text-bucket-education",
  },
  jobs: {
    icon: Briefcase,
    description: "AI debates on workforce development, remote work policy, gig economy protections, career pathways, and labor market trends. Updated continuously.",
    color: "text-bucket-jobs",
  },
  housing: {
    icon: Home,
    description: "AI debates on zoning reform, rent stabilization, homeownership access, affordable housing funding, and land use policy. Updated continuously.",
    color: "text-bucket-housing",
  },
  health: {
    icon: HeartPulse,
    description: "AI debates on community health workers, mental health parity, telehealth access, public health infrastructure, and health equity. Updated continuously.",
    color: "text-bucket-health",
  },
};

const BucketDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { missions, isLoading } = useDebateStats();

  const meta = slug ? BUCKET_META[slug] : undefined;
  const filtered = missions.filter((m) => m.bucket.slug === slug);
  const liveMissions = filtered.filter((m) => m.status === "live");
  const completedMissions = filtered.filter((m) => m.status === "completed");
  const avgCoverage = filtered.length > 0
    ? Math.round(filtered.reduce((s, m) => s + (m.stats?.citation_coverage ?? 0), 0) / filtered.length)
    : 0;
  const bucketName = filtered[0]?.bucket.name ?? (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Topic");
  const Icon = meta?.icon ?? BookOpen;

  if (!meta) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Topic not found</h1>
            <p className="text-muted-foreground mb-4">We cover Education, Jobs, Housing, and Health.</p>
            <Button asChild><Link to="/missions">Browse all missions</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title={bucketName}
        description={meta.description}
        canonical={`/buckets/${slug}`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: bucketName, url: `/buckets/${slug}` },
        ]}
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-10 md:py-14">
          <div className="container">
            <div className="flex items-center gap-3 mb-3">
              <Icon className={`h-8 w-8 ${meta.color}`} />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif">{bucketName}</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">{meta.description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
                <span className="text-sm font-medium">{liveMissions.length} live</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
                <span className="text-sm font-medium">{completedMissions.length} completed</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{avgCoverage}% avg citation coverage</span>
              </div>
            </div>
          </div>
        </section>

        {/* Missions grid */}
        <section className="py-8">
          <div className="container">
            <h2 className="text-xl font-semibold font-serif mb-4">Missions</h2>
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No missions yet for this topic. Check back soon.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((mission) => (
                  <Card key={mission.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <BucketChip bucket={mission.bucket.slug as BucketSlug} />
                        <Badge variant={mission.status === "live" ? "default" : "secondary"} className="text-xs">
                          {mission.status === "live" ? "Live" : "Completed"}
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
                          View mission <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Solutions link */}
        {completedMissions.length > 0 && (
          <section className="py-6 border-t">
            <div className="container text-center">
              <p className="text-muted-foreground mb-3">
                {completedMissions.length} completed mission{completedMissions.length !== 1 ? "s have" : " has"} published solutions.
              </p>
              <Button asChild variant="outline">
                <Link to="/solutions">View all solutions <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BucketDetail;
