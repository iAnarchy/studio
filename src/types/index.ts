export type EvaluationType = 'Tarea' | 'Actividad' | 'Proyecto' | 'Examen';
export const EVALUATION_TYPES: EvaluationType[] = ['Tarea', 'Actividad', 'Proyecto', 'Examen'];

export interface GradeValues {
  Tarea?: number;
  Actividad?: number;
  Proyecto?: number;
  Examen?: number;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  points: number;
  grades: GradeValues;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  description?: string;
  students: Student[];
}

export type TabKey = 'class-overview' | 'add-student' | 'view-students' | 'manage-points' | 'leaderboard' | 'grades';

export const GRADE_LEVELS = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°", "12°"];

export const SUBJECTS = [
  "Matemáticas", "Español", "Ciencias", "Historia", "Geografía", 
  "Inglés", "Educación Física", "Arte", "Música", "Tecnología", "Otra"
];
