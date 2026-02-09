import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  Download,
  CreditCard,
  Smartphone,
  DollarSign,
  TrendingUp,
  LogOut,
} from "lucide-react";

interface IntentByMethod {
  method: string;
  count: number;
}

interface DailyTrend {
  day: string;
  count: number;
}

const AdminMetrics = () => {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Metrics state
  const [todayByMethod, setTodayByMethod] = useState<IntentByMethod[]>([]);
  const [weekTrend, setWeekTrend] = useState<DailyTrend[]>([]);
  const [totalIntents, setTotalIntents] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check admin role
        const { data } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        setIsAuthed(!!data);
      }
      setIsChecking(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        setIsAuthed(!!data);
      } else {
        setIsAuthed(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch metrics when authed
  useEffect(() => {
    if (!isAuthed) return;
    fetchMetrics();
  }, [isAuthed]);

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weekISO = sevenDaysAgo.toISOString();

      // Today's intents
      const { data: todayData } = await supabase
        .from("donation_intents")
        .select("method")
        .gte("created_at", todayISO);

      // Group by method
      const methodCounts: Record<string, number> = {};
      (todayData ?? []).forEach((row) => {
        methodCounts[row.method] = (methodCounts[row.method] || 0) + 1;
      });
      setTodayByMethod(
        Object.entries(methodCounts).map(([method, count]) => ({ method, count }))
      );

      // 7-day trend
      const { data: weekData } = await supabase
        .from("donation_intents")
        .select("created_at")
        .gte("created_at", weekISO)
        .order("created_at", { ascending: true });

      const dayCounts: Record<string, number> = {};
      (weekData ?? []).forEach((row) => {
        const day = row.created_at.slice(0, 10);
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      setWeekTrend(
        Object.entries(dayCounts).map(([day, count]) => ({ day, count }))
      );

      // Totals
      const { count: intentCount } = await supabase
        .from("donation_intents")
        .select("id", { count: "exact", head: true });
      setTotalIntents(intentCount ?? 0);

      const { count: completedCount } = await supabase
        .from("donation_intents")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed");
      setTotalCompleted(completedCount ?? 0);
    } catch (err) {
      console.error("Metrics fetch error:", err);
    } finally {
      setMetricsLoading(false);
    }
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
    const rows = [["Date", "Method", "Status", "Amount (cents)"]];
    // Re-fetch all for export
    supabase
      .from("donation_intents")
      .select("created_at, method, status, amount_cents")
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data }) => {
        (data ?? []).forEach((row) => {
          rows.push([
            row.created_at,
            row.method,
            row.status,
            String(row.amount_cents ?? ""),
          ]);
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

  const methodIcon = (method: string) => {
    switch (method) {
      case "card": return <CreditCard className="h-4 w-4" />;
      case "venmo":
      case "cashapp": return <Smartphone className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const conversionRate = totalIntents > 0
    ? ((totalCompleted / totalIntents) * 100).toFixed(1)
    : "0.0";

  if (isChecking) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Skeleton className="h-8 w-32" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen flex-col">
        <SEO title="Admin Login" noIndex />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="admin-email">Email</label>
                  <input
                    id="admin-email"
                    type="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="admin-pw">Password</label>
                  <input
                    id="admin-pw"
                    type="password"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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

  return (
    <div className="flex min-h-screen flex-col">
      <SEO title="Admin Metrics" noIndex />
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif">Donation Metrics</h1>
            <p className="text-muted-foreground">Track donation intents and conversions.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {metricsLoading ? (
          <div className="grid sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{totalIntents}</p>
                      <p className="text-sm text-muted-foreground">Total intents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{totalCompleted}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{conversionRate}%</p>
                      <p className="text-sm text-muted-foreground">Conversion rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today by method */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today by method</CardTitle>
                </CardHeader>
                <CardContent>
                  {todayByMethod.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No intents today.</p>
                  ) : (
                    <div className="space-y-3">
                      {todayByMethod.map((item) => (
                        <div key={item.method} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {methodIcon(item.method)}
                            <span className="text-sm font-medium capitalize">{item.method.replace("_", " ")}</span>
                          </div>
                          <span className="font-bold tabular-nums">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Last 7 days trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {weekTrend.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {weekTrend.map((item) => {
                        const max = Math.max(...weekTrend.map((d) => d.count), 1);
                        return (
                          <div key={item.day} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-20 shrink-0">
                              {item.day.slice(5)}
                            </span>
                            <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all"
                                style={{ width: `${(item.count / max) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold tabular-nums w-8 text-right">
                              {item.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminMetrics;
