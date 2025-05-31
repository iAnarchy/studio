
'use client';

import React, { useState, useEffect } from 'react';
import type { Class, Evaluation, EvaluationType, Student } from '@/types';
import { EVALUATION_TYPES } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { ClipboardCheck, BookOpen, PlusCircle, CalendarDays, Percent, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface GradesTabProps {
  currentClass: Class | null;
  onAddEvaluation: (evaluationData: { name: string; type: EvaluationType; dueDate: string }) => void;
  // onUpdateGrade: (studentId: string, evaluationId: string, value: number | undefined) => void; // Re-add if direct editing is needed
}

const evaluationSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  type: z.enum(EVALUATION_TYPES as [EvaluationType, ...EvaluationType[]], {
    required_error: "Debes seleccionar un tipo de evaluación."
  }),
  dueDate: z.string().refine((date) => !!date, { message: "La fecha de entrega es obligatoria." }),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  // Ensure date string is treated as UTC to avoid timezone shifts
  return new Date(dateString + 'T00:00:00Z').toLocaleDateString('es-ES', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC'
  });
};

const calculateStudentAverage = (student: Student, evaluations: Evaluation[]): string => {
  let totalScore = 0;
  let count = 0;
  evaluations.forEach(evaluation => {
    const grade = student.assignmentData?.[evaluation.id]?.grade;
    if (typeof grade === 'number' && !isNaN(grade)) {
      totalScore += grade;
      count++;
    }
  });
  return count > 0 ? (totalScore / count).toFixed(1) : 'N/A';
};

const GradesTab: React.FC<GradesTabProps> = ({ currentClass, onAddEvaluation }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      name: '',
      type: EVALUATION_TYPES[0],
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (!isModalOpen) {
      reset({
        name: '',
        type: EVALUATION_TYPES[0],
        dueDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [isModalOpen, reset]);

  const handleSaveEvaluation = (data: EvaluationFormData) => {
    onAddEvaluation(data);
    setIsModalOpen(false);
  };

  if (!currentClass) {
    return (
      <EmptyState
        icon={<BookOpen className="w-16 h-16" />}
        title="Sin Clase Seleccionada"
        message="Por favor, selecciona una clase para ver y gestionar las calificaciones."
      />
    );
  }
  
  const { evaluations, students } = currentClass;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-2xl text-primary flex items-center">
          <ClipboardCheck className="mr-2 h-7 w-7" />
          Calificaciones de {currentClass.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="font-body bg-accent text-accent-foreground hover:bg-accent/90">
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Evaluación
        </Button>
      </div>

      {evaluations.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-16 h-16" />}
          title="No Hay Evaluaciones Definidas"
          message={`Añade evaluaciones (tareas, proyectos, etc.) a la clase "${currentClass.name}" para organizar las calificaciones aquí.`}
          actions={<Button onClick={() => setIsModalOpen(true)} className="font-body">Añadir Primera Evaluación</Button>}
        />
      ) : students.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-16 h-16" />}
          title="No Hay Estudiantes en la Clase"
          message={`Añade estudiantes a la clase "${currentClass.name}" para ver sus calificaciones.`}
        />
      ) : (
        <ScrollArea className="h-[65vh] border rounded-md">
          <Table className="min-w-full"> {/* Removed table-fixed to allow auto layout */}
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 font-semibold text-primary/80 min-w-[200px]">Estudiante</TableHead>
                {evaluations.map(evaluation => (
                  <TableHead key={evaluation.id} className="font-semibold text-primary/80 min-w-[220px] text-center">
                    <div className="font-bold">{evaluation.name}</div>
                    <div className="text-xs text-muted-foreground">{evaluation.type}</div>
                    <div className="text-xs text-muted-foreground">Creado: {formatDate(evaluation.dateCreated)}</div>
                    <div className="text-xs text-muted-foreground">Entrega: {formatDate(evaluation.dueDate)}</div>
                  </TableHead>
                ))}
                <TableHead className="sticky right-0 bg-card z-10 font-semibold text-primary/80 min-w-[120px] text-center">
                  <Percent className="inline-block mr-1 h-4 w-4" />
                  Promedio Final
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">{student.name}</TableCell>
                  {evaluations.map(evaluation => {
                    const assignment = student.assignmentData?.[evaluation.id];
                    const grade = assignment?.grade;
                    return (
                      <TableCell key={`${student.id}-${evaluation.id}`} className="text-center">
                        {typeof grade === 'number' ? grade.toFixed(1) : '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="sticky right-0 bg-card z-10 font-bold text-center">
                    {calculateStudentAverage(student, evaluations)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline text-primary">Nueva Evaluación</DialogTitle>
            <DialogDescription className="font-body">
              Define una nueva tarea, actividad, proyecto o examen para la clase.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSaveEvaluation)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="eval-name" className="font-body text-foreground/80">Nombre de la Evaluación</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input id="eval-name" {...field} placeholder="Ej: Ensayo Final" className="font-body" />}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="eval-type" className="font-body text-foreground/80">Tipo</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="eval-type" className="font-body">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVALUATION_TYPES.map(type => (
                        <SelectItem key={type} value={type} className="font-body">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <Label htmlFor="eval-dueDate" className="font-body text-foreground/80">Fecha de Entrega</Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => <Input id="eval-dueDate" type="date" {...field} className="font-body" />}
              />
              {errors.dueDate && <p className="text-sm text-destructive mt-1">{errors.dueDate.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="font-body">
                Cancelar
              </Button>
              <Button type="submit" className="font-body bg-primary hover:bg-primary/90">
                Guardar Evaluación
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradesTab;
    