import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDailyStore, DailyGameMode } from '@/stores/useDailyStore';
import usePageTitle from '@/hooks/usePageTitle';
import { t } from '@/lib/i18n';
import RotatingBackground from '@/components/layout/RotatingBackground';
import DailyModeTransitionOrchestrator from '@/components/layout/DailyModeTransitionOrchestrator';
import DailySharedHeader from '@/components/layout/DailySharedHeader';

// Import all mode content components
import DailyClassicModeContent from './daily/DailyClassicModeContent';
import DailyGadgetModeContent from './daily/DailyGadgetModeContent';
import DailyStarPowerModeContent from './daily/DailyStarPowerModeContent';
import DailyAudioModeContent from './daily/DailyAudioModeContent';
import DailyPixelsModeContent from './daily/DailyPixelsModeContent';

const DailyModesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { initializeDailyModes } = useDailyStore();
  
  // Determine current mode from URL
  const getCurrentModeFromUrl = (): DailyGameMode => {
    // Check query parameter first (?mode=classic)
    const modeParam = searchParams.get('mode') as DailyGameMode;
    if (modeParam && ['classic', 'gadget', 'starpower', 'audio', 'pixels'].includes(modeParam)) {
      return modeParam;
    }
    
    // Default to classic
    return 'classic';
  };
  
  const [currentMode, setCurrentMode] = useState<DailyGameMode>(getCurrentModeFromUrl);
  
  // Set browser tab title based on current mode (i18n Option A)
  usePageTitle(`${t(`mode.${currentMode}.title`)} | ${t('label.daily_challenge')}`);
  
  // Initialize daily modes on component mount
  useEffect(() => {
    initializeDailyModes();
  }, [initializeDailyModes]);
  
  // Update mode when URL changes
  useEffect(() => {
    const newMode = getCurrentModeFromUrl();
    if (newMode !== currentMode) {
      setCurrentMode(newMode);
    }
  }, [searchParams, currentMode]);
  
  // Handle mode changes
  const handleModeChange = (mode: DailyGameMode) => {
    if (mode !== currentMode) {
      setCurrentMode(mode);
      
      // Update URL with query parameter
      setSearchParams({ mode });
    }
  };
  
  // React Router will update searchParams on back/forward; no manual popstate handling needed
  
  // Render the appropriate mode content
  const renderModeContent = () => {
    switch (currentMode) {
      case 'classic':
        return <DailyClassicModeContent onModeChange={handleModeChange} suppressHeader />;
      case 'gadget':
        return <DailyGadgetModeContent onModeChange={handleModeChange} suppressHeader />;
      case 'starpower':
        return <DailyStarPowerModeContent onModeChange={handleModeChange} suppressHeader />;
      case 'audio':
        return <DailyAudioModeContent onModeChange={handleModeChange} suppressHeader />;
      case 'pixels':
        return <DailyPixelsModeContent onModeChange={handleModeChange} suppressHeader />;
      default:
        return <DailyClassicModeContent onModeChange={handleModeChange} suppressHeader />;
    }
  };
  
  return (
    <div className="daily-mode-container">
      <RotatingBackground />

      {/* Shared header stays mounted and static across mode switches */}
      <DailySharedHeader currentMode={currentMode} onModeChange={handleModeChange} />

      <DailyModeTransitionOrchestrator modeKey={currentMode} className="daily-mode-content-container" axis="x" disabled>
        {renderModeContent()}
      </DailyModeTransitionOrchestrator>
    </div>
  );
};

export default DailyModesPage;
