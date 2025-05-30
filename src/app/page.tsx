'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Class, Student, TabKey } from '@/types';
import { StudentFormData } from '@/components/student/StudentForm';
import { INITIAL_CLASSES_DATA, NAV_TAB_ITEMS } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';


// UI Components
import AppHeader from '@/components/layout/AppHeader';
import ClassSelector from '@/components/class/ClassSelector';
import ClassModal from '@/components/class/ClassModal';
import AppTabs from '@/components/navigation/AppTabs';
import CurrentClassInfoCard from '@/components/class/CurrentClassInfoCard';
import EmptyState from '@/components/ui/EmptyState';

// Tab Content Components
import ClassOverviewTab from '@/components/tabs/ClassOverviewTab';
import AddStudentTab from '@/components/tabs/AddStudentTab';
import ViewStudentsTab from '@/components/tabs/ViewStudentsTab';
import ManagePointsTab from '@/components/tabs/ManagePointsTab';
import LeaderboardTab from '@/components/tabs/LeaderboardTab';
import { BookOpen } from 'lucide-react';

export default function HomePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(NAV_TAB_ITEMS[0].id);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // Load initial data or from localStorage if implemented
    setClasses(INITIAL_CLASSES_DATA);
    if (INITIAL_CLASSES_DATA.length > 0) {
      setCurrentClassId(INITIAL_CLASSES_DATA[0].id);
    }
  }, []);
  
  const currentClass = classes.find(cls => cls.id === currentClassId) || null;

  const handleSelectClass = useCallback((classId: string) => {
    setCurrentClassId(classId);
    setActiveTab(NAV_TAB_ITEMS[0].id); // Reset to overview tab on class change
  }, []);

  const handleShowAddClassModal = useCallback(() => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  }, []);

  const handleShowEditClassModal = useCallback(() => {
    if (currentClass) {
      setEditingClass(currentClass);
      setIsClassModalOpen(true);
    }
  }, [currentClass]);

  const handleCloseClassModal = useCallback(() => {
    setIsClassModalOpen(false);
    setEditingClass(null);
  }, []);

  const handleSaveClass = useCallback((data: { name: string; subject: string; description?: string }, classId?: string) => {
    if (classId) { // Editing existing class
      setClasses(prev => prev.map(cls => cls.id === classId ? { ...cls, ...data } : cls));
      toast({ title: "Clase Actualizada", description: `La clase "${data.name}" ha sido actualizada.` });
    } else { // Creating new class
      const newClassId = `cl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newClass: Class = { id: newClassId, ...data, students: [] };
      setClasses(prev => [...prev, newClass]);
      setCurrentClassId(newClassId); // Select the new class
      setActiveTab(NAV_TAB_ITEMS[0].id); // Go to overview
      toast({ title: "Clase Creada", description: `La clase "${data.name}" ha sido creada.` });
    }
    handleCloseClassModal();
  }, [toast, handleCloseClassModal]);

  const handleDeleteClass = useCallback(() => {
    if (!currentClassId) return;
    const classToDelete = classes.find(c => c.id === currentClassId);
    if (!classToDelete) return;

    // Basic confirm, consider ShadCN AlertDialog for better UX
    if (window.confirm(`¿Estás seguro de eliminar la clase "${classToDelete.name}"? Esta acción no se puede deshacer.`)) {
      setClasses(prev => prev.filter(cls => cls.id !== currentClassId));
      const remainingClasses = classes.filter(cls => cls.id !== currentClassId);
      if (remainingClasses.length > 0) {
        setCurrentClassId(remainingClasses[0].id);
      } else {
        setCurrentClassId(null);
      }
      toast({ title: "Clase Eliminada", description: `La clase "${classToDelete.name}" ha sido eliminada.`, variant: "destructive" });
    }
  }, [classes, currentClassId, toast]);

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
    if (!isClient) return <div className="flex justify-center items-center h-64"><p>Cargando...</p></div>;
    if (!currentClass && activeTab !== 'class-overview' && classes.length > 0) {
       return (
         <EmptyState 
          icon={<BookOpen className="w-16 h-16" />}
          title="Selecciona una Clase"
          message="Por favor, selecciona una clase de la lista para continuar."
        />
       );
    }
     if (classes.length === 0 && !currentClassId) {
      return (
         <EmptyState 
          icon={<BookOpen className="w-16 h-16" />}
          title="Bienvenido a ClassPulse"
          message="Comienza creando tu primera clase para gestionar estudiantes y actividades."
          actions={<Button onClick={handleShowAddClassModal}>Crear Nueva Clase</Button>}
        />
      );
    }


    switch (activeTab) {
      case 'class-overview':
        return <ClassOverviewTab currentClass={currentClass} onShowEditClassModal={handleShowEditClassModal} onDeleteClass={handleDeleteClass} />;
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
          onSelectClass={handleSelectClass}
          onShowAddClassModal={handleShowAddClassModal}
        />
        <AppTabs activeTab={activeTab} onSelectTab={setActiveTab} disabled={!currentClassId && classes.length > 0} />
        
        {currentClassId && <CurrentClassInfoCard currentClass={currentClass} />}

        <div className="bg-card p-4 md:p-6 rounded-lg shadow-lg min-h-[300px]">
          {renderTabContent()}
        </div>
      </main>
      <ClassModal 
        isOpen={isClassModalOpen}
        onClose={handleCloseClassModal}
        onSave={handleSaveClass}
        editingClass={editingClass}
      />
      <footer className="text-center py-6 border-t border-border mt-auto">
        <p className="text-sm text-muted-foreground font-body">&copy; {new Date().getFullYear()} ClassPulse. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
