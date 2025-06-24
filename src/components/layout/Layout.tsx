import React from 'react';
import { Button } from '@/components/ui/button';
import RotatingBackground from './RotatingBackground';
import { cn } from '@/lib/utils';
import { useLocation, Outlet } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';
import Image from '@/components/ui/image';
import { useStreak } from '@/contexts/StreakContext';
import AuthButton from '@/components/ui/auth-button';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { language, changeLanguage } = useLanguage();
  const { isLoggedIn, user, logout } = useStreak();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 w-full h-full">
          <RotatingBackground />
        </div>

        {/* Auth buttons - positioned exactly like language selection but on left side - ONLY show on non-homepage */}
        {!isHomePage && (
          <div className="absolute top-2 left-4 md:top-4 md:left-1/2 md:translate-x-96 z-50">
            {!isLoggedIn ? (
              <div className="md:relative md:bg-black/10 md:backdrop-blur-sm md:rounded-xl md:border md:border-white/10 md:p-3 md:shadow-sm">
                {/* Desktop design - with text and center aligned buttons */}
                <div className="hidden md:block">
                  <div className="text-center mb-3">
                    <h3 className={cn(
                      "font-bold text-amber-100 mb-1 auth-ready-play",
                      language === 'he' ? "text-sm" : "text-lg"
                    )}>{t('auth.ready.play')}</h3>
                    <p className="text-xs text-slate-300">{t('auth.save.progress')}</p>
                  </div>
                  
                  <div className="flex justify-center gap-3">
                    <AuthButton 
                      showSignUp={true} 
                      variant="default" 
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-300" 
                      hideSubtext={true}
                    />
                    <AuthButton 
                      variant="outline" 
                      size="sm"
                      className="border-amber-400/60 text-amber-100 hover:bg-amber-500/20 hover:border-amber-300 backdrop-blur-sm" 
                      hideSubtext={true}
                    />
                  </div>
                </div>

                {/* Mobile design - simple buttons, no background container */}
                <div className="flex gap-2 md:hidden">
                  <AuthButton 
                    showSignUp={true} 
                    variant="default" 
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg text-xs px-2 py-1 rounded-full border border-yellow-400/60" 
                    hideSubtext={true}
                  />
                  <AuthButton 
                    variant="outline" 
                    size="sm"
                    className="border-amber-400/60 text-amber-100 hover:bg-amber-500/20 hover:border-amber-300 text-xs px-2 py-1 rounded-full" 
                    hideSubtext={true}
                  />
                </div>
              </div>
            ) : user && (
              <>
                {/* Desktop profile design */}
                <div className="hidden md:block relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{user.email?.split('@')[0] || 'Player'}</p>
                        <p className="text-slate-300 text-xs">Logged in</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/settings')}
                        className="text-white hover:bg-white/10 px-2 py-1 text-xs"
                      >
                        {t('settings')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleLogout}
                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300 px-2 py-1"
                      >
                        <LogOut size={12} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mobile profile design */}
                <div className="flex items-center gap-2 bg-black/60 rounded-full border border-white/30 px-2 py-1 md:hidden">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User size={10} className="text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">{user.email?.split('@')[0] || 'Player'}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-red-500/20 hover:text-red-300 p-1 h-auto"
                  >
                    <LogOut size={10} />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Language selection - ONLY show on non-homepage */}
        {!isHomePage && (
          <div className="absolute top-2 right-4 md:top-4 md:right-16 z-50 flex gap-2">
          <button
            onClick={() => changeLanguage('en')}
            className={cn(
              'rounded-full p-1 transition-all duration-200 border',
              language === 'en' 
                ? 'ring-2 ring-yellow-400 bg-black/60 border-yellow-400' 
                : 'opacity-70 hover:opacity-100 border-white/30'
            )}
            aria-label={t('aria.switch.english')}
          >
            <Image
              src="/USAIcon.png"
              alt={t('english')}
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </button>
          
          <button
            onClick={() => changeLanguage('he')}
            className={cn(
              'rounded-full p-1 transition-all duration-200 border',
              language === 'he' 
                ? 'ring-2 ring-yellow-400 bg-black/60 border-yellow-400' 
                : 'opacity-70 hover:opacity-100 border-white/30'
            )}
            aria-label={t('aria.switch.hebrew')}
          >
            <Image
              src="/IsraelIcon.png"
              alt={t('hebrew')}
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </button>
        </div>
        )}
        
        <main className={cn(
          "relative z-10 min-h-screen",
          !isHomePage ? "pt-8 px-4" : "",
            "overflow-visible"
          )}>
          {children || <Outlet />}
        </main>
      </div>
  );
};

export default Layout;
