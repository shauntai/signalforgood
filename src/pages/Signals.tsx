import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BucketChip } from "@/components/ui/bucket-chip";
import { LivePill } from "@/components/ui/live-pill";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { useDebateStats } from "@/hooks/useDebateStats";
import { BUCKETS, MOCK_DEBATES, MOCK_TICKER_MESSAGES } from "@/lib/constants";
import { 
  TrendingUp, 
  MessageSquare, 
  FileCheck, 
  Activity,
  Clock,
  BarChart3
} from "lucide-react";
import type { BucketSlug } from "@/lib/constants";

const Signals = () => {
  const { status: systemStatus, isLoading: statusLoading } = useSystemStatus();
  
  // Get live debates
  const liveDebates = MOCK_DEBATES.filter(d => d.isLive);
  
  // Get recent activity (mock - would use real-time hook)
  const recentMessages = MOCK_TICKER_MESSAGES.slice(0, 6);
  
  // Calculate bucket stats
  const bucketStats = BUCKETS.map(bucket => {
    const debates = MOCK_DEBATES.filter(d => d.bucket === bucket.slug);
    const liveCount = debates.filter(d => d.isLive).length;
    const avgEvidence = Math.round(
      debates.reduce((sum, d) => sum + d.evidenceScore, 0) / debates.length
    );
    return {
      ...bucket,
      totalDebates: debates.length,
      liveDebates: liveCount,
      avgEvidenceScore: avgEvidence,
    };
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Signals"
        description="Real-time intelligence dashboard. Track live debates, trending topics, and insights across Education, Jobs, Housing, and Health."
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-20">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4">
              Signals
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time intelligence across Education, Jobs, Housing, and Health.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 border-b">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {systemStatus?.debates_live ?? liveDebates.length}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Live debates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {systemStatus?.messages_last_10_min ?? 24}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Messages (10 min)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {systemStatus?.citation_coverage_24h ?? 82}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Citation coverage</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">
                      {MOCK_DEBATES.reduce((sum, d) => sum + d.claimsTotal, 0)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Total claims</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Lane Overview */}
        <section className="py-12">
          <div className="container">
            <h2 className="text-2xl font-bold font-serif mb-6">By lane</h2>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All lanes</TabsTrigger>
                {BUCKETS.map(bucket => (
                  <TabsTrigger key={bucket.slug} value={bucket.slug} className="hidden sm:inline-flex">
                    {bucket.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bucketStats.map(bucket => (
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
                            <span className="text-muted-foreground">Active debates</span>
                            <span className="font-medium">{bucket.liveDebates}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total debates</span>
                            <span className="font-medium">{bucket.totalDebates}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Avg. evidence score</span>
                              <span className="font-medium">{bucket.avgEvidenceScore}%</span>
                            </div>
                            <Progress value={bucket.avgEvidenceScore} className="h-1.5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {BUCKETS.map(bucket => (
                <TabsContent key={bucket.slug} value={bucket.slug}>
                  <div className="space-y-4">
                    {MOCK_DEBATES
                      .filter(d => d.bucket === bucket.slug)
                      .map(debate => (
                        <Card key={debate.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <CardTitle className="text-lg">{debate.title}</CardTitle>
                                <CardDescription className="mt-1">
                                  {debate.problemPreview}
                                </CardDescription>
                              </div>
                              {debate.isLive && <LivePill />}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span>{debate.claimsTotal} claims</span>
                              <span>{debate.citationRate}% cited</span>
                              <span>Evidence: {debate.evidenceScore}%</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Live Activity Feed */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold font-serif">Live activity</h2>
              <LivePill />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {recentMessages.map(message => (
                <Card key={message.id}>
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
              ))}
            </div>
          </div>
        </section>

        {/* Trending Topics */}
        <section className="py-12">
          <div className="container">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold font-serif">Trending now</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {liveDebates.slice(0, 3).map(debate => (
                <Card key={debate.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BucketChip bucket={debate.bucket as BucketSlug} size="sm" />
                      <Badge variant="secondary" className="text-xs">
                        {debate.messagesLastHour} msg/hr
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{debate.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {debate.problemPreview}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Signals;
