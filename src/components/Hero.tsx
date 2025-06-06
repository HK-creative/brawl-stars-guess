import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { SparklesPreview } from '@/components/ui/sparkles-preview';

const Hero: React.FC = () => {
  return (
    <section className="relative flex flex-col items-center text-center pt-16 pb-12 md:pt-24 md:pb-16">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="w-[30rem] h-[30rem] md:w-[40rem] md:h-[40rem] rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-red-500/20 blur-3xl" />
      </div>
      <SparklesPreview />
      <Link to="/daily/classic" className="mt-6 md:mt-8 z-10">
        <Button size="lg" className="px-8 py-4 text-base font-bold text-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-xl hover:from-yellow-300 hover:to-orange-400">
          {t('auth.get.started')}
        </Button>
      </Link>
    </section>
  );
};

export default Hero;
