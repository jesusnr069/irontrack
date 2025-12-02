
import React, { useState, useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { ViewState, ExerciseLog, Exercise, MuscleGroup } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { Routines } from './screens/Routines';
import { ActiveWorkout } from './screens/ActiveWorkout';
import { History } from './screens/History';
import { Exercises } from './screens/Exercises';
import { Stats } from './screens/Stats';
import { Settings } from './screens/Settings';
import { Tools } from './screens/Tools';
import { Measurements } from './screens/Measurements';
import { Check, CheckCircle2 } from 'lucide-react';

function App() {
  const { state, actions } = useStore();
  const [currentView, setView] = useState<ViewState>('dashboard');
  const [exerciseSelectorOpen, setExerciseSelectorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
        const timer = setTimeout(() => setToastMessage(null), 1500);
        return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
      setToastMessage(msg);
  };

  const handleAddExerciseToWorkout = (exercise: Exercise) => {
    if (!state.activeWorkout) return;
    
    // Check if already exists? Maybe not, allow duplicates (supersets etc)
    const newLog: ExerciseLog = {
        exerciseId: exercise.id,
        sets: [
            { id: Date.now().toString(), weight: 0, reps: 0, completed: false, rpe: 8, isWarmup: false }
        ]
    };
    
    const updatedWorkout = {
        ...state.activeWorkout,
        exercises: [...state.activeWorkout.exercises, newLog]
    };
    
    actions.updateActiveWorkout(updatedWorkout);
    // CRITICAL: We DO NOT close the selector here to allow multi-select.
    // setExerciseSelectorOpen(false); 
    showToast(`${exercise.name} añadido`);
  };

  const renderContent = () => {
    // Modal Overlay for Exercise Selection (Multi-select supported)
    if (exerciseSelectorOpen) {
        return (
            <div className="h-full relative flex flex-col bg-white dark:bg-surface animate-in slide-in-from-bottom-5">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-surface sticky top-0 z-10 shadow-sm">
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white text-lg">Añadir a rutina</h2>
                        <p className="text-xs text-gray-500">Toca para añadir múltiples</p>
                    </div>
                    <button 
                        onClick={() => setExerciseSelectorOpen(false)} 
                        className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-primary/30 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Check size={16} /> Listo
                    </button>
                </div>
                
                <div className="flex-1 overflow-hidden">
                    <Exercises 
                      exercises={state.exercises} 
                      history={state.history}
                      onSelect={handleAddExerciseToWorkout} 
                      onCreateExercise={actions.addExercise}
                    />
                </div>
                
                {/* Toast Notification Layer inside Modal */}
                {toastMessage && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-max max-w-[90%]">
                        <div className="bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-bottom-5 border border-white/10 dark:border-black/5">
                            <CheckCircle2 size={18} className="text-green-500 dark:text-green-600 shrink-0" />
                            {toastMessage}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            history={state.history} 
            routines={state.routines} 
            setView={setView}
            startWorkout={actions.startWorkout}
          />
        );
      case 'routines':
        return (
          <Routines 
            routines={state.routines} 
            startWorkout={(r) => {
                actions.startWorkout(r);
                setView('active_workout');
            }}
            deleteRoutine={actions.deleteRoutine}
            createRoutine={actions.addRoutine}
            exercises={state.exercises}
          />
        );
      case 'active_workout':
        if (!state.activeWorkout) {
             return (
                 <div className="h-full flex flex-col items-center justify-center p-10 text-center text-gray-500">
                     <p>No hay entrenamiento activo.</p>
                     <button onClick={() => setView('dashboard')} className="mt-4 text-primary font-bold">Volver al Inicio</button>
                 </div>
             );
        }
        return (
          <ActiveWorkout 
            workout={state.activeWorkout}
            exercises={state.exercises}
            history={state.history}
            settings={state.settings}
            updateWorkout={actions.updateActiveWorkout}
            finishWorkout={() => {
                actions.finishWorkout();
                setView('history');
            }}
            cancelWorkout={() => {
                if(confirm("¿Cancelar entrenamiento? Perderás el progreso de hoy.")) {
                    actions.cancelWorkout();
                    setView('dashboard');
                }
            }}
            onAddExercise={() => setExerciseSelectorOpen(true)}
          />
        );
      case 'history':
        return <History history={state.history} exercises={state.exercises} />;
      case 'exercises':
        return (
          <Exercises 
            exercises={state.exercises} 
            history={state.history}
            onCreateExercise={actions.addExercise}
          />
        );
      case 'stats':
        return <Stats history={state.history} exercises={state.exercises} />;
      case 'tools':
        return <Tools />;
      case 'measurements':
        return (
            <Measurements 
                measurements={state.measurements || []} 
                onAdd={actions.addMeasurement} 
                onDelete={actions.deleteMeasurement} 
            />
        );
      case 'settings':
        return (
            <Settings 
                clearData={actions.clearData}
                exportData={() => JSON.stringify(state)}
                importData={actions.importData}
                toggleTheme={actions.toggleTheme}
                isDarkMode={state.settings.darkMode}
                soundEnabled={state.settings.soundEnabled}
                hapticsEnabled={state.settings.hapticsEnabled}
                defaultRestTimer={state.settings.defaultRestTimer}
                onUpdateSetting={actions.updateSettings}
            />
        );
      default:
        return <div className="p-5">Vista no encontrada</div>;
    }
  };

  return (
    <Layout 
        currentView={currentView} 
        setView={(v) => {
            setExerciseSelectorOpen(false); 
            setView(v);
        }}
        hasActiveWorkout={!!state.activeWorkout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
