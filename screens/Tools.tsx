
import React, { useState } from 'react';
import { Calculator, Disc } from 'lucide-react';

export const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'1rm' | 'plates'>('1rm');

  return (
    <div className="p-5 space-y-6 pb-24 animate-fade-in">
       <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Herramientas</h1>
        <p className="text-sm text-gray-500">Calculadoras de Gimnasio</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-surface rounded-xl p-1">
          <button 
            onClick={() => setActiveTab('1rm')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === '1rm' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500'}`}
          >
              <Calculator size={14} /> 1RM Est.
          </button>
          <button 
            onClick={() => setActiveTab('plates')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'plates' ? 'bg-white dark:bg-white/10 text-orange-500 shadow-sm' : 'text-gray-500'}`}
          >
              <Disc size={14} /> Discos
          </button>
      </div>

      <div className="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm min-h-[300px]">
          {activeTab === '1rm' ? <OneRMCalculator /> : <PlateCalculator />}
      </div>
    </div>
  );
};

const OneRMCalculator: React.FC = () => {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');

    const w = parseFloat(weight) || 0;
    const r = parseFloat(reps) || 0;
    
    // Epley Formula: 1RM = w * (1 + r/30)
    const oneRM = w > 0 && r > 0 ? Math.round(w * (1 + r / 30)) : 0;

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg border-b border-gray-100 dark:border-white/5 pb-2">Calculadora 1RM</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Peso (kg)</label>
                    <input 
                        type="number" 
                        value={weight} 
                        onChange={e => setWeight(e.target.value)}
                        className="w-full mt-1 p-3 bg-gray-50 dark:bg-background rounded-xl outline-none focus:ring-2 ring-primary text-gray-900 dark:text-white font-bold text-center"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Repeticiones</label>
                    <input 
                        type="number" 
                        value={reps} 
                        onChange={e => setReps(e.target.value)}
                        className="w-full mt-1 p-3 bg-gray-50 dark:bg-background rounded-xl outline-none focus:ring-2 ring-primary text-gray-900 dark:text-white font-bold text-center"
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 text-center">
                <div className="text-sm text-indigo-600 dark:text-indigo-300 font-medium mb-1">Tu 1RM Estimado</div>
                <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{oneRM} <span className="text-lg">kg</span></div>
                <div className="text-xs text-indigo-400 mt-2 opacity-80">Fórmula Epley</div>
            </div>

            {oneRM > 0 && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                        <div className="text-gray-500">90%</div>
                        <div className="font-bold text-gray-900 dark:text-white">{Math.round(oneRM * 0.9)} kg</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                        <div className="text-gray-500">80%</div>
                        <div className="font-bold text-gray-900 dark:text-white">{Math.round(oneRM * 0.8)} kg</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                        <div className="text-gray-500">70%</div>
                        <div className="font-bold text-gray-900 dark:text-white">{Math.round(oneRM * 0.7)} kg</div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlateCalculator: React.FC = () => {
    const [targetWeight, setTargetWeight] = useState('');
    const barWeight = 20;
    
    const calculatePlates = (total: number) => {
        let weight = (total - barWeight) / 2;
        if (weight <= 0) return [];
        
        const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
        const result: number[] = [];
        
        for (const plate of plates) {
            while (weight >= plate) {
                result.push(plate);
                weight -= plate;
            }
        }
        return result;
    };

    const w = parseFloat(targetWeight) || 0;
    const platesNeeded = calculatePlates(w);

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg border-b border-gray-100 dark:border-white/5 pb-2">Calculadora de Discos</h3>
            
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Peso Total Objetivo (kg)</label>
                <div className="flex items-center gap-2 mt-1">
                    <input 
                        type="number" 
                        value={targetWeight} 
                        onChange={e => setTargetWeight(e.target.value)}
                        className="flex-1 p-3 bg-gray-50 dark:bg-background rounded-xl outline-none focus:ring-2 ring-orange-500 text-gray-900 dark:text-white font-bold text-center"
                        placeholder="Ej. 100"
                    />
                    <div className="bg-gray-200 dark:bg-white/10 px-3 py-3 rounded-xl text-xs font-bold text-gray-500">Barra 20kg</div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Por cada lado</div>
                
                <div className="flex flex-col-reverse items-center justify-center gap-1 min-h-[150px] relative">
                    <div className="w-1 h-40 bg-gray-400 absolute left-1/2 transform -translate-x-1/2 z-0"></div>
                    
                    {platesNeeded.length > 0 ? (
                         platesNeeded.map((plate, i) => {
                             // Visualization sizing
                             const width = Math.max(60, plate * 4 + 40); 
                             const colorClass = plate >= 20 ? 'bg-red-500' : (plate >= 10 ? 'bg-blue-500' : 'bg-green-500');
                             
                             return (
                                 <div key={i} className={`relative z-10 h-8 rounded-sm ${colorClass} text-white flex items-center justify-center text-xs font-bold shadow-md border border-black/10`} style={{ width: `${width}px`}}>
                                     {plate}
                                 </div>
                             );
                         })
                    ) : (
                         <div className="text-gray-400 text-xs italic z-10 bg-white dark:bg-surface px-2">Introduce un peso mayor a 20kg</div>
                    )}
                </div>
                
                {platesNeeded.length > 0 && (
                     <div className="flex justify-center gap-2 flex-wrap">
                         {platesNeeded.map((p, i) => (
                             <span key={i} className="text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{p}kg</span>
                         ))}
                     </div>
                )}
            </div>
        </div>
    );
};
