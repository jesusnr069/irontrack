
export enum MuscleGroup {
  Chest = 'Pecho',
  Back = 'Espalda',
  Legs = 'Piernas',
  Glutes = 'Glúteos',
  Shoulders = 'Hombros',
  Arms = 'Brazos',
  Core = 'Abdominales',
  Cardio = 'Cardio',
  Home = 'En Casa',
  Other = 'Otro'
}

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  description?: string;
  tips?: string[];
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number; // Esfuerzo percibido (1-10)
  notes?: string;
  isWarmup?: boolean; // New: Warmup set flag
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string; // e.g. "8-12"
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  color: string;
  description?: string;
  isHome?: boolean; // Flag to identify home workouts
}

export interface ExerciseLog {
  exerciseId: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  startTime: number;
  endTime?: number;
  routineId?: string; 
  name: string;
  exercises: ExerciseLog[];
}

export interface BodyMeasurement {
  id: string;
  date: number;
  weight: number; // kg
  bodyFat?: number; // %
  notes?: string;
}

export type ViewState = 'dashboard' | 'routines' | 'exercises' | 'history' | 'stats' | 'settings' | 'active_workout' | 'tools' | 'measurements';

export interface AppSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  defaultRestTimer: number; // Default rest time in seconds
}

export interface AppState {
  exercises: Exercise[];
  routines: Routine[];
  history: WorkoutLog[];
  measurements: BodyMeasurement[];
  activeWorkout: WorkoutLog | null;
  settings: AppSettings;
}
