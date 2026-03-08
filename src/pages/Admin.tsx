import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  Download,
  DollarSign,
  TrendingUp,
  LogOut,
  CreditCard,
  Smartphone,
  Play,
  Pause,
  RefreshCw,
  Activity,
  MessageSquare,
  FileCheck,
  AlertTriangle,
} from "lucide-react";

interface GenLog {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  duration_ms: number | null;
  missions_touched: number | null;
  messages_created: number | null;
  claims_created: number | null;
  solutions_created: number | null;
  replays_created: number | null;
  errors: any[] | null;
  cycle_type: string;
}

interface SystemStatusRow {
  generation_enabled: boolean | null;
  budget_state: string | null;
  last_updated: string;
  debates_live: number | null;
  messages_last_10_min: number | null;
  citation_coverage_24h: number | null;
}

const Admin = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Overview
  const [totalIntents, setTotalIntents] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [missionCounts, setMissionCounts] = useState({ live: 0, completed: 0, draft: 0 });
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Gen logs
  const [genLogs, setGenLogs] = useState<GenLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Controls
  const [sysStatus, setSysStatus] = useState<SystemStatusRow | null>(null);
  const [controlsLoading, setControlsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Auth check
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
        setIsAuthed(!!data);
      }
      setIsChecking(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
        setIsAuthed(!!data);
      } else {
        setIsAuthed(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when authed
  useEffect(() => {
    if (!isAuthed) return;
    fetchOverview();
    fetchLogs();
    fetchControls();
  }, [isAuthed]);

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const [intentRes, completedRes] = await Promise.all([
        supabase.from("donation_intents").select("id", { count: "exact", head: true }),
        supabase.from("donation_intents").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ]);
      setTotalIntents(intentRes.count ?? 0);
      setTotalCompleted(completedRes.count ?? 0);

      // Mission counts - use edge function for draft access
      const { data: adminData } = await supabase.functions.invoke("admin-actions", {
        body: { action: "get_admin_stats" },
      });
      if (adminData?.mission_counts) {
        setMissionCounts(adminData.mission_counts);
      }
    } catch (err) {
      console.error("Overview fetch error:", err);
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from("generation_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50);
    setGenLogs((data as GenLog[]) ?? []);
    setLogsLoading(false);
  };

  const fetchControls = async () => {
    setControlsLoading(true);
    const { data } = await supabase.from("system_status").select("*").limit(1).single();
    setSysStatus(data as SystemStatusRow | null);
    setControlsLoading(false);
  };

  const toggleGeneration = async () => {
    if (!sysStatus) return;
    setActionLoading(true);
    await supabase.functions.invoke("admin-actions", {
      body: { action: "toggle_generation", enabled: !sysStatus.generation_enabled },
    });
    await fetchControls();
    setActionLoading(false);
  };

  const triggerCycle = async () => {
    setActionLoading(true);
    await supabase.functions.invoke("run-cycle");
    await new Promise((r) => setTimeout(r, 2000));
    await fetchLogs();
    await fetchControls();
    setActionLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthed(false);
  };

  const exportCSV = () => {
    supabase
      .from("donation_intents")
      .select("created_at, method, status, amount_cents")
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data }) => {
        const rows = [["Date", "Method", "Status", "Amount (cents)"]];
        (data ?? []).forEach((row) => {
          rows.push([row.created_at, row.method, row.status, String(row.amount_cents ?? "")]);
        });
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `donation-intents-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const conversionRate = totalIntents > 0 ? ((totalCompleted / totalIntents) * 100).toFixed(1) : "0.0";

  const statusColor = (s: string) => {
    if (s === "completed") return "default";
    if (s === "running") return "secondary";
    return "destructive";
  };

  // Loading
  if (isChecking) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center"><Skeleton className="h-8 w-32" /></main>
        <Footer />
      </div>
    );
  }

  // Login
  if (!isAuthed) {
    return (
      <div className="flex min-h-screen flex-col">
        <SEO title="Admin Login" noIndex />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>Admin Login</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="admin-email">Email</label>
                  <input id="admin-email" type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="admin-pw">Password</label>
                  <input id="admin-pw" type="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Dashboard
  return (
    <div className="flex min-h-screen flex-col">
      <SEO title="Admin Dashboard" noIndex />
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold font-serif">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="generation">Generation Logs</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {overviewLoading ? (
              <div className="grid sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>)}
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card><CardContent className="pt-6 flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <div><p className="text-2xl font-bold">{totalIntents}</p><p className="text-sm text-muted-foreground">Donation intents</p></div>
                  </CardContent></Card>
                  <Card><CardContent className="pt-6 flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div><p className="text-2xl font-bold">{totalCompleted}</p><p className="text-sm text-muted-foreground">Completed</p></div>
                  </CardContent></Card>
                  <Card><CardContent className="pt-6 flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div><p className="text-2xl font-bold">{conversionRate}%</p><p className="text-sm text-muted-foreground">Conversion rate</p></div>
                  </CardContent></Card>
                  <Card><CardContent className="pt-6 flex items-center gap-3">
                    <Activity className="h-8 w-8 text-primary" />
                    <div><p className="text-2xl font-bold">{missionCounts.live}</p><p className="text-sm text-muted-foreground">Live missions</p></div>
                  </CardContent></Card>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card><CardContent className="pt-6">
                    <p className="text-lg font-bold">{missionCounts.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed missions</p>
                  </CardContent></Card>
                  <Card><CardContent className="pt-6">
                    <p className="text-lg font-bold">{missionCounts.draft}</p>
                    <p className="text-sm text-muted-foreground">Draft missions</p>
                  </CardContent></Card>
                  <Card><CardContent className="pt-6">
                    <p className="text-lg font-bold">{genLogs.length}</p>
                    <p className="text-sm text-muted-foreground">Generation cycles (recent)</p>
                  </CardContent></Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Generation Logs Tab */}
          <TabsContent value="generation">
            {logsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : genLogs.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No generation logs yet.</p>
            ) : (
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Started</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                      <TableHead className="text-right">Missions</TableHead>
                      <TableHead className="text-right">Messages</TableHead>
                      <TableHead className="text-right">Solutions</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {genLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs tabular-nums whitespace-nowrap">
                          {new Date(log.started_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor(log.status) as any} className="text-xs">{log.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{log.cycle_type}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : "-"}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{log.missions_touched ?? 0}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{log.messages_created ?? 0}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{log.solutions_created ?? 0}</TableCell>
                        <TableCell>
                          {log.errors && Array.isArray(log.errors) && log.errors.length > 0 ? (
                            <span className="text-xs text-destructive flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {log.errors.length}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls">
            {controlsLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : !sysStatus ? (
              <p className="text-muted-foreground py-8 text-center">No system status found.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Generation Control</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Generation enabled</span>
                      <Badge variant={sysStatus.generation_enabled ? "default" : "destructive"}>
                        {sysStatus.generation_enabled ? "ON" : "OFF"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Budget state</span>
                      <Badge variant="outline">{sysStatus.budget_state ?? "unknown"}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={sysStatus.generation_enabled ? "destructive" : "default"}
                        size="sm"
                        onClick={toggleGeneration}
                        disabled={actionLoading}
                        className="gap-1"
                      >
                        {sysStatus.generation_enabled ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Resume</>}
                      </Button>
                      <Button variant="outline" size="sm" onClick={triggerCycle} disabled={actionLoading} className="gap-1">
                        <RefreshCw className="h-4 w-4" /> Run Cycle Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">System Status</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Live debates</span>
                      <span className="font-bold tabular-nums">{sysStatus.debates_live ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Messages (last 10 min)</span>
                      <span className="font-bold tabular-nums">{sysStatus.messages_last_10_min ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Citation coverage (24h)</span>
                      <span className="font-bold tabular-nums">{sysStatus.citation_coverage_24h ?? 0}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(sysStatus.last_updated).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
