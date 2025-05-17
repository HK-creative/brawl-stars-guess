"use client";
import React from "react";
// SparklesCore import removed as it's no longer used

export function SparklesPreview() {
  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden py-4 md:py-8">
      {/* Main title with gold gradient */}
      <h1 className="md:text-7xl text-5xl lg:text-8xl font-bold text-center relative z-20 bg-gradient-to-b from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-transparent bg-clip-text animate-fade-in">
        Brawldle
      </h1>

      {/* Decorative line - Restored */}
      <div className="mt-3 mb-3 w-32 md:w-48 h-0.5 bg-gradient-to-r from-transparent via-[#FFA500] to-transparent animate-fade-in-delay"></div>

      {/* Subtitle - Positioned after the decorative line */}
      <h2 className="text-xl md:text-2xl lg:text-3xl text-white/90 font-medium text-center relative z-20 animate-fade-in-delay">
        The Ultimate Daily Brawl Stars Challenge
      </h2>

      {/* Sparkles and Gradients Container - ENTIRELY REMOVED */}
      
      {/* Description text (already removed) */}
    </div>
  );
} 