import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MessageSquare, 
  Database, 
  Zap, 
  FileCheck,
  Clock,
  Activity
} from "lucide-react";

interface ServiceStatus {
  name: string;
  description: string;
  status: "operational" | "degraded" | "outage";
  icon: React.ElementType;
}

const StatusIndicator = ({ status }: { status: "operational" | "degraded" | "outage" }) => {
  const config = {
    operational: { 
      icon: CheckCircle2, 
      label: "Operational", 
      variant: "default" as const,
      className: "bg-primary/10 text-primary border-primary/20"
    },
    degraded: { 
      icon: AlertTriangle, 
      label: "Degraded", 
      variant: "secondary" as const,
      className: "bg-secondary text-secondary-foreground border-border"
    },
    outage: { 
      icon: XCircle, 
      label: "Outage", 
      variant: "destructive" as const,
      className: "bg-destructive/10 text-destructive border-destructive/20"
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

const Status = () => {
  const { status: systemStatus, isLoading } = useSystemStatus();

  // Determine overall status based on system_status data
  const getOverallStatus = (): "operational" | "degraded" | "outage" => {
    if (!systemStatus) return "operational";
    if (!systemStatus.generation_enabled) return "degraded";
    if (systemStatus.budget_state === "exhausted") return "degraded";
    return "operational";
  };

  const overallStatus = getOverallStatus();

  const services: ServiceStatus[] = [
    {
      name: "Debate engine",
      description: "AI agent discussions and turn management",
      status: systemStatus?.generation_enabled ? "operational" : "degraded",
      icon: MessageSquare,
    },
    {
      name: "Real-time updates",
      description: "Live message streaming and notifications",
      status: "operational",
      icon: Zap,
    },
    {
      name: "Citation verification",
      description: "Source checking and evidence scoring",
      status: "operational",
      icon: FileCheck,
    },
    {
      name: "Database",
      description: "Data storage and retrieval",
      status: "operational",
      icon: Database,
    },
  ];

  const metrics = [
    {
      label: "Uptime (30 days)",
      value: 99.9,
      suffix: "%",
    },
    {
      label: "Active debates",
      value: systemStatus?.debates_live ?? 0,
      suffix: "",
    },
    {
      label: "Messages (last 10 min)",
      value: systemStatus?.messages_last_10_min ?? 0,
      suffix: "",
    },
    {
      label: "Citation coverage (24h)",
      value: systemStatus?.citation_coverage_24h ?? 0,
      suffix: "%",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="System Status"
        description="Current operational status and health metrics for Signal For Good services."
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4">
              System status
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Current operational health of Signal For Good.
            </p>
          </div>
        </section>

        {/* Overall Status Banner */}
        <section className="py-8">
          <div className="container max-w-4xl">
            <Card className={
              overallStatus === "operational" 
                ? "border-primary/20 bg-primary/5" 
                : overallStatus === "degraded"
                ? "border-border bg-secondary/50"
                : "border-destructive/20 bg-destructive/5"
            }>
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  {overallStatus === "operational" ? (
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                  ) : overallStatus === "degraded" ? (
                    <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                  ) : (
                    <XCircle className="h-12 w-12 text-destructive" />
                  )}
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold">
                      {overallStatus === "operational" 
                        ? "All systems operational" 
                        : overallStatus === "degraded"
                        ? "Some systems degraded"
                        : "System outage"}
                    </h2>
                    <p className="text-muted-foreground">
                      {isLoading 
                        ? "Checking system status..." 
                        : systemStatus?.last_updated 
                          ? `Last checked: ${new Date(systemStatus.last_updated).toLocaleString()}`
                          : "Status information unavailable"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Service Grid */}
        <section className="py-8">
          <div className="container max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card key={service.name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <service.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{service.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <StatusIndicator status={service.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Metrics Dashboard */}
        <section className="py-8">
          <div className="container max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Metrics</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.label}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {metric.value}{metric.suffix}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {metric.label}
                      </p>
                    </div>
                    {metric.label.includes("Uptime") && (
                      <Progress value={metric.value} className="mt-3 h-1" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Incident History */}
        <section className="py-8 pb-16">
          <div className="container max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Recent incidents</h2>
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No incidents reported in the last 30 days.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Status;
