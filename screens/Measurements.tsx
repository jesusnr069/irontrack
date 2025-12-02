
import React, { useState } from 'react';
import { BodyMeasurement } from '../types';
import { Ruler, Plus, Trash2, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MeasurementsProps {
  measurements: BodyMeasurement[];
  onAdd: (weight: number, bodyFat?: number) => void;
  onDelete: (id: string) => void;
}

export const Measurements: React.FC<MeasurementsProps> = ({ measurements, onAdd, onDelete }) => {
  const [newWeight, setNewWeight] = useState('');
  const [newFat, setNewFat] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = () => {
    if(!newWeight) return;
    onAdd(parseFloat(newWeight), newFat ? parseFloat(newFat) : undefined);
    setNewWeight('');
    setNewFat('');
    setIsAdding(false);
  };

  // Prepare chart data (reverse to show chronological order)
  const chartData = [...measurements].reverse().map(m => ({
      date: new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      weight: m.weight
  }));

  const currentWeight = measurements.length > 0 ? measurements[0].weight : 0;
  const startWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight : 0;
  const diff = currentWeight - startWeight;

  return (
    <div className="p-5 space-y-6 pb-24 animate-fade-in">
        <header className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medidas</h1>
                <p className="text-sm text-gray-500">Seguimiento corporal</p>
            </div>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
                <Plus size={20} />
            </button>
        </header>

        {isAdding && (
            <div className="bg-white dark:bg-surface p-4 rounded-xl shadow-lg border border-gray-200 dark:border-white/10 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Peso (kg)</label>
                        <input 
                            type="number" 
                            value={newWeight} 
                            onChange={e => setNewWeight(e.target.value)}
                            className="w-full mt-1 p-2 bg-gray-100 dark:bg-background rounded-lg outline-none focus:ring-2 ring-primary text-gray-900 dark:text-white font-mono"
                            placeholder="0.0"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Grasa (%)</label>
                        <input 
                            type="number" 
                            value={newFat} 
                            onChange={e => setNewFat(e.target.value)}
                            className="w-full mt-1 p-2 bg-gray-100 dark:bg-background rounded-lg outline-none focus:ring-2 ring-primary text-gray-900 dark:text-white font-mono"
                            placeholder="Opcional"
                        />
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={!newWeight}
                    className="w-full py-2 bg-primary text-white rounded-lg font-bold disabled:opacity-50"
                >
                    Guardar Registro
                </button>
            </div>
        )}

        {/* Chart */}
        {measurements.length > 1 && (
            <div className="bg-white dark:bg-surface p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#6b7280" />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{fontSize: 10}} stroke="#6b7280" width={30} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
             <div className="bg-white dark:bg-surface p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                 <div className="text-xs text-gray-500 uppercase font-bold">Peso Actual</div>
                 <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                     {currentWeight > 0 ? `${currentWeight} kg` : '--'}
                 </div>
             </div>
             <div className="bg-white dark:bg-surface p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                 <div className="text-xs text-gray-500 uppercase font-bold">Progreso Total</div>
                 <div className={`text-2xl font-bold mt-1 flex items-center gap-1 ${diff < 0 ? 'text-green-500' : (diff > 0 ? 'text-red-500' : 'text-gray-500')}`}>
                     {diff !== 0 && <TrendingDown size={20} className={diff > 0 ? 'rotate-180' : ''} />}
                     {Math.abs(diff).toFixed(1)} kg
                 </div>
             </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Historial</h3>
            {measurements.map(m => (
                <div key={m.id} className="bg-white dark:bg-surface p-4 rounded-xl border border-gray-200 dark:border-white/5 flex justify-between items-center">
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white text-lg">{m.weight} kg</div>
                        <div className="text-xs text-gray-500">
                            {new Date(m.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {m.bodyFat && (
                            <div className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                                {m.bodyFat}% BF
                            </div>
                        )}
                        <button onClick={() => onDelete(m.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
            {measurements.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">
                    No hay registros. Añade tu peso actual.
                </div>
            )}
        </div>
    </div>
  );
};
