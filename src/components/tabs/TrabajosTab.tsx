
'use client';

import React from 'react';
import type { Class, Student, Evaluation, SubmissionStatus } from '@/types';
import { SUBMISSION_STATUS_OPTIONS } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { Book, Users, ClipboardList } from 'lucide-react'; 
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrabajosTabProps {
  currentClass: Class | null;
  onUpdateGrade: (studentId: string, evaluationId: string, value: number | undefined) => void;
  onUpdateSubmissionStatus: (studentId: string, evaluationId: string, status: SubmissionStatus) => void;
}

const TrabajosTab: React.FC<TrabajosTabProps> = ({ currentClass, onUpdateGrade, onUpdateSubmissionStatus }) => {
  if (!currentClass) {
    return (
      <EmptyState
        icon={<Book className="w-16 h-16" />}
        title="Sin Clase Seleccionada"
        message="Por favor, selecciona una clase para ver y gestionar los trabajos."
      />
    );
  }

  const { students, evaluations } = currentClass;

  if (evaluations.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="w-16 h-16" />}
        title="No Hay Trabajos Definidos"
        message={`Añade evaluaciones (tareas, proyectos, etc.) en la pestaña "Calificaciones" para que aparezcan aquí.`}
      />
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-16 h-16" />}
        title="No Hay Estudiantes en la Clase"
        message={`Añade estudiantes a la clase "${currentClass.name}" para poder gestionar sus trabajos.`}
      />
    );
  }

  const studentEvaluationPairs: Array<{ student: Student; evaluation: Evaluation }> = [];
  students.forEach(student => {
    evaluations.forEach(evaluation => {
      studentEvaluationPairs.push({ student, evaluation });
    });
  });

  return (
    <div className="animate-fade-in">
      <h2 className="font-headline text-2xl text-primary mb-6 flex items-center">
        <ClipboardList className="mr-2 h-7 w-7" />
        Seguimiento de Trabajos en {currentClass.name}
      </h2>
      <ScrollArea className="h-[65vh] border rounded-md">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-primary/80 min-w-[150px] sticky left-0 bg-card z-10">Estudiante</TableHead>
              <TableHead className="font-semibold text-primary/80 min-w-[200px]">Trabajo/Tarea</TableHead>
              <TableHead className="font-semibold text-primary/80 text-center min-w-[100px]">Calificación</TableHead>
              <TableHead className="font-semibold text-primary/80 text-center min-w-[120px]">Fecha Creación</TableHead>
              <TableHead className="font-semibold text-primary/80 text-center min-w-[120px]">Fecha Entrega</TableHead>
              <TableHead className="font-semibold text-primary/80 text-center min-w-[180px] sticky right-0 bg-card z-10">Estado Entrega</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentEvaluationPairs.map(({ student, evaluation }) => {
              const assignmentEntry = student.assignmentData?.[evaluation.id];
              const currentStatus = assignmentEntry?.status || 'Pendiente';

              return (
                <TableRow key={`${student.id}-${evaluation.id}`}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">{student.name}</TableCell>
                  <TableCell>{evaluation.name} <span className="text-xs text-muted-foreground">({evaluation.type})</span></TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max="100" 
                      step="0.1"
                      value={assignmentEntry?.grade ?? ''}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const numValue = parseFloat(rawValue);
                        onUpdateGrade(student.id, evaluation.id, rawValue === '' ? undefined : numValue);
                      }}
                      className="max-w-[80px] mx-auto text-center"
                      placeholder="-"
                    />
                  </TableCell>
                  <TableCell className="text-center">{new Date(evaluation.dateCreated + 'T00:00:00').toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">{new Date(evaluation.dueDate + 'T00:00:00').toLocaleDateString()}</TableCell>
                  <TableCell className="text-center sticky right-0 bg-card z-10">
                    <Select
                      value={currentStatus}
                      onValueChange={(status) => onUpdateSubmissionStatus(student.id, evaluation.id, status as SubmissionStatus)}
                    >
                      <SelectTrigger className="w-[160px] mx-auto">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBMISSION_STATUS_OPTIONS.map(statusOption => (
                          <SelectItem key={statusOption} value={statusOption}>
                            {statusOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
       {studentEvaluationPairs.length === 0 && evaluations.length > 0 && students.length > 0 && (
         <p className="p-4 text-muted-foreground text-center">No hay trabajos asignados a estudiantes todavía.</p>
       )}
    </div>
  );
};

export default TrabajosTab;

    