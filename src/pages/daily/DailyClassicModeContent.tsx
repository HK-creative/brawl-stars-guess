import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Hash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDailyStore, DailyGameMode } from '@/stores/useDailyStore';
import { useStreak } from '@/contexts/StreakContext';
import { brawlers, getBrawlerDisplayName, getBrawlerLocalizedName } from '@/data/brawlers';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import BrawlerAutocomplete from '@/components/BrawlerAutocomplete';
import BrawlerGuessRow from '@/components/BrawlerGuessRow';
import ReactConfetti from 'react-confetti';
import { fetchDailyChallenge, fetchYesterdayChallenge } from '@/lib/daily-challenges';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import Image from '@/components/ui/image';
import PrimaryButton from '@/components/ui/primary-button';
import SecondaryButton from '@/components/ui/secondary-button';
import ModeTitle from '@/components/ModeTitle';
import DailyModeProgress from '@/components/DailyModeProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import AnimatedElement from '@/components/ui/animated-element';


interface DailyClassicModeContentProps {
  onModeChange: (mode: DailyGameMode) => void;
  suppressHeader?: boolean;
}

const DailyClassicModeContent: React.FC<DailyClassicModeContentProps> = ({ onModeChange, suppressHeader = false }) => {
  const navigate = useNavigate();
  const currentLanguage = getLanguage();
  const { streak } = useStreak();
  const { motionOK, transition } = useMotionPrefs();
  const isRTL = currentLanguage === 'he';

  const {
    classic,
    timeUntilNext,
    completeMode,
    resetGuessCount,
    updateTimeUntilNext,
    submitGuess,
    getGuesses,
    initializeDailyModes,
  } = useDailyStore();

  // Local game state
  const [inputValue, setInputValue] = useState('');
  const [selectedBrawler, setSelectedBrawler] = useState<any>(null);
  // Use store state directly instead of local state
  const guesses = classic.guesses;
  const guessedBrawlerNames = guesses.map((g: any) => g.name);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [yesterdayData, setYesterdayData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for discovered attributes
  const [discoveredAttributes, setDiscoveredAttributes] = useState<{
    rarity?: string;
    class?: string;
    range?: string;
    wallbreak?: string | null;
    releaseYear?: number;
  }>({});

  // Update timer immediately and then every minute
  useEffect(() => {
    updateTimeUntilNext();
    const interval = setInterval(() => {
      updateTimeUntilNext();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updateTimeUntilNext]);

  // Load yesterday's challenge
  const loadYesterdayData = async () => {
    try {
      const yesterdayChallenge = await fetchYesterdayChallenge('classic');
      setYesterdayData(yesterdayChallenge);
    } catch (error) {
      console.error('Error loading yesterday data:', error);
    }
  };

  useEffect(() => {
    loadYesterdayData();
  }, []);

  // Load saved guesses when component mounts or classic data changes
  useEffect(() => {
    const savedGuesses = getGuesses('classic');
    
    // Update discovered attributes based on saved guesses
    if (savedGuesses.length > 0) {
      const correctBrawler = brawlers.find(b => b.name.toLowerCase() === classic.brawlerName.toLowerCase()) || brawlers[0];
      const newDiscovered: typeof discoveredAttributes = {};
      
      savedGuesses.forEach(guess => {
        if (guess.rarity === correctBrawler.rarity && !newDiscovered.rarity) {
          newDiscovered.rarity = correctBrawler.rarity;
        }
        if (guess.class === correctBrawler.class && !newDiscovered.class) {
          newDiscovered.class = correctBrawler.class;
        }
        if (guess.range === correctBrawler.range && !newDiscovered.range) {
          newDiscovered.range = correctBrawler.range;
        }
        if (guess.wallbreak === correctBrawler.wallbreak && !newDiscovered.wallbreak) {
          newDiscovered.wallbreak = correctBrawler.wallbreak;
        }
        if (guess.releaseYear === correctBrawler.releaseYear && !newDiscovered.releaseYear) {
          newDiscovered.releaseYear = correctBrawler.releaseYear;
        }
      });
      
      setDiscoveredAttributes(newDiscovered);
    }
    
    // Check if already completed
    if (classic.isCompleted) {
      setIsGameOver(true);
      setShowVictoryScreen(true);
    }
  }, [classic]);

  const getCorrectBrawler = () => {
    return brawlers.find(b => b.name.toLowerCase() === classic.brawlerName.toLowerCase()) || brawlers[0];
  };

  // Handle brawler selection
  const handleSelectBrawler = (brawler: any) => {
    setSelectedBrawler(brawler);
    setInputValue(getBrawlerDisplayName(brawler, currentLanguage));
  };

  // Handle guess submission
  const handleSubmit = useCallback(() => {
    if (!selectedBrawler || isSubmitting || classic.guesses.some(g => g.name === selectedBrawler.name)) {
      return;
    }
    
    setIsSubmitting(true);
    // Atomic submit to avoid extra renders and duplicate increments
    const newGuess = selectedBrawler;
    submitGuess('classic', newGuess);
    
    // Check if correct
    const correctBrawler = getCorrectBrawler();
    const isCorrect = selectedBrawler.name.toLowerCase() === correctBrawler.name.toLowerCase();
    
    if (isCorrect) {
      // Mark mode as completed
      completeMode('classic');
      setIsGameOver(true);
      setShowVictoryScreen(true);
      setShowConfetti(true);
      
      const displayName = getBrawlerDisplayName(correctBrawler, currentLanguage);
      toast({
        title: t('daily.congratulations'),
        description: `${t('daily.you.found')} ${displayName}!`,
        duration: 3000,
      });
    }
    
    // Clear input
    setInputValue('');
    setSelectedBrawler(null);
    setIsSubmitting(false);
  }, [selectedBrawler, classic.guesses, submitGuess, completeMode, currentLanguage, getCorrectBrawler]);

  // Handle next mode navigation (back to pixels - start of cycle)
  const handleNextMode = () => {
    onModeChange('pixels');
  };

  // Handle play again
  const handlePlayAgain = () => {
    setIsGameOver(false);
    setShowVictoryScreen(false);
    setShowConfetti(false);
    setInputValue('');
    setSelectedBrawler(null);
    resetGuessCount('classic');
  };

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="daily-classic-theme">
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
      
      {/* Header Section */}
      {!suppressHeader && (
        <div className="w-full max-w-4xl mx-auto px-4 py-2 relative">
          {/* Top Row: Home Icon, Streak, Timer */}
          <div className="flex items-center justify-between mb-4">
            {/* Home Icon */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
              aria-label={t('button.go.home')}
            >
              <img 
                src="/bs_home_icon.png"
                alt={t('button.go.home')}
                className="w-11 h-11"
              />
            </button>

            {/* Right side: Streak only */}
            <div className="flex items-center gap-3">
              {/* Daily Streak */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="text-3xl font-bold leading-none text-[hsl(var(--daily-mode-primary))]">{streak}</span>
                  <div className="text-3xl">🔥</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Navigation */}
          <DailyModeProgress currentMode="classic" className="mb-6 mt-1" onModeChange={onModeChange} />

          {/* Title */}
          <AnimatedElement type="slideUp" delay={0} className="text-center mb-2 mt-2">
            <ModeTitle title={t('mode.classic')} />
          </AnimatedElement>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 pb-4">
        <motion.div
          className="daily-mode-game-card daily-mode-animate-pulse mt-0 md:mt-0 mb-10 md:mb-12"
          initial={motionOK ? { opacity: 0, scale: 0.98 } : { opacity: 0 }}
          animate={{ opacity: 1, scale: 1, transition }}
          layout
        >
          <div className="daily-mode-card-content">
            {showVictoryScreen ? (
              // Redesigned Victory Screen
              <AnimatedElement type="fade" delay={0} className="daily-mode-victory-section">
                <div className="victory-container">
                  {/* Success Icon & Title */}
                  <AnimatedElement type="scale" delay={0.1} className="victory-header">
                    <div className="success-icon-container">
                      <div className="success-icon">
                        <svg className="checkmark" viewBox="0 0 52 52">
                          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                          <path className="checkmark-check" fill="none" d="m15.5,26.5l7.5,7.5l13.5,-13.5"/>
                        </svg>
                      </div>
                    </div>
                    <h2 className="victory-title">
                      {t('daily.victory.title')}
                    </h2>
                  </AnimatedElement>

                  {/* Brawler & Performance Stats */}
                  <AnimatedElement type="slideUp" delay={0.2} className="victory-stats">
                    <div className="found-brawler">
                      <div className="brawler-portrait">
                        <Image 
                          src={getPortrait(getCorrectBrawler().name)} 
                          alt={getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}
                          className="portrait-image"
                          fallbackSrc={DEFAULT_PORTRAIT}
                        />
                      </div>
                      <div className="brawler-info">
                        <p className="found-text">{t('daily.you.found')}</p>
                        <h3 className="brawler-name">
                          {getBrawlerDisplayName(getCorrectBrawler(), currentLanguage)}
                        </h3>
                      </div>
                    </div>

                    <div className="performance-grid">
                      <div className="stat-card guess-count">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value">
                          <SlidingNumber value={classic.guessCount} />
                        </div>
                        <div className="stat-label">{t('daily.guesses.used')}</div>
                      </div>
                      
                      <div className="stat-card accuracy">
                        <div className="stat-icon">📈</div>
                        <div className="stat-value">
                          {Math.round((1 / classic.guessCount) * 100)}%
                        </div>
                        <div className="stat-label">{t('daily.accuracy')}</div>
                      </div>
                      
                      <div className="stat-card streak">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-value">
                          <SlidingNumber value={streak} />
                        </div>
                        <div className="stat-label">{t('daily.streak')}</div>
                      </div>
                    </div>
                  </AnimatedElement>

                  {/* Action Buttons */}
                  <AnimatedElement type="slideUp" delay={0.3} className="victory-actions">
                    <div className="action-buttons">
                      <PrimaryButton
                        onClick={handleNextMode}
                        className="next-mode-btn"
                      >
                        <img 
                          src="/PixelsIcon.png" 
                          alt="Pixels Mode" 
                          className={cn(
                            "btn-icon",
                            currentLanguage === 'he' ? "ml-2" : "mr-2"
                          )}
                        />
                        {t('daily.next.mode')}
                        <div className="btn-arrow">→</div>
                      </PrimaryButton>
                      
                      <div className="secondary-actions">
                        <SecondaryButton
                          onClick={() => navigate('/')}
                          className="home-btn"
                        >
                          <svg className="home-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                          </svg>
                          {t('daily.go.home')}
                        </SecondaryButton>
                      </div>
                    </div>
                  </AnimatedElement>
                </div>

                <style>{`
                  .victory-container {
                    padding: 2rem 1.5rem;
                    text-align: center;
                    max-width: 400px;
                    margin: 0 auto;
                  }

                  .victory-header {
                    margin-bottom: 2rem;
                  }

                  .success-icon-container {
                    margin-bottom: 1rem;
                  }

                  .success-icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto;
                    position: relative;
                  }

                  .checkmark {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 3;
                    stroke: #4ade80;
                    stroke-miterlimit: 10;
                    box-shadow: inset 0px 0px 0px #4ade80;
                    animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
                  }

                  .checkmark-circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    stroke-width: 3;
                    stroke-miterlimit: 10;
                    stroke: #4ade80;
                    fill: none;
                    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                  }

                  .checkmark-check {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    stroke-width: 3;
                    stroke: #4ade80;
                    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                  }

                  @keyframes stroke {
                    100% { stroke-dashoffset: 0; }
                  }

                  @keyframes scale {
                    0%, 100% { transform: none; }
                    50% { transform: scale3d(1.1, 1.1, 1); }
                  }

                  @keyframes fill {
                    100% { box-shadow: inset 0px 0px 0px 30px #4ade80; }
                  }

                  .victory-title {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #4ade80, #22c55e, #15803d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0;
                  }

                  .victory-stats {
                    margin-bottom: 2rem;
                  }

                  .found-brawler {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: rgba(74, 222, 128, 0.1);
                    border: 1px solid rgba(74, 222, 128, 0.2);
                    border-radius: 1rem;
                  }

                  .brawler-portrait {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3px solid #4ade80;
                    box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
                  }

                  .portrait-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                  }

                  .brawler-info {
                    text-align: left;
                  }

                  .found-text {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0 0 0.25rem 0;
                  }

                  .brawler-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #4ade80;
                    margin: 0;
                  }

                  .performance-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem;
                  }

                  .stat-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    padding: 1rem 0.5rem;
                    transition: all 0.2s ease;
                  }

                  .stat-card:hover {
                    background: rgba(255, 255, 255, 0.08);
                    transform: translateY(-2px);
                  }

                  .stat-icon {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                  }

                  .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #fbbf24;
                    margin-bottom: 0.25rem;
                  }

                  .stat-label {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                  }

                  .victory-actions {
                    margin-top: 1rem;
                  }

                  .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                  }

                  .next-mode-btn {
                    position: relative;
                    background: linear-gradient(135deg, #4ade80, #22c55e);
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 20px rgba(74, 222, 128, 0.3);
                  }

                  .next-mode-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(74, 222, 128, 0.4);
                  }

                  .btn-icon {
                    width: 1.25rem;
                    height: 1.25rem;
                  }

                  .btn-arrow {
                    margin-left: 0.5rem;
                    transition: transform 0.2s ease;
                  }

                  .next-mode-btn:hover .btn-arrow {
                    transform: translateX(4px);
                  }

                  .secondary-actions {
                    display: flex;
                    justify-content: center;
                  }

                  .home-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.8);
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s ease;
                  }

                  .home-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                  }

                  .home-icon {
                    width: 1rem;
                    height: 1rem;
                  }
                `}</style>
              </AnimatedElement>
            ) : (
              // Game Content
              <div className="daily-mode-game-area">
                {/* Attribute Discovery Box for Classic Mode */}
                <AnimatedElement type="slideUp" delay={0.1} className="flex justify-center mb-6">
                  <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl border-4 border-amber-500/60 bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-2xl">
                    <div className="flex flex-col justify-center p-3 w-full h-full">
                      <div className="flex flex-col gap-2 h-full justify-center">
                        {/* Rarity */}
                        <div className={cn(
                          "flex-1 aspect-square flex items-center rounded-lg px-3 py-2 min-h-0",
                          discoveredAttributes.rarity 
                            ? "bg-green-500/20 border border-green-500/40" 
                            : "bg-gray-500/20 border border-gray-500/40"
                        )}>
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className={cn(
                              "text-xs font-medium",
                              discoveredAttributes.rarity ? "text-green-400" : "text-gray-400"
                            )}>{t('attribute.label.rarity')}</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.rarity ? t(`rarity.${discoveredAttributes.rarity.toLowerCase().replace(' ', '.')}`) : '?'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Class */}
                        <div className={cn(
                          "flex-1 aspect-square flex items-center rounded-lg px-3 py-2 min-h-0",
                          discoveredAttributes.class 
                            ? "bg-green-500/20 border border-green-500/40" 
                            : "bg-gray-500/20 border border-gray-500/40"
                        )}>
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className={cn(
                              "text-xs font-medium",
                              discoveredAttributes.class ? "text-green-400" : "text-gray-400"
                            )}>{t('attribute.label.class')}</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.class || '?'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Range */}
                        <div className={cn(
                          "flex-1 aspect-square flex items-center rounded-lg px-3 py-2 min-h-0",
                          discoveredAttributes.range 
                            ? "bg-green-500/20 border border-green-500/40" 
                            : "bg-gray-500/20 border border-gray-500/40"
                        )}>
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className={cn(
                              "text-xs font-medium",
                              discoveredAttributes.range ? "text-green-400" : "text-gray-400"
                            )}>{t('attribute.label.range')}</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.range ? t(`range.${discoveredAttributes.range.toLowerCase().replace(' ', '.')}`) : '?'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Wall Break */}
                        <div className={cn(
                          "flex-1 aspect-square flex items-center rounded-lg px-3 py-2 min-h-0",
                          discoveredAttributes.wallbreak !== null 
                            ? "bg-green-500/20 border border-green-500/40" 
                            : "bg-gray-500/20 border border-gray-500/40"
                        )}>
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className={cn(
                              "text-[10px] font-medium",
                              discoveredAttributes.wallbreak !== null ? "text-green-400" : "text-gray-400"
                            )}>{t('attribute.label.wallbreak')}</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.wallbreak !== null ? t(`wallbreak.${discoveredAttributes.wallbreak ? 'yes' : 'no'}`) : '?'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Release Year */}
                        <div className={cn(
                          "flex-1 aspect-square flex items-center rounded-lg px-3 py-2 min-h-0",
                          discoveredAttributes.releaseYear 
                            ? "bg-green-500/20 border border-green-500/40" 
                            : "bg-gray-500/20 border border-gray-500/40"
                        )}>
                          <div className={cn(
                            "flex items-center justify-between w-full",
                            currentLanguage === 'he' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className={cn(
                              "text-xs font-medium",
                              discoveredAttributes.releaseYear ? "text-green-400" : "text-gray-400"
                            )}>{t('attribute.label.year')}</div>
                            <div className="text-white text-sm font-bold">
                              {discoveredAttributes.releaseYear || '?'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedElement>

                {/* Search Bar */}
                <AnimatedElement type="slideUp" delay={0.2} className="daily-mode-input-section mb-8 w-full max-w-md mx-auto">
                    <BrawlerAutocomplete
                      brawlers={brawlers}
                      value={inputValue}
                      onChange={setInputValue}
                      onSelect={handleSelectBrawler}
                      onSubmit={() => handleSubmit()}
                      disabled={classic.isCompleted}
                      disabledBrawlers={guessedBrawlerNames}
                    />
                </AnimatedElement>

                {/* Guesses Counter */}
                <div className="flex justify-center mb-4">
                  <div className="daily-mode-guess-counter flex items-center">
                    <span className="font-bold text-lg mr-1">#</span>
                    <div className="font-bold text-lg">
                      <SlidingNumber value={classic.guessCount} />
                    </div>
                    <span className="text-white/90 ml-1">{t('guesses.count')}</span>
                  </div>
                </div>

                {/* Detailed Attribute Comparison Grid */}
                {guesses.length > 0 && (
                  <div className="mt-8">
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="grid grid-cols-6 gap-2 text-center text-white/60 text-sm font-medium mb-2">
                        <div className="border-b border-white/20 pb-1">{t('attribute.label.brawler')}</div>
                        <div className="border-b border-white/20 pb-1">{t('attribute.label.rarity')}</div>
                        <div className="border-b border-white/20 pb-1">{t('attribute.label.class')}</div>
                        <div className="border-b border-white/20 pb-1">{t('attribute.label.range')}</div>
                        <div className="border-b border-white/20 pb-1 text-[10px]">{t('attribute.label.wallbreak')}</div>
                        <div className="border-b border-white/20 pb-1">{t('attribute.label.year')}</div>
                      </div>
                      
                      {/* Guess Rows */}
                      <AnimatePresence initial={false}>
                        {guesses.map((guess, index) => (
                          <motion.div
                            key={`${guess.name}-${index}`}
                            initial={motionOK ? { opacity: 0, y: 8, x: isRTL ? 8 : -8 } : { opacity: 0 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              x: 0,
                              transition: { ...transition, delay: motionOK ? Math.min(index * 0.04, 0.3) : 0 },
                            }}
                            exit={{ opacity: 0, y: -4, x: 0, transition }}
                            layout
                          >
                            <BrawlerGuessRow
                              guess={guess}
                              correctAnswer={getCorrectBrawler()}
                              isMobile={window.innerWidth < 768}
                              gridTemplateClass="grid-cols-6"
                              isNew={index === 0}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Yesterday's Brawler */}
                {yesterdayData && (
                  <AnimatedElement type="slideUp" delay={0.3} className="flex justify-center mt-4">
                    <span className="text-sm text-white/80">
                      {t('daily.yesterday.classic')}{' '}
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={yesterdayData.brawler}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, transition }}
                          exit={{ opacity: 0, transition }}
                          className="text-[hsl(var(--daily-mode-primary))] font-medium"
                        >
                          {getBrawlerLocalizedName(yesterdayData.brawler || 'Mico', currentLanguage)}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </AnimatedElement>
                )}

                {/* Next Brawler In Timer - moved below yesterday's */}
                <div className="flex justify-center mt-3">
                  <div className="flex flex-col items-center text-white/90 px-3">
                    <span className="text-xs text-white/90 font-medium uppercase tracking-wide">{t('daily.next.brawler.in')}</span>
                    <span className="font-mono text-white font-bold text-xl">
                      {formatTime(timeUntilNext)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyClassicModeContent;
