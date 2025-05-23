import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/stores/useSurvivalStore';
import { Image, Volume2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SurvivalModeSelectionPopupProps {
  availableModes: GameMode[];
  onSelectMode: (mode: GameMode) => void;
}

// Define GameMode details for UI with icons
const gameModeDetails: { id: GameMode; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { 
    id: 'classic', 
    label: 'Classic', 
    description: 'Guess the Brawler from their image.', 
    icon: <Image className="h-6 w-6" />,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'gadget', 
    label: 'Gadget', 
    description: 'Guess the Brawler from their Gadget icon.', 
    icon: <Zap className="h-6 w-6" />,
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'starpower', 
    label: 'Star Power', 
    description: 'Guess the Brawler from their Star Power icon.', 
    icon: <div className="h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center"><div className="h-2 w-2 bg-yellow-600 rounded-full"></div></div>,
    color: 'from-yellow-500 to-yellow-600'
  },
  { 
    id: 'audio', 
    label: 'Audio', 
    description: 'Guess the Brawler from their voice line or attack sound.', 
    icon: <Volume2 className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-600'
  },
];

const SurvivalModeSelectionPopup: React.FC<SurvivalModeSelectionPopupProps> = ({
  availableModes,
  onSelectMode
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/10 p-6 max-w-lg w-full shadow-2xl flex flex-col items-center animate-slide-up">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Choose Game Mode</h2>
        <p className="text-white/70 text-center mb-6">Select which mode you want to play next</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-4">
          {gameModeDetails
            .filter(mode => availableModes.includes(mode.id))
            .map(mode => (
              <Button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={cn(
                  "h-auto py-4 flex flex-col items-center justify-center text-white font-bold",
                  "bg-gradient-to-r",
                  mode.color,
                  "hover:opacity-90 transition-all"
                )}
              >
                <div className="flex items-center justify-center h-12 w-12 bg-white/20 rounded-full mb-2">
                  {mode.icon}
                </div>
                <span className="text-lg">{mode.label}</span>
                <span className="text-xs text-white/80 font-normal mt-1">{mode.description}</span>
              </Button>
            ))}
        </div>
        
        {/* Description of how to play */}
        <div className="bg-black/30 rounded-lg p-3 w-full">
          <p className="text-white/90 text-sm leading-relaxed">
            In Survival Mode, each round lets you choose a different game mode. Use your guesses wisely - they're limited across all rounds!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SurvivalModeSelectionPopup;
