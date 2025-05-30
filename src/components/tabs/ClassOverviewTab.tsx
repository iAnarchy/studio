'use client';

import React from 'react';
import type { Class } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, BarChartBig, Trophy, Edit3, Trash2 } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import AiActivitySuggester from '@/components/ai/AiActivitySuggester';

interface ClassOverviewTabProps {
  currentClass: Class | null;
  onShowEditClassModal: () => void;
  onDeleteClass: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
  <Card className="text-center shadow-sm transition-all hover:shadow-md">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground font-body">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-primary font-headline flex items-center justify-center">
        <Icon className="w-7 h-7 mr-2 text-accent" />
        {value}
      </div>
    </CardContent>
  </Card>
);

const ClassOverviewTab: React.FC<ClassOverviewTabProps> = ({ currentClass, onShowEditClassModal, onDeleteClass }) => {
  if (!currentClass) {
    return (
      <EmptyState 
        icon={<BarChartBig className="w-16 h-16" />}
        title="Sin Resumen de Clase"
        message="Selecciona o crea una clase para ver su resumen."
      />
    );
  }

  const { students } = currentClass;
  const totalPoints = students.reduce((sum, student) => sum + student.points, 0);
  const avgPoints = students.length > 0 ? Math.round(totalPoints / students.length) : 0;
  const topStudent = students.length > 0 ? students.reduce((top, student) => student.points > top.points ? student : top, students[0]) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Estudiantes" value={students.length} icon={Users} />
        <StatCard title="Puntos Totales" value={totalPoints} icon={Star} />
        <StatCard title="Promedio Puntos" value={avgPoints} icon={BarChartBig} />
        <StatCard title="Mejor Puntaje" value={topStudent ? topStudent.points : 'N/A'} icon={Trophy} />
      </div>

      <AiActivitySuggester grade={students[0]?.grade || "General"} subject={currentClass.subject} />
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Acciones de Clase</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={onShowEditClassModal} variant="outline" className="font-body border-primary text-primary hover:bg-primary/10">
            <Edit3 className="mr-2 h-4 w-4" /> Editar Clase
          </Button>
          <Button onClick={onDeleteClass} variant="destructive" className="font-body">
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Clase
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassOverviewTab;
