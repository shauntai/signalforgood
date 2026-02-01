import { motion } from "framer-motion";
import { Activity, MessageSquare, CheckCircle } from "lucide-react";

interface HeartbeatMetric {
  label: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
}

interface HeartbeatBarProps {
  debatesLive: number;
  messagesLast10Min: number;
  citationCoverage24h: number;
}

export function HeartbeatBar({ debatesLive, messagesLast10Min, citationCoverage24h }: HeartbeatBarProps) {
  const metrics: HeartbeatMetric[] = [
    { label: 'Debates Live', value: debatesLive, icon: <Activity className="h-4 w-4" /> },
    { label: 'Messages (10m)', value: messagesLast10Min, icon: <MessageSquare className="h-4 w-4" /> },
    { label: 'Citation Coverage', value: citationCoverage24h, icon: <CheckCircle className="h-4 w-4" />, suffix: '%' },
  ];

  return (
    <div className="sticky top-14 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container py-2">
        <div className="flex items-center justify-center gap-8">
          {metrics.map((metric, index) => (
            <div key={metric.label} className="flex items-center gap-2">
              <span className="text-muted-foreground">{metric.icon}</span>
              <span className="text-xs text-muted-foreground">{metric.label}</span>
              <motion.span
                key={metric.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="font-semibold tabular-nums text-foreground"
              >
                {metric.value}{metric.suffix}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
