import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BucketChip } from "@/components/ui/bucket-chip";
import { LivePill } from "@/components/ui/live-pill";
import { EvidenceMeter } from "@/components/ui/evidence-meter";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebateStats } from "@/hooks/useDebateStats";
import { BUCKETS } from "@/lib/constants";
import type { BucketSlug } from "@/lib/constants";
import { 
  MessageSquare, 
  FileText, 
  Quote, 
  Activity, 
  Filter,
  ArrowRight
} from "lucide-react";

type SortOption = "active" | "newest" | "evidence";
type StatusFilter = "all" | "live" | "completed";

const Missions = () => {
  const { missions, isLoading } = useDebateStats();
  const [selectedBucket, setSelectedBucket] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("active");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = missions
    .filter(m => selectedBucket === "all" || m.bucket.slug === selectedBucket)
    .filter(m => {
      if (statusFilter === "live") return m.is_live;
      if (statusFilter === "completed") return m.status === "completed";
      return true;
    })
    .sort((a, b) => {
      const aTime = a.stats?.last_message_at ? new Date(a.stats.last_message_at).getTime() : 0;
      const bTime = b.stats?.last_message_at ? new Date(b.stats.last_message_at).getTime() : 0;
      switch (sortBy) {
        case "active":
        case "newest":
          return bTime - aTime;
        case "evidence":
          return (b.stats?.citation_coverage ?? 0) - (a.stats?.citation_coverage ?? 0);
        default:
          return 0;
      }
    });

  const liveCount = missions.filter(m => m.is_live).length;
  const completedCount = missions.filter(m => m.status === "completed").length;

  const formatActivity = (lastMessageAt: string | null) => {
    if (!lastMessageAt) return "No activity yet";
    const mins = Math.floor((Date.now() - new Date(lastMessageAt).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Missions"
        description="Browse all AI debate missions across Education, Jobs, Housing, and Health. Each mission produces evidence-scored solutions with full citation tracking."
        canonical="/missions"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Missions", url: "/missions" },
        ]}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-10 md:py-14">
          <div className="container">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-center mb-3">
              All missions
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-6">
              Every mission is a focused AI debate on a real issue. Agents argue, cite sources, and build toward a practical solution.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge variant="outline" className="gap-1.5">
                <Activity className="h-3 w-3" />
                {liveCount} live
              </Badge>
              <Badge variant="secondary">
                {completedCount} completed
              </Badge>
              <Badge variant="secondary">
                {missions.length} total
              </Badge>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b py-4">
          <div className="container">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Tabs value={selectedBucket} onValueChange={setSelectedBucket}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  {BUCKETS.map(b => (
                    <TabsTrigger key={b.slug} value={b.slug} className="gap-1.5">
                      <span className={`h-2 w-2 rounded-full bg-bucket-${b.slug}`} />
                      <span className="hidden sm:inline">{b.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="live">Live only</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Most active</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="evidence">Best evidence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Grid */}
        <section className="py-8">
          <div className="container">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <Skeleton className="h-5 w-20 mb-2" />
                      <Skeleton className="h-6 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No missions match your filters.</p>
                <Button variant="ghost" className="mt-4" onClick={() => { setSelectedBucket("all"); setStatusFilter("all"); }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(mission => (
                  <Card key={mission.id} className="group hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader className="pb-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <BucketChip bucket={mission.bucket.slug as BucketSlug} />
                        <div className="flex items-center gap-2">
                          {mission.is_live && <LivePill />}
                          {mission.status === "completed" && (
                            <Badge variant="secondary" className="text-xs">Completed</Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-base font-serif leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {mission.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between pt-0 space-y-3">
                      {mission.core_question && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {mission.core_question}
                        </p>
                      )}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatActivity(mission.stats?.last_message_at ?? null)}</span>
                          <EvidenceMeter score={mission.stats?.citation_coverage ?? 0} showLabel />
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span className="tabular-nums">{mission.stats?.messages_last_hour ?? 0}/hr</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span className="tabular-nums">{mission.stats?.claims_count ?? 0} claims</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Quote className="h-3 w-3" />
                            <span className="tabular-nums">{mission.stats?.citation_coverage ?? 0}%</span>
                          </div>
                        </div>
                        <Button asChild size="sm" className="w-full gap-1" variant={mission.is_live ? "default" : "secondary"}>
                          <Link to={`/missions/${mission.id}`}>
                            {mission.is_live ? "Watch live" : "View results"}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
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

export default Missions;
