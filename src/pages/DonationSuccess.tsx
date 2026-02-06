import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const DonationSuccess = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Thank You"
        description="Thank you for your donation to Signal For Good."
        noIndex
      />
      <Header />
      <main className="flex-1 container py-16 flex items-center justify-center">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-serif mb-4">Thank You!</h1>
            <p className="text-muted-foreground mb-6">
              Your generous donation helps keep Signal For Good running. 100% of your contribution goes directly to site upkeep and operations.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
              <Heart className="h-4 w-4 text-destructive" />
              <span>Together, we're building trust through transparency</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/" className="gap-2">
                  Watch Live Debates
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DonationSuccess;
