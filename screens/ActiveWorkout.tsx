
import React, { useState, useEffect, useRef } from 'react';
import { WorkoutLog, Exercise, ExerciseSet, AppSettings } from '../types';
import { Check, Plus, Trash2, Clock, MoreVertical, Timer, AlertCircle, Ghost, Flame, Disc, Trophy, X, ArrowRight, Share2 } from 'lucide-react';
import { playSound } from '../utils/audio';

interface ActiveWorkoutProps {
  workout: WorkoutLog;
  exercises: Exercise[];
  history: WorkoutLog[];
  settings: AppSettings;
  updateWorkout: (workout: WorkoutLog) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  onAddExercise: () => void; 
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ 
  workout, 
  exercises, 
  history,
  settings,
  updateWorkout, 
  finishWorkout, 
  cancelWorkout,
  onAddExercise 
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [showRestModal, setShowRestModal] = useState(false);
  
  // New States for "Elite" features
  const [showVictory, setShowVictory] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState<{exIdx: number, setIdx: number} | null>(null);
  const [brokenPRs, setBrokenPRs] = useState<string[]>([]);
  
  // Refs for audio throttle
  const lastTickRef = useRef(0);

  // Live Volume Calculation
  const currentVolume = workout.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => (s.completed && !s.isWarmup) ? sAcc + (s.weight * s.reps) : sAcc, 0);
  }, 0);

  // Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workout.startTime) / 1000));
      
      if (restTimer !== null && restTimer > 0) {
          setRestTimer(prev => {
              const newVal = (prev || 0) - 1;
              // Audio Feedback for last 3 seconds
              if (newVal <= 3 && newVal > 0 && settings.soundEnabled) {
                  playSound('tick');
              }
              return newVal;
          });
      } else if (restTimer === 0) {
          // Timer finished
          setRestTimer(null);
          if (settings.hapticsEnabled && navigator.vibrate) navigator.vibrate([200, 100, 200]);
          if (settings.soundEnabled) playSound('start');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [workout.startTime, restTimer, settings]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => {
    const newExercises = [...workout.exercises];
    const targetSet = newExercises[exerciseIndex].sets[setIndex];
    const exerciseId = newExercises[exerciseIndex].exerciseId;

    // PR Detection Logic
    if (field === 'completed' && value === true && !targetSet.completed && !targetSet.isWarmup) {
        // Use default rest timer from settings or fallback to 90s
        startRestTimer(settings.defaultRestTimer || 90);
        
        // Check PR
        if (targetSet.weight > 0) {
            const previousMax = getPreviousMax(exerciseId);
            if (targetSet.weight > previousMax) {
                if (!brokenPRs.includes(exerciseId)) {
                    setBrokenPRs(prev => [...prev, exerciseId]);
                    if(settings.soundEnabled) playSound('record');
                    // Simple inline visual feedback handled by rendering
                }
            }
        }
    }

    newExercises[exerciseIndex].sets[setIndex] = {
      ...targetSet,
      [field]: value
    };
    updateWorkout({ ...workout, exercises: newExercises });
  };

  const getPreviousMax = (exId: string) => {
      let max = 0;
      history.forEach(h => {
          const ex = h.exercises.find(e => e.exerciseId === exId);
          if (ex) {
              ex.sets.forEach(s => { if (s.completed && s.weight > max) max = s.weight; });
          }
      });
      return max;
  };

  const startRestTimer = (seconds: number) => {
      setRestTimer(seconds);
      setShowRestModal(true);
      if (settings.soundEnabled) playSound('beep');
  };

  const addRestTime = (seconds: number) => {
      setRestTimer(prev => (prev || 0) + seconds);
  };

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...workout.exercises];
    const previousSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
    
    newExercises[exerciseIndex].sets.push({
      id: Date.now().toString(),
      weight: previousSet ? previousSet.weight : 0,
      reps: previousSet ? previousSet.reps : 0,
      completed: false,
      rpe: 8,
      isWarmup: false
    });
    updateWorkout({ ...workout, exercises: newExercises });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...workout.exercises];
    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    updateWorkout({ ...workout, exercises: newExercises });
  };

  const removeExercise = (exerciseIndex: number) => {
      if(confirm("¿Eliminar este ejercicio?")) {
        const newExercises = [...workout.exercises];
        newExercises.splice(exerciseIndex, 1);
        updateWorkout({ ...workout, exercises: newExercises });
      }
  };

  // --- GHOST MODE LOGIC ---
  const getPreviousSetData = (exerciseId: string, setIndex: number) => {
      for (const log of history) {
          const exLog = log.exercises.find(e => e.exerciseId === exerciseId);
          if (exLog && exLog.sets[setIndex] && exLog.sets[setIndex].completed) {
              return `${exLog.sets[setIndex].weight}kg x ${exLog.sets[setIndex].reps}`;
          }
      }
      return null;
  };

  // --- VICTORY SCREEN ---
  const handleComplete = () => {
      if(settings.soundEnabled) playSound('finish');
      setShowVictory(true);
  };

  const calculatePlates = (weight: number) => {
      const bar = 20;
      if (weight <= bar) return "Barra sola";
      let remaining = (weight - bar) / 2;
      const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
      const result = [];
      for (const p of plates) {
          while (remaining >= p) {
              result.push(p);
              remaining -= p;
          }
      }
      return result.join(', ');
  };

  if (showVictory) {
      return (
          <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col items-center justify-center p-6 animate-in fade-in">
              <div className="confetti-container absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                      <div key={i} className="confetti" style={{ 
                          left: `${Math.random() * 100}%`, 
                          animationDelay: `${Math.random() * 2}s`,
                          backgroundColor: ['#ff0', '#f00', '#0f0', '#00f'][Math.floor(Math.random() * 4)]
                      }} />
                  ))}
              </div>

              <div className="z-10 w-full max-w-md bg-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-8 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  
                  <div>
                      <Trophy size={64} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
                      <h1 className="text-3xl font-black italic tracking-tighter">¡SESIÓN ÉPICA!</h1>
                      <p className="text-gray-400">Has dominado el hierro hoy.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl">
                          <div className="text-2xl font-bold">{Math.round(elapsed / 60)}</div>
                          <div className="text-xs text-gray-400 uppercase font-bold">Minutos</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl">
                          <div className="text-2xl font-bold">{(currentVolume / 1000).toFixed(1)}k</div>
                          <div className="text-xs text-gray-400 uppercase font-bold">Volumen (kg)</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl col-span-2">
                          <div className="text-2xl font-bold text-green-400">{brokenPRs.length}</div>
                          <div className="text-xs text-gray-400 uppercase font-bold">Récords Rotos</div>
                      </div>
                  </div>

                  <button 
                    onClick={finishWorkout}
                    className="w-full py-4 bg-primary hover:bg-indigo-600 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
                  >
                      Guardar y Finalizar
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-background animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-surface/95 backdrop-blur z-20 border-b border-gray-200 dark:border-white/5 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg truncate pr-4 text-gray-900 dark:text-white max-w-[60%]">{workout.name}</h2>
             <div onClick={() => setShowRestModal(true)} className={`flex items-center space-x-2 px-3 py-1 rounded-full border cursor-pointer transition-colors ${restTimer ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-background border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300'}`}>
                {restTimer ? <Timer size={14} className="animate-pulse" /> : <Clock size={14} />}
                <span className="font-mono text-sm font-semibold">{restTimer ? formatTime(restTimer) : formatTime(elapsed)}</span>
            </div>
        </div>
        <div className="flex justify-between items-center">
             <div className="text-xs font-bold text-gray-400">
                VOL: <span className="text-gray-900 dark:text-white">{(currentVolume / 1000).toFixed(1)}k</span> kg
            </div>
            <div className="flex gap-2">
                <button onClick={cancelWorkout} className="text-red-500 text-xs font-bold px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded uppercase">Cancelar</button>
                <button 
                    onClick={handleComplete} 
                    className="bg-primary hover:bg-indigo-600 text-white px-5 py-1.5 rounded-full font-bold text-sm shadow-md shadow-indigo-500/20 transition-transform active:scale-95"
                >
                    Terminar
                </button>
            </div>
        </div>
      </div>

      {/* Rest Timer Overlay */}
      {showRestModal && restTimer !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-surface w-full max-w-xs rounded-3xl p-6 text-center shadow-2xl border border-gray-200 dark:border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
                  <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Descansando</h3>
                  <div className="text-7xl font-mono font-black text-gray-900 dark:text-white mb-6 tracking-tighter tabular-nums">
                      {formatTime(restTimer)}
                  </div>
                  
                  <div className="flex justify-center gap-3 mb-6">
                      <button onClick={() => addRestTime(10)} className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-full font-bold hover:bg-primary/10 hover:text-primary transition-colors">+10</button>
                      <button onClick={() => addRestTime(30)} className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-full font-bold hover:bg-primary/10 hover:text-primary transition-colors">+30</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowRestModal(false)} className="py-3 text-gray-500 dark:text-gray-400 font-bold text-sm">Ocultar</button>
                    <button onClick={() => { setRestTimer(null); setShowRestModal(false); }} className="py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30">¡A DARLE!</button>
                  </div>
              </div>
          </div>
      )}

      {/* Calculator Popover */}
      {calculatorOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setCalculatorOpen(null)}>
              <div className="bg-white dark:bg-surface p-4 w-full sm:max-w-xs sm:rounded-2xl rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white">Calculadora de Discos</h3>
                      <button onClick={() => setCalculatorOpen(null)}><X size={20} /></button>
                  </div>
                  <div className="text-center py-4">
                      <div className="text-sm text-gray-500 mb-1">Para {workout.exercises[calculatorOpen.exIdx].sets[calculatorOpen.setIdx].weight} kg (por lado):</div>
                      <div className="text-xl font-mono font-bold text-primary">
                          {calculatePlates(workout.exercises[calculatorOpen.exIdx].sets[calculatorOpen.setIdx].weight)}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">Barra Olímpica (20kg) incluída</div>
                  </div>
              </div>
          </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {workout.exercises.map((exLog, exIndex) => {
          const exerciseDef = exercises.find(e => e.id === exLog.exerciseId);
          const prBroken = brokenPRs.includes(exLog.exerciseId);

          return (
            <div key={exLog.exerciseId + exIndex} className={`bg-white dark:bg-surface rounded-xl overflow-hidden border ${prBroken ? 'border-yellow-500/50 shadow-yellow-500/10' : 'border-gray-200 dark:border-white/5'} shadow-sm relative transition-all`}>
              {prBroken && <div className="absolute top-0 right-0 p-1"><Trophy size={16} className="text-yellow-400 fill-current" /></div>}
              
              <div className="p-3 bg-gray-50 dark:bg-white/5 flex justify-between items-center border-b border-gray-200 dark:border-white/5">
                <div className="max-w-[80%]">
                    <h3 className="font-bold text-gray-900 dark:text-indigo-100 truncate">{exerciseDef?.name || 'Ejercicio'}</h3>
                </div>
                <button onClick={() => removeExercise(exIndex)} className="text-gray-400 hover:text-red-500 p-2">
                    <Trash2 size={16} />
                </button>
              </div>
              
              <div className="p-2">
                <div className="grid grid-cols-12 gap-1 mb-2 text-[9px] text-gray-400 font-bold text-center uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Kilos</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-4">Acciones</div>
                </div>
                
                <div className="space-y-2">
                {exLog.sets.map((set, setIndex) => {
                  const ghostData = getPreviousSetData(exLog.exerciseId, setIndex);
                  return (
                    <div key={set.id} className="relative group">
                        {/* Ghost Data */}
                        {ghostData && !set.completed && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-[9px] text-gray-400 bg-white dark:bg-background px-1 z-10 flex items-center gap-1 opacity-60 pointer-events-none">
                                <Ghost size={8} /> {ghostData}
                            </div>
                        )}
                        
                        <div className={`grid grid-cols-12 gap-1 items-center p-1 rounded-lg transition-colors ${set.completed ? (set.isWarmup ? 'bg-orange-50/50 dark:bg-orange-900/10 opacity-70' : 'bg-green-50/50 dark:bg-green-900/10 opacity-70') : ''}`}>
                            <div className="col-span-1 flex justify-center">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${set.isWarmup ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                    {set.isWarmup ? 'W' : setIndex + 1}
                                </div>
                            </div>
                            
                            <div className="col-span-4 relative">
                                <input
                                    type="number"
                                    value={set.weight || ''}
                                    onChange={(e) => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value))}
                                    placeholder="0"
                                    className="w-full bg-gray-100 dark:bg-black/20 border border-transparent focus:border-primary rounded-lg py-2 pl-2 pr-6 text-center font-mono text-sm font-bold text-gray-900 dark:text-white outline-none"
                                />
                                {set.weight > 20 && (
                                    <button 
                                        onClick={() => setCalculatorOpen({exIdx: exIndex, setIdx: setIndex})}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                    >
                                        <Disc size={12} />
                                    </button>
                                )}
                            </div>
                            
                            <div className="col-span-3">
                                <input
                                    type="number"
                                    value={set.reps || ''}
                                    onChange={(e) => updateSet(exIndex, setIndex, 'reps', parseFloat(e.target.value))}
                                    placeholder="0"
                                    className="w-full bg-gray-100 dark:bg-black/20 border border-transparent focus:border-primary rounded-lg py-2 text-center font-mono text-sm font-bold text-gray-900 dark:text-white outline-none"
                                />
                            </div>
                            
                            <div className="col-span-4 flex justify-between gap-1 pl-1">
                                <button
                                    onClick={() => updateSet(exIndex, setIndex, 'isWarmup', !set.isWarmup)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${set.isWarmup ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/20' : 'text-gray-300 hover:text-orange-400'}`}
                                >
                                    <Flame size={16} />
                                </button>
                                <button
                                    onClick={() => updateSet(exIndex, setIndex, 'completed', !set.completed)}
                                    className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${
                                        set.completed ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-gray-200 dark:bg-white/10 text-gray-400'
                                    }`}
                                >
                                    <Check size={18} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                  );
                })}
                </div>

                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
                    <button 
                        onClick={() => addSet(exIndex)}
                        className="flex-1 py-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors uppercase"
                    >
                        <Plus size={14} /> Añadir Serie
                    </button>
                </div>
              </div>
            </div>
          );
        })}

        <button 
            onClick={onAddExercise}
            className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2 group"
        >
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Agregar Ejercicio</span>
        </button>
        
        <div className="h-20"></div>
      </div>
    </div>
  );
};
