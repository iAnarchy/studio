'use client';

import React from 'react';
import type { Class } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import EmptyState from '@/components/ui/EmptyState';
import { UserPlus, BookOpen } from 'lucide-react';
import StudentForm, { type StudentFormData } from '@/components/student/StudentForm';

interface AddStudentTabProps {
  currentClass: Class | null;
  onAddStudent: (studentData: StudentFormData) => void;
  isLoading: boolean;
}

const AddStudentTab: React.FC<AddStudentTabProps> = ({ currentClass, onAddStudent, isLoading }) => {
  if (!currentClass) {
    return (
      <EmptyState
        icon={<BookOpen className="w-16 h-16" />}
        title="Sin Clase Seleccionada"
        message="Por favor, selecciona o crea una clase para añadir estudiantes."
      />
    );
  }

  return (
    <Card className="shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center">
          <UserPlus className="mr-2 h-6 w-6" />
          Añadir Nuevo Estudiante
        </CardTitle>
        <CardDescription className="font-body">
          Añade un estudiante a la clase: {currentClass.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StudentForm onSubmit={onAddStudent} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

export default AddStudentTab;
