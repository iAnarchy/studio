
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Class, Student, TabKey, EvaluationType, Evaluation, SubmissionStatus } from '@/types';
import { StudentFormData } from '@/components/student/StudentForm';
import { ClassFormData } from '@/components/class/ClassModal'; // Import ClassFormData
import { INITIAL_CLASSES_DATA, NAV_TAB_ITEMS } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";

// UI Components
import AppHeader from '@/components/layout/AppHeader';
import ClassSelector from '@/components/class/ClassSelector';
import AppTabs from '@/components/navigation/AppTabs';
import CurrentClassInfoCard from '@/components/class/CurrentClassInfoCard';
import ClassModal from '@/components/class/ClassModal';


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

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classModalInitialData, setClassModalInitialData] = useState<Class | null>(null);


  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedClassesRaw = localStorage.getItem(CLASS_PULSE_DATA_KEY);
      if (storedClassesRaw) {
        let parsedClasses = JSON.parse(storedClassesRaw) as Class[];
        
        parsedClasses = parsedClasses.map(cls => ({
          ...cls,
          evaluations: cls.evaluations || [],
          students: cls.students.map(s => ({
            ...s,
            assignmentData: s.assignmentData || {},
            grades: undefined, 
          }))
        }));

        if (parsedClasses.length > 0 && parsedClasses.find(c => c.id === INITIAL_CLASSES_DATA[0].id)) {
           setClasses(parsedClasses);
           const storedCurrentClassId = localStorage.getItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY);
           setCurrentClassId(storedCurrentClassId && parsedClasses.find(c => c.id === storedCurrentClassId) ? storedCurrentClassId : parsedClasses[0].id);
        } else {
          
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
    if (isClient) { // Save to localStorage whenever classes change and client is ready
      localStorage.setItem(CLASS_PULSE_DATA_KEY, JSON.stringify(classes));
    }
  }, [classes, isClient]);

  useEffect(() => {
    if (isClient && currentClassId) {
      localStorage.setItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY, currentClassId);
    }
  }, [currentClassId, isClient]);

  const currentClass = classes.find(cls => cls.id === currentClassId) || null;

  const handleSaveClass = useCallback((formData: ClassFormData, classIdToUpdate?: string) => {
    if (classIdToUpdate && currentClass && classIdToUpdate === currentClass.id) {
      // Editing the current (and only) class
      setClasses(prevClasses => prevClasses.map(cls =>
        cls.id === classIdToUpdate
          ? { ...cls, ...formData } // Update name, subject, description
          : cls
      ));
      toast({ title: "Clase Actualizada", description: "Los detalles de la clase han sido actualizados." });
    } else {
      // Logic for adding a new class (currently not exposed via UI but modal supports it)
      const newClass: Class = {
        id: `cls_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...formData,
        students: [],
        evaluations: [],
      };
      setClasses(prev => [...prev, newClass]);
      toast({ title: "Clase Creada", description: `${formData.name} ha sido creada.` });
    }
    setIsClassModalOpen(false);
    setClassModalInitialData(null);
  }, [currentClass, toast]);

  const openEditClassModal = useCallback(() => {
    if (currentClass) {
      setClassModalInitialData(currentClass);
      setIsClassModalOpen(true);
    }
  }, [currentClass]);


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
    console.log('[handleRemoveStudent] Attempting to remove studentId:', studentId, 'from currentClassId:', currentClassId);

    if (!currentClassId) {
      console.error("[handleRemoveStudent] No current class ID to remove student from.");
      return;
    }
    const activeClass = classes.find(cls => cls.id === currentClassId);
    if (!activeClass) {
      console.error("[handleRemoveStudent] Current class not found with ID:", currentClassId, "Available class IDs:", classes.map(c => c.id));
      return;
    }
    console.log('[handleRemoveStudent] Found activeClass:', activeClass.name);

    const studentToRemove = activeClass.students.find(s => s.id === studentId);
    if (!studentToRemove) {
      console.error(`[handleRemoveStudent] Student to remove (ID: ${studentId}) not found in class "${activeClass.name}". Students in class (IDs):`, activeClass.students.map(s => s.id));
      return;
    }
    console.log('[handleRemoveStudent] Found studentToRemove:', studentToRemove.name, 'with ID:', studentToRemove.id);

    if (window.confirm(`¿Estás seguro de eliminar a ${studentToRemove.name}?`)) {
      console.log('[handleRemoveStudent] Confirmed removal for studentId:', studentId);
      setClasses(prevClasses => {
        console.log('[handleRemoveStudent] setClasses - prevClasses count:', prevClasses.length, 'currentClassId for update:', currentClassId);
        return prevClasses.map(cls => {
          if (cls.id === currentClassId) {
            console.log('[handleRemoveStudent] setClasses - Updating class:', cls.name, 'ID:', cls.id, '. Filtering studentId:', studentId);
            const initialStudentCount = cls.students.length;
            const newStudents = cls.students.filter(s => {
              const shouldKeep = s.id !== studentId;
              if (!shouldKeep) {
                console.log('[handleRemoveStudent] setClasses - Filtering out student:', s.name, s.id);
              }
              return shouldKeep;
            });
            if (newStudents.length === initialStudentCount && initialStudentCount > 0) {
                console.warn('[handleRemoveStudent] setClasses - Student filter had no effect. Student ID', studentId, 'not found for filtering in class instance during map. Student IDs in this instance:', cls.students.map(st => st.id));
            } else {
                console.log('[handleRemoveStudent] setClasses - Student list for class', cls.name, 'changed from', initialStudentCount, 'to', newStudents.length);
            }
            return { ...cls, students: newStudents };
          }
          return cls;
        });
      });
      toast({ title: "Estudiante Eliminado", description: `${studentToRemove.name} ha sido eliminado.`, variant: "destructive" });
    } else {
      console.log('[handleRemoveStudent] Cancelled removal for studentId:', studentId);
    }
  }, [classes, currentClassId, toast]);

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
      dateCreated: new Date().toISOString().split('T')[0], 
    };
    setClasses(prev => prev.map(cls =>
      cls.id === currentClassId
        ? { ...cls, evaluations: [...(cls.evaluations || []), newEvaluation] }
        : cls
    ));
    toast({ title: "Evaluación Añadida", description: `${evaluationData.name} ha sido añadida a la clase.` });
  }, [currentClassId, toast]);

  const handleDeleteEvaluation = useCallback((evaluationId: string) => {
    if (!currentClassId) return;
    
    const classForToast = classes.find(cls => cls.id === currentClassId);
    const evaluationToRemoveName = classForToast?.evaluations.find(ev => ev.id === evaluationId)?.name;

    setClasses(prevClasses => prevClasses.map(cls => {
      if (cls.id === currentClassId) {
        const updatedEvaluations = cls.evaluations.filter(ev => ev.id !== evaluationId);
        const updatedStudents = cls.students.map(student => {
          const newAssignmentData = { ...student.assignmentData };
          delete newAssignmentData[evaluationId];
          return { ...student, assignmentData: newAssignmentData };
        });
        return { ...cls, evaluations: updatedEvaluations, students: updatedStudents };
      }
      return cls;
    }));

    if (evaluationToRemoveName) {
      toast({ title: "Evaluación Eliminada", description: `La evaluación "${evaluationToRemoveName}" ha sido eliminada.`, variant: "destructive" });
    } else {
      toast({ title: "Evaluación Eliminada", description: `La evaluación ha sido eliminada.`, variant: "destructive" });
    }
  }, [currentClassId, classes, toast]);


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
                        ...(s.assignmentData[evaluationId] || { status: 'Pendiente' as SubmissionStatus }),
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
        return <ClassOverviewTab currentClass={currentClass} onEditClass={openEditClassModal} />;
      case 'add-student':
        return <AddStudentTab currentClass={currentClass} onAddStudent={handleAddStudent} isLoading={isLoadingStudent} />;
      case 'view-students':
        return <ViewStudentsTab currentClass={currentClass} onRemoveStudent={handleRemoveStudent} />;
      case 'manage-points':
        return <ManagePointsTab currentClass={currentClass} onUpdatePoints={handleUpdateStudentPoints} onResetPoints={handleResetStudentPoints} />;
      case 'leaderboard':
        return <LeaderboardTab currentClass={currentClass} />;
      case 'grades':
        return <GradesTab currentClass={currentClass} onAddEvaluation={handleAddEvaluation} onUpdateGrade={handleUpdateStudentGrade} />;
      case 'trabajos':
        return <TrabajosTab currentClass={currentClass} onUpdateGrade={handleUpdateStudentGrade} onUpdateSubmissionStatus={handleUpdateStudentSubmissionStatus} onDeleteEvaluation={handleDeleteEvaluation} />;
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
          onSelectClass={() => {}} 
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
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setClassModalInitialData(null); 
        }}
        onSave={handleSaveClass}
        editingClass={classModalInitialData}
      />
    </div>
  );
}

