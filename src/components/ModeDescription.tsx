
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ModeDescriptionProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

const ModeDescription: React.FC<ModeDescriptionProps> = ({ 
  title, 
  description, 
  icon, 
  className = "" 
}) => {
  return (
    <Card className={`brawl-card mb-6 ${className}`}>
      <CardHeader className="pb-2 flex flex-row items-center">
        {icon && <div className="mr-2 text-2xl">{icon}</div>}
        <CardTitle className="text-xl text-brawl-yellow">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-white/80">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default ModeDescription;
