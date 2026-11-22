import { useEffect, useState } from "react";

const TICK_MS = 30_000;

/** Current time that updates every 30 seconds so built-in content stays "live". */
export function useNow(intervalMs: number = TICK_MS) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
