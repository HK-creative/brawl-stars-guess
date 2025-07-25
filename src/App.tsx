import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/hooks/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect, Suspense, lazy } from "react";
import { initLanguage } from "@/lib/i18n";
import { StreakProvider } from '@/contexts/StreakContext';
import { initAuth } from "@/lib/auth";
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import AuthModal from '@/components/AuthModal';
import { preloadCriticalImages } from '@/lib/image-helpers';
import { initPerformanceMonitoring, analyzeBundleSize } from '@/lib/performance';

// Layout (not lazy loaded as it's needed immediately)
import Layout from "./components/layout/Layout";

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin h-12 w-12 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
  </div>
);

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const ClassicMode = lazy(() => import("./pages/ClassicMode"));
const EndlessMode = lazy(() => import("./pages/EndlessMode"));
const ScorePage = lazy(() => import("./pages/ScorePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const StarPowerMode = lazy(() => import("./pages/StarPowerMode"));
const GadgetMode = lazy(() => import("./pages/GadgetMode"));
const AudioMode = lazy(() => import("./pages/AudioMode"));
const PixelsMode = lazy(() => import("./pages/PixelsMode"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const SurvivalSetupPage = lazy(() => import('./pages/SurvivalSetup'));
const SurvivalModePage = lazy(() => import('./pages/SurvivalMode'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const JoinUsPage = lazy(() => import('./pages/JoinUsPage'));
const TierListPage = lazy(() => import('./pages/TierListPage'));

// Daily Mode Pages
const DailyClassicMode = lazy(() => import("./pages/DailyClassicMode"));
const DailyGadgetMode = lazy(() => import("./pages/DailyGadgetMode"));
const DailyStarPowerMode = lazy(() => import("./pages/DailyStarPowerMode"));
const DailyAudioMode = lazy(() => import("./pages/DailyAudioMode"));
const DailyPixelsMode = lazy(() => import("./pages/DailyPixelsMode"));

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
    // Preload critical images for better performance
    preloadCriticalImages();
    // Initialize performance monitoring
    initPerformanceMonitoring();
    // Analyze bundle size in development
    analyzeBundleSize();
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
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  {/* Daily Mode Routes - Outside Layout to remove language selection */}
                  <Route path="/daily/classic" element={<DailyClassicMode />} />
                  <Route path="/daily/gadget" element={<DailyGadgetMode />} />
                  <Route path="/daily/starpower" element={<DailyStarPowerMode />} />
                  <Route path="/daily/audio" element={<DailyAudioMode />} />
                  <Route path="/daily/pixels" element={<DailyPixelsMode />} />
                  
                  {/* New standalone pages - Outside Layout */}
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/join-us" element={<JoinUsPage />} />
                  <Route path="/tier-list" element={<TierListPage />} />
                  
                  <Route element={<Layout />}>
                    <Route index element={<Index />} />
                <Route path="/classic" element={<ClassicMode />} />
                <Route path="/starpower" element={<StarPowerMode />} />
                <Route path="/gadget" element={<GadgetMode />} />
                <Route path="/audio" element={<AudioMode />} />
                <Route path="/pixels" element={<PixelsMode />} />
                <Route path="/endless" element={<EndlessMode />} />
                <Route path="/survival" element={<SurvivalModePage />} />
                <Route path="/survival/setup" element={<SurvivalSetupPage />} />
                <Route path="/survival/game" element={<SurvivalModePage />} />
                
                <Route path="/score" element={<ScorePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
                  </Route>
              </Routes>
            </Suspense>
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
