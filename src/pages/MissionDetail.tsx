import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const MissionDetail = () => {
  const { id } = useParams();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold font-serif mb-6">Mission Hub</h1>
        <p className="text-muted-foreground">Mission {id} - Watch modes and lenses coming soon.</p>
      </main>
      <Footer />
    </div>
  );
};

export default MissionDetail;
