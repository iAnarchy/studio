
'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Class } from '@/types';
import { SUBJECTS } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';

export const classSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  subject: z.string().min(1, 'Debes seleccionar una materia.'),
  description: z.string().optional(),
});

export type ClassFormData = z.infer<typeof classSchema>;

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClassFormData, classId?: string) => void;
  editingClass: Class | null;
}

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSave, editingClass }) => {
  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      subject: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingClass) {
        reset({
          name: editingClass.name,
          subject: editingClass.subject,
          description: editingClass.description || '',
        });
      } else {
        reset({
          name: '',
          subject: '',
          description: '',
        });
      }
    }
  }, [editingClass, reset, isOpen]);

  const onSubmit = (data: ClassFormData) => {
    onSave(data, editingClass?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose(); // Call the original onClose to handle state in parent
      }
    }}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-primary">
            {editingClass ? 'Editar Detalles de Clase' : 'Nueva Clase'}
          </DialogTitle>
          <DialogDescription className="font-body">
            {editingClass ? 'Modifica los detalles de la clase.' : 'Completa los campos para crear una nueva clase.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="font-body text-foreground/80">Nombre de la Clase</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} placeholder="Ej: Matemáticas 5°A" className="font-body" />}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="subject" className="font-body text-foreground/80">Materia</Label>
             <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger id="subject" className="font-body">
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject} className="font-body">
                          {subject}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
          </div>
          <div>
            <Label htmlFor="description" className="font-body text-foreground/80">Descripción (opcional)</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <Textarea id="description" {...field} placeholder="Describe tu clase..." className="font-body" />}
            />
             {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="font-body">
              Cancelar
            </Button>
            <Button type="submit" className="font-body bg-primary hover:bg-primary/90" disabled={!isDirty && !!editingClass}>
              {editingClass ? 'Guardar Cambios' : 'Crear Clase'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassModal;
