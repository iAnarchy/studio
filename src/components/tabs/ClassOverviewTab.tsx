
'use client';

import React from 'react';
import type { Class } from '@/types';
// Button removed as actions are removed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, BarChartBig, Trophy } from 'lucide-react'; // Edit3, Trash2 removed
import EmptyState from '@/components/ui/EmptyState';
import AiActivitySuggester from '@/components/ai/AiActivitySuggester';

interface ClassOverviewTabProps {
  currentClass: Class | null;
  // onShowEditClassModal and onDeleteClass props removed
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

const ClassOverviewTab: React.FC<ClassOverviewTabProps> = ({ currentClass }) => {
  if (!currentClass) {
    return (
      <EmptyState 
        icon={<BarChartBig className="w-16 h-16" />}
        title="Cargando Resumen de Clase" // Changed title as class selection is fixed
        message="La información de la clase se está cargando."
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
      
      {/* "Acciones de Clase" Card removed as editing/deleting classes is no longer possible */}
    </div>
  );
};

export default ClassOverviewTab;
