
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ModeDescriptionProps {
  title: string;
  description: string;
}

const ModeDescription: React.FC<ModeDescriptionProps> = ({ title, description }) => {
  return (
    <Card className="brawl-card mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-brawl-yellow">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-white/80">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default ModeDescription;
