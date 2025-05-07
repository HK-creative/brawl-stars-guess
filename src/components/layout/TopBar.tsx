
import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TopBar = () => {
  return (
    <div className="w-full flex justify-between items-center px-4 py-2 bg-black/20 backdrop-blur-sm">
      <div className="flex items-center">
        <Link to="/" className="font-bold text-2xl text-brawl-yellow">
          Brawldle
        </Link>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" asChild className="brawl-nav-button">
          <Link to="/settings">
            <Settings className="w-6 h-6" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="brawl-nav-button">
          <HelpCircle className="w-6 h-6" />
          <span className="sr-only">Help</span>
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
