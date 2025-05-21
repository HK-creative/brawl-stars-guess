import React, { useEffect, useState, useRef } from 'react';
import { GameModeCardButton, modeIcons, modeColors, modeCardBackgrounds, modeDisplayNames, modePreviewImages } from './GameModeCard';
import Image from '@/components/ui/image';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { useStreak, GameModeCompletion } from '@/contexts/StreakContext';
import { Flame, Heart } from 'lucide-react';
import AuthButton from '@/components/ui/auth-button';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface TimerObject {
  hours: number;
  minutes: number;
  seconds: number;
}

interface VictorySectionProps {
  brawlerName: string;
  brawlerPortrait: string;
  tries: number;
  mode?: keyof GameModeCompletion;
  nextModeKey: string;
  onNextMode: () => void;
  nextBrawlerIn?: string | TimerObject;
  yesterdayBrawlerName?: string;
  yesterdayBrawlerPortrait?: string;
  yesterdayLabel?: string;
  onShare?: () => void;
}

const VictorySection: React.FC<VictorySectionProps> = ({
  brawlerName,
  brawlerPortrait,
  tries,
  mode,
  nextModeKey,
  onNextMode,
  nextBrawlerIn,
  yesterdayBrawlerName,
  yesterdayBrawlerPortrait,
  yesterdayLabel = "Yesterday's Brawler",
  onShare,
}) => {
  const { streak, markModeCompleted, isLoggedIn, login, loading } = useStreak();
  const [showStreak, setShowStreak] = useState(false);
  const [streakIncremented, setStreakIncremented] = useState(false);
  const modeCompletedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only run this once per component mount
    if (!modeCompletedRef.current && mode && !showStreak) {
      const validModes = ['classic', 'starpower', 'gadget', 'audio'];
      
      const handleModeCompletion = async () => {
        if (validModes.includes(mode)) {
          try {
            await markModeCompleted(mode as keyof GameModeCompletion);
            modeCompletedRef.current = true;
            setStreakIncremented(true);
            setShowStreak(true);
            setTimeout(() => setStreakIncremented(false), 2000);
          } catch (error) {
            console.error("Error marking mode as completed:", error);
            // Show streak anyway if there's an error
            setShowStreak(true);
          }
        } else {
          setShowStreak(true);
        }
      };
      
      // Add a small delay to ensure stable rendering before state updates
      const timer = setTimeout(handleModeCompletion, 100);
      return () => clearTimeout(timer);
    }
  }, [mode, markModeCompleted, showStreak]);

  const handlePlaySurvival = () => {
    navigate('/survival');
  };

  return (
    <section
      className="w-full max-w-xl mx-auto mb-4 rounded-3xl shadow-2xl flex flex-col items-center gap-4 p-6 border-2 border-white/20 bg-white/10 backdrop-blur-md"
      style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.45)' }}
    >
      {/* Victory message */}
      <div className="flex flex-col items-center w-full">
        <span className="text-4xl md:text-5xl font-extrabold text-brawl-yellow text-center mb-2 tracking-wide drop-shadow-lg" style={{ letterSpacing: '2px', WebkitTextStroke: '2px #222' }}>
          VICTORY!
        </span>
      </div>
      {/* Streak Badge */}
      {showStreak && (
        <div className="flex items-center gap-2 mb-2 animate-fade-in-down">
          <span className="flex items-center px-3 py-1 rounded-full bg-yellow-100/80 border border-yellow-400 text-yellow-900 font-semibold text-lg shadow-sm animate-bounce">
            <Flame className="w-5 h-5 mr-1 text-orange-500 animate-pulse" />
            {loading ? '...' : streak}
            {streakIncremented && <span className="ml-2 text-brawl-green font-bold animate-pop">+1</span>}
          </span>
          <span className="text-xs text-yellow-900/80 font-medium ml-1">Streak!</span>
        </div>
      )}
      {/* Brawler Portrait */}
      <div className="flex flex-col items-center mb-2">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-brawl-yellow shadow-xl bg-[#181c3a]/80 flex items-center justify-center mb-2 relative">
          <Image
            src={brawlerPortrait}
            alt={brawlerName}
            imageType="portrait"
            className="w-full h-full object-cover rounded-2xl shadow-lg"
          />
          <div className="absolute inset-0 rounded-2xl border-4 border-brawl-yellow" style={{ boxShadow: '0 0 32px 8px #ffe06644' }} />
        </div>
        <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide mb-1" style={{ WebkitTextStroke: '1px #222' }}>
          {brawlerName}
        </div>
      </div>
      {/* Tries */}
      <div className="text-lg md:text-xl font-semibold text-white mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
        Number of tries: <span className="text-brawl-yellow font-extrabold">{tries}</span>
      </div>
      {/* Buttons */}
      <div className="flex flex-row justify-center gap-4 mt-2 mb-2 w-full">
        {onShare && (
          <button
            onClick={onShare}
            className="bg-brawl-blue hover:bg-brawl-blue/90 text-white text-lg font-bold px-6 py-2 rounded-xl shadow-md flex items-center gap-2 transition-all duration-150"
          >
            Share
          </button>
        )}
        <button
          onClick={handlePlaySurvival}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-bold px-6 py-2 rounded-xl shadow-md flex items-center gap-2 transition-all duration-150"
        >
          <Heart className="w-5 h-5" /> Survival Mode
        </button>
      </div>
      {/* Next Game Mode Card */}
      <div className="w-full flex flex-col items-center gap-2 mt-2">
        <div className="text-white text-base md:text-lg font-bold mb-1">Next Game Mode:</div>
        <GameModeCardButton
          title={modeDisplayNames[nextModeKey] || nextModeKey}
          icon={modeIcons[nextModeKey]}
          bgColor={modeColors[nextModeKey]}
          cardBackground={modeCardBackgrounds[nextModeKey]}
          previewImage={modePreviewImages[nextModeKey]}
          onClick={onNextMode}
          className="max-w-xs w-full"
        />
      </div>

      {/* Auth Buttons: Relocated and Redesigned */}
      {!isLoggedIn && (
        <div className="mt-6 w-full flex flex-col items-center gap-3 animate-fade-in border-t border-white/10 pt-6">
          <span className="text-lg text-brawl-yellow font-bold text-center">First time here or returning?</span>
          <p className="text-sm text-white/70 text-center -mt-2 mb-2">Save your streak and join the leaderboard!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm">
            {/* Sign Up Button (Emphasized) */}
            <AuthButton 
              showSignUp={true} 
              variant="default" 
              size="lg" 
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-brawl-green to-green-500 hover:from-brawl-green/90 hover:to-green-500/90 text-white font-bold shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300 py-3 text-base tracking-wide"
              hideSubtext={true}
            />
            {/* Log In Button (Less emphasized) */}
            <AuthButton 
              variant="outline" 
              size="default" 
              className="w-full sm:w-auto flex-1 border-white/30 hover:bg-white/10 text-white/80 py-3 text-base"
            />
          </div>
        </div>
      )}

      {/* Next Brawler Timer */}
      {nextBrawlerIn ? (
        typeof nextBrawlerIn === 'object' ? (
          <div className="text-white text-base md:text-lg font-bold mt-4 mb-2 flex items-center gap-2">
            Next brawler in:
            <span className="text-brawl-yellow font-bold flex items-center gap-1">
              <SlidingNumber value={(nextBrawlerIn as TimerObject).hours} padStart />
              <span>h</span>
              <SlidingNumber value={(nextBrawlerIn as TimerObject).minutes} padStart />
              <span>m</span>
              <SlidingNumber value={(nextBrawlerIn as TimerObject).seconds} padStart />
              <span>s</span>
            </span>
          </div>
        ) : (
          <div className="text-white text-base md:text-lg font-bold mt-4 mb-2">
            Next brawler in: <span className="text-brawl-yellow font-bold">{nextBrawlerIn.toString()}</span>
          </div>
        )
      ) : null}
    </section>
  );
};

export default VictorySection; 