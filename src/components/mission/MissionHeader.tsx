import { BucketChip } from "@/components/ui/bucket-chip";
import { LivePill } from "@/components/ui/live-pill";
import { Badge } from "@/components/ui/badge";
import type { BucketSlug } from "@/lib/constants";

interface MissionHeaderProps {
  title: string;
  coreQuestion: string | null;
  bucket: {
    slug: string;
    name: string;
  };
  isLive: boolean;
  status: "draft" | "live" | "paused" | "completed";
  debateHook?: string | null;
  successMetric?: string | null;
}

export function MissionHeader({
  title,
  coreQuestion,
  bucket,
  isLive,
  status,
  debateHook,
  successMetric,
}: MissionHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <BucketChip bucket={bucket.slug as BucketSlug} size="md" />
        {isLive && <LivePill />}
        {status === "completed" && (
          <Badge variant="secondary" className="text-xs">
            Completed
          </Badge>
        )}
        {debateHook && (
          <Badge variant="outline" className="text-xs font-normal">
            {debateHook}
          </Badge>
        )}
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
          {title}
        </h1>
        {coreQuestion && (
          <p className="mt-1 text-lg text-muted-foreground">{coreQuestion}</p>
        )}
      </div>

      {successMetric && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Target:</span>
          <span>{successMetric}</span>
        </div>
      )}
    </div>
  );
}
