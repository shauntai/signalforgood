import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is my donation tax deductible?",
    a: "Yes. Donations support BRIDGEGOOD, a 501(c)(3) nonprofit. Donations are tax deductible to the extent allowed by law.",
  },
  {
    q: "Will I get a receipt?",
    a: "Yes. Card donations send a receipt to your email. For Venmo, Cash App, and PayPal, use the receipt from the provider.",
  },
  {
    q: "Do you store my payment details?",
    a: "No. Card payments are handled through secure checkout. We do not store card numbers on this site.",
  },
  {
    q: "Can I donate in a different amount?",
    a: "Yes. Choose Other amount and enter any value. Minimum $5.",
  },
  {
    q: "Where does the money go?",
    a: "It funds Open Labs, public learning campaigns, student stipends, and scholarships tied to design and tech pathways.",
  },
];

export function DonateFAQ() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    const script = document.createElement("script");
    script.id = "donate-faq-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold font-serif mb-4">Quick FAQ</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-medium">
              {f.q}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{f.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
