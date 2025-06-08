"use client";
import React from "react";
// SparklesCore import removed as it's no longer used
import { t } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import Image from "@/components/ui/image";

export function SparklesPreview() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden pt-0 pb-2 md:pt-0 md:pb-4">
      {/* PC Layout: Language selection on left, title in center */}
      <div className="hidden md:flex md:items-center md:justify-center md:w-full md:relative md:mb-4">
        {/* Main title - centered and smaller */}
        <h1 className="md:text-5xl text-4xl lg:text-6xl font-bold text-center relative z-20 bg-gradient-to-b from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-transparent bg-clip-text animate-fade-in app-title-main">
          {t('app.title')}
        </h1>
        
        {/* Language selection - positioned to the left of title */}
        <div className="absolute ml-4 flex gap-2" style={{ left: 'calc(50% - 280px)' }}>
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
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
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
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
          </button>
        </div>
      </div>

      {/* Mobile Layout: Title only (language selection stays in Layout.tsx) */}
      <h1 className="md:hidden text-4xl font-bold text-center relative z-20 bg-gradient-to-b from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-transparent bg-clip-text animate-fade-in app-title-main">
        {t('app.title')}
      </h1>

      {/* Decorative line - Responsive spacing */}
      <div className="mt-4 mb-4 md:mt-3 md:mb-3 w-32 md:w-48 h-0.5 bg-gradient-to-r from-transparent via-[#FFA500] to-transparent animate-fade-in-delay"></div>

      {/* Subtitle - Positioned after the decorative line */}
      <h2 className={cn(
        "text-lg md:text-xl lg:text-2xl text-white/90 font-medium text-center relative z-20 animate-fade-in-delay home-subtitle",
        language === 'he' && "font-bold"
      )}>
        {t('home.ultimate.challenge')}
      </h2>

      {/* Sparkles and Gradients Container - ENTIRELY REMOVED */}
      
      {/* Description text (already removed) */}
    </div>
  );
} 