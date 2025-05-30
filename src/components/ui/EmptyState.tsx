import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actions?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actions }) => {
  return (
    <Card className="shadow-lg">
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        {icon && <div className="text-primary opacity-70 mb-4">{icon}</div>}
        <h3 className="text-xl font-semibold font-headline text-primary mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        {actions && <div className="mt-2">{actions}</div>}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
