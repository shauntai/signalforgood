import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  GitFork, 
  Lightbulb, 
  CheckCircle2, 
  ExternalLink,
  Github,
  FileCode,
  Database,
  Bot,
  Scale,
  Users
} from "lucide-react";

const whyOpenSource = [
  {
    icon: Eye,
    title: "Audit the work",
    description: "Every algorithm, prompt, and scoring rule is public. You can verify how conclusions are reached.",
  },
  {
    icon: GitFork,
    title: "Fork and adapt",
    description: "Take what works for your community. Modify it for local context. Build something better.",
  },
  {
    icon: Lightbulb,
    title: "Propose improvements",
    description: "See a flaw? Submit a fix. The best ideas come from the people closest to the problems.",
  },
];

const publicComponents = [
  { label: "Scoring algorithms", description: "How we calculate evidence, clarity, and actionability scores" },
  { label: "Agent prompts", description: "The instructions that guide each AI perspective" },
  { label: "Debate rules", description: "Turn-taking, citation requirements, and moderation logic" },
  { label: "Data schemas", description: "How missions, claims, and solutions are structured" },
  { label: "UI components", description: "The interface you're using right now" },
];

const repositories = [
  {
    name: "signal-core",
    description: "Debate engine, scoring, and agent orchestration",
    license: "MIT",
    url: "#",
  },
  {
    name: "signal-ui",
    description: "React components and design system",
    license: "MIT",
    url: "#",
  },
  {
    name: "signal-prompts",
    description: "Agent personas and system prompts",
    license: "Apache 2.0",
    url: "#",
  },
];

const OpenSource = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Open Source"
        description="Signal For Good is built in the open. Explore our scoring algorithms, agent prompts, and contribute to transparent AI debates."
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4">
              Built in the open
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Transparency is how trust gets built. Every line of code, every scoring rule, every agent prompt—it's all public.
            </p>
          </div>
        </section>

        {/* Why Open Source */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-8 text-center">
              Why we chose open source
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {whyOpenSource.map((item) => (
                <Card key={item.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What's Public */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-8 text-center">
              What's public
            </h2>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {publicComponents.map((item) => (
                      <li key={item.label} className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <span className="font-medium">{item.label}</span>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Repositories */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-8 text-center">
              Repositories
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {repositories.map((repo) => (
                <Card key={repo.name}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Github className="h-5 w-5" />
                      <Badge variant="secondary">{repo.license}</Badge>
                    </div>
                    <CardTitle className="text-lg font-mono">{repo.name}</CardTitle>
                    <CardDescription>{repo.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer">
                        View repository
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contributing */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold font-serif mb-4">
                Contributing
              </h2>
              <p className="text-muted-foreground mb-6">
                We welcome contributions of all kinds: bug fixes, feature suggestions, documentation improvements, and new perspectives on how debates should work.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="gap-2">
                  <Github className="h-4 w-4" />
                  Start contributing
                </Button>
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Join the community
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* License */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold font-serif mb-4">License</h2>
              <p className="text-muted-foreground">
                Core components are MIT licensed. Agent prompts and specialized tooling use Apache 2.0. 
                Both licenses allow commercial use, modification, and distribution.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OpenSource;
