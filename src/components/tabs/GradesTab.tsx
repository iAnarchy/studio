
'use client';

import React from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, BookOpen, ListChecks, FileText, Activity, Briefcase, CheckSquare, Layers, CalendarDays, Users } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const getAverageForType = (student: Student, allEvaluations: Evaluation[], type: EvaluationType): number | string => {
  const typeEvaluations = allEvaluations.filter(ev => ev.type === type);
  if (typeEvaluations.length === 0) return 'N/A';

  let totalGrade = 0;
  let gradedCount = 0;

  typeEvaluations.forEach(evaluation => {
    const gradeData = student.assignmentData?.[evaluation.id];
    if (gradeData && typeof gradeData.grade === 'number' && !isNaN(gradeData.grade)) {
      totalGrade += gradeData.grade;
      gradedCount++;
    }
  });

  return gradedCount > 0 ? parseFloat((totalGrade / gradedCount).toFixed(2)) : 'N/A';
};

const getFinalAverage = (student: Student, allEvaluations: Evaluation[]): number | string => {
  if (allEvaluations.length === 0) return 'N/A';

  let totalGrade = 0;
  let gradedCount = 0;

  allEvaluations.forEach(evaluation => {
    const gradeData = student.assignmentData?.[evaluation.id];
    if (gradeData && typeof gradeData.grade === 'number' && !isNaN(gradeData.grade)) {
      totalGrade += gradeData.grade;
      gradedCount++;
    }
  });

  return gradedCount > 0 ? parseFloat((totalGrade / gradedCount).toFixed(2)) : 'N/A';
};


const GradesTab: React.FC<GradesTabProps> = ({ currentClass, onAddEvaluation }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      name: '',
      type: EVALUATION_TYPES[0],
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  React.useEffect(() => {
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

  const getTitleForTypeCard = (type: EvaluationType, count: number) => {
    switch (type) {
      case 'Tarea': return `Tareas (${count} ${count === 1 ? 'tarea' : 'tareas'})`;
      case 'Actividad': return `Actividades (${count} ${count === 1 ? 'actividad' : 'actividades'})`;
      case 'Proyecto': return `Proyectos (${count} ${count === 1 ? 'proyecto' : 'proyectos'})`;
      case 'Examen': return `Examen`; // Count displayed inside card for consistency
      default: return type;
    }
  };
  
  const evaluationsCount = evaluations.length;
  const tareasCount = evaluations.filter(ev => ev.type === 'Tarea').length;
  const actividadesCount = evaluations.filter(ev => ev.type === 'Actividad').length;
  const proyectosCount = evaluations.filter(ev => ev.type === 'Proyecto').length;
  const examenesCount = evaluations.filter(ev => ev.type === 'Examen').length;

  const evaluationTypeIcons: Record<EvaluationType, React.ElementType> = {
    'Tarea': FileText,
    'Actividad': Activity,
    'Proyecto': Briefcase,
    'Examen': CheckSquare,
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="font-headline text-2xl text-primary flex items-center">
          <ListChecks className="mr-2 h-7 w-7" />
          Resumen de Calificaciones en {currentClass.name}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="font-body bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Nueva Evaluación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">{getTitleForTypeCard('Tarea', tareasCount)}</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">{getTitleForTypeCard('Actividad', actividadesCount)}</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">{getTitleForTypeCard('Proyecto', proyectosCount)}</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground font-body">{getTitleForTypeCard('Examen', examenesCount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-headline flex items-center">
              <CheckSquare className="w-6 h-6 mr-2 text-accent" />
              {examenesCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {students.length === 0 && (
        <EmptyState
          icon={<Users className="w-16 h-16" />}
          title="No Hay Estudiantes"
          message={`Añade estudiantes a la clase "${currentClass.name}" para ver sus promedios.`}
        />
      )}

      {students.length > 0 && (
        <ScrollArea className="h-[60vh] border rounded-md">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-primary/80 min-w-[200px] sticky left-0 bg-card z-10">Estudiante</TableHead>
                {EVALUATION_TYPES.map(type => (
                  <TableHead key={type} className="font-semibold text-primary/80 text-center min-w-[150px]">
                    Prom. {type}
                  </TableHead>
                ))}
                <TableHead className="font-semibold text-primary/80 text-center min-w-[150px] sticky right-0 bg-card z-10">Promedio Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10">{student.name}</TableCell>
                  {EVALUATION_TYPES.map(type => (
                    <TableCell key={`${student.id}-${type}`} className="text-center">
                      {getAverageForType(student, evaluations, type)}
                    </TableCell>
                  ))}
                  <TableCell className="font-bold text-center sticky right-0 bg-card z-10">
                    {getFinalAverage(student, evaluations)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
      
       {students.length > 0 && evaluations.length === 0 && (
         <EmptyState
          icon={<ListChecks className="w-16 h-16" />}
          title="No Hay Evaluaciones Definidas"
          message={`Aún no se han añadido evaluaciones a la clase "${currentClass.name}". No se pueden calcular promedios.`}
        />
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

