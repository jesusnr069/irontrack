
import React, { useState } from 'react';
import { WorkoutLog, Exercise } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Dumbbell, MapPin, X } from 'lucide-react';

interface HistoryProps {
  history: WorkoutLog[];
  exercises?: Exercise[]; // Optional for now to keep type safety if parent doesn't pass immediately, though App does.
}

export const History: React.FC<HistoryProps> = ({ history, exercises = [] }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper to generate calendar grid
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    // Adjust for Monday start (Spanish standard)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; 
    return { days, firstDay: adjustedFirstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentMonth);
  const daysArray = Array.from({ length: days }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const getWorkoutsForDate = (date: Date) => {
    return history.filter(log => isSameDay(new Date(log.startTime), date));
  };

  const hasWorkout = (day: number) => {
      const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return history.some(log => isSameDay(new Date(log.startTime), checkDate));
  };

  const selectedWorkouts = getWorkoutsForDate(selectedDate);

  const getExerciseName = (id: string) => {
      return exercises.find(e => e.id === id)?.name || 'Ejercicio desconocido';
  };

  return (
    <div className="p-5 space-y-6 pb-24 h-full flex flex-col">
       <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial</h1>
        <p className="text-sm text-gray-500">Calendario de entrenamientos</p>
      </header>

      {/* Calendar Component */}
      <div className="bg-white dark:bg-surface rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                  <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300"/>
              </button>
              <h2 className="font-bold text-gray-900 dark:text-white capitalize">
                  {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                  <ChevronRight size={20} className="text-gray-600 dark:text-gray-300"/>
              </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                  <span key={d} className="text-xs font-bold text-gray-400">{d}</span>
              ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
              {paddingArray.map(i => <div key={`pad-${i}`} />)}
              {daysArray.map(day => {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isSelected = isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, new Date());
                  const hasWkt = hasWorkout(day);

                  return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={`h-9 w-9 rounded-full flex flex-col items-center justify-center text-sm font-medium transition-all relative
                            ${isSelected 
                                ? 'bg-primary text-white shadow-md' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                            }
                            ${isToday && !isSelected ? 'border border-primary text-primary' : ''}
                        `}
                      >
                          {day}
                          {hasWkt && !isSelected && (
                              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></div>
                          )}
                      </button>
                  );
              })}
          </div>
      </div>

      {/* Selected Date Details */}
      <div className="flex-1">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <CalendarIcon size={16} className="text-primary"/>
              {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          <div className="space-y-4">
              {selectedWorkouts.length > 0 ? (
                  selectedWorkouts.map(log => {
                      const duration = log.endTime ? Math.round((log.endTime - log.startTime) / 60000) : 0;
                      return (
                          <div key={log.id} className="bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
                              <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                  <div>
                                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{log.name}</h4>
                                      <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                                          <span className="flex items-center gap-1"><Clock size={12}/> {duration} min</span>
                                          <span className="flex items-center gap-1"><Dumbbell size={12}/> {log.exercises.length} Ejercicios</span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="p-4 space-y-4">
                                  {log.exercises.map((ex, i) => (
                                      <div key={i} className="text-sm">
                                          <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                              {getExerciseName(ex.exerciseId)}
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                              {ex.sets.filter(s => s.completed).map((s, idx) => (
                                                  <div key={idx} className="bg-gray-100 dark:bg-background px-2 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                                                      <span className="font-bold text-gray-900 dark:text-white">{s.weight}kg</span> x {s.reps}
                                                  </div>
                                              ))}
                                              {ex.sets.filter(s => s.completed).length === 0 && (
                                                  <span className="text-xs text-gray-400 italic">Sin series completadas</span>
                                              )}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      );
                  })
              ) : (
                  <div className="text-center py-10 bg-gray-50 dark:bg-surface/50 rounded-xl border-dashed border-2 border-gray-200 dark:border-white/10">
                      <p className="text-gray-400 text-sm">No hay entrenamientos registrados este día.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
