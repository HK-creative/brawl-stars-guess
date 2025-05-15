
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { initLanguage } from "@/lib/i18n";

// Pages
import Index from "./pages/Index";
import ClassicMode from "./pages/ClassicMode"; 
import EndlessMode from "./pages/EndlessMode";
import ScorePage from "./pages/ScorePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

// Layout
import Layout from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize language on app load
    initLanguage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/classic" element={<ClassicMode />} />
                <Route path="/endless" element={<EndlessMode />} />
                <Route path="/score" element={<ScorePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
