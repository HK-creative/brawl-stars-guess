import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Timer, Circle, Trophy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSurvivalStore, GameMode, SurvivalSettings } from '@/stores/useSurvivalStore';
import { calculateNextGuessesQuota, selectNextBrawlerAndMode, resetModeSelectionState } from '@/lib/survival-logic';
import ClassicMode from './ClassicMode';
import GadgetMode from './GadgetMode';
import StarPowerMode from './StarPowerMode';
import AudioMode from './AudioMode';
import HomeButton from '@/components/ui/home-button';
import { cn } from '@/lib/utils';
import SurvivalVictoryPopup from '@/components/SurvivalVictoryPopup';
import SurvivalLossPopup from '@/components/SurvivalLossPopup';
import SurvivalSetupPopup from '@/components/SurvivalSetupPopup';
import { t } from '@/lib/i18n';

// Import brawler data
import { brawlers } from '@/data/brawlers';

// A simple error fallback component to show when challenge loading fails
const FallbackErrorUI = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <h3 className="text-xl font-bold mb-4">Error Loading Challenge</h3>
    <p className="mb-6">There was a problem loading today's gadget challenge.</p>
    <Button 
      onClick={onRetry}
      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
    >
      Try Again
    </Button>
  </div>
);

const SurvivalModePage: React.FC = () => {
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
  const [showVictoryPopup, setShowVictoryPopup] = useState(false);
  const [showLossPopup, setShowLossPopup] = useState(false);
  const [showSetupPopup, setShowSetupPopup] = useState(true); // Start with setup popup
  const [lastCorrectBrawler, setLastCorrectBrawler] = useState("");
  const [correctBrawlerForLoss, setCorrectBrawlerForLoss] = useState("");
  
  // Add state to store round completion data for victory popup
  const [lastRoundGuessesUsed, setLastRoundGuessesUsed] = useState(0);
  const [lastRoundTimeLeft, setLastRoundTimeLeft] = useState(0);
  
  // Add local timer state to fix closure issues
  const [currentTimerValue, setCurrentTimerValue] = useState<number | null>(null);
  
  // Add a key to force remount of game mode components
  const [modeKey, setModeKey] = useState<string>("initial");

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

  // Handle round completion
  const handleRoundEnd = useCallback(({ success, brawlerName }: { success: boolean, brawlerName?: string }) => {
    // Clear any timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!success) {
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
      // Success - player completed the round
      // Calculate points earned for this round
      const guessesUsed = activeRoundState ? (activeRoundState.guessesQuota - activeRoundState.guessesLeft) : 0;
      const timeLeft = currentTimerValue ?? activeRoundState?.timerLeft ?? 0;
      const points = calculateRoundPoints(guessesUsed, timeLeft);
      
      // Update score
      setCurrentRoundPoints(points);
      setTotalScore(prev => prev + points);
      
      // If a specific brawler name was provided in the callback, use that
      // This will be the actual brawler that was correctly guessed
      if (brawlerName) {
        console.log(`Using provided brawler name for victory popup: ${brawlerName}`);
        setLastCorrectBrawler(brawlerName);
        setShowVictoryPopup(true);
        setLastRoundGuessesUsed(guessesUsed);
        setLastRoundTimeLeft(timeLeft);
        return;
      }
      
      // Fallback: Show victory popup with the correct brawler from the current round state
      if (activeRoundState?.currentBrawlerId) {
        const brawler = brawlerData.find(b => b.id === activeRoundState.currentBrawlerId);
        if (brawler) {
          console.log(`Using fallback brawler from activeRoundState: ${brawler.name}`);
          setLastCorrectBrawler(brawler.name);
          setShowVictoryPopup(true);
          setLastRoundGuessesUsed(guessesUsed);
          setLastRoundTimeLeft(timeLeft);
          return; // Don't proceed to next round yet
        }
      }
      
      // Fallback if we couldn't find the brawler
      toast({
        title: "Round Complete!",
        description: "Good job! Moving to next round.",
      });
      
      // Force a reset before starting next round
      setModeKey(`survival-round-${Date.now()}`);
      setTimeout(() => startNextRound(), 1000);
    }
  }, [gameOver, activeRoundState, brawlerData, calculateRoundPoints, setCorrectBrawlerForLoss, setLastCorrectBrawler, setShowLossPopup, setShowVictoryPopup, setTotalScore, setCurrentRoundPoints, setModeKey, startNextRound]);

  // Effect to track game status changes and start next round as needed
  useEffect(() => {
    // Don't start a round if we're in setup mode or already have an active round
    if (gameStatus === 'playing' && !activeRoundState?.isRoundActive && !showSetupPopup) {
      console.log('No active round detected in playing state. Starting next round...');
      resetModeSelectionState();
      setIsLoading(true);
      
      // Use a try-catch block to handle potential errors when starting a new round
      try {
        // Add a small delay to ensure the store is updated properly
        setTimeout(() => {
          try {
            startNextRound();
            setChallengeError(false);
          } catch (error) {
            console.error('Failed to start next round:', error);
            setChallengeError(true);
          } finally {
            setIsLoading(false);
          }
        }, 300);
      } catch (error) {
        console.error('Error in round initialization:', error);
        setChallengeError(true);
        setIsLoading(false);
      }
    }
  }, [settings, gameStatus, activeRoundState, startNextRound, showSetupPopup]);

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
      // Initialize local timer state
      setCurrentTimerValue(activeRoundState.timerLeft);
      
      // Clear any existing interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Set up new interval
      timerRef.current = setInterval(() => {
        setCurrentTimerValue(prevTime => {
          if (prevTime && prevTime > 0) {
            const newTime = prevTime - 1;
            // Update the store as well
            setTimerLeft(newTime);
            return newTime;
          } else {
            // Time's up - game over
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col">
      {/* Top Bar */}
      <div className="bg-slate-800/50 border-b border-white/5 py-3 px-4 flex items-center justify-between sticky top-0 z-10">
        <HomeButton />
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Default content when no game is running and not in setup */}
      {!isLoading && !showSetupPopup && (!activeRoundState || !activeRoundState.isRoundActive) && gameStatus !== 'gameover' && (
        <div className="flex-1 flex items-center justify-center">
          <Button
            onClick={() => setShowSetupPopup(true)}
            className="bg-gradient-to-r from-amber-600 to-pink-600 hover:from-amber-500 hover:to-pink-500 text-white py-3 px-6 text-lg"
          >
            Start Survival Mode
          </Button>
        </div>
      )}
      
      {/* Error state when challenge fails to load */}
      {!isLoading && challengeError && (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-slate-800/70 p-6 rounded-xl border border-red-500/30 text-center">
            <h3 className="text-xl font-bold mb-3 text-red-400">Error Loading Challenge</h3>
            <p className="mb-4 text-white/80">There was a problem loading today's challenge.</p>
            <Button 
              onClick={() => {
                setChallengeError(false);
                setIsLoading(true);
                
                // Small delay before retry to ensure state is reset
                setTimeout(() => {
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
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {/* Main Game Content - Only show if game is active and not loading and no errors */}
      {!isLoading && !showSetupPopup && !challengeError && activeRoundState && activeRoundState.isRoundActive && (
        <div className="flex-1 flex flex-col p-4 items-center justify-center relative">
          {/* Confetti Animation (award style) */}
          

          {/* Updated Round Info - Clean Design */}
          <div className="mb-6 flex flex-col items-center justify-center relative z-10">
            <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white">
                {t('survival.round')} {currentRound}
              </span>
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/80 to-emerald-400/70 shadow-lg border border-green-300/50 text-lg font-bold text-white">
                <Circle className="h-5 w-5 text-white/80 fill-current" />
                {totalScore} {t('survival.pts')}
              </span>
              {settings?.timer && (
                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/80 to-amber-400/70 shadow-lg border border-yellow-300/50 text-lg font-bold text-white">
                  <Timer className="h-5 w-5 text-white/80" />
                  {currentTimerValue ?? activeRoundState.timerLeft}{t('survival.seconds')}
                </span>
              )}
            </div>
          </div>

          {/* 3D Award Card for Game Content */}
          <Card className="flex-1 w-full max-w-2xl mx-auto bg-gradient-to-br from-yellow-200/20 via-pink-100/10 to-slate-900/60 border-4 border-yellow-400 shadow-[0_8px_40px_0_rgba(255,214,0,0.10)] rounded-3xl overflow-hidden relative z-10 animate-award-card">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-yellow-300 opacity-80 blur-sm animate-award-bar" />
            <div className="p-4 md:p-8">
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
            </div>
          </Card>
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
              
              // Initialize game with settings
              initializeGame(settings);
              resetModeSelectionState();
              
              // Start first round after a brief delay
              setTimeout(() => {
                startNextRound();
              }, 100);
            }}
            onCancel={() => navigate('/')}
          />
        </div>
      )}
      
      {/* Victory Popup */}
      {showVictoryPopup && (
        <div className="absolute inset-0 z-50">
          <SurvivalVictoryPopup
            brawlerName={lastCorrectBrawler}
            pointsEarned={currentRoundPoints}
            totalScore={totalScore}
            guessesUsed={lastRoundGuessesUsed}
            timeLeft={lastRoundTimeLeft}
            onNextRound={() => {
              // Hide victory popup and continue to next round
              setShowVictoryPopup(false);
              // Start next round with current settings
              startNextRound();
            }}
          />
        </div>
      )}
      
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
