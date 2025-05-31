
'use client';

import React, { useState, useEffect } from 'react';
import type { Class, Student, Evaluation, EvaluationType, StudentAssignmentData } from '@/types';
import { EVALUATION_TYPES } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { ClipboardCheck, BookOpen, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface GradesTabProps {
  currentClass: Class | null;
  onAddEvaluation: (evaluationData: { name: string; type: EvaluationType; dueDate: string }) => void;
  onUpdateGrade: (studentId: string, evaluationId: string, value: number | undefined) => void;
}

const evaluationSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  type: z.enum(EVALUATION_TYPES as [EvaluationType, ...EvaluationType[]], {
    required_error: "Debes seleccionar un tipo de evaluación."
  }),
  dueDate: z.string().refine((date) => !!date, { message: "La fecha de entrega es obligatoria." }),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;


const calculateAverage = (assignmentData: Student['assignmentData'] | undefined, evaluations: Evaluation[]): string => {
  if (!assignmentData || !evaluations || evaluations.length === 0) return 'N/A';
  
  const validGrades = evaluations
    .map(evaluation => assignmentData[evaluation.id]?.grade)
    .filter(g => typeof g === 'number' && !isNaN(g)) as number[];
    
  if (validGrades.length === 0) return 'N/A';
  const sum = validGrades.reduce((acc, curr) => acc + curr, 0);
  return (sum / validGrades.length).toFixed(2);
};

const GradesTab: React.FC<GradesTabProps> = ({ currentClass, onAddEvaluation, onUpdateGrade }) => {
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
        message="Por favor, selecciona una clase para ver y gestionar calificaciones."
      />
    );
  }
  
  const { students, evaluations } = currentClass;

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
          message={`Añade evaluaciones (tareas, proyectos, etc.) a la clase "${currentClass.name}" para poder asignar calificaciones.`}
          actions={<Button onClick={() => setIsModalOpen(true)} className="font-body">Añadir Primera Evaluación</Button>}
        />
      ) : students.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="w-16 h-16" />}
          title="No Hay Estudiantes en la Clase"
          message={`Añade estudiantes a la clase "${currentClass.name}" para poder asignar calificaciones.`}
        />
      ) : (
        <ScrollArea className="h-[65vh] border rounded-md">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] font-semibold text-primary/80 sticky left-0 bg-card z-10">Estudiante</TableHead>
                {evaluations.map(evaluation => (
                  <TableHead key={evaluation.id} className="text-center font-semibold text-primary/80 min-w-[150px]">
                    {evaluation.name}
                    <div className="text-xs text-muted-foreground font-normal">
                      ({evaluation.type})
                    </div>
                    <div className="text-xs text-muted-foreground font-normal">
                      Creado: {new Date(evaluation.dateCreated + 'T00:00:00Z').toLocaleDateString()}
                    </div>
                     <div className="text-xs text-muted-foreground font-normal">
                      Entrega: {new Date(evaluation.dueDate + 'T00:00:00Z').toLocaleDateString()}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-right font-semibold text-primary/80 sticky right-0 bg-card z-10 min-w-[120px]">Promedio Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: Student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">{student.name}</TableCell>
                  {evaluations.map(evaluation => (
                    <TableCell key={evaluation.id} className="text-center">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={student.assignmentData?.[evaluation.id]?.grade ?? ''}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const numValue = parseFloat(rawValue);
                          onUpdateGrade(student.id, evaluation.id, rawValue === '' ? undefined : numValue);
                        }}
                        className="max-w-[80px] mx-auto text-center"
                        placeholder="-"
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-semibold sticky right-0 bg-card z-10">
                    {calculateAverage(student.assignmentData, evaluations)}
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

interface UsersIconProps {
  className?: string;
}

// Renamed to avoid conflict if Users from lucide-react is imported directly
const UsersIcon: React.FC<UsersIconProps> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
