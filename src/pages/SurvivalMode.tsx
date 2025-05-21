import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Timer, Home, Circle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSurvivalStore } from '@/stores/useSurvivalStore';
import { calculateNextGuessesQuota, selectNextBrawlerAndMode, resetModeSelectionState, calculateRemainingHearts } from '@/lib/survival-logic';
import ClassicMode from './ClassicMode';
import GadgetMode from './GadgetMode';
import StarPowerMode from './StarPowerMode';
import AudioMode from './AudioMode';
import HomeButton from '@/components/ui/home-button';
import { cn } from '@/lib/utils';

// Import full brawler data
import fullBrawlerData from '@/data/brawlers_full.json';

const SurvivalModePage: React.FC = () => {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [brawlerData, setBrawlerData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentModeName, setCurrentModeName] = useState<string | null>(null);

  // Get store state and actions
  const {
    settings,
    heartsLeft,
    currentRound,
    gameStatus,
    activeRoundState,
    initializeGame,
    startNextRound,
    decrementGuess,
    decrementHeart,
    setTimerLeft,
    gameOver
  } = useSurvivalStore();

  // Load brawler data
  useEffect(() => {
    setBrawlerData(fullBrawlerData);
    setIsLoading(false);
  }, []);

  // Initialize game if coming from setup
  useEffect(() => {
    if (!settings || gameStatus === 'setup') {
      navigate('/survival');
      return;
    }

    // Start first round if just initialized
    if (gameStatus === 'playing' && (!activeRoundState || !activeRoundState.isRoundActive)) {
      resetModeSelectionState();
      startNextRound();
    }
  }, [settings, gameStatus, activeRoundState, navigate, startNextRound]);

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
      // Clear any existing interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Set up new interval
      timerRef.current = setInterval(() => {
        if (activeRoundState.timerLeft && activeRoundState.timerLeft > 0) {
          setTimerLeft(activeRoundState.timerLeft - 1);
        } else {
          // Timer ran out - fail the round
          if (timerRef.current) clearInterval(timerRef.current);
          handleRoundEnd({ success: false });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeRoundState, settings, gameStatus, setTimerLeft]);

  // Handle round completion
  const handleRoundEnd = useCallback(({ success }: { success: boolean }) => {
    // Clear any timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!success) {
      // Player failed - reduce heart
      decrementHeart();
      
      // Check if that was the last heart
      if (heartsLeft <= 1) {
        // Game over
        gameOver();
        // Navigate to score or game over screen
        setTimeout(() => navigate('/score'), 1500);
        return;
      }

      toast({
        title: "Lost a heart!",
        description: `${heartsLeft - 1} hearts remaining.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Round Complete!",
        description: "Good job! Moving to next round.",
      });
    }

    // Start next round after a short delay
    setTimeout(() => {
      startNextRound();
    }, 1000);
  }, [decrementHeart, gameOver, heartsLeft, navigate, startNextRound]);

  // Render dynamic mode component based on current mode
  const renderModeComponent = () => {
    if (!activeRoundState || !activeRoundState.currentMode || !activeRoundState.currentBrawlerId) {
      return <div className="text-center p-4">Loading next round...</div>;
    }

    // Find the matching brawler from data
    const currentBrawler = brawlerData.find(b => b.id === activeRoundState.currentBrawlerId);
    if (!currentBrawler) {
      return <div className="text-center p-4">Error: Couldn't find brawler data.</div>;
    }

    // Common props to pass to each mode component
    const modeProps = {
      brawlerId: currentBrawler.id,
      onRoundEnd: handleRoundEnd,
      maxGuesses: activeRoundState.guessesQuota,
      isEndlessMode: true // Survival mode should behave like endless mode
    };

    // Set the current mode name for display
    setCurrentModeName(activeRoundState.currentMode);

    // Render appropriate mode component
    switch (activeRoundState.currentMode) {
      case 'classic':
        return <ClassicMode key={`${currentRound}-${currentBrawler.id}`} {...modeProps} />;
      case 'gadget':
        return <GadgetMode key={`${currentRound}-${currentBrawler.id}`} {...modeProps} />;
      case 'starpower':
        return <StarPowerMode key={`${currentRound}-${currentBrawler.id}`} {...modeProps} />;
      case 'audio':
        return <AudioMode key={`${currentRound}-${currentBrawler.id}`} {...modeProps} />;
      default:
        return <div className="text-center p-4">Error: Unknown mode.</div>;
    }
  };

  // Render hearts based on settings and current state
  const renderHearts = () => {
    if (!settings) return null;
    
    const heartStates = calculateRemainingHearts(settings.hearts, heartsLeft);
    
    return (
      <div className="flex items-center gap-1">
        {heartStates.map((isActive, index) => (
          <Heart 
            key={index}
            className={cn(
              "h-6 w-6 transition-all", 
              isActive ? "text-red-500 fill-red-500" : "text-gray-400 stroke-gray-400"
            )}
            fill={isActive ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  if (isLoading || !settings) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (gameStatus === 'gameover') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Game Over!</h1>
          <p className="text-xl mb-6">You survived {currentRound} rounds</p>
          <Button onClick={() => navigate('/survival')}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* HUD Information Bar */}
      <div className="py-2 px-4 bg-black/40 backdrop-blur-sm flex items-center justify-between sticky top-0 z-50">
        <HomeButton />
        
        <div className="flex items-center gap-6">
          {/* Round counter */}
          <div className="flex items-center gap-1">
            <Circle className="h-4 w-4 text-yellow-400" fill="currentColor" />
            <span className="font-bold">Round {currentRound}</span>
          </div>
          
          {/* Hearts */}
          {renderHearts()}
          
          {/* Guesses left */}
          <div className="font-medium">
            Guesses: {activeRoundState?.guessesLeft}/{activeRoundState?.guessesQuota}
          </div>
          
          {/* Timer (if enabled) */}
          {settings.timer && activeRoundState?.timerLeft !== undefined && (
            <div className="flex items-center gap-1">
              <Timer className="h-4 w-4 text-blue-400" />
              <span className="font-bold">{activeRoundState.timerLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Current mode indicator */}
      {currentModeName && (
        <div className="py-1 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center text-sm font-medium uppercase tracking-wider">
          Current Mode: {currentModeName}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1">
        {renderModeComponent()}
      </div>
    </div>
  );
};

export default SurvivalModePage; 