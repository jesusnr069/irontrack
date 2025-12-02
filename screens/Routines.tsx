
import React, { useState } from 'react';
import { Routine, Exercise } from '../types';
import { Plus, Trash2, Play, Dumbbell, Home, LayoutGrid } from 'lucide-react';

interface RoutinesProps {
  routines: Routine[];
  startWorkout: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  createRoutine: (r: Routine) => void;
  exercises: Exercise[];
}

export const Routines: React.FC<RoutinesProps> = ({ routines, startWorkout, deleteRoutine, createRoutine, exercises }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [filter, setFilter] = useState<'all' | 'gym' | 'home'>('all');

  const filteredRoutines = routines.filter(r => {
      if (filter === 'gym') return r.isHome === false || r.isHome === undefined;
      if (filter === 'home') return r.isHome === true;
      return true;
  });

  const handleCreate = () => {
    if(!newRoutineName.trim()) return;
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-rose-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newRoutine: Routine = {
        id: Date.now().toString(),
        name: newRoutineName,
        exercises: [], 
        color: randomColor,
        description: filter === 'home' ? 'Rutina en casa' : 'Rutina de gimnasio',
        isHome: filter === 'home'
    };
    createRoutine(newRoutine);
    setNewRoutineName('');
    setIsCreating(false);
  };

  return (
    <div className="p-5 space-y-6 min-h-screen pb-24">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rutinas</h1>
            <p className="text-sm text-gray-500">Tus planes de entrenamiento</p>
        </div>
        <button 
            onClick={() => setIsCreating(true)}
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
            <Plus size={24} />
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 dark:bg-surface rounded-xl p-1">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500'}`}
          >
              <LayoutGrid size={14} /> Todos
          </button>
          <button 
            onClick={() => setFilter('gym')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'gym' ? 'bg-white dark:bg-white/10 text-blue-500 shadow-sm' : 'text-gray-500'}`}
          >
              <Dumbbell size={14} /> Gimnasio
          </button>
          <button 
            onClick={() => setFilter('home')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'home' ? 'bg-white dark:bg-white/10 text-orange-500 shadow-sm' : 'text-gray-500'}`}
          >
              <Home size={14} /> En Casa
          </button>
      </div>

      {isCreating && (
          <div className="bg-white dark:bg-surface p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-lg animate-in fade-in slide-in-from-top-2">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Nueva rutina ({filter === 'home' ? 'Casa' : 'Gym'})</h3>
              <div className="flex gap-2">
                  <input 
                    value={newRoutineName}
                    onChange={e => setNewRoutineName(e.target.value)}
                    className="flex-1 bg-gray-100 dark:bg-background border border-transparent focus:border-primary rounded-lg px-3 py-2 outline-none text-gray-900 dark:text-white"
                    placeholder="Ej. Glúteos y Pierna"
                    autoFocus
                  />
                  <button onClick={handleCreate} className="bg-primary text-white font-bold px-4 rounded-lg text-sm">Crear</button>
                  <button onClick={() => setIsCreating(false)} className="text-gray-500 px-2">Cancelar</button>
              </div>
          </div>
      )}

      <div className="space-y-4">
        {filteredRoutines.map(routine => (
            <div key={routine.id} className="bg-white dark:bg-surface rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 shadow-sm group">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${routine.color} flex items-center justify-center text-white shadow-md relative`}>
                                {routine.isHome ? <Home size={22} /> : <Dumbbell size={22} />}
                                {routine.isHome && <div className="absolute -bottom-1 -right-1 bg-white dark:bg-background rounded-full p-0.5"><div className="w-2 h-2 bg-orange-500 rounded-full"></div></div>}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white">{routine.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{routine.description || `${routine.exercises.length} Ejercicios`}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                if (window.confirm("¿Estás seguro de que quieres eliminar esta rutina? Esta acción no se puede deshacer.")) {
                                    deleteRoutine(routine.id);
                                }
                            }}
                            className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    <div className="space-y-2 mb-5">
                        {routine.exercises.length > 0 ? (
                            routine.exercises.slice(0, 3).map((re, idx) => {
                                const exName = exercises.find(e => e.id === re.exerciseId)?.name || 'Desconocido';
                                return (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                        <span className="flex-1 truncate">{exName}</span>
                                        <span className="text-xs font-mono text-gray-400">{re.targetSets} x {re.targetReps}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-sm text-gray-400 italic">Sin ejercicios.</div>
                        )}
                        {routine.exercises.length > 3 && <div className="text-xs text-gray-400 pl-4 italic">...y {routine.exercises.length - 3} más</div>}
                    </div>

                    <button 
                        onClick={() => startWorkout(routine)}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-primary hover:border-primary hover:text-white text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <Play size={18} fill="currentColor" />
                        Iniciar Rutina
                    </button>
                </div>
            </div>
        ))}

        {filteredRoutines.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                <p>No hay rutinas en esta categoría.</p>
                <p className="text-sm mt-2">Crea una nueva para empezar.</p>
            </div>
        )}
      </div>
    </div>
  );
};
