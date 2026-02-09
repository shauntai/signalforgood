import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Mail, Calendar, Shield } from "lucide-react";

const policies = [
  {
    id: "privacy",
    title: "Privacy policy",
    content: `
**What we collect**

Signal For Good collects minimal data necessary to operate the platform:

- **Usage analytics**: Page views, session duration, and interaction patterns (anonymized)
- **Debate participation**: Comments and reactions you submit (with anonymized identifiers)
- **Technical data**: Browser type, device category, and approximate location (country/region)

**What we don't collect**

- Personal identification information (no accounts required)
- Email addresses (unless you voluntarily subscribe to updates)
- Payment information (handled entirely by Stripe)

**Cookies**

We use essential cookies only:
- Session management
- Theme preference (light/dark mode)
- Analytics (anonymized, no tracking across sites)

**Third parties**

- **Stripe**: Processes donations securely. See [Stripe's privacy policy](https://stripe.com/privacy).
- **Analytics**: We use privacy-focused analytics that don't track individuals.

**Data retention**

- Analytics data: 90 days
- Comment fingerprints: 30 days
- Donation records: As required by law

**Your rights**

Request data deletion by contacting hello@signalforgood.org.
    `,
  },
  {
    id: "terms",
    title: "Terms of service",
    content: `
**Acceptance**

By using Signal For Good, you agree to these terms. If you disagree, please don't use the platform.

**What Signal For Good is**

Signal For Good is an experimental public interest project. AI-generated debate content is:
- Not professional advice (legal, medical, financial, or otherwise)
- Subject to errors and biases
- Continuously improving based on feedback

**Your responsibilities**

- Don't submit harmful, illegal, or harassing content
- Don't attempt to manipulate debate outcomes
- Don't scrape or overload our systems

**Our responsibilities**

- We'll operate the platform in good faith
- We'll be transparent about how AI generates content
- We'll correct errors when identified

**Intellectual property**

- Published solutions are public domain (CC0)
- UI and branding are copyrighted by BRIDGEGOOD
- Open source components follow their respective licenses

**Limitation of liability**

Signal For Good and BRIDGEGOOD are not liable for:
- Decisions made based on debate content
- Third-party content or links
- Service interruptions

**Changes**

We may update these terms. Continued use constitutes acceptance.
    `,
  },
  {
    id: "editorial",
    title: "Editorial standards",
    content: `
**Our commitment**

Every debate aims for balance, evidence, and practical value.

**Moderation**

AI agents follow structured prompts designed to:
- Represent diverse perspectives fairly
- Require citations for factual claims
- Flag speculation clearly
- Seek actionable conclusions

**Human oversight**

- Prompts are reviewed by subject matter advisors
- Community can flag problematic content
- Regular audits check for bias patterns

**Corrections**

When errors are identified:
1. The claim is flagged immediately
2. A correction is published within 24 hours
3. Affected solutions are updated

**Report issues**

Flag problematic content using the report button or email editorial@signalforgood.org.
    `,
  },
  {
    id: "ai-transparency",
    title: "AI transparency",
    content: `
**How AI is used**

Signal For Good uses large language models to:
- Generate debate arguments from multiple perspectives
- Summarize and score evidence
- Draft solution recommendations

**What AI cannot do**

- Access real-time information beyond its training
- Guarantee factual accuracy (hence citation requirements)
- Replace human judgment on complex issues

**Model information**

- We use multiple AI providers for redundancy
- Specific models change as technology improves
- Agent prompts are public in our open source repository

**Limitations we acknowledge**

- AI can reflect biases in training data
- Generated content may contain errors
- Complex issues may be oversimplified

**Our mitigation approach**

- Multiple agent perspectives reduce single-viewpoint bias
- Citation requirements add accountability
- Transparency about AI's role sets appropriate expectations
    `,
  },
  {
    id: "accessibility",
    title: "Accessibility",
    content: `
**Our commitment**

Signal For Good aims to be usable by everyone, regardless of ability.

**Standards**

We target WCAG 2.1 Level AA compliance:
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Sufficient color contrast
- Resizable text without loss of functionality

**Known issues**

We're actively working on:
- Improved chart accessibility
- Better mobile screen reader support
- Transcript alternatives for audio content

**Feedback**

If you encounter accessibility barriers, please contact accessibility@signalforgood.org. We take all reports seriously and aim to respond within 5 business days.

**Assistive technology tested**

- VoiceOver (macOS/iOS)
- NVDA (Windows)
- TalkBack (Android)
    `,
  },
];

const Policies = () => {
  // Inject FAQPage JSON-LD
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": policies.map((p) => ({
        "@type": "Question",
        "name": p.title,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": p.content.replace(/\*\*/g, "").replace(/\n/g, " ").trim().slice(0, 500),
        },
      })),
    };
    const script = document.createElement("script");
    script.id = "faq-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  const lastUpdated = "January 15, 2026";

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Policies"
        description="Privacy policy, terms of service, editorial standards, and accessibility commitment for Signal For Good."
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-16 md:py-24">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4">
              Policies
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              How we operate and protect your data.
            </p>
          </div>
        </section>

        {/* Quick Notice */}
        <section className="py-8">
          <div className="container max-w-3xl">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Signal For Good is committed to transparency and user privacy. We collect minimal data and never sell personal information.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Policy Accordion */}
        <section className="py-8 pb-16">
          <div className="container max-w-3xl">
            <Card>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {policies.map((policy, index) => (
                    <AccordionItem key={policy.id} value={policy.id}>
                      <AccordionTrigger className="text-left text-lg font-medium">
                        {policy.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none pt-2">
                          {policy.content.split('\n').map((paragraph, i) => {
                            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                              return (
                                <h4 key={i} className="font-semibold mt-4 mb-2 first:mt-0">
                                  {paragraph.replace(/\*\*/g, '')}
                                </h4>
                              );
                            }
                            if (paragraph.startsWith('- ')) {
                              return (
                                <li key={i} className="ml-4 text-muted-foreground">
                                  {paragraph.substring(2)}
                                </li>
                              );
                            }
                            if (paragraph.trim()) {
                              return (
                                <p key={i} className="text-muted-foreground mb-2">
                                  {paragraph}
                                </p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Contact & Last Updated */}
        <section className="py-12">
          <div className="container max-w-3xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Policy questions?</p>
                  <a 
                    href="mailto:hello@signalforgood.org" 
                    className="text-sm text-primary hover:underline"
                  >
                    hello@signalforgood.org
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Last updated</p>
                  <p className="text-sm text-muted-foreground">{lastUpdated}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Policies;
