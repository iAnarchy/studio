import type { Class, TabKey } from '@/types';
import { BarChart3, PlusCircle, Users, Star, Trophy } from 'lucide-react';

export const INITIAL_CLASSES_DATA: Class[] = [
  {
    id: 'cl_math_5a',
    name: "Matemáticas 5°A",
    subject: "Matemáticas",
    description: "Clase de matemáticas para quinto grado, enfocada en fracciones y decimales.",
    students: [
      { id: 'st_maria_g', name: "María González", grade: "5°", points: 85 },
      { id: 'st_carlos_r', name: "Carlos Rodríguez", grade: "5°", points: 72 },
      { id: 'st_ana_m', name: "Ana Martínez", grade: "5°", points: 90 }
    ]
  },
  {
    id: 'cl_spanish_4b',
    name: "Español 4°B",
    subject: "Español",
    description: "Clase de español para cuarto grado, explorando géneros literarios.",
    students: [
      { id: 'st_luis_p', name: "Luis Pérez", grade: "4°", points: 68 },
      { id: 'st_sofia_l', name: "Sofia López", grade: "4°", points: 95 },
      { id: 'st_diego_m', name: "Diego Morales", grade: "4°", points: 78 }
    ]
  }
];

export const NAV_TAB_ITEMS: { id: TabKey; label: string; icon: React.ElementType }[] = [
  { id: 'class-overview', label: 'Resumen', icon: BarChart3 },
  { id: 'add-student', label: 'Añadir Estudiante', icon: PlusCircle },
  { id: 'view-students', label: 'Ver Estudiantes', icon: Users },
  { id: 'manage-points', label: 'Gestionar Puntos', icon: Star },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];
