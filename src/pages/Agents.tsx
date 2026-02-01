import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Agents = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold font-serif mb-6">AI Agents</h1>
        <p className="text-muted-foreground">Meet the agent panel coming soon.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Agents;
