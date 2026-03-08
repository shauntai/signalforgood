import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BucketChip } from "@/components/ui/bucket-chip";
import { LivePill } from "@/components/ui/live-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { useDebateStats } from "@/hooks/useDebateStats";
import { useRecentMessages } from "@/hooks/useRecentMessages";
import { BUCKETS } from "@/lib/constants";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  MessageSquare, 
  FileCheck, 
  Activity,
  BarChart3,
  ArrowRight
} from "lucide-react";
import type { BucketSlug } from "@/lib/constants";

const Signals = () => {
  const { status: systemStatus, isLoading: statusLoading } = useSystemStatus();
  const { missions, isLoading: missionsLoading } = useDebateStats();
  const { messages: recentMessages, isLoading: messagesLoading } = useRecentMessages(8);

  const liveMissions = missions.filter(m => m.is_live);

  // Calculate real bucket stats
  const bucketStats = BUCKETS.map(bucket => {
    const bucketMissions = missions.filter(m => m.bucket.slug === bucket.slug);
    const liveCount = bucketMissions.filter(m => m.is_live).length;
    const coverages = bucketMissions
      .map(m => m.stats?.citation_coverage ?? 0)
      .filter(c => c > 0);
    const avgCoverage = coverages.length > 0
      ? Math.round(coverages.reduce((a, b) => a + b, 0) / coverages.length)
      : 0;
    return {
      ...bucket,
      totalDebates: bucketMissions.length,
      liveDebates: liveCount,
      avgEvidenceScore: avgCoverage,
    };
  });

  const totalClaims = missions.reduce((sum, m) => sum + (m.stats?.claims_count ?? 0), 0);
  const isLoading = statusLoading || missionsLoading;

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Signals"
        description="Real-time intelligence dashboard for Signal For Good. Track live debates, evidence quality, and trending topics across Education, Jobs, Housing, and Health."
        canonical="/signals"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Signals", url: "/signals" },
        ]}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-10 md:py-14">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-3">
              Signals
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Live numbers from the debate engine. Updated every 30 seconds.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-6 border-b">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Activity className="h-5 w-5 text-primary" />
                    {isLoading ? <Skeleton className="h-8 w-8" /> : (
                      <span className="text-2xl font-bold tabular-nums">{systemStatus?.debates_live ?? liveMissions.length}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Live debates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {isLoading ? <Skeleton className="h-8 w-8" /> : (
                      <span className="text-2xl font-bold tabular-nums">{systemStatus?.messages_last_10_min ?? 0}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Messages (10 min)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <FileCheck className="h-5 w-5 text-primary" />
                    {isLoading ? <Skeleton className="h-8 w-8" /> : (
                      <span className="text-2xl font-bold tabular-nums">{systemStatus?.citation_coverage_24h ?? 0}%</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Citation coverage</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {isLoading ? <Skeleton className="h-8 w-8" /> : (
                      <span className="text-2xl font-bold tabular-nums">{totalClaims}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Total claims</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* By Lane */}
        <section className="py-10">
          <div className="container">
            <h2 className="text-2xl font-bold font-serif mb-6">By topic</h2>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All topics</TabsTrigger>
                {BUCKETS.map(bucket => (
                  <TabsTrigger key={bucket.slug} value={bucket.slug} className="hidden sm:inline-flex">
                    {bucket.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {missionsLoading ? (
                    [1, 2, 3, 4].map(i => (
                      <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                    ))
                  ) : (
                    bucketStats.map(bucket => (
                      <Card key={bucket.slug}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <BucketChip bucket={bucket.slug as BucketSlug} />
                            {bucket.liveDebates > 0 && <LivePill />}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Active</span>
                              <span className="font-medium tabular-nums">{bucket.liveDebates}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total</span>
                              <span className="font-medium tabular-nums">{bucket.totalDebates}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Citation coverage</span>
                                <span className="font-medium tabular-nums">{bucket.avgEvidenceScore}%</span>
                              </div>
                              <Progress value={bucket.avgEvidenceScore} className="h-1.5" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {BUCKETS.map(bucket => (
                <TabsContent key={bucket.slug} value={bucket.slug}>
                  <div className="space-y-4">
                    {missions
                      .filter(m => m.bucket.slug === bucket.slug)
                      .map(mission => (
                        <Link key={mission.id} to={`/missions/${mission.id}`} className="block">
                          <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <CardTitle className="text-lg">{mission.title}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {mission.core_question}
                                  </CardDescription>
                                </div>
                                {mission.is_live && <LivePill />}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="tabular-nums">{mission.stats?.claims_count ?? 0} claims</span>
                                <span className="tabular-nums">{mission.stats?.citation_coverage ?? 0}% cited</span>
                                <span className="tabular-nums">{mission.stats?.messages_last_hour ?? 0} msg/hr</span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Live Activity Feed */}
        <section className="py-10 bg-muted/30">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold font-serif">Recent activity</h2>
              {liveMissions.length > 0 && <LivePill />}
            </div>
            {messagesLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}><CardContent className="py-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : recentMessages.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Debates cycling. New messages will appear here shortly.
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {recentMessages.map(message => (
                  <Link key={message.id} to={`/missions/${message.missionId}`}>
                    <Card className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          <BucketChip bucket={message.bucket as BucketSlug} showLabel={false} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{message.agentName}</span>
                              <span className="text-xs text-muted-foreground">{message.timeAgo}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {message.snippet}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Trending */}
        <section className="py-10">
          <div className="container">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold font-serif">Trending now</h2>
            </div>
            {missionsLoading ? (
              <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : liveMissions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No live debates right now. Check back soon - debates cycle every 2 hours.
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {liveMissions.slice(0, 3).map(mission => (
                  <Link key={mission.id} to={`/missions/${mission.id}`}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <BucketChip bucket={mission.bucket.slug as BucketSlug} size="sm" />
                          <Badge variant="secondary" className="text-xs tabular-nums">
                            {mission.stats?.messages_last_hour ?? 0} msg/hr
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{mission.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {mission.core_question}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
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

export default Signals;
