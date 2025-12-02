
import { useState, useEffect } from 'react';
import { AppState, Exercise, Routine, WorkoutLog, MuscleGroup, BodyMeasurement } from '../types';
import { INITIAL_EXERCISES, INITIAL_ROUTINES } from '../constants';

const STORAGE_KEY = 'irontrack_pro_data_es_v4_pro';

const DEFAULT_STATE: AppState = {
  exercises: INITIAL_EXERCISES,
  routines: INITIAL_ROUTINES,
  history: [],
  measurements: [],
  activeWorkout: null,
  settings: {
    darkMode: true,
    soundEnabled: true,
    hapticsEnabled: true,
    defaultRestTimer: 90 // Default to 90 seconds
  }
};

export const useStore = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
          const parsed = JSON.parse(stored);
          // Merge with default setting for new keys to ensure defaultRestTimer exists
          return {
              ...DEFAULT_STATE,
              ...parsed,
              settings: { ...DEFAULT_STATE.settings, ...parsed.settings }
          };
      }
      return DEFAULT_STATE;
    } catch (e) {
      console.error("Error cargando datos", e);
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Apply dark mode class to html
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const addExercise = (name: string, muscle: MuscleGroup, description?: string) => {
    const newExercise: Exercise = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      muscle,
      description: description || 'Ejercicio personalizado creado por el usuario.',
      tips: ['Ejercicio personalizado'],
      notes: ''
    };
    setState(prev => ({ ...prev, exercises: [newExercise, ...prev.exercises] }));
  };

  const addRoutine = (routine: Routine) => {
    setState(prev => ({ ...prev, routines: [...prev.routines, routine] }));
  };

  const deleteRoutine = (id: string) => {
    setState(prev => ({ ...prev, routines: prev.routines.filter(r => r.id !== id) }));
  };

  const startWorkout = (routine?: Routine) => {
    const newWorkout: WorkoutLog = {
      id: Date.now().toString(),
      startTime: Date.now(),
      name: routine ? routine.name : 'Entrenamiento Libre',
      routineId: routine?.id,
      exercises: routine
        ? routine.exercises.map(re => ({
            exerciseId: re.exerciseId,
            sets: [
              { id: Date.now().toString() + Math.random(), weight: 0, reps: 0, completed: false, isWarmup: false }
            ]
          }))
        : [],
    };
    setState(prev => ({ ...prev, activeWorkout: newWorkout }));
  };

  const cancelWorkout = () => {
    setState(prev => ({ ...prev, activeWorkout: null }));
  };

  const finishWorkout = () => {
    if (!state.activeWorkout) return;
    const completedWorkout = { ...state.activeWorkout, endTime: Date.now() };
    setState(prev => ({
      ...prev,
      activeWorkout: null,
      history: [completedWorkout, ...prev.history]
    }));
  };

  const updateActiveWorkout = (workout: WorkoutLog) => {
    setState(prev => ({ ...prev, activeWorkout: workout }));
  };

  const addMeasurement = (weight: number, bodyFat?: number) => {
      const newMeasurement: BodyMeasurement = {
          id: Date.now().toString(),
          date: Date.now(),
          weight,
          bodyFat
      };
      // Add and sort by date descending
      setState(prev => {
          const newMeasurements = [newMeasurement, ...prev.measurements].sort((a,b) => b.date - a.date);
          return { ...prev, measurements: newMeasurements };
      });
  };

  const deleteMeasurement = (id: string) => {
      setState(prev => ({
          ...prev,
          measurements: prev.measurements.filter(m => m.id !== id)
      }));
  };

  const clearData = () => {
    if(confirm("¿Estás seguro? Esto borrará todo tu historial y ejercicios personalizados.")) {
      setState(DEFAULT_STATE);
    }
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      setState(parsed);
      alert("¡Datos importados correctamente!");
    } catch (e) {
      alert("JSON inválido");
    }
  };

  const toggleTheme = () => {
    setState(prev => ({
        ...prev,
        settings: { ...prev.settings, darkMode: !prev.settings.darkMode }
    }));
  };

  const updateSettings = (key: keyof AppState['settings'], value: boolean | number) => {
      setState(prev => ({
          ...prev,
          settings: { ...prev.settings, [key]: value }
      }));
  };

  return {
    state,
    actions: {
      addExercise,
      addRoutine,
      deleteRoutine,
      startWorkout,
      cancelWorkout,
      finishWorkout,
      updateActiveWorkout,
      addMeasurement,
      deleteMeasurement,
      clearData,
      importData,
      toggleTheme,
      updateSettings
    }
  };
};
