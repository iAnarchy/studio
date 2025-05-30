
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Class, Student, TabKey } from '@/types';
import { StudentFormData } from '@/components/student/StudentForm';
import { INITIAL_CLASSES_DATA, NAV_TAB_ITEMS } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";

// UI Components
import AppHeader from '@/components/layout/AppHeader';
import ClassSelector from '@/components/class/ClassSelector';
// ClassModal removed as class creation/editing is removed
import AppTabs from '@/components/navigation/AppTabs';
import CurrentClassInfoCard from '@/components/class/CurrentClassInfoCard';
// EmptyState might still be used by tabs, Button might be needed if tabs use it.
// For now, keeping Button import just in case.
import { Button } from '@/components/ui/button'; 
import { BookOpen } from 'lucide-react';


// Tab Content Components
import ClassOverviewTab from '@/components/tabs/ClassOverviewTab';
import AddStudentTab from '@/components/tabs/AddStudentTab';
import ViewStudentsTab from '@/components/tabs/ViewStudentsTab';
import ManagePointsTab from '@/components/tabs/ManagePointsTab';
import LeaderboardTab from '@/components/tabs/LeaderboardTab';


const CLASS_PULSE_DATA_KEY = 'classPulseData';
// CLASS_PULSE_CURRENT_CLASS_ID_KEY is no longer strictly needed if there's only one class,
// but keeping it won't harm and might simplify logic if we decide to re-add class selection later.
const CLASS_PULSE_CURRENT_CLASS_ID_KEY = 'classPulseCurrentClassId';


export default function HomePage() {
  const [classes, setClasses] = useState<Class[]>(INITIAL_CLASSES_DATA); // Initialize with the single class
  const [currentClassId, setCurrentClassId] = useState<string | null>(INITIAL_CLASSES_DATA[0].id); // Set the ID of the single class
  const [activeTab, setActiveTab] = useState<TabKey>(NAV_TAB_ITEMS[0].id);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedClassesRaw = localStorage.getItem(CLASS_PULSE_DATA_KEY);
      if (storedClassesRaw) {
        const parsedClasses = JSON.parse(storedClassesRaw) as Class[];
        // Ensure the loaded data matches our single-class structure or reset
        if (parsedClasses.length === 1 && parsedClasses[0].id === INITIAL_CLASSES_DATA[0].id) {
          setClasses(parsedClasses);
          setCurrentClassId(parsedClasses[0].id);
        } else {
          // If localStorage data is not what we expect, reset to initial single class
          setClasses(INITIAL_CLASSES_DATA);
          setCurrentClassId(INITIAL_CLASSES_DATA[0].id);
          localStorage.setItem(CLASS_PULSE_DATA_KEY, JSON.stringify(INITIAL_CLASSES_DATA));
          localStorage.setItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY, INITIAL_CLASSES_DATA[0].id);
        }
      } else {
        // No data in localStorage, set initial single class
        setClasses(INITIAL_CLASSES_DATA);
        setCurrentClassId(INITIAL_CLASSES_DATA[0].id);
        localStorage.setItem(CLASS_PULSE_DATA_KEY, JSON.stringify(INITIAL_CLASSES_DATA));
        localStorage.setItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY, INITIAL_CLASSES_DATA[0].id);
      }
    } catch (error) {
      console.error("Error al cargar datos desde localStorage:", error);
      // Fallback to initial single class on error
      setClasses(INITIAL_CLASSES_DATA);
      setCurrentClassId(INITIAL_CLASSES_DATA[0].id);
      localStorage.setItem(CLASS_PULSE_DATA_KEY, JSON.stringify(INITIAL_CLASSES_DATA));
      localStorage.setItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY, INITIAL_CLASSES_DATA[0].id);
    }
  }, []);

  useEffect(() => {
    if (isClient && classes.length > 0) { // Should always be 1 class
      localStorage.setItem(CLASS_PULSE_DATA_KEY, JSON.stringify(classes));
    }
  }, [classes, isClient]);

  useEffect(() => {
    if (isClient && currentClassId) {
      localStorage.setItem(CLASS_PULSE_CURRENT_CLASS_ID_KEY, currentClassId);
    }
  }, [currentClassId, isClient]);
  
  const currentClass = classes.find(cls => cls.id === currentClassId) || null;

  // handleSelectClass is no longer needed as there's only one class and it's pre-selected.
  // If ClassSelector still calls it, it won't do much harm but could be removed from ClassSelector props.

  // Class creation, editing, and deletion handlers are removed.
  // handleShowAddClassModal, handleShowEditClassModal, handleCloseClassModal, handleSaveClass, handleDeleteClass removed.

  const handleAddStudent = useCallback((studentData: StudentFormData) => {
    if (!currentClassId) return;
    setIsLoadingStudent(true);
    const newStudent: Student = {
      id: `st_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...studentData,
      points: 0,
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

  const renderTabContent = () => {
    if (!isClient || !currentClass) { // Simplified loading/empty state check
      return <div className="flex justify-center items-center h-64"><p>Cargando...</p></div>;
    }
    
    // No need for "Bienvenido a ClassPulse" or "Selecciona una Clase" empty states as there's always one class selected.

    switch (activeTab) {
      case 'class-overview':
        // Removed onShowEditClassModal and onDeleteClass as class editing/deletion is removed
        return <ClassOverviewTab currentClass={currentClass} />;
      case 'add-student':
        return <AddStudentTab currentClass={currentClass} onAddStudent={handleAddStudent} isLoading={isLoadingStudent} />;
      case 'view-students':
        return <ViewStudentsTab currentClass={currentClass} onRemoveStudent={handleRemoveStudent} />;
      case 'manage-points':
        return <ManagePointsTab currentClass={currentClass} onUpdatePoints={handleUpdateStudentPoints} onResetPoints={handleResetStudentPoints} />;
      case 'leaderboard':
        return <LeaderboardTab currentClass={currentClass} />;
      default:
        return null;
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <AppHeader />
        <p className="text-primary text-lg">Cargando ClassPulse...</p>
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
          // onSelectClass is technically not needed now, but ClassSelector might expect it.
          // It won't break anything if it's called without effect.
          onSelectClass={() => {}} // No-op as there's only one class
          // onShowAddClassModal removed
        />
        {/* AppTabs disabled prop will always be false as currentClassId is always set */}
        <AppTabs activeTab={activeTab} onSelectTab={setActiveTab} disabled={false} /> 
        
        {currentClassId && <CurrentClassInfoCard currentClass={currentClass} />}

        <div className="bg-card p-4 md:p-6 rounded-lg shadow-lg min-h-[300px]">
          {renderTabContent()}
        </div>
      </main>
      {/* ClassModal component removed */}
      <footer className="text-center py-6 border-t border-border mt-auto">
        <p className="text-sm text-muted-foreground font-body">&copy; {new Date().getFullYear()} ClassPulse. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
