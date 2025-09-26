import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/hooks/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect, Suspense, lazy } from "react";
import { initLanguage } from "@/lib/i18n";
import { StreakProvider } from '@/contexts/StreakContext';
import { initAuth } from "@/lib/auth";
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import AuthModal from '@/components/AuthModal';
import { preloadCriticalImages } from '@/lib/image-helpers';
import { initPerformanceMonitoring, analyzeBundleSize } from '@/lib/performance';
import { AnimatePresence } from 'framer-motion';
import RotatingBackground from './components/layout/RotatingBackground';
import RouteTransitionOrchestrator from './components/layout/RouteTransitionOrchestrator';

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
const EndlessMode = lazy(() => import("./pages/EndlessMode"));
const ScorePage = lazy(() => import("./pages/ScorePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const SurvivalSetupPage = lazy(() => import('./pages/SurvivalSetup'));
const SurvivalModePage = lazy(() => import('./pages/SurvivalMode'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const JoinUsPage = lazy(() => import('./pages/JoinUsPage'));
const TierListPage = lazy(() => import('./pages/TierListPage'));

// Unified Daily Modes Page
const DailyModesPage = lazy(() => import("./pages/DailyModesPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Animated route switcher that groups the Layout branch vs Daily page for smooth transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  const groupKey = location.pathname.startsWith('/daily') ? 'daily' : 'app';
  const dailyOrigin = (location.state as any)?.dailyOrigin;

  return (
    <AnimatePresence mode="sync" initial={false}>
      <RouteTransitionOrchestrator key={groupKey} routeKey={groupKey} originPercent={groupKey === 'daily' ? dailyOrigin : undefined}>
        <Routes location={location}>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Unified Daily Modes Page - Outside Layout to remove language selection */}
          <Route path="/daily" element={<DailyModesPage />} />

          {/* New standalone pages - Outside Layout */}
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/join-us" element={<JoinUsPage />} />
          <Route path="/tier-list" element={<TierListPage />} />

          <Route element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="/endless" element={<EndlessMode />} />
            <Route path="/survival" element={<SurvivalSetupPage />} />
            <Route path="/survival/setup" element={<SurvivalSetupPage />} />
            <Route path="/survival/game" element={<SurvivalModePage />} />

            <Route path="/score" element={<ScorePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </RouteTransitionOrchestrator>
    </AnimatePresence>
  );
};

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
            {/* Static background layer that does not animate between routes */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
              <RotatingBackground />
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <AnimatedRoutes />
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
