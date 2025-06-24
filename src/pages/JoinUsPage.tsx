import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { t } from '@/lib/i18n';

const JoinUsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Join Our Community
          </h1>
          
          <p className="text-slate-300 mb-6">
            Connect with other Brawl Stars fans! Community features are coming soon.
          </p>
          
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinUsPage; 