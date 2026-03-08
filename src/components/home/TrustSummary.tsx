import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileWarning, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { useDebateStats } from "@/hooks/useDebateStats";

export function TrustSummary() {
  const { status, isLoading: statusLoading } = useSystemStatus();
  const { missions, isLoading: missionsLoading } = useDebateStats();

  const isLoading = statusLoading || missionsLoading;

  // Calculate real stats
  const citationCoverage = status?.citation_coverage_24h ?? 0;
  
  // Count total claims across all missions
  const totalClaims = missions.reduce((sum, m) => sum + (m.stats?.claims_count ?? 0), 0);
  
  // Count completed missions (proxy for solutions shipped)
  const completedMissions = missions.filter(m => m.status === "completed").length;

  return (
    <section className="py-8 bg-muted/30">
      <div className="container">
        <h2 className="text-2xl font-bold font-serif mb-6 text-center">Trust and transparency</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-evidence-high">
                <CheckCircle className="h-5 w-5" />
                <CardTitle className="text-lg">Citation coverage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <div className="text-3xl font-bold tabular-nums">{citationCoverage}%</div>
              )}
              <p className="text-sm text-muted-foreground">of claims backed by sources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-evidence-medium">
                <FileWarning className="h-5 w-5" />
                <CardTitle className="text-lg">Total claims tracked</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <div className="text-3xl font-bold tabular-nums">{totalClaims}</div>
              )}
              <p className="text-sm text-muted-foreground">across all missions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <RotateCcw className="h-5 w-5" />
                <CardTitle className="text-lg">Debates completed</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <div className="text-3xl font-bold tabular-nums">{completedMissions}</div>
              )}
              <p className="text-sm text-muted-foreground">with published solutions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
