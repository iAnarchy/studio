'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student } from '@/types';
import { GRADE_LEVELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';

const studentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  grade: z.string().min(1, 'Debes seleccionar un grado.'),
});

export type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => void;
  editingStudent?: Student | null; // Not used for adding, but could be for editing
  isLoading?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, editingStudent, isLoading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      grade: '',
    },
  });

  useEffect(() => {
    if (editingStudent) {
      reset({
        name: editingStudent.name,
        grade: editingStudent.grade,
      });
    } else {
      reset({ name: '', grade: '' });
    }
  }, [editingStudent, reset]);

  const handleFormSubmit = (data: StudentFormData) => {
    onSubmit(data);
    reset(); // Reset form after submission
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="student-name" className="font-body text-foreground/80">Nombre del Estudiante</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input id="student-name" {...field} placeholder="Ingresa el nombre completo" className="font-body" />}
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="student-grade" className="font-body text-foreground/80">Grado</Label>
        <Controller
          name="grade"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="student-grade" className="font-body">
                <SelectValue placeholder="Selecciona un grado" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                {GRADE_LEVELS.map((grade) => (
                  <SelectItem key={grade} value={grade} className="font-body">
                    {grade} Grado
                  </SelectItem>
                ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          )}
        />
        {errors.grade && <p className="text-sm text-destructive mt-1">{errors.grade.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading} className="w-full font-body bg-primary hover:bg-primary/90">
        {isLoading ? 'Añadiendo...' : (editingStudent ? 'Guardar Cambios' : 'Añadir Estudiante')}
      </Button>
    </form>
  );
};

export default StudentForm;
