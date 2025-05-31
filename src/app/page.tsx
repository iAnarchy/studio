
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Class, Student, TabKey, EvaluationType, Evaluation, SubmissionStatus } from '@/types';
import { StudentFormData } from '@/components/student/StudentForm';
import { INITIAL_CLASSES_DATA, NAV_TAB_ITEMS } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";

// UI Components
import AppHeader from '@/components/layout/AppHeader';
import ClassSelector from '@/components/class/ClassSelector';
import AppTabs from '@/components/navigation/AppTabs';
import CurrentClassInfoCard from '@/components/class/CurrentClassInfoCard';
// Button removed as it's not used directly here anymore for class creation

// Tab Content Components
import ClassOverviewTab from '@/components/tabs/ClassOverviewTab';
import AddStudentTab from '@/components/tabs/AddStudentTab';
import ViewStudentsTab from '@/components/tabs/ViewStudentsTab';
import ManagePointsTab from '@/components/tabs/ManagePointsTab';
import LeaderboardTab from '@/components/tabs/LeaderboardTab';
import GradesTab from '@/components/tabs/GradesTab';
import TrabajosTab from '@/components/tabs/TrabajosTab';


const CLASS_PULSE_DATA_KEY = 'classPulseData';
const CLASS_PULSE_CURRENT_CLASS_ID_KEY = 'classPulseCurrentClassId';


export default function HomePage() {
  const [classes, setClasses] = useState<Class[]>(INITIAL_CLASSES_DATA);
  const [currentClassId, setCurrentClassId] = useState<string | null>(INITIAL_CLASSES_DATA[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>(NAV_TAB_ITEMS[0].id);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedClassesRaw = localStorage.getItem(CLASS_PULSE_DATA_KEY);
      if (storedClassesRaw) {
        let parsedClasses = JSON.parse(storedClassesRaw) as Class[];
        // Ensure data structure consistency
        parsedClasses = parsedClasses.map(cls => ({
          ...cls,
          evaluations: cls.evaluations || [],
          students: cls.students.map(s => ({
            ...s,
            assignmentData: s.assignmentData || {},
            // Migrate old grades structure if present
            grades: undefined, // remove old grades property
          }))
        }));

        if (parsedClasses.length > 0 && parsedClasses.find(c => c.id === INITIAL_CLASSES_DATA[0].id)) {
           setClasses(parsedClasses);
           const storedCurrentClassId = localStorage.getItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY);
           setCurrentClassId(storedCurrentClassId && parsedClasses.find(c => c.id === storedCurrentClassId) ? storedCurrentClassId : parsedClasses[0].id);
        } else {
          // If stored data is invalid or empty, reset to initial data
          setClasses(INITIAL_CLASSES_DATA);
          setCurrentClassId(INITIAL_CLASSES_DATA[0].id);
          localStorage.setItem(CLASS_PULSE_DATA_KEY, JSON.stringify(INITIAL_CLASSES_DATA));
          localStorage.setItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY, INITIAL_CLASSES_DATA[0].id);
        }

      } else {
        setClasses(INITIAL_CLASSES_DATA);
        setCurrentClassId(INITIAL_CLASSES_DATA[0].id);
        localStorage.setItem(CLASS_PULSE_DATA_KEY, JSON.stringify(INITIAL_CLASSES_DATA));
        localStorage.setItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY, INITIAL_CLASSES_DATA[0].id);
      }
    } catch (error) {
      console.error("Error al cargar datos desde localStorage:", error);
      setClasses(INITIAL_CLASSES_DATA);
      setCurrentClassId(INITIAL_CLASSES_DATA[0].id);
      localStorage.setItem(CLASS_PULSE_DATA_KEY, JSON.stringify(INITIAL_CLASSES_DATA));
      localStorage.setItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY, INITIAL_CLASSES_DATA[0].id);
    }
  }, []);

  useEffect(() => {
    if (isClient && classes.length > 0) {
      localStorage.setItem(CLASS_PULSE_DATA_KEY, JSON.stringify(classes));
    }
  }, [classes, isClient]);

  useEffect(() => {
    if (isClient && currentClassId) {
      localStorage.setItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY, currentClassId);
    }
  }, [currentClassId, isClient]);

  const currentClass = classes.find(cls => cls.id === currentClassId) || null;

  const handleAddStudent = useCallback((studentData: StudentFormData) => {
    if (!currentClassId) return;
    setIsLoadingStudent(true);
    const newStudent: Student = {
      id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...studentData,
      points: 0,
      assignmentData: {},
    };
    setClasses(prev => prev.map(cls =>
      cls.id === currentClassId
        ? { ...cls, students: [...cls.students, newStudent] }
        : cls
    ));
    toast({ title: "Estudiante Añadido", description: `${studentData.name} ha sido añadido a la clase.` });
    setIsLoadingStudent(false);
  }, [currentClassId, toast]);

  const handleRemoveStudent = useCallback((studentId: string) => {
    if (!currentClassId) return;
    const studentToRemove = currentClass?.students.find(s => s.id === studentId);
    if (!studentToRemove) return;

    if (window.confirm(`¿Estás seguro de eliminar a ${studentToRemove.name}?`)) {
      setClasses(prev => prev.map(cls =>
        cls.id === currentClassId
          ? { ...cls, students: cls.students.filter(s => s.id !== studentId) }
          : cls
      ));
      toast({ title: "Estudiante Eliminado", description: `${studentToRemove.name} ha sido eliminado.`, variant: "destructive" });
    }
  }, [currentClassId, currentClass?.students, toast]);

  const handleUpdateStudentPoints = useCallback((studentId: string, pointsToAdd: number) => {
    if (!currentClassId) return;
    setClasses(prev => prev.map(cls =>
      cls.id === currentClassId
        ? { ...cls, students: cls.students.map(s => s.id === studentId ? { ...s, points: Math.max(0, s.points + pointsToAdd) } : s) }
        : cls
    ));
  }, [currentClassId]);

  const handleResetStudentPoints = useCallback((studentId: string) => {
    if (!currentClassId) return;
    const studentToReset = currentClass?.students.find(s => s.id === studentId);
     if (!studentToReset) return;

    if (window.confirm(`¿Estás seguro de resetear los puntos de ${studentToReset.name}?`)) {
      setClasses(prev => prev.map(cls =>
        cls.id === currentClassId
          ? { ...cls, students: cls.students.map(s => s.id === studentId ? { ...s, points: 0 } : s) }
          : cls
      ));
      toast({ title: "Puntos Reseteados", description: `Los puntos de ${studentToReset.name} han sido reseteados.` });
    }
  }, [currentClassId, currentClass?.students, toast]);

  const handleAddEvaluation = useCallback((evaluationData: { name: string; type: EvaluationType; dueDate: string }) => {
    if (!currentClassId) return;
    const newEvaluation: Evaluation = {
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...evaluationData,
      dateCreated: new Date().toISOString().split('T')[0], // Store as YYYY-MM-DD
    };
    setClasses(prev => prev.map(cls =>
      cls.id === currentClassId
        ? { ...cls, evaluations: [...(cls.evaluations || []), newEvaluation] }
        : cls
    ));
    toast({ title: "Evaluación Añadida", description: `${evaluationData.name} ha sido añadida a la clase.` });
  }, [currentClassId, toast]);

  const handleUpdateStudentGrade = useCallback((studentId: string, evaluationId: string, value: number | undefined) => {
    if (!currentClassId) return;
    setClasses(prevClasses => prevClasses.map(cls =>
      cls.id === currentClassId
        ? {
            ...cls,
            students: cls.students.map(s =>
              s.id === studentId
                ? {
                    ...s,
                    assignmentData: {
                      ...s.assignmentData,
                      [evaluationId]: {
                        ...(s.assignmentData[evaluationId] || { status: 'Pendiente' }),
                        grade: value === undefined || isNaN(value) ? undefined : value,
                      }
                    }
                  }
                : s
            )
          }
        : cls
    ));
  }, [currentClassId]);

  const handleUpdateStudentSubmissionStatus = useCallback((studentId: string, evaluationId: string, status: SubmissionStatus) => {
    if (!currentClassId) return;
    setClasses(prevClasses => prevClasses.map(cls =>
      cls.id === currentClassId
        ? {
            ...cls,
            students: cls.students.map(s =>
              s.id === studentId
                ? {
                    ...s,
                    assignmentData: {
                      ...s.assignmentData,
                      [evaluationId]: {
                        ...(s.assignmentData[evaluationId] || {}),
                        status: status,
                      }
                    }
                  }
                : s
            )
          }
        : cls
    ));
  }, [currentClassId]);


  const renderTabContent = () => {
    if (!isClient || !currentClass) {
      return <div className="flex justify-center items-center h-64"><p>Cargando...</p></div>;
    }

    switch (activeTab) {
      case 'class-overview':
        return <ClassOverviewTab currentClass={currentClass} />;
      case 'add-student':
        return <AddStudentTab currentClass={currentClass} onAddStudent={handleAddStudent} isLoading={isLoadingStudent} />;
      case 'view-students':
        return <ViewStudentsTab currentClass={currentClass} onRemoveStudent={handleRemoveStudent} />;
      case 'manage-points':
        return <ManagePointsTab currentClass={currentClass} onUpdatePoints={handleUpdateStudentPoints} onResetPoints={handleResetStudentPoints} />;
      case 'leaderboard':
        return <LeaderboardTab currentClass={currentClass} />;
      case 'grades':
        return <GradesTab currentClass={currentClass} onAddEvaluation={handleAddEvaluation} />;
      case 'trabajos':
        return <TrabajosTab currentClass={currentClass} onUpdateGrade={handleUpdateStudentGrade} onUpdateSubmissionStatus={handleUpdateStudentSubmissionStatus} />;
      default:
        return null;
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <AppHeader />
        <p className="text-primary text-lg">Cargando Plataforma Educativa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="container mx-auto px-4 pb-8 flex-grow">
        <ClassSelector
          classes={classes}
          currentClassId={currentClassId}
          onSelectClass={() => {}} // No-op as class selection is fixed
        />
        <AppTabs activeTab={activeTab} onSelectTab={setActiveTab} disabled={false} />

        {currentClassId && <CurrentClassInfoCard currentClass={currentClass} />}

        <div className="bg-card p-4 md:p-6 rounded-lg shadow-lg min-h-[300px]">
          {renderTabContent()}
        </div>
      </main>
      <footer className="text-center py-6 border-t border-border mt-auto">
        <p className="text-sm text-muted-foreground font-body">&copy; {new Date().getFullYear()} Plataforma Educativa. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
