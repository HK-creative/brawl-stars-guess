
import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TopBar = () => {
  return (
    <div className="sticky top-0 z-10 w-full px-4 py-3 bg-brawl-dark/90 backdrop-blur-md border-b border-white/10 shadow-md">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <div className="flex items-center">
          <Link to="/" className="font-bold text-2xl text-brawl-yellow">
            Brawldle
          </Link>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild className="rounded-full text-white/80 hover:text-white hover:bg-white/10">
            <Link to="/settings">
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-white/80 hover:text-white hover:bg-white/10">
            <HelpCircle className="w-5 h-5" />
            <span className="sr-only">Help</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
