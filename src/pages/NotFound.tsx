import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Home, Search, MessageSquare, BookOpen } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        noIndex
      />
      <Header />
      <main className="flex-1 container py-16 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h1 className="text-6xl font-bold font-serif mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            <Button asChild variant="default" className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/missions">
                <Search className="h-4 w-4" />
                Browse Missions
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/about">
                <BookOpen className="h-4 w-4" />
                About Us
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/signals">
                <MessageSquare className="h-4 w-4" />
                View Signals
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Looking for something specific? Try one of the links above or head back to the homepage.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
