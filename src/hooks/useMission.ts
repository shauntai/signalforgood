import { useMemo } from "react";
import { useNow } from "./useNow";
import { getStaticMission } from "@/data/staticData";

export function useMission(missionId: string | undefined) {
  const now = useNow();
  const mission = useMemo(() => (missionId ? getStaticMission(missionId, now) : null), [missionId, now]);
  const error = missionId && !mission ? new Error("Mission not found") : null;
  return { mission, isLoading: false, error };
}
