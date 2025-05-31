
'use client';

import React, { useState, useEffect } from 'react';
import type { Class, Evaluation, EvaluationType, Student } from '@/types';
import { EVALUATION_TYPES } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, BookOpen, Users, ListChecks, FileText, Activity, Briefcase, CheckSquare, CalendarDays, Trash2, Layers } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface GradesTabProps {
  currentClass: Class | null;
  onAddEvaluation: (evaluationData: { name: string; type: EvaluationType; dueDate: string }) => void;
  onDeleteEvaluation: (evaluationId: string) => void;
}

const evaluationSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  type: z.enum(EVALUATION_TYPES as [EvaluationType, ...EvaluationType[]], {
    required_error: "Debes seleccionar un tipo de evaluación."
  }),
  dueDate: z.string().refine((date) => !!date, { message: "La fecha de entrega es obligatoria." }),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

const evaluationTypeIcons: Record<EvaluationType, React.ElementType> = {
  'Tarea': FileText,
  'Actividad': Activity,
  'Proyecto': Briefcase,
  'Examen': CheckSquare,
};

const GradesTab: React.FC<GradesTabProps> = ({ currentClass, onAddEvaluation, onDeleteEvaluation }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<Evaluation | null>(null);

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
        icon={<BookOpen className="w-16 h-16" />}
        title="Sin Clase Seleccionada"
        message="Por favor, selecciona una clase para ver y gestionar las evaluaciones."
      />
    );
  }

  const { evaluations } = currentClass;

  const evaluationsByType = (type: EvaluationType) => evaluations.filter(ev => ev.type === type);

  const getTitleForType = (type: EvaluationType, count: number) => {
    switch (type) {
      case 'Tarea': return `Tareas (${count} ${count === 1 ? 'tarea' : 'tareas'})`;
      case 'Actividad': return `Actividades (${count} ${count === 1 ? 'actividad' : 'actividades'})`;
      case 'Proyecto': return `Proyectos (${count} ${count === 1 ? 'proyecto' : 'proyectos'})`;
      case 'Examen': return `Examen`; // Count will be inside the card for Examen
      default: return type;
    }
  };

  const evaluationsCount = evaluations.length;
  const tareasCount = evaluations.filter(ev => ev.type === 'Tarea').length;
  const actividadesCount = evaluations.filter(ev => ev.type === 'Actividad').length;
  const proyectosCount = evaluations.filter(ev => ev.type === 'Proyecto').length;
  const examenesCount = evaluations.filter(ev => ev.type === 'Examen').length;


  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="font-headline text-2xl text-primary flex items-center">
          <ListChecks className="mr-2 h-7 w-7" />
          Gestión de Evaluaciones en {currentClass.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="font-body bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Nueva Evaluación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-card hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">Total de Evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-headline flex items-center">
              <Layers className="w-6 h-6 mr-2 text-accent" />
              {evaluationsCount}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">{getTitleForType('Tarea', tareasCount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-headline flex items-center">
              <FileText className="w-6 h-6 mr-2 text-accent" />
              {tareasCount}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">{getTitleForType('Actividad', actividadesCount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-headline flex items-center">
              <Activity className="w-6 h-6 mr-2 text-accent" />
              {actividadesCount}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">{getTitleForType('Proyecto', proyectosCount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-headline flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-accent" />
              {proyectosCount}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">{getTitleForType('Examen', examenesCount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-headline flex items-center">
              <CheckSquare className="w-6 h-6 mr-2 text-accent" />
              {examenesCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {evaluations.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-16 h-16" />}
          title="No Hay Evaluaciones Definidas"
          message={`Aún no se han añadido evaluaciones a la clase "${currentClass.name}".`}
          actions={<Button onClick={() => setIsModalOpen(true)} className="font-body">Añadir Primera Evaluación</Button>}
        />
      ) : (
        <Accordion type="multiple" className="w-full space-y-2">
          {EVALUATION_TYPES.map((type) => {
            const currentTypeEvaluations = evaluationsByType(type);
            const IconComponent = evaluationTypeIcons[type];
            return (
              <AccordionItem value={type} key={type}>
                <AccordionTrigger className="bg-muted/50 hover:bg-muted px-4 py-3 rounded-md text-lg font-headline text-primary">
                  <div className="flex items-center">
                    <IconComponent className="mr-3 h-6 w-6 text-accent" />
                    {type} ({currentTypeEvaluations.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-3 px-1">
                  {currentTypeEvaluations.length > 0 ? (
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
                                Eliminar
                              </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No hay {type.toLowerCase()}s definidas.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
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

export default GradesTab;
