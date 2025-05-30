
import type { Class, TabKey } from '@/types';
import { BarChart3, PlusCircle, Users, Star, Trophy, ClipboardCheck } from 'lucide-react';

export const INITIAL_CLASSES_DATA: Class[] = [
  {
    id: 'cl_hist_12b',
    name: "Historia 12th B",
    subject: "Historia",
    description: "Clase de historia para duodécimo grado, enfocada en la historia contemporánea.",
    students: [] 
  }
];

export const NAV_TAB_ITEMS: { id: TabKey; label: string; icon: React.ElementType }[] = [
  { id: 'class-overview', label: 'Resumen', icon: BarChart3 },
  { id: 'add-student', label: 'Añadir Estudiante', icon: PlusCircle },
  { id: 'view-students', label: 'Ver Estudiantes', icon: Users },
  { id: 'manage-points', label: 'Gestionar Puntos', icon: Star },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'grades', label: 'Calificaciones', icon: ClipboardCheck },
];
