
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotLivePage = () => {
  // Features that will be added later
  const futureFeatures = [
    { name: "Leaderboard", icon: "🏆", description: "Compare your scores with other players" },
    { name: "Account", icon: "👤", description: "Save your progress across devices" },
    { name: "Achievements", icon: "🏅", description: "Earn badges for your accomplishments" },
    { name: "Custom Games", icon: "🎮", description: "Create your own Brawldle challenges" },
    { name: "Contact", icon: "✉️", description: "Get in touch with the Brawldle team" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-brawl-yellow text-center mb-6">
        Coming Soon
      </h1>
      
      <Card className="brawl-card mb-6">
        <div className="p-4 text-center">
          <div className="text-6xl mb-4 animate-pulse-glow">🚧</div>
          <h2 className="text-2xl font-bold text-white mb-2">Under Construction</h2>
          <p className="text-white/70 mb-6">
            This feature is not yet available. Check back later for updates!
          </p>
          
          <div className="space-y-4 mb-6">
            {futureFeatures.map((feature, index) => (
              <div key={index} className="flex items-center bg-white/10 p-3 rounded-lg">
                <div className="text-2xl mr-3">{feature.icon}</div>
                <div className="text-left">
                  <h3 className="font-bold text-white">{feature.name}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button asChild className="brawl-button">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotLivePage;
