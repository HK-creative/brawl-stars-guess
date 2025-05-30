import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { brawlers, Brawler } from '@/data/brawlers';
import BrawlerGuessRow from '@/components/BrawlerGuessRow';
import { getRandomBrawler } from '@/lib/daily-challenges';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import ShareResultModal from '@/components/ShareResultModal';
import Image from '@/components/ui/image';
import { RefreshCw, Share2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import ReactConfetti from 'react-confetti';
import VictorySection from '../components/VictoryPopup';
import { useNavigate } from 'react-router-dom';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';

type GameStatus = 'loading' | 'playing' | 'victory' | 'error';

interface VictoryData {
  brawlerName: string;
  portraitPath: string;
  guessCount: number;
}

const EndlessMode = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('loading');
  const [round, setRound] = useState(0);
  const [correctBrawler, setCorrectBrawler] = useState<Brawler | null>(null);
  const [guesses, setGuesses] = useState<Brawler[]>([]);
  const [guessCount, setGuessCount] = useState(0);
  const [guessedBrawlers, setGuessedBrawlers] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentVictoryData, setCurrentVictoryData] = useState<VictoryData | null>(null);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawlerForGuess, setSelectedBrawlerForGuess] = useState<Brawler | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const isMobile = useIsMobile();
  const [lastGuessIndex, setLastGuessIndex] = useState<number | null>(null);

  const victoryRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const attributeLabels = [
    { name: "Brawler", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Rarity", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Class", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Speed", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Range", fontSize: isMobile ? "text-base" : "text-2xl" },
    { name: "Wallbreak", fontSize: isMobile ? "text-xs" : "text-xl" }
  ];

  const initializeNewRound = (currentRound: number, calledFrom: 'initial' | 'next_brawler' | 'skip_retry') => {
    console.log(`[DEBUG] Attempting initializeNewRound. Current gameStatus: ${gameStatus}, Called from: ${calledFrom}, Current round: ${currentRound}`);

    if (calledFrom === 'initial' && gameStatus !== 'loading') {
      console.warn(`[DEBUG] Blocked initializeNewRound: initial call but gameStatus is ${gameStatus}`);
      return;
    }
    if (calledFrom === 'next_brawler' && gameStatus !== 'victory') {
      console.warn(`[DEBUG] Blocked initializeNewRound: next_brawler call but gameStatus is ${gameStatus}`);
      return;
    }
    if (calledFrom === 'skip_retry' && gameStatus !== 'playing' && gameStatus !== 'error') {
      console.warn(`[DEBUG] Blocked initializeNewRound: skip_retry call but gameStatus is ${gameStatus}`);
      return;
    }

    console.log("[DEBUG] Proceeding with initializeNewRound. Setting gameStatus to 'loading'");
    setGameStatus('loading');
    setShowConfetti(false);
    setCurrentVictoryData(null);

    setTimeout(() => {
      try {
        const newBrawler = getRandomBrawler();
        if (!newBrawler) {
          throw new Error("Failed to get new brawler.");
        }

        setCorrectBrawler(newBrawler);
        setGuesses([]);
        setGuessCount(0);
        setGuessedBrawlers([]);
        setInputValue('');
        setSelectedBrawlerForGuess(null);
        setRound(prev => prev + 1);
        setErrorMessage(null);
        
        setTimeout(() => {
          setGameStatus('playing');
          console.log("[DEBUG] New round initialized. Brawler:", newBrawler.name);
        }, 0);
      } catch (error) {
        console.error("[DEBUG] Error initializing new round:", error);
        setErrorMessage(error instanceof Error ? error.message : "Failed to load brawler for new round.");
        setGameStatus('error');
      }
    }, 0);
  };

  // Effect for initial game setup
  useEffect(() => {
    console.log("[DEBUG] Initializing game (useEffect)");
    initializeNewRound(0, 'initial'); // Start round 1
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to log guessedBrawlers changes for deep debugging
  useEffect(() => {
    console.log(`[DEBUG guessedBrawlers EFFECT] guessedBrawlers is now: [${guessedBrawlers.join(", ")}]. gameStatus: ${gameStatus}, Round: ${round}`);
  }, [guessedBrawlers, gameStatus, round]);

  const performGuess = (nameToGuess: string) => {
    if (gameStatus !== 'playing') {
      console.warn("[DEBUG performGuess] Guess submitted while not in 'playing' status:", gameStatus);
      return;
    }

    const trimmedNameToGuess = nameToGuess.trim();
    if (!trimmedNameToGuess) {
      toast({ title: "Error", description: "Brawler name for guess is empty.", variant: "destructive" });
      return;
    }

    if (!correctBrawler) {
      toast({ title: "Game Error", description: "Correct brawler not set. Please try refreshing.", variant: "destructive" });
      setGameStatus('error');
      setErrorMessage("Internal: correctBrawler was null during guess processing.");
      return;
    }

    const submittedBrawler = brawlers.find(b => b.name.toLowerCase() === trimmedNameToGuess.toLowerCase());

    if (!submittedBrawler) {
      toast({ title: "Invalid Brawler", description: `"${trimmedNameToGuess}" is not a recognized Brawler.`, variant: "destructive" });
      return;
    }

    if (guessedBrawlers.includes(submittedBrawler.name)) {
      toast({ title: "Already Guessed", description: `You've already guessed ${submittedBrawler.name} this round!`, variant: "destructive" });
      return;
    }

    const newGuesses = [submittedBrawler, ...guesses];
    const newGuessCount = guessCount + 1;
    const newGuessedBrawlers = [...guessedBrawlers, submittedBrawler.name];

    // Batch state updates for guess
    setGuesses(newGuesses);
    setGuessCount(newGuessCount);
    setGuessedBrawlers(newGuessedBrawlers);
    setInputValue(''); // Clear input regardless of outcome
    
    // Set the last guess index to 0 (since we prepend guesses to the array)
    setLastGuessIndex(0);

    const isCorrect = submittedBrawler.name.toLowerCase().trim() === correctBrawler.name.toLowerCase().trim();

    if (isCorrect) {
      console.log("[DEBUG performGuess] Correct guess! Setting up victory state");
      
      if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
        (document.activeElement as HTMLElement).blur();
      }

      // Set victory state in next tick to ensure other state updates are processed
      setTimeout(() => {
        setCurrentVictoryData({
          brawlerName: correctBrawler.name,
          portraitPath: getPortrait(correctBrawler.name),
          guessCount: newGuessCount,
        });
        setGameStatus('victory');
      }, 0);
    }
  };

  const handleSubmitGuess = (e: React.FormEvent) => {
    // This function is now ONLY for the form's direct onSubmit (e.g. click button)
    e.preventDefault();
    e.stopPropagation();
    console.log(`[DEBUG Form onSubmit] Form submitted. Current inputValue: "${inputValue}". Calling performGuess.`);
    if (gameStatus === 'playing') {
      performGuess(inputValue); // Uses the current state of inputValue
    } else {
      console.warn(`[DEBUG Form onSubmit] Submission blocked, gameStatus is ${gameStatus}`);
    }
  };

  const handleNextBrawlerFromModal = () => {
    if (gameStatus === 'victory') {
      initializeNewRound(round, 'next_brawler');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSkipOrRetry = () => {
    if (gameStatus === 'playing' || gameStatus === 'error') {
      console.log("[DEBUG] Skip/Retry button clicked. Current status:", gameStatus, "Initializing new round.");
      initializeNewRound(round, 'skip_retry');
    } else {
      console.warn("[DEBUG] Skip/Retry clicked in unexpected state:", gameStatus);
    }
  };

  // --- RENDER LOGIC ---
  if (gameStatus === 'loading') {
    return <div className="flex justify-center items-center h-40"><div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div></div>;
  }

  if (gameStatus === 'error') {
    return (
      <div className="flex justify-center items-center h-40">
         <Card className="brawl-card p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-brawl-yellow mb-2">Error Loading Challenge</h3>
              <p className="text-white/80">{errorMessage || "An unknown error occurred."}</p>
              <Button onClick={handleSkipOrRetry} className="mt-4">Try Again / New Brawler</Button>
            </div>
          </Card>
      </div>
    );
  }
  
  // This part renders when gameStatus is 'playing' or 'victory'
  // The victory modal will overlay if gameStatus is 'victory'
  // Inputs will be disabled if gameStatus is 'victory'

  return (
    <div className="max-h-[calc(100vh-70px)] overflow-hidden px-1">
      <div className="mb-4 md:mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-brawl-yellow mb-1 text-center">
          {t('mode.endless') || 'Endless Mode'}
        </h1>
      </div>

      <div className="h-[calc(100vh-120px)] flex flex-col">
        <div className="flex-1 flex flex-col space-y-1">
          <Card className="brawl-card p-2 mb-1">
            <form onSubmit={handleSubmitGuess} className="flex flex-col gap-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && gameStatus === 'playing') {
                    e.preventDefault(); 
                    e.stopPropagation();
                    
                    const currentInputText = inputValue.trim();
                    if (!currentInputText) { // If input is empty and Enter is pressed
                        console.log("[DEBUG EnterKey] Input is empty. Doing nothing.");
                        return;
                    }

                    const exactMatch = brawlers.find(b => b.name.toLowerCase() === currentInputText.toLowerCase());

                    if (exactMatch) {
                      console.log(`[DEBUG EnterKey] Exact match for "${currentInputText}". Submitting.`);
                      performGuess(currentInputText); 
                    } else {
                      const availableSuggestions = brawlers.filter(b =>
                        !guessedBrawlers.includes(b.name) && // Consider already guessed for suggestions visibility
                        b.name.toLowerCase().startsWith(currentInputText.toLowerCase())
                      );

                      if (availableSuggestions.length > 0) {
                        const firstSuggestionName = availableSuggestions[0].name;
                        console.log(`[DEBUG EnterKey] No exact match for "${currentInputText}". First suggestion: "${firstSuggestionName}". Submitting this.`);
                        setInputValue(firstSuggestionName); // Update input to show what's being guessed
                        performGuess(firstSuggestionName);
                      } else {
                        console.log(`[DEBUG EnterKey] No exact match or suggestions for "${currentInputText}". Doing nothing on Enter.`);
                        // Do nothing. User can continue typing or click submit button for current input.
                      }
                    }
                  }
                }}
                placeholder="Type brawler name..."
                disabled={gameStatus !== 'playing'}
                className="pl-3 pr-3 py-2 h-11 text-lg font-medium bg-[#1a1e44] text-white border-2 border-[#2a2f6a] rounded-lg placeholder:text-white/40 focus:ring-2 focus:ring-brawl-yellow/50 focus:border-transparent hover:bg-[#212659] disabled:opacity-50 disabled:cursor-not-allowed w-full"
                list="brawler-datalist"
              />
              <datalist id="brawler-datalist">
                {brawlers
                  .filter(b => !guessedBrawlers.includes(b.name)) // Still useful for autocomplete during 'playing'
                  .map(b => <option key={b.name} value={b.name} />
                )}
              </datalist>
              <Button
                type="submit"
                className="w-full bg-brawl-yellow hover:bg-brawl-yellow/80 text-black font-semibold py-1 h-8"
                disabled={gameStatus !== 'playing' || !inputValue.trim()}
              >
                {t('submit.guess')}
              </Button>
            </form>
          </Card>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-gradient-to-r from-purple-800/80 via-purple-900/90 to-purple-800/80 rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-white leading-tight">Endless Challenge</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="bg-purple-700/50 text-white/90 text-xs px-2 py-1 rounded-full">
                      {guessCount} {guessCount === 1 ? 'attempt' : 'attempts'}
                    </div>
                    <div className="bg-purple-700/50 text-white/90 text-xs px-2 py-1 rounded-full">
                      Round: {round}
                    </div>
                    <Button
                      onClick={handleSkipOrRetry}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white/90 flex items-center gap-1"
                      disabled={gameStatus !== 'playing'}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Skip Brawler
                    </Button>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">∞</div>
              </div>
            </div>

            <div className={cn("grid", "grid-cols-6", isMobile ? "gap-1 mb-1" : "gap-3 mb-3", isMobile ? "w-full" : "w-[85%] mx-auto")}>
              {attributeLabels.map((label) => (
                <div key={label.name} className="w-full aspect-square">
                  <div className={cn("relative overflow-hidden w-full h-full")}>
                    <div className="absolute inset-0 backdrop-blur-sm border-b-2 border-brawl-blue rounded-t-lg"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brawl-yellow"></div>
                    <div className="relative z-10 h-full w-full flex items-center justify-center">
                      <span className={cn(label.fontSize, "font-extrabold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] w-[85%] h-[85%] flex items-center justify-center")}>
                        {label.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-y-auto overflow-x-visible flex-1 min-h-0 max-h-[calc(100vh-250px)] p-1">
              <div className="space-y-1 overflow-visible">
                {guesses.map((guess, index) => (
                  <BrawlerGuessRow
                    key={`${round}-${guess.name}-${index}`}
                    guess={guess}
                    correctAnswer={correctBrawler!}
                    isMobile={isMobile}
                    gridWidthClass={isMobile ? "w-full" : "w-[85%] mx-auto"}
                    gridTemplateClass="grid-cols-6"
                    isNew={index === lastGuessIndex} // Pass the isNew prop based on lastGuessIndex
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameStatus === 'victory' && currentVictoryData && (
        <div ref={victoryRef} className="mt-6 w-full max-w-xl mx-auto px-2">
          <VictorySection
            brawlerName={currentVictoryData.brawlerName}
            brawlerPortrait={currentVictoryData.portraitPath}
            tries={currentVictoryData.guessCount}
            mode="endless"
            nextModeKey="endless_next"
            onNextMode={handleNextBrawlerFromModal}
            onShare={handleShare}
          />
        </div>
      )}

      <ShareResultModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        mode="endless"
        success={gameStatus === 'victory'} // Share modal might need this to reflect actual win
        attempts={guessCount} // This should be the count for the completed round
        maxAttempts={0}
        brawlerName={currentVictoryData?.brawlerName || correctBrawler?.name || ''} // Ensure brawler name is available
      />
    </div>
  );
};

export default EndlessMode;
