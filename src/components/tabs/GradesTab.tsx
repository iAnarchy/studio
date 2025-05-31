
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
import { PlusCircle, BookOpen, Users, Layers, FileText, Activity, Briefcase, CheckSquare, ListChecks, CalendarDays } from 'lucide-react';
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

const evaluationTypeIcons: Record<EvaluationType, React.ElementType> = {
  'Tarea': FileText,
  'Actividad': Activity,
  'Proyecto': Briefcase,
  'Examen': CheckSquare,
};

const evaluationDisplayConfig: Record<EvaluationType, { title: string; inParenthesesIfCount?: string; defaultIcon: React.ElementType }> = {
  'Tarea': { title: 'Tareas', inParenthesesIfCount: 'tareas', defaultIcon: FileText },
  'Actividad': { title: 'Actividades', inParenthesesIfCount: 'actividades', defaultIcon: Activity },
  'Proyecto': { title: 'Proyectos', inParenthesesIfCount: 'proyectos', defaultIcon: Briefcase },
  'Examen': { title: 'Examen', defaultIcon: CheckSquare }, // Special case for title
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
        message="Por favor, selecciona una clase para ver y gestionar las calificaciones."
      />
    );
  }
  
  const { evaluations, students } = currentClass;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="font-headline text-2xl text-primary flex items-center">
          <ListChecks className="mr-2 h-7 w-7" />
          Resumen de Evaluaciones en {currentClass.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="font-body bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Nueva Evaluación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <Card className="bg-primary/10 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary/80 font-body">Total Evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-headline flex items-center">
              <Layers className="w-6 h-6 mr-2 text-accent" />
              {evaluations.length}
            </div>
          </CardContent>
        </Card>
        {EVALUATION_TYPES.map(type => {
          const count = evaluations.filter(ev => ev.type === type).length;
          const config = evaluationDisplayConfig[type];
          const Icon = config.defaultIcon || ListChecks;
          
          let titleText = config.title;
          if (config.inParenthesesIfCount) {
            titleText = `${config.title} (${count} ${config.inParenthesesIfCount})`;
          }

          return (
            <Card key={type} className="bg-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground font-body">{titleText}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary font-headline flex items-center">
                  <Icon className="w-6 h-6 mr-2 text-accent" />
                  {count}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {students.length === 0 && evaluations.length > 0 ? (
        <EmptyState
          icon={<Users className="w-16 h-16" />}
          title="No Hay Estudiantes"
          message={`Añade estudiantes a la clase "${currentClass.name}" para poder registrar calificaciones.`}
        />
      ) : evaluations.length === 0 ? (
         <EmptyState
          icon={<ListChecks className="w-16 h-16" />}
          title="No Hay Evaluaciones Definidas"
          message={`Aún no se han añadido evaluaciones a la clase "${currentClass.name}".`}
          actions={<Button onClick={() => setIsModalOpen(true)} className="font-body">Añadir Primera Evaluación</Button>}
        />
      ) : (
        <p className="text-center text-muted-foreground font-body">
          Usa la pestaña "Trabajos" para ingresar y ver el detalle de las calificaciones y estados de entrega.
        </p>
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
    
