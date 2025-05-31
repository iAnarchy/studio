
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Archive, ClipboardCheck, BookOpen, Users, CalendarDays } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const calculateAverage = (student: Student, evaluations: Evaluation[]): string => {
    let totalPoints = 0;
    let count = 0;
    evaluations.forEach(evaluation => {
      const grade = student.assignmentData?.[evaluation.id]?.grade;
      if (typeof grade === 'number' && !isNaN(grade)) {
        totalPoints += grade;
        count++;
      }
    });
    return count > 0 ? (totalPoints / count).toFixed(2) : 'N/A';
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="font-headline text-2xl text-primary flex items-center">
          <ClipboardCheck className="mr-2 h-7 w-7" />
          Calificaciones en {currentClass.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="font-body bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Nueva Evaluación
        </Button>
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={<Users className="w-16 h-16" />}
          title="No Hay Estudiantes"
          message={`Añade estudiantes a la clase "${currentClass.name}" para poder registrar calificaciones.`}
        />
      ) : evaluations.length === 0 ? (
         <EmptyState
          icon={<Archive className="w-16 h-16" />}
          title="No Hay Evaluaciones Definidas"
          message={`Aún no se han añadido evaluaciones a la clase "${currentClass.name}".`}
          actions={<Button onClick={() => setIsModalOpen(true)} className="font-body">Añadir Primera Evaluación</Button>}
        />
      ) : (
        <ScrollArea className="h-[65vh] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-primary/80 min-w-[200px] sticky left-0 bg-card z-10">Estudiante</TableHead>
                {evaluations.map(evaluation => (
                  <TableHead key={evaluation.id} className="font-semibold text-primary/80 min-w-[220px] text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{evaluation.name}</span>
                      <span className="text-xs text-muted-foreground">({evaluation.type})</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3"/> 
                        Entrega: {new Date(evaluation.dueDate + 'T00:00:00').toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                      </span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="font-semibold text-primary/80 min-w-[120px] text-center sticky right-0 bg-card z-10">Promedio Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">{student.name}</TableCell>
                  {evaluations.map(evaluation => {
                    const assignmentEntry = student.assignmentData?.[evaluation.id];
                    return (
                      <TableCell key={evaluation.id} className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max="100" // Assuming a 0-100 scale
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
                    );
                  })}
                  <TableCell className="font-bold text-center sticky right-0 bg-card z-10">{calculateAverage(student, evaluations)}</TableCell>
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
    
