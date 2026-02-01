import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DebateCard } from "./DebateCard";
import { useDebateStats } from "@/hooks/useDebateStats";
import { Skeleton } from "@/components/ui/skeleton";
import { BUCKETS } from "@/lib/constants";
import type { BucketSlug } from "@/lib/constants";

type SortOption = 'active' | 'newest' | 'evidence';

export function DebateWall() {
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("active");
  const { missions, isLoading } = useDebateStats();

  const filteredMissions = missions
    .filter(m => selectedBucket === "all" || m.bucket.slug === selectedBucket)
    .sort((a, b) => {
      switch (sortBy) {
        case 'active':
          // Sort by last message time, most recent first
          const aTime = a.stats?.last_message_at ? new Date(a.stats.last_message_at).getTime() : 0;
          const bTime = b.stats?.last_message_at ? new Date(b.stats.last_message_at).getTime() : 0;
          return bTime - aTime;
        case 'newest':
          return bTime - aTime;
        case 'evidence':
          return (b.stats?.citation_coverage ?? 0) - (a.stats?.citation_coverage ?? 0);
        default:
          return 0;
      }
    });

  // Calculate time ago for last activity
  const getLastActivityMinutes = (lastMessageAt: string | null): number => {
    if (!lastMessageAt) return 999;
    const now = new Date();
    const then = new Date(lastMessageAt);
    return Math.floor((now.getTime() - then.getTime()) / 60000);
  };

  return (
    <section className="py-8">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Bucket Tabs */}
          <Tabs value={selectedBucket} onValueChange={setSelectedBucket} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {BUCKETS.map(bucket => (
                <TabsTrigger key={bucket.slug} value={bucket.slug} className="gap-1.5">
                  <span className={`h-2 w-2 rounded-full bg-${bucket.color}`} />
                  <span className="hidden md:inline">{bucket.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Most Active</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="evidence">Highest Evidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMissions.map(mission => (
              <DebateCard
                key={mission.id}
                id={mission.id}
                title={mission.title}
                bucket={mission.bucket.slug as BucketSlug}
                problemPreview={mission.core_question || ""}
                isLive={mission.is_live}
                lastActivityMinutes={getLastActivityMinutes(mission.stats?.last_message_at ?? null)}
                messagesLastHour={mission.stats?.messages_last_hour ?? 0}
                claimsTotal={mission.stats?.claims_count ?? 0}
                citationRate={mission.stats?.citation_coverage ?? 0}
                evidenceScore={mission.stats?.citation_coverage ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
