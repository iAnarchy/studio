
'use client';

import React from 'react';
import type { Class } from '@/types';
import { Button } from '@/components/ui/button';
import { BookOpen, Users } from 'lucide-react'; // PlusCircle removed

interface ClassSelectorProps {
  classes: Class[];
  currentClassId: string | null;
  onSelectClass: (classId: string) => void;
  // onShowAddClassModal prop removed
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes,
  currentClassId,
  onSelectClass,
  // onShowAddClassModal removed from props
}) => {
  return (
    <div className="bg-card p-4 md:p-6 rounded-lg shadow-lg mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h3 className="font-headline text-2xl text-primary mb-2 sm:mb-0 flex items-center">
          <BookOpen className="mr-2 h-6 w-6" /> Mi Clase
        </h3>
        {/* "Nueva Clase" Button removed */}
      </div>
      {classes.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">Cargando información de la clase...</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {classes.map((cls) => (
            <Button
              key={cls.id}
              variant={currentClassId === cls.id ? 'default' : 'outline'}
              onClick={() => onSelectClass(cls.id)} // This will be a no-op or select the only class
              className={`font-body transition-all duration-300 ease-in-out transform hover:scale-105 ${
                currentClassId === cls.id 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'border-primary text-primary hover:bg-primary/10'
              }`}
              size="lg"
              // Disable button if it's not the current class, as selection is fixed
              disabled={currentClassId !== cls.id && classes.length === 1} 
            >
              {cls.name}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full flex items-center ${
                currentClassId === cls.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
              }`}>
                <Users className="h-3 w-3 mr-1"/>
                {cls.students.length}
              </span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassSelector;
