import { useState } from "react";
import { ClaimCard } from "../ClaimCard";
import { EvidenceMeter } from "@/components/ui/evidence-meter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileSearch, AlertTriangle, CheckCircle, HelpCircle, Sparkles } from "lucide-react";

interface Claim {
  id: string;
  message_id: string;
  claim_text: string;
  claim_type: "evidence" | "precedent" | "assumption" | "speculation";
  confidence: number;
  is_flagged: boolean;
  is_retracted: boolean;
  created_at: string;
}

interface EvidenceModeProps {
  claims: Claim[];
  citationCoverage?: number;
}

type ClaimFilter = "all" | "evidence" | "precedent" | "assumption" | "speculation" | "flagged";

export function EvidenceMode({ claims, citationCoverage = 0 }: EvidenceModeProps) {
  const [filter, setFilter] = useState<ClaimFilter>("all");

  const filteredClaims = claims.filter((claim) => {
    if (filter === "all") return true;
    if (filter === "flagged") return claim.is_flagged;
    return claim.claim_type === filter;
  });

  const claimCounts = {
    all: claims.length,
    evidence: claims.filter((c) => c.claim_type === "evidence").length,
    precedent: claims.filter((c) => c.claim_type === "precedent").length,
    assumption: claims.filter((c) => c.claim_type === "assumption").length,
    speculation: claims.filter((c) => c.claim_type === "speculation").length,
    flagged: claims.filter((c) => c.is_flagged).length,
  };

  const avgConfidence =
    claims.length > 0
      ? Math.round(claims.reduce((sum, c) => sum + c.confidence, 0) / claims.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{claims.length}</div>
            <div className="text-sm text-muted-foreground">Total Claims</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{citationCoverage}%</div>
            <div className="text-sm text-muted-foreground">Citation Coverage</div>
            <EvidenceMeter score={citationCoverage} size="sm" className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{avgConfidence}%</div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
            <EvidenceMeter score={avgConfidence} size="sm" className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{claimCounts.flagged}</div>
            <div className="text-sm text-muted-foreground">Flagged Claims</div>
          </CardContent>
        </Card>
      </div>

      {/* Claims ledger */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            Evidence Ledger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ClaimFilter)}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="gap-1">
                All
                <Badge variant="secondary" className="ml-1">{claimCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="evidence" className="gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                Evidence
                <Badge variant="secondary" className="ml-1">{claimCounts.evidence}</Badge>
              </TabsTrigger>
              <TabsTrigger value="precedent" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Precedent
                <Badge variant="secondary" className="ml-1">{claimCounts.precedent}</Badge>
              </TabsTrigger>
              <TabsTrigger value="assumption" className="gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                Assumption
                <Badge variant="secondary" className="ml-1">{claimCounts.assumption}</Badge>
              </TabsTrigger>
              <TabsTrigger value="speculation" className="gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Speculation
                <Badge variant="secondary" className="ml-1">{claimCounts.speculation}</Badge>
              </TabsTrigger>
              {claimCounts.flagged > 0 && (
                <TabsTrigger value="flagged" className="gap-1 text-destructive">
                  Flagged
                  <Badge variant="destructive" className="ml-1">{claimCounts.flagged}</Badge>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value={filter} className="mt-0">
              {filteredClaims.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No claims match this filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredClaims.map((claim) => (
                    <ClaimCard
                      key={claim.id}
                      claimText={claim.claim_text}
                      claimType={claim.claim_type}
                      confidence={claim.confidence}
                      isFlagged={claim.is_flagged}
                      isRetracted={claim.is_retracted}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
