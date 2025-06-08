import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Hash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useDailyStore } from '@/stores/useDailyStore';
import { brawlers, getBrawlerDisplayName } from '@/data/brawlers';
import BrawlerGuessRow from '@/components/BrawlerGuessRow';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import HomeButton from '@/components/ui/home-button';
import DailyModeProgress from '@/components/DailyModeProgress';
import ReactConfetti from 'react-confetti';
import { cn } from '@/lib/utils';
import { t, getLanguage } from '@/lib/i18n';

const DailyClassicMode: React.FC = () => {
  // Inject custom award styles into the document head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes award-glow {
        0% { text-shadow: 0 0 1.5px rgba(255,214,0,0.09), 0 0 3px rgba(255,214,0,0.09), 0 0 4.5px rgba(255,214,0,0.06); }
        100% { text-shadow: 0 0 2.4px rgba(255,214,0,0.12), 0 0 4.8px rgba(255,214,0,0.09), 0 0 7.2px rgba(255,214,0,0.075); }
      }
      .animate-award-glow { 
        animation: award-glow 3s infinite alternate; 
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
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const navigate = useNavigate();
  const {
    classic,
    timeUntilNext,
    isLoading,
    initializeDailyModes,
    incrementGuessCount,
    completeMode,
    resetGuessCount,
    updateTimeUntilNext,
    saveGuess,
    getGuesses,
  } = useDailyStore();

  const currentLanguage = getLanguage();

  // Local game state
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawler, setSelectedBrawler] = useState<any>(null);
  const [guesses, setGuesses] = useState<any[]>([]);
  const [guessedBrawlerNames, setGuessedBrawlerNames] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize daily modes on component mount
  useEffect(() => {
    initializeDailyModes();
    
    // Update timer immediately and then every minute
    updateTimeUntilNext();
    const interval = setInterval(() => {
      updateTimeUntilNext();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [initializeDailyModes]);

  // Load saved guesses when component mounts or classic data changes
  useEffect(() => {
    const savedGuesses = getGuesses('classic');
    setGuesses(savedGuesses);
    // Extract brawler names from saved guesses to prevent duplicates
    const brawlerNames = savedGuesses.map(guess => guess.name);
    setGuessedBrawlerNames(brawlerNames);
  }, [classic.brawlerName, getGuesses]);

  // Reset game when already completed
  useEffect(() => {
    if (classic.isCompleted) {
      setShowVictoryScreen(true);
    }
  }, [classic.isCompleted]);

  // Find the correct brawler object
  const getCorrectBrawler = useCallback(() => {
    return brawlers.find(b => b.name.toLowerCase() === classic.brawlerName.toLowerCase()) || brawlers[0];
  }, [classic.brawlerName]);

  // Handle guess submission
  const handleSubmit = useCallback((brawler?: any) => {
    const brawlerToSubmit = brawler || selectedBrawler;
    
    if (!brawlerToSubmit || classic.isCompleted) return;

    // Increment guess count in store
    incrementGuessCount('classic');
    
    // Add guess to store and local state
    const newGuess = brawlerToSubmit;
    saveGuess('classic', newGuess);
    setGuesses(prev => [...prev, newGuess]);
    setGuessedBrawlerNames(prev => [...prev, brawlerToSubmit.name]);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = brawlerToSubmit.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('classic');
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      
      const displayName = getBrawlerDisplayName(correctBrawler, currentLanguage);
      toast({
        title: "Congratulations! 🎉",
        description: `You found ${displayName}!`,
      });
    }
    
    // Reset input
    setInputValue('');
    setSelectedBrawler(null);
  }, [selectedBrawler, classic.isCompleted, incrementGuessCount, saveGuess, getCorrectBrawler, completeMode]);

  // Handle brawler selection and immediate submission
  const handleSelectBrawler = useCallback((brawler: any) => {
    setSelectedBrawler(brawler);
    const displayName = getBrawlerDisplayName(brawler, currentLanguage);
    setInputValue(displayName);
    
    // Immediately submit the guess
    handleSubmit(brawler);
  }, [handleSubmit, currentLanguage]);

  // Handle next mode navigation
  const handleNextMode = () => {
    navigate('/daily/gadget');
  };

  // Handle play again
  const handlePlayAgain = () => {
    setGuesses([]);
    setGuessedBrawlerNames([]);
    setIsGameOver(false);
    setShowVictoryScreen(false);
    setShowConfetti(false);
    setInputValue('');
    setSelectedBrawler(null);
    resetGuessCount('classic');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brawl-yellow border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col">
      {/* Confetti Animation */}
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          onConfettiComplete={() => setShowConfetti(false)}
          className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none"
        />
      )}

      {/* Top Bar */}
      <div className="bg-slate-800/50 border-b border-white/5 py-4 px-4 flex items-center justify-between sticky top-0 z-10">
        <HomeButton />
        <div className="flex-1 flex justify-center">
          <DailyModeProgress currentMode="classic" />
        </div>
        <div className="w-[40px]"></div> {/* Spacer to balance the layout */}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 items-center justify-center relative">
        {/* Header Info */}
        <div className="mb-6 flex flex-col items-center justify-center relative z-10">
          {/* Bigger Centered Headline */}
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_1px_6px_rgba(255,214,0,0.4)] animate-award-glow daily-mode-title">
              {t('daily.classic.title')}
            </h1>
          </div>
          
          <div className="flex flex-row items-center gap-4 mt-2">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/60 to-purple-400/50 shadow-md border border-blue-300/30 text-lg font-bold text-white">
              <Hash className="h-6 w-6 text-white/80" />
              {classic.guessCount} {t('guesses.count')}
            </span>
          </div>
          
          {/* Redesigned Timer - More Minimal */}
          <div className="mt-4 flex items-center gap-2 px-2 py-1 text-white/70">
            <Clock className="h-4 w-4 text-white/60" />
            <span className="text-sm font-medium">
              {t('next.brawler.in')}: {timeUntilNext.hours}h {timeUntilNext.minutes}m
            </span>
          </div>
        </div>

        {/* Game Card */}
        <Card className="flex-1 w-full max-w-2xl mx-auto bg-gradient-to-br from-yellow-200/20 via-pink-100/10 to-slate-900/60 border-4 border-yellow-400 shadow-[0_8px_40px_0_rgba(255,214,0,0.10)] rounded-3xl overflow-hidden relative z-10 animate-award-card">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-yellow-300 opacity-80 blur-sm animate-award-bar" />
          <div className="p-4 md:p-8">
            {showVictoryScreen ? (
              // Victory Screen
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                  {t('daily.congratulations')}
                </h2>
                <p className="text-xl text-white/80 mb-4">
                  {t('daily.you.found')} <span className="text-yellow-400 font-bold">{getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}</span> {t('daily.in.guesses')} {classic.guessCount} {t('daily.guesses.count')}
                </p>
                <div className="flex flex-col gap-4 items-center justify-center">
                  <Button
                    onClick={handleNextMode}
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white py-4 px-12 text-xl font-bold shadow-xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 border-2 border-emerald-300/50 w-full max-w-sm"
                  >
                    <img 
                      src="/GadgetIcon.png" 
                      alt="Gadget Mode" 
                      className={cn(
                        "h-6 w-6",
                        currentLanguage === 'he' ? "ml-2" : "mr-2"
                      )}
                    />
                    {t('daily.next.mode')}
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="text-white/40 hover:text-white/60 hover:bg-white/5 py-2 px-6 text-sm border border-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    {t('daily.go.home')}
                  </Button>
                  <div className="flex justify-center mt-6">
                    <img 
                      src="/Brawler_GIFs/elprimo_win.gif" 
                      alt="El Primo Victory" 
                      className="w-64 h-64 md:w-80 md:h-80 object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Game Content
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {t('daily.classic.headline')}
                  </h2>
                  <p className="text-white/70">
                    {t('daily.classic.description')}
                  </p>
                </div>

                {/* Input Form - No Submit Button */}
                <div className="space-y-4">
                  <BrawlerAutocomplete
                    brawlers={brawlers}
                    value={inputValue}
                    onChange={setInputValue}
                    onSelect={handleSelectBrawler}
                    disabled={classic.isCompleted}
                    disabledBrawlers={guessedBrawlerNames}
                  />
                </div>

                {/* Attribute Labels Header */}
                {guesses.length > 0 && (
                  <div className="grid grid-cols-6 gap-1 md:gap-5 w-full px-1 mb-2">
                    {[
                      t('attribute.brawler'),
                      t('attribute.rarity'), 
                      t('attribute.class'),
                      t('attribute.range'),
                      t('attribute.wallbreak'),
                      t('attribute.release.year')
                    ].map((label, index) => (
                      <div key={label} className="w-full relative h-6 md:h-12">
                        {/* Yellow accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brawl-yellow"></div>
                        
                        {/* Text with adaptive sizing - positioned near the bottom */}
                        <div className="w-full h-full flex items-center justify-center px-1">
                          <span className={cn(
                            "font-extrabold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] attribute-label text-center",
                            currentLanguage === 'he' && index === 4 ? "text-[10px] md:text-sm" : "text-xs md:text-base",
                            currentLanguage === 'he' && index !== 4 ? "md:text-base md:font-black" : "",
                            // Special handling for wallbreak in Hebrew
                            currentLanguage === 'he' && label === "שובר קירות" ? "md:text-xs" : ""
                          )}>
                            {label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Guesses - Display newest first (reverse order) */}
                <div className="space-y-2">
                  {[...guesses].reverse().map((guess, index) => (
                    <BrawlerGuessRow
                      key={`${guess.name}-${guesses.length - 1 - index}`}
                      guess={guess}
                      correctAnswer={getCorrectBrawler()}
                      isNew={index === 0} // The first item in reversed array is the newest
                      isMobile={true} // Force mobile sizing for better card visibility
                      gridTemplateClass="grid-cols-6"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DailyClassicMode; 