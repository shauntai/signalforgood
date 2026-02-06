import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const DonationCanceled = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Donation Canceled"
        description="Your donation was canceled."
        noIndex
      />
      <Header />
      <main className="flex-1 container py-16 flex items-center justify-center">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold font-serif mb-4">Donation Canceled</h1>
            <p className="text-muted-foreground mb-6">
              No problem! Your donation was not processed. If you'd like to support Signal For Good another time, we'd be grateful.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span>Every contribution helps us build trust through transparency</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link to="/about" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to About
                </Link>
              </Button>
              <Button asChild>
                <Link to="/">Explore Debates</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DonationCanceled;
