
'use client';

import React from 'react';
import type { Class, Student, EvaluationType, GradeValues } from '@/types';
import { EVALUATION_TYPES } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import EmptyState from '@/components/ui/EmptyState';
import { ClipboardCheck, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GradesTabProps {
  currentClass: Class | null;
  onUpdateGrade: (studentId: string, evaluationType: EvaluationType, value: number | undefined) => void;
}

const calculateAverage = (grades: GradeValues): string => {
  const validGrades = Object.values(grades).filter(g => typeof g === 'number' && !isNaN(g)) as number[];
  if (validGrades.length === 0) return 'N/A';
  const sum = validGrades.reduce((acc, curr) => acc + curr, 0);
  return (sum / validGrades.length).toFixed(2);
};

const GradesTab: React.FC<GradesTabProps> = ({ currentClass, onUpdateGrade }) => {
  if (!currentClass) {
    return (
      <EmptyState
        icon={<BookOpen className="w-16 h-16" />}
        title="Sin Clase Seleccionada"
        message="Por favor, selecciona una clase para ver y gestionar calificaciones."
      />
    );
  }

  if (currentClass.students.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardCheck className="w-16 h-16" />}
        title="No Hay Estudiantes en la Clase"
        message={`Añade estudiantes a la clase "${currentClass.name}" para poder asignar calificaciones.`}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="font-headline text-2xl text-primary mb-6 flex items-center">
        <ClipboardCheck className="mr-2 h-7 w-7" />
        Calificaciones de {currentClass.name}
      </h2>
      <ScrollArea className="max-h-[calc(100vh-420px)]"> {/* Adjust height as needed */}
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] font-semibold text-primary/80 sticky left-0 bg-card z-10">Estudiante</TableHead>
              {EVALUATION_TYPES.map(type => (
                <TableHead key={type} className="text-center font-semibold text-primary/80">{type}</TableHead>
              ))}
              <TableHead className="text-right font-semibold text-primary/80 sticky right-0 bg-card z-10">Promedio Final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentClass.students.map((student: Student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium sticky left-0 bg-card z-10">{student.name}</TableCell>
                {EVALUATION_TYPES.map(type => (
                  <TableCell key={type} className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max="100" // Or your max grade
                      step="0.1" // For decimal grades
                      value={student.grades?.[type] ?? ''}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const numValue = parseFloat(rawValue);
                        onUpdateGrade(student.id, type, rawValue === '' ? undefined : numValue);
                      }}
                      className="max-w-[80px] mx-auto text-center"
                      placeholder="-"
                    />
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold sticky right-0 bg-card z-10">
                  {calculateAverage(student.grades)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default GradesTab;
