import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/hooks/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { initLanguage } from "@/lib/i18n";
import { StreakProvider } from '@/contexts/StreakContext';
import { initAuth } from "@/lib/auth";
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import AuthModal from '@/components/AuthModal';

// Pages
import Index from "./pages/Index";
import ClassicMode from "./pages/ClassicMode"; 
import EndlessMode from "./pages/EndlessMode";
import ScorePage from "./pages/ScorePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import StarPowerMode from "./pages/StarPowerMode";
import GadgetMode from "./pages/GadgetMode";
import AudioMode from "./pages/AudioMode";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import SurvivalSetupPage from './pages/SurvivalSetup';
import SurvivalModePage from './pages/SurvivalMode';

// Daily Mode Pages
import DailyClassicMode from "./pages/DailyClassicMode";
import DailyGadgetMode from "./pages/DailyGadgetMode";
import DailyStarPowerMode from "./pages/DailyStarPowerMode";
import DailyAudioMode from "./pages/DailyAudioMode";

// Layout
import Layout from "./components/layout/Layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize language on app load
    initLanguage();
    // Initialize auth state
    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StreakProvider>
      <LanguageProvider>
          <AuthModalProvider>
            <ToastProvider>
        <TooltipProvider>
          <Sonner />
              <AuthModal />
          <BrowserRouter>
              <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  {/* Daily Mode Routes - Outside Layout to remove language selection */}
                  <Route path="/daily/classic" element={<DailyClassicMode />} />
                  <Route path="/daily/gadget" element={<DailyGadgetMode />} />
                  <Route path="/daily/starpower" element={<DailyStarPowerMode />} />
                  <Route path="/daily/audio" element={<DailyAudioMode />} />
                  
                  <Route element={<Layout />}>
                    <Route index element={<Index />} />
                <Route path="/classic" element={<ClassicMode />} />
                <Route path="/starpower" element={<StarPowerMode />} />
                <Route path="/gadget" element={<GadgetMode />} />
                <Route path="/audio" element={<AudioMode />} />
                <Route path="/endless" element={<EndlessMode />} />
                <Route path="/survival" element={<SurvivalModePage />} />
                <Route path="/survival/setup" element={<SurvivalSetupPage />} />
                
                <Route path="/score" element={<ScorePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
                  </Route>
              </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
            </ToastProvider>
          </AuthModalProvider>
      </LanguageProvider>
      </StreakProvider>
    </QueryClientProvider>
  );
};

export default App;
