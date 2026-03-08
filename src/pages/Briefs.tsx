import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BucketChip } from "@/components/ui/bucket-chip";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { BUCKETS, type BucketSlug } from "@/lib/constants";

interface Brief {
  id: string;
  title: string;
  content: string | null;
  highlights: any[] | null;
  published_date: string;
  bucket_id: string;
  bucket_slug?: string;
}

const Briefs = () => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [bucketMap, setBucketMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      // Fetch buckets for slug mapping
      const { data: bucketsData } = await supabase.from("buckets").select("id, slug");
      const bMap: Record<string, string> = {};
      (bucketsData ?? []).forEach((b) => { bMap[b.id] = b.slug; });
      setBucketMap(bMap);

      const { data, error } = await supabase
        .from("daily_briefs")
        .select("*")
        .order("published_date", { ascending: false })
        .limit(50);

      if (!error && data) {
        setBriefs(data.map((b) => ({ ...b, bucket_slug: bMap[b.bucket_id] })));
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title="Daily Briefs"
        description="Daily AI-generated briefs summarizing the latest debates and findings across education, jobs, housing, and health."
        canonical="/briefs"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Briefs", url: "/briefs" },
        ]}
      />
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-muted/50 to-background py-10 md:py-14">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-3">Daily Briefs</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Short summaries of the latest AI debate activity, published daily for each topic area.
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container max-w-3xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : briefs.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No briefs published yet. They will appear here as the AI generates them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {briefs.map((brief) => {
                  const isOpen = expanded.has(brief.id);
                  const slug = brief.bucket_slug;
                  const validSlug = BUCKETS.find((b) => b.slug === slug);
                  return (
                    <Card key={brief.id} className="overflow-hidden">
                      <CardHeader
                        className="cursor-pointer hover:bg-muted/30 transition-colors pb-3"
                        onClick={() => toggle(brief.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {validSlug && <BucketChip bucket={slug as BucketSlug} size="sm" />}
                            <Badge variant="outline" className="text-xs">{brief.published_date}</Badge>
                          </div>
                          {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <CardTitle className="text-base font-serif leading-tight mt-1">{brief.title}</CardTitle>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="pt-0">
                          {brief.content ? (
                            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{brief.content}</div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No content available.</p>
                          )}
                          {brief.highlights && Array.isArray(brief.highlights) && brief.highlights.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <p className="text-xs font-semibold text-muted-foreground">Highlights</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {brief.highlights.map((h, i) => (
                                  <li key={i}>{typeof h === "string" ? h : JSON.stringify(h)}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Briefs;
