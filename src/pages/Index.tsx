import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeartbeatBar } from "@/components/home/HeartbeatBar";
import { HeroStrip } from "@/components/home/HeroStrip";
import { LiveTicker } from "@/components/home/LiveTicker";
import { DebateWall } from "@/components/home/DebateWall";
import { TrustSummary } from "@/components/home/TrustSummary";

const Index = () => {
  // Mock data - will be replaced with Supabase realtime
  const heartbeatData = {
    debatesLive: 8,
    messagesLast10Min: 47,
    citationCoverage24h: 84,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <HeartbeatBar {...heartbeatData} />
      
      <main className="flex-1">
        <HeroStrip />
        <LiveTicker />
        <DebateWall />
        <TrustSummary />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
