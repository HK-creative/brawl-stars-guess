
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/i18n';

const SettingsPage = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div>
      <h1 className="text-3xl font-bold text-brawl-yellow text-center mb-6">
        {t('settings')}
      </h1>
      
      <Card className="brawl-card mb-6">
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">{t('language')}</h2>
          
          <div className="flex flex-col space-y-2">
            <Button 
              className={`brawl-button-outline ${language === 'en' ? 'bg-white/20' : ''}`}
              onClick={() => changeLanguage('en')}
            >
              {t('english')}
            </Button>
            <Button 
              className={`brawl-button-outline ${language === 'he' ? 'bg-white/20' : ''}`}
              onClick={() => changeLanguage('he')}
            >
              {t('hebrew')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
