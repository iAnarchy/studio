'use client';

import React from 'react';
import type { Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Star, Trash2, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onRemoveStudent?: (studentId: string) => void;
  onUpdatePoints?: (studentId: string, pointsToAdd: number) => void;
  onResetPoints?: (studentId: string) => void;
  isManagingPoints?: boolean;
  isViewingStudents?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onRemoveStudent,
  onUpdatePoints,
  onResetPoints,
  isManagingPoints,
  isViewingStudents
}) => {
  const pointIncrements = [1, 5, 10];
  const pointDecrements = [-1, -5];

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-accent animate-fade-in">
      <CardHeader className="flex flex-row justify-between items-start pb-2">
        <div>
          <CardTitle className="font-headline text-lg text-primary flex items-center">
            <User className="mr-2 h-5 w-5" />
            {student.name}
          </CardTitle>
          <CardDescription className="font-body">{student.grade} Grado</CardDescription>
        </div>
        <div className="flex items-center bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
          <Star className="mr-1 h-4 w-4" />
          {student.points} Puntos
        </div>
      </CardHeader>
      <CardContent>
        {isManagingPoints && onUpdatePoints && onResetPoints && (
          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap gap-2">
              {pointIncrements.map(p => (
                <Button key={`add-${p}`} size="sm" onClick={() => onUpdatePoints(student.id, p)} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600">
                  <TrendingUp className="mr-1 h-4 w-4" /> +{p}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
               {pointDecrements.map(p => (
                <Button key={`sub-${p}`} size="sm" onClick={() => onUpdatePoints(student.id, p)} className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600">
                  <TrendingDown className="mr-1 h-4 w-4" /> {p}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={() => onResetPoints(student.id)} className="text-muted-foreground hover:bg-muted/50">
                <RotateCcw className="mr-1 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      {isViewingStudents && onRemoveStudent && (
        <CardFooter>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemoveStudent(student.id)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Estudiante
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default StudentCard;
