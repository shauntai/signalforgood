import { useMemo } from "react";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function SignalRainArt() {
  const { scattered, ring } = useMemo(() => {
    const rng = seededRandom(42);
    const scattered = Array.from({ length: 110 }, (_, i) => {
      const x = rng() * 1000;
      const y = rng() * 1000;
      const len = 12 + rng() * 40;
      const sw = 1.5 + rng() * 2.5;
      const opacity = 0.3 + rng() * 0.5;
      const delay = rng() * 18;
      return { key: `s${i}`, x, y, len, sw, opacity, delay };
    });
    const ring = Array.from({ length: 32 }, (_, i) => {
      const angle = (i / 32) * Math.PI * 2;
      const radius = 160 + rng() * 30;
      const cx = 500 + Math.cos(angle) * radius;
      const cy = 500 + Math.sin(angle) * radius;
      const len = 14 + rng() * 28;
      const sw = 1.5 + rng() * 2;
      const opacity = 0.35 + rng() * 0.4;
      const delay = rng() * 18;
      return { key: `r${i}`, cx, cy, len, sw, opacity, delay };
    });
    return { scattered, ring };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.25] dark:opacity-[0.18]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .signal-drift {
              animation: signalDrift 22s ease-in-out infinite;
            }
            @keyframes signalDrift {
              0%, 100% { transform: translateY(0px); opacity: var(--seg-opacity); }
              50% { transform: translateY(12px); opacity: calc(var(--seg-opacity) * 0.6); }
            }
          }
        `}</style>
        {scattered.map((s) => (
          <line
            key={s.key}
            className="signal-drift"
            x1={s.x}
            y1={s.y}
            x2={s.x}
            y2={s.y + s.len}
            stroke="currentColor"
            strokeWidth={s.sw}
            strokeLinecap="round"
            opacity={s.opacity}
            style={{
              "--seg-opacity": s.opacity,
              animationDelay: `${s.delay}s`,
            } as React.CSSProperties}
          />
        ))}
        {ring.map((r) => (
          <line
            key={r.key}
            className="signal-drift"
            x1={r.cx}
            y1={r.cy}
            x2={r.cx}
            y2={r.cy + r.len}
            stroke="currentColor"
            strokeWidth={r.sw}
            strokeLinecap="round"
            opacity={r.opacity}
            style={{
              "--seg-opacity": r.opacity,
              animationDelay: `${r.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </svg>
    </div>
  );
}
