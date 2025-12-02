
import React, { useState } from 'react';
import { Exercise, MuscleGroup, WorkoutLog } from '../types';
import { Search, Plus, Info, X, Dumbbell, Home, Activity, Save, History as HistoryIcon, FileText, Check } from 'lucide-react';

interface ExercisesProps {
  exercises: Exercise[];
  history?: WorkoutLog[]; // Now optional but expected for history features
  onSelect?: (exercise: Exercise) => void;
  onCreateExercise?: (name: string, muscle: MuscleGroup, description: string) => void;
}

export const Exercises: React.FC<ExercisesProps> = ({ exercises, history = [], onSelect, onCreateExercise }) => {
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedDetail, setSelectedDetail] = useState<Exercise | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'history'>('info');
  
  // Feedback state for added items
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Creation Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>(MuscleGroup.Chest);
  const [newDesc, setNewDesc] = useState('');

  const filtered = exercises.filter(e => {
      const matchesTerm = e.name.toLowerCase().includes(term.toLowerCase());
      const matchesFilter = filter === 'Todos' || e.muscle === filter;
      return matchesTerm && matchesFilter;
  });

  const handleCreate = () => {
    if (!newName.trim() || !onCreateExercise) return;
    onCreateExercise(newName, newMuscle, newDesc);
    setIsCreating(false);
    setNewName('');
    setNewDesc('');
    setFilter(newMuscle);
  };

  const handleSelect = (ex: Exercise) => {
      if (onSelect) {
          onSelect(ex);
          // Visual feedback
          setAddedItems(prev => ({ ...prev, [ex.id]: true }));
          setTimeout(() => {
              setAddedItems(prev => ({ ...prev, [ex.id]: false }));
          }, 1500);
      }
  };

  // Logic to extract specific exercise history
  const getExerciseHistory = (exerciseId: string) => {
      const logs = [];
      // Traverse history backwards (newest first)
      for (const workout of history) {
          const exerciseLog = workout.exercises.find(e => e.exerciseId === exerciseId);
          if (exerciseLog) {
              const completedSets = exerciseLog.sets.filter(s => s.completed);
              if (completedSets.length > 0) {
                  logs.push({
                      date: workout.startTime,
                      workoutName: workout.name,
                      sets: completedSets
                  });
              }
          }
      }
      return logs;
  };

  return (
    <div className="p-5 h-full flex flex-col relative">
      <header className="mb-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{onSelect ? 'Seleccionar Ejercicio' : 'Biblioteca'}</h1>
            {onCreateExercise && (
                <button 
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                    <Plus size={14} /> Crear
                </button>
            )}
        </div>
        
        <div className="relative mb-3">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
                value={term}
                onChange={e => setTerm(e.target.value)}
                placeholder="Buscar ejercicio..."
                className="w-full bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-primary text-sm text-gray-900 dark:text-white shadow-sm"
            />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['Todos', ...Object.values(MuscleGroup)].map(m => (
                <button
                    key={m}
                    onClick={() => setFilter(m as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                        filter === m 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white dark:bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                >
                    {m}
                </button>
            ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-2 pb-24">
        {filtered.map(ex => {
            const isAdded = addedItems[ex.id];
            return (
                <div 
                    key={ex.id}
                    onClick={() => {
                        setSelectedDetail(ex);
                        setDetailTab('info');
                    }}
                    className={`bg-white dark:bg-surface p-4 rounded-xl border ${isAdded ? 'border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-white/5'} flex justify-between items-center shadow-sm active:scale-[0.99] transition-all cursor-pointer`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAdded ? 'bg-green-100 text-green-600' : (ex.muscle === MuscleGroup.Home ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' : 'bg-gray-100 dark:bg-white/5 text-gray-500')}`}>
                            {isAdded ? <Check size={20} /> : (ex.muscle === MuscleGroup.Home ? <Home size={18} /> : (ex.muscle === MuscleGroup.Glutes ? <Activity size={18} /> : <Dumbbell size={18} />))}
                        </div>
                        <div>
                            <h3 className={`font-bold text-sm line-clamp-1 ${isAdded ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>{ex.name}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${ex.muscle === MuscleGroup.Home ? 'text-orange-500' : (ex.muscle === MuscleGroup.Glutes ? 'text-pink-500' : 'text-primary')}`}>
                                {ex.muscle}
                            </span>
                        </div>
                    </div>
                    {onSelect ? (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(ex);
                            }}
                            className={`${isAdded ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary'} p-2 rounded-full shrink-0 z-10 transition-colors shadow-sm`}
                        >
                            {isAdded ? <Check size={18} /> : <Plus size={18} />}
                        </button>
                    ) : (
                        <Info size={18} className="text-gray-400 shrink-0" />
                    )}
                </div>
            );
        })}
        {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                <p>No se encontraron ejercicios.</p>
                {onCreateExercise && (
                    <button onClick={() => setIsCreating(true)} className="mt-2 text-primary text-sm font-bold">
                        ¿Crear nuevo ejercicio?
                    </button>
                )}
            </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in">
              <div className="bg-white dark:bg-surface w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 max-h-[85vh] overflow-y-auto flex flex-col">
                  <button onClick={() => setSelectedDetail(null)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-500 dark:text-white z-10">
                      <X size={20} />
                  </button>
                  
                  <div className="mb-4">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">{selectedDetail.muscle}</span>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 pr-8">{selectedDetail.name}</h2>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-white/10 mb-4">
                      <button 
                        onClick={() => setDetailTab('info')}
                        className={`flex-1 pb-2 text-sm font-bold flex items-center justify-center gap-2 ${detailTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                      >
                          <FileText size={16} /> Info
                      </button>
                      <button 
                        onClick={() => setDetailTab('history')}
                        className={`flex-1 pb-2 text-sm font-bold flex items-center justify-center gap-2 ${detailTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                      >
                          <HistoryIcon size={16} /> Historial
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                      {detailTab === 'info' ? (
                          <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Descripción</h3>
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">{selectedDetail.description || 'Sin descripción disponible.'}</p>
                            </div>

                            {selectedDetail.tips && selectedDetail.tips.length > 0 && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                                    <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-300 mb-2 flex items-center gap-2">
                                        <Info size={14} /> Tips Pro
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedDetail.tips.map((tip, i) => (
                                            <li key={i} className="text-sm text-indigo-800 dark:text-indigo-200">{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {getExerciseHistory(selectedDetail.id).length > 0 ? (
                                  getExerciseHistory(selectedDetail.id).map((h, i) => (
                                      <div key={i} className="border-l-2 border-gray-200 dark:border-white/10 pl-4 py-1">
                                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                              {new Date(h.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                              <span className="font-normal text-gray-400 mx-2">•</span> 
                                              <span className="text-primary">{h.workoutName}</span>
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                              {h.sets.map((s, idx) => (
                                                  <div key={idx} className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300">
                                                      <span className="font-bold">{s.weight}kg</span> x {s.reps}
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <div className="text-center py-8 text-gray-400 text-sm">
                                      No hay registros de este ejercicio aún.
                                  </div>
                              )}
                          </div>
                      )}
                  </div>

                  {onSelect && (
                      <button 
                        onClick={() => {
                            handleSelect(selectedDetail);
                            // Optional: Close modal if selecting from detail view? 
                            // Or keep open? Let's close the detail modal but keep the main selector open.
                            setSelectedDetail(null);
                        }}
                        className="w-full mt-6 bg-primary hover:bg-indigo-600 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                          {addedItems[selectedDetail.id] ? <Check size={20} /> : <Plus size={20} />}
                          {addedItems[selectedDetail.id] ? 'Añadido' : 'Añadir a Rutina'}
                      </button>
                  )}
              </div>
          </div>
      )}

      {/* Create Exercise Modal */}
      {isCreating && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white dark:bg-surface w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Crear Ejercicio</h2>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                          <input 
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                              placeholder="Ej. Curl Zottman"
                              className="w-full bg-gray-100 dark:bg-background border border-transparent focus:border-primary rounded-lg p-3 outline-none text-gray-900 dark:text-white"
                              autoFocus
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                          <select 
                            value={newMuscle}
                            onChange={e => setNewMuscle(e.target.value as MuscleGroup)}
                            className="w-full bg-gray-100 dark:bg-background border border-transparent focus:border-primary rounded-lg p-3 outline-none text-gray-900 dark:text-white appearance-none"
                          >
                            {Object.values(MuscleGroup).map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción (Opcional)</label>
                          <textarea 
                              value={newDesc}
                              onChange={e => setNewDesc(e.target.value)}
                              placeholder="Describe cómo realizarlo..."
                              className="w-full bg-gray-100 dark:bg-background border border-transparent focus:border-primary rounded-lg p-3 outline-none text-gray-900 dark:text-white h-24 resize-none"
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => setIsCreating(false)} 
                        className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl font-medium"
                      >
                          Cancelar
                      </button>
                      <button 
                        onClick={handleCreate}
                        disabled={!newName.trim()}
                        className={`flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${newName.trim() ? 'bg-primary hover:bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'}`}
                      >
                          <Save size={18} /> Guardar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
