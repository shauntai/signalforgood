import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BucketChip } from "@/components/ui/bucket-chip";
import { LivePill } from "@/components/ui/live-pill";
import { EvidenceMeter } from "@/components/ui/evidence-meter";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Quote } from "lucide-react";
import type { BucketSlug } from "@/lib/constants";

interface DebateCardProps {
  id: string;
  title: string;
  bucket: BucketSlug;
  problemPreview: string;
  isLive: boolean;
  lastActivityMinutes: number;
  messagesLastHour: number;
  claimsTotal: number;
  citationRate: number;
  evidenceScore: number;
}

export function DebateCard({
  id,
  title,
  bucket,
  problemPreview,
  isLive,
  lastActivityMinutes,
  messagesLastHour,
  claimsTotal,
  citationRate,
  evidenceScore,
}: DebateCardProps) {
  const formatActivity = (minutes: number) => {
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card className="group hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="pb-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <BucketChip bucket={bucket} />
          {isLive && <LivePill />}
        </div>
        <h3 className="font-serif font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between pt-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {problemPreview}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last activity {formatActivity(lastActivityMinutes)}</span>
            <EvidenceMeter score={evidenceScore} showLabel />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span className="tabular-nums">{messagesLastHour}/hr</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="tabular-nums">{claimsTotal} claims</span>
            </div>
            <div className="flex items-center gap-1">
              <Quote className="h-3 w-3" />
              <span className="tabular-nums">{citationRate}%</span>
            </div>
          </div>

          <Button asChild size="sm" className="w-full" variant={isLive ? "default" : "secondary"}>
            <Link to={`/missions/${id}`}>
              {isLive ? "Watch" : "View"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
