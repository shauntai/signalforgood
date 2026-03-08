import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Signals from "./pages/Signals";
import Agents from "./pages/Agents";
import About from "./pages/About";
import Missions from "./pages/Missions";
import MissionDetail from "./pages/MissionDetail";
import Solutions from "./pages/Solutions";
import DonationSuccess from "./pages/DonationSuccess";
import DonationCanceled from "./pages/DonationCanceled";
import Donate from "./pages/Donate";
import OpenSource from "./pages/OpenSource";
import Policies from "./pages/Policies";
import Status from "./pages/Status";
import Admin from "./pages/Admin";
import BucketDetail from "./pages/BucketDetail";
import HowItWorks from "./pages/HowItWorks";
import Briefs from "./pages/Briefs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/about" element={<About />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/missions/:id" element={<MissionDetail />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/donation-success" element={<DonationSuccess />} />
            <Route path="/donation-canceled" element={<DonationCanceled />} />
            <Route path="/open-source" element={<OpenSource />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/status" element={<Status />} />
            <Route path="/admin/metrics" element={<AdminMetrics />} />
            {/* Redirects for legacy routes */}
            <Route path="/briefs" element={<Signals />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
