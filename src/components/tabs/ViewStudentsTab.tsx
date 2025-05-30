'use client';

import React from 'react';
import type { Class, Student as StudentType } from '@/types';
import StudentCard from '@/components/student/StudentCard';
import EmptyState from '@/components/ui/EmptyState';
import { Users, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewStudentsTabProps {
  currentClass: Class | null;
  onRemoveStudent: (studentId: string) => void;
}

const ViewStudentsTab: React.FC<ViewStudentsTabProps> = ({ currentClass, onRemoveStudent }) => {
  if (!currentClass) {
    return (
      <EmptyState
        icon={<BookOpen className="w-16 h-16" />}
        title="Sin Clase Seleccionada"
        message="Por favor, selecciona o crea una clase para ver sus estudiantes."
      />
    );
  }

  if (currentClass.students.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-16 h-16" />}
        title="No Hay Estudiantes Registrados"
        message={`Añade estudiantes a la clase "${currentClass.name}" para verlos aquí.`}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="font-headline text-2xl text-primary mb-6 flex items-center">
        <Users className="mr-2 h-7 w-7" />
        Lista de Estudiantes en {currentClass.name}
      </h2>
      <ScrollArea className="h-[calc(100vh-380px)] pr-3"> {/* Adjust height as needed */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {currentClass.students.map((student: StudentType) => (
            <StudentCard
              key={student.id}
              student={student}
              onRemoveStudent={onRemoveStudent}
              isViewingStudents={true}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ViewStudentsTab;
