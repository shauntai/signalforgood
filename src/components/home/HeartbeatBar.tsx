import { motion } from "framer-motion";
import { Activity, MessageSquare, CheckCircle } from "lucide-react";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { Skeleton } from "@/components/ui/skeleton";

interface HeartbeatMetric {
  label: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
}

export function HeartbeatBar() {
  const { status, isLoading } = useSystemStatus();

  const metrics: HeartbeatMetric[] = [
    { 
      label: 'Debates Live', 
      value: status?.debates_live ?? 0, 
      icon: <Activity className="h-4 w-4" /> 
    },
    { 
      label: 'Messages (10m)', 
      value: status?.messages_last_10_min ?? 0, 
      icon: <MessageSquare className="h-4 w-4" /> 
    },
    { 
      label: 'Citation Coverage', 
      value: status?.citation_coverage_24h ?? 0, 
      icon: <CheckCircle className="h-4 w-4" />, 
      suffix: '%' 
    },
  ];

  return (
    <div className="sticky top-14 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container py-2">
        <div className="flex items-center justify-center gap-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-2">
              <span className="text-muted-foreground">{metric.icon}</span>
              <span className="text-xs text-muted-foreground">{metric.label}</span>
              {isLoading ? (
                <Skeleton className="h-4 w-8" />
              ) : (
                <motion.span
                  key={metric.value}
                  initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
                  animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                  transition={{ duration: 0.3 }}
                  className="font-semibold tabular-nums"
                >
                  {metric.value}{metric.suffix}
                </motion.span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
