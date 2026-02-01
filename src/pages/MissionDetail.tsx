import { useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useMission } from "@/hooks/useMission";
import { MissionHeader } from "@/components/mission/MissionHeader";
import { WatchModeToggle, type WatchMode } from "@/components/mission/WatchModeToggle";
import { LensSelector, type LensType } from "@/components/mission/LensSelector";
import { ReplayMode } from "@/components/mission/modes/ReplayMode";
import { LiveStudioMode } from "@/components/mission/modes/LiveStudioMode";
import { DecisionMode } from "@/components/mission/modes/DecisionMode";
import { EvidenceMode } from "@/components/mission/modes/EvidenceMode";
import { Skeleton } from "@/components/ui/skeleton";

const MissionDetail = () => {
  const { id } = useParams();
  const { mission, isLoading, error } = useMission(id);
  const [watchMode, setWatchMode] = useState<WatchMode>("live");
  const [lens, setLens] = useState<LensType>("default");
  const [localContext, setLocalContext] = useState("");

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full max-w-xl" />
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="grid gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Mission Not Found</h1>
            <p className="text-muted-foreground">
              {error?.message || "This mission could not be loaded."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderWatchMode = () => {
    switch (watchMode) {
      case "replay":
        return <ReplayMode replay={mission.replay} missionTitle={mission.title} />;
      case "live":
        return (
          <LiveStudioMode
            messages={mission.messages}
            isLive={mission.is_live}
          />
        );
      case "decision":
        return (
          <DecisionMode
            score={mission.score}
            solution={mission.solution}
            isCompleted={mission.status === "completed"}
          />
        );
      case "evidence":
        return (
          <EvidenceMode
            claims={mission.claims}
            citationCoverage={mission.score?.citation_coverage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6 sm:py-8">
        <div className="space-y-6">
          {/* Mission Header */}
          <MissionHeader
            title={mission.title}
            coreQuestion={mission.core_question}
            bucket={mission.bucket}
            isLive={mission.is_live}
            status={mission.status}
            debateHook={mission.debate_hook}
            successMetric={mission.success_metric}
          />

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
            <WatchModeToggle
              mode={watchMode}
              onModeChange={setWatchMode}
              isLive={mission.is_live}
            />
            <LensSelector
              lens={lens}
              onLensChange={setLens}
              localContext={localContext}
              onLocalContextChange={setLocalContext}
            />
          </div>

          {/* Watch Mode Content */}
          <div className="min-h-[400px]">{renderWatchMode()}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MissionDetail;
