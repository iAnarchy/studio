
'use client';

import React, { useState, useEffect } from 'react';
import type { Class, EvaluationType } from '@/types';
import { EVALUATION_TYPES } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { ClipboardCheck, BookOpen, PlusCircle, CalendarDays, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const formatDate = (dateString: string) => {
  return new Date(dateString + 'T00:00:00Z').toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });
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

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-2xl text-primary flex items-center">
          <ClipboardCheck className="mr-2 h-7 w-7" />
          Evaluaciones de {currentClass.name}
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
          message={`Añade evaluaciones (tareas, proyectos, etc.) a la clase "${currentClass.name}" para organizarlas aquí.`}
          actions={<Button onClick={() => setIsModalOpen(true)} className="font-body">Añadir Primera Evaluación</Button>}
        />
      ) : (
        <ScrollArea className="h-[65vh] pr-2">
          <Accordion type="multiple" defaultValue={EVALUATION_TYPES.map(type => type.toLowerCase())} className="w-full">
            {EVALUATION_TYPES.map((type) => {
              const filteredEvaluations = evaluations.filter(ev => ev.type === type);
              return (
                <AccordionItem value={type.toLowerCase()} key={type}>
                  <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                    {type} ({filteredEvaluations.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    {filteredEvaluations.length === 0 ? (
                      <p className="text-muted-foreground p-4 text-center">No hay {type.toLowerCase()} definidas para esta clase.</p>
                    ) : (
                      <div className="space-y-4 pt-2">
                        {filteredEvaluations.map(evaluation => (
                          <Card key={evaluation.id} className="shadow-md border-l-4 border-primary/50">
                            <CardHeader>
                              <CardTitle className="font-headline text-xl text-primary">{evaluation.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                               <p className="flex items-center text-muted-foreground">
                                <CalendarDays className="mr-2 h-4 w-4 text-accent" />
                                <strong>Creado:</strong> {formatDate(evaluation.dateCreated)}
                              </p>
                              <p className="flex items-center text-muted-foreground">
                                <CalendarDays className="mr-2 h-4 w-4 text-accent" />
                                <strong>Entrega:</strong> {formatDate(evaluation.dueDate)}
                              </p>
                               <p className="flex items-center text-muted-foreground">
                                <Info className="mr-2 h-4 w-4 text-accent" />
                                <strong>Tipo:</strong> {evaluation.type}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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
