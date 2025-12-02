
import React from 'react';
import { WorkoutLog, Exercise, MuscleGroup } from '../types';
import { TrendingUp, Layers, Calendar, Trophy, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface StatsProps {
  history: WorkoutLog[];
  exercises: Exercise[];
}

export const Stats: React.FC<StatsProps> = ({ history, exercises }) => {
  
  // --- CALCULATION LOGIC ---

  const totalWorkouts = history.length;
  
  // Total Volume (All time)
  const totalVolume = history.reduce((acc, h) => {
       return acc + h.exercises.reduce((exAcc, ex) => {
           return exAcc + ex.sets.reduce((sAcc, s) => s.completed ? sAcc + (s.weight * s.reps) : sAcc, 0);
       }, 0);
  }, 0);

  // Muscle Distribution Data
  const muscleDistribution = React.useMemo(() => {
      const counts: Record<string, number> = {};
      
      history.forEach(h => {
          h.exercises.forEach(exLog => {
              const exDef = exercises.find(e => e.id === exLog.exerciseId);
              if (exDef) {
                  const sets = exLog.sets.filter(s => s.completed).length;
                  if (sets > 0) {
                    counts[exDef.muscle] = (counts[exDef.muscle] || 0) + sets;
                  }
              }
          });
      });

      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort descending
  }, [history, exercises]);

  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

  // Weekly Consistency (Last 7 Days)
  const weeklyStats = React.useMemo(() => {
      const today = new Date();
      const stats = [];
      let workoutsInLast7Days = 0;

      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase();
          
          const hasWorkout = history.some(h => {
              const hDate = new Date(h.startTime);
              return hDate.getDate() === d.getDate() && 
                     hDate.getMonth() === d.getMonth() && 
                     hDate.getFullYear() === d.getFullYear();
          });

          if (hasWorkout) workoutsInLast7Days++;

          stats.push({
              day: dateStr,
              active: hasWorkout
          });
      }
      return { days: stats, count: workoutsInLast7Days };
  }, [history]);

  const getConsistencyColor = (count: number) => {
      if (count >= 4) return { color: 'bg-green-500', text: 'text-green-500', label: '¡Excelente!', width: '100%' };
      if (count >= 2) return { color: 'bg-yellow-500', text: 'text-yellow-500', label: 'Bueno', width: '60%' };
      return { color: 'bg-red-500', text: 'text-red-500', label: 'Mejorable', width: '30%' };
  };

  const consistencyStatus = getConsistencyColor(weeklyStats.count);

  const getPR = (exerciseId: string) => {
      let maxWeight = 0;
      history.forEach(workout => {
          const exLog = workout.exercises.find(e => e.exerciseId === exerciseId);
          if (exLog) {
              exLog.sets.forEach(set => {
                  if (set.completed && set.weight > maxWeight) {
                      maxWeight = set.weight;
                  }
              });
          }
      });
      return maxWeight;
  };

  const bestLifts = [
      { name: 'Peso Muerto', id: 'bk_14', weight: getPR('bk_14') }, 
      { name: 'Sentadilla', id: 'lg_1', weight: getPR('lg_1') },
      { name: 'Press Banca', id: 'ch_1', weight: getPR('ch_1') },
      { name: 'Press Militar', id: 'sh_1', weight: getPR('sh_1') },
  ].filter(l => l.weight > 0);

  return (
    <div className="p-5 space-y-6 pb-24 animate-fade-in">
       <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estadísticas</h1>
        <p className="text-sm text-gray-500">Tu progreso en números</p>
      </header>

      {/* Big Numbers */}
      <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 text-blue-100 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-xs font-bold uppercase">Total Vol.</span>
              </div>
              <div className="text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}k <span className="text-sm font-normal opacity-80">kg</span></div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                  <Layers size={16} />
                  <span className="text-xs font-bold uppercase">Sesiones</span>
              </div>
              <div className="text-2xl font-bold">{totalWorkouts}</div>
          </div>
      </div>

      {/* Consistency Section */}
      <div className="bg-white dark:bg-surface p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
                <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <Calendar size={16} /> Consistencia Semanal
                </h3>
                <span className={`text-xs font-bold ${consistencyStatus.text}`}>{weeklyStats.count} entrenamientos</span>
            </div>
            
            <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${consistencyStatus.color} transition-all duration-1000 ease-out`} 
                    style={{ width: `${(weeklyStats.count / 7) * 100}%` }}
                />
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between h-24 gap-2">
                {weeklyStats.days.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                        <div className="flex-1 flex flex-col justify-end">
                            <div 
                                className={`w-full rounded-md transition-all duration-500 ${d.active ? 'bg-primary h-full' : 'bg-gray-100 dark:bg-white/5 h-[10%] group-hover:h-[20%]'}`}
                            ></div>
                        </div>
                        <span className={`text-[10px] text-center mt-2 ${d.active ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {d.day}
                        </span>
                    </div>
                ))}
            </div>
          </div>
      </div>

      {/* Muscle Distribution Chart */}
      <div className="bg-white dark:bg-surface p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
           <div className="flex items-center gap-2 mb-4">
              <PieIcon size={18} className="text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-500">Distribución Muscular (Series)</h3>
           </div>
           
           <div className="h-64 w-full relative">
               {muscleDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={muscleDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {muscleDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
               ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                        Sin datos suficientes
                    </div>
               )}
               {/* Legend Overlay */}
               {muscleDistribution.length > 0 && (
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                       <span className="text-2xl font-bold text-gray-900 dark:text-white">
                           {muscleDistribution.reduce((a,b) => a + b.value, 0)}
                       </span>
                       <div className="text-[10px] text-gray-500 uppercase">Series Totales</div>
                   </div>
               )}
           </div>
           
           <div className="grid grid-cols-2 gap-2 mt-4">
               {muscleDistribution.slice(0, 6).map((item, index) => (
                   <div key={item.name} className="flex items-center gap-2 text-xs">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                       <span className="text-gray-600 dark:text-gray-300 flex-1">{item.name}</span>
                       <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                   </div>
               ))}
           </div>
      </div>

      {/* Best Lifts Section */}
      <div className="bg-white dark:bg-surface p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-yellow-500" />
            <h3 className="text-sm font-semibold text-gray-500">Mejores Levantamientos (Big 4)</h3>
          </div>
          
          <div className="space-y-4">
              {bestLifts.length > 0 ? (
                  bestLifts.map((lift, i) => (
                      <div key={i} className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 dark:text-gray-200">{lift.name}</span>
                              <span className="text-lg font-bold text-gray-900 dark:text-white">{lift.weight} <span className="text-xs font-normal text-gray-500">kg</span></span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                               <div 
                                    style={{width: `${Math.min((lift.weight / 200) * 100, 100)}%`}} 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                               />
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-6 text-gray-400 text-xs">
                      <p>Aún no hay registros de ejercicios principales.</p>
                      <p className="mt-1">(Sentadilla, Banca, Peso Muerto, Militar)</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
