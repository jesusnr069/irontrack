import React from 'react';
import { LayoutDashboard, List, Dumbbell, History, Settings, Play } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  hasActiveWorkout: boolean;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, hasActiveWorkout, children }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'routines', icon: List, label: 'Rutinas' },
    { id: 'active_workout', icon: Play, label: 'Entrenar', special: true },
    { id: 'exercises', icon: Dumbbell, label: 'Biblio' },
    { id: 'history', icon: History, label: 'Historial' },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-background text-gray-900 dark:text-gray-100 overflow-hidden select-none">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth w-full">
        <div className="max-w-md mx-auto min-h-full relative">
           {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-surface/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe z-50 transition-all duration-300">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            
            if (item.special) {
               if (!hasActiveWorkout && item.id === 'active_workout') return null;
               
               return (
                <button
                  key={item.id}
                  onClick={() => setView('active_workout' as ViewState)}
                  className={`flex flex-col items-center justify-center -mt-8 p-3 rounded-full shadow-lg border-4 border-gray-50 dark:border-background ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'} transition-all active:scale-95 animate-fade-in`}
                >
                  <item.icon size={28} fill="currentColor" />
                </button>
               );
            }

            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform ${
                  isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
              </button>
            );
          })}
          
          <button
              onClick={() => setView('settings')}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform ${
                currentView === 'settings' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Settings size={22} strokeWidth={currentView === 'settings' ? 2.5 : 2} />
              <span className="text-[9px] font-medium tracking-wide">Ajustes</span>
            </button>
        </div>
      </nav>
    </div>
  );
};