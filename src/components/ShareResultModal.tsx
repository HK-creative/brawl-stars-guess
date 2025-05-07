
import React from 'react';
import { Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ScoreShareCard, { ScoreShareCardProps } from './ScoreShareCard';

interface ShareResultModalProps extends ScoreShareCardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareResultModal = ({
  isOpen,
  onClose,
  ...scoreProps
}: ShareResultModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 animate-fade-in">
      <Card className="brawl-card p-4 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Share className="w-5 h-5" /> Share Your Result
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
        
        <ScoreShareCard {...scoreProps} />
      </Card>
    </div>
  );
};

export default ShareResultModal;
