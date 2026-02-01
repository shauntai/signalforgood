import { ScoreCard } from "../ScoreCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Clock, DollarSign, Users, AlertTriangle, CheckCircle } from "lucide-react";

interface Score {
  evidence_score: number;
  actionability_score: number;
  risk_score: number;
  clarity_score: number;
  overall_score: number;
  citation_coverage: number;
  flagged_claim_rate: number;
  revision_count: number;
}

interface SolutionCard {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  intended_owner: string | null;
  timeline: string | null;
  cost_band: string | null;
  staffing_assumptions: string | null;
  dependencies: string | null;
  risks_mitigations: string | null;
  success_metrics: any[];
  is_published: boolean;
}

interface DecisionModeProps {
  score: Score | null;
  solution: SolutionCard | null;
  isCompleted: boolean;
}

export function DecisionMode({ score, solution, isCompleted }: DecisionModeProps) {
  if (!isCompleted && !solution) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Decision Pending</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          This debate is still in progress. Decision outputs will appear here once agents reach convergence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scorecard */}
      {score && <ScoreCard score={score} />}

      {/* Solution Card */}
      {solution ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-evidence-high" />
              Solution: {solution.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {solution.summary && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Summary</h4>
                <p className="text-sm">{solution.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {solution.intended_owner && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Users className="h-3.5 w-3.5" />
                    Owner
                  </div>
                  <p className="text-sm font-medium">{solution.intended_owner}</p>
                </div>
              )}
              {solution.timeline && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    Timeline
                  </div>
                  <p className="text-sm font-medium">{solution.timeline}</p>
                </div>
              )}
              {solution.cost_band && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    Cost Band
                  </div>
                  <p className="text-sm font-medium">{solution.cost_band}</p>
                </div>
              )}
              {solution.staffing_assumptions && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Users className="h-3.5 w-3.5" />
                    Staffing
                  </div>
                  <p className="text-sm font-medium">{solution.staffing_assumptions}</p>
                </div>
              )}
            </div>

            {solution.content && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Full Content</h4>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{solution.content}</p>
                </div>
              </div>
            )}

            {solution.risks_mitigations && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-evidence-medium" />
                  Risks & Mitigations
                </h4>
                <p className="text-sm whitespace-pre-wrap">{solution.risks_mitigations}</p>
              </div>
            )}

            {solution.success_metrics && solution.success_metrics.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Success Metrics</h4>
                <div className="flex flex-wrap gap-2">
                  {solution.success_metrics.map((metric: any, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {typeof metric === "string" ? metric : metric.label || metric.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>Solution card is being generated...</p>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
