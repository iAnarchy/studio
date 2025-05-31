
'use client';

import React, { useState } from 'react';
import type { Class, Student, Evaluation, SubmissionStatus, EvaluationType } from '@/types';
import { SUBMISSION_STATUS_OPTIONS, EVALUATION_TYPES } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Book, Users, ClipboardList, ListChecks, Trash2, FileText, Activity, Briefcase, CheckSquare, CalendarDays } from 'lucide-react'; 
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrabajosTabProps {
  currentClass: Class | null;
  onUpdateGrade: (studentId: string, evaluationId: string, value: number | undefined) => void;
  onUpdateSubmissionStatus: (studentId: string, evaluationId: string, status: SubmissionStatus) => void;
  onDeleteEvaluation: (evaluationId: string) => void;
}

const evaluationTypeIcons: Record<EvaluationType, React.ElementType> = {
  'Tarea': FileText,
  'Actividad': Activity,
  'Proyecto': Briefcase,
  'Examen': CheckSquare,
};

const TrabajosTab: React.FC<TrabajosTabProps> = ({ currentClass, onUpdateGrade, onUpdateSubmissionStatus, onDeleteEvaluation }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<Evaluation | null>(null);

  const openDeleteDialog = (evaluation: Evaluation) => {
    setEvaluationToDelete(evaluation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEvaluation = () => {
    if (evaluationToDelete) {
      onDeleteEvaluation(evaluationToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setEvaluationToDelete(null);
  };

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

  const studentEvaluationPairs: Array<{ student: Student; evaluation: Evaluation }> = [];
  students.forEach(student => {
    evaluations.forEach(evaluation => {
      studentEvaluationPairs.push({ student, evaluation });
    });
  });
  
  const evaluationsByType = (type: EvaluationType) => evaluations.filter(ev => ev.type === type);


  return (
    <div className="animate-fade-in space-y-8">
      {/* Section 1: Gestionar Evaluaciones Creadas */}
      <div className="mt-4">
        <h2 className="font-headline text-xl text-primary mb-4 flex items-center">
          <ListChecks className="mr-2 h-6 w-6" />
          Gestionar Evaluaciones Creadas
        </h2>
        {evaluations.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="w-12 h-12 opacity-50" />}
            title="No Hay Evaluaciones para Gestionar"
            message="Crea evaluaciones en la pestaña 'Calificaciones' para poder gestionarlas aquí."
          />
        ) : (
          <Accordion type="multiple" className="w-full space-y-2">
            {EVALUATION_TYPES.map((type) => {
              const currentTypeEvaluations = evaluationsByType(type);
              const IconComponent = evaluationTypeIcons[type];
              if (currentTypeEvaluations.length === 0) return null;

              return (
                <AccordionItem value={type} key={type}>
                  <AccordionTrigger className="bg-muted/50 hover:bg-muted px-4 py-3 rounded-md text-lg font-headline text-primary">
                    <div className="flex items-center">
                      <IconComponent className="mr-3 h-6 w-6 text-accent" />
                      {type} ({currentTypeEvaluations.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-3 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentTypeEvaluations.map((evaluation) => (
                        <Card key={evaluation.id} className="shadow-sm border-l-4 border-accent">
                          <CardHeader className="pb-2">
                            <CardTitle className="font-body text-md text-primary">
                              {evaluation.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1 text-muted-foreground">
                            <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 opacity-70" /> Creado: {new Date(evaluation.dateCreated + 'T00:00:00').toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>
                            <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 opacity-70" /> Entrega: {new Date(evaluation.dueDate + 'T00:00:00').toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>
                          </CardContent>
                          <CardFooter className="pt-2 pb-3">
                             <Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive" onClick={() => openDeleteDialog(evaluation)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Evaluación
                              </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
      
      {/* Section 2: Existing "Seguimiento de Trabajos" table */}
      <div>
        <h2 className="font-headline text-2xl text-primary mb-6 flex items-center">
          <ClipboardList className="mr-2 h-7 w-7" />
          Seguimiento de Trabajos en {currentClass.name}
        </h2>
        
        {evaluations.length === 0 && (
          <EmptyState
            icon={<ClipboardList className="w-16 h-16 opacity-50" />}
            title="No Hay Trabajos Definidos"
            message={`Añade evaluaciones (tareas, proyectos, etc.) en la pestaña "Calificaciones" para que aparezcan aquí para seguimiento.`}
          />
        )}

        {evaluations.length > 0 && students.length === 0 && (
          <EmptyState
            icon={<Users className="w-16 h-16 opacity-50" />}
            title="No Hay Estudiantes en la Clase"
            message={`Añade estudiantes a la clase "${currentClass.name}" para poder gestionar sus trabajos.`}
          />
        )}

        {evaluations.length > 0 && students.length > 0 && (
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
        )}
         {studentEvaluationPairs.length === 0 && evaluations.length > 0 && students.length > 0 && (
           <p className="p-4 text-muted-foreground text-center">No hay trabajos asignados a estudiantes todavía.</p>
         )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta evaluación?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la evaluación: <span className="font-semibold">{evaluationToDelete?.name}</span> ({evaluationToDelete?.type}).
              Esta acción no se puede deshacer y todas las calificaciones asociadas a esta evaluación serán eliminadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEvaluationToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvaluation} className="bg-destructive hover:bg-destructive/90">
              Eliminar Evaluación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrabajosTab;
