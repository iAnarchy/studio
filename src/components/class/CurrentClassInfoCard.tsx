import React from 'react';
import type { Class } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, Info } from 'lucide-react';

interface CurrentClassInfoCardProps {
  currentClass: Class | null;
}

const CurrentClassInfoCard: React.FC<CurrentClassInfoCardProps> = ({ currentClass }) => {
  if (!currentClass) {
    return null; // Or a placeholder if preferred when no class is selected
  }

  return (
    <Card className="mb-6 shadow-md border-l-4 border-primary">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <BookOpen className="mr-2 h-6 w-6" />
          {currentClass.name}
        </CardTitle>
        <CardDescription className="font-body">Información de la clase actual</CardDescription>
      </CardHeader>
      <CardContent className="font-body space-y-2">
        <p className="flex items-center">
          <Info className="mr-2 h-5 w-5 text-muted-foreground" />
          <strong>Materia:</strong> {currentClass.subject}
        </p>
        <p className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-muted-foreground" />
          <strong>Estudiantes:</strong> {currentClass.students.length}
        </p>
        {currentClass.description && (
          <p className="flex items-start">
            <Info className="mr-2 h-5 w-5 text-muted-foreground mt-1 shrink-0" />
            <strong>Descripción:</strong> {currentClass.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentClassInfoCard;
