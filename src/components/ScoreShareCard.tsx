import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Download, Copy, Check, Trophy, X } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { getPortrait, DEFAULT_PORTRAIT } from '@/lib/image-helpers';
import Image from '@/components/ui/image';
import { cn } from '@/lib/utils';

export interface ScoreShareCardProps {
  mode: ShareResultModalMode;
  success: boolean;
  attempts: number;
  maxAttempts: number;
  guessHistory?: boolean[];
  brawlerName?: string;
}

// Mode-specific icons and colors
const modeConfig = {
  classic: { icon: '🎯', color: 'from-blue-500/20 to-blue-600/30', borderColor: 'border-blue-500/30' },
  audio: { icon: '🔊', color: 'from-purple-500/20 to-purple-600/30', borderColor: 'border-purple-500/30' },
  gadget: { icon: '🧩', color: 'from-yellow-500/20 to-yellow-600/30', borderColor: 'border-yellow-500/30' },
  starpower: { icon: '⭐', color: 'from-green-500/20 to-green-600/30', borderColor: 'border-green-500/30' },
  voice: { icon: '💬', color: 'from-red-500/20 to-red-600/30', borderColor: 'border-red-500/30' },
  endless: { icon: '♾️', color: 'from-blue-500/20 to-blue-600/30', borderColor: 'border-blue-500/30' },
};

// Mode names for display
const modeNames = {
  classic: 'Classic Mode',
  audio: 'Audio Mode',
  gadget: 'Gadget Mode',
  starpower: 'Star Power Mode',
  voice: 'Voice Mode',
  endless: 'Endless Mode',
};

const ScoreShareCard = ({
  mode,
  success,
  attempts,
  maxAttempts,
  guessHistory = [],
  brawlerName
}: ScoreShareCardProps) => {
  
  const [copied, setCopied] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  
  // Generate share text
  const generateShareText = () => {
    if (success) {
      return `I guessed ${brawlerName ? brawlerName : "today's Brawldle"} in ${attempts} ${attempts === 1 ? 'try' : 'tries'}! #Brawldle #BrawlStars`;
    } else {
      return `I couldn't guess ${brawlerName ? brawlerName : "today's Brawldle"}! #Brawldle #BrawlStars`;
    }
  };
  
  // Create squares to represent guesses
  const renderGuessSquares = () => {
    const squares = [];
    
    // If we have a guess history, use it
    if (guessHistory.length > 0) {
      for (let i = 0; i < guessHistory.length; i++) {
        squares.push(
          <div 
            key={i}
            className={cn(
              "w-6 h-6 rounded m-0.5 transform transition-all duration-300",
              "animate-scale",
              "shadow-lg",
              guessHistory[i] 
                ? "bg-gradient-to-br from-green-500 to-green-600" 
                : "bg-gradient-to-br from-red-500 to-red-600",
              "hover:scale-110"
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        );
      }
    } 
    // Otherwise, generate based on attempts and success
    else {
      // For correct guesses
      for (let i = 0; i < attempts; i++) {
        // Only the last attempt is green if successful, others are red
        const isCorrect = success && i === attempts - 1;
        squares.push(
          <div 
            key={i}
            className={cn(
              "w-6 h-6 rounded m-0.5 transform transition-all duration-300",
              "animate-scale shadow-lg",
              isCorrect 
                ? "bg-gradient-to-br from-green-500 to-green-600" 
                : "bg-gradient-to-br from-red-500 to-red-600",
              "hover:scale-110"
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        );
      }
      
      // Add gray squares for unused attempts
      for (let i = attempts; i < maxAttempts; i++) {
        squares.push(
          <div 
            key={i + attempts}
            className={cn(
              "w-6 h-6 rounded m-0.5",
              "bg-gradient-to-br from-gray-600/50 to-gray-700/50",
              "animate-scale",
              "shadow-inner"
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        );
      }
    }
    
    return squares;
  };
  
  const generateImage = async () => {
    if (shareCardRef.current) {
      try {
        const canvas = await html2canvas(shareCardRef.current, {
          backgroundColor: null,
          scale: 2, // Higher quality
        });
        
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error("Error generating image:", error);
        toast.error("Could not generate share image");
        return null;
      }
    }
    return null;
  };
  
  const handleCopyImage = async () => {
    const imageData = await generateImage();
    if (!imageData) return;
    
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Copy to clipboard using Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      toast.success("Image copied to clipboard!");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying image:", error);
      
      // Fallback: Copy share text instead
      const shareText = generateShareText();
      navigator.clipboard.writeText(shareText);
      toast.info("Image copy failed. Share text copied instead!");
    }
  };
  
  const handleDownloadImage = async () => {
    const imageData = await generateImage();
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `brawldle-${mode}-result.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Image downloaded!");
  };

  // Get portrait image path
  let portraitPath = DEFAULT_PORTRAIT;
  if (brawlerName) {
    portraitPath = getPortrait(brawlerName);
    console.log(`ScoreShareCard: Portrait path for ${brawlerName}:`, portraitPath);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px]">
      <div
        ref={shareCardRef}
        className={cn(
          "relative w-full max-w-lg mx-auto p-8 rounded-3xl border-4 border-[#2a2f6a] shadow-2xl overflow-hidden",
          "bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9]"
        )}
        id="score-share-card"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <span
            className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide mb-2"
            style={{ WebkitTextStroke: '2px #222', letterSpacing: '2px' }}
          >
            {success ? 'VICTORY!' : 'GAME OVER!'}
          </span>
        </div>

        {/* Brawler Portrait */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-brawl-yellow shadow-xl bg-[#181c3a] flex items-center justify-center mb-2">
            <Image
              src={portraitPath}
              alt={brawlerName}
              fallbackSrc={DEFAULT_PORTRAIT}
              imageType="portrait"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          {brawlerName && (
            <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide mb-1" style={{ WebkitTextStroke: '1px #222' }}>
              You guessed <span className="text-brawl-yellow">{brawlerName.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col items-center mb-6">
          <div className="text-lg md:text-xl font-semibold text-white mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            Number of tries: <span className="text-brawl-yellow font-extrabold">{attempts}</span>
          </div>
          {/* Placeholder for average tries, replace with prop if available */}
          {typeof (window as any).brawldleAverageTries !== 'undefined' && (
            <div className="text-base text-white/90">
              Average # of tries today: <span className="text-brawl-blue font-bold">{(window as any).brawldleAverageTries}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-row justify-center gap-4 mt-2 mb-2">
          <Button
            variant="secondary"
            className="bg-brawl-blue hover:bg-brawl-blue/90 text-white text-lg font-bold px-6 py-2 rounded-xl shadow-md flex items-center gap-2"
            onClick={handleCopyImage}
          >
            {copied ? <Check className="w-5 h-5" /> : <Share className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Share'}
          </Button>
          <Button
            variant="secondary"
            className="bg-brawl-yellow hover:bg-brawl-yellow/90 text-black text-lg font-bold px-6 py-2 rounded-xl shadow-md flex items-center gap-2"
            onClick={handleDownloadImage}
          >
            <Download className="w-5 h-5" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScoreShareCard;
