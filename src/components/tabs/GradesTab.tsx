
'use client';

import React, { useState, useEffect } from 'react';
import type { Class, Evaluation, EvaluationType } from '@/types';
import { EVALUATION_TYPES } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Archive, ListChecks, Sparkles, Briefcase, PencilRuler, BookOpen } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface GradesTabProps {
  currentClass: Class | null;
  onAddEvaluation: (evaluationData: { name: string; type: EvaluationType; dueDate: string }) => void;
}

const evaluationSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  type: z.enum(EVALUATION_TYPES as [EvaluationType, ...EvaluationType[]], {
    required_error: "Debes seleccionar un tipo de evaluación."
  }),
  dueDate: z.string().refine((date) => !!date, { message: "La fecha de entrega es obligatoria." }),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

const EvaluationTypeIcons: Record<EvaluationType, React.ElementType> = {
  'Tarea': ListChecks,
  'Actividad': Sparkles,
  'Proyecto': Briefcase,
  'Examen': PencilRuler,
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
        message="Por favor, selecciona una clase para ver y gestionar las evaluaciones."
      />
    );
  }
  
  const { evaluations } = currentClass;

  const countsByType = EVALUATION_TYPES.reduce((acc, type) => {
    acc[type] = evaluations.filter(e => e.type === type).length;
    return acc;
  }, {} as Record<EvaluationType, number>);

  const totalEvaluations = evaluations.length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="font-headline text-2xl text-primary flex items-center">
          <Archive className="mr-2 h-7 w-7" />
          Resumen de Evaluaciones en {currentClass.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="font-body bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Nueva Evaluación
        </Button>
      </div>

      {evaluations.length === 0 ? (
        <EmptyState
          icon={<Archive className="w-16 h-16" />}
          title="No Hay Evaluaciones Definidas"
          message={`Aún no se han añadido evaluaciones (tareas, proyectos, etc.) a la clase "${currentClass.name}".`}
          actions={<Button onClick={() => setIsModalOpen(true)} className="font-body">Añadir Primera Evaluación</Button>}
        />
      ) : (
        <>
          <Card className="mb-6 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-headline text-primary flex items-center">
                <Archive className="mr-2 h-5 w-5" /> Total de Evaluaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{totalEvaluations}</div>
              <p className="text-sm text-muted-foreground">
                {totalEvaluations === 1 ? 'evaluación registrada' : 'evaluaciones registradas'} en la clase.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {EVALUATION_TYPES.map(type => {
              const IconComponent = EvaluationTypeIcons[type];
              const count = countsByType[type];
              return (
                <Card key={type} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-headline text-primary flex items-center">
                      <IconComponent className="mr-2 h-5 w-5 text-accent" />
                      {type}s
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{count}</div>
                    <p className="text-xs text-muted-foreground">
                      {count === 1 ? 'evaluación' : 'evaluaciones'} de este tipo.
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
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
    
