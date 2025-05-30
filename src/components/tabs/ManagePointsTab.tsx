'use client';

import React from 'react';
import type { Class, Student as StudentType } from '@/types';
import StudentCard from '@/components/student/StudentCard';
import EmptyState from '@/components/ui/EmptyState';
import { Star, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ManagePointsTabProps {
  currentClass: Class | null;
  onUpdatePoints: (studentId: string, pointsToAdd: number) => void;
  onResetPoints: (studentId: string) => void;
}

const ManagePointsTab: React.FC<ManagePointsTabProps> = ({ currentClass, onUpdatePoints, onResetPoints }) => {
  if (!currentClass) {
    return (
       <EmptyState
        icon={<BookOpen className="w-16 h-16" />}
        title="Sin Clase Seleccionada"
        message="Por favor, selecciona o crea una clase para gestionar los puntos de los estudiantes."
      />
    );
  }

  if (currentClass.students.length === 0) {
    return (
      <EmptyState
        icon={<Star className="w-16 h-16" />}
        title="No Hay Estudiantes para Gestionar"
        message={`Añade estudiantes a la clase "${currentClass.name}" para poder gestionar sus puntos.`}
      />
    );
  }
  
  return (
    <div className="animate-fade-in">
      <h2 className="font-headline text-2xl text-primary mb-6 flex items-center">
        <Star className="mr-2 h-7 w-7 text-yellow-500" />
        Gestionar Puntos en {currentClass.name}
      </h2>
      <ScrollArea className="h-[calc(100vh-380px)] pr-3"> {/* Adjust height as needed */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {currentClass.students.map((student: StudentType) => (
            <StudentCard
              key={student.id}
              student={student}
              onUpdatePoints={onUpdatePoints}
              onResetPoints={onResetPoints}
              isManagingPoints={true}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ManagePointsTab;
