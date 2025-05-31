
'use client';

import React from 'react';
import type { Class } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users, Star, BarChartBig, Trophy, Edit3, Settings } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import AiActivitySuggester from '@/components/ai/AiActivitySuggester';

interface ClassOverviewTabProps {
  currentClass: Class | null;
  onEditClass: () => void;
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

const ClassOverviewTab: React.FC<ClassOverviewTabProps> = ({ currentClass, onEditClass }) => {
  if (!currentClass) {
    return (
      <EmptyState 
        icon={<BarChartBig className="w-16 h-16" />}
        title="Cargando Resumen de Clase"
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
      
      <Card className="shadow-md border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            Acciones de Clase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-muted-foreground mb-4">
            Modifica los detalles generales de tu clase.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={onEditClass} variant="outline" className="font-body text-primary border-primary hover:bg-primary/10 w-full sm:w-auto">
            <Edit3 className="mr-2 h-5 w-5" />
            Editar Detalles de Clase
          </Button>
        </CardFooter>
      </Card>

      <AiActivitySuggester grade={students[0]?.grade || "General"} subject={currentClass.subject} />
      
    </div>
  );
};

export default ClassOverviewTab;
