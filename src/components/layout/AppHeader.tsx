
import React from 'react';
import { GraduationCap } from 'lucide-react';

const AppHeader: React.FC = () => {
  return (
    <header className="text-center mb-10 pt-8">
      <div className="inline-flex items-center justify-center mb-2">
        <GraduationCap className="w-12 h-12 text-primary mr-3" />
        <h1 className="font-headline text-5xl font-bold text-primary">
          Plataforma Educativa
        </h1>
      </div>
      <p className="text-muted-foreground text-lg font-body">
        Sistema de Gestión de Clases y Estudiantes
      </p>
    </header>
  );
};

export default AppHeader;

