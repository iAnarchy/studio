'use client';

import React from 'react';
import type { Class } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import EmptyState from '@/components/ui/EmptyState';
import { Trophy, User, Star, Award, Medal, BookOpen } from 'lucide-react'; // Medal for 2nd/3rd, Award for others

interface LeaderboardTabProps {
  currentClass: Class | null;
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ currentClass }) => {
  if (!currentClass) {
    return (
      <EmptyState
        icon={<BookOpen className="w-16 h-16" />}
        title="Sin Clase Seleccionada"
        message="Por favor, selecciona o crea una clase para ver el leaderboard."
      />
    );
  }

  if (currentClass.students.length === 0) {
    return (
       <EmptyState
        icon={<Trophy className="w-16 h-16" />}
        title="Leaderboard Vacío"
        message={`Añade estudiantes y asigna puntos en la clase "${currentClass.name}" para ver la clasificación.`}
      />
    );
  }

  const sortedStudents = [...currentClass.students].sort((a, b) => b.points - a.points);

  const getRankIndicator = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />; // Using Medal for silver
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />; // Using Medal for bronze
    return <Award className="w-6 h-6 text-primary/50" />;
  };
  
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400/10 border-yellow-400';
    if (rank === 2) return 'bg-slate-400/10 border-slate-400';
    if (rank === 3) return 'bg-orange-400/10 border-orange-400';
    return 'bg-card border-border';
  }

  return (
    <div className="animate-fade-in">
      <Card className="shadow-xl bg-gradient-to-br from-primary via-indigo-700 to-purple-800 text-primary-foreground">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center mb-2">
             <Trophy className="w-10 h-10 mr-3 text-yellow-300" />
             <CardTitle className="font-headline text-3xl">Leaderboard</CardTitle>
          </div>
          <CardDescription className="font-body text-primary-foreground/80">
            Top Estudiantes en {currentClass.name}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6 space-y-3">
        {sortedStudents.map((student, index) => {
          const rank = index + 1;
          return (
            <Card key={student.id} className={`shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 ${getRankColor(rank)}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${rank <=3 ? 'text-primary-foreground' : 'text-primary'} ${
                    rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-400' : rank === 3 ? 'bg-orange-400' : 'bg-primary/10'
                  }`}>
                    {getRankIndicator(rank)}
                  </div>
                  <div>
                    <p className="font-semibold text-md text-primary font-body flex items-center">
                       <User className="w-4 h-4 mr-2 opacity-70" /> {student.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">{student.grade} Grado</p>
                  </div>
                </div>
                <div className="flex items-center text-lg font-bold text-primary font-body">
                  <Star className="w-5 h-5 mr-1 text-yellow-500" /> {student.points} pts
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardTab;
