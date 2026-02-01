import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DebateCard } from "./DebateCard";
import { BUCKETS, MOCK_DEBATES } from "@/lib/constants";
import type { BucketSlug } from "@/lib/constants";

type SortOption = 'active' | 'newest' | 'evidence';

export function DebateWall() {
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("active");

  const debates = MOCK_DEBATES as unknown as Array<{
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
  }>;

  const filteredDebates = debates
    .filter(d => selectedBucket === "all" || d.bucket === selectedBucket)
    .sort((a, b) => {
      switch (sortBy) {
        case 'active':
          return a.lastActivityMinutes - b.lastActivityMinutes;
        case 'newest':
          return a.lastActivityMinutes - b.lastActivityMinutes;
        case 'evidence':
          return b.evidenceScore - a.evidenceScore;
        default:
          return 0;
      }
    });

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredDebates.map(debate => (
            <DebateCard key={debate.id} {...debate} />
          ))}
        </div>
      </div>
    </section>
  );
}
