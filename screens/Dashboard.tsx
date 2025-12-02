
import React, { useState, useEffect } from 'react';
import { ViewState, WorkoutLog, Routine } from '../types';
import { Plus, ChevronRight, Activity, Calendar, Trophy, Zap, BarChart2, RefreshCw, Calculator, Ruler, Play } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  history: WorkoutLog[];
  routines: Routine[];
  setView: (view: ViewState) => void;
  startWorkout: (routine?: Routine) => void;
}

const MOTIVATIONAL_QUOTES = [
  "El dolor que sientes hoy es la fuerza que sentirás mañana.",
  "No cuentes los días, haz que los días cuenten.",
  "Tu cuerpo puede aguantar casi todo. Es a tu mente a la que tienes que convencer.",
  "La única mala sesión de entrenamiento es la que no sucedió.",
  "La disciplina es hacer lo que tienes que hacer, incluso cuando no quieres hacerlo.",
  "No pares cuando estés cansado, para cuando hayas terminado.",
  "Roma no se construyó en un día, pero trabajaban en ella cada día.",
  "Suda ahora, brilla después.",
  "La motivación es lo que te pone en marcha. El hábito es lo que hace que sigas.",
  "Si fuera fácil, todo el mundo lo haría.",
  "Convierte tus excusas en esfuerzo.",
  "Tu única competencia es quien eras ayer.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día."
];

export const Dashboard: React.FC<DashboardProps> = ({ history, routines, setView, startWorkout }) => {
  const lastWorkout = history[0];
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Set initial random quote on mount
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  const changeQuote = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other clicks if necessary
    let newQuote = quote;
    // Ensure we get a different quote
    while (newQuote === quote && MOTIVATIONAL_QUOTES.length > 1) {
        newQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    }
    setQuote(newQuote);
  };
  
  const weeklyData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    for(let i=6; i>=0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 1).toUpperCase();
        // Filter history for this day
        const dayWorkouts = history.filter(h => new Date(h.startTime).toDateString() === d.toDateString());
        const count = dayWorkouts.length;
        data.push({ day: dayStr, entrenamientos: count });
    }
    return data;
  }, [history]);

  return (
    <div className="p-5 space-y-6 animate-fade-in pb-20">
      {/* Header Branding */}
      <header className="mb-4 pt-2">
        <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white">
            IRONTRACK <span className="text-primary">PRO</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tu progreso, tu ritmo.</p>
      </header>

      {/* Hero / Motivation */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 shadow-lg text-white relative overflow-hidden group">
          <div className="relative z-10 pr-6">
              <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium">
                  <Zap size={16} fill="currentColor" />
                  <span>Frase del día</span>
              </div>
              <p className="font-bold text-lg leading-tight italic min-h-[3.5rem] flex items-center">"{quote}"</p>
          </div>
          
          <button 
            onClick={changeQuote} 
            className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-indigo-100 transition-colors z-20"
            title="Cambiar frase"
          >
            <RefreshCw size={14} />
          </button>

          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
              <Trophy size={100} />
          </div>
      </div>

      {/* Start Workout Action */}
      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => {
            startWorkout();
            setView('active_workout');
          }}
          className="bg-surface border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-transform"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <Play size={24} fill="currentColor" />
                </div>
                <div className="text-left">
                    <h2 className="font-bold text-gray-900 dark:text-white">Iniciar Entrenamiento</h2>
                    <p className="text-xs text-gray-500">Sesión libre vacía</p>
                </div>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-4 gap-2">
          <button onClick={() => setView('history')} className="bg-white dark:bg-surface p-3 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col items-center justify-center gap-2 active:bg-gray-50 dark:active:bg-white/5">
              <Calendar size={20} className="text-indigo-500" />
              <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200">Historial</span>
          </button>
          <button onClick={() => setView('stats')} className="bg-white dark:bg-surface p-3 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col items-center justify-center gap-2 active:bg-gray-50 dark:active:bg-white/5">
              <BarChart2 size={20} className="text-emerald-500" />
              <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200">Stats</span>
          </button>
          <button onClick={() => setView('measurements')} className="bg-white dark:bg-surface p-3 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col items-center justify-center gap-2 active:bg-gray-50 dark:active:bg-white/5">
              <Ruler size={20} className="text-pink-500" />
              <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200">Medidas</span>
          </button>
          <button onClick={() => setView('tools')} className="bg-white dark:bg-surface p-3 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col items-center justify-center gap-2 active:bg-gray-50 dark:active:bg-white/5">
              <Calculator size={20} className="text-orange-500" />
              <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200">Útiles</span>
          </button>
      </div>

      {/* Recent Activity Chart */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Activity size={16} className="text-primary" />
                Esta semana
            </h3>
        </div>
        <div className="h-40 w-full bg-white dark:bg-surface rounded-xl p-4 border border-gray-200 dark:border-white/5 shadow-sm">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                    <XAxis dataKey="day" tick={{fontSize: 10, fill: '#71717a'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{fill: 'rgba(99, 102, 241, 0.1)'}}
                    />
                    <Bar dataKey="entrenamientos" fill="#6366f1" radius={[4, 4, 4, 4]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Last Workout */}
      {lastWorkout && (
        <div className="space-y-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 px-1">Última sesión</h3>
            <div className="bg-white dark:bg-surface rounded-xl p-4 border border-gray-200 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{lastWorkout.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar size={14} />
                            {new Date(lastWorkout.startTime).toLocaleDateString()}
                            {lastWorkout.endTime && ` • ${Math.round((lastWorkout.endTime - lastWorkout.startTime) / 60000)} min`}
                        </div>
                    </div>
                    <button 
                        onClick={() => setView('history')}
                        className="p-2 bg-gray-100 dark:bg-background rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Routines Teaser */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Mis Rutinas</h3>
            <button onClick={() => setView('routines')} className="text-primary text-sm font-medium">Ver Todas</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {routines.slice(0, 3).map(routine => (
                <button 
                    key={routine.id}
                    onClick={() => {
                        startWorkout(routine);
                        setView('active_workout');
                    }}
                    className="min-w-[140px] bg-white dark:bg-surface p-4 rounded-xl border border-gray-200 dark:border-white/5 text-left hover:border-primary/50 transition-colors shadow-sm flex flex-col justify-between h-32"
                >
                    <div className={`w-8 h-8 rounded-lg mb-2 ${routine.color} opacity-90`} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{routine.name}</div>
                        <div className="text-xs text-gray-500">{routine.exercises.length} Ejercicios</div>
                    </div>
                </button>
            ))}
             <button 
                onClick={() => setView('routines')}
                className="min-w-[100px] bg-gray-50 dark:bg-surface p-4 rounded-xl border border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center text-gray-400 gap-2"
            >
                <Plus size={24} />
                <span className="text-xs font-medium">Crear</span>
            </button>
        </div>
      </div>
    </div>
  );
};
