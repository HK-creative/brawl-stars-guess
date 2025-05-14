
import React, { useState } from 'react';
import { Share, X, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ScoreShareCard, { ScoreShareCardProps } from './ScoreShareCard';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ShareResultModalProps extends ScoreShareCardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareResultModal = ({
  isOpen,
  onClose,
  ...scoreProps
}: ShareResultModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  if (!isOpen) return null;
  
  const handleCopyToClipboard = async () => {
    setIsGenerating(true);
    try {
      const scoreCard = document.getElementById('score-share-card');
      if (!scoreCard) {
        toast.error("Could not find the score card element.");
        return;
      }
      
      const canvas = await html2canvas(scoreCard, {
        backgroundColor: '#121212',
        scale: 2, // Higher quality
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate image");
          return;
        }
        
        try {
          // Add image to clipboard
          const data = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([data]);
          toast.success("Image copied to clipboard!");
        } catch (e) {
          console.error("Clipboard API error:", e);
          // Fallback for browsers that don't support clipboard API
          toast.error("Your browser doesn't support clipboard images");
          
          // Create download link as fallback
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `brawldle-result.png`;
          link.click();
        }
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const scoreCard = document.getElementById('score-share-card');
      if (!scoreCard) {
        toast.error("Could not find the score card element.");
        return;
      }
      
      const canvas = await html2canvas(scoreCard, {
        backgroundColor: '#121212',
        scale: 2, // Higher quality
      });
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `brawldle-result.png`;
      link.click();
      
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 animate-fade-in backdrop-blur-sm">
      <Card className="brawl-card p-4 w-full max-w-md mx-4 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Share className="w-5 h-5 text-brawl-blue" /> Share Your Result
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div id="score-share-card-wrapper" className="mb-4">
          <ScoreShareCard {...scoreProps} />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            className="bg-brawl-blue hover:bg-brawl-blue/90 gap-2 rounded-xl"
            onClick={handleCopyToClipboard}
            disabled={isGenerating}
          >
            <Copy className="w-4 h-4" />
            <span>{isGenerating ? "Processing..." : "Copy"}</span>
          </Button>
          <Button 
            className="bg-brawl-yellow hover:bg-brawl-yellow/90 text-black gap-2 rounded-xl"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? "Processing..." : "Download"}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ShareResultModal;
