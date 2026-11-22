import { useMemo } from "react";
import { useNow } from "./useNow";
import { getStaticSystemStatus } from "@/data/staticData";

export function useSystemStatus() {
  const now = useNow();
  const status = useMemo(() => getStaticSystemStatus(now), [now]);
  return { status, isLoading: false, error: null as Error | null };
}
