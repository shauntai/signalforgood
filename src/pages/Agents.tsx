import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Scale, 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  Wrench, 
  BookOpen, 
  Users,
  ArrowRight,
  Github,
  CheckCircle2
} from "lucide-react";

const agents = [
  {
    id: "economist",
    name: "Economist",
    role: "Budget reality",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-200 dark:border-blue-800",
    description: "Evaluates fiscal feasibility, cost-benefit analysis, and economic trade-offs.",
    prompt: "Analyze proposals through the lens of economic sustainability. Consider direct costs, opportunity costs, and long-term fiscal implications. Push for concrete budget numbers.",
  },
  {
    id: "advocate",
    name: "Labor Advocate",
    role: "Fairness and access",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-200 dark:border-green-800",
    description: "Champions worker rights, equitable access, and underrepresented perspectives.",
    prompt: "Ensure proposals don't disproportionately burden workers or marginalized communities. Highlight access barriers. Ask who benefits and who bears the cost.",
  },
  {
    id: "analyst",
    name: "Policy Analyst",
    role: "Data and measurement",
    icon: BarChart3,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-200 dark:border-purple-800",
    description: "Demands evidence, cites research, and defines success metrics.",
    prompt: "Every claim needs evidence. Request citations for statistics. Propose measurable success criteria. Flag when evidence is weak or missing.",
  },
  {
    id: "skeptic",
    name: "Skeptic",
    role: "Risks and failure modes",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-200 dark:border-amber-800",
    description: "Identifies what could go wrong, unintended consequences, and implementation risks.",
    prompt: "Challenge assumptions. Identify failure modes. Ask 'what if this doesn't work?' Surface unintended consequences before they happen.",
  },
  {
    id: "practitioner",
    name: "Practitioner",
    role: "Real-world implementation",
    icon: Wrench,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-200 dark:border-orange-800",
    description: "Brings operational experience and practical constraints into the discussion.",
    prompt: "Focus on how things actually work on the ground. Identify implementation barriers. Share what similar efforts have taught us about execution.",
  },
  {
    id: "historian",
    name: "Historian",
    role: "Lessons from the past",
    icon: BookOpen,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-200 dark:border-rose-800",
    description: "Provides historical context and precedent for current debates.",
    prompt: "What has been tried before? What worked, what failed, and why? Connect current proposals to historical patterns and outcomes.",
  },
  {
    id: "facilitator",
    name: "Facilitator",
    role: "Landing decisions",
    icon: Scale,
    color: "text-slate-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-200 dark:border-slate-800",
    description: "Synthesizes discussion, finds common ground, and drives toward actionable conclusions.",
    prompt: "Summarize areas of agreement. Identify remaining disagreements. Push toward specific, actionable recommendations that address key concerns.",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Question framed",
    description: "A specific, actionable question is posed for debate.",
  },
  {
    step: 2,
    title: "Perspectives engage",
    description: "Each agent contributes their unique viewpoint with citations.",
  },
  {
    step: 3,
    title: "Claims scored",
    description: "Evidence quality, clarity, and actionability are measured.",
  },
  {
    step: 4,
    title: "Solution emerges",
    description: "The Facilitator synthesizes a practical recommendation.",
  },
];

const Agents = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Agents"
        description="Meet the AI agent panel. Seven balanced perspectives work together to produce practical, evidence-based policy solutions."
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4">
              Meet the agent panel
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Balanced perspectives working together for practical solutions.
            </p>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-12 border-b">
          <div className="container max-w-3xl text-center">
            <h2 className="text-2xl font-bold font-serif mb-4">Why a balanced team?</h2>
            <p className="text-muted-foreground">
              Single perspectives create blind spots. Our panel includes an economist who pushes for budget reality, 
              an advocate who centers equity, a skeptic who surfaces risks, and a historian who recalls what's been tried. 
              Together, they stress-test ideas from every angle before solutions get published.
            </p>
          </div>
        </section>

        {/* Agent Grid */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-bold font-serif mb-8 text-center">The panel</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className={`${agent.borderColor} border-l-4`}>
                  <CardHeader className="pb-3">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${agent.bgColor} mb-3`}>
                      <agent.icon className={`h-5 w-5 ${agent.color}`} />
                    </div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {agent.role}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {agent.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How Agents Work */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold font-serif mb-8 text-center">How debates work</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {processSteps.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                      {step.step}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index < processSteps.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-6 -right-3 h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agent Prompts (Expandable) */}
        <section className="py-16">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold font-serif mb-8 text-center">Agent instructions</h2>
            <Card>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible>
                  {agents.map((agent) => (
                    <AccordionItem key={agent.id} value={agent.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <agent.icon className={`h-4 w-4 ${agent.color}`} />
                          <span>{agent.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                          {agent.prompt}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Transparency Note */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-2xl text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold font-serif mb-4">Full transparency</h2>
            <p className="text-muted-foreground mb-6">
              Every agent prompt is public. You can audit exactly what instructions guide each perspective. 
              If you see a bias or blind spot, propose a fix.
            </p>
            <Button variant="outline" className="gap-2">
              <Github className="h-4 w-4" />
              View prompts on GitHub
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Agents;
