
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Share, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { getPortrait } from '@/lib/image-helpers';
import Image from '@/components/ui/image';

export interface ScoreShareCardProps {
  mode: 'classic' | 'audio' | 'gadget' | 'starpower' | 'voice';
  success: boolean;
  attempts: number;
  maxAttempts: number;
  guessHistory?: boolean[]; // Array of guess results (true for correct, false for incorrect)
  brawlerName?: string;
}

// Mode-specific icons and colors
const modeConfig = {
  classic: { icon: '🎯', color: 'bg-brawl-blue' },
  audio: { icon: '🔊', color: 'bg-brawl-purple' },
  gadget: { icon: '🧩', color: 'bg-brawl-yellow' },
  starpower: { icon: '⭐', color: 'bg-brawl-green' },
  voice: { icon: '💬', color: 'bg-brawl-red' },
};

// Mode names for display
const modeNames = {
  classic: 'Classic Mode',
  audio: 'Audio Mode',
  gadget: 'Gadget Mode',
  starpower: 'Star Power Mode',
  voice: 'Voice Mode',
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
            className={`w-6 h-6 ${guessHistory[i] ? 'bg-brawl-green' : 'bg-brawl-red'} rounded m-0.5`}
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
            className={`w-6 h-6 ${isCorrect ? 'bg-brawl-green' : 'bg-brawl-red'} rounded m-0.5`}
          />
        );
      }
      
      // Add gray squares for unused attempts
      for (let i = attempts; i < maxAttempts; i++) {
        squares.push(
          <div 
            key={i + attempts}
            className="w-6 h-6 bg-gray-600 rounded m-0.5"
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

  return (
    <div className="flex flex-col items-center">
      {/* The card that will be captured as an image */}
      <div ref={shareCardRef} className="p-6 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brawl-dark/90 to-brawl-dark z-0"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🔥</span>
              <span className="text-xl font-bold text-brawl-yellow">Brawldle</span>
            </div>
            <div className={`px-2 py-1 rounded ${modeConfig[mode].color} text-white flex items-center`}>
              <span className="mr-1">{modeConfig[mode].icon}</span>
              <span className="text-sm font-medium">{modeNames[mode]}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className={`text-xl font-bold mb-1 ${success ? 'text-brawl-green' : 'text-brawl-red'}`}>
              {success ? 'Victory!' : 'Challenge Failed'}
            </h3>
            <p className="text-white/80">
              {success 
                ? `Guessed in ${attempts} ${attempts === 1 ? 'try' : 'tries'}`
                : `Failed after ${attempts} ${attempts === 1 ? 'try' : 'tries'}`
              }
            </p>
            {brawlerName && (
              <div className="flex items-center mt-2">
                {brawlerName && (
                  <Image
                    src={getPortrait(brawlerName)}
                    alt={brawlerName}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                )}
                <p className="text-brawl-yellow font-medium">{brawlerName}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap mb-2">
            {renderGuessSquares()}
          </div>
          
          <div className="text-white/50 text-xs mt-2">
            brawldle.com • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Controls for sharing */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          className="gap-2 bg-white/10 border-white/20 hover:bg-white/20"
          onClick={handleCopyImage}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </Button>
        
        <Button
          variant="outline" 
          className="gap-2 bg-white/10 border-white/20 hover:bg-white/20"
          onClick={handleDownloadImage}
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </Button>
      </div>
    </div>
  );
};

export default ScoreShareCard;
