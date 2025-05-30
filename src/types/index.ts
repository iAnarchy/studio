
export type EvaluationType = 'Tarea' | 'Actividad' | 'Proyecto' | 'Examen';
export const EVALUATION_TYPES: EvaluationType[] = ['Tarea', 'Actividad', 'Proyecto', 'Examen'];

export type SubmissionStatus = 'Pendiente' | 'Entregado' | 'Tardíamente' | 'Sin Entregar';
export const SUBMISSION_STATUS_OPTIONS: SubmissionStatus[] = ['Pendiente', 'Entregado', 'Tardíamente', 'Sin Entregar'];


export interface Evaluation {
  id: string;
  name: string;
  type: EvaluationType;
  dateCreated: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
}

export interface StudentAssignmentData {
  grade?: number;
  status?: SubmissionStatus;
}

export interface Student {
  id: string;
  name: string;
  grade: string; // Grade level of student, e.g., "5°"
  points: number;
  assignmentData: {
    [evaluationId: string]: StudentAssignmentData | undefined;
  };
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  description?: string;
  students: Student[];
  evaluations: Evaluation[];
}

export type TabKey = 'class-overview' | 'add-student' | 'view-students' | 'manage-points' | 'leaderboard' | 'grades' | 'trabajos';

export const GRADE_LEVELS = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°", "12°"];

export const SUBJECTS = [
  "Matemáticas", "Español", "Ciencias", "Historia", "Geografía",
  "Inglés", "Educación Física", "Arte", "Música", "Tecnología", "Otra"
];
