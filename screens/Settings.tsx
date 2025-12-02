
import React from 'react';
import { Trash2, Download, Upload, Moon, Sun, Volume2, VolumeX, Smartphone, Timer, Minus, Plus } from 'lucide-react';

interface SettingsProps {
  clearData: () => void;
  exportData: () => string;
  importData: (json: string) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
  defaultRestTimer?: number;
  onUpdateSetting?: (key: any, val: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
    clearData, exportData, importData, toggleTheme, isDarkMode, 
    soundEnabled = true, hapticsEnabled = true, defaultRestTimer = 90, onUpdateSetting 
}) => {
  
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irontrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if(event.target?.result) {
                importData(event.target.result as string);
            }
        };
        reader.readAsText(file);
    };
    input.click();
  };

  const updateTimer = (delta: number) => {
      if (!onUpdateSetting) return;
      const newValue = Math.max(0, defaultRestTimer + delta);
      onUpdateSetting('defaultRestTimer', newValue);
  };

  return (
    <div className="p-5 space-y-6 animate-fade-in pb-24">
       <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ajustes</h1>
        <p className="text-sm text-gray-500">Personaliza tu experiencia</p>
      </header>

      <div className="space-y-6">
        {/* Appearance & Feedback */}
        <section>
            <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">General</h2>
            <div className="bg-white dark:bg-surface rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 shadow-sm">
                
                {/* Dark Mode */}
                <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        {isDarkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-orange-400" />}
                        <div className="text-left">
                            <div className="font-medium text-gray-900 dark:text-white">Modo Oscuro</div>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </button>

                {/* Sound */}
                {onUpdateSetting && (
                    <button onClick={() => onUpdateSetting('soundEnabled', !soundEnabled)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            {soundEnabled ? <Volume2 size={20} className="text-green-500" /> : <VolumeX size={20} className="text-gray-400" />}
                            <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white">Efectos de Sonido</div>
                                <div className="text-xs text-gray-500">Temporizador y alertas</div>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${soundEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </button>
                )}

                {/* Haptics */}
                {onUpdateSetting && (
                    <button onClick={() => onUpdateSetting('hapticsEnabled', !hapticsEnabled)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <Smartphone size={20} className={hapticsEnabled ? "text-blue-500" : "text-gray-400"} />
                            <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white">Vibración</div>
                                <div className="text-xs text-gray-500">Respuesta háptica</div>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${hapticsEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${hapticsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </button>
                )}

                {/* Default Rest Timer */}
                {onUpdateSetting && (
                    <div className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                         <div className="flex items-center gap-3">
                            <Timer size={20} className="text-pink-500" />
                            <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white">Descanso por defecto</div>
                                <div className="text-xs text-gray-500">Tiempo inicial del timer</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => updateTimer(-10)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 active:bg-gray-200 dark:active:bg-white/20">
                                <Minus size={16} />
                            </button>
                            <span className="font-mono font-bold w-12 text-center text-gray-900 dark:text-white">{defaultRestTimer}s</span>
                            <button onClick={() => updateTimer(10)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 active:bg-gray-200 dark:active:bg-white/20">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>

        {/* Data */}
        <section>
            <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Datos</h2>
            <div className="bg-white dark:bg-surface rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 shadow-sm">
                <button onClick={handleExport} className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left border-b border-gray-100 dark:border-white/5">
                    <Download className="text-indigo-500 mr-4" size={20} />
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">Exportar Copia</div>
                        <div className="text-xs text-gray-500">Guardar backup JSON</div>
                    </div>
                </button>
                 <button onClick={handleImport} className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left">
                    <Upload className="text-emerald-500 mr-4" size={20} />
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">Importar Copia</div>
                        <div className="text-xs text-gray-500">Restaurar backup JSON</div>
                    </div>
                </button>
            </div>
        </section>

        <section>
            <h2 className="text-xs font-bold text-red-500 mb-3 uppercase tracking-wider">Zona de Peligro</h2>
             <div className="bg-red-50 dark:bg-red-900/10 rounded-xl overflow-hidden border border-red-100 dark:border-red-900/20">
                <button onClick={clearData} className="w-full flex items-center p-4 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400">
                    <Trash2 className="mr-4" size={20} />
                    <div>
                        <div className="font-bold">Reiniciar Fábrica</div>
                        <div className="text-xs opacity-80">Borra todo el historial y rutinas</div>
                    </div>
                </button>
            </div>
        </section>

        <div className="text-center text-xs text-gray-400 mt-10">
            IronTrack Pro v2.6 Elite<br/>
            Optimizado para Android WebView<br/>
            <span className="opacity-50">Sin conexión requerida</span>
        </div>
      </div>
    </div>
  );
};
