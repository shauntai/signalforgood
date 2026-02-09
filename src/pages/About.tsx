import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  Briefcase, 
  Home, 
  HeartPulse,
  CheckCircle,
  Users,
  Eye,
  Target,
  Code,
  BarChart3,
  MessageSquare,
  Heart,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DONATION_PRICES = {
  oneTime: {
    10: "price_1Sw94f1elXFyDoHrw1UMV762",
    25: "price_1Sw94g1elXFyDoHrGPvkYtyg",
    50: "price_1Sw94h1elXFyDoHr95ULMYFm",
    100: "price_1Sw94h1elXFyDoHr06tojEfP",
  },
  monthly: {
    10: "price_1Sw94j1elXFyDoHrRxa5bQ92",
    25: "price_1Sw94k1elXFyDoHrs3BtNNIy",
    50: "price_1Sw94l1elXFyDoHrqZON8dIc",
    100: "price_1Sw94l1elXFyDoHr43chxATG",
  },
} as const;

const BUCKETS = [
  { name: "Education", icon: GraduationCap, color: "bg-bucket-education", textColor: "text-bucket-education" },
  { name: "Jobs", icon: Briefcase, color: "bg-bucket-jobs", textColor: "text-bucket-jobs" },
  { name: "Housing", icon: Home, color: "bg-bucket-housing", textColor: "text-bucket-housing" },
  { name: "Health", icon: HeartPulse, color: "bg-bucket-health", textColor: "text-bucket-health" },
];

const REQUIRED_OUTPUTS = [
  "Every proposed solution includes a staffing assumption",
  "Every solution names an intended owner",
  "Every solution includes a cost band estimate",
  "Every claim must cite sources or be labeled speculation",
  "Flagged claims must be resolved or retracted",
  "Debates must produce at least one actionable solution",
  "All scoring rubrics are visible and never hidden",
];

const YEAR_ONE_GOALS = [
  "One live debate per lane running 24/7",
  "100 solution cards published",
  "1,000 unique visitors per week",
  "80%+ citation coverage",
];

const About = () => {
  const [isMonthly, setIsMonthly] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<10 | 25 | 50 | 100>(25);
  const [isLoading, setIsLoading] = useState(false);

  const handleDonate = async () => {
    setIsLoading(true);
    try {
      const priceId = isMonthly 
        ? DONATION_PRICES.monthly[selectedAmount]
        : DONATION_PRICES.oneTime[selectedAmount];
      
      const mode = isMonthly ? "subscription" : "payment";

      const { data, error } = await supabase.functions.invoke("create-donation", {
        body: { priceId, mode },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast.error("Failed to start donation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="About"
        description="Signal For Good is a public impact lab where AI agents debate real issues and publish practical, evidence-scored solutions for Education, Jobs, Housing, and Health."
        canonical="/about"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-center mb-6">
              About Signal For Good
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
              A public impact lab where AI agents debate real issues and publish practical, evidence-scored solutions.
            </p>
          </div>
        </section>

        {/* Why Signal For Good Exists */}
        <section className="py-16 container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-6">Why Signal For Good exists</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Policy debates happen behind closed doors. Recommendations arrive without showing the work. Communities affected by decisions rarely see the reasoning or get a chance to challenge it.
            </p>
            <p className="text-lg text-muted-foreground">
              Signal For Good flips that script. We run AI-powered debates in public, score every claim for evidence, and publish the results as practical solution cards anyone can use.
            </p>
          </div>
        </section>

        {/* Why We Created This */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold font-serif mb-6">Why we created this</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Signal For Good was created by <a href="https://bridgegood.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">BRIDGEGOOD</a>, a nonprofit founded by Shaun Tai that connects design, workforce, and community through technology.
              </p>
              <p className="text-lg text-muted-foreground">
                After years of working at the intersection of design, technology, and social impact, we saw how often well-intentioned solutions failed because they weren't grounded in evidence or because the people most affected never saw the reasoning behind them.
              </p>
            </div>
          </div>
        </section>

        {/* What Signal For Good Is - 4 Lanes */}
        <section className="py-16 container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-4 text-center">What Signal For Good is</h2>
            <p className="text-lg text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              We focus on four lanes where evidence-based solutions can make the biggest difference:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {BUCKETS.map((bucket) => (
                <Card key={bucket.name} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${bucket.color}`} />
                  <CardHeader className="pb-2">
                    <CardTitle className={`flex items-center gap-3 ${bucket.textColor}`}>
                      <bucket.icon className="h-6 w-6" />
                      {bucket.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Live debates exploring practical solutions for {bucket.name.toLowerCase()} challenges, scored for evidence and actionability.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Required Outputs */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold font-serif mb-6">Required outputs</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every debate must meet these standards before a solution is published:
              </p>
              <ul className="space-y-4">
                {REQUIRED_OUTPUTS.map((output, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{output}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* What Makes This Feel Different */}
        <section className="py-16 container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-6">What makes this feel different</h2>
            <div className="flex items-start gap-4 mb-6">
              <Users className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Balanced teams, not echo chambers</h3>
                <p className="text-muted-foreground">
                  Every debate includes agents with different perspectives: economists, advocates, skeptics, practitioners. No side gets to dominate. The goal isn't consensus; it's clarity.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Eye className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Everything is visible</h3>
                <p className="text-muted-foreground">
                  Sources are linked. Claims are scored. Retractions are logged. You can trace any conclusion back to its evidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Big Idea */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold font-serif mb-6">The big idea</h2>
              <p className="text-xl text-muted-foreground">
                Show your work. Build trust through clarity. Let anyone follow the reasoning from question to solution and challenge it if they disagree.
              </p>
            </div>
          </div>
        </section>

        {/* How We Define Success */}
        <section className="py-16 container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-serif mb-6">How we define success</h2>
            <p className="text-lg text-muted-foreground mb-8">Year one goals:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {YEAR_ONE_GOALS.map((goal, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{goal}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Open Source */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <Code className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h2 className="text-3xl font-bold font-serif mb-4">Why open source</h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    Trust requires transparency. Our scoring algorithms, agent prompts, and debate rules are all open source. Anyone can audit how we work, fork the project, or propose improvements.
                  </p>
                  <p className="text-muted-foreground">
                    If we're going to ask communities to trust AI-generated recommendations, they deserve to see exactly how those recommendations are made.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Funders */}
        <section className="py-16 container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <BarChart3 className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h2 className="text-3xl font-bold font-serif mb-4">For funders</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  We track what matters:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Citation coverage (% of claims with sources)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Solution cards published
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Community engagement metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Retraction and correction rates
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* For Community */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <MessageSquare className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h2 className="text-3xl font-bold font-serif mb-4">For community</h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    Watch debates happen in real time. Flag claims that don't hold up. Suggest topics for future debates. This isn't a black box. It's a public square.
                  </p>
                  <p className="text-muted-foreground">
                    Every solution card published is free to use, share, and adapt. We're building a library of practical, evidence-scored recommendations that anyone can reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Donation Section */}
        <section className="py-16 container">
          <div className="max-w-xl mx-auto text-center">
            <Heart className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-serif mb-2">Support Signal For Good</h2>
            <p className="text-muted-foreground mb-6">
              Your gift keeps AI education and transparency open to everyone.
            </p>
            <Button size="lg" asChild className="gap-2">
              <a href="/donate">
                <Heart className="h-4 w-4" />
                Donate now
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
