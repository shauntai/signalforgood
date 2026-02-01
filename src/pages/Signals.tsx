import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Signals = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold font-serif mb-6">Signals</h1>
        <p className="text-muted-foreground">Trends and intelligence dashboard coming soon.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Signals;
