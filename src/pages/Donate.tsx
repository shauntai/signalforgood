import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { SignalRainArt } from "@/components/donate/SignalRainArt";
import { DonateAmountPicker } from "@/components/donate/DonateAmountPicker";
import { DonateCardForm } from "@/components/donate/DonateCardForm";
import { OtherWaysToGive } from "@/components/donate/OtherWaysToGive";
import { TransparencyPromise } from "@/components/donate/TransparencyPromise";
import { DonateFAQ } from "@/components/donate/DonateFAQ";
import { ContactBlock } from "@/components/donate/ContactBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Heart, CreditCard, ArrowDown, CheckCircle, XCircle } from "lucide-react";

const TILES = [
  { title: "BRIDGEGOOD Open Labs", body: "Hands on learning sessions that teach AI basics, how to read evidence, and how to ask better questions." },
  { title: "Inspire Oakland public learning campaigns", body: "Public storytelling that makes complex topics easy to understand. Built from debate outputs and community creativity." },
  { title: "Design student stipends", body: "Support for learners who help improve accessibility, summarize sources, and turn debates into plain language guides." },
  { title: "Apprenticeship scholarships", body: "Scholarships that open doors to training, coaching, and job pathways in design and tech." },
];

const Donate = () => {
  const [searchParams] = useSearchParams();
  const [amountCents, setAmountCents] = useState<number | null>(5000);
  const isSuccess = searchParams.get("success") === "1";
  const isCanceled = searchParams.get("canceled") === "1";

  // JSON-LD: Organization + DonateAction
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Signal For Good",
      url: "https://signalforgood.com",
      parentOrganization: {
        "@type": "Organization",
        name: "BRIDGEGOOD",
        url: "https://bridgegood.com",
      },
      potentialAction: {
        "@type": "DonateAction",
        target: "https://signalforgood.com/donate",
        name: "Donate to Signal For Good",
      },
    };
    const script = document.createElement("script");
    script.id = "donate-org-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  const scrollToOther = () => {
    document.getElementById("other-ways")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title="Donate"
        description="Support AI education and public transparency. Help keep live debates, citations, and playbooks open to everyone."
        canonical="/donate"
        ogImage="https://signalforgood.com/og-image.jpg"
      />
      <Header />

      <main className="flex-1">
        {/* Success / Canceled banners */}
        {isSuccess && (
          <div className="container pt-4">
            <Alert className="border-primary/40 bg-primary/5">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                Thank you. Your donation was received. Your support keeps AI education and transparency open to everyone.
              </AlertDescription>
            </Alert>
          </div>
        )}
        {isCanceled && (
          <div className="container pt-4">
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                No problem. Your donation was not completed. You can try again or use another method below.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Hero */}
        <section className="relative py-10 md:py-16 overflow-hidden">
          <SignalRainArt />
          <div className="container relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-tight mb-3">
              Help shape the future. Cultivate design and AI leaders.
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Signal For Good is a public lab where AI debates lead to practical playbooks with citations. Your gift helps keep AI education and transparency open to everyone.
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Button size="lg" className="gap-2" onClick={() => document.getElementById("card-section")?.scrollIntoView({ behavior: "smooth" })}>
                <CreditCard className="h-4 w-4" />
                Donate by card
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={scrollToOther}>
                <ArrowDown className="h-4 w-4" />
                Other ways to give
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Donations support BRIDGEGOOD community benefit programs. Donations are tax deductible to the extent allowed by law.
            </p>
          </div>
        </section>

        {/* What your gift funds */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold font-serif mb-2 text-center">What your gift funds</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              We turn AI debates into learning tools people can actually use. Your donation helps us keep the system open, understandable, and updated.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {TILES.map((t) => (
                <Card key={t.title}>
                  <CardContent className="pt-6">
                    <Heart className="h-5 w-5 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">{t.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Amount picker + Card form */}
        <section id="card-section" className="py-12">
          <div className="container max-w-xl">
            <DonateAmountPicker value={amountCents} onChange={setAmountCents} />
            <Separator className="my-8" />
            <DonateCardForm amountCents={amountCents} />
          </div>
        </section>

        {/* Other ways */}
        <section id="other-ways" className="py-12 bg-muted/30">
          <div className="container max-w-4xl">
            <OtherWaysToGive />
          </div>
        </section>

        {/* Transparency */}
        <section className="py-12">
          <div className="container max-w-3xl">
            <TransparencyPromise />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-3xl">
            <DonateFAQ />
          </div>
        </section>

        {/* Contact */}
        <section className="py-12">
          <div className="container max-w-xl">
            <ContactBlock />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
