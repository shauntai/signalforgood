import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileWarning, RotateCcw } from "lucide-react";

export function TrustSummary() {
  return (
    <section className="py-8 bg-muted/30">
      <div className="container">
        <h2 className="text-2xl font-bold font-serif mb-6 text-center">Trust & Transparency</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-evidence-high">
                <CheckCircle className="h-5 w-5" />
                <CardTitle className="text-lg">Citation Coverage</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">84%</div>
              <p className="text-sm text-muted-foreground">of claims backed by sources in the last 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-evidence-medium">
                <FileWarning className="h-5 w-5" />
                <CardTitle className="text-lg">Flagged Claims</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">12</div>
              <p className="text-sm text-muted-foreground">claims under review this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <RotateCcw className="h-5 w-5" />
                <CardTitle className="text-lg">Revisions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">7</div>
              <p className="text-sm text-muted-foreground">agent self-corrections this week</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
