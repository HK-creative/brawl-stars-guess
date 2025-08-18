import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PrimaryButton from '@/components/ui/primary-button';
import { Timer } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSurvivalStore } from '@/stores/useSurvivalStore';
import { resetModeSelectionState } from '@/lib/survival-logic';
import ClassicMode from './ClassicMode';
import GadgetMode from './GadgetMode';
import StarPowerMode from './StarPowerMode';
import AudioMode from './AudioMode';
import PixelsMode from './PixelsMode';
import { cn } from '@/lib/utils';
// Victory/Loss popups removed - using inline victory flow
import SurvivalLossPopup from '@/components/SurvivalLossPopup';
import SurvivalSetupPopup from '@/components/SurvivalSetupPopup';
import { t } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import ModeTitle from '@/components/ModeTitle';
import { SlidingNumber } from '@/components/ui/sliding-number';
import type { GameModeName } from '@/types/gameModes';

// Import brawler data
import { brawlers } from '@/data/brawlers';

import RotatingBackground from '@/components/layout/RotatingBackground';
import DailyModeTransitionOrchestrator from '@/components/layout/DailyModeTransitionOrchestrator';

const SurvivalModePage: React.FC = () => {
  const { motionOK, transition, spring } = useMotionPrefs();
  // Inject custom award styles into the document head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes award-glow {
        0%, 100% { 
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 179, 0, 0.4);
          transform: scale(1);
        }
        50% { 
          text-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 179, 0, 0.6);
          transform: scale(1.02);
        }
      }
      .animate-award-glow { 
        animation: award-glow 2s infinite alternate; 
        will-change: transform, text-shadow;
      }
      @keyframes award-bar {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }
      .animate-award-bar { animation: award-bar 3s infinite; }
      @keyframes award-card {
        0% { box-shadow: 0 8px 40px 0 rgba(255,214,0,0.10); }
        50% { box-shadow: 0 16px 64px 0 rgba(255,214,0,0.18); }
        100% { box-shadow: 0 8px 40px 0 rgba(255,214,0,0.10); }
      }
      .animate-award-card { animation: award-card 2.5s infinite alternate; }
      @keyframes spin-slow { 100% { transform: rotate(360deg); } }
      .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      @keyframes ping-slow { 75%, 100% { transform: scale(1.2); opacity: 0; } }
      .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0,0,0.2,1) infinite; }
      @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
      .animate-bounce-slow { animation: bounce-slow 2s infinite; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Guard to avoid duplicate first-round start (e.g., React StrictMode double effects)
  const initialRoundStartedRef = useRef(false);
  // Re-entrancy lock to ensure round end is handled only once per round
  const roundEndLockRef = useRef(false);
  const [brawlerData, setBrawlerData] = useState(() => {
    // Ensure all brawlers have proper ID and required fields for challenge loading
    return brawlers.map((b, index) => ({
      ...b,
      id: index + 1, // Ensure each brawler has an id field
      name: b.name || `Unknown Brawler ${index + 1}` // Ensure name is present
    }));
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentModeName, setCurrentModeName] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState(false);
  
  // Add state for tracking score and showing popups
  const [totalScore, setTotalScore] = useState(0);
  const [currentRoundPoints, setCurrentRoundPoints] = useState(0);
  // Victory popup removed - using inline victory flow
  const [showLossPopup, setShowLossPopup] = useState(false);
  const [showSetupPopup, setShowSetupPopup] = useState(true);
  
  // New states for inline victory flow
  const [showInlineVictory, setShowInlineVictory] = useState(false);
  const [victoryCountdown, setVictoryCountdown] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(false); // Start with setup popup
  const [lastCorrectBrawler, setLastCorrectBrawler] = useState("");
  const [correctBrawlerForLoss, setCorrectBrawlerForLoss] = useState("");
  
  // Add state to store round completion data for victory popup
  const [lastRoundGuessesUsed, setLastRoundGuessesUsed] = useState(0);
  const [lastRoundTimeLeft, setLastRoundTimeLeft] = useState(0);
  
  // Add local timer state to fix closure issues
  const [currentTimerValue, setCurrentTimerValue] = useState<number | null>(null);
  
  // Add a key to force remount of game mode components
  const [modeKey, setModeKey] = useState<string>("initial");

  // Header scroll state for dynamic opacity/blur
  const [scrollY, setScrollY] = useState(0);
  // Minimal end-of-time flash flag
  const [timeEndedFlash, setTimeEndedFlash] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || window.pageYOffset || 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Get store state and actions
  const {
    settings,
    currentRound,
    gameStatus,
    activeRoundState,
    initializeGame,
    startNextRound,
    decrementGuess,
    setTimerLeft,
    gameOver
  } = useSurvivalStore();

  // Calculate points for a successful round
  const calculateRoundPoints = useCallback((guessesUsed: number, timeLeft: number) => {
    // Base points
    let points = 100;
    
    // Bonus for correct guessing (starts at 55, reduces by 5 for each guess including the correct one)
    // If guessed correctly on first try: 55 - (1 * 5) = 50 bonus
    // If guessed wrong 3 times then correct: 55 - (4 * 5) = 35 bonus
    const guessBonus = Math.max(0, 55 - (guessesUsed * 5));
    points += guessBonus;
    
    // Bonus for time left (starts at 30, reduces by 1 for every 5 seconds elapsed)
    // Timer starts at 150 seconds, so elapsed time = 150 - timeLeft
    const elapsedTime = 150 - timeLeft;
    const timeBonus = Math.max(0, 30 - Math.floor(elapsedTime / 5));
    points += timeBonus;
    
    return points;
  }, []);

  // Handler for when a round ends (from game modes)
  const handleRoundEnd = (result: { success: boolean; brawlerName?: string }) => {
    console.log('handleRoundEnd invoked', result, { isTransitioning, showInlineVictory, lock: roundEndLockRef.current, round: currentRound });
    // Re-entrancy guard to prevent duplicate handling per round
    if (roundEndLockRef.current) {
      console.warn('handleRoundEnd ignored due to active lock');
      return;
    }
    // Lock immediately; released after next round starts or on retry
    roundEndLockRef.current = true;
    const { success: isSuccess, brawlerName } = result;
    // Clear any timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isSuccess) {
      // Game over - player failed the round
      gameOver();
      
      // Find the correct brawler for the loss popup
      if (activeRoundState?.currentBrawlerId) {
        const brawler = brawlerData.find(b => b.id === activeRoundState.currentBrawlerId);
        if (brawler) {
          setCorrectBrawlerForLoss(brawler.name);
        }
      }
      
      // Show loss popup
      setShowLossPopup(true);
    } else {
      // Guard against double success handling
      if (isTransitioning || showInlineVictory) {
        return;
      }
      // Success - player completed the round
      // Calculate points earned for this round
      const guessesUsed = activeRoundState ? (activeRoundState.guessesQuota - activeRoundState.guessesLeft) : 0;
      const timeLeft = currentTimerValue ?? activeRoundState?.timerLeft ?? 0;
      const points = calculateRoundPoints(guessesUsed, timeLeft);
      
      // Update score
      setCurrentRoundPoints(points);
      setTotalScore(prev => prev + points);
      
      // Store round data for inline victory display
      setLastRoundGuessesUsed(guessesUsed);
      setLastRoundTimeLeft(timeLeft);
      
      // If a specific brawler name was provided in the callback, use that
      if (brawlerName) {
        setLastCorrectBrawler(brawlerName);
      } else if (activeRoundState?.currentBrawlerId) {
        const brawler = brawlerData.find(b => b.id === activeRoundState.currentBrawlerId);
        if (brawler) {
          setLastCorrectBrawler(brawler.name);
        }
      }
      
      // Show inline victory instead of popup
      setIsTransitioning(true);
      setShowInlineVictory(true);
      setVictoryCountdown(5);
      
      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setVictoryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Transition to next round
            setTimeout(() => {
              setShowInlineVictory(false);
              setModeKey(`survival-round-${Date.now()}`);
              console.log('Victory transition complete. Starting next round...');
              startNextRound();
              // Release the round end lock for the new round
              roundEndLockRef.current = false;
              setIsTransitioning(false);
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return;
      
      // Fallback if we couldn't find the brawler
      toast({
        title: "Round Complete!",
        description: "Good job! Moving to next round.",
      });
      
      // Force a reset before starting next round
      setModeKey(`survival-round-${Date.now()}`);
      setTimeout(() => startNextRound(), 1000);
    }
  };

  // Effect to start the very first round once after setup
  useEffect(() => {
    // Only start the first round when the game is playing, setup popup is closed, and no rounds have started yet
    if (
      gameStatus === 'playing' &&
      !showSetupPopup &&
      currentRound === 0 &&
      !activeRoundState?.isRoundActive &&
      !initialRoundStartedRef.current
    ) {
      console.log('Initializing first Survival round...');
      initialRoundStartedRef.current = true;
      resetModeSelectionState();
      setIsLoading(true);
      // Ensure round end lock is released before starting the very first round
      roundEndLockRef.current = false;
      try {
        startNextRound();
        setChallengeError(false);
      } catch (error) {
        console.error('Failed to start first round:', error);
        setChallengeError(true);
        // Allow retry if start failed
        initialRoundStartedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    }
  }, [settings, gameStatus, currentRound, activeRoundState, startNextRound, showSetupPopup]);

  // Update UI when mode changes
  useEffect(() => {
    if (activeRoundState?.currentMode && activeRoundState.currentMode !== currentModeName) {
      setCurrentModeName(activeRoundState.currentMode);
    }
  }, [activeRoundState?.currentMode, currentModeName]);

  // Timer logic for countdown if enabled
  useEffect(() => {
    // Clear any existing timers when component unmounts or settings change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Setup timer when round starts if timer is enabled
  useEffect(() => {
    if (!activeRoundState || !settings?.timer || gameStatus !== 'playing') {
      return;
    }

    // Start the timer
    if (activeRoundState.isRoundActive && activeRoundState.timerLeft !== undefined) {
      // Initialize local timer state and reset any previous end flash
      setCurrentTimerValue(activeRoundState.timerLeft);
      setTimeEndedFlash(false);
      
      // Clear any existing interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Set up new interval
      timerRef.current = setInterval(() => {
        setCurrentTimerValue(prevTime => {
          if (typeof prevTime === 'number' && prevTime > 0) {
            const newTime = prevTime - 1;
            // Update the store as well
            setTimerLeft(newTime);
            // If this tick reaches zero, end immediately and flash
            if (newTime === 0) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              // Trigger subtle end-of-time flash
              setTimeEndedFlash(true);
              setTimeout(() => setTimeEndedFlash(false), 220);
              
              gameOver();
              // Find the correct brawler for the loss popup
              if (activeRoundState?.currentBrawlerId) {
                const brawler = brawlerData.find(b => b.id === activeRoundState.currentBrawlerId);
                if (brawler) {
                  setCorrectBrawlerForLoss(brawler.name);
                }
              }
              // Show loss popup
              setShowLossPopup(true);
              return 0;
            }
            return newTime;
          } else {
            // Already zero or invalid; ensure cleanup
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeRoundState?.isRoundActive, activeRoundState?.timerLeft, settings, gameStatus, gameOver, brawlerData, setTimerLeft]);

  // Render the component
  const uiTimeLeft = currentTimerValue ?? activeRoundState?.timerLeft;
  return (
    <div className="survival-mode-container survival-classic-theme relative">
      <RotatingBackground />
      {/* Sticky Header with Timer only (home button reused from Layout, visually within header) */}
      <div className="sticky top-0 z-40">
        <motion.div
          className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen border-b"
          initial={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)', borderColor: 'rgba(255,255,255,0)' }}
          animate={{
            backgroundColor: `rgba(0,0,0, ${Math.min(1, (scrollY / 120)) * 0.3})`,
            backdropFilter: `blur(${Math.round(Math.min(1, (scrollY / 120)) * 8)}px)`,
            borderColor: `rgba(255,255,255, ${Math.min(1, (scrollY / 120)) * 0.10})`
          }}
          transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
        >
          <div className="w-full max-w-4xl mx-auto px-4 h-16 relative">
          {/* Subtle red flash when time ends */}
          <AnimatePresence>
            {timeEndedFlash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 bg-red-500/20 pointer-events-none"
              />
            )}
          </AnimatePresence>
          {/* Top progress bar for remaining time */}
          {settings?.timer && typeof uiTimeLeft === 'number' && (
            <div
              className={cn(
                'absolute top-0 left-0 h-0.5 rounded-r transition-[width] duration-200 ease-linear',
                uiTimeLeft <= 10 ? 'bg-red-400' : uiTimeLeft <= 30 ? 'bg-amber-400' : 'bg-emerald-400'
              )}
              style={{
                width: `${Math.max(0, Math.min(100, (uiTimeLeft / settings.timer) * 100))}%`
              }}
            />
          )}
          {/* Home button - left inside header (same design as Layout) */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              aria-label={t('button.go.home')}
            >
              <img src="/bs_home_icon.png" alt={t('button.go.home')} className="w-11 h-11" />
            </button>
          </div>
          {/* Timer - top right inside header */}
          {settings?.timer && gameStatus === 'playing' && !showSetupPopup && !showLossPopup && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 select-none">
              <motion.div
                initial={motionOK ? { opacity: 0, y: -6 } : { opacity: 1 }}
                animate={motionOK ? { opacity: 1, y: 0, transition } : { opacity: 1 }}
                className={cn(
                  'relative overflow-hidden rounded-full border border-white/10 backdrop-blur-md shadow-xl',
                  'bg-black/40 text-white'
                )}
                aria-label={t('timer')}
              >
                {typeof (currentTimerValue ?? activeRoundState?.timerLeft) === 'number' && (
                  <div
                    className="absolute inset-0 -z-0"
                    style={{
                      background:
                        `linear-gradient(90deg, rgba(34,197,94,0.25) 0%, rgba(34,197,94,0.25) ${Math.max(0, Math.min(100, (((currentTimerValue ?? (activeRoundState?.timerLeft as number)) / settings.timer) * 100)))}%, transparent ${Math.max(0, Math.min(100, (((currentTimerValue ?? (activeRoundState?.timerLeft as number)) / settings.timer) * 100)))}%)`
                    }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2 px-3 py-2">
                  <Timer
                    className={cn(
                      'h-5 w-5',
                      motionOK &&
                        typeof (currentTimerValue ?? activeRoundState?.timerLeft) === 'number' &&
                        ((currentTimerValue ?? (activeRoundState?.timerLeft as number)) <= 30) && 'animate-bounce'
                    )}
                  />
                  <motion.span
                    className={cn(
                      'font-mono tabular-nums text-base',
                      typeof (currentTimerValue ?? activeRoundState?.timerLeft) === 'number' &&
                      ((currentTimerValue ?? (activeRoundState?.timerLeft as number)) <= 30) ? 'text-red-300' : 'text-white'
                    )}
                    layout
                    transition={spring as any}
                  >
                    {typeof (currentTimerValue ?? activeRoundState?.timerLeft) === 'number'
                      ? (
                        <>
                          {Math.floor(((currentTimerValue ?? (activeRoundState?.timerLeft as number)) as number) / 60)}:
                          {String(((currentTimerValue ?? (activeRoundState?.timerLeft as number)) as number) % 60).padStart(2, '0')}
                        </>
                      )
                      : '--:--'}
                  </motion.span>
                </div>
              </motion.div>
            </div>
          )}
          </div>
        </motion.div>
      </div>

      {/* Round title below the header (non-sticky) */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-2 pb-2 mt-16 md:mt-20 relative z-10">
        <div className="text-center">
          <ModeTitle title={`${t('survival.round')} ${Math.max(1, currentRound)}`} />
        </div>
      </div>
      {/* Simple, centered Points line below the round headline */}
      {!isLoading && !showSetupPopup && !challengeError && (
        <div className="w-full max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center mt-1" aria-live="polite">
            <span className="text-sm text-white/70">Points: </span>
            <span className="text-sm text-yellow-400 font-semibold tabular-nums">{totalScore}</span>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="survival-mode-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full"></div>
          </div>
        </div>
      )}
      
      {/* Default content when no game is running and not in setup */}
      {!isLoading && !showSetupPopup && (!activeRoundState || !activeRoundState.isRoundActive) && gameStatus !== 'gameover' && (
        <div className="survival-mode-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <PrimaryButton
              onClick={() => setShowSetupPopup(true)}
              className="survival-mode-guess-counter text-xl py-4 px-8"
            >
              Start Survival Mode
            </PrimaryButton>
          </div>
        </div>
      )}
      
      {/* Error state when challenge fails to load */}
      {!isLoading && challengeError && (
        <div className="survival-mode-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="survival-mode-game-card max-w-md">
              <div className="survival-mode-card-content text-center">
                                  <h3 className="text-xl font-bold mb-3 text-red-400">{t('error.loading.challenge')}</h3>
                <p className="mb-4 text-white/80">There was a problem loading today's challenge.</p>
                <PrimaryButton 
                  onClick={() => {
                    setChallengeError(false);
                    setIsLoading(true);
                    
                    // Small delay before retry to ensure state is reset
                    setTimeout(() => {
                      // Release any stale lock before retrying
                      roundEndLockRef.current = false;
                      try {
                        startNextRound();
                        setIsLoading(false);
                      } catch (error) {
                        console.error('Retry failed:', error);
                        setChallengeError(true);
                        setIsLoading(false);
                      }
                    }, 500);
                  }}
                          className="font-bold py-2 px-4"
                  >
                    {t('retry')}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Game Content - Only show if game is active and not loading and no errors */}
      {!isLoading && !showSetupPopup && !challengeError && activeRoundState && activeRoundState.isRoundActive && (
        <div className="survival-mode-content">
          {/* Simplified points display is now rendered just below the round headline */}

          {/* Inline Victory Section */}
          <AnimatePresence mode="wait">
            {showInlineVictory && (
              <motion.div
                key="victory-section"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }}
                exit={{ 
                  opacity: 0,
                  scale: 0.95,
                  transition: {
                    duration: 0.3,
                    ease: "easeIn"
                  }
                }}
                className="relative z-20 max-w-2xl mx-auto"
              >
                <div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-yellow-400/50 shadow-2xl">
                  {/* Victory GIF */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1,
                      transition: { delay: 0.2, duration: 0.5 }
                    }}
                    className="flex justify-center mb-6"
                  >
                    <img 
                      src="/8_bit_victory.gif" 
                      alt="Victory" 
                      className="w-32 h-32 object-contain"
                    />
                  </motion.div>
                  
                  {/* Victory Headline */}
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1,
                      transition: { delay: 0.3, duration: 0.5 }
                    }}
                    className="text-4xl font-bold text-center text-white mb-4"
                  >
                    {t('survival.victory.title')}
                  </motion.h2>
                  
                  {/* Correct Brawler Name */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { delay: 0.4, duration: 0.5 }
                    }}
                    className="text-center text-xl text-yellow-300 font-medium mb-6"
                  >
                    {lastCorrectBrawler}
                  </motion.div>
                  
                  {/* Score Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.5, duration: 0.5 }
                    }}
                    className="bg-black/30 rounded-xl p-4 mb-6"
                  >
                    <div className="grid grid-cols-2 gap-4 text-white">
                      <div className="text-center">
                        <div className="text-sm opacity-70">{t('survival.points.earned')}</div>
                        <div className="text-2xl font-bold text-green-400">
                          +<SlidingNumber value={currentRoundPoints} />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm opacity-70">{t('survival.total.score')}</div>
                        <div className="text-2xl font-bold text-yellow-400">
                          <SlidingNumber value={totalScore} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Countdown Timer */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      transition: { 
                        delay: 0.6,
                        duration: 0.3,
                        type: "spring",
                        stiffness: 200
                      }
                    }}
                    className="text-center"
                  >
                    <div className="text-sm text-white/70 mb-2">{t('survival.next.round.in')}</div>
                    <motion.div
                      key={victoryCountdown}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1,
                        transition: { duration: 0.3 }
                      }}
                      className="text-5xl font-bold text-white"
                    >
                      {victoryCountdown}
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Card - Hide during victory */}
          <AnimatePresence mode="wait">
            {!showInlineVictory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="w-full"
              >
                <DailyModeTransitionOrchestrator modeKey={`${currentModeName ?? 'none'}-${modeKey}`} className="w-full">
                  <div className="survival-mode-game-card survival-mode-animate-pulse bg-black/30 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-sm">
                    <div className="survival-mode-card-content">
                {currentModeName === 'classic' && (
                  <ClassicMode 
                    key={`${modeKey}-classic`}
                    brawlerId={activeRoundState.currentBrawlerId || 1}
                    onRoundEnd={handleRoundEnd}
                    maxGuesses={activeRoundState.guessesQuota}
                    isSurvivalMode={true}
                    skipVictoryScreen={true}
                  />
                )}
                {currentModeName === 'gadget' && (
                  <GadgetMode 
                    key={`${modeKey}-gadget`}
                    brawlerId={activeRoundState.currentBrawlerId || 1}
                    onRoundEnd={handleRoundEnd}
                    maxGuesses={activeRoundState.guessesQuota}
                    isSurvivalMode={true}
                    skipVictoryScreen={true}
                  />
                )}
                {currentModeName === 'starpower' && (
                  <StarPowerMode 
                    key={`${modeKey}-starpower`}
                    brawlerId={activeRoundState.currentBrawlerId || 1}
                    onRoundEnd={handleRoundEnd}
                    maxGuesses={activeRoundState.guessesQuota}
                    isSurvivalMode={true}
                    skipVictoryScreen={true}
                  />
                )}
                {currentModeName === 'audio' && (
                  <AudioMode 
                    key={`${modeKey}-audio`}
                    brawlerId={activeRoundState.currentBrawlerId || 1}
                    onRoundEnd={handleRoundEnd}
                    maxGuesses={activeRoundState.guessesQuota}
                    isSurvivalMode={true}
                    skipVictoryScreen={true}
                  />
                )}
                {currentModeName === 'pixels' && (
                  <PixelsMode 
                    key={`${modeKey}-pixels`}
                    brawlerId={activeRoundState.currentBrawlerId || 1}
                    onRoundEnd={handleRoundEnd}
                    maxGuesses={activeRoundState.guessesQuota}
                    isSurvivalMode={true}
                    skipVictoryScreen={true}
                  />
                      )}
                    </div>
                  </div>
                </DailyModeTransitionOrchestrator>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Setup Popup - Shows initially and lets user configure settings */}
      {showSetupPopup && (
        <div className="absolute inset-0 z-50">
          <SurvivalSetupPopup
            onStart={(settings) => {
              // Hide setup popup
              setShowSetupPopup(false);
              
              // Reset scores and state
              setTotalScore(0);
              setCurrentRoundPoints(0);
              
              // Reset the game key to force a remount of components
              setModeKey(`survival-start-${Date.now()}`);
              
              // Allow the first-round effect to run for a fresh session
              initialRoundStartedRef.current = false;
              // Ensure round end lock is released for a fresh session
              roundEndLockRef.current = false;

              // Initialize game with settings
              initializeGame(settings);
              resetModeSelectionState();
              
              // First round will be started by the effect
            }}
            onCancel={() => navigate('/')}
          />
        </div>
      )}
      
      {/* Victory popup removed - using inline victory flow */}
      
      {/* Game Over Popup */}
      {showLossPopup && (
        <div className="absolute inset-0 z-50">
          <SurvivalLossPopup
            correctBrawlerName={correctBrawlerForLoss}
            totalScore={totalScore}
            totalRounds={currentRound - 1}
            onRetry={() => {
              // Reset the game and start from scratch
              setShowLossPopup(false);
              setTotalScore(0);
              setCurrentRoundPoints(0);
              resetModeSelectionState();
              // Release any stale lock before a new session
              roundEndLockRef.current = false;
              // Show setup popup again
              setShowSetupPopup(true);
            }}
            onHome={() => navigate('/')}
          />
        </div>
      )}
    </div>
  );
};

export default SurvivalModePage;
