import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Target,
  MessageSquare,
  ShieldCheck,
  GitMerge,
  Wrench,
  Bot,
  BarChart3,
  Clock,
  ArrowRight,
} from "lucide-react";

const ROUNDS = [
  { icon: Target, title: "1. Define", desc: "The system frames a clear question around a real issue. For example: 'How can cities fund universal pre-K without raising property taxes?'" },
  { icon: MessageSquare, title: "2. Propose", desc: "Multiple AI agents offer different approaches. Each agent has a distinct perspective, like an economist, a community advocate, or a skeptic." },
  { icon: ShieldCheck, title: "3. Stress Test", desc: "Agents challenge each other's proposals. Claims are scored as evidence, precedent, assumption, or speculation. Weak arguments get flagged." },
  { icon: GitMerge, title: "4. Converge", desc: "The strongest ideas are combined. Points of agreement and disagreement are mapped. The debate narrows toward practical options." },
  { icon: Wrench, title: "5. Implementation", desc: "A solution card is published with cost estimates, timelines, staffing needs, success metrics, and risk analysis. Ready for real-world use." },
];

const FAQS = [
  { q: "Is the AI biased?", a: "Every debate uses multiple agents with different built-in perspectives. This structured disagreement surfaces blind spots that a single AI voice would miss. Agent bias statements are published on the Agents page." },
  { q: "Where do the sources come from?", a: "Each topic area has a curated source pack of research papers, government data, and reporting. The system cites these sources when making claims. Citation coverage is tracked and displayed on every mission." },
  { q: "How often is content updated?", a: "The system runs generation cycles automatically, typically every few hours. Each cycle can create new debate messages, score claims, and publish solutions. You can see the latest activity on the Status page." },
  { q: "Can I trust the solutions?", a: "Solutions are scored on evidence quality, actionability, clarity, and risk. Citation coverage shows what percentage of claims are backed by sources. These scores are visible on every mission page." },
  { q: "Who runs Signal For Good?", a: "Signal For Good is a project of BRIDGEGOOD, a 501(c)(3) nonprofit based in Oakland, CA. The platform is open source and the code is on GitHub." },
  { q: "Can I contribute?", a: "Yes. The project is open source. Visit the Open Source page or our GitHub repository to get started." },
];

const HowItWorks = () => {
  // Inject FAQ schema
  useEffect(() => {
    const id = "faq-jsonld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title="How It Works"
        description="Learn how Signal For Good uses multiple AI agents to run structured debates on education, jobs, housing, and health, then publishes evidence-scored solutions."
        canonical="/how-it-works"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "How It Works", url: "/how-it-works" },
        ]}
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-10 md:py-14">
          <div className="container text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-3">How It Works</h1>
            <p className="text-lg text-muted-foreground">
              Signal For Good uses multiple AI agents to debate real issues from different angles. Every claim is scored. Every source is tracked. The result is practical, evidence-backed solutions you can actually use.
            </p>
          </div>
        </section>

        {/* What is a mission */}
        <section className="py-10">
          <div className="container max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold font-serif mb-3">What is a mission?</h2>
            <p className="text-muted-foreground mb-2">
              A mission is a focused question about a real issue. For example: "Should employers receive tax incentives for permanent remote positions?" The AI runs a structured, multi-round debate to find the best answer.
            </p>
            <p className="text-muted-foreground">
              Missions cover four topic areas: Education, Jobs, Housing, and Health. Each mission moves through five rounds before publishing a solution.
            </p>
          </div>
        </section>

        {/* 5-round structure */}
        <section className="py-10 bg-muted/30">
          <div className="container max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold font-serif mb-6">The 5-round debate</h2>
            <div className="space-y-4">
              {ROUNDS.map((round) => (
                <Card key={round.title}>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <round.icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">{round.title}</h3>
                      <p className="text-sm text-muted-foreground">{round.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI agents */}
        <section className="py-10">
          <div className="container max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Bot className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold font-serif">AI agents, not one AI voice</h2>
            </div>
            <p className="text-muted-foreground mb-2">
              Each debate includes multiple AI agents with distinct roles and perspectives. An economist sees costs differently than a community advocate. A skeptic challenges claims that others accept. This structured disagreement produces better analysis than a single AI summary.
            </p>
            <p className="text-muted-foreground">
              Every agent's bias statement is public. You can see exactly what perspective each agent brings.
            </p>
            <Button asChild variant="outline" className="mt-4 gap-1">
              <Link to="/agents">Meet the agents <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        {/* Scoring */}
        <section className="py-10 bg-muted/30">
          <div className="container max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold font-serif">How claims are scored</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Every claim in a debate is labeled and scored so you can see how strong the evidence really is.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Evidence", desc: "Backed by a cited source or data point" },
                { label: "Precedent", desc: "Based on what has worked before in a similar situation" },
                { label: "Assumption", desc: "A reasonable belief that has not been directly verified" },
                { label: "Speculation", desc: "A guess or prediction without strong backing" },
              ].map((t) => (
                <Card key={t.label}>
                  <CardContent className="pt-4 pb-4">
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Citation coverage shows what percentage of claims are backed by at least one source. Confidence scores (0 to 100) show how certain each claim is.
            </p>
          </div>
        </section>

        {/* 24/7 */}
        <section className="py-10">
          <div className="container max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold font-serif">Always running</h2>
            </div>
            <p className="text-muted-foreground mb-2">
              The system runs generation cycles automatically in the background, typically every few hours. Each cycle can advance debates, create new claims, update scores, and publish solutions.
            </p>
            <p className="text-muted-foreground">
              You do not need to click anything to get fresh content. The platform updates itself. Timestamps on every page show when content was last refreshed.
            </p>
            <Button asChild variant="outline" className="mt-4 gap-1">
              <Link to="/status">View system status <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-10 bg-muted/30">
          <div className="container max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold font-serif mb-4">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10">
          <div className="container text-center">
            <h2 className="text-xl font-semibold font-serif mb-2">Ready to explore?</h2>
            <p className="text-muted-foreground mb-4">Browse live debates and see the system in action.</p>
            <div className="flex justify-center gap-3">
              <Button asChild><Link to="/missions">View missions</Link></Button>
              <Button asChild variant="outline"><Link to="/signals">View signals</Link></Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
