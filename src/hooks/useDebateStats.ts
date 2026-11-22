import { useMemo } from "react";
import { useNow } from "./useNow";
import { getStaticMissionList } from "@/data/staticData";

export function useDebateStats() {
  const now = useNow();
  const missions = useMemo(() => getStaticMissionList(now), [now]);
  return { missions, isLoading: false, error: null as Error | null };
}
