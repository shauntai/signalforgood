import { EvidenceMeter } from "@/components/ui/evidence-meter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, AlertTriangle, FileText, Award, Quote, Flag, RefreshCw } from "lucide-react";

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

interface ScoreCardProps {
  score: Score;
}

const scoreItems = [
  { key: "overall_score", label: "Overall", icon: Award, description: "Combined quality score" },
  { key: "evidence_score", label: "Evidence", icon: TrendingUp, description: "Strength of supporting evidence" },
  { key: "actionability_score", label: "Actionability", icon: Target, description: "How implementable is this?" },
  { key: "clarity_score", label: "Clarity", icon: FileText, description: "Clear communication" },
  { key: "risk_score", label: "Risk Identified", icon: AlertTriangle, description: "Risks acknowledged", invert: true },
  { key: "citation_coverage", label: "Citations", icon: Quote, description: "Claims backed by sources" },
];

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Mission Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scoreItems.map((item) => {
            const Icon = item.icon;
            const value = score[item.key as keyof Score] as number;
            
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{value}%</span>
                </div>
                <EvidenceMeter score={value} size="md" />
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <Flag className="h-4 w-4 text-destructive" />
            <span className="text-muted-foreground">Flagged:</span>
            <span className="font-medium">{score.flagged_claim_rate}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Revisions:</span>
            <span className="font-medium">{score.revision_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
